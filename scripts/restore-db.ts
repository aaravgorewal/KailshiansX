// scripts/restore-db.ts — Automated PostgreSQL Database Restore
// Usage: tsx scripts/restore-db.ts <path-to-sql-or-gz-backup>

import { execSync } from "child_process";
import fs from "fs";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in environment.");
  process.exit(1);
}

const backupPath = process.argv[2];
if (!backupPath || !fs.existsSync(backupPath)) {
  console.error("❌ Usage: tsx scripts/restore-db.ts <path-to-backup.sql.gz>");
  process.exit(1);
}

console.log(
  `⚠️  WARNING: Restoring database will overwrite data in: ${DATABASE_URL.replace(/:[^:@]*@/, ":***@")}`
);
console.log(`Restoring from: ${backupPath}...`);

try {
  let isHostPsql = true;
  try {
    execSync("which psql", { stdio: "ignore" });
  } catch {
    isHostPsql = false;
  }

  const psqlTarget = isHostPsql
    ? `psql "${DATABASE_URL}"`
    : `docker exec -i kailshiansx_db psql -U kailshiansx kailshiansx`;

  if (backupPath.endsWith(".gz")) {
    execSync(`gunzip -c "${backupPath}" | ${psqlTarget}`, {
      stdio: "inherit",
      shell: "/bin/bash",
    });
  } else {
    execSync(`${psqlTarget} < "${backupPath}"`, {
      stdio: "inherit",
      shell: "/bin/bash",
    });
  }
  console.log("✅ Database restoration completed successfully!");
} catch (error: unknown) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error("❌ Restoration failed:", errorMsg);
  process.exit(1);
}
