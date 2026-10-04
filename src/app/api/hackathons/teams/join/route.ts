// src/app/api/hackathons/teams/join/route.ts
// Handles joining a hackathon team using an invite code

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { joinTeamByInviteCode } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inviteCode, role } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: "Team invite code is required." }, { status: 400 });
    }

    const team = await joinTeamByInviteCode({
      inviteCode: inviteCode.trim(),
      userId: session.user.id,
      role,
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to join team";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
