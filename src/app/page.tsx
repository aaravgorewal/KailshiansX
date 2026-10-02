import type { Metadata } from "next";
import { Zap, ArrowRight, Calendar, Users, Code2, MapPin } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KailshiansX — Developer Events & Community",
  description:
    "Discover hackathons, meetups, workshops, tech talks and community programs. Join the KailshiansX developer community.",
};

const STATS = [
  { label: "Events Hosted", value: "50+" },
  { label: "Community Members", value: "2,000+" },
  { label: "Cities Covered", value: "10+" },
  { label: "Campus Chapters", value: "15+" },
];

const HIGHLIGHTS = [
  {
    icon: Calendar,
    title: "Events & Workshops",
    description: "Hackathons, meetups, tech talks and workshops across India.",
    href: "/events",
  },
  {
    icon: Users,
    title: "Community Programs",
    description: "Campus Leads and State Leads shaping developer communities.",
    href: "/community",
  },
  {
    icon: Code2,
    title: "Builder Series",
    description: "NirmanX, RaibarX, TricityX — recurring event properties.",
    href: "/meetup-series",
  },
  {
    icon: MapPin,
    title: "Collaborations",
    description: "Partner with us as a college, community, venue or sponsor.",
    href: "/collaborations",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-surface-950 pt-20 pb-24 sm:pt-28 sm:pb-32">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(61,97,252,0.4) 0%, rgba(139,61,255,0.2) 50%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        <div className="container-page relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400 mb-8">
            <Zap size={14} className="text-brand-400" />
            Developer Events. Builder Communities. Real Connections.
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-surface-50">Where Developers</span>
            <br />
            <span className="gradient-text">Discover, Connect & Grow</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-400 leading-relaxed">
            KailshiansX is the developer events &amp; community platform by Kailshians Web
            Services. Hackathons, meetups, workshops, tech talks, campus leads and more —
            all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events"
              id="hero-explore-events"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-glow hover:shadow-glow-accent transition-all duration-200"
            >
              Explore Events
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/community"
              id="hero-join-community"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-600 hover:border-brand-500 bg-surface-900 hover:bg-surface-800 px-7 py-3.5 text-base font-semibold text-surface-200 transition-all duration-200"
            >
              Join Community
            </Link>
            <Link
              href="/collaborations"
              id="hero-partner"
              className="inline-flex items-center gap-2 rounded-xl border border-surface-700 hover:border-accent-500 px-7 py-3.5 text-base font-semibold text-surface-300 transition-all duration-200"
            >
              Partner With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-surface-800 bg-surface-900/50">
        <div className="container-page py-12 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-1 text-sm text-surface-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Highlights ────────────────────────────────────────────────────── */}
      <section className="section-spacing container-page">
        <h2 className="text-3xl font-bold text-surface-50 mb-2">What We Do</h2>
        <p className="text-surface-400 mb-10">
          Every feature moves you one step closer to the community.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, title, description, href }) => (
            <Link
              key={href}
              href={href}
              className="card-glow p-6 group"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 group-hover:bg-brand-500/20 transition-colors">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-surface-100 mb-1">{title}</h3>
              <p className="text-sm text-surface-400 leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="section-spacing container-page text-center">
        <div className="mx-auto max-w-2xl rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-950/50 to-accent-950/30 p-10 sm:p-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-50 mb-4">
            Ready to be part of the movement?
          </h2>
          <p className="text-surface-400 mb-8 leading-relaxed">
            Attendee → Member → Contributor → Lead → Organiser → Mentor/Speaker.
            Your journey starts here.
          </p>
          <Link
            href="/join-team"
            id="final-cta-join"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-glow transition-all"
          >
            Join The Team <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
