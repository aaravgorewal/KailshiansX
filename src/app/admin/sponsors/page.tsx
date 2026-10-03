// src/app/admin/sponsors/page.tsx
// Server component fetching partners / sponsors for AdminSponsorsClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminSponsorsClient, type SponsorListItem } from "@/components/admin/AdminSponsorsClient";

export const metadata: Metadata = {
  title: "Sponsors & Partners Manager | KailshiansX Admin",
};

export default async function AdminSponsorsPage() {
  await requireAdmin();

  const partners = await db.partner.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { eventPartners: true },
      },
    },
  });

  const formatted: SponsorListItem[] = partners.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    logo: p.logo,
    website: p.website,
    category: p.category,
    eventsCount: p._count.eventPartners,
  }));

  return <AdminSponsorsClient initialSponsors={formatted} />;
}
