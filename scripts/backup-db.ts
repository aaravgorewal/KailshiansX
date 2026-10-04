// scripts/backup-db.ts — Automated PostgreSQL Database Backup
// Usage: npm run db:backup
// Supports: Local compressed pg_dump, retention pruning, and optional AWS S3 sync

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in environment.");
  process.exit(1);
}

const BACKUP_DIR = path.resolve(process.cwd(), "backups");
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10);

async function main() {
  console.log("📦 Starting KailshiansX Database Backup...");

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  const filename = `kailshiansx_backup_${timestamp}.sql.gz`;
  const targetPath = path.join(BACKUP_DIR, filename);

  console.log(`[1/3] Generating compressed dump: ${filename}`);

  try {
    // Check if pg_dump is available on host, otherwise fallback to local Docker container
    let dumpCommand = `pg_dump "${DATABASE_URL}" | gzip -9 > "${targetPath}"`;
    try {
      execSync("which pg_dump", { stdio: "ignore" });
    } catch {
      // Check if kailshiansx_db docker container is running
      try {
        execSync("docker inspect -f '{{.State.Running}}' kailshiansx_db", { stdio: "ignore" });
        dumpCommand = `docker exec kailshiansx_db pg_dump -U kailshiansx kailshiansx | gzip -9 > "${targetPath}"`;
      } catch {
        console.warn("⚠️ Neither host pg_dump nor docker container kailshiansx_db was reachable.");
      }
    }

    execSync(dumpCommand, {
      stdio: "inherit",
      shell: "/bin/bash",
    });

    const stats = fs.statSync(targetPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Database dump created successfully (${sizeMb} MB) at ${targetPath}`);

    // Optional: Upload to AWS S3 / Cloudflare R2
    const hasS3Config =
      process.env.S3_BUCKET_NAME &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      !process.env.S3_ENDPOINT?.includes("your-") &&
      !process.env.S3_ACCESS_KEY_ID?.includes("your-");

    if (hasS3Config) {
      console.log(`[2/3] Uploading backup archive to S3 bucket: ${process.env.S3_BUCKET_NAME}...`);
      try {
        const s3 = new S3Client({
          region: process.env.S3_REGION || "ap-south-1",
          endpoint: process.env.S3_ENDPOINT,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
          },
        });

        const fileStream = fs.createReadStream(targetPath);
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `backups/${filename}`,
            Body: fileStream,
            ContentType: "application/gzip",
            Metadata: {
              created_at: new Date().toISOString(),
              app: "kailshiansx",
            },
          })
        );
        console.log(`✅ S3 upload completed: backups/${filename}`);
      } catch (s3Err: unknown) {
        const msg = s3Err instanceof Error ? s3Err.message : String(s3Err);
        console.warn(`⚠️ S3 upload failed (${msg}). Local backup is preserved at ${targetPath}`);
      }
    } else {
      console.log(
        "[2/3] Skipping remote S3 upload (credentials not configured or placeholder detected)"
      );
    }

    // Prune local backups older than RETENTION_DAYS
    console.log(`[3/3] Pruning backups older than ${RETENTION_DAYS} days...`);
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let prunedCount = 0;
    for (const file of files) {
      if (!file.startsWith("kailshiansx_backup_") || !file.endsWith(".sql.gz")) continue;
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        prunedCount++;
        console.log(`  - Deleted expired backup: ${file}`);
      }
    }
    console.log(`✅ Pruning completed (${prunedCount} files removed)`);

    console.log("\n🎉 Database backup finished cleanly!");
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Database backup failed:", errorMsg);
    process.exit(1);
  }
}

main();
