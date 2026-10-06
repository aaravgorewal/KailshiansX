// src/app/admin/layout.tsx
// Root Admin layout protecting all /admin/* routes with requireAdmin()
// Renders the responsive AdminSidebar and main control panel shell with ThemeToggle.

import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

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
    <div className="bg-background text-foreground flex min-h-screen">
      {/* Sidebar navigation */}
      <AdminSidebar
        userRole={session.user.role}
        userName={session.user.name ?? session.user.email ?? "Admin"}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top Header Bar with ThemeToggle */}
        <header className="border-border bg-card/90 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          {/* Left: Mobile spacer + Section title */}
          <div className="flex items-center gap-2 pl-10 lg:pl-0">
            <span className="text-foreground text-sm font-semibold">Admin Control Room</span>
          </div>

          {/* Right: Quick actions + ThemeToggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Link href="/admin/checkin">Scan Passes</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/admin/events/new">+ New Event</Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
