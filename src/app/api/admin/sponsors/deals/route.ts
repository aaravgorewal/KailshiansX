// src/app/api/admin/sponsors/deals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { getSponsorDeals, createOrUpdateDeal, deleteDeal } from "@/server/sponsors/service";
import { z } from "zod";
import { PartnerTier, SponsorDealStage } from "@prisma/client";

const dealSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  sponsorId: z.string().min(1, "Sponsor is required"),
  eventId: z.string().nullable().optional(),
  tier: z.nativeEnum(PartnerTier).optional(),
  stage: z.nativeEnum(SponsorDealStage).optional(),
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().default("INR"),
  confidence: z.number().min(0).max(100).default(50),
  ownerName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  expectedCloseAt: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") || undefined;
  const stage = searchParams.get("stage") || undefined;
  const sponsorId = searchParams.get("sponsorId") || undefined;

  try {
    const deals = await getSponsorDeals({ eventId, stage, sponsorId });
    return NextResponse.json({ success: true, data: deals });
  } catch (err: unknown) {
    console.error("Failed to fetch deals:", err);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = dealSchema.parse(body);
    const deal = await createOrUpdateDeal(validated);
    return NextResponse.json({ success: true, data: deal });
  } catch (err: unknown) {
    console.error("Failed to save deal:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save deal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });

  try {
    await deleteDeal(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to delete deal:", err);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}
