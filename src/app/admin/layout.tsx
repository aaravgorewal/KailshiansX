// src/app/admin/layout.tsx
// Root Admin layout protecting all /admin/* routes with requireAdmin()
// Renders the responsive AdminSidebar and main control panel shell.

import * as React from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Control Room | KailshiansX",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="bg-surface-950 text-surface-100 flex min-h-screen">
      {/* Sidebar navigation */}
      <AdminSidebar
        userRole={session.user.role}
        userName={session.user.name ?? session.user.email ?? "Admin"}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top Header Bar */}
        <header className="border-surface-850/80 bg-surface-950/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6 lg:px-8">
          {/* Left: Mobile spacer + Section title indicator */}
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-surface-400 font-mono text-xs font-medium">
              PRD §22 Control Center
            </span>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-3">
            <a
              href="/admin/checkin"
              className="border-surface-700 bg-surface-900/60 hover:bg-surface-800 text-surface-200 hidden items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors sm:inline-flex"
            >
              <span>Scan Passes</span>
            </a>
            <a
              href="/admin/events/new"
              className="bg-brand-600 hover:bg-brand-500 shadow-brand-600/30 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <span>+ New Event</span>
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
