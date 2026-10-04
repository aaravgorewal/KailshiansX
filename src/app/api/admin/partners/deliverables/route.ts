// src/app/api/admin/partners/deliverables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateDeliverableProof } from "@/server/partners/service";
import { DeliverableStatus } from "@prisma/client";

export async function PATCH(req: NextRequest) {
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
    if (!body.deliverableId || !body.status) {
      return NextResponse.json(
        { success: false, error: "deliverableId and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateDeliverableProof({
      deliverableId: body.deliverableId,
      status: body.status as DeliverableStatus,
      proofUrl: body.proofUrl,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/admin/partners/deliverables error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Failed to update deliverable" },
      { status: 400 }
    );
  }
}
