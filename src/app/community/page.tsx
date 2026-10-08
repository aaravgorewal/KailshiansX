import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SITE_CONFIG } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { LeadApplicationForm } from "./LeadApplicationForm";

export const metadata: Metadata = {
  title: "Community | KailshiansX",
  description:
    "A developer collective uniting engineers, student builders, and regional leaders across India to learn, collaborate, and ship together.",
};

export default async function CommunityPage() {
  const session = await auth();

  let initialUser = undefined;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        linkedin: true,
      },
    });
    if (user) {
      initialUser = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        linkedin: user.linkedin,
      };
    }
  }

  // Active campus leads query (only real active leads from DB)
  const activeCampusLeads = await db.campusLead.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { name: true } },
      college: { select: { name: true } },
      application: { select: { name: true, college: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-screen py-16 sm:py-24">
      <div className="container-page mx-auto max-w-3xl space-y-16 sm:space-y-20">
        {/* 1. Hero Block */}
        <section className="space-y-6">
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Community
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed sm:text-lg">
            A developer collective uniting engineers, student builders, and regional leaders across
            India to learn, collaborate, and ship together.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild variant="primary" size="lg">
              <a
                href={SITE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="join-whatsapp-btn"
              >
                Join on WhatsApp
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#lead" id="become-lead-btn">
                Become a Campus Lead
              </a>
            </Button>
          </div>
        </section>

        {/* 2. "How it works": 4 numbered rows only (Attend -> Join -> Contribute -> Lead) */}
        <section className="space-y-6" id="how-it-works">
          <h2 className="font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            How it works
          </h2>
          <div className="divide-border border-border divide-y border-y">
            <div className="flex items-start gap-4 py-4 sm:gap-6 sm:py-5">
              <span className="text-muted-foreground shrink-0 pt-0.5 font-mono text-xs select-none sm:text-sm">
                01
              </span>
              <div>
                <span className="text-foreground font-medium">Attend</span>
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                  Show up at a local meetup, hackathon, or workshop in your city.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 py-4 sm:gap-6 sm:py-5">
              <span className="text-muted-foreground shrink-0 pt-0.5 font-mono text-xs select-none sm:text-sm">
                02
              </span>
              <div>
                <span className="text-foreground font-medium">Join</span>
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                  Enter regional builder circles and connect directly with peers on WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 py-4 sm:gap-6 sm:py-5">
              <span className="text-muted-foreground shrink-0 pt-0.5 font-mono text-xs select-none sm:text-sm">
                03
              </span>
              <div>
                <span className="text-foreground font-medium">Contribute</span>
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                  Build open-source projects, mentor students, or speak at upcoming community
                  sessions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 py-4 sm:gap-6 sm:py-5">
              <span className="text-muted-foreground shrink-0 pt-0.5 font-mono text-xs select-none sm:text-sm">
                04
              </span>
              <div>
                <span className="text-foreground font-medium">Lead</span>
                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">
                  Run a campus chapter or steer regional tech initiatives as an official lead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. #lead section: single application form */}
        <section id="lead" className="space-y-6 pt-2">
          <div className="space-y-2">
            <h2 className="font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              Lead a chapter
            </h2>
            <p className="text-muted-foreground text-sm">
              Apply to build and steer the developer culture at your campus or across your state.
            </p>
          </div>

          <LeadApplicationForm initialUser={initialUser} />
        </section>

        {/* 4. Active campus leads plain text list (if any exist in DB) */}
        {activeCampusLeads.length > 0 && (
          <section id="active-campus-leads" className="border-border space-y-3 border-t pt-6">
            <h3 className="text-foreground text-sm font-semibold">Campus leads</h3>
            <ul className="text-muted-foreground space-y-1.5 font-mono text-sm">
              {activeCampusLeads.map((lead) => {
                const leadName = lead.application?.name || lead.user?.name || "Campus Lead";
                const collegeName = lead.college?.name || lead.application?.college || "College";
                return (
                  <li key={lead.id}>
                    {leadName} — {collegeName}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
