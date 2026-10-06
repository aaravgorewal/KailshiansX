// src/app/admin/page.tsx
// Admin Dashboard Home with key numbers (registrations, revenue, pending applications, upcoming events)

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
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusCell } from "@/components/admin/StatusCell";

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
      <div className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold">Control Room</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">{session.user.role}</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Real-time telemetry across developer events, ticket pipelines, payments, and candidate
            dossiers.
          </p>
        </div>

        {/* Quick jump */}
        <div className="flex items-center gap-2">
          <Button asChild variant="primary" size="sm">
            <Link href="/admin/events/new">+ Create Event</Link>
          </Button>
        </div>
      </div>

      {/* 4 Key Numbers (Registrations, Revenue, Pending Applications, Upcoming Events) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Registrations */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Total Registrations
            </span>
            <Ticket className="text-primary h-5 w-5" />
          </div>
          <p className="text-foreground text-3xl font-bold tracking-tight">
            {totalRegistrations.toLocaleString()}
          </p>
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
            <span>Passes generated</span>
            <Link
              href="/admin/registrations"
              className="text-primary flex items-center gap-0.5 font-medium hover:underline"
            >
              View passes <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* 2. Revenue */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Total Revenue
            </span>
            <IndianRupee className="text-primary h-5 w-5" />
          </div>
          <p className="text-foreground text-3xl font-bold tracking-tight">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
            <span>Captured payments</span>
            <Link
              href="/admin/payments"
              className="text-primary flex items-center gap-0.5 font-medium hover:underline"
            >
              Payments <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* 3. Pending Applications */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Pending Applications
            </span>
            <Briefcase className="text-primary h-5 w-5" />
          </div>
          <p className="text-foreground text-3xl font-bold tracking-tight">
            {totalPendingApplications.toLocaleString()}
          </p>
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
            <span>Requires triage</span>
            <Link
              href="/admin/team-applications"
              className="text-primary flex items-center gap-0.5 font-medium hover:underline"
            >
              Triage now <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* 4. Upcoming Events */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Upcoming Events
            </span>
            <Calendar className="text-primary h-5 w-5" />
          </div>
          <p className="text-foreground text-3xl font-bold tracking-tight">
            {upcomingEvents.length.toLocaleString()}
          </p>
          <div className="text-muted-foreground mt-3 flex items-center justify-between text-xs">
            <span>{totalEventsCount} lifetime events</span>
            <Link
              href="/admin/events"
              className="text-primary flex items-center gap-0.5 font-medium hover:underline"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Pipeline Triage Breakdown */}
      <Card className="p-5">
        <h3 className="text-foreground mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
          <span>Active Pipeline Triage</span>
          <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
            {totalPendingApplications} awaiting review
          </span>
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link
            href="/admin/team-applications"
            className="border-border bg-background hover:bg-muted flex flex-col justify-between rounded-lg border p-3.5 transition-colors"
          >
            <span className="text-muted-foreground text-xs font-medium">Team Applications</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">{pendingTeamApps}</span>
              <span className="text-muted-foreground text-xs">New / Review</span>
            </div>
          </Link>

          <Link
            href="/admin/campus-leads"
            className="border-border bg-background hover:bg-muted flex flex-col justify-between rounded-lg border p-3.5 transition-colors"
          >
            <span className="text-muted-foreground text-xs font-medium">Campus Leads</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">{pendingCampusApps}</span>
              <span className="text-muted-foreground text-xs">Applied / Screening</span>
            </div>
          </Link>

          <Link
            href="/admin/state-leads"
            className="border-border bg-background hover:bg-muted flex flex-col justify-between rounded-lg border p-3.5 transition-colors"
          >
            <span className="text-muted-foreground text-xs font-medium">State Leads</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">{pendingStateApps}</span>
              <span className="text-muted-foreground text-xs">Applied / Screening</span>
            </div>
          </Link>

          <Link
            href="/admin/collaborations"
            className="border-border bg-background hover:bg-muted flex flex-col justify-between rounded-lg border p-3.5 transition-colors"
          >
            <span className="text-muted-foreground text-xs font-medium">
              Partnerships / Collabs
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-foreground text-2xl font-bold">{pendingCollabLeads}</span>
              <span className="text-muted-foreground text-xs">Leads / Discussion</span>
            </div>
          </Link>
        </div>
      </Card>

      {/* Main Two-Column Section: Upcoming Events & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Upcoming Events Schedule */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <Calendar className="text-primary h-4 w-4" />
              <span>Upcoming Events Schedule</span>
            </h2>
            <Link href="/admin/events" className="text-primary text-xs font-medium hover:underline">
              View all ({totalEventsCount}) →
            </Link>
          </div>

          <Card className="divide-border divide-y p-0">
            {upcomingEvents.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center text-xs">
                No upcoming events scheduled. Click &quot;+ Create Event&quot; to schedule one.
              </div>
            ) : (
              upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="hover:bg-muted flex flex-col gap-3 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium uppercase">
                        {evt.type}
                      </span>
                      <span className="text-foreground text-xs font-semibold">{evt.title}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span>{formatDate(evt.startDate)}</span>
                      <span>·</span>
                      <span>{evt.city?.name ?? "India"}</span>
                      <span>·</span>
                      <span className="text-foreground font-medium">
                        {evt._count.registrations} registered
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/admin/events/${evt.id}/edit`}>Edit</Link>
                    </Button>
                    <Link
                      href={`/events/${evt.slug}`}
                      target="_blank"
                      className="text-muted-foreground hover:text-foreground p-1.5"
                      title="Preview public page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Right Column: Recent Audit Log / Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="text-primary h-4 w-4" />
              <span>Audit Trail (Recent)</span>
            </h2>
            <Link
              href="/admin/audit-logs"
              className="text-primary text-xs font-medium hover:underline"
            >
              All logs →
            </Link>
          </div>

          <Card className="divide-border divide-y p-4">
            {recentAuditLogs.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-xs">
                No recent audit records.
              </p>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log.id} className="py-2.5 text-xs first:pt-0 last:pb-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-foreground font-semibold">
                      {log.action} {log.entityType}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    By {log.user?.name ?? log.user?.email ?? "System"}
                  </p>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Ticket className="text-primary h-4 w-4" />
            <span>Latest Registrations</span>
          </h2>
          <Link
            href="/admin/registrations"
            className="text-primary text-xs font-medium hover:underline"
          >
            View all registrations →
          </Link>
        </div>

        <div className="border-border bg-card overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-card text-muted-foreground sticky top-0 z-10 border-b font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Attendee</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted-foreground py-6 text-center">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((r) => (
                    <tr key={r.id} className="hover:bg-muted transition-colors">
                      <td className="text-foreground px-4 py-3 font-mono font-medium">
                        {r.registrationCode}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground font-semibold">{r.name}</p>
                        <p className="text-muted-foreground text-xs">{r.email}</p>
                      </td>
                      <td className="text-foreground max-w-xs truncate px-4 py-3">
                        {r.event.title}
                      </td>
                      <td className="text-foreground px-4 py-3">
                        {r.ticketType.name}
                        {Number(r.ticketType.price) > 0 && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            (₹{Number(r.ticketType.price)})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusCell status={r.status} />
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
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
    </div>
  );
}
