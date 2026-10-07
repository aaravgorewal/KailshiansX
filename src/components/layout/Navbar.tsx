"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, ALL_NAV_ITEMS, type NavItem } from "@/lib/nav";
import { UserMenu } from "@/components/auth/UserMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { UserRole } from "@prisma/client";

type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
} | null;

// ─── Wordmark ─────────────────────────────────────────────────────────────────

function Wordmark() {
  return (
    <Link
      href="/"
      className="text-foreground text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
      aria-label="KailshiansX home"
    >
      KailshiansX
    </Link>
  );
}

// ─── Desktop Dropdown Menu ───────────────────────────────────────────────────

function DesktopDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isActive =
    item.children?.some((c) => (c.href === "/" ? pathname === "/" : pathname.startsWith(c.href))) ||
    (item.href !== "#" && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)));

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          if (e.detail === 0) {
            setOpen((prev) => !prev);
          } else {
            setOpen(true);
          }
        }}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "focus-visible:ring-ring flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
          isActive
            ? "text-foreground underline underline-offset-4"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={14}
          className={cn("transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="border-border bg-card text-card-foreground animate-in fade-in-0 absolute top-full left-0 z-50 mt-1 min-w-[220px] rounded-lg border p-1.5 duration-150"
        >
          {item.children?.map((child) => {
            const isChildActive =
              child.href === "/" ? pathname === "/" : pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                role="menuitem"
                className={cn(
                  "focus-visible:ring-ring block rounded-md px-3 py-2 text-sm transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
                  isChildActive
                    ? "bg-muted/60 text-foreground font-medium underline underline-offset-4"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span className="block">{child.label}</span>
                {child.description && (
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {child.description}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Desktop Nav Link (Direct) ────────────────────────────────────────────────

function DesktopNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "focus-visible:ring-ring rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
        isActive
          ? "text-foreground underline underline-offset-4"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
  user,
}: {
  open: boolean;
  onClose: () => void;
  user?: NavbarUser;
}) {
  const pathname = usePathname();
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Lock body scroll while open
  React.useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Close when pathname changes
  React.useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Focus trap & Escape key listener
  React.useEffect(() => {
    if (!open) return;

    // Focus close button on open
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!drawerRef.current) return;
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-[var(--scrim)] backdrop-blur-sm transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={cn(
          "border-border bg-background fixed inset-y-0 left-0 z-50 flex h-full w-80 max-w-[calc(100vw-3rem)] flex-col border-r transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <Wordmark />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="text-foreground hover:bg-muted rounded-lg p-2 transition-[background-color] duration-150"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          {ALL_NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "mb-0.5 flex flex-col rounded-lg px-4 py-2.5 transition-[background-color,color] duration-150",
                  isActive
                    ? "bg-muted/50 text-foreground font-medium underline underline-offset-4"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="text-sm font-medium">{item.label}</span>
                {item.description && (
                  <span className="text-muted-foreground mt-0.5 text-xs">{item.description}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer CTAs */}
        <div className="border-border space-y-2 border-t px-5 py-4">
          {user ? (
            <Link
              href="/me"
              onClick={onClose}
              className="bg-primary text-primary-foreground hover:bg-primary-hover block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-[background-color] duration-150"
            >
              Developer Passport (/me)
            </Link>
          ) : (
            <Link
              href="/signin"
              onClick={onClose}
              className="bg-primary text-primary-foreground hover:bg-primary-hover block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-[background-color] duration-150"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/events"
            onClick={onClose}
            className="border-border bg-background text-foreground hover:bg-muted block w-full rounded-lg border py-2.5 text-center text-sm font-medium transition-[background-color] duration-150"
          >
            Explore Events
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export function Navbar({ user }: { user: NavbarUser }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <>
      <header className="border-border bg-background/90 fixed inset-x-0 top-0 z-30 h-16 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left — Wordmark */}
          <Wordmark />

          {/* Center — Desktop links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {PRIMARY_NAV.map((item) =>
              item.children ? (
                <DesktopDropdown key={item.href} item={item} />
              ) : (
                <DesktopNavLink key={item.href} item={item} />
              )
            )}
          </nav>

          {/* Right — ThemeToggle + Auth + Mobile controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Signed-in user menu OR Sign In */}
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                href="/signin"
                id="nav-signin-btn"
                className="focus-visible:ring-ring text-foreground hover:bg-muted hidden items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-[background-color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            {/* Desktop Explore Events CTA */}
            <Link
              href="/events"
              className="focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary-hover hidden items-center justify-center rounded-lg px-3.5 py-1.5 text-sm font-medium transition-[background-color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 sm:inline-flex"
            >
              Explore Events
            </Link>

            {/* Mobile: compact "Events" button before the hamburger */}
            <Link
              href="/events"
              className="focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium transition-[background-color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 sm:hidden"
            >
              Events
            </Link>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              className="focus-visible:ring-ring text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg p-2 transition-[background-color] duration-150 focus-visible:ring-2 focus-visible:outline-none active:opacity-80 lg:hidden"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  );
}
