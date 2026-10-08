// src/app/admin/layout.tsx
// Root Admin layout protecting all /admin/* routes with requireAdmin()
// Renders left sidebar and top bar with ThemeToggle + user.

import * as React from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth/require-role";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserMenu } from "@/components/auth/UserMenu";

export const metadata: Metadata = {
  title: "Admin | KailshiansX",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      {/* Left sidebar: Events, Registrations, Payments, Applications, Gallery, Content */}
      <AdminSidebar
        userRole={session.user.role}
        userName={session.user.name ?? session.user.email ?? "Admin"}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top bar with ThemeToggle + user */}
        <header className="border-border bg-background/95 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-2 pl-10 lg:pl-0">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu user={session.user} />
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
