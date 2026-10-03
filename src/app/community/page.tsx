import type { Metadata } from "next";
import Link from "next/link";
import { Crown, ArrowRight, Sparkles, MapPin, Building, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCommunityOverview } from "@/server/community/queries";
import { CommunityCtaGrid } from "./CommunityCtaButtons";
import { CommunityModalsClient } from "./CommunityModalsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Developer Community & Ecosystem | KailshiansX",
  description:
    "Explore the KailshiansX community hierarchy: KailshiansX -> State Leads -> City Communities -> Campus Leads -> College Chapters -> Members. Join 1,200+ builders, apply for leadership, or start a college chapter.",
  openGraph: {
    title: "Developer Community & Ecosystem | KailshiansX",
    description:
      "A living, multi-tier ecosystem of software engineers, university campus leads, regional state directors, and tech mentors.",
  },
};

// PRD §10 Community Hierarchy Architecture Nodes
const HIERARCHY_TIERS = [
  {
    tier: "01",
    role: "KailshiansX Foundation",
    entity: "Executive Council & Platform",
    scope: "National Platform & Ecosystem Architecture",
    description:
      "Coordinates national flagship hackathons (NirmanX), curriculum standards, funding allocations, industry partner programs, and platform infrastructure.",
    color: "from-brand-500 to-indigo-600",
    badgeColor: "border-brand-500/30 text-brand-300",
    perks: "National leadership, ecosystem governance, multi-state sponsorship coordination",
  },
  {
    tier: "02",
    role: "State Leads",
    entity: "Regional Ecosystem Directors",
    scope: "State & Regional Jurisdictions (e.g. Uttarakhand, Rajasthan, Punjab & Chandigarh)",
    description:
      "Executive leaders driving expansion across cities, onboarding and mentoring Campus Leads, overseeing regional meetup properties, and managing state event budgets.",
    color: "from-purple-500 to-pink-600",
    badgeColor: "border-purple-500/30 text-purple-300",
    perks:
      "Regional executive mandate, direct founder council seat, independent operational budget",
  },
  {
    tier: "03",
    role: "City Communities",
    entity: "Regional Meetup Brands",
    scope: "Flagship Urban Tech Hubs (Dehradun, Jaipur, Chandigarh, Delhi NCR)",
    description:
      "City-wide developer communities built around flagship recurring meetup brands like RaibarX, PadharoX, and TricityX connecting professionals, startups, and students.",
    color: "from-amber-500 to-rose-600",
    badgeColor: "border-amber-500/30 text-amber-300",
    perks: "Monthly expert panels, hiring networking, founder keynotes, venue partnerships",
  },
  {
    tier: "04",
    role: "Campus Leads",
    entity: "University Community Architects",
    scope: "College & University Campuses",
    description:
      "Student developers representing KailshiansX on the ground. They lead university hackathon delegations, organize hands-on technical workshops, and mentor freshmen.",
    color: "from-brand-500 to-emerald-600",
    badgeColor: "border-brand-500/30 text-brand-300",
    perks: "Official leadership credential, VIP hackathon passes, 1:1 founder mentorship, swag",
  },
  {
    tier: "05",
    role: "College Chapters",
    entity: "Campus Developer Circles",
    scope: "Academic Institutions & Student Clubs",
    description:
      "Officially recognized developer chapters embedded inside engineering colleges running study circles, project buildathons, and preparing for national hackathons.",
    color: "from-emerald-500 to-teal-600",
    badgeColor: "border-emerald-500/30 text-emerald-300",
    perks: "Official event backing, KailshiansX curriculum, cloud credits, guest speakers",
  },
  {
    tier: "06",
    role: "Members & Attendees",
    entity: "The Builder Base",
    scope: "Developers, Students, Engineers & Hackers",
    description:
      "The lifeblood of KailshiansX. Software engineers, university students, and open-source contributors attending meetups, building prototypes, and solving real-world challenges.",
    color: "from-blue-500 to-cyan-600",
    badgeColor: "border-cyan-500/30 text-cyan-300",
    perks: "Event access, team matchmaking, certificate verification, project showcase",
  },
];

// PRD §30 Progression Loop Steps
const PROGRESSION_STAGES = [
  {
    step: "01",
    title: "Attendee",
    desc: "Discovers an event, books a pass, and attends a local meetup or workshop.",
  },
  {
    step: "02",
    title: "Member",
    desc: "Joins the city chapter, joins WhatsApp/Discord, connects with local builders.",
  },
  {
    step: "03",
    title: "Contributor",
    desc: "Builds a hackathon prototype, submits code, writes takeaways, shares open source.",
  },
  {
    step: "04",
    title: "Lead",
    desc: "Applies for Campus Lead or State Lead, building and organizing for their peers.",
  },
  {
    step: "05",
    title: "Organiser",
    desc: "Co-organizes flagship series like RaibarX or NirmanX, curates speakers and sponsors.",
  },
  {
    step: "06",
    title: "Mentor / Speaker",
    desc: "Takes the main stage, conducts advanced tech talks, judges national hackathon podiums.",
  },
];

export default async function CommunityPage() {
  const { stats, stateLeads, campusLeads, cityHubs } = await getCommunityOverview();

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Global Interactive Modals Manager */}
      <CommunityModalsClient />

      {/* Hero Section */}
      <section className="border-surface-800 from-brand-950/20 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="bg-brand-500/10 pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full blur-3xl" />

        <div className="container-page relative mx-auto max-w-5xl space-y-6 px-4 text-center">
          <Badge variant="brand" className="font-mono text-xs tracking-wider uppercase">
            PRD §10 • Community Architecture
          </Badge>

          <h1 className="text-surface-50 mx-auto max-w-4xl text-3xl leading-tight font-black tracking-tight sm:text-5xl sm:leading-tight md:text-6xl">
            A Living Network of Engineers, Leads &{" "}
            <span className="from-brand-400 via-accent-300 bg-gradient-to-r to-indigo-400 bg-clip-text text-transparent">
              Regional Builders
            </span>
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            KailshiansX is not a static events calendar. It is a hierarchical, distributed developer
            movement operating across states, cities, and campus chapters.
          </p>

          {/* Impact Counters */}
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 pt-6 sm:grid-cols-3 lg:grid-cols-6">
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-brand-400 text-2xl font-black">{stats.totalBuilders}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Builders
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-purple-400">{stats.totalStateLeads}</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                State Leads
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-amber-400">{stats.totalCities}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Cities Active
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-emerald-400">
                {stats.totalCampusLeads}+
              </span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Campus Leads
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-indigo-400">{stats.totalColleges}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Colleges
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-rose-400">{stats.totalEventsHosted}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Events Hosted
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRD §10: Hierarchy Visual Section ────────────────────────────────── */}
      <section className="container-page mx-auto max-w-5xl space-y-12 px-4 py-16">
        <div className="space-y-2 text-center">
          <Badge variant="surface" className="font-mono text-[11px]">
            Structural Architecture
          </Badge>
          <h2 className="text-surface-100 text-2xl font-bold sm:text-3xl">
            The KailshiansX Community Hierarchy
          </h2>
          <p className="text-surface-400 mx-auto max-w-xl text-xs sm:text-sm">
            PRD §10 specifies our clear, decentralized hierarchy: from the foundational platform
            council to regional states, city hubs, campus chapters, and individual builders.
          </p>
        </div>

        {/* Visual Flow Diagram */}
        <div className="relative mx-auto max-w-3xl space-y-4">
          {HIERARCHY_TIERS.map((tier, index) => {
            const isLast = index === HIERARCHY_TIERS.length - 1;

            return (
              <div key={tier.tier} className="group relative">
                <div className="border-surface-800 bg-surface-900/90 hover:border-surface-600 relative z-10 space-y-4 rounded-3xl border p-6 shadow-xl backdrop-blur-sm transition-all duration-300 sm:p-7">
                  {/* Top Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-2xl bg-gradient-to-tr ${tier.color} flex items-center justify-center font-mono text-xs font-bold text-white shadow-md`}
                      >
                        {tier.tier}
                      </div>
                      <div>
                        <h3 className="text-surface-50 flex items-center gap-2 text-base font-bold sm:text-lg">
                          <span>{tier.role}</span>
                          <span className="text-surface-500 text-xs font-normal">
                            • {tier.entity}
                          </span>
                        </h3>
                        <p className="text-surface-400 text-xs">{tier.scope}</p>
                      </div>
                    </div>

                    <Badge variant="surface" className={`font-mono text-[10px] ${tier.badgeColor}`}>
                      Level {tier.tier}
                    </Badge>
                  </div>

                  {/* Body */}
                  <p className="text-surface-300 text-xs leading-relaxed">{tier.description}</p>

                  {/* Perks & Powers */}
                  <div className="border-surface-800/80 text-surface-400 flex items-center gap-2 border-t pt-3 text-[11px]">
                    <Sparkles className="text-brand-400 size-3.5 shrink-0" />
                    <span>
                      <strong>Key Mandate:</strong> {tier.perks}
                    </span>
                  </div>
                </div>

                {/* Downward Connector Arrow */}
                {!isLast && (
                  <div className="relative z-0 flex justify-center py-2">
                    <div className="flex flex-col items-center">
                      <div className="from-surface-700 to-brand-500/50 h-4 w-0.5 bg-gradient-to-b" />
                      <ChevronDown className="text-brand-400 -mt-1 size-4" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── PRD §30: The Progression Pathway ───────────────────────────────── */}
      <section className="border-surface-800 bg-surface-900/40 border-y py-16">
        <div className="container-page mx-auto max-w-5xl space-y-10 px-4">
          <div className="space-y-2 text-center">
            <Badge variant="brand" className="font-mono text-[11px]">
              Product Principle §30
            </Badge>
            <h2 className="text-surface-100 text-2xl font-bold sm:text-3xl">
              The Lifelong Builder Progression Journey
            </h2>
            <p className="text-surface-400 mx-auto max-w-xl text-xs sm:text-sm">
              Every feature on KailshiansX is engineered to move a person toward deeper
              participation. No one stays just an attendee.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {PROGRESSION_STAGES.map((stage) => (
              <div
                key={stage.step}
                className="border-surface-800 bg-surface-950/80 hover:border-brand-500/40 space-y-2 rounded-2xl border p-4 transition"
              >
                <span className="text-brand-400 font-mono text-xs font-bold">{stage.step}</span>
                <h3 className="text-surface-100 text-sm font-bold">{stage.title}</h3>
                <p className="text-surface-400 text-[11px] leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRD §10: 6 Core Action CTAs ─────────────────────────────────────── */}
      <section className="container-page mx-auto max-w-5xl space-y-10 px-4 py-16">
        <div className="space-y-2 text-center">
          <Badge variant="surface" className="font-mono text-[11px]">
            Action Funnels
          </Badge>
          <h2 className="text-surface-100 text-2xl font-bold sm:text-3xl">
            Take Your Next Step in the Ecosystem
          </h2>
          <p className="text-surface-400 mx-auto max-w-xl text-xs sm:text-sm">
            Choose your path: apply for state or campus leadership, start an accredited college
            chapter, join as a mentor, or take the speaking stage.
          </p>
        </div>

        <CommunityCtaGrid />
      </section>

      {/* ─── State Leads Directory ───────────────────────────────────────────── */}
      {stateLeads.length > 0 && (
        <section className="container-page mx-auto max-w-5xl space-y-8 px-4 py-12">
          <div className="border-surface-800 flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-surface-100 text-xl font-bold">State Leadership Directorate</h2>
              <p className="text-surface-400 text-xs">
                Regional directors overseeing multi-city developer operations
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/state-leads">
                <span>View Program</span>
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {stateLeads.map((sl) => (
              <div
                key={sl.id}
                className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6 transition hover:border-purple-500/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-950/60 text-lg font-bold text-purple-300">
                    {sl.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-surface-100 truncate text-base font-bold">{sl.name}</h3>
                      <Badge variant="success" className="text-[10px]">
                        ACTIVE
                      </Badge>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-purple-300">
                      <Crown className="size-3.5 shrink-0" />
                      <span>State Lead • {sl.state}</span>
                    </p>
                    {sl.citiesCovered && (
                      <p className="text-surface-400 flex items-center gap-1 truncate text-xs">
                        <MapPin className="size-3 shrink-0 text-rose-400" />
                        <span>Coverage: {sl.citiesCovered}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Campus Leads Directory ─────────────────────────────────────────── */}
      {campusLeads.length > 0 && (
        <section className="container-page mx-auto max-w-5xl space-y-8 px-4 py-12">
          <div className="border-surface-800 flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-surface-100 text-xl font-bold">Campus Leads & Chapters</h2>
              <p className="text-surface-400 text-xs">
                University student leaders spearheading campus coding cultures
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/campus-leads">
                <span>View Program</span>
                <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {campusLeads.map((lead) => (
              <div
                key={lead.id}
                className="border-surface-800 bg-surface-900/60 hover:border-surface-700 space-y-4 rounded-2xl border p-5 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="bg-surface-800 border-surface-700 text-brand-300 flex size-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-surface-100 truncate text-sm font-bold">{lead.name}</h3>
                    <p className="text-surface-400 flex items-center gap-1 truncate text-xs">
                      <Building className="text-surface-500 size-3 shrink-0" />
                      <span>{lead.collegeName}</span>
                    </p>
                    <p className="text-surface-500 flex items-center gap-1 truncate text-[11px]">
                      <MapPin className="size-2.5 shrink-0 text-rose-400" />
                      <span>{lead.cityName}</span>
                    </p>
                  </div>
                </div>

                <div className="border-surface-800 grid grid-cols-2 gap-2 border-t pt-3 text-center text-xs">
                  <div className="bg-surface-950/60 border-surface-800/50 rounded-xl border p-2">
                    <span className="text-brand-300 font-bold">{lead.eventsSupported}</span>
                    <span className="text-surface-500 block text-[9px] uppercase">Events Ran</span>
                  </div>
                  <div className="bg-surface-950/60 border-surface-800/50 rounded-xl border p-2">
                    <span className="font-bold text-emerald-400">{lead.referrals}+</span>
                    <span className="text-surface-500 block text-[9px] uppercase">Builders</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Active City Communities ────────────────────────────────────────── */}
      {cityHubs.length > 0 && (
        <section className="container-page mx-auto max-w-5xl space-y-8 px-4 py-12">
          <div className="border-surface-800 border-b pb-4">
            <h2 className="text-surface-100 text-xl font-bold">Active City Communities & Hubs</h2>
            <p className="text-surface-400 text-xs">
              Cities with recurring meetups, workshops, and college chapters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cityHubs.map((city) => (
              <div
                key={city.id}
                className="border-surface-800 bg-surface-900/60 hover:border-brand-500/40 space-y-1 rounded-2xl border p-4 transition"
              >
                <div className="text-surface-100 flex items-center gap-1.5 text-xs font-bold">
                  <MapPin className="size-3 shrink-0 text-rose-400" />
                  <span className="truncate">{city.name}</span>
                </div>
                <p className="text-surface-400 truncate text-[11px]">{city.state}</p>
                <div className="text-surface-500 border-surface-800/60 flex items-center justify-between border-t pt-2 text-[10px]">
                  <span>{city.collegesCount} Colleges</span>
                  <span>{city.eventsCount} Events</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
