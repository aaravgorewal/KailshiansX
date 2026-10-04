import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Building2,
  BadgePercent,
  ArrowRight,
  Check,
  Mail,
} from "lucide-react";
import { getCollaborationOverview } from "@/server/collaborations/queries";
import { CollaborationsClient } from "./CollaborationsClient";
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

const COLLABORATION_STAGES = [
  {
    step: "01",
    label: "Lead",
    title: "New Proposal",
    description:
      "Inquiry lodged into pipeline with a unique dossier ID and instant email acknowledgement.",
  },
  {
    step: "02",
    label: "24-48h",
    title: "Contacted",
    description:
      "Dedicated Partnership Lead reviews requirements and connects via call or WhatsApp.",
  },
  {
    step: "03",
    label: "Alignment",
    title: "Discovery Meeting",
    description:
      "Video sync to align on target audience, event dates, capacity, tracks, and deliverables.",
  },
  {
    step: "04",
    label: "Agreement",
    title: "Negotiation",
    description:
      "Finalizing terms, resources offered, brand rights, sponsor packages, or formal MoU.",
  },
  {
    step: "05",
    label: "Confirmed",
    title: "Execution",
    description:
      "Public co-marketing launch, ticket registrations opening, and community execution.",
  },
];

export default async function CollaborationsPage() {
  const overview = await getCollaborationOverview();

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="border-border border-b pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Ecosystem Partnerships
          </p>

          <h1 className="text-foreground mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
            Build With KailshiansX. Co-Create The Builder Stage.
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base">
            Collaborate with North India&apos;s fastest-growing developer and student ecosystem.
            Whether you&apos;re an academic institution, a grassroots community, a modern venue
            host, or a forward-thinking tech brand — there&apos;s a high-impact path for you.
          </p>

          {/* Quick Metrics Bar */}
          <div className="border-border mt-10 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {overview.stats.totalColleges > 0 ? `${overview.stats.totalColleges}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Colleges & Universities</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {overview.stats.totalPartners > 0 ? `${overview.stats.totalPartners}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Community Hubs</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {overview.stats.totalVenues > 0 ? `${overview.stats.totalVenues}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Tech Venue Partners</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {overview.stats.totalSponsors > 0 ? `${overview.stats.totalSponsors}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Brand & Tool Sponsors</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {overview.stats.activeCities}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Active Tech Hub Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Partnership Pipeline Visualizer ──────────────────────────────── */}
      <section className="border-border bg-card border-b py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Pipeline
            </p>
            <h2 className="text-foreground mt-1 text-2xl font-bold">How Partnerships Advance</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              From initial submission to final execution, every partnership follows an accountable
              5-stage workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {COLLABORATION_STAGES.map((stage) => (
              <Card key={stage.step} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-primary font-mono text-xs font-bold">{stage.step}</span>
                  <span className="text-muted-foreground text-xs font-medium">{stage.label}</span>
                </div>
                <h3 className="text-foreground text-sm font-semibold">{stage.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {stage.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Four Paths Interactive Form Section ──────────────────────────── */}
      <section id="partnership-form" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Submit Proposal
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Choose Your Collaboration Path
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Select one of the four paths below to load the customized partnership application form.
          </p>
        </div>

        {/* Client Interactive Component */}
        <CollaborationsClient />
      </section>

      {/* ─── Value Propositions Per Path ──────────────────────────────────── */}
      <section className="border-border bg-card border-y py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Why Collaborate
            </p>
            <h2 className="text-foreground mt-1 text-2xl font-bold">What Every Partner Gets</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Every partnership is structured to deliver tangible, long-term impact for your
              organization, campus, or brand.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* College Card */}
            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="border-border bg-muted text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
                  <GraduationCap className="size-5" />
                </div>
                <h3 className="text-foreground text-base font-semibold">For Colleges</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Official student developer chapter on campus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>National-level hackathons & bootcamps with industry mentors.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Direct access to placement, internship, and project bounties.</span>
                  </li>
                </ul>
              </div>
              <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-xs font-medium">
                MoU & Event Charters Available &rarr;
              </div>
            </Card>

            {/* Community Card */}
            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="border-border bg-muted text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
                  <Users className="size-5" />
                </div>
                <h3 className="text-foreground text-base font-semibold">For Communities</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Cross-promotion across KailshiansX builder network.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Access to curated industry speakers, founders, and CTOs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Co-branded regional editions of flagship meetup brands.</span>
                  </li>
                </ul>
              </div>
              <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-xs font-medium">
                Ecosystem Co-hosting &rarr;
              </div>
            </Card>

            {/* Venue Card */}
            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="border-border bg-muted text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
                  <Building2 className="size-5" />
                </div>
                <h3 className="text-foreground text-base font-semibold">For Venues</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Consistent foot traffic of founders, engineers, and creators.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Marketing visibility and social tagging for your space.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Predictable weekend recurring bookings & community goodwill.</span>
                  </li>
                </ul>
              </div>
              <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-xs font-medium">
                Coworking & Hub Visibility &rarr;
              </div>
            </Card>

            {/* Sponsor Card */}
            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="border-border bg-muted text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
                  <BadgePercent className="size-5" />
                </div>
                <h3 className="text-foreground text-base font-semibold">For Sponsors</h3>
                <ul className="text-muted-foreground mt-4 space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Dedicated problem track and API bounty at hackathons.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>High-intent developer hiring pipeline with candidate dossiers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                    <span>Product keynotes, demo sessions, and verified developer signups.</span>
                  </li>
                </ul>
              </div>
              <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-xs font-medium">
                Full ROI Analytics &rarr;
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Verified Partners Grid ───────────────────────────────────────── */}
      {overview.featuredPartners.length > 0 && (
        <section className="border-border border-b py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Trusted Network
              </p>
              <h2 className="text-foreground mt-1 text-2xl font-bold">Active Network Partners</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Leading tech organizations, universities, and developer brands co-creating with
                KailshiansX.
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
          </div>
        </section>
      )}

      {/* ─── Frequently Asked Questions ───────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            FAQ
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Partnership & Collaboration FAQs
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Common questions regarding MoUs, logistics, sponsorship scopes, and execution.
          </p>
        </div>

        <FAQAccordion items={COLLABORATION_FAQS} />
      </section>

      {/* ─── Bottom Direct Help CTA ───────────────────────────────────────── */}
      <section className="border-border bg-card border-t py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-foreground text-2xl font-bold">
            Need a Custom Partnership or Multi-City Agreement?
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm">
            Our ecosystem leadership works directly with university authorities, engineering
            leadership, and tech foundation directors.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:partnerships@kailshiansx.com"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              <Mail className="size-4" />
              <span>Email partnerships@kailshiansx.com</span>
            </a>
            <Link
              href="/community"
              className="border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium"
            >
              <span>Explore Community Hub</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
