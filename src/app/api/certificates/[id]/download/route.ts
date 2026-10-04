// src/app/api/certificates/[id]/download/route.ts
// Streams an authentic, high-resolution signed PDF certificate.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateCertificatePdf, type CertificateTemplateConfig } from "@/server/certificates/pdf";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id).trim();

  // Search by uniqueId or database ID
  const cert = await db.certificate.findFirst({
    where: {
      OR: [{ uniqueId: { equals: cleanId, mode: "insensitive" } }, { id: cleanId }],
    },
    include: {
      event: { select: { title: true, startDate: true } },
      template: true,
    },
  });

  if (!cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";
  const verificationUrl = `${appBaseUrl}/verify?id=${encodeURIComponent(cert.uniqueId)}`;

  try {
    const pdfBytes = await generateCertificatePdf({
      recipientName: cert.participantName,
      eventTitle: cert.event.title,
      uniqueId: cert.uniqueId,
      issueDate: cert.issuedAt,
      verificationUrl,
      template: {
        id: cert.template.id,
        name: cert.template.name,
        templateUrl: cert.template.templateUrl,
        fields: cert.template.fields as CertificateTemplateConfig["fields"],
      },
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${cert.uniqueId}.pdf"`,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: unknown) {
    console.error("[Certificate PDF Download Error]:", err);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF document" },
      { status: 500 }
    );
  }
}
