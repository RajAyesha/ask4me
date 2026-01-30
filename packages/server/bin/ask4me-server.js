#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

import { ensureBinary, getBinaryPath } from "../src/binary.js";
import { generateApiKey, promptConfig, writeDotenvFile } from "../src/setup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");

function printHelp() {
  process.stdout.write(
    [
      "ask4me-server",
      "",
      "Usage:",
      "  ask4me-server [--config <path>] [-d] [--no-prompt]",
      "",
      "Options:",
      "  --config <path>   Config file path (.env). Default: ~/.ask4me/.env",
      "  -d                Run in background (detached), write pid/log under config dir",
      "  --no-prompt        Do not prompt; require config file to exist",
      "  -h, --help         Show help",
      "",
      "Environment:",
      "  ASK4ME_SERVER_BINARY_PATH       Use an existing server binary",
      "  ASK4ME_SERVER_BINARY_URL        Download server binary from this URL",
      "  ASK4ME_SERVER_BINARY_BASEURL    Download base URL (default uses this + v<version>/ask4me-<os>-<arch>)",
      "  ASK4ME_SERVER_BINARY_SHA256     Optional sha256 for downloaded binary",
      ""
    ].join("\n")
  );
}

function defaultConfigPath() {
  return path.join(os.homedir(), ".ask4me", ".env");
}

function resolveConfigPath(p) {
  if (!p) return defaultConfigPath();
  if (p.startsWith("~" + path.sep) || p === "~") {
    return path.join(os.homedir(), p.slice(1));
  }
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function startServerForeground({ binaryPath, configPath, cwd }) {
  const child = spawn(binaryPath, ["-config", configPath], {
    cwd,
    stdio: "inherit"
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}

function startServerDaemon({ binaryPath, configPath, cwd }) {
  ensureDir(cwd);

  const logPath = path.join(cwd, "server.log");
  const outFd = fs.openSync(logPath, "a");
  const errFd = fs.openSync(logPath, "a");
  const child = spawn(binaryPath, ["-config", configPath], {
    cwd,
    detached: true,
    stdio: ["ignore", outFd, errFd]
  });
  child.unref();

  const pidPath = path.join(cwd, "ask4me.pid");
  fs.writeFileSync(pidPath, String(child.pid), { encoding: "utf-8", mode: 0o644 });

  process.stdout.write(
    `started in background\npid: ${child.pid}\nlog: ${logPath}\nconfig: ${configPath}\n`
  );
}

async function main() {
  const { values } = parseArgs({
    options: {
      config: { type: "string" },
      d: { type: "boolean", short: "d" },
      "no-prompt": { type: "boolean" },
      help: { type: "boolean", short: "h" }
    },
    allowPositionals: true
  });

  if (values.help) {
    printHelp();
    return;
  }

  const configPath = resolveConfigPath(values.config);
  const configDir = path.dirname(configPath);

  ensureDir(configDir);

  const noPrompt = Boolean(values["no-prompt"]);
  const configExists = fs.existsSync(configPath);

  if (!configExists && noPrompt) {
    process.stderr.write(`config file not found: ${configPath}\n`);
    process.exit(1);
  }

  if (!configExists && !noPrompt) {
    const cfg = await promptConfig({
      defaults: {
        baseUrl: "",
        apiKey: generateApiKey(),
        listenAddr: ":8080",
        sqlitePath: path.join(configDir, "ask4me.db"),
        terminalCacheSeconds: 60,
        defaultExpiresInSeconds: 3600,
        sseHeartbeatIntervalSeconds: 15
      }
    });
    writeDotenvFile({
      filePath: configPath,
      values: cfg,
      overwrite: true
    });
    process.stdout.write(`wrote config: ${configPath}\n`);
  }

  if (!process.env.ASK4ME_SERVER_BINARY_PATH) {
    await ensureBinary({ packageRoot });
  }

  const binaryPath = process.env.ASK4ME_SERVER_BINARY_PATH || getBinaryPath({ packageRoot });
  const daemon = Boolean(values.d);

  if (daemon) {
    startServerDaemon({ binaryPath, configPath, cwd: configDir });
  } else {
    startServerForeground({ binaryPath, configPath, cwd: configDir });
  }
}

await main();

