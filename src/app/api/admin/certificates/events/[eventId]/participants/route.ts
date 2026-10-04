// src/app/api/admin/certificates/events/[eventId]/participants/route.ts
// Returns participants eligible for certificates for a given event.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { getEventParticipantsForCertificates } from "@/server/certificates/service";

interface Props {
  params: Promise<{ eventId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  try {
    const participants = await getEventParticipantsForCertificates(eventId);
    return NextResponse.json({
      success: true,
      data: participants,
    });
  } catch (err: unknown) {
    console.error("[Get Participants Error]:", err);
    return NextResponse.json({ error: "Failed to fetch event participants" }, { status: 500 });
  }
}
