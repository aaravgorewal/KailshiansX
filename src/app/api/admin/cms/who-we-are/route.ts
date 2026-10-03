// src/app/api/admin/cms/who-we-are/route.ts
// Admin endpoint for editing Who We Are CMS content (PRD §17)

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import { updateWhoWeAreContent } from "@/server/cms/content";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const result = await updateWhoWeAreContent(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update Who We Are CMS content:", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
