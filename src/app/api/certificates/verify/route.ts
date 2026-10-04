// src/app/api/certificates/verify/route.ts
// Public Certificate Verification API endpoint.

import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/server/certificates/service";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(2, "Search term too short").max(100),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q =
    searchParams.get("q") ||
    searchParams.get("id") ||
    searchParams.get("code") ||
    searchParams.get("email");

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Please provide a certificate ID, email, or registration code." },
      { status: 400 }
    );
  }

  const parsed = querySchema.safeParse({ q });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid search query parameter." },
      { status: 400 }
    );
  }

  try {
    const cert = await verifyCertificate(parsed.data.q);
    if (!cert) {
      return NextResponse.json(
        {
          success: false,
          error: "No verified certificate found matching this credential identifier.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cert,
    });
  } catch (err: unknown) {
    console.error("[Verify API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal verification error. Please try again." },
      { status: 500 }
    );
  }
}
