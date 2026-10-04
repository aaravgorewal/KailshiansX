// src/app/api/chapters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getChaptersDirectory,
  createChapter,
  type CreateChapterInput,
} from "@/server/chapters/service";
import { ChapterType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");
    const cityId = searchParams.get("cityId") || undefined;
    const state = searchParams.get("state") || undefined;
    const search = searchParams.get("search") || undefined;

    let type: ChapterType | undefined;
    if (typeParam === "CAMPUS" || typeParam === "REGIONAL_CITY") {
      type = typeParam as ChapterType;
    }

    const chapters = await getChaptersDirectory({ type, cityId, state, search });
    return NextResponse.json({ success: true, data: chapters });
  } catch (error) {
    console.error("GET /api/chapters error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required to create a chapter" },
        { status: 401 }
      );
    }

    const body = (await req.json()) as CreateChapterInput;
    if (!body.name || !body.slug || !body.type) {
      return NextResponse.json(
        { success: false, error: "Name, slug, and type are required fields" },
        { status: 400 }
      );
    }

    const chapter = await createChapter({
      ...body,
      leadId: body.leadId || session.user.id,
    });

    return NextResponse.json({ success: true, data: chapter }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chapters error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to create chapter" },
      { status: 400 }
    );
  }
}
