// src/app/admin/pnl/page.tsx
// Event P&L Dashboard (PRD §23)
// Server component loading events, series, and initial financial P&L statements.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { getEventPnL } from "@/server/pnl/service";
import {
  AdminPnLClient,
  type EventOption,
  type SeriesOption,
} from "@/components/admin/pnl/AdminPnLClient";

export const metadata: Metadata = {
  title: "Revenue & Event P&L | KailshiansX Admin",
  description:
    "Track event profitability, ticket revenue, sponsorships, and expenses across events and series.",
};

export default async function AdminPnLPage() {
  await requireAdmin();

  const [rawEvents, rawSeries] = await Promise.all([
    db.event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        startDate: true,
        seriesEdition: {
          select: { seriesId: true },
        },
      },
    }),
    db.series.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        kind: true,
      },
    }),
  ]);

  const events: EventOption[] = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    startDate: e.startDate.toISOString(),
    seriesId: e.seriesEdition?.seriesId || null,
  }));

  const seriesList: SeriesOption[] = rawSeries.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    kind: s.kind,
  }));

  let initialPnL = null;
  if (events.length > 0) {
    initialPnL = await getEventPnL(events[0].id);
  }

  return <AdminPnLClient initialEventPnL={initialPnL} events={events} seriesList={seriesList} />;
}
