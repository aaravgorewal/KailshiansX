// src/app/api/admin/hackathons/prizes/route.ts
// Handles Prize Disbursement Tracking and Financial Settlement

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePrizeDisbursement } from "@/server/hackathons/service";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(session?.user?.role || "");
    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prizeId, status, transactionRef, notes } = body;

    if (!prizeId || !status) {
      return NextResponse.json(
        { error: "Prize ID and disbursement status are required." },
        { status: 400 }
      );
    }

    const prize = await updatePrizeDisbursement({
      prizeId,
      status,
      transactionRef,
      notes,
    });

    return NextResponse.json({ success: true, data: prize });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update prize disbursement";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
