// src/app/api/leads/reports/route.ts
// API route for submitting and evaluating monthly leadership reports.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { submitMonthlyReport, reviewMonthlyReport } from "@/server/leads/service";

const reportSchema = z.object({
  leadId: z.string().min(1),
  leadType: z.enum(["CAMPUS", "STATE"]),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2025).max(2030),
  summary: z.string().min(20),
  highlights: z.string().optional(),
  challenges: z.string().optional(),
  nextMonthPlans: z.string().optional(),
  newSignupsCount: z.number().int().min(0).default(0),
  eventsOrganizedCount: z.number().int().min(0).default(0),
  swagDistributedCount: z.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = reportSchema.parse(body);

    const report = await submitMonthlyReport(validated);
    return NextResponse.json({ success: true, data: report });
  } catch (err: unknown) {
    console.error("Failed to submit monthly report:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit monthly report" }, { status: 500 });
  }
}

const reviewSchema = z.object({
  reportId: z.string().min(1),
  performanceScore: z.number().int().min(0).max(100),
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
    const validated = reviewSchema.parse(body);

    const updated = await reviewMonthlyReport(
      validated.reportId,
      validated.performanceScore,
      validated.adminFeedback
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    console.error("Failed to review monthly report:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to review monthly report" }, { status: 500 });
  }
}
