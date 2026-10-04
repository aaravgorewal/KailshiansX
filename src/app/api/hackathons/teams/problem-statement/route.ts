// src/app/api/hackathons/teams/problem-statement/route.ts
// Handles selecting or updating a team's problem statement

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { selectTeamProblemStatement } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { teamId, problemStatementId } = body;

    if (!teamId || !problemStatementId) {
      return NextResponse.json(
        { error: "Team ID and problem statement ID are required." },
        { status: 400 }
      );
    }

    const updated = await selectTeamProblemStatement({
      teamId,
      leaderUserId: session.user.id,
      problemStatementId,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to select problem statement";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
