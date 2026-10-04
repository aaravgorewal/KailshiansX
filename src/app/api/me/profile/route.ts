// src/app/api/me/profile/route.ts
// Handles GET and PATCH for authenticated member profile and settings.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMemberDashboardData, updateMemberProfile } from "@/server/users/profile";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dashboard = await getMemberDashboardData(session.user.id);
    if (!dashboard) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: dashboard });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateMemberProfile(session.user.id, {
      name: body.name,
      username: body.username,
      headline: body.headline,
      bio: body.bio,
      github: body.github,
      linkedin: body.linkedin,
      twitter: body.twitter,
      website: body.website,
      skills: Array.isArray(body.skills) ? body.skills : undefined,
      isPassportPublic:
        typeof body.isPassportPublic === "boolean" ? body.isPassportPublic : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updated.id,
        name: updated.name,
        username: updated.username,
        headline: updated.headline,
        bio: updated.bio,
        github: updated.github,
        linkedin: updated.linkedin,
        twitter: updated.twitter,
        website: updated.website,
        skills: updated.skills,
        isPassportPublic: updated.isPassportPublic,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
