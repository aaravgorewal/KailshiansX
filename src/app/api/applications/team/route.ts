// src/app/api/applications/team/route.ts
// Public endpoint for submitting team recruitment applications (PRD §14)

import { NextRequest, NextResponse } from "next/server";
import { submitTeamApplication } from "@/server/applications/team";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await submitTeamApplication(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Team application submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit application. Please try again." },
      { status: 500 }
    );
  }
}
