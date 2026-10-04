import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCommunityOverview } from "@/server/community/queries";
import { CommunityCtaGrid } from "./CommunityCtaButtons";
import { CommunityModalsClient } from "./CommunityModalsClient";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kailshiansx.com";

export const metadata: Metadata = {
  title: "Developer Community & Ecosystem | KailshiansX",
  description:
    "Explore the KailshiansX community hierarchy: KailshiansX -> State Leads -> City Communities -> Campus Leads -> College Chapters -> Members. Join 1,200+ builders, apply for leadership, or start a college chapter.",
  alternates: {
    canonical: `${APP_URL}/community`,
  },
  openGraph: {
    title: "Developer Community & Ecosystem | KailshiansX",
    description:
      "A living, multi-tier ecosystem of software engineers, university campus leads, regional state directors, and tech mentors.",
    url: `${APP_URL}/community`,
    siteName: "KailshiansX",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Community & Ecosystem | KailshiansX",
    description: "Join builders across India. Move from attendee to leader.",
    images: ["/og-image.png"],
  },
};

const HIERARCHY_TIERS = [
  {
    tier: "01",
    role: "KailshiansX Foundation",
    entity: "Executive Council & Platform",
    scope: "National Platform & Ecosystem Architecture",
    description:
      "Coordinates national flagship hackathons (NirmanX), curriculum standards, funding allocations, industry partner programs, and platform infrastructure.",
    perks: "National leadership, ecosystem governance, multi-state sponsorship coordination",
  },
  {
    tier: "02",
    role: "State Leads",
    entity: "Regional Ecosystem Directors",
    scope: "State & Regional Jurisdictions (e.g. Uttarakhand, Rajasthan, Punjab & Chandigarh)",
    description:
      "Executive leaders driving expansion across cities, onboarding and mentoring Campus Leads, overseeing regional meetup properties, and managing state event budgets.",
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
    perks: "Monthly expert panels, hiring networking, founder keynotes, venue partnerships",
  },
  {
    tier: "04",
    role: "Campus Leads",
    entity: "University Community Architects",
    scope: "College & University Campuses",
    description:
      "Student developers representing KailshiansX on the ground. They lead university hackathon delegations, organize hands-on technical workshops, and mentor freshmen.",
    perks: "Official leadership credential, VIP hackathon passes, 1:1 founder mentorship, swag",
  },
  {
    tier: "05",
    role: "College Chapters",
    entity: "Campus Developer Circles",
    scope: "Academic Institutions & Student Clubs",
    description:
      "Officially recognized developer chapters embedded inside engineering colleges running study circles, project buildathons, and preparing for national hackathons.",
    perks: "Official event backing, KailshiansX curriculum, cloud credits, guest speakers",
  },
  {
    tier: "06",
    role: "Members & Attendees",
    entity: "The Builder Base",
    scope: "Developers, Students, Engineers & Hackers",
    description:
      "The lifeblood of KailshiansX. Software engineers, university students, and open-source contributors attending meetups, building prototypes, and solving real-world challenges.",
    perks: "Event access, team matchmaking, certificate verification, project showcase",
  },
];

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
    <div className="bg-background text-foreground min-h-screen pb-20">
      {/* Global Interactive Modals Manager */}
      <CommunityModalsClient />

      {/* Hero Section */}
      <section className="border-border border-b pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Community Architecture
          </p>

          <h1 className="text-foreground mt-3 max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
            A Living Network of Engineers, Leads & Regional Builders
          </h1>

          <p className="text-muted-foreground mt-4 max-w-2xl text-base">
            KailshiansX is not a static events calendar. It is a hierarchical, distributed developer
            movement operating across states, cities, and campus chapters.
          </p>

          {/* Impact Counters */}
          <div className="border-border mt-10 grid grid-cols-2 gap-4 border-t pt-8 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalBuilders > 0 ? `${stats.totalBuilders}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Builders</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalStateLeads}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">State Leads</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalCities > 0 ? `${stats.totalCities}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Cities Active</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalCampusLeads > 0 ? `${stats.totalCampusLeads}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Campus Leads</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalColleges > 0 ? `${stats.totalColleges}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Colleges</div>
            </div>
            <div>
              <div className="text-foreground text-2xl font-bold sm:text-3xl">
                {stats.totalEventsHosted > 0 ? `${stats.totalEventsHosted}+` : "0"}
              </div>
              <div className="text-muted-foreground mt-1 text-xs">Events Hosted</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community Hierarchy: Simple vertical stepper with border-l border-border ─── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-10">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Structural Hierarchy
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Community Hierarchy
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            A clear, decentralized structure: from platform governance to states, city hubs, campus
            chapters, and individual builders.
          </p>
        </div>

        {/* Vertical Stepper List */}
        <div className="border-border relative ml-4 space-y-8 border-l pl-6">
          {HIERARCHY_TIERS.map((tier) => (
            <div key={tier.tier} className="relative">
              {/* Stepper Node */}
              <span className="border-border bg-background text-foreground absolute top-0 -left-[37px] flex size-6 items-center justify-center rounded-full border font-mono text-xs font-semibold">
                {tier.tier}
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-foreground text-base font-semibold">{tier.role}</h3>
                  <span className="text-muted-foreground text-xs">• {tier.entity}</span>
                </div>
                <p className="text-muted-foreground text-xs font-medium">{tier.scope}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {tier.description}
                </p>
                <div className="text-muted-foreground pt-2 text-xs">
                  <strong className="text-foreground">Key Mandate:</strong> {tier.perks}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Progression Pathway ────────────────────────────────────────────── */}
      <section className="border-border bg-card border-y py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Progression Loop
            </p>
            <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
              Builder Progression Journey
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Every initiative is designed to move people toward deeper involvement and leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {PROGRESSION_STAGES.map((stage) => (
              <Card key={stage.step} className="space-y-2 p-4">
                <span className="text-primary font-mono text-xs font-bold">{stage.step}</span>
                <h3 className="text-foreground text-sm font-semibold">{stage.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{stage.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Action CTAs ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Action Funnels
          </p>
          <h2 className="text-foreground mt-1 text-2xl font-bold sm:text-3xl">
            Take Your Next Step
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Apply for state or campus leadership, start a recognized chapter, mentor builders, or
            take the stage.
          </p>
        </div>

        <CommunityCtaGrid />
      </section>

      {/* ─── State Leads Directory ───────────────────────────────────────────── */}
      {stateLeads.length > 0 && (
        <section className="border-border border-t py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-foreground text-xl font-bold">State Leadership Directorate</h2>
                <p className="text-muted-foreground text-xs">
                  Regional directors overseeing multi-city developer operations
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="/state-leads">
                  <span>View Program</span>
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {stateLeads.map((sl) => (
                <Card key={sl.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="border-border bg-muted text-foreground flex size-11 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold">
                      {sl.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-foreground truncate text-sm font-semibold">
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
          </div>
        </section>
      )}

      {/* ─── Campus Leads Directory ─────────────────────────────────────────── */}
      {campusLeads.length > 0 && (
        <section className="border-border border-t py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-foreground text-xl font-bold">Campus Leads & Chapters</h2>
                <p className="text-muted-foreground text-xs">
                  University student leaders spearheading campus coding cultures
                </p>
              </div>
              <Button asChild variant="secondary" size="sm">
                <Link href="/campus-leads">
                  <span>View Program</span>
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {campusLeads.map((lead) => (
                <Card key={lead.id} className="space-y-3 p-5">
                  <div className="flex items-start gap-3">
                    <div className="border-border bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold">
                      {lead.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h3 className="text-foreground truncate text-sm font-semibold">
                        {lead.name}
                      </h3>
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
                      <span className="text-muted-foreground block text-xs uppercase">
                        Builders
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Active City Communities ────────────────────────────────────────── */}
      {cityHubs.length > 0 && (
        <section className="border-border border-t py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="border-border border-b pb-4">
              <h2 className="text-foreground text-xl font-bold">Active City Communities & Hubs</h2>
              <p className="text-muted-foreground text-xs">
                Cities with recurring meetups, workshops, and college chapters
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cityHubs.map((city) => (
                <Card key={city.id} className="space-y-1.5 p-4">
                  <div className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin className="text-muted-foreground size-3.5 shrink-0" />
                    <span className="truncate">{city.name}</span>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">{city.state}</p>
                  <div className="border-border text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
                    <span>{city.collegesCount} Colleges</span>
                    <span>{city.eventsCount} Events</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
