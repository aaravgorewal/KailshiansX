// src/app/api/admin/partners/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishSponsorEventReport } from "@/server/partners/service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isAuthorized = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(
      session?.user?.role || ""
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Admin authorization required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.dealId || !body.partnerId || !body.eventId || !body.title || !body.executiveSummary) {
      return NextResponse.json(
        {
          success: false,
          error: "dealId, partnerId, eventId, title, and executiveSummary are required",
        },
        { status: 400 }
      );
    }

    const report = await publishSponsorEventReport({
      dealId: body.dealId,
      partnerId: body.partnerId,
      eventId: body.eventId,
      title: body.title,
      executiveSummary: body.executiveSummary,
      totalImpressions: Number(body.totalImpressions) || 0,
      totalAttendees: Number(body.totalAttendees) || 0,
      boothFootfall: Number(body.boothFootfall) || 0,
      trackParticipants: Number(body.trackParticipants) || 0,
      clickThroughRate: Number(body.clickThroughRate) || 0,
      leadCapturesCount: Number(body.leadCapturesCount) || 0,
      mediaGalleryUrls: Array.isArray(body.mediaGalleryUrls) ? body.mediaGalleryUrls : [],
      recapDeckUrl: body.recapDeckUrl || undefined,
      npsScore: Number(body.npsScore) || 9.0,
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/partners/reports error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to publish report" },
      { status: 400 }
    );
  }
}
