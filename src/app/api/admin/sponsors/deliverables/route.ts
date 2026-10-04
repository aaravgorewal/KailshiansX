// src/app/api/admin/sponsors/deliverables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import {
  getDeliverables,
  createOrUpdateDeliverable,
  deleteDeliverable,
} from "@/server/sponsors/service";
import { z } from "zod";
import { DeliverableStatus } from "@prisma/client";

const deliverableSchema = z.object({
  id: z.string().optional(),
  dealId: z.string().min(1, "Deal ID is required"),
  eventId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(DeliverableStatus).optional(),
  dueDate: z.string().nullable().optional(),
  fulfilledAt: z.string().nullable().optional(),
  proofUrl: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId") || undefined;
  const eventId = searchParams.get("eventId") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const deliverables = await getDeliverables({ dealId, eventId, status });
    return NextResponse.json({ success: true, data: deliverables });
  } catch (err: unknown) {
    console.error("Failed to fetch deliverables:", err);
    return NextResponse.json({ error: "Failed to fetch deliverables" }, { status: 500 });
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
    const validated = deliverableSchema.parse(body);
    const deliverable = await createOrUpdateDeliverable(validated);
    return NextResponse.json({ success: true, data: deliverable });
  } catch (err: unknown) {
    console.error("Failed to save deliverable:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save deliverable" }, { status: 500 });
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
  if (!id) return NextResponse.json({ error: "Deliverable ID is required" }, { status: 400 });

  try {
    await deleteDeliverable(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to delete deliverable:", err);
    return NextResponse.json({ error: "Failed to delete deliverable" }, { status: 500 });
  }
}
