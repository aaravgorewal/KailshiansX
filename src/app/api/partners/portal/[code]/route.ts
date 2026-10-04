// src/app/api/partners/portal/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPartnerPortalData } from "@/server/partners/service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const data = await getPartnerPortalData(code);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Invalid partner portal access code or partner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/partners/portal/[code] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to load partner portal" },
      { status: 500 }
    );
  }
}
