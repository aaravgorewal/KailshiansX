// src/app/admin/page.tsx
// Admin Dashboard Home with key numbers (registrations, revenue, pending applications, upcoming events)
// Meets PRD §22 dashboard requirements.

import type { Metadata } from "next";
import Link from "next/link";
import {
  Ticket,
  IndianRupee,
  Briefcase,
  Calendar,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/server/auth/require-role";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard | KailshiansX",
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  // Aggregate dashboard metrics concurrently
  const [
    totalRegistrations,
    revenueAggregate,
    pendingTeamApps,
    pendingCampusApps,
    pendingStateApps,
    pendingCollabLeads,
    upcomingEvents,
    totalEventsCount,
    recentRegistrations,
    recentAuditLogs,
  ] = await Promise.all([
    db.registration.count({ where: { deletedAt: null } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { status: "CAPTURED" },
    }),
    db.teamApplication.count({
      where: { status: { in: ["NEW", "REVIEWING"] } },
    }),
    db.campusLeadApplication.count({
      where: { status: { in: ["APPLIED", "SCREENING"] } },
    }),
    db.stateLeadApplication.count({
      where: { status: { in: ["APPLIED", "SCREENING"] } },
    }),
    db.collaborationLead.count({
      where: { stage: { in: ["LEAD", "NEW", "CONTACTED"] } },
    }),
    db.event.findMany({
      where: {
        deletedAt: null,
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 5,
      include: {
        city: true,
        _count: { select: { registrations: true } },
      },
    }),
    db.event.count({ where: { deletedAt: null } }),
    db.registration.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        event: { select: { title: true, slug: true } },
        ticketType: { select: { name: true, price: true } },
      },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueAggregate._sum.amount ?? 0);
  const totalPendingApplications =
    pendingTeamApps + pendingCampusApps + pendingStateApps + pendingCollabLeads;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="border-surface-800/80 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 rounded border px-2 py-0.5 font-mono text-[11px] font-semibold">
              PRD §22 Control Center
            </span>
            <span className="text-surface-500 text-xs">·</span>
            <span className="text-surface-400 font-mono text-xs">{session.user.role}</span>
          </div>
          <h1 className="text-surface-50 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="text-surface-400 mt-1 text-xs sm:text-sm">
            Real-time telemetry across developer events, ticket pipelines, payments, and candidate
            dossiers.
          </p>
        </div>

        {/* Quick jump */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/events/new"
            className="bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
          >
            <span>+ Create Event</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Numbers (Required: Registrations, Revenue, Pending Applications, Upcoming Events) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Registrations */}
        <div className="bg-surface-900/60 border-surface-800/80 hover:border-surface-700 group relative overflow-hidden rounded-2xl border p-5 transition-all">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
              Total Registrations
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <p className="text-surface-50 text-3xl font-extrabold tracking-tight">
            {totalRegistrations.toLocaleString()}
          </p>
          <div className="text-surface-400 mt-3 flex items-center justify-between text-xs">
            <span>Passes generated</span>
            <Link
              href="/admin/registrations"
              className="text-brand-400 hover:text-brand-300 flex items-center gap-0.5 font-medium"
            >
              View passes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 2. Revenue */}
        <div className="bg-surface-900/60 border-surface-800/80 hover:border-surface-700 group relative overflow-hidden rounded-2xl border p-5 transition-all">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
              Total Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="text-surface-50 text-3xl font-extrabold tracking-tight">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <div className="text-surface-400 mt-3 flex items-center justify-between text-xs">
            <span>Captured payments</span>
            <Link
              href="/admin/payments"
              className="flex items-center gap-0.5 font-medium text-emerald-400 hover:text-emerald-300"
            >
              Payments <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 3. Pending Applications */}
        <div className="bg-surface-900/60 border-surface-800/80 hover:border-surface-700 group relative overflow-hidden rounded-2xl border p-5 transition-all">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
              Pending Applications
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-surface-50 text-3xl font-extrabold tracking-tight">
            {totalPendingApplications.toLocaleString()}
          </p>
          <div className="text-surface-400 mt-3 flex items-center justify-between text-xs">
            <span>Requires triage</span>
            <Link
              href="/admin/team-applications"
              className="flex items-center gap-0.5 font-medium text-amber-400 hover:text-amber-300"
            >
              Triage now <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* 4. Upcoming Events */}
        <div className="bg-surface-900/60 border-surface-800/80 hover:border-surface-700 group relative overflow-hidden rounded-2xl border p-5 transition-all">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-bold tracking-wider uppercase">
              Upcoming Events
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="text-surface-50 text-3xl font-extrabold tracking-tight">
            {upcomingEvents.length.toLocaleString()}
          </p>
          <div className="text-surface-400 mt-3 flex items-center justify-between text-xs">
            <span>{totalEventsCount} lifetime events</span>
            <Link
              href="/admin/events"
              className="flex items-center gap-0.5 font-medium text-purple-400 hover:text-purple-300"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pipeline Triage Breakdown */}
      <div className="bg-surface-900/40 border-surface-800 rounded-2xl border p-5">
        <h3 className="text-surface-100 mb-4 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
          <span>Active Pipeline Triage</span>
          <span className="bg-surface-800 text-surface-300 rounded px-2 py-0.5 font-mono text-[10px]">
            {totalPendingApplications} awaiting review
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link
            href="/admin/team-applications"
            className="bg-surface-950/60 border-surface-800/80 hover:border-brand-500/40 group flex flex-col justify-between rounded-xl border p-3.5 transition-all"
          >
            <span className="text-surface-300 group-hover:text-brand-300 text-xs font-semibold">
              Team Applications
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-surface-100 text-2xl font-black">{pendingTeamApps}</span>
              <span className="text-surface-500 text-[11px]">New / Review</span>
            </div>
          </Link>

          <Link
            href="/admin/campus-leads"
            className="bg-surface-950/60 border-surface-800/80 hover:border-brand-500/40 group flex flex-col justify-between rounded-xl border p-3.5 transition-all"
          >
            <span className="text-surface-300 group-hover:text-brand-300 text-xs font-semibold">
              Campus Leads
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-surface-100 text-2xl font-black">{pendingCampusApps}</span>
              <span className="text-surface-500 text-[11px]">Applied / Screening</span>
            </div>
          </Link>

          <Link
            href="/admin/state-leads"
            className="bg-surface-950/60 border-surface-800/80 hover:border-brand-500/40 group flex flex-col justify-between rounded-xl border p-3.5 transition-all"
          >
            <span className="text-surface-300 group-hover:text-brand-300 text-xs font-semibold">
              State Leads
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-surface-100 text-2xl font-black">{pendingStateApps}</span>
              <span className="text-surface-500 text-[11px]">Applied / Screening</span>
            </div>
          </Link>

          <Link
            href="/admin/collaborations"
            className="bg-surface-950/60 border-surface-800/80 hover:border-brand-500/40 group flex flex-col justify-between rounded-xl border p-3.5 transition-all"
          >
            <span className="text-surface-300 group-hover:text-brand-300 text-xs font-semibold">
              Partnerships / Collabs
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-surface-100 text-2xl font-black">{pendingCollabLeads}</span>
              <span className="text-surface-500 text-[11px]">Leads / In Discussion</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Section: Upcoming Events & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Upcoming Events Schedule */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-surface-100 flex items-center gap-2 text-base font-bold">
              <Calendar className="text-brand-400 h-4 w-4" />
              <span>Upcoming Events Schedule</span>
            </h2>
            <Link
              href="/admin/events"
              className="text-brand-400 hover:text-brand-300 text-xs font-semibold"
            >
              View all ({totalEventsCount}) →
            </Link>
          </div>

          <div className="border-surface-800 bg-surface-900/40 divide-surface-800/60 divide-y overflow-hidden rounded-2xl border">
            {upcomingEvents.length === 0 ? (
              <div className="text-surface-400 p-8 text-center text-xs">
                No upcoming events scheduled. Click &quot;+ Create Event&quot; to schedule one.
              </div>
            ) : (
              upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="hover:bg-surface-850/40 flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-surface-800 text-surface-300 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">
                        {evt.type}
                      </span>
                      <span className="text-surface-100 text-xs font-bold">{evt.title}</span>
                    </div>
                    <div className="text-surface-400 flex items-center gap-3 text-xs">
                      <span>{formatDate(evt.startDate)}</span>
                      <span>·</span>
                      <span>{evt.city?.name ?? "India"}</span>
                      <span>·</span>
                      <span className="text-brand-400 font-medium">
                        {evt._count.registrations} registered
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/events/${evt.id}/edit`}
                      className="bg-surface-800 hover:bg-surface-700 text-surface-200 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/events/${evt.slug}`}
                      target="_blank"
                      className="text-surface-400 hover:text-surface-200 p-1.5"
                      title="Preview public page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Audit Log / Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-surface-100 flex items-center gap-2 text-base font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Audit Trail (Recent)</span>
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              All logs →
            </Link>
          </div>

          <div className="border-surface-800 bg-surface-900/40 divide-surface-800/60 divide-y rounded-2xl border p-4">
            {recentAuditLogs.length === 0 ? (
              <p className="text-surface-500 py-4 text-center text-xs">No recent audit records.</p>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="py-2.5 text-xs first:pt-0 last:pb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-surface-200 font-semibold">
                      {log.action} {log.entityType}
                    </span>
                    <span className="text-surface-500 text-[10px]">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-surface-400 text-[11px]">
                    By {log.user?.name ?? log.user?.email ?? "System"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-surface-100 flex items-center gap-2 text-base font-bold">
            <Ticket className="h-4 w-4 text-blue-400" />
            <span>Latest Registrations</span>
          </h2>
          <Link
            href="/admin/registrations"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            View all registrations →
          </Link>
        </div>

        <div className="border-surface-800 bg-surface-900/40 overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-xs">
            <thead className="border-surface-800 bg-surface-900/80 text-surface-400 border-b font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-surface-800/60 divide-y">
              {recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-surface-500 py-6 text-center">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                recentRegistrations.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-850/40 transition-colors">
                    <td className="text-surface-200 px-4 py-3 font-mono font-medium">
                      {r.registrationCode}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-surface-100 font-semibold">{r.name}</p>
                      <p className="text-surface-500 text-[11px]">{r.email}</p>
                    </td>
                    <td className="text-surface-300 max-w-xs truncate px-4 py-3">
                      {r.event.title}
                    </td>
                    <td className="text-surface-300 px-4 py-3">
                      {r.ticketType.name}
                      {Number(r.ticketType.price) > 0 && (
                        <span className="text-surface-400 ml-1 text-[10px]">
                          (₹{Number(r.ticketType.price)})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "CONFIRMED"
                            ? "success"
                            : r.status === "CANCELLED"
                              ? "destructive"
                              : "warning"
                        }
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="text-surface-500 px-4 py-3">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
