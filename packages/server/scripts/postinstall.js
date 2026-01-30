import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureBinary } from "../src/binary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");

const isCI = Boolean(process.env.CI);

try {
  await ensureBinary({ packageRoot });
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (process.env.ASK4ME_SERVER_SKIP_POSTINSTALL === "1") {
    process.stderr.write(`[ask4me-server] postinstall skipped: ${msg}\n`);
    process.exit(0);
  }

  if (isCI) {
    process.stderr.write(`[ask4me-server] postinstall failed in CI: ${msg}\n`);
  }

  const cacheDir = path.join(os.homedir(), ".ask4me");
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
  } catch {}
  process.stderr.write(
    `[ask4me-server] postinstall could not fetch server binary: ${msg}\n` +
      `[ask4me-server] You can set ASK4ME_SERVER_BINARY_URL or ASK4ME_SERVER_BINARY_PATH and retry.\n`
  );
  process.exit(0);
}
