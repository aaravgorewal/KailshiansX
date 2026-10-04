"use client";
// src/components/auth/UserMenu.tsx
// Minimal user menu shown in the Navbar when signed in.
// Restyled to semantic design tokens (no hardcoded palette colors).

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, ChevronDown, User, Ticket, Compass } from "lucide-react";
import type { UserRole } from "@prisma/client";

interface Props {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  JUDGE: "Judge",
  EVENT_MANAGER: "Event Manager",
  CAMPUS_LEAD: "Campus Lead",
  STATE_LEAD: "State Lead",
  CHAPTER_LEAD: "Chapter Lead",
  PARTNER: "Partner",
  MEMBER: "Member",
  VIEWER: "Viewer",
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
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
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
        className="text-foreground hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1.5 transition-[background-color] duration-150"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="border-border bg-muted relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="text-foreground text-xs font-semibold">{getInitials(user.name)}</span>
          )}
        </div>
        <span className="text-foreground hidden max-w-[120px] truncate text-sm font-medium sm:block">
          {user.name ?? user.email ?? "Account"}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="border-border bg-card text-card-foreground animate-in fade-in-0 absolute top-full right-0 z-50 mt-2 w-64 rounded-lg border p-1 duration-150">
          {/* User info */}
          <div className="border-border border-b px-3 py-2.5">
            <p className="text-foreground truncate text-sm font-semibold">{user.name ?? "User"}</p>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{user.email}</p>
            <span className="border-border bg-muted text-muted-foreground mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium">
              {roleLabel}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/me"
              id="link-user-me"
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background-color] duration-150"
            >
              <User size={15} className="text-muted-foreground" />
              <span>Developer Passport (/me)</span>
            </Link>

            <Link
              href="/me?tab=tickets"
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background-color] duration-150"
            >
              <Ticket size={15} className="text-muted-foreground" />
              <span>My Tickets & Events</span>
            </Link>

            <Link
              href="/me/bookings"
              id="link-user-bookings"
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background-color] duration-150"
            >
              <Ticket size={15} className="text-muted-foreground" />
              <span>Mentor Bookings</span>
            </Link>

            <Link
              href="/me/mentor"
              id="link-user-mentor"
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background-color] duration-150"
            >
              <Compass size={15} className="text-muted-foreground" />
              <span>Mentor Cockpit</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background-color] duration-150"
              >
                <Settings size={15} className="text-muted-foreground" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* Sign out */}
          <div className="border-border mt-1 border-t pt-1">
            <button
              id="btn-signout"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="text-destructive hover:bg-muted flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-[background-color] duration-150"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
