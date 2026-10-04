// src/app/api/leads/activities/route.ts
// API route for logging, verifying, and deleting lead activities.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { logLeadActivity, verifyLeadActivity, deleteLeadActivity } from "@/server/leads/service";
import { LeadActivityType } from "@prisma/client";

const activitySchema = z.object({
  leadId: z.string().min(1),
  leadType: z.enum(["CAMPUS", "STATE"]),
  title: z.string().min(3),
  type: z.nativeEnum(LeadActivityType),
  description: z.string().min(10),
  date: z.string().optional(),
  hoursSpent: z.number().min(0.1).max(100).default(1.0),
  attendeesCount: z.number().int().min(0).default(0),
  proofUrls: z.array(z.string().url()).optional(),
  eventId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = activitySchema.parse(body);

    const activity = await logLeadActivity(validated);
    return NextResponse.json({ success: true, data: activity });
  } catch (err: unknown) {
    console.error("Failed to log activity:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}

const verifySchema = z.object({
  activityId: z.string().min(1),
  verified: z.boolean(),
  adminFeedback: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = verifySchema.parse(body);

    const updated = await verifyLeadActivity(
      validated.activityId,
      validated.verified,
      validated.adminFeedback
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Failed to verify activity:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to verify activity" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const activityId = searchParams.get("id");
  if (!activityId) {
    return NextResponse.json({ error: "Activity ID required" }, { status: 400 });
  }

  try {
    await deleteLeadActivity(activityId);
    return NextResponse.json({ success: true, message: "Activity deleted" });
  } catch (err: unknown) {
    console.error("Failed to delete activity:", err);
    return NextResponse.json({ error: "Failed to delete activity" }, { status: 500 });
  }
}
