// src/app/api/network/bookings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createBookingRequest,
  getUserBookings,
  getMentorIncomingBookings,
} from "@/server/speakers/service";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    if (scope === "incoming") {
      const incoming = await getMentorIncomingBookings(session.user.id);
      return NextResponse.json({ success: true, data: incoming });
    }

    const outbound = await getUserBookings(session.user.id);
    return NextResponse.json({ success: true, data: outbound });
  } catch (error) {
    console.error("GET /api/network/bookings error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to book a session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body.speakerId || !body.title || !body.topic || !body.preferredDate) {
      return NextResponse.json(
        { success: false, error: "Speaker, title, topic, and preferred date are required" },
        { status: 400 }
      );
    }

    const booking = await createBookingRequest({
      speakerId: body.speakerId,
      requesterId: session.user.id,
      chapterId: body.chapterId || null,
      title: body.title,
      topic: body.topic,
      sessionType: body.sessionType || "1:1 Mentorship",
      description: body.description || "",
      preferredDate: body.preferredDate,
      durationMinutes: Number(body.durationMinutes) || 45,
      format: body.format || "VIRTUAL",
      meetingUrl: body.meetingUrl || null,
    });

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/network/bookings error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to create booking" },
      { status: 400 }
    );
  }
}
