import { execSync } from "child_process";
import * as dotenv from "dotenv";

export default async function globalSetup() {
  dotenv.config({ path: ".env.local" });
  console.log("\n🌱 [globalSetup] Seeding test database...");
  try {
    execSync("npm run db:seed", { stdio: "inherit" });
    console.log("✅ [globalSetup] Test database ready.");
  } catch (error) {
    console.error("❌ [globalSetup] Database seed failed:", error);
    throw error;
  }
}
