import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  Building,
  MapPin,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { CampusLeadFormClient } from "./CampusLeadFormClient";
import { getCommunityOverview } from "@/server/community/queries";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Campus Lead Program | Represent KailshiansX at Your College",
  description:
    "Apply to become a KailshiansX Campus Lead. Build your university developer chapter, host campus hackathons, get VIP flagship passes, direct founder mentorship, and exclusive swag.",
  alternates: {
    canonical: `${APP_URL}/campus-leads`,
  },
  openGraph: {
    title: "Campus Lead Program | KailshiansX",
    description:
      "Represent KailshiansX within your college. Drive events, build your chapter, and grow as a recognized student developer leader.",
    url: `${APP_URL}/campus-leads`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Lead Program | KailshiansX",
    description: "Represent KailshiansX within your college. Build your campus developer chapter.",
    images: ["/og-image.png"],
  },
};

const CAMPUS_WORKFLOW_STEPS = [
  {
    step: "01",
    status: "APPLIED",
    title: "Application Logged",
    description:
      "Submit your technical background, campus involvement, and vision for the college chapter.",
  },
  {
    step: "02",
    status: "SCREENING",
    title: "Profile Screening",
    description:
      "Our team reviews your GitHub, club experience, and academic standing with college peers.",
  },
  {
    step: "03",
    status: "INTERVIEW",
    title: "1:1 Video Interview",
    description:
      "A 20-minute conversation with a Community Lead to align on roadmap, events, and chapter launch.",
  },
  {
    step: "04",
    status: "SELECTED",
    title: "Selected & Onboarded",
    description:
      "Receive your official Lead credential, access to the Lead portal, budget allocation, and swag box.",
  },
  {
    step: "05",
    status: "ACTIVE",
    title: "Active Campus Lead",
    description:
      "Run monthly meetups, mentor students, organize hackathon delegations, and request workshops.",
  },
  {
    step: "06",
    status: "ALUMNI",
    title: "Alumni / Senior Council",
    description:
      "Upon graduation, transition to our Alumni Advisory Council and mentor future incoming leads.",
  },
];

const CAMPUS_LEAD_FAQS = [
  {
    id: "faq-campus-1",
    question: "Who is eligible to apply as a Campus Lead?",
    answer:
      "Any enrolled undergraduate or postgraduate engineering or MCA student with a passion for software development, open-source, or community organizing. First to final-year students are all eligible as long as they can commit 5–10 hours per week.",
  },
  {
    id: "faq-campus-2",
    question: "Can multiple students from the same college apply?",
    answer:
      "Yes! While each college typically has 1 or 2 primary Campus Leads, top institutions can also appoint Co-Leads and Core Committee members to share responsibilities across technical tracks.",
  },
  {
    id: "faq-campus-3",
    question: "What financial or event resources does KailshiansX provide?",
    answer:
      "KailshiansX backs your campus initiatives with event sponsorship budgets, official speaker connections from Google/Microsoft/unicorns, workshop curricula, digital certificates, and physical swag kits.",
  },
  {
    id: "faq-campus-4",
    question: "How long does the selection process take?",
    answer:
      "Applications are reviewed on a rolling basis. You will typically hear back regarding profile screening within 3–5 working days, followed by the interview round scheduled the same week.",
  },
];

export default async function CampusLeadsPage() {
  const { campusLeads, stats } = await getCommunityOverview();

  return (
    <div className="bg-surface-950 min-h-screen pb-28">
      {/* Hero Section */}
      <section className="border-surface-800 from-brand-950/20 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="bg-brand-500/10 pointer-events-none absolute -top-40 left-1/2 size-96 -translate-x-1/2 rounded-full blur-3xl" />

        <div className="container-page relative mx-auto max-w-5xl space-y-6 px-4 text-center">
          <Badge variant="brand" className="font-mono text-xs tracking-wider uppercase">
            PRD §11 • Leadership Movement
          </Badge>

          <h1 className="text-surface-50 mx-auto max-w-4xl text-3xl leading-tight font-black tracking-tight sm:text-5xl sm:leading-tight md:text-6xl">
            Lead the Developer Movement at Your{" "}
            <span className="from-brand-400 via-accent-300 bg-gradient-to-r to-indigo-400 bg-clip-text text-transparent">
              College Campus
            </span>
          </h1>

          <p className="text-surface-300 mx-auto max-w-2xl text-sm leading-relaxed sm:text-base">
            Represent KailshiansX as the official Campus Lead. Build a thriving builder chapter,
            host hands-on workshops, guide hackathon teams, and level up your leadership credential.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#apply"
              className="bg-brand-600 shadow-brand-500/20 hover:bg-brand-500 hover:shadow-brand-500/30 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold text-white shadow-xl transition active:scale-95"
            >
              <GraduationCap className="size-4" />
              <span>Apply for Campus Lead</span>
            </a>

            <Link
              href="/community"
              className="border-surface-700 bg-surface-900/80 text-surface-200 hover:bg-surface-800 inline-flex items-center gap-2 rounded-2xl border px-6 py-3 text-xs font-semibold transition hover:text-white"
            >
              <span>Explore Community Hub</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 pt-8 sm:grid-cols-4">
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-brand-400 text-2xl font-black">{stats.totalCampusLeads}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Active Campus Leads
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-accent-400 text-2xl font-black">{stats.totalColleges}+</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Colleges Engaged
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-emerald-400">100%</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Event Backing
              </p>
            </div>
            <div className="border-surface-800/80 bg-surface-900/60 rounded-2xl border p-3.5 backdrop-blur-sm">
              <span className="text-2xl font-black text-indigo-400">1:1</span>
              <p className="text-surface-400 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">
                Founder Mentorship
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Responsibilities & Perks Grid */}
      <section className="container-page mx-auto max-w-5xl space-y-12 px-4 py-16">
        <div className="space-y-2 text-center">
          <Badge variant="surface" className="font-mono text-[11px]">
            Roles & Privileges
          </Badge>
          <h2 className="text-surface-100 text-2xl font-bold sm:text-3xl">
            What You Do vs. What You Gain
          </h2>
          <p className="text-surface-400 mx-auto max-w-xl text-xs sm:text-sm">
            Being a Campus Lead is more than a title — it is your launchpad into developer
            relations, software architecture, and founder circles.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Responsibilities */}
          <div className="border-surface-800 bg-surface-900/80 space-y-6 rounded-3xl border p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-brand-500/20 text-brand-400 border-brand-500/30 flex size-10 items-center justify-center rounded-2xl border">
                <Flame className="size-5" />
              </div>
              <div>
                <h3 className="text-surface-100 text-lg font-bold">Your Responsibilities</h3>
                <p className="text-surface-400 text-xs">Drive technical energy on campus</p>
              </div>
            </div>

            <ul className="text-surface-300 space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-brand-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Build & Lead Your Chapter:</strong> Form a core team of student designers,
                  backend devs, and competitive coders.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-brand-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Host Technical Workshops:</strong> Request KailshiansX curriculum sessions
                  on MERN, System Design, AI Agents, and DevOps.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-brand-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Lead Hackathon Delegations:</strong> Prepare and mentor student builder
                  teams for NirmanX, AarambhX, and regional hackathons.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-brand-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Campus Tech Talks:</strong> Facilitate guest sessions by leading industry
                  engineers and startup founders.
                </span>
              </li>
            </ul>
          </div>

          {/* Perks */}
          <div className="border-surface-800 bg-surface-900/80 space-y-6 rounded-3xl border p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="bg-accent-500/20 text-accent-400 border-accent-500/30 flex size-10 items-center justify-center rounded-2xl border">
                <Award className="size-5" />
              </div>
              <div>
                <h3 className="text-surface-100 text-lg font-bold">Exclusive Perks</h3>
                <p className="text-surface-400 text-xs">Direct perks that accelerate your career</p>
              </div>
            </div>

            <ul className="text-surface-300 space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-accent-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Official Credential & Reference:</strong> Cryptographically verified Lead
                  credential and personal recommendation letters for MS/jobs.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-accent-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>VIP Access & Travel Stipends:</strong> Free VIP passes to all KailshiansX
                  flagship hackathons, meetups, and summits.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-accent-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Founder & Tech Lead Mentorship:</strong> Monthly closed-door AMAs and 1:1
                  resume/architecture reviews with engineering leaders.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="text-accent-400 mt-0.5 size-4 shrink-0" />
                <span>
                  <strong>Exclusive Swag Kit:</strong> KailshiansX Lead hoodie, custom badge,
                  stickers, and event host merchandise.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Selection Workflow Timeline (PRD §11) */}
      <section className="border-surface-800 bg-surface-900/40 border-y py-16">
        <div className="container-page mx-auto max-w-5xl space-y-10 px-4">
          <div className="space-y-2 text-center">
            <Badge variant="surface" className="font-mono text-[11px]">
              Status Workflow
            </Badge>
            <h2 className="text-surface-100 text-2xl font-bold">How the Selection Process Works</h2>
            <p className="text-surface-400 mx-auto max-w-md text-xs">
              From application submission to alumni council, track your trajectory across each
              milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {CAMPUS_WORKFLOW_STEPS.map((step) => (
              <div
                key={step.step}
                className="border-surface-800 bg-surface-950/70 hover:border-brand-500/40 space-y-2 rounded-2xl border p-5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 font-mono text-xs font-bold">{step.step}</span>
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

      {/* Active Campus Leads Spotlight */}
      {campusLeads.length > 0 && (
        <section className="container-page mx-auto max-w-5xl space-y-8 px-4 py-16">
          <div className="border-surface-800 flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-surface-100 text-xl font-bold">Current Active Campus Leads</h2>
              <p className="text-surface-400 text-xs">
                Builders currently spearheading chapters across universities
              </p>
            </div>
            <Badge variant="surface" className="font-mono text-xs">
              {campusLeads.length} Leads
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {campusLeads.map((lead) => (
              <div
                key={lead.id}
                className="border-surface-800 bg-surface-900/60 hover:border-surface-700 space-y-4 rounded-2xl border p-5 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div className="bg-surface-800 border-surface-700 text-brand-300 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-base font-bold">
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
                    <span className="text-surface-500 block text-[9px] uppercase">
                      Builders Onboarded
                    </span>
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
          <Badge variant="brand" className="font-mono text-xs">
            Take the Helm
          </Badge>
          <h2 className="text-surface-50 text-2xl font-bold sm:text-3xl">
            Submit Your Campus Lead Application
          </h2>
          <p className="text-surface-400 text-xs sm:text-sm">
            Ready to build a legacy of software engineering at your college? Complete the form
            below.
          </p>
        </div>

        <CampusLeadFormClient />
      </section>

      {/* FAQ Section */}
      <section className="container-page mx-auto max-w-3xl space-y-6 px-4 pt-16">
        <div className="space-y-1.5 text-center">
          <h2 className="text-surface-100 text-xl font-bold">Frequently Asked Questions</h2>
          <p className="text-surface-400 text-xs">Everything you need to know about the role</p>
        </div>

        <FAQAccordion items={CAMPUS_LEAD_FAQS} />
      </section>
    </div>
  );
}
