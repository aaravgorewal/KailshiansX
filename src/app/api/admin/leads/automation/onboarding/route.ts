// src/app/api/admin/leads/automation/onboarding/route.ts
// API route to trigger lead onboarding sequence.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { z } from "zod";
import { sendLeadOnboardingEmail } from "@/server/leads/email-automation";

const onboardingSchema = z.object({
  leadId: z.string().min(1),
  leadType: z.enum(["CAMPUS_LEAD", "STATE_LEAD"]),
  recipientEmail: z.string().email().optional(),
  leadName: z.string().optional(),
  collegeOrState: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = onboardingSchema.parse(body);

    const result = await sendLeadOnboardingEmail(validated);
    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("Failed to trigger onboarding email:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to trigger onboarding email" }, { status: 500 });
  }
}
