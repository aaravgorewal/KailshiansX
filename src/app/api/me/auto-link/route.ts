// src/app/api/me/auto-link/route.ts
// Endpoint to trigger linking past registrations, payments, certificates, and applications by verified email.

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { autoLinkUserRecords } from "@/server/users/autolink";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await autoLinkUserRecords(session.user.id, session.user.email);

    return NextResponse.json({
      success: true,
      message: `Auto-linked ${result.registrationsLinked} past registrations and ${result.certificatesLinked} certificates.`,
      result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
