// src/app/api/admin/cms/founder/route.ts
// Admin endpoint for editing Founder CMS content (PRD §16)

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import { updateFounderContent } from "@/server/cms/content";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const result = await updateFounderContent(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update Founder content:", error);
    return NextResponse.json({ error: "Failed to update founder content" }, { status: 500 });
  }
}
