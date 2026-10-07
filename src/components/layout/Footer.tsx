import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    heading: "Events",
    links: [
      { label: "All Events", href: "/events" },
      { label: "Workshops", href: "/workshops" },
      { label: "Tech Talks", href: "/tech-talks" },
      { label: "Meetup Series", href: "/meetup-series" },
      { label: "Hackathon Series", href: "/hackathon-series" },
    ],
  },
  {
    heading: "Community",
    links: [
      { label: "Community Hub", href: "/community" },
      { label: "Campus Leads", href: "/campus-leads" },
      { label: "State Leads", href: "/state-leads" },
      { label: "Collaborations", href: "/collaborations" },
      { label: "Join Team", href: "/join-team" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Who We Are", href: "/who-we-are" },
      { label: "Core Team", href: "/core-team" },
      { label: "Founder", href: "/founder" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
];

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/kailshians" },
  { label: "X (Twitter)", href: "https://twitter.com/kailshiansx" },
  { label: "LinkedIn", href: "https://linkedin.com/company/kailshiansx" },
  { label: "Instagram", href: "https://instagram.com/kailshiansx" },
  { label: "YouTube", href: "https://youtube.com/@kailshiansx" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-background mt-24 border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-foreground text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
              aria-label="KailshiansX home"
            >
              KailshiansX
            </Link>
            <p className="text-muted-foreground max-w-[240px] text-sm leading-relaxed">
              Developer events &amp; community platform by Kailshians Web Services.
            </p>
            {/* Socials */}
            <div className="flex flex-wrap items-center gap-3">
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="focus-visible:ring-ring text-muted-foreground hover:text-foreground rounded text-xs font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
                >
                  {label.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>

          {/* 3 Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-foreground mb-4 text-xs font-semibold tracking-wider uppercase">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-visible:ring-ring text-muted-foreground hover:text-foreground rounded text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-border text-muted-foreground mt-12 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row">
          <p>&copy; {year} Kailshians Web Services. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/privacy"
              className="focus-visible:ring-ring hover:text-foreground rounded transition-colors focus-visible:ring-1 focus-visible:outline-none"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="focus-visible:ring-ring hover:text-foreground rounded transition-colors focus-visible:ring-1 focus-visible:outline-none"
            >
              Terms of Service
            </Link>
            <Link
              href="/refunds"
              className="focus-visible:ring-ring hover:text-foreground rounded transition-colors focus-visible:ring-1 focus-visible:outline-none"
            >
              Refund &amp; Cancellation
            </Link>
            <Link
              href="/contact"
              className="focus-visible:ring-ring hover:text-foreground rounded transition-colors focus-visible:ring-1 focus-visible:outline-none"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
