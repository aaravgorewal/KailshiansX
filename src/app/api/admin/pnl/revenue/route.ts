// src/app/api/admin/pnl/revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { createOrUpdateRevenueItem, deleteRevenueItem } from "@/server/pnl/service";
import { z } from "zod";
import { RevenueCategory } from "@prisma/client";

const revenueSchema = z.object({
  id: z.string().optional(),
  eventId: z.string().min(1, "Event ID is required"),
  category: z.nativeEnum(RevenueCategory),
  description: z.string().nullable().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  receivedAt: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  isAutoSynced: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = revenueSchema.parse(body);
    const item = await createOrUpdateRevenueItem(validated);
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    console.error("Failed to save revenue item:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save revenue item" }, { status: 500 });
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
  if (!id) return NextResponse.json({ error: "Item ID is required" }, { status: 400 });

  try {
    await deleteRevenueItem(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to delete revenue item:", err);
    return NextResponse.json({ error: "Failed to delete revenue item" }, { status: 500 });
  }
}
