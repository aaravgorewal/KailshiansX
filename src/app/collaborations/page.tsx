import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { getCollaborationOverview } from "@/server/collaborations/queries";
import { CollaborationsClient } from "./CollaborationsClient";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";
import { PartnerLogoGrid } from "@/components/ui/PartnerLogoGrid";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Collaborations & Partnerships | KailshiansX",
  description:
    "Partner with KailshiansX across four dedicated paths: College Collaborations, Community Partners, Venue Hosts, and Brand/Tech Sponsors. Empower developer ecosystems across India.",
  alternates: {
    canonical: `${APP_URL}/collaborations`,
  },
  keywords: [
    "KailshiansX Collaborations",
    "College Hackathon Partnership",
    "Campus Chapter MoU",
    "Developer Community Partner",
    "Tech Venue Host India",
    "Hackathon Sponsorship",
    "Developer Relations Partnerships",
  ],
  openGraph: {
    title: "Collaborations & Partnerships | KailshiansX",
    description:
      "Partner with KailshiansX across four dedicated paths: College Collaborations, Community Partners, Venue Hosts, and Brand Sponsors.",
    url: `${APP_URL}/collaborations`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collaborations & Partnerships | KailshiansX",
    description: "Partner with KailshiansX across Colleges, Communities, Venues, and Sponsors.",
    images: ["/og-image.png"],
  },
};

const COLLABORATION_FAQS: FAQItem[] = [
  {
    id: "faq-collab-1",
    question: "How quickly does KailshiansX respond to collaboration proposals?",
    answer:
      "Every proposal submitted through our portal is immediately registered into our CRM pipeline with stage NEW. An automated confirmation and reference ID are dispatched to your inbox right away. Our ecosystem partnerships team reviews alignment and contacts you within 24 to 48 business hours to schedule an initial discovery call.",
  },
  {
    id: "faq-collab-2",
    question: "Do colleges and universities need a formal MoU to collaborate?",
    answer:
      "For single-event initiatives (like hosting a 1-day tech talk or college hackathon track), a simple institutional event clearance or sanction letter is sufficient. For ongoing campus chapters, recurring workshops, and annual hackathon hosting rights, we provide a structured, non-binding mutual MoU outlining responsibilities, academic value, and student perks.",
  },
  {
    id: "faq-collab-3",
    question: "Are community partnerships open to non-profit developer groups?",
    answer:
      "Yes, absolutely. Most of our community partners are grassroots developer meetups, open-source user groups, and student tech societies. Community partnerships operate on mutual value — cross-promotions, shared speaker benches, community ticket discounts, and co-branded stages.",
  },
  {
    id: "faq-collab-4",
    question: "What support does KailshiansX provide to venue partners?",
    answer:
      "We provide end-to-end on-ground event management, verified attendee check-ins via QR codes, technical audio/video assistance, marketing visibility across all our platforms, and ensure your facility is left pristine post-event. Venues benefit from regular foot traffic of top engineers, founders, and students.",
  },
  {
    id: "faq-collab-5",
    question: "What deliverables and metrics do brand sponsors receive?",
    answer:
      "Sponsors receive dedicated hackathon track/bounty ownership, live product demos/keynotes, co-branded marketing across thousands of builders, direct access to opt-in hiring resumes, and comprehensive post-event ROI analytics (reach, submissions, impressions, and attendee profiles).",
  },
];

export default async function CollaborationsPage() {
  const overview = await getCollaborationOverview();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-900 pt-32 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-96 w-full max-w-7xl -translate-x-1/2 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Badge
            variant="outline"
            className="mb-6 border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase backdrop-blur-sm"
          >
            PRD §13 • Strategic Ecosystem Partnerships
          </Badge>

          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.1] font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build With KailshiansX.{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Co-Create The Builder Stage.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Collaborate with North India&apos;s fastest-growing developer and student ecosystem.
            Whether you&apos;re an academic institution, a grassroots community, a modern venue
            host, or a forward-thinking tech brand — there&apos;s a high-impact path for you.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-white sm:text-3xl">
                {overview.stats.totalColleges}+
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">Colleges & Universities</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-cyan-400 sm:text-3xl">
                {overview.stats.totalPartners}+
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">Community Hubs</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400 sm:text-3xl">
                {overview.stats.totalVenues}+
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">Tech Venue Partners</div>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400 sm:text-3xl">
                {overview.stats.totalSponsors}+
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">Brand & Tool Sponsors</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-sm sm:col-span-1">
              <div className="text-2xl font-black text-indigo-400 sm:text-3xl">
                {overview.stats.activeCities}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">Active Tech Hub Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partnership Pipeline Visualizer (PRD §13) ────────────────────── */}
      <section className="border-b border-slate-900 bg-slate-950/80 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Transparent CRM Pipeline
            </span>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              How Partnerships Advance (PRD §13)
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              From your initial submission to the final stage kickoff, every partnership follows an
              accountable, 5-stage milestone workflow.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Step 1: New */}
            <div className="relative rounded-2xl border border-cyan-500/40 bg-slate-900/70 p-5 shadow-lg shadow-cyan-500/5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/20 text-xs font-bold text-cyan-400">
                  1
                </span>
                <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                  Lead
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">New Proposal</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Inquiry lodged into pipeline with a unique dossier ID and instant email
                acknowledgement.
              </p>
            </div>

            {/* Step 2: Contacted */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300">
                  2
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  24–48h
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Contacted</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Dedicated Partnership Lead reviews requirements and connects via call or WhatsApp.
              </p>
            </div>

            {/* Step 3: Meeting */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300">
                  3
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Alignment
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Discovery Meeting</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Video sync to align on target audience, event dates, capacity, tracks, and
                deliverables.
              </p>
            </div>

            {/* Step 4: Negotiation */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300">
                  4
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  MoU / Deck
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Negotiation</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Finalizing terms, resources offered, brand rights, sponsor packages, or formal MoU.
              </p>
            </div>

            {/* Step 5: Won / Confirmed */}
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  5
                </span>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  Confirmed
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Won / Execution</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Public co-marketing launch, ticket registrations opening, and community execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Four Paths Interactive Form Section ──────────────────────────── */}
      <section id="partnership-form" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="outline" className="mb-3 border-cyan-500/30 text-cyan-400">
            Submit Your Proposal
          </Badge>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Choose Your Collaboration Path
          </h2>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Select one of the four paths below to load the customized partnership application form
            tailored to your organisation&apos;s capacity and goals.
          </p>
        </div>

        {/* Client Interactive Component */}
        <CollaborationsClient />
      </section>

      {/* ─── Value Propositions Per Path ──────────────────────────────────── */}
      <section className="border-y border-slate-900 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Why Collaborate
            </span>
            <h2 className="mt-1 text-3xl font-black text-white">What Every Partner Gets</h2>
            <p className="mt-2 text-sm text-slate-400">
              We design every partnership to deliver tangible, long-term impact for your community,
              campus, or brand.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* College Card */}
            <Card className="flex flex-col justify-between rounded-2xl border-slate-800 bg-slate-950/80 p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">For Colleges</h3>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    <span>Official KailshiansX student developer chapter on campus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    <span>National-level hackathons & bootcamps with industry mentors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                    <span>Direct access to placement, internship, and project bounties.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-800/80 pt-4 text-xs font-semibold text-indigo-400">
                MoU & Event Charters Available &rarr;
              </div>
            </Card>

            {/* Community Card */}
            <Card className="flex flex-col justify-between rounded-2xl border-slate-800 bg-slate-950/80 p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">For Communities</h3>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>Cross-promotion across KailshiansX 10k+ builder network.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>Access to curated industry speakers, founders, and CTOs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>Co-branded regional editions of RaibarX, PadharoX, and TricityX.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-800/80 pt-4 text-xs font-semibold text-cyan-400">
                Ecosystem Co-hosting &rarr;
              </div>
            </Card>

            {/* Venue Card */}
            <Card className="flex flex-col justify-between rounded-2xl border-slate-800 bg-slate-950/80 p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">For Venues</h3>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>High-density foot traffic of founders, engineers, and freelancers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>Full marketing and social media tagging for your brand space.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <span>Predictable weekend recurring bookings & community goodwill.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-800/80 pt-4 text-xs font-semibold text-amber-400">
                Coworking & Hub Visibility &rarr;
              </div>
            </Card>

            {/* Sponsor Card */}
            <Card className="flex flex-col justify-between rounded-2xl border-slate-800 bg-slate-950/80 p-6">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">For Sponsors</h3>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>Dedicated problem track and API bounty at NirmanX & AarambhX.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>High-intent developer hiring pipeline with candidate dossiers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>Product keynotes, demo sessions, and verified developer signups.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 border-t border-slate-800/80 pt-4 text-xs font-semibold text-emerald-400">
                Full ROI Analytics &rarr;
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Verified Partners Grid ───────────────────────────────────────── */}
      {overview.featuredPartners.length > 0 && (
        <section className="mx-auto max-w-7xl border-b border-slate-900 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
              Trusted Ecosystem
            </span>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Active Network Partners
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Join leading tech companies, premier universities, and top developer brands
              co-creating with KailshiansX.
            </p>
          </div>

          <PartnerLogoGrid
            partners={overview.featuredPartners.map((p) => ({
              id: p.id,
              name: p.name,
              logoUrl: p.logo || undefined,
              websiteUrl: p.website || undefined,
              tier: "COMMUNITY",
            }))}
            columns={4}
          />
        </section>
      )}

      {/* ─── Frequently Asked Questions (PRD §13) ─────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-3 border-cyan-500/30 text-cyan-400">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Partnership & Collaboration FAQs
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Answers to common questions regarding MoUs, logistics, sponsorship packages, and
            execution.
          </p>
        </div>

        <FAQAccordion items={COLLABORATION_FAQS} />
      </section>

      {/* ─── Bottom Direct Help CTA ───────────────────────────────────────── */}
      <section className="border-t border-slate-900 bg-gradient-to-b from-slate-950 to-slate-900/60 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            Need a Custom Partnership or Multi-City Agreement?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Our ecosystem leadership works directly with university vice-chancellors, company VP of
            Engineering, and tech foundation leads.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:partnerships@kailshiansx.com"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition-colors hover:bg-cyan-400"
            >
              <Mail className="h-4 w-4" />
              <span>Email partnerships@kailshiansx.com</span>
            </a>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-900"
            >
              <span>Explore Community Hub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
