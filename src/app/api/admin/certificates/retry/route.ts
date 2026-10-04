// src/app/api/admin/certificates/retry/route.ts
// Retries failed certificate email dispatches.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { retryFailedCertificateDeliveries } from "@/server/certificates/service";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const eventId = body?.eventId as string | undefined;

    const result = await retryFailedCertificateDeliveries(eventId);
    return NextResponse.json({
      success: true,
      message: `Retried delivery for ${result.retriedCount} certificates.`,
      data: result,
    });
  } catch (err: unknown) {
    console.error("[Retry Certificates Error]:", err);
    return NextResponse.json({ error: "Failed to retry certificate deliveries" }, { status: 500 });
  }
}
