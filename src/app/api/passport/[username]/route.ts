// src/app/api/passport/[username]/route.ts
// Public Developer Passport endpoint. Returns public passport profile, progression ladder,
// milestone badges, and participation timeline.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDeveloperPassportData } from "@/server/users/passport";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const cleanUsername = decodeURIComponent(username).toLowerCase().trim();

    // Look up user by username or fallback to ID
    const user = await db.user.findFirst({
      where: {
        OR: [{ username: { equals: cleanUsername, mode: "insensitive" } }, { id: cleanUsername }],
      },
      select: { id: true, isPassportPublic: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Developer Passport not found" }, { status: 404 });
    }

    const session = await auth();
    const isOwner = session?.user?.id === user.id;

    // Check privacy
    if (!user.isPassportPublic && !isOwner) {
      return NextResponse.json(
        {
          isPrivate: true,
          message: "This Developer Passport has been set to private by the owner.",
        },
        { status: 403 }
      );
    }

    const passport = await getDeveloperPassportData(user.id);
    if (!passport) {
      return NextResponse.json({ error: "Passport could not be computed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: passport,
      isOwner,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
