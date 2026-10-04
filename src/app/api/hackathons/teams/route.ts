// src/app/api/hackathons/teams/route.ts
// Handles Hackathon Team Creation

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createHackathonTeam } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hackathonDetailId, name, problemStatementId, track } = body;

    if (!hackathonDetailId || !name) {
      return NextResponse.json(
        { error: "Hackathon detail ID and team name are required." },
        { status: 400 }
      );
    }

    const team = await createHackathonTeam({
      hackathonDetailId,
      leaderId: session.user.id,
      name,
      problemStatementId,
      track,
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create team";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
