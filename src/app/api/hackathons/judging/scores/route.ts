// src/app/api/hackathons/judging/scores/route.ts
// Handles Judge scoring and evaluation with multi-criteria rubrics

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { submitJudgeScore } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { submissionId, criteriaScores, feedback, privateNotes } = body;

    if (!submissionId || !criteriaScores || typeof criteriaScores !== "object") {
      return NextResponse.json(
        { error: "Submission ID and criteria scores map are required." },
        { status: 400 }
      );
    }

    const score = await submitJudgeScore({
      submissionId,
      judgeUserId: session.user.id,
      criteriaScores,
      feedback,
      privateNotes,
    });

    return NextResponse.json({ success: true, data: score });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit evaluation score";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
