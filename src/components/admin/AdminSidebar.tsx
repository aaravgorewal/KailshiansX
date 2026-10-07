// src/components/admin/AdminSidebar.tsx
// Responsive sidebar for Admin modules using design tokens

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  CreditCard,
  Users,
  Wrench,
  Mic,
  Layers,
  Trophy,
  Globe,
  GraduationCap,
  MapPin,
  Briefcase,
  Handshake,
  Building2,
  Image as ImageIcon,
  FileText,
  BarChart3,
  Award,
  QrCode,
  ShieldCheck,
  Mail,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Events & Series",
    items: [
      { label: "Events", href: "/admin/events", icon: Calendar },
      { label: "Registrations", href: "/admin/registrations", icon: Ticket },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Workshops", href: "/admin/workshops", icon: Wrench },
      { label: "Tech Talks", href: "/admin/tech-talks", icon: Mic },
      { label: "Meetup Series", href: "/admin/meetup-series", icon: Layers },
      { label: "Hackathon Series", href: "/admin/hackathon-series", icon: Trophy },
      { label: "Hackathons Engine", href: "/admin/hackathons", icon: Award },
      { label: "Event P&L", href: "/admin/pnl", icon: DollarSign },
    ],
  },
  {
    label: "People & Pipelines",
    items: [
      { label: "Participants", href: "/admin/participants", icon: Users },
      { label: "Leader Portal", href: "/lead", icon: Award },
      { label: "Campus Leads", href: "/admin/campus-leads", icon: GraduationCap },
      { label: "State Leads", href: "/admin/state-leads", icon: MapPin },
      { label: "Team Applications", href: "/admin/team-applications", icon: Briefcase },
      { label: "Collaborations", href: "/admin/collaborations", icon: Handshake },
      { label: "Sponsor CRM", href: "/admin/sponsors", icon: Building2 },
    ],
  },
  {
    label: "Ecosystem & Content",
    items: [
      { label: "Community", href: "/admin/community", icon: Globe },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Content CMS", href: "/admin/cms", icon: FileText },
      { label: "Certificates", href: "/admin/certificates", icon: Award },
    ],
  },
  {
    label: "Operations & Security",
    items: [
      { label: "Live QR Check-in", href: "/admin/checkin", icon: QrCode },
      { label: "Email Logs", href: "/admin/email-logs", icon: Mail },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    ],
  },
];

interface AdminSidebarProps {
  userRole?: string;
  userName?: string;
}

export function AdminSidebar({ userRole = "ADMIN", userName = "Admin User" }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileOpen(false);
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="fixed top-3 left-3 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileOpen((v) => !v)}
          className="bg-card border-border text-foreground hover:bg-muted focus-visible:ring-ring rounded-lg border p-2 transition-[background-color,opacity] focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
          aria-label="Toggle Admin Navigation"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="bg-scrim fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container: bg-card border-r border-border */}
      <aside
        className={`bg-card border-border fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r transition-all duration-150 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="border-border bg-card flex h-16 items-center justify-between border-b px-4">
          <Link
            href="/admin"
            className="focus-visible:ring-ring flex items-center gap-2.5 truncate rounded-lg transition-opacity focus-visible:ring-2 focus-visible:outline-none active:opacity-80"
          >
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
              KX
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-foreground text-sm font-bold tracking-tight">
                  KailshiansX
                </span>
                <span className="text-muted-foreground block text-xs font-medium">
                  Control Room
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring hidden rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none active:opacity-80 lg:flex"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* User Status Bar */}
        {!isCollapsed && (
          <div className="border-border bg-muted/40 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p title={userName} className="text-foreground truncate text-xs font-semibold">
                  {userName}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{userRole}</p>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1 rounded text-xs transition-opacity focus-visible:ring-1 focus-visible:outline-none active:opacity-80"
                title="Open Public Site in New Tab"
              >
                <span>Site</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              {!isCollapsed && (
                <p className="text-muted-foreground mb-1.5 px-2.5 text-xs font-semibold tracking-wider uppercase">
                  {group.label}
                </p>
              )}

              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`focus-visible:ring-ring flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-[background-color,color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 ${
                      active
                        ? "bg-muted text-foreground border-primary border-l-2 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Quick Links */}
        <div className="border-border bg-card border-t p-3">
          <Link
            href="/admin/events/new"
            className={`bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-ring flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-[background-color,opacity] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 ${
              isCollapsed ? "p-2" : ""
            }`}
            title="Create New Event"
          >
            <Calendar className="h-3.5 w-3.5" />
            {!isCollapsed && <span>Create Event</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
