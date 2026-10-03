// src/app/admin/page.tsx
// Admin dashboard — protected by proxy.ts (ADMIN/SUPER_ADMIN/EVENT_MANAGER only)
// Uses requireAdmin() for an extra server-side check on top of the proxy guard.

import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/require-role";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin Dashboard | KailshiansX",
};

export default async function AdminDashboardPage() {
  // Double-check role in the server component (defense in depth)
  const session = await requireAdmin();

  const [eventCount, registrationCount, applicationCount, userCount] = await Promise.all([
    db.event.count({ where: { deletedAt: null } }),
    db.registration.count({ where: { deletedAt: null } }),
    db.teamApplication.count(),
    db.user.count({ where: { deletedAt: null } }),
  ]);

  const stats = [
    { label: "Total Events", value: eventCount, href: "/admin/events" },
    { label: "Registrations", value: registrationCount, href: "/admin/registrations" },
    { label: "Team Applications", value: applicationCount, href: "/admin/applications" },
    { label: "Users", value: userCount, href: "/admin/users" },
  ];

  return (
    <div className="container-page section-spacing">
      {/* Header */}
      <div className="mb-10">
        <p className="text-brand-400 mb-2 text-xs font-semibold tracking-widest uppercase">Admin</p>
        <h1 className="text-surface-50 text-3xl font-bold">Dashboard</h1>
        <p className="text-surface-400 mt-2">
          Welcome back,{" "}
          <span className="text-surface-200 font-medium">
            {session.user.name ?? session.user.email}
          </span>
          . Role: <span className="text-brand-400 font-mono text-xs">{session.user.role}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <a
            key={s.label}
            href={s.href}
            className="card-glow hover:border-brand-600 group rounded-xl p-6 transition-all"
          >
            <p className="text-surface-50 group-hover:text-brand-400 text-3xl font-bold transition-colors">
              {s.value.toLocaleString()}
            </p>
            <p className="text-surface-400 mt-1 text-sm">{s.label}</p>
          </a>
        ))}
      </div>

      {/* Quick links */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/checkin", label: "Live QR Check-in Scanner" },
          { href: "/admin/events/new", label: "Create New Event" },
          { href: "/admin/campus-leads", label: "Campus Lead Applications" },
          { href: "/admin/collaborations", label: "Collaboration Pipeline" },
          { href: "/admin/gallery", label: "Gallery Manager" },
          { href: "/admin/team-applications", label: "Team Applications" },
          { href: "/admin/audit-log", label: "Audit Log" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="border-surface-700 hover:border-brand-600 hover:bg-brand-500/5 text-surface-300 hover:text-surface-50 flex items-center justify-between rounded-xl border px-5 py-4 text-sm font-medium transition-all"
          >
            {link.label}
            <span className="text-surface-600 group-hover:text-brand-400">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
