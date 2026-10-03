// src/app/admin/community/page.tsx
// Server component fetching community cities and regional chapters.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminCommunityClient, type CityListItem } from "@/components/admin/AdminCommunityClient";

export const metadata: Metadata = {
  title: "Community Manager | KailshiansX Admin",
};

export default async function AdminCommunityPage() {
  await requireAdmin();

  const cities = await db.city.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          colleges: true,
          campusLeads: true,
          stateLeads: true,
          events: true,
        },
      },
    },
  });

  const formatted: CityListItem[] = cities.map((c) => ({
    id: c.id,
    name: c.name,
    state: c.state,
    country: c.country,
    collegesCount: c._count.colleges,
    campusLeadsCount: c._count.campusLeads,
    stateLeadsCount: c._count.stateLeads,
    eventsCount: c._count.events,
  }));

  return <AdminCommunityClient initialCities={formatted} />;
}
