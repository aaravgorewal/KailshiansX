#!/usr/bin/env tsx
// scripts/promote-user.ts
// CLI script to promote a user to any role (typically SUPER_ADMIN) by email.
//
// Usage:
//   npm run promote -- --email you@example.com --role SUPER_ADMIN
//
// Requires DATABASE_URL in .env.local (auto-loaded).

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Auto-load .env.local
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { UserRole } from "@prisma/client";

const VALID_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "EVENT_MANAGER",
  "CAMPUS_LEAD",
  "STATE_LEAD",
  "MEMBER",
  "VIEWER",
];

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      result[args[i].slice(2)] = args[i + 1] ?? "";
      i++;
    }
  }
  return result;
}

async function main() {
  const { email, role } = parseArgs();

  if (!email) {
    console.error("❌ --email is required");
    process.exit(1);
  }
  if (!role || !VALID_ROLES.includes(role as UserRole)) {
    console.error(`❌ --role must be one of: ${VALID_ROLES.join(", ")}`);
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    const previousRole = user.role;

    const updated = await db.user.update({
      where: { email },
      data: { role: role as UserRole },
      select: { id: true, name: true, email: true, role: true },
    });

    // Write audit log
    await db.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "User",
        entityId: updated.id,
        before: { role: previousRole },
        after: { role: updated.role },
        ipAddress: "CLI",
        userAgent: "promote-user script",
      },
    });

    console.log("\n✅ User promoted successfully:");
    console.log(`   Name:  ${updated.name ?? "(unnamed)"}`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Role:  ${previousRole} → ${updated.role}`);
    console.log(`   ID:    ${updated.id}\n`);
  } finally {
    await db.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
