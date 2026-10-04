// src/app/api/leads/events/route.ts
// API route for linking supported events to leads.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { linkSupportedEvent } from "@/server/leads/service";

const linkEventSchema = z.object({
  leadId: z.string().min(1),
  leadType: z.enum(["CAMPUS", "STATE"]),
  eventId: z.string().min(1),
  role: z.string().default("ORGANIZER"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = linkEventSchema.parse(body);

    await linkSupportedEvent(
      validated.leadId,
      validated.leadType,
      validated.eventId,
      validated.role,
      validated.notes
    );

    return NextResponse.json({ success: true, message: "Event linked to lead" });
  } catch (err: unknown) {
    console.error("Failed to link event to lead:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to link event" }, { status: 500 });
  }
}
