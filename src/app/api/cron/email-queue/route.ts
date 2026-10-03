// src/app/api/cron/email-queue/route.ts
// Background cron / worker endpoint to process queued and retried emails.

import { NextResponse } from "next/server";
import { processEmailQueue, getEmailLogStats } from "@/server/email";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleQueueProcessing(request);
}

export async function POST(request: Request) {
  return handleQueueProcessing(request);
}

async function handleQueueProcessing(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processEmailQueue({ batchSize: 50 });
    const stats = await getEmailLogStats();

    return NextResponse.json({
      success: true,
      result,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
