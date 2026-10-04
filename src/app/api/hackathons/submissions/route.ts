// src/app/api/hackathons/submissions/route.ts
// Handles Project Submission (GitHub repo, demo, deck, video, tech stack)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitProject } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      teamId,
      title,
      tagline,
      description,
      track,
      repoUrl,
      demoUrl,
      deckUrl,
      videoUrl,
      techStack,
      problemStatementId,
    } = body;

    if (!teamId || !title || !description || !repoUrl) {
      return NextResponse.json(
        { error: "Team ID, project title, description, and repository URL are required." },
        { status: 400 }
      );
    }

    const submission = await submitProject({
      teamId,
      userId: session.user.id,
      title,
      tagline,
      description,
      track: track || "General Track",
      repoUrl,
      demoUrl,
      deckUrl,
      videoUrl,
      techStack,
      problemStatementId,
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit project";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
