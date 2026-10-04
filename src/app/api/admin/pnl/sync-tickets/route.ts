// src/app/api/admin/pnl/sync-tickets/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { syncTicketRevenue } from "@/server/pnl/service";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const ticketRevenue = await syncTicketRevenue(eventId);
    return NextResponse.json({
      success: true,
      data: { ticketRevenue },
      message: `Successfully synchronized ticket revenue: INR ${ticketRevenue.toLocaleString("en-IN")}`,
    });
  } catch (err: unknown) {
    console.error("Failed to sync ticket revenue:", err);
    return NextResponse.json({ error: "Failed to sync ticket revenue" }, { status: 500 });
  }
}
