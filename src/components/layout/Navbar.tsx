"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import type { UserRole } from "@prisma/client";

const UserMenu = dynamic(() => import("@/components/auth/UserMenu").then((m) => m.UserMenu), {
  ssr: false,
});

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  } | null;
}

const NAV_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Community", href: "/community" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const closeBtnRef = React.useRef<HTMLButtonElement>(null);

  // Scroll detection: 1px border-b border-border only after scroll > 8px
  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Body scroll lock when mobile sheet is open
  React.useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  // Focus trap & Escape key listener for mobile sheet
  React.useEffect(() => {
    if (!mobileOpen) return;

    // Focus close button on open
    closeBtnRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        menuTriggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        if (!sheetRef.current) return;
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
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
  }, [mobileOpen]);

  const handleCloseSheet = () => {
    setMobileOpen(false);
    menuTriggerRef.current?.focus();
  };

  return (
    <>
      <header
        className={cn(
          "bg-background/85 fixed inset-x-0 top-0 z-30 h-16 backdrop-blur-sm transition-colors duration-150",
          isScrolled ? "border-border border-b" : "border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Wordmark KailshiansX */}
          <Link
            href="/"
            className="text-foreground focus-visible:ring-ring rounded-sm text-base font-semibold tracking-tight transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:outline-none"
          >
            KailshiansX
          </Link>

          {/* Center: Events, Community, Gallery, About (Desktop) */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-visible:ring-ring rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    isActive
                      ? "text-foreground font-medium underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground font-medium"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: ThemeToggle, Sign in / Avatar Menu, Partner with us (Desktop) */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {user ? (
              <UserMenu user={user} />
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/signin">Sign in</Link>
              </Button>
            )}

            <Button asChild variant="primary" size="sm">
              <Link href="/partner">Partner with us</Link>
            </Button>
          </div>

          {/* Mobile Right Controls: ThemeToggle + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-sheet"
              className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <MenuIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Sheet */}
      {mobileOpen && (
        <div
          id="mobile-navigation-sheet"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="bg-background fixed inset-0 z-50 flex flex-col justify-between p-6"
        >
          {/* Top Bar of Sheet: Wordmark + ThemeToggle + Close Button */}
          <div className="border-border flex items-center justify-between border-b pb-4">
            <Link
              href="/"
              onClick={handleCloseSheet}
              className="text-foreground text-base font-semibold tracking-tight"
            >
              KailshiansX
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleCloseSheet}
                aria-label="Close navigation menu"
                className="border-border bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Main Links: Big Display Size */}
          <nav className="flex flex-col gap-6 py-8" aria-label="Mobile primary navigation">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleCloseSheet}
                  className={cn(
                    "focus-visible:ring-ring rounded-md text-3xl font-semibold tracking-tight transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-4xl",
                    isActive
                      ? "text-foreground underline underline-offset-8"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/partner"
              onClick={handleCloseSheet}
              className={cn(
                "focus-visible:ring-ring rounded-md text-3xl font-semibold tracking-tight transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-4xl",
                pathname === "/partner"
                  ? "text-foreground underline underline-offset-8"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Partner with us
            </Link>
          </nav>

          {/* Bottom Actions */}
          <div className="border-border space-y-3 border-t pt-6">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="text-muted-foreground truncate font-mono text-xs">
                    Signed in as{" "}
                    <span className="text-foreground font-semibold">{user.name ?? user.email}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="secondary" size="md">
                    <Link href="/me" onClick={handleCloseSheet}>
                      Dashboard
                    </Link>
                  </Button>
                  {["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"].includes(user.role) && (
                    <Button asChild variant="secondary" size="md">
                      <Link href="/admin" onClick={handleCloseSheet}>
                        Admin
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button asChild variant="ghost" size="lg" className="w-full">
                <Link href="/signin" onClick={handleCloseSheet}>
                  Sign in
                </Link>
              </Button>
            )}

            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href="/partner" onClick={handleCloseSheet}>
                Partner with us
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
