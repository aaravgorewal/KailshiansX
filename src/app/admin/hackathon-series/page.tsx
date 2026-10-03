// src/app/admin/hackathon-series/page.tsx
// Server component fetching Hackathon Series for AdminSeriesClient.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminSeriesClient, type SeriesListItem } from "@/components/admin/AdminSeriesClient";
import { SeriesKind } from "@prisma/client";

export const metadata: Metadata = {
  title: "Hackathon Series Manager | KailshiansX Admin",
};

export default async function AdminHackathonSeriesPage() {
  await requireAdmin();

  const series = await db.series.findMany({
    where: {
      kind: SeriesKind.HACKATHON,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { editions: true } },
    },
  });

  const formatted: SeriesListItem[] = series.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    kind: s.kind,
    tagline: s.tagline,
    description: s.description,
    city: s.city,
    region: s.region,
    coverImage: s.coverImage,
    editionsCount: s._count.editions,
  }));

  return <AdminSeriesClient initialSeries={formatted} kind={SeriesKind.HACKATHON} />;
}
