// src/app/api/network/speakers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMentorSpeakerNetwork } from "@/server/speakers/service";
import { SpeakerAvailabilityStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");
    const topic = searchParams.get("topic") || undefined;
    const sessionType = searchParams.get("sessionType") || undefined;
    const availabilityParam = searchParams.get("availability");
    const search = searchParams.get("search") || undefined;

    let role: "MENTOR" | "SPEAKER" | "ALL" = "ALL";
    if (roleParam === "MENTOR" || roleParam === "SPEAKER") {
      role = roleParam;
    }

    let availability: SpeakerAvailabilityStatus | undefined;
    if (
      availabilityParam &&
      Object.values(SpeakerAvailabilityStatus).includes(
        availabilityParam as SpeakerAvailabilityStatus
      )
    ) {
      availability = availabilityParam as SpeakerAvailabilityStatus;
    }

    const data = await getMentorSpeakerNetwork({
      role,
      topic,
      sessionType,
      availability,
      search,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/network/speakers error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch speakers" },
      { status: 500 }
    );
  }
}
