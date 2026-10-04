// src/app/api/admin/sponsors/invoices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { getInvoices, createOrUpdateInvoice, deleteInvoice } from "@/server/sponsors/service";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

const invoiceSchema = z.object({
  id: z.string().optional(),
  invoiceNumber: z.string().optional(),
  dealId: z.string().min(1, "Deal ID is required"),
  eventId: z.string().nullable().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  taxAmount: z.number().min(0).optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  issueDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  transactionRef: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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
    const invoices = await getInvoices({ dealId, eventId, status });
    return NextResponse.json({ success: true, data: invoices });
  } catch (err: unknown) {
    console.error("Failed to fetch invoices:", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
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
    const validated = invoiceSchema.parse(body);
    const invoice = await createOrUpdateInvoice(validated);
    return NextResponse.json({ success: true, data: invoice });
  } catch (err: unknown) {
    console.error("Failed to save invoice:", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
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
  if (!id) return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });

  try {
    await deleteInvoice(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Failed to delete invoice:", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
