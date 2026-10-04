// src/app/api/admin/certificates/generate/route.ts
// Bulk certificate generation and email queuing admin endpoint.

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/server/auth/require-role";
import { bulkGenerateCertificates } from "@/server/certificates/service";
import { z } from "zod";

import type { CertificateFieldConfig } from "@/server/certificates/pdf";

const bulkSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  templateId: z.string().optional(),
  participants: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email required"),
        registrationCode: z.string().optional(),
        registrationId: z.string().optional(),
      })
    )
    .min(1, "At least one participant required"),
  sendEmailNow: z.boolean().default(true),
  customDesignUrl: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bulkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const results = await bulkGenerateCertificates({
      eventId: parsed.data.eventId,
      templateId: parsed.data.templateId,
      participants: parsed.data.participants,
      sendEmailNow: parsed.data.sendEmailNow,
      customDesignUrl: parsed.data.customDesignUrl,
      customFields: parsed.data.customFields as
        Record<string, CertificateFieldConfig> | null | undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${results.createdCount + results.updatedCount} certificates (${results.emailsQueued} queued for email delivery).`,
      data: results,
    });
  } catch (err: unknown) {
    console.error("[Bulk Certificate Generation Error]:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate certificates" },
      { status: 500 }
    );
  }
}
