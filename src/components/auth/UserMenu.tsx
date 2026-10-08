"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, LayoutDashboard, Shield, ChevronDown } from "lucide-react";
import type { UserRole } from "@prisma/client";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const isAdmin = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(user.role);

  // Close on outside click
  React.useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  // Keyboard navigation & Escape handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        id="user-menu-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="User account menu"
        className="hover:bg-muted focus-visible:ring-ring flex items-center gap-2 rounded-lg p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="border-border bg-muted relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="text-foreground font-mono text-xs font-semibold">
              {getInitials(user.name)}
            </span>
          )}
        </div>
        <span className="text-foreground hidden max-w-[120px] truncate text-xs font-medium sm:inline-block">
          {user.name ?? user.email ?? "Account"}
        </span>
        <ChevronDown
          className={`text-muted-foreground size-3.5 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-trigger"
          className="border-border bg-card absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg border p-1 shadow-none focus:outline-none"
        >
          {/* User brief header */}
          <div className="border-border border-b px-3 py-2">
            <p className="text-foreground truncate text-xs font-semibold">{user.name ?? "User"}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>

          <div className="py-1">
            {/* Dashboard */}
            <Link
              href="/me"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-foreground hover:bg-muted focus-visible:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none"
            >
              <LayoutDashboard className="text-muted-foreground size-3.5" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>

            {/* Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-muted focus-visible:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none"
              >
                <Shield className="text-muted-foreground size-3.5" aria-hidden="true" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Sign Out */}
          <div className="border-border border-t pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                const { signOut } = await import("next-auth/react");
                signOut({ callbackUrl: "/" });
              }}
              className="text-destructive hover:bg-muted focus-visible:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
