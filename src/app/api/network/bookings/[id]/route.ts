// src/app/api/network/bookings/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { respondToBookingRequest, completeBookingRequest } from "@/server/speakers/service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role || "");

    // Case 1: Requester completes session and submits rating & review
    if (body.action === "COMPLETE") {
      const rating = Number(body.rating) || 5;
      const completed = await completeBookingRequest({
        bookingId: id,
        requesterId: session.user.id,
        rating,
        feedback: body.feedback,
      });
      return NextResponse.json({ success: true, data: completed });
    }

    // Case 2: Mentor responds (ACCEPT / DECLINE)
    if (body.action === "ACCEPT" || body.action === "DECLINE") {
      const updated = await respondToBookingRequest({
        bookingId: id,
        userId: session.user.id,
        action: body.action,
        meetingUrl: body.meetingUrl,
        declinedReason: body.declinedReason,
        mentorNotes: body.mentorNotes,
        isAdmin,
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: ACCEPT, DECLINE, COMPLETE" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/network/bookings/[id] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update booking" },
      { status: 400 }
    );
  }
}
