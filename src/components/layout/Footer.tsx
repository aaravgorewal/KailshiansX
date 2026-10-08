import Link from "next/link";

const MAIN_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Refunds", href: "/refunds" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border bg-background mt-24 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Giant wordmark */}
        <div
          className="text-foreground text-left leading-none font-semibold tracking-tighter select-none"
          style={{ fontSize: "clamp(3rem, 14vw, 12rem)" }}
        >
          KailshiansX
        </div>

        {/* Tagline sentence */}
        <p className="text-muted-foreground mt-4 max-w-2xl text-left text-base sm:mt-6 sm:text-lg">
          Developer events and community by Kailshians Web Services.
        </p>

        {/* Links section */}
        <div className="border-border mt-12 flex flex-col justify-between gap-8 border-t pt-8 sm:mt-16 md:flex-row md:items-center">
          {/* Main 3 links */}
          <nav
            className="flex flex-wrap items-center gap-6 sm:gap-8"
            aria-label="Footer primary navigation"
          >
            {MAIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground hover:text-accent-text focus-visible:ring-ring rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-base"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Legal links */}
          <nav className="flex flex-wrap items-center gap-4 sm:gap-6" aria-label="Legal navigation">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="border-border text-muted-foreground mt-8 flex flex-col justify-between gap-4 border-t pt-6 font-mono text-xs sm:flex-row sm:items-center">
          <p>© {currentYear} Kailshians Web Services. All rights reserved.</p>
          <p>Built for developer communities across India.</p>
        </div>
      </div>
    </footer>
  );
}
