// src/app/api/admin/analytics/community/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommunityAnalyticsOverview } from "@/server/analytics/community-service";

export async function GET() {
  try {
    const session = await auth();
    const isAdmin =
      session?.user && ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session.user.role);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const metrics = await getCommunityAnalyticsOverview();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Failed to compute community analytics metrics:", error);
    return NextResponse.json(
      { error: "Internal server error computing community metrics." },
      { status: 500 }
    );
  }
}
