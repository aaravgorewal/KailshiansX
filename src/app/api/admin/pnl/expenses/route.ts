// src/app/api/admin/pnl/expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { createOrUpdateExpenseItem, deleteExpenseItem } from "@/server/pnl/service";
import { z } from "zod";
import { ExpenseCategory } from "@prisma/client";

const expenseSchema = z.object({
  id: z.string().optional(),
  eventId: z.string().min(1, "Event ID is required"),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().nullable().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  paidAt: z.string().nullable().optional(),
  payee: z.string().nullable().optional(),
  receiptUrl: z.string().nullable().optional(),
  referenceNo: z.string().nullable().optional(),
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
    const validated = expenseSchema.parse(body);
    const item = await createOrUpdateExpenseItem(validated);
    return NextResponse.json({ success: true, data: item });
  } catch (err: unknown) {
    console.error("Failed to save expense item:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save expense item" }, { status: 500 });
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
    await deleteExpenseItem(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to delete expense item:", err);
    return NextResponse.json({ error: "Failed to delete expense item" }, { status: 500 });
  }
}
