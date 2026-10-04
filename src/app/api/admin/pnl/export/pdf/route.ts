// src/app/api/admin/pnl/export/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { generatePnLReportPdf } from "@/server/pnl/service";

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
    const { filename, buffer } = await generatePnLReportPdf({ eventId, seriesId });
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch (err: unknown) {
    console.error("Failed to export PDF:", err);
    return NextResponse.json({ error: "Failed to generate PDF export" }, { status: 500 });
  }
}
