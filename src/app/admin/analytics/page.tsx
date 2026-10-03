// src/app/admin/analytics/page.tsx
// Server component computing operational telemetry and revenue metrics.

import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import {
  AdminAnalyticsClient,
  type EventMetricItem,
  type CityMetricItem,
} from "@/components/admin/AdminAnalyticsClient";

export const metadata: Metadata = {
  title: "Analytics & Telemetry | KailshiansX Admin",
};

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [
    totalRegistrations,
    confirmedRegistrations,
    totalCheckins,
    revenueAggregate,
    events,
    cities,
    teamAppsTotal,
    teamAppsSelected,
    campusLeadsTotal,
    campusLeadsActive,
    stateLeadsTotal,
    stateLeadsActive,
    collabsTotal,
    collabsWon,
  ] = await Promise.all([
    db.registration.count({ where: { deletedAt: null } }),
    db.registration.count({ where: { deletedAt: null, status: "CONFIRMED" } }),
    db.attendance.count(),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "CAPTURED" },
    }),
    db.event.findMany({
      where: { deletedAt: null },
      orderBy: { startDate: "desc" },
      include: {
        city: { select: { name: true } },
        registrations: {
          select: {
            id: true,
            status: true,
            attendance: true,
            payment: { select: { amount: true, status: true } },
          },
        },
      },
    }),
    db.city.findMany({
      include: {
        _count: {
          select: { events: true },
        },
        events: {
          select: {
            _count: { select: { registrations: true } },
          },
        },
      },
    }),
    db.teamApplication.count(),
    db.teamApplication.count({ where: { status: "SELECTED" } }),
    db.campusLeadApplication.count(),
    db.campusLeadApplication.count({
      where: { status: { in: ["SELECTED", "ACTIVE"] } },
    }),
    db.stateLeadApplication.count(),
    db.stateLeadApplication.count({
      where: { status: { in: ["SELECTED", "ACTIVE"] } },
    }),
    db.collaborationLead.count(),
    db.collaborationLead.count({ where: { stage: { in: ["CONFIRMED", "WON"] } } }),
  ]);

  const totalRevenue = Number(revenueAggregate._sum.amount ?? 0);

  const topEvents: EventMetricItem[] = events.map((e) => {
    const regsCount = e.registrations.length;
    const checkinsCount = e.registrations.filter((r) => Boolean(r.attendance)).length;
    const eventRevenue = e.registrations.reduce((acc, r) => {
      if (r.payment && r.payment.status === "CAPTURED") {
        return acc + Number(r.payment.amount);
      }
      return acc;
    }, 0);

    const conversionRate = regsCount > 0 ? Math.round((checkinsCount / regsCount) * 100) : 0;

    return {
      id: e.id,
      title: e.title,
      type: e.type,
      cityName: e.city?.name ?? "India (Online)",
      registrations: regsCount,
      revenue: eventRevenue,
      checkins: checkinsCount,
      conversionRate,
    };
  });

  const cityMetrics: CityMetricItem[] = cities.map((c) => {
    const totalRegs = c.events.reduce((sum, evt) => sum + evt._count.registrations, 0);
    return {
      city: c.name,
      eventsCount: c._count.events,
      registrationsCount: totalRegs,
    };
  });

  return (
    <AdminAnalyticsClient
      totalRegistrations={totalRegistrations}
      confirmedRegistrations={confirmedRegistrations}
      totalCheckins={totalCheckins}
      totalRevenue={totalRevenue}
      topEvents={topEvents}
      cityMetrics={cityMetrics}
      funnelMetrics={{
        teamAppsTotal,
        teamAppsSelected,
        campusLeadsTotal,
        campusLeadsActive,
        stateLeadsTotal,
        stateLeadsActive,
        collabsTotal,
        collabsWon,
      }}
    />
  );
}
