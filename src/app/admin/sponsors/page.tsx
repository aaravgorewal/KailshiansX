// src/app/admin/sponsors/page.tsx
// Sponsor CRM and Partnerships Control Room ()
// Deals pipeline, deliverables tracker, billing & invoices linked directly to events.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  getSponsorsWithStats,
  getSponsorDeals,
  getDeliverables,
  getInvoices,
} from "@/server/sponsors/service";
import {
  AdminSponsorCRMClient,
  type DealItem,
  type DeliverableItem,
  type InvoiceItem,
} from "@/components/admin/sponsors/AdminSponsorCRMClient";

export const metadata: Metadata = {
  title: "Sponsor CRM & Pipeline | KailshiansX Admin",
  description:
    "Enterprise sponsorship deal tracking, deliverables checklist, and invoicing linked to events.",
};

export default async function AdminSponsorsPage() {
  await requireAdmin();

  const [sponsors, deals, deliverables, invoices, rawEvents] = await Promise.all([
    getSponsorsWithStats(),
    getSponsorDeals(),
    getDeliverables(),
    getInvoices(),
    db.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
      },
    }),
  ]);

  const formattedEvents = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    startDate: e.startDate.toISOString(),
  }));

  return (
    <AdminSponsorCRMClient
      initialSponsors={sponsors}
      initialDeals={deals as unknown as DealItem[]}
      initialDeliverables={deliverables as unknown as DeliverableItem[]}
      initialInvoices={invoices as unknown as InvoiceItem[]}
      events={formattedEvents}
    />
  );
}
