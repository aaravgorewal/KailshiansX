// src/components/admin/AdminSidebar.tsx
// Comprehensive responsive sidebar for Admin modules from PRD §22

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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface NavGroup {
  label: string;
  items: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeVariant?: "default" | "brand" | "success" | "warning" | "destructive" | "outline";
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
    ],
  },
  {
    label: "People & Pipelines",
    items: [
      { label: "Participants", href: "/admin/participants", icon: Users },
      { label: "Campus Leads", href: "/admin/campus-leads", icon: GraduationCap },
      { label: "State Leads", href: "/admin/state-leads", icon: MapPin },
      { label: "Team Applications", href: "/admin/team-applications", icon: Briefcase },
      { label: "Collaborations", href: "/admin/collaborations", icon: Handshake },
      { label: "Sponsors & Partners", href: "/admin/sponsors", icon: Building2 },
    ],
  },
  {
    label: "Ecosystem & Content",
    items: [
      { label: "Community", href: "/admin/community", icon: Globe },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Content CMS", href: "/admin/cms", icon: FileText },
      {
        label: "Certificates",
        href: "/admin/certificates",
        icon: Award,
        badge: "Phase 2",
        badgeVariant: "brand",
      },
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
          className="bg-surface-900 border-surface-800 text-surface-200 rounded-lg border p-2 shadow-lg"
          aria-label="Toggle Admin Navigation"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-surface-950 border-surface-850/80 fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r transition-all duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="border-surface-850/80 bg-surface-950 flex h-16 items-center justify-between border-b px-4">
          <Link href="/admin" className="flex items-center gap-2.5 truncate">
            <div className="bg-brand-600 text-surface-50 shadow-brand-600/30 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black shadow-md">
              KX
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-surface-100 text-sm font-bold tracking-tight">
                  KailshiansX
                </span>
                <span className="text-brand-400 block text-[10px] font-semibold tracking-wider uppercase">
                  Control Room
                </span>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="text-surface-400 hover:text-surface-200 hover:bg-surface-900 hidden rounded-md p-1.5 transition-colors lg:flex"
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
          <div className="border-surface-850/60 bg-surface-900/40 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-surface-200 truncate text-xs font-semibold">{userName}</p>
                <span className="py-0.2 bg-brand-500/10 text-brand-400 border-brand-500/20 mt-0.5 inline-block rounded border px-1.5 font-mono text-[10px] font-medium">
                  {userRole}
                </span>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-surface-400 hover:text-brand-300 flex items-center gap-1 text-[11px]"
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
                <p className="text-surface-500 mb-1.5 px-2.5 text-[10px] font-bold tracking-wider uppercase">
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
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      active
                        ? "bg-brand-600/15 text-brand-300 border-brand-500/30 border font-semibold"
                        : "text-surface-400 hover:text-surface-100 hover:bg-surface-900/80"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        active ? "text-brand-400" : "text-surface-400 group-hover:text-surface-200"
                      }`}
                    />
                    {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!isCollapsed && item.badge && (
                      <Badge
                        variant={item.badgeVariant ?? "default"}
                        size="sm"
                        className="py-0.2 px-1.5 text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Quick Links */}
        <div className="border-surface-850/80 bg-surface-950 border-t p-3">
          <Link
            href="/admin/events/new"
            className={`bg-brand-600 hover:bg-brand-500 shadow-brand-600/20 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-md transition-all ${
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
