// src/app/api/network/speakers/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSpeakerAvailability } from "@/server/speakers/service";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(session.user.role || "");

    // Find speaker profile linked to user or specified by speakerId
    let speaker = null;
    if (body.speakerId) {
      speaker = await db.speaker.findUnique({ where: { id: body.speakerId } });
    } else {
      speaker = await db.speaker.findFirst({ where: { userId: session.user.id } });
    }

    if (!speaker) {
      // Auto-create speaker profile if user is verified/admin or requesting to become mentor
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      const baseSlug = (user?.username || user?.name || "mentor")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      speaker = await db.speaker.create({
        data: {
          name: user?.name || "Anonymous Mentor",
          slug,
          userId: session.user.id,
          bio: user?.bio || body.bio,
          designation: user?.headline || body.designation,
          organisation: body.organisation,
          isMentor: true,
          isSpeaker: true,
          topics: body.topics || [],
          sessionTypes: body.sessionTypes || ["1:1 Mentorship"],
        },
      });
    }

    const updated = await updateSpeakerAvailability(
      speaker.id,
      session.user.id,
      {
        availabilityStatus: body.availabilityStatus,
        weeklyAvailabilityHours: body.weeklyAvailabilityHours,
        preferredCadence: body.preferredCadence,
        meetingPlatform: body.meetingPlatform,
        calendlyUrl: body.calendlyUrl,
        topics: body.topics,
        sessionTypes: body.sessionTypes,
        bio: body.bio,
        designation: body.designation,
        organisation: body.organisation,
      },
      isAdmin
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/network/speakers/availability error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update availability" },
      { status: 400 }
    );
  }
}
