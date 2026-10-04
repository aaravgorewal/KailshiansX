// src/app/api/chapters/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getChapterBySlug } from "@/server/chapters/service";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();
    const data = await getChapterBySlug(slug, session?.user?.id);

    if (!data) {
      return NextResponse.json(
        { success: false, error: `Chapter with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/chapters/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const chapter = await db.chapter.findUnique({
      where: { slug },
      include: {
        members: {
          where: { userId: session.user.id, role: { in: ["LEAD", "CO_LEAD"] } },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, error: "Chapter not found" }, { status: 404 });
    }

    const isAuthorized =
      ["SUPER_ADMIN", "ADMIN"].includes(session.user.role || "") ||
      chapter.leadId === session.user.id ||
      chapter.members.length > 0;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update this chapter" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await db.chapter.update({
      where: { slug },
      data: {
        name: body.name,
        description: body.description,
        institution: body.institution,
        meetingCadence: body.meetingCadence,
        location: body.location,
        bannerImage: body.bannerImage,
        logo: body.logo,
        socialLinks: body.socialLinks,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/chapters/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update chapter" },
      { status: 400 }
    );
  }
}
