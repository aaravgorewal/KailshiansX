// src/app/api/admin/pnl/export/csv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { generatePnLReportCsv } from "@/server/pnl/service";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId") || undefined;
  const seriesId = searchParams.get("seriesId") || undefined;

  if (!eventId && !seriesId) {
    return NextResponse.json({ error: "Specify eventId or seriesId" }, { status: 400 });
  }

  try {
    const { filename, csv } = await generatePnLReportCsv({ eventId, seriesId });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    console.error("Failed to export CSV:", err);
    return NextResponse.json({ error: "Failed to generate CSV export" }, { status: 500 });
  }
}
