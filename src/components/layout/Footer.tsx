import Link from "next/link";
import { Zap } from "lucide-react";

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
    <footer className="border-t border-surface-800 bg-surface-950 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl tracking-tight"
              aria-label="KailshiansX home"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Zap size={16} strokeWidth={2.5} />
              </span>
              <span className="text-surface-50">
                Kailshians<span className="text-brand-400">X</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed max-w-[220px]">
              Developer events &amp; community platform by Kailshians Web Services.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIALS.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-surface-400 hover:text-brand-400 transition-colors text-xs font-medium"
                >
                  {label.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400 mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-300 hover:text-surface-50 transition-colors"
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
        <div className="mt-12 pt-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <p>
            &copy; {year} Kailshians Web Services. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-surface-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-surface-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
