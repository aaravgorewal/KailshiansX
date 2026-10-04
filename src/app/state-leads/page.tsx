import type { Metadata } from "next";
import Link from "next/link";
import { Crown, MapPin, ArrowRight, ShieldCheck, Globe, Award, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    status: "Applied",
    title: "Executive Dossier Logged",
    description:
      "Submit your engineering background, community organizing track record, and state expansion roadmap.",
  },
  {
    step: "02",
    status: "Screening",
    title: "Executive Review",
    description:
      "The Founder & Steering Committee assess your proven ability to lead across multiple cities and institutions.",
  },
  {
    step: "03",
    status: "Interview",
    title: "Strategic Vision Interview",
    description:
      "A deep-dive strategy conversation with the Founder to align on regional milestones, chapters, and budgets.",
  },
  {
    step: "04",
    status: "Selected",
    title: "Jurisdiction & Charter",
    description:
      "Sign the State Lead Charter, receive official jurisdiction mandate, budget allocation, and executive credentials.",
  },
  {
    step: "05",
    status: "Active",
    title: "Active State Lead",
    description:
      "Identify & interview campus leads, lead regional meetup series, manage sponsor partnerships, and report metrics.",
  },
  {
    step: "06",
    status: "Alumni",
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
      "State Leads are provided centralized event operational budgets, national sponsor collateral, custom regional brand identities, and direct access to national tech partner programs.",
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
    <div className="bg-background text-foreground min-h-screen pb-20">
      {/* Hero Section */}
      <section className="border-border border-b pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Regional Leadership
          </p>

          <h1 className="text-foreground mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
            Direct Regional Developer Ecosystem Expansion Across Your State
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base">
            Coordinate city communities and university chapters. Identify campus leads, foster
            regional meetup series, build sponsor alliances, and represent KailshiansX across your
            territory.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary">
              <a href="#apply">
                <Crown className="mr-2 size-4" />
                <span>Apply for State Lead</span>
              </a>
            </Button>

            <Button asChild variant="secondary">
              <Link href="/community">
                <span>View Community Hierarchy</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="border-border mt-10 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-4">
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalStateLeads}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Active States</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalCities > 0 ? `${stats.totalCities}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Cities Covered</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalCampusLeads > 0 ? `${stats.totalCampusLeads}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Campus Chapters</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">100%</div>
              <div className="text-muted-foreground mt-1 text-xs">Autonomous Budgets</div>
            </div>
          </div>
        </div>
      </section>

      {/* State Lead Role Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Executive Pillars
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Responsibilities & Strategic Ownership
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            State Leads hold regional executive autonomy, driving multi-city initiatives with direct
            backing from the KailshiansX foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="space-y-4 p-6">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <Globe className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Multi-City Expansion</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Identify emerging tech corridors within your state, connect with local developer
              groups, and turn isolated meetups into unified community chapters.
            </p>
            <ul className="text-muted-foreground space-y-1.5 pt-2 text-xs">
              <li className="flex items-start gap-2">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>Launch city chapters across tier-1 & tier-2 cities</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>Establish regional venue partnerships</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Campus Lead Onboarding</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Screen, interview, and mentor university campus leads across colleges in your state,
              conducting monthly reviews to support their growth.
            </p>
            <ul className="text-muted-foreground space-y-1.5 pt-2 text-xs">
              <li className="flex items-start gap-2">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>Interview and appoint university campus leads</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>Coordinate state-wide hackathon delegations</span>
              </li>
            </ul>
          </Card>

          <Card className="space-y-4 p-6">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <Award className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Meetup Series Custodianship</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Oversee the flagship regional meetup brand for your state (like RaibarX in Uttarakhand
              or PadharoX in Rajasthan), curating speakers and sponsors.
            </p>
            <ul className="text-muted-foreground space-y-1.5 pt-2 text-xs">
              <li className="flex items-start gap-2">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>Monthly curated tech panels and keynotes</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                <span>Manage regional sponsor relationships</span>
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
              Pipeline
            </p>
            <h2 className="text-foreground mt-1 text-2xl font-bold">
              State Lead Selection Roadmap
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              How executive candidates are evaluated, chartered, and empowered across their
              jurisdiction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {STATE_WORKFLOW_STEPS.map((step) => (
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

      {/* Active State Leads Directory */}
      {stateLeads.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="border-border flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-foreground text-xl font-bold">Current Appointed State Leads</h2>
              <p className="text-muted-foreground text-xs">
                Ecosystem architects directing operations across regions
              </p>
            </div>
            <span className="text-muted-foreground font-mono text-xs">
              {stateLeads.length} Territories
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {stateLeads.map((sl) => (
              <Card key={sl.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="border-border bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold">
                    {sl.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-foreground truncate text-base font-semibold">
                        {sl.name}
                      </h3>
                      <span className="border-border bg-muted text-muted-foreground rounded border px-1.5 py-0.5 text-xs">
                        Active
                      </span>
                    </div>
                    <p className="text-foreground text-xs font-medium">State Lead • {sl.state}</p>
                    {sl.citiesCovered && (
                      <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                        <MapPin className="text-muted-foreground size-3 shrink-0" />
                        <span>Coverage: {sl.citiesCovered}</span>
                      </p>
                    )}
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
            Executive Submission
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Submit Your State Lead Application
          </h2>
          <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
            Ready to lead regional engineering culture? Submit your leadership background below.
          </p>
        </div>

        <StateLeadFormClient />
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-foreground text-xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Clarifications on the State Lead role and commitments
          </p>
        </div>

        <FAQAccordion items={STATE_LEAD_FAQS} />
      </section>
    </div>
  );
}
