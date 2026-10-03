import "dotenv/config";
import { defineConfig } from "prisma/config";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Auto-load .env.local (Next.js convention) if DATABASE_URL not already set
function loadEnvLocal() {
  const envLocal = resolve(process.cwd(), ".env.local");
  if (!process.env.DATABASE_URL && existsSync(envLocal)) {
    const contents = readFileSync(envLocal, "utf-8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^"|"$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

loadEnvLocal();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
