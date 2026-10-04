// src/app/api/chapters/[slug]/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createChapterEvent, completeChapterEvent } from "@/server/chapters/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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
      select: { id: true, leadId: true },
    });

    if (!chapter) {
      return NextResponse.json({ success: false, error: "Chapter not found" }, { status: 404 });
    }

    const body = await req.json();

    // If eventId and action === "COMPLETE", record event completion
    if (body.action === "COMPLETE" && body.eventId) {
      const attendance = Number(body.attendanceCount) || 0;
      const completed = await completeChapterEvent(body.eventId, attendance, body.recapNotes);
      return NextResponse.json({ success: true, data: completed });
    }

    // Schedule new chapter event
    if (!body.title || !body.date) {
      return NextResponse.json(
        { success: false, error: "Title and date are required" },
        { status: 400 }
      );
    }

    const newEvent = await createChapterEvent({
      chapterId: chapter.id,
      title: body.title,
      description: body.description,
      date: body.date,
      venue: body.venue,
      eventId: body.linkedEventId,
    });

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chapters/[slug]/events error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to manage chapter event" },
      { status: 400 }
    );
  }
}
