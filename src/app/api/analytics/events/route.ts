// src/app/api/analytics/events/route.ts — Internal event telemetry ingestion
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/server/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rl = await checkRateLimit(ip, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { event, payload, pathname, referrer, timestamp } = body;

    if (!event || typeof event !== "string") {
      return NextResponse.json({ error: "Missing or invalid event name" }, { status: 400 });
    }

    // In production, events can be streamed to a time-series DB or logged for aggregation
    // For now, record structured telemetry to server logger
    if (process.env.NODE_ENV !== "test") {
      console.info(`[Analytics Event] ${event}`, {
        pathname,
        referrer,
        timestamp: timestamp || new Date().toISOString(),
        payload,
      });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Internal analytics telemetry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
