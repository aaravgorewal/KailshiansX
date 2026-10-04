// src/app/api/chapters/[slug]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { joinChapter, updateMemberRole } from "@/server/chapters/service";
import { ChapterMemberRole } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Sign in required to join chapter" },
        { status: 401 }
      );
    }

    const chapter = await db.chapter.findUnique({
      where: { slug },
      select: { id: true, leadId: true },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, error: "Chapter not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    // If targetUserId and role are provided, it's a role promotion/update request
    if (body.targetUserId && body.role) {
      const isLead =
        ["SUPER_ADMIN", "ADMIN"].includes(session.user.role || "") ||
        chapter.leadId === session.user.id;

      if (!isLead) {
        return NextResponse.json(
          { success: false, error: "Only chapter leads can update member roles" },
          { status: 403 }
        );
      }

      const updated = await updateMemberRole(
        chapter.id,
        body.targetUserId,
        body.role as ChapterMemberRole
      );
      return NextResponse.json({ success: true, data: updated });
    }

    // Default: current user joins chapter
    const membership = await joinChapter(chapter.id, session.user.id);
    return NextResponse.json({ success: true, data: membership });
  } catch (error) {
    console.error("POST /api/chapters/[slug]/members error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update membership" },
      { status: 400 }
    );
  }
}
