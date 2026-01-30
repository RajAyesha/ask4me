import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";

function isNonEmpty(s) {
  return typeof s === "string" && s.trim().length > 0;
}

function normalizeCSV(value) {
  if (!isNonEmpty(value)) return "";
  const parts = value
    .split(/[,\n]/g)
    .map((v) => v.trim())
    .filter(Boolean);
  return parts.join(",");
}

function ensureHttpURL(urlString) {
  const u = new URL(urlString);
  const p = u.protocol.toLowerCase();
  if (p !== "http:" && p !== "https:") {
    throw new Error("base_url must start with http:// or https://");
  }
  return u.toString().replace(/\/+$/, "");
}

function expandHome(p) {
  if (p === "~") return os.homedir();
  if (p.startsWith("~" + path.sep)) return path.join(os.homedir(), p.slice(2));
  return p;
}

export function generateApiKey() {
  return crypto.randomBytes(24).toString("base64url");
}

async function promptLine(rl, label, { defaultValue = "", required = false, secret = false } = {}) {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  const prompt = `${label}${suffix}: `;
  const v = secret ? await rl.question(prompt, { hideEchoBack: true }) : await rl.question(prompt);
  const out = isNonEmpty(v) ? v.trim() : defaultValue;
  if (required && !isNonEmpty(out)) {
    return promptLine(rl, label, { defaultValue, required, secret });
  }
  return out;
}

async function promptSelect(rl, label, options) {
  process.stdout.write(`${label}\n`);
  options.forEach((opt, idx) => {
    process.stdout.write(`  ${idx + 1}) ${opt}\n`);
  });
  while (true) {
    const ans = (await rl.question("> ")).trim();
    const n = Number(ans);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return n;
  }
}

async function promptAppriseURLs(rl) {
  process.stdout.write("Apprise URLs (one per line, empty line to finish):\n");
  const urls = [];
  while (true) {
    const line = (await rl.question("> ")).trim();
    if (!line) break;
    urls.push(line);
  }
  return normalizeCSV(urls.join(","));
}

export async function promptConfig({ defaults }) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    let baseUrl = "";
    while (true) {
      const raw = await promptLine(rl, "Base URL", { defaultValue: defaults.baseUrl, required: true });
      try {
        baseUrl = ensureHttpURL(raw);
        break;
      } catch (e) {
        process.stdout.write(`${e instanceof Error ? e.message : String(e)}\n`);
      }
    }

    const apiKey = await promptLine(rl, "API Key", { defaultValue: defaults.apiKey, required: true });
    const listenAddr = await promptLine(rl, "Listen Addr", { defaultValue: defaults.listenAddr });
    const sqlitePathRaw = await promptLine(rl, "SQLite Path", { defaultValue: defaults.sqlitePath });
    const sqlitePath = expandHome(sqlitePathRaw);

    const notifyChoice = await promptSelect(rl, "Notification channel:", [
      "ServerChan",
      "Apprise",
      "Both"
    ]);

    let serverchanSendkey = "";
    let appriseUrls = "";

    if (notifyChoice === 1 || notifyChoice === 3) {
      serverchanSendkey = await promptLine(rl, "ServerChan SendKey", { defaultValue: "", required: notifyChoice === 1 });
    }
    if (notifyChoice === 2 || notifyChoice === 3) {
      appriseUrls = await promptAppriseURLs(rl);
      if (!appriseUrls && notifyChoice === 2) {
        appriseUrls = await promptAppriseURLs(rl);
      }
    }

    if (!serverchanSendkey && !appriseUrls) {
      process.stdout.write("ServerChan SendKey or Apprise URLs is required.\n");
      return promptConfig({ defaults });
    }

    return {
      ASK4ME_BASE_URL: baseUrl,
      ASK4ME_API_KEY: apiKey,
      ...(serverchanSendkey ? { ASK4ME_SERVERCHAN_SENDKEY: serverchanSendkey } : {}),
      ...(appriseUrls ? { ASK4ME_APPRISE_URLS: appriseUrls } : {}),
      ASK4ME_APPRISE_BIN: "apprise",
      ASK4ME_SQLITE_PATH: path.resolve(sqlitePath),
      ASK4ME_DEFAULT_EXPIRES_IN_SECONDS: String(defaults.defaultExpiresInSeconds ?? 3600),
      ASK4ME_SSE_HEARTBEAT_INTERVAL_SECONDS: String(defaults.sseHeartbeatIntervalSeconds ?? 15),
      ASK4ME_LISTEN_ADDR: listenAddr,
      ASK4ME_TERMINAL_CACHE_SECONDS: String(defaults.terminalCacheSeconds ?? 60)
    };
  } finally {
    rl.close();
  }
}

function toDotenv(values) {
  const keys = Object.keys(values).sort();
  return keys.map((k) => `${k}=${String(values[k])}`).join("\n") + "\n";
}

export function writeDotenvFile({ filePath, values, overwrite }) {
  if (!overwrite && fs.existsSync(filePath)) {
    throw new Error(`config exists: ${filePath}`);
  }
  if (overwrite && fs.existsSync(filePath)) {
    const bak = `${filePath}.bak.${Date.now()}`;
    fs.copyFileSync(filePath, bak);
  }
  fs.writeFileSync(filePath, toDotenv(values), { encoding: "utf-8", mode: 0o600 });
}
