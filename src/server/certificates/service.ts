// src/server/certificates/service.ts
// Core business service for Certificate issuance, bulk generation, template management,
// email delivery queuing, delivery rate analytics, and public cryptographic verification.

import { db } from "@/lib/db";
import { EmailJobStatus, EmailTemplate, Prisma } from "@prisma/client";
import { enqueueEmail } from "@/server/email/queue";
import type { CertificateTemplateConfig } from "./pdf";
import crypto from "crypto";

export interface ParticipantImportItem {
  name: string;
  email: string;
  registrationCode?: string;
  registrationId?: string;
}

export interface BulkGenerateOptions {
  eventId: string;
  templateId?: string;
  participants: ParticipantImportItem[];
  sendEmailNow?: boolean;
  customDesignUrl?: string | null;
  customFields?: CertificateTemplateConfig["fields"] | null;
}

export interface CertificateDeliveryStats {
  totalIssued: number;
  sentCount: number;
  pendingCount: number;
  failedCount: number;
  deliveryRate: number; // 0 to 100 percentage
}

/**
 * Standard default templates seeded automatically if none exist.
 */
export const DEFAULT_TEMPLATES = [
  {
    id: "template-obsidian-gold",
    name: "Obsidian & Gold Executive",
    description: "Deep obsidian backdrop with metallic gold borders and crisp white typography.",
    templateUrl: null,
    isDefault: true,
    fields: {
      recipientName: { x: 50, y: 35, fontSize: 32, color: "#ffffff", align: "center" as const },
      eventTitle: { x: 50, y: 53, fontSize: 20, color: "#38bdf8", align: "center" as const },
      issueDate: { x: 50, y: 64, fontSize: 11, color: "#94a3b8", align: "center" as const },
      qrCode: { x: 50, y: 76, size: 68, align: "center" as const },
      uniqueId: { x: 50, y: 92, fontSize: 10, color: "#94a3b8", align: "center" as const },
    },
  },
  {
    id: "template-tech-cyan",
    name: "Cyberpunk Neon Blue",
    description:
      "Electric cyan and deep midnight accents designed for technical hackathons and bootcamps.",
    templateUrl: null,
    isDefault: false,
    fields: {
      recipientName: { x: 50, y: 34, fontSize: 34, color: "#38bdf8", align: "center" as const },
      eventTitle: { x: 50, y: 52, fontSize: 22, color: "#a855f7", align: "center" as const },
      issueDate: { x: 50, y: 64, fontSize: 11, color: "#cbd5e1", align: "center" as const },
      qrCode: { x: 50, y: 77, size: 64, align: "center" as const },
      uniqueId: { x: 50, y: 92, fontSize: 10, color: "#38bdf8", align: "center" as const },
    },
  },
];

/**
 * Returns available templates, seeding defaults if database is unseeded.
 */
export async function getCertificateTemplates() {
  let templates = await db.certificateTemplate.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (templates.length === 0) {
    for (const def of DEFAULT_TEMPLATES) {
      await db.certificateTemplate.create({
        data: {
          id: def.id,
          name: def.name,
          description: def.description,
          templateUrl: def.templateUrl || "",
          fields: def.fields,
          isDefault: def.isDefault,
        },
      });
    }
    templates = await db.certificateTemplate.findMany({
      orderBy: { createdAt: "asc" },
    });
  }

  return templates;
}

/**
 * Returns attendees/registrations for an event, indicating if a certificate is already issued.
 */
export async function getEventParticipantsForCertificates(eventId: string) {
  const registrations = await db.registration.findMany({
    where: {
      eventId,
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    include: {
      certificate: {
        select: {
          id: true,
          uniqueId: true,
          deliveryStatus: true,
          issuedAt: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return registrations.map((r) => ({
    id: r.id,
    registrationCode: r.registrationCode,
    name: r.name,
    email: r.email,
    status: r.status,
    checkedInAt: r.checkedInAt,
    certificate: r.certificate,
  }));
}

/**
 * Generates a clean, unique cryptographic ID e.g. KX-CERT-9A8B7C6D
 */
export function generateUniqueCertificateId(eventCode?: string): string {
  const prefix = eventCode
    ? `KX-${eventCode
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase()
        .slice(0, 4)}`
    : "KX-CERT";
  const randomBytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${randomBytes}`;
}

/**
 * Bulk generates verifiable certificates for imported participants and queues email delivery.
 */
export async function bulkGenerateCertificates(options: BulkGenerateOptions) {
  const {
    eventId,
    templateId,
    participants,
    sendEmailNow = true,
    customDesignUrl,
    customFields,
  } = options;

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, slug: true, startDate: true },
  });

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  // Resolve template
  let template = null;
  if (templateId) {
    template = await db.certificateTemplate.findUnique({ where: { id: templateId } });
  }
  if (!template) {
    template = await db.certificateTemplate.findFirst({ where: { isDefault: true } });
  }
  if (!template) {
    const templates = await getCertificateTemplates();
    template = templates[0];
  }

  if (customFields || customDesignUrl) {
    template = await db.certificateTemplate.update({
      where: { id: template.id },
      data: {
        fields: (customFields || template.fields) as unknown as Prisma.InputJsonValue,
        templateUrl:
          customDesignUrl !== undefined && customDesignUrl !== null
            ? customDesignUrl
            : template.templateUrl,
      },
    });
  }

  const results = {
    createdCount: 0,
    updatedCount: 0,
    emailsQueued: 0,
    certificates: [] as {
      id: string;
      uniqueId: string;
      name: string;
      email: string;
      status: string;
    }[],
  };

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";

  for (const p of participants) {
    const cleanEmail = p.email.toLowerCase().trim();
    const cleanName = p.name.trim();

    // Check if certificate already exists for this participant in this event
    let cert = await db.certificate.findFirst({
      where: {
        eventId,
        participantEmail: cleanEmail,
      },
    });

    // Match with user and registration
    const matchingUser = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    let matchingReg = null;
    if (p.registrationId) {
      matchingReg = await db.registration.findUnique({ where: { id: p.registrationId } });
    } else if (p.registrationCode) {
      matchingReg = await db.registration.findUnique({
        where: { registrationCode: p.registrationCode },
      });
    } else {
      matchingReg = await db.registration.findFirst({
        where: { eventId, email: cleanEmail },
      });
    }

    const uniqueId = cert?.uniqueId || generateUniqueCertificateId(event.slug);

    if (cert) {
      // Update existing
      cert = await db.certificate.update({
        where: { id: cert.id },
        data: {
          participantName: cleanName,
          templateId: template.id,
          userId: matchingUser?.id || cert.userId,
          registrationId: matchingReg?.id || cert.registrationId,
        },
      });
      results.updatedCount++;
    } else {
      // Create new
      cert = await db.certificate.create({
        data: {
          uniqueId,
          eventId,
          templateId: template.id,
          participantName: cleanName,
          participantEmail: cleanEmail,
          userId: matchingUser?.id || null,
          registrationId: matchingReg?.id || null,
          deliveryStatus: EmailJobStatus.PENDING,
        },
      });
      results.createdCount++;
    }

    // Queue email dispatch if requested
    if (sendEmailNow) {
      try {
        const verificationUrl = `${appBaseUrl}/verify?id=${encodeURIComponent(uniqueId)}`;
        const downloadUrl = `${appBaseUrl}/api/certificates/${encodeURIComponent(uniqueId)}/download`;

        const job = await enqueueEmail({
          template: EmailTemplate.CERTIFICATE_ISSUED,
          recipient: cleanEmail,
          subject: `Your Verified Certificate: ${event.title} (${uniqueId})`,
          payload: {
            name: cleanName,
            eventTitle: event.title,
            uniqueId,
            verificationUrl,
            downloadUrl,
            issuedAt: cert.issuedAt,
          },
          immediate: true,
        });

        const status =
          job.status === EmailJobStatus.SENT ? EmailJobStatus.SENT : EmailJobStatus.PENDING;
        await db.certificate.update({
          where: { id: cert.id },
          data: {
            deliveryStatus: status,
            emailSentAt: status === EmailJobStatus.SENT ? new Date() : null,
          },
        });
        results.emailsQueued++;
      } catch (err: unknown) {
        console.error(`[Certificate Queue Error] Failed to queue email for ${cleanEmail}:`, err);
        await db.certificate.update({
          where: { id: cert.id },
          data: {
            deliveryStatus: EmailJobStatus.FAILED,
            deliveryError: err instanceof Error ? err.message : String(err),
          },
        });
      }
    }

    results.certificates.push({
      id: cert.id,
      uniqueId: cert.uniqueId,
      name: cert.participantName,
      email: cert.participantEmail,
      status: cert.deliveryStatus,
    });
  }

  return results;
}

/**
 * Calculates delivery rate statistics for certificates, optionally scoped to an event.
 */
export async function getCertificateDeliveryStats(
  eventId?: string
): Promise<CertificateDeliveryStats> {
  const whereClause = eventId ? { eventId } : {};

  const [totalIssued, sentCount, pendingCount, failedCount] = await Promise.all([
    db.certificate.count({ where: whereClause }),
    db.certificate.count({
      where: {
        ...whereClause,
        deliveryStatus: EmailJobStatus.SENT,
      },
    }),
    db.certificate.count({
      where: {
        ...whereClause,
        deliveryStatus: { in: [EmailJobStatus.PENDING, EmailJobStatus.PROCESSING] },
      },
    }),
    db.certificate.count({
      where: {
        ...whereClause,
        deliveryStatus: EmailJobStatus.FAILED,
      },
    }),
  ]);

  const deliveryRate = totalIssued > 0 ? Number(((sentCount / totalIssued) * 100).toFixed(1)) : 0;

  return {
    totalIssued,
    sentCount,
    pendingCount,
    failedCount,
    deliveryRate,
  };
}

/**
 * Retries failed certificate emails.
 */
export async function retryFailedCertificateDeliveries(eventId?: string) {
  const whereClause = {
    deliveryStatus: { in: [EmailJobStatus.FAILED, EmailJobStatus.PENDING] },
    ...(eventId ? { eventId } : {}),
  };

  const certificates = await db.certificate.findMany({
    where: whereClause,
    include: { event: true },
    take: 50,
  });

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kailshiansx.com";
  let retriedCount = 0;

  for (const cert of certificates) {
    try {
      const verificationUrl = `${appBaseUrl}/verify?id=${encodeURIComponent(cert.uniqueId)}`;
      const downloadUrl = `${appBaseUrl}/api/certificates/${encodeURIComponent(cert.uniqueId)}/download`;

      const job = await enqueueEmail({
        template: EmailTemplate.CERTIFICATE_ISSUED,
        recipient: cert.participantEmail,
        subject: `Your Verified Certificate: ${cert.event.title} (${cert.uniqueId})`,
        payload: {
          name: cert.participantName,
          eventTitle: cert.event.title,
          uniqueId: cert.uniqueId,
          verificationUrl,
          downloadUrl,
          issuedAt: cert.issuedAt,
        },
        immediate: true,
      });

      const nextStatus =
        job.status === EmailJobStatus.SENT ? EmailJobStatus.SENT : EmailJobStatus.PENDING;
      await db.certificate.update({
        where: { id: cert.id },
        data: {
          deliveryStatus: nextStatus,
          emailSentAt: nextStatus === EmailJobStatus.SENT ? new Date() : null,
          deliveryError: null,
        },
      });
      retriedCount++;
    } catch (err: unknown) {
      console.error(`[Retry Error] Failed to resend certificate ${cert.uniqueId}:`, err);
    }
  }

  return { retriedCount };
}

/**
 * Public Certificate Verification Service.
 * Resolves certificates by uniqueId, participantEmail, or registrationCode.
 */
export async function verifyCertificate(query: string) {
  const clean = query.trim();
  if (!clean || clean.length < 3) return null;

  // Search order:
  // 1. Exact unique ID match (e.g. KX-CERT-...)
  // 2. Email match
  // 3. Registration code match
  const cert = await db.certificate.findFirst({
    where: {
      OR: [
        { uniqueId: { equals: clean, mode: "insensitive" } },
        { participantEmail: { equals: clean, mode: "insensitive" } },
        { registration: { registrationCode: { equals: clean, mode: "insensitive" } } },
      ],
    },
    include: {
      event: {
        include: {
          city: true,
          seriesEdition: { include: { series: true } },
        },
      },
      template: true,
      registration: true,
      user: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  if (!cert) return null;

  return {
    id: cert.id,
    uniqueId: cert.uniqueId,
    participantName: cert.participantName,
    participantEmail: cert.participantEmail,
    issuedAt: cert.issuedAt.toISOString(),
    event: {
      id: cert.event.id,
      title: cert.event.title,
      slug: cert.event.slug,
      type: cert.event.type,
      startDate: cert.event.startDate.toISOString(),
      city: cert.event.city?.name ?? null,
      venue: cert.event.venue,
    },
    registrationCode: cert.registration?.registrationCode ?? null,
    template: {
      id: cert.template.id,
      name: cert.template.name,
      templateUrl: cert.template.templateUrl,
      fields: cert.template.fields,
    },
    user: cert.user,
    verified: true,
    verificationUrl: `https://kailshiansx.com/verify?id=${cert.uniqueId}`,
  };
}
