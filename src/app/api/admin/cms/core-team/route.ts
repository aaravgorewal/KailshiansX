// src/app/api/admin/cms/core-team/route.ts
// Admin endpoint for managing Core Team members (PRD §15)

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import {
  createCoreTeamMember,
  updateCoreTeamMember,
  deleteCoreTeamMember,
} from "@/server/cms/content";

export async function POST(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const result = await createCoreTeamMember(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to create core team member:", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "Missing member ID" }, { status: 400 });

    const result = await updateCoreTeamMember(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update core team member:", error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing member ID" }, { status: 400 });

    const result = await deleteCoreTeamMember(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete core team member:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
