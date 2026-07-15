import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENV_PATH = join(process.cwd(), ".env.local");

export function readEnvLocal() {
  if (!existsSync(ENV_PATH)) return {};
  const lines = readFileSync(ENV_PATH, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

export function upsertEnvLocal(entries) {
  const current = readEnvLocal();
  const merged = { ...current, ...entries };
  const lines = Object.entries(merged).map(([key, value]) => `${key}=${value}`);
  writeFileSync(ENV_PATH, `${lines.join("\n")}\n`, "utf8");
}
