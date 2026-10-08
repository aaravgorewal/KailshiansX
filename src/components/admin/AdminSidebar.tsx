// src/components/admin/AdminSidebar.tsx
// Minimal left sidebar for Admin shell: Events, Registrations, Payments, Applications, Gallery, Content

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Ticket,
  CreditCard,
  Users,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Registrations", href: "/admin/registrations", icon: Ticket },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Applications", href: "/admin/applications", icon: Users },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Content", href: "/admin/cms", icon: FileText },
];

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({
  userRole = "ADMIN",
  userName = "Admin User",
}: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
  }

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="fixed top-2.5 left-3 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileOpen((v) => !v)}
          className="bg-card border-border text-foreground hover:bg-muted focus-visible:ring-ring rounded-lg border p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Toggle Admin Navigation"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-card border-border fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r transition-all duration-150 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-16" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="border-border bg-card flex h-14 items-center justify-between border-b px-4">
          <Link
            href="/admin"
            className="focus-visible:ring-ring flex items-center gap-2.5 truncate rounded-lg transition-opacity focus-visible:ring-2 focus-visible:outline-none"
          >
            <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
              KX
            </div>
            {!isCollapsed && (
              <span className="text-foreground text-sm font-semibold tracking-tight">Admin</span>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring hidden rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none lg:flex"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items (Events, Registrations, Payments, Applications, Gallery, Content) */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`focus-visible:ring-ring flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  active
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {!isCollapsed && (
          <div className="border-border border-t p-3">
            <div className="text-foreground truncate text-xs font-semibold">{userName}</div>
            <div className="text-muted-foreground text-xs uppercase">{userRole}</div>
          </div>
        )}
      </aside>
    </>
  );
}
