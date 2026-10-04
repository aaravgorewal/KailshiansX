// src/app/admin/certificates/page.tsx
// Certificate Management Studio (PRD §21)
// Admin picks event -> imports participants -> chooses template & positions coordinates -> bulk generates PDFs & queues emails -> tracks delivery rate.

import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/require-role";
import { db } from "@/lib/db";
import {
  getCertificateDeliveryStats,
  getCertificateTemplates,
} from "@/server/certificates/service";
import {
  AdminCertificatesClient,
  type EventOption,
  type IssuedCertificateItem,
} from "@/components/admin/certificates/AdminCertificatesClient";

export const metadata: Metadata = {
  title: "Certificates Studio & Verification Engine | KailshiansX Admin",
  description:
    "Bulk-issue cryptographically signed PDF certificates, design templates with drag-and-drop coordinates, and track delivery rates.",
};

export default async function AdminCertificatesPage() {
  await requireAdmin();

  // Ensure default templates are present
  await getCertificateTemplates();

  // Fetch events for selection
  const rawEvents = await db.event.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: "CONFIRMED" },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  const events: EventOption[] = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    type: e.type,
    startDate: e.startDate.toISOString(),
    confirmedRegistrationsCount: e._count.registrations,
  }));

  // Fetch delivery statistics
  const stats = await getCertificateDeliveryStats();

  // Fetch recent issued certificates
  const rawCertificates = await db.certificate.findMany({
    include: {
      event: { select: { title: true, slug: true } },
      registration: { select: { registrationCode: true } },
    },
    orderBy: { issuedAt: "desc" },
    take: 100,
  });

  const certificates: IssuedCertificateItem[] = rawCertificates.map((c) => ({
    id: c.id,
    uniqueId: c.uniqueId,
    participantName: c.participantName,
    participantEmail: c.participantEmail,
    eventTitle: c.event.title,
    eventSlug: c.event.slug,
    issuedAt: c.issuedAt.toISOString(),
    deliveryStatus: c.deliveryStatus,
    emailSentAt: c.emailSentAt ? c.emailSentAt.toISOString() : null,
    registrationCode: c.registration?.registrationCode ?? null,
  }));

  return (
    <div className="max-w-6xl space-y-8 pb-16">
      {/* Header */}
      <div className="border-surface-800 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="border-brand-500/20 bg-brand-500/10 text-brand-400 rounded border px-2 py-0.5 font-mono text-[10px] font-bold">
              PRD §21 Production Engine
            </span>
            <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
              Active
            </span>
          </div>
          <h1 className="text-surface-50 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Certificate Studio &amp; Delivery Engine
          </h1>
          <p className="text-surface-400 mt-1 text-xs sm:text-sm">
            Bulk-generate cryptographically signed vector PDFs, customize template coordinates with
            drag-and-drop, and monitor Resend queue delivery rates.
          </p>
        </div>
      </div>

      {/* Main Studio Client */}
      <AdminCertificatesClient
        events={events}
        initialStats={stats}
        initialCertificates={certificates}
      />
    </div>
  );
}
