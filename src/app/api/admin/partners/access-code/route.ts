// src/app/api/admin/partners/access-code/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setPartnerAccessCode } from "@/server/partners/service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const isAuthorized = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(
      session?.user?.role || ""
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Admin authorization required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.partnerId) {
      return NextResponse.json({ success: false, error: "partnerId is required" }, { status: 400 });
    }

    const partner = await setPartnerAccessCode(body.partnerId, body.customCode);
    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    console.error("POST /api/admin/partners/access-code error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to set access code" },
      { status: 400 }
    );
  }
}
