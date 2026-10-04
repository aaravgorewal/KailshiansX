// src/app/api/admin/leads/automation/inactivity-nudges/route.ts
// API route to trigger lead inactivity scan and automated nudges.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { checkAndSendInactivityNudges } from "@/server/leads/email-automation";

export async function POST(req: NextRequest) {
  // Allow admin session or cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await checkAndSendInactivityNudges();
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("Failed to run inactivity nudges:", err);
    return NextResponse.json({ error: "Failed to run inactivity check" }, { status: 500 });
  }
}
