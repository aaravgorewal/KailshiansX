// src/app/api/admin/hackathons/judges/route.ts
// Handles assigning and managing judge accounts for hackathons

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assignHackathonJudge } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");
    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hackathonDetailId, userId, title, company, bio, track } = body;

    if (!hackathonDetailId || !userId) {
      return NextResponse.json(
        { error: "Hackathon detail ID and user ID are required." },
        { status: 400 }
      );
    }

    const judge = await assignHackathonJudge({
      hackathonDetailId,
      userId,
      title,
      company,
      bio,
      track,
    });

    return NextResponse.json({ success: true, data: judge });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to assign judge";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
