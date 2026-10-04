// src/app/api/admin/leads/automation/post-event-feedback/route.ts
// API route to trigger post-event attendee feedback & Next Step CTAs.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { z } from "zod";
import { sendPostEventFeedbackAndNextSteps } from "@/server/leads/email-automation";

const postEventSchema = z.object({
  eventId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = postEventSchema.parse(body);

    const result = await sendPostEventFeedbackAndNextSteps(validated.eventId);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("Failed to send post-event feedback emails:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send post-event feedback" }, { status: 500 });
  }
}
