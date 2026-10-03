// src/app/api/admin/applications/team/route.ts
// Admin endpoint for managing team recruitment applications

import { NextRequest, NextResponse } from "next/server";
import { requireAdminForRoute } from "@/server/auth/require-role";
import { getTeamApplications, updateTeamApplicationStatus } from "@/server/applications/team";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const area = searchParams.get("area") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await getTeamApplications({ status, area, search });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch team applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireAdminForRoute();
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json();
    const result = await updateTeamApplicationStatus(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update team application:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
