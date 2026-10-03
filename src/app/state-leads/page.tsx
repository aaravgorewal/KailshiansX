import type { Metadata } from "next";
import Link from "next/link";
import { Crown, MapPin, ArrowRight, ShieldCheck, Globe, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { StateLeadFormClient } from "./StateLeadFormClient";
import { getCommunityOverview } from "@/server/community/queries";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "State Lead Program | Lead Regional Ecosystem Expansion | KailshiansX",
  description:
    "Apply to become a KailshiansX State Lead. Coordinate regional developer expansion, onboard campus leads, oversee regional meetup properties, and represent KailshiansX across cities in your state.",
  alternates: {
    canonical: `${APP_URL}/state-leads`,
  },
  openGraph: {
    title: "State Lead Program | KailshiansX",
    description:
      "Coordinate developer community expansion across cities and campuses in your state. Identify campus leads, support local events, and drive ecosystem growth.",
    url: `${APP_URL}/state-leads`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "State Lead Program | KailshiansX",
    description: "Lead regional developer expansion across campuses and cities in your state.",
    images: ["/og-image.png"],
  },
};

const STATE_WORKFLOW_STEPS = [
  {
    step: "01",
    status: "APPLIED",
    title: "Executive Dossier Logged",
    description:
      "Submit your engineering background, community organizing track record, and state expansion roadmap.",
  },
  {
    step: "02",
    status: "SCREENING",
    title: "Executive Review",
    description:
      "The Founder & Steering Committee assess your proven ability to lead across multiple cities and institutions.",
  },
  {
    step: "03",
    status: "INTERVIEW",
    title: "Strategic Vision Interview",
    description:
      "A deep-dive strategy conversation with the Founder to align on regional milestones, chapters, and budgets.",
  },
  {
    step: "04",
    status: "SELECTED",
    title: "Jurisdiction & Charter",
    description:
      "Sign the State Lead Charter, receive official jurisdiction mandate, budget allocation, and executive credentials.",
  },
  {
    step: "05",
    status: "ACTIVE",
    title: "Active State Lead",
    description:
      "Identify & interview campus leads, lead regional meetup series, manage sponsor partnerships, and report metrics.",
  },
  {
    step: "06",
    status: "ALUMNI",
    title: "Senior Advisory Board",
    description:
      "Transition into the KailshiansX National Advisory Board to shape platform strategy and mentor state successors.",
  },
];

const STATE_LEAD_FAQS = [
  {
    id: "faq-state-1",
    question: "What are the primary responsibilities of a State Lead?",
    answer:
      "State Leads are regional leaders who manage the entire KailshiansX presence across their state. Responsibilities include scouting and onboarding Campus Leads, spearheading regional meetup series (like RaibarX, PadharoX, TricityX), building relationships with state colleges and venue partners, and allocating event budgets.",
  },
  {
    id: "faq-state-2",
    question: "Who makes an ideal State Lead candidate?",
    answer:
      "Experienced tech community founders, engineering managers, DevRel professionals, or senior student leaders who have already demonstrated success running multi-city tech meetups or college hackathons and possess a strong network among developers in their state.",
  },
  {
    id: "faq-state-3",
    question: "What budget and sponsorship support does KailshiansX provide?",
    answer:
      "State Leads are provided centralized event operational budgets, national sponsor collateral, custom regional sub-domains and brand identities, and direct access to national tech partner programs (AWS, GitHub, Razorpay, etc.).",
  },
  {
    id: "faq-state-4",
    question: "Can multiple people lead a state together?",
    answer:
      "Yes. For large states or multi-city regions (such as Punjab & Chandigarh, or Delhi NCR), KailshiansX can appoint Co-State Leads to oversee distinct geographic or technical jurisdictions.",
  },
];

export default async function StateLeadsPage() {
  const { stateLeads, stats } = await getCommunityOverview();

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Hero Section */}
      <section className="border-surface-800 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b from-purple-950/20 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="container-page relative mx-auto max-w-5xl space-y-6 px-4 text-center">
          <Badge
            variant="surface"
            className="border-purple-500/30 font-mono text-xs tracking-wider text-purple-300 uppercase"
          >
            PRD §12 • Regional Command
          </Badge>

          <h1 className="text-surface-50 mx-auto max-w-4xl text-3xl leading-tight font-black tracking-tight sm:text-5xl sm:leading-tight md:text-6xl">
            Direct Regional Developer Ecosystem Expansion Across{" "}
            <span className="text-accent-300">Your State</span>
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            Coordinate city communities and university chapters. Identify campus leads, foster
            regional meetup series, build sponsor alliances, and represent KailshiansX across your
            territory.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-3 text-xs font-bold text-white shadow-xl shadow-purple-500/20 transition hover:bg-purple-500 hover:shadow-purple-500/30 active:scale-95"
            >
              <Crown className="size-4" />
              <span>Apply for State Lead</span>
            </a>

            <Link
              href="/community"
              className="border-surface-700 bg-surface-900/80 text-surface-200 hover:bg-surface-800 inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-xs font-semibold transition hover:text-white"
            >
              <span>View Community Hierarchy</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 pt-8 sm:grid-cols-4">
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-purple-400">{stats.totalStateLeads}</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Active States
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-brand-400 text-2xl font-black">{stats.totalCities}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Cities Covered
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-emerald-400">
                {stats.totalCampusLeads}+
              </span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Campus Chapters
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-indigo-400">100%</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Autonomous Budgets
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* State Lead Role Pillars */}
      <section className="container-page mx-auto max-w-5xl space-y-12 px-4 py-16">
        <div className="space-y-2 text-center">
          <Badge variant="surface" className="font-mono text-[11px]">
            Executive Pillars
          </Badge>
          <h2 className="text-surface-100 text-2xl font-bold sm:text-3xl">
            Responsibilities & Strategic Ownership
          </h2>
          <p className="text-surface-400 mx-auto max-w-xl text-xs sm:text-sm">
            State Leads hold regional executive autonomy, driving multi-city initiatives with direct
            backing from the KailshiansX foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/20 text-purple-400">
              <Globe className="size-5" />
            </div>
            <h3 className="text-surface-100 text-base font-bold">Multi-City Expansion</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Identify emerging tech corridors within your state, connect with local developer
              groups, and turn isolated meetups into unified community chapters.
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6">
            <div className="bg-brand-500/20 text-brand-400 border-brand-500/30 flex size-10 items-center justify-center rounded-2xl border">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-surface-100 text-base font-bold">Campus Lead Onboarding</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Screen, interview, and mentor university campus leads across colleges in your state,
              conducting monthly reviews to support their growth.
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
              <Award className="size-5" />
            </div>
            <h3 className="text-surface-100 text-base font-bold">Meetup Series Custodianship</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Oversee the flagship regional meetup brand for your state (like RaibarX in Uttarakhand
              or PadharoX in Rajasthan), curating speakers and sponsors.
            </p>
          </div>
        </div>
      </section>

      {/* Selection Workflow Timeline (PRD §12) */}
      <section className="border-surface-800 bg-surface-900/40 border-y py-16">
        <div className="container-page mx-auto max-w-5xl space-y-10 px-4">
          <div className="space-y-2 text-center">
            <Badge variant="surface" className="font-mono text-[11px]">
              Executive Pipeline
            </Badge>
            <h2 className="text-surface-100 text-2xl font-bold">State Lead Selection Roadmap</h2>
            <p className="text-surface-400 mx-auto max-w-md text-xs">
              How executive candidates are evaluated, chartered, and empowered across their
              jurisdiction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {STATE_WORKFLOW_STEPS.map((step) => (
              <div
                key={step.step}
                className="border-surface-800 bg-surface-950/70 space-y-2 rounded-2xl border p-5 transition-colors hover:border-purple-500/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-400">{step.step}</span>
                  <Badge variant="surface" className="font-mono text-[10px]">
                    {step.status}
                  </Badge>
                </div>
                <h3 className="text-surface-100 text-sm font-bold">{step.title}</h3>
                <p className="text-surface-400 text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active State Leads Directory */}
      {stateLeads.length > 0 && (
        <section className="container-page mx-auto max-w-5xl space-y-8 px-4 py-16">
          <div className="border-surface-800 flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-surface-100 text-xl font-bold">Current Appointed State Leads</h2>
              <p className="text-surface-400 text-xs">
                Ecosystem architects directing operations across regions
              </p>
            </div>
            <Badge variant="surface" className="font-mono text-xs">
              {stateLeads.length} Territories
            </Badge>
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

      {/* Application Form Anchor */}
      <section id="apply" className="container-page mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div className="space-y-2 text-center">
          <Badge
            variant="surface"
            className="border-purple-500/30 font-mono text-xs text-purple-300"
          >
            Executive Submission
          </Badge>
          <h2 className="text-surface-50 text-2xl font-bold sm:text-3xl">
            Submit Your State Lead Application
          </h2>
          <p className="text-surface-400 text-xs sm:text-sm">
            Ready to lead regional engineering culture? Submit your leadership background below.
          </p>
        </div>

        <StateLeadFormClient />
      </section>

      {/* FAQ Section */}
      <section className="container-page mx-auto max-w-3xl space-y-6 px-4 pt-16">
        <div className="space-y-1.5 text-center">
          <h2 className="text-surface-100 text-xl font-bold">Frequently Asked Questions</h2>
          <p className="text-surface-400 text-xs">
            Clarifications on the State Lead role and commitments
          </p>
        </div>

        <FAQAccordion items={STATE_LEAD_FAQS} />
      </section>
    </div>
  );
}
