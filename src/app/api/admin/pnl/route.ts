// src/app/api/admin/pnl/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { getEventPnL, getSeriesPnL, getAllSeriesPnL } from "@/server/pnl/service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const seriesId = searchParams.get("seriesId");

  try {
    if (eventId) {
      const pnl = await getEventPnL(eventId);
      if (!pnl) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: pnl });
    }

    if (seriesId) {
      const seriesPnl = await getSeriesPnL(seriesId);
      if (!seriesPnl) {
        return NextResponse.json({ error: "Series not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: seriesPnl });
    }

    const allSeries = await getAllSeriesPnL();
    return NextResponse.json({ success: true, data: allSeries });
  } catch (err: unknown) {
    console.error("Failed to fetch P&L data:", err);
    return NextResponse.json({ error: "Failed to fetch P&L data" }, { status: 500 });
  }
}
