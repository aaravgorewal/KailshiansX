"use client";
// src/components/auth/UserMenu.tsx
// Minimal user menu shown in the Navbar when signed in.
// Displays avatar/initials, name, role badge, and sign-out button.

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, ChevronDown, Sparkles, Ticket } from "lucide-react";
import type { UserRole } from "@prisma/client";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
}

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  SUPER_ADMIN: { label: "Super Admin", className: "bg-red-500/20 text-red-400" },
  ADMIN: { label: "Admin", className: "bg-orange-500/20 text-orange-400" },
  JUDGE: { label: "Judge", className: "bg-purple-500/20 text-purple-400" },
  EVENT_MANAGER: { label: "Event Manager", className: "bg-yellow-500/20 text-yellow-400" },
  CAMPUS_LEAD: { label: "Campus Lead", className: "bg-green-500/20 text-green-400" },
  STATE_LEAD: { label: "State Lead", className: "bg-teal-500/20 text-teal-400" },
  CHAPTER_LEAD: { label: "Chapter Lead", className: "bg-emerald-500/20 text-emerald-400" },
  PARTNER: { label: "Partner", className: "bg-blue-500/20 text-blue-400" },
  MEMBER: { label: "Member", className: "bg-brand-500/20 text-brand-400" },
  VIEWER: { label: "Viewer", className: "bg-surface-700 text-surface-400" },
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const badge = ROLE_BADGE[user.role];
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(user.role);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        id="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        className="hover:bg-surface-800 flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="bg-brand-500/20 ring-surface-700 relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="text-brand-400 text-xs font-bold">{getInitials(user.name)}</span>
          )}
        </div>
        <span className="text-surface-200 hidden max-w-[120px] truncate text-sm font-medium sm:block">
          {user.name ?? user.email ?? "Account"}
        </span>
        <ChevronDown
          size={14}
          className={`text-surface-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="border-surface-700 bg-surface-900 animate-in fade-in slide-in-from-top-1 absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border py-1 shadow-[var(--shadow-card)] duration-150">
          {/* User info */}
          <div className="border-surface-800 border-b px-4 py-3">
            <p className="text-surface-100 truncate text-sm font-semibold">{user.name ?? "User"}</p>
            <p className="text-surface-400 mt-0.5 truncate text-xs">{user.email}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/me"
              id="link-user-me"
              onClick={() => setOpen(false)}
              className="text-surface-200 hover:bg-surface-800 flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:text-white"
            >
              <Sparkles size={16} className="text-brand-400" />
              <span>Developer Passport (/me)</span>
            </Link>

            <Link
              href="/me?tab=tickets"
              onClick={() => setOpen(false)}
              className="text-surface-300 hover:bg-surface-800 hover:text-surface-50 flex items-center gap-3 px-4 py-2 text-sm transition-colors"
            >
              <Ticket size={15} />
              <span>My Tickets & Events</span>
            </Link>

            <Link
              href="/me/bookings"
              id="link-user-bookings"
              onClick={() => setOpen(false)}
              className="text-surface-300 hover:bg-surface-800 hover:text-surface-50 flex items-center gap-3 px-4 py-2 text-sm transition-colors"
            >
              <Ticket size={15} className="text-brand-400" />
              <span>Mentor Bookings</span>
            </Link>

            <Link
              href="/me/mentor"
              id="link-user-mentor"
              onClick={() => setOpen(false)}
              className="text-surface-300 hover:bg-surface-800 hover:text-surface-50 flex items-center gap-3 px-4 py-2 text-sm transition-colors"
            >
              <Sparkles size={15} className="text-emerald-400" />
              <span>Mentor Cockpit</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-surface-300 hover:bg-surface-800 hover:text-surface-50 flex items-center gap-3 px-4 py-2 text-sm transition-colors"
              >
                <Settings size={15} />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="border-surface-800 border-t py-1">
            <button
              id="btn-signout"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
