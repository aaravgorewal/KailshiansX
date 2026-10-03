// src/components/admin/AdminAnalyticsClient.tsx
// Analytics dashboard with telemetry charts, event ROI, attendance conversion, and CSV export.

"use client";

import * as React from "react";
import {
  TrendingUp,
  Ticket,
  IndianRupee,
  UserCheck,
  Building,
  Download,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface EventMetricItem {
  id: string;
  title: string;
  type: string;
  cityName: string;
  registrations: number;
  revenue: number;
  checkins: number;
  conversionRate: number; // percentage checkin / registrations
}

export interface CityMetricItem {
  city: string;
  eventsCount: number;
  registrationsCount: number;
}

interface AdminAnalyticsClientProps {
  totalRegistrations: number;
  confirmedRegistrations: number;
  totalCheckins: number;
  totalRevenue: number;
  topEvents: EventMetricItem[];
  cityMetrics: CityMetricItem[];
  funnelMetrics: {
    teamAppsTotal: number;
    teamAppsSelected: number;
    campusLeadsTotal: number;
    campusLeadsActive: number;
    stateLeadsTotal: number;
    stateLeadsActive: number;
    collabsTotal: number;
    collabsWon: number;
  };
}

export function AdminAnalyticsClient({
  totalRegistrations,
  confirmedRegistrations,
  totalCheckins,
  totalRevenue,
  topEvents,
  cityMetrics,
  funnelMetrics,
}: AdminAnalyticsClientProps) {
  const checkinRate =
    confirmedRegistrations > 0 ? Math.round((totalCheckins / confirmedRegistrations) * 100) : 0;

  const handleExportCsv = () => {
    const headers = [
      "Event Title",
      "Type",
      "City",
      "Registrations",
      "Check-ins",
      "Revenue (INR)",
      "Attendance %",
    ];
    const rows = topEvents.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.type}"`,
      `"${e.cityName}"`,
      e.registrations,
      e.checkins,
      e.revenue,
      `${e.conversionRate}%`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kailshiansx_analytics_report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-surface-50 text-2xl font-bold">Analytics & Telemetry</h1>
          <p className="text-surface-400 mt-0.5 text-xs sm:text-sm">
            Key operational metrics, revenue performance, gate conversion rates, and leadership
            pipeline funnels.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="border-surface-700 bg-surface-900 text-surface-200 flex items-center gap-1.5 self-start text-xs font-semibold sm:self-auto"
        >
          <Download className="h-3.5 w-3.5" /> Export Analytics CSV
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold uppercase">Total Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-surface-50 text-2xl font-extrabold sm:text-3xl">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-surface-400 mt-1 text-xs">Paid ticket transactions</p>
        </div>

        <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold uppercase">Registrations</span>
            <Ticket className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-surface-50 text-2xl font-extrabold sm:text-3xl">
            {totalRegistrations.toLocaleString()}
          </p>
          <p className="text-surface-400 mt-1 text-xs">{confirmedRegistrations} confirmed passes</p>
        </div>

        <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold uppercase">Gate Check-in Rate</span>
            <UserCheck className="text-brand-400 h-4 w-4" />
          </div>
          <p className="text-brand-400 text-2xl font-extrabold sm:text-3xl">{checkinRate}%</p>
          <p className="text-surface-400 mt-1 text-xs">{totalCheckins} verified venue check-ins</p>
        </div>

        <div className="bg-surface-900/60 border-surface-800 rounded-2xl border p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold uppercase">Regional Footprint</span>
            <Building className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-surface-50 text-2xl font-extrabold sm:text-3xl">
            {cityMetrics.length} Cities
          </p>
          <p className="text-surface-400 mt-1 text-xs">Tier-1, 2 & 3 tech hubs</p>
        </div>
      </div>

      {/* Top Events ROI & Attendance Table */}
      <div className="space-y-4">
        <h2 className="text-surface-100 flex items-center gap-2 text-base font-bold">
          <TrendingUp className="text-brand-400 h-4 w-4" />
          <span>Top Event Performances</span>
        </h2>

        <div className="border-surface-800 bg-surface-900/40 overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-xs">
            <thead className="border-surface-800 bg-surface-900/80 text-surface-400 border-b font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Event Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Passes</th>
                <th className="px-4 py-3">Check-ins</th>
                <th className="px-4 py-3">Turnout %</th>
                <th className="px-4 py-3">Revenue (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-surface-800/60 divide-y">
              {topEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-850/40 transition-colors">
                  <td className="text-surface-100 max-w-xs truncate px-4 py-3 font-semibold">
                    {evt.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-surface-800 text-surface-300 rounded px-2 py-0.5 text-[10px] font-bold uppercase">
                      {evt.type}
                    </span>
                  </td>
                  <td className="text-surface-300 px-4 py-3">{evt.cityName}</td>
                  <td className="text-surface-200 px-4 py-3 font-mono font-medium">
                    {evt.registrations}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{evt.checkins}</td>
                  <td className="text-brand-300 px-4 py-3 font-mono font-semibold">
                    {evt.conversionRate}%
                  </td>
                  <td className="text-surface-100 px-4 py-3 font-mono font-bold">
                    ₹{evt.revenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leadership & Partnership Funnel Conversion */}
      <div className="bg-surface-900/40 border-surface-800 space-y-4 rounded-2xl border p-6">
        <h2 className="text-surface-100 flex items-center gap-2 text-base font-bold">
          <Layers className="h-4 w-4 text-purple-400" />
          <span>Pipeline Conversion Rates</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-surface-950 border-surface-800 space-y-1.5 rounded-xl border p-4">
            <span className="text-surface-400 text-xs font-semibold">Team Applications</span>
            <div className="flex items-baseline justify-between">
              <span className="text-surface-100 text-xl font-bold">
                {funnelMetrics.teamAppsSelected} / {funnelMetrics.teamAppsTotal}
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {funnelMetrics.teamAppsTotal > 0
                  ? Math.round((funnelMetrics.teamAppsSelected / funnelMetrics.teamAppsTotal) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="bg-surface-800 mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    funnelMetrics.teamAppsTotal > 0
                      ? (funnelMetrics.teamAppsSelected / funnelMetrics.teamAppsTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-surface-950 border-surface-800 space-y-1.5 rounded-xl border p-4">
            <span className="text-surface-400 text-xs font-semibold">Campus Fellows</span>
            <div className="flex items-baseline justify-between">
              <span className="text-surface-100 text-xl font-bold">
                {funnelMetrics.campusLeadsActive} / {funnelMetrics.campusLeadsTotal}
              </span>
              <span className="text-brand-400 font-mono text-xs font-bold">
                {funnelMetrics.campusLeadsTotal > 0
                  ? Math.round(
                      (funnelMetrics.campusLeadsActive / funnelMetrics.campusLeadsTotal) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="bg-surface-800 mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand-500 h-full rounded-full"
                style={{
                  width: `${
                    funnelMetrics.campusLeadsTotal > 0
                      ? (funnelMetrics.campusLeadsActive / funnelMetrics.campusLeadsTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-surface-950 border-surface-800 space-y-1.5 rounded-xl border p-4">
            <span className="text-surface-400 text-xs font-semibold">State Directors</span>
            <div className="flex items-baseline justify-between">
              <span className="text-surface-100 text-xl font-bold">
                {funnelMetrics.stateLeadsActive} / {funnelMetrics.stateLeadsTotal}
              </span>
              <span className="font-mono text-xs font-bold text-purple-400">
                {funnelMetrics.stateLeadsTotal > 0
                  ? Math.round(
                      (funnelMetrics.stateLeadsActive / funnelMetrics.stateLeadsTotal) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="bg-surface-800 mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-purple-500"
                style={{
                  width: `${
                    funnelMetrics.stateLeadsTotal > 0
                      ? (funnelMetrics.stateLeadsActive / funnelMetrics.stateLeadsTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-surface-950 border-surface-800 space-y-1.5 rounded-xl border p-4">
            <span className="text-surface-400 text-xs font-semibold">Partnership Deals</span>
            <div className="flex items-baseline justify-between">
              <span className="text-surface-100 text-xl font-bold">
                {funnelMetrics.collabsWon} / {funnelMetrics.collabsTotal}
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
                {funnelMetrics.collabsTotal > 0
                  ? Math.round((funnelMetrics.collabsWon / funnelMetrics.collabsTotal) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="bg-surface-800 mt-2 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${
                    funnelMetrics.collabsTotal > 0
                      ? (funnelMetrics.collabsWon / funnelMetrics.collabsTotal) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
