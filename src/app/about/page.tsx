import type { Metadata } from "next";
import { db } from "@/lib/db";
import { OPENINGS } from "@/lib/team-constants";
import { FounderAvatar } from "./FounderAvatar";
import { OpenRolesSection } from "./OpenRolesSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About | KailshiansX",
  description:
    "Building India's developer ecosystem through production-grade hackathons, technical masterclasses, and collegiate builder chapters.",
};

export default async function AboutPage() {
  const [founder, teamMembers] = await Promise.all([
    db.founderContent
      .findFirst({
        where: { isPublished: true },
        orderBy: { updatedAt: "desc" },
      })
      .then(async (res) => res ?? db.founderContent.findFirst({ orderBy: { updatedAt: "desc" } })),
    db.coreTeamMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const roles = OPENINGS.map((op) => ({
    id: op.id,
    title: op.title,
    area: op.area,
  }));

  return (
    <main className="container-page min-h-screen space-y-16 py-16 sm:py-24">
      {/* 1. H1 statement (one sentence mission) & 2. short paragraph */}
      <section id="about-mission" className="max-w-3xl space-y-6">
        <h1 className="text-foreground text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
          Building India&apos;s developer ecosystem through production-grade hackathons, technical
          masterclasses, and collegiate builder chapters.
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
          KailshiansX gives aspiring software engineers, open-source contributors, and campus
          organizers the platform, industry mentorship, and resources needed to ship impactful
          technology.
        </p>
      </section>

      {/* 3. "Founder" row (photo from CMS/admin upload or initials avatar, name, 2–3 sentence message from CMS) */}
      {founder && founder.founderName && (
        <section id="about-founder" className="border-border border-t pt-12 pb-2">
          <h2 className="text-muted-foreground mb-6 font-mono text-xs tracking-wider uppercase">
            Founder
          </h2>
          <div className="flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-start">
            <FounderAvatar photo={founder.photo} name={founder.founderName} />
            <div className="space-y-2">
              <h3 className="text-foreground text-base font-semibold">{founder.founderName}</h3>
              {founder.message && (
                <p className="text-muted-foreground text-sm leading-relaxed">{founder.message}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. "Team" as a plain grid of name + role + links (from DB; hide if empty) */}
      {teamMembers.length > 0 && (
        <section id="about-team" className="border-border border-t pt-12 pb-2">
          <h2 className="text-muted-foreground mb-6 font-mono text-xs tracking-wider uppercase">
            Team
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="space-y-1.5">
                <h3 className="text-foreground text-sm font-semibold">{member.name}</h3>
                <p className="text-muted-foreground text-xs">{member.role}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-xs">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                  {member.github && (
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  {member.twitter && (
                    <a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      X
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      Email
                    </a>
                  )}
                  {member.website && (
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. "Open roles" as Rows (title, area, apply button) that open Dialog form */}
      {roles.length > 0 && <OpenRolesSection roles={roles} />}
    </main>
  );
}
