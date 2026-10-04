// src/app/api/admin/hackathons/publish/route.ts
// Handles finalizing results, assigning winner ranks, and publishing hackathon leaderboard

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishHackathonResults } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");
    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hackathonDetailId, winnerSelections } = body;

    if (!hackathonDetailId || !Array.isArray(winnerSelections)) {
      return NextResponse.json(
        { error: "Hackathon detail ID and winner selections array are required." },
        { status: 400 }
      );
    }

    const updated = await publishHackathonResults({
      hackathonDetailId,
      adminUserId: session.user.id,
      winnerSelections,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to publish hackathon results";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
