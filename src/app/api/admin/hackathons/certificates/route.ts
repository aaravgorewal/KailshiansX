// src/app/api/admin/hackathons/certificates/route.ts
// Handles mass-issuing hackathon certificates (participants & winners)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { issueHackathonCertificates } from "@/server/hackathons/service";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");
    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { hackathonDetailId, issueType } = body;

    if (!hackathonDetailId) {
      return NextResponse.json({ error: "Hackathon detail ID is required." }, { status: 400 });
    }

    const result = await issueHackathonCertificates({
      hackathonDetailId,
      issueType: issueType || "ALL",
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to issue certificates";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
