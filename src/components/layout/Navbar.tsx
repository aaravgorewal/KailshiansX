"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, ALL_NAV_ITEMS, type NavItem } from "@/lib/nav";
import { UserMenu } from "@/components/auth/UserMenu";
import type { UserRole } from "@prisma/client";

type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
} | null;

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-bold text-xl tracking-tight group"
      aria-label="KailshiansX home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-glow group-hover:shadow-glowAccent transition-shadow duration-300">
        <Zap size={16} strokeWidth={2.5} />
      </span>
      <span className="text-surface-50">
        Kailshians<span className="text-brand-400">X</span>
      </span>
    </Link>
  );
}

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

function DropdownMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive =
    item.children?.some((c) => pathname.startsWith(c.href)) ||
    (item.href !== "#" && pathname.startsWith(item.href));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          "text-surface-300 hover:text-surface-50 hover:bg-surface-800",
          isActive && "text-brand-400 bg-surface-800"
        )}
      >
        {item.label}
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className={cn(
            "absolute top-full left-0 mt-1 min-w-[220px] rounded-xl border border-surface-700",
            "bg-surface-900/95 backdrop-blur-md shadow-card p-2 z-50",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
          role="menu"
        >
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              role="menuitem"
              className={cn(
                "block rounded-lg px-3 py-2.5 transition-colors",
                "hover:bg-surface-800",
                pathname.startsWith(child.href) && child.href !== "/"
                  ? "text-brand-400 bg-surface-800"
                  : "text-surface-200"
              )}
            >
              <span className="block text-sm font-medium">{child.label}</span>
              {child.description && (
                <span className="block text-xs text-surface-400 mt-0.5">
                  {child.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Desktop Nav Link (no children) ──────────────────────────────────────────

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        "text-surface-300 hover:text-surface-50 hover:bg-surface-800",
        isActive && "text-brand-400 bg-surface-800"
      )}
    >
      {item.label}
    </Link>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  React.useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 max-w-[calc(100vw-3rem)]",
          "bg-surface-900 border-r border-surface-700",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-surface-400 hover:text-surface-50 hover:bg-surface-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Mobile navigation">
          {ALL_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col px-4 py-3 rounded-lg mb-0.5 transition-colors",
                "text-surface-200 hover:text-surface-50 hover:bg-surface-800",
                (item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)) &&
                  "text-brand-400 bg-surface-800"
              )}
            >
              <span className="text-sm font-medium">{item.label}</span>
              {item.description && (
                <span className="text-xs text-surface-400 mt-0.5">{item.description}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-surface-700 space-y-2">
          <Link
            href="/events"
            className="block w-full text-center rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2.5 transition-colors"
          >
            Explore Events
          </Link>
          <Link
            href="/join-team"
            className="block w-full text-center rounded-lg border border-surface-600 hover:bg-surface-800 text-surface-200 text-sm font-medium py-2.5 transition-colors"
          >
            Join Team
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar({ user }: { user: NavbarUser }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-30 transition-all duration-300",
          scrolled
            ? "bg-surface-950/95 backdrop-blur-md border-b border-surface-800 shadow-card"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left — Logo */}
            <Logo />

            {/* Center — Desktop nav (hidden on mobile) */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Primary navigation"
            >
              {PRIMARY_NAV.map((item) =>
                item.children ? (
                  <DropdownMenu key={item.href} item={item} />
                ) : (
                  <NavLink key={item.href} item={item} />
                )
              )}
            </nav>

            {/* Right — Auth + hamburger */}
            <div className="flex items-center gap-2">
              {/* Events CTA — hide when user menu takes space */}
              <Link
                href="/events"
                className={cn(
                  "hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                  "bg-brand-500 hover:bg-brand-600 text-white"
                )}
              >
                Explore Events
              </Link>

              {/* Auth: signed-in → UserMenu, guest → Sign In */}
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Link
                  href="/signin"
                  id="nav-signin-btn"
                  className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg border border-surface-700 text-sm font-medium text-surface-200 hover:border-brand-500 hover:text-brand-400 transition-all"
                >
                  Sign In
                </Link>
              )}

              {/* Hamburger — visible on < lg */}
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden rounded-lg p-2 text-surface-300 hover:text-surface-50 hover:bg-surface-800 transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
