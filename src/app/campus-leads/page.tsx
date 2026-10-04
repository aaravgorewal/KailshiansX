import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Award, Check, ArrowRight, Building, MapPin, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    status: "Applied",
    title: "Application Logged",
    description:
      "Submit your technical background, campus involvement, and vision for the college chapter.",
  },
  {
    step: "02",
    status: "Screening",
    title: "Profile Screening",
    description:
      "Our team reviews your GitHub, club experience, and academic standing with college peers.",
  },
  {
    step: "03",
    status: "Interview",
    title: "1:1 Video Interview",
    description:
      "A 20-minute conversation with a Community Lead to align on roadmap, events, and chapter launch.",
  },
  {
    step: "04",
    status: "Selected",
    title: "Selected & Onboarded",
    description:
      "Receive your official Lead credential, access to the Lead portal, budget allocation, and swag box.",
  },
  {
    step: "05",
    status: "Active",
    title: "Active Campus Lead",
    description:
      "Run monthly meetups, mentor students, organize hackathon delegations, and request workshops.",
  },
  {
    step: "06",
    status: "Alumni",
    title: "Senior Council",
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
      "KailshiansX backs your campus initiatives with event sponsorship budgets, official speaker connections from industry, workshop curricula, digital certificates, and physical swag kits.",
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
    <div className="bg-background text-foreground min-h-screen pb-20">
      {/* Hero Section */}
      <section className="border-border border-b pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Leadership Program
          </p>

          <h1 className="text-foreground mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
            Lead the Developer Movement at Your College Campus
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base">
            Represent KailshiansX as the official Campus Lead. Build a thriving builder chapter,
            host hands-on workshops, guide hackathon teams, and level up your leadership credential.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary">
              <a href="#apply">
                <GraduationCap className="mr-2 size-4" />
                <span>Apply for Campus Lead</span>
              </a>
            </Button>

            <Button asChild variant="secondary">
              <Link href="/community">
                <span>Explore Community Hub</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="border-border mt-10 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-4">
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalCampusLeads > 0 ? `${stats.totalCampusLeads}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Active Campus Leads</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalColleges > 0 ? `${stats.totalColleges}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Colleges Engaged</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">100%</div>
              <div className="text-muted-foreground mt-1 text-xs">Event Backing</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">1:1</div>
              <div className="text-muted-foreground mt-1 text-xs">Founder Mentorship</div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Responsibilities & Perks Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Roles & Privileges
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            What You Do vs. What You Gain
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Being a Campus Lead is more than a title — it is your launchpad into developer
            relations, software architecture, and founder circles.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Responsibilities */}
          <Card className="p-6 sm:p-8">
            <div className="border-border bg-muted text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
              <Flame className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Your Responsibilities</h3>
            <p className="text-muted-foreground mt-1 text-xs">Drive technical energy on campus</p>

            <ul className="text-muted-foreground mt-6 space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Build & Lead Your Chapter:</strong> Form a
                  core team of student designers, backend devs, and competitive coders.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Host Technical Workshops:</strong> Request
                  KailshiansX curriculum sessions on Web, System Design, AI Agents, and DevOps.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Lead Hackathon Delegations:</strong> Prepare
                  and mentor student builder teams for NirmanX and regional hackathons.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Campus Tech Talks:</strong> Facilitate guest
                  sessions by leading industry engineers and startup founders.
                </span>
              </li>
            </ul>
          </Card>

          {/* Perks */}
          <Card className="p-6 sm:p-8">
            <div className="border-border bg-muted text-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
              <Award className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Exclusive Perks</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Direct perks that accelerate your career
            </p>

            <ul className="text-muted-foreground mt-6 space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Official Credential:</strong>{" "}
                  Cryptographically verified Lead credential and recommendation letters.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">VIP Access:</strong> Free passes to
                  KailshiansX flagship hackathons, meetups, and summits.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Founder & Tech Mentorship:</strong> Monthly
                  AMAs and 1:1 resume/architecture reviews with engineering leaders.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Exclusive Swag Kit:</strong> KailshiansX Lead
                  hoodie, custom badge, stickers, and merchandise.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Selection Workflow Timeline */}
      <section className="border-border bg-card border-y py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Workflow
            </p>
            <h2 className="text-foreground mt-1 text-2xl font-bold">
              How the Selection Process Works
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              From application submission to senior council, track your trajectory across each
              milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {CAMPUS_WORKFLOW_STEPS.map((step) => (
              <Card key={step.step} className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-primary font-mono text-xs font-bold">{step.step}</span>
                  <span className="text-muted-foreground text-xs">{step.status}</span>
                </div>
                <h3 className="text-foreground text-sm font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Active Campus Leads Spotlight */}
      {campusLeads.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="border-border flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-foreground text-xl font-bold">Current Active Campus Leads</h2>
              <p className="text-muted-foreground text-xs">
                Builders currently spearheading chapters across universities
              </p>
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              {campusLeads.length} Leads
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {campusLeads.map((lead) => (
              <Card key={lead.id} className="space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="border-border bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="text-foreground truncate text-sm font-semibold">{lead.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                      <Building className="text-muted-foreground size-3 shrink-0" />
                      <span>{lead.collegeName}</span>
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                      <MapPin className="text-muted-foreground size-2.5 shrink-0" />
                      <span>{lead.cityName}</span>
                    </p>
                  </div>
                </div>

                <div className="border-border grid grid-cols-2 gap-2 border-t pt-3 text-center text-xs">
                  <div className="border-border bg-muted rounded border p-2">
                    <span className="text-foreground font-bold">{lead.eventsSupported}</span>
                    <span className="text-muted-foreground block text-xs uppercase">
                      Events Ran
                    </span>
                  </div>
                  <div className="border-border bg-muted rounded border p-2">
                    <span className="text-foreground font-bold">
                      {lead.referrals > 0 ? `${lead.referrals}+` : "0"}
                    </span>
                    <span className="text-muted-foreground block text-xs uppercase">Builders</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Application Form Anchor */}
      <section id="apply" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Application
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Submit Your Campus Lead Application
          </h2>
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
            Ready to build a legacy of software engineering at your college? Complete the form
            below.
          </p>
        </div>

        <CampusLeadFormClient />
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-foreground text-xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Everything you need to know about the role
          </p>
        </div>

        <FAQAccordion items={CAMPUS_LEAD_FAQS} />
      </section>
    </div>
  );
}
