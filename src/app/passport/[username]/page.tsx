// src/app/passport/[username]/page.tsx
// Public, shareable Developer Passport page.
// Shows participation timeline, progression ladder, milestone badges, and verified credentials.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDeveloperPassportData } from "@/server/users/passport";
import { DeveloperPassportCard } from "@/components/profile/DeveloperPassportCard";
import { ProgressionLadder } from "@/components/profile/ProgressionLadder";
import { BadgesGrid } from "@/components/profile/BadgesGrid";
import { ParticipationTimeline } from "@/components/profile/ParticipationTimeline";
import { ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const clean = decodeURIComponent(username).toLowerCase().trim();

  const user = await db.user.findFirst({
    where: {
      OR: [{ username: { equals: clean, mode: "insensitive" } }, { id: clean }],
    },
    select: { name: true, username: true, headline: true, isPassportPublic: true },
  });

  if (!user) {
    return { title: "Developer Passport Not Found | KailshiansX" };
  }

  const name = user.name || "Developer";
  const handle = user.username || clean;

  return {
    title: `${name} (@${handle}) • Developer Passport | KailshiansX`,
    description:
      user.headline ||
      `Verified developer achievements, progression badges, and activity timeline for ${name} in the KailshiansX tech community.`,
    openGraph: {
      title: `${name} (@${handle}) • Developer Passport`,
      description:
        user.headline || "Verified credentials, progression badges, and community timeline.",
      type: "profile",
      siteName: "KailshiansX",
    },
  };
}

export default async function PublicPassportPage({ params }: Props) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username).toLowerCase().trim();

  // Look up user by username or fallback to ID
  const user = await db.user.findFirst({
    where: {
      OR: [{ username: { equals: cleanUsername, mode: "insensitive" } }, { id: cleanUsername }],
    },
    select: { id: true, isPassportPublic: true, name: true, username: true },
  });

  if (!user) {
    notFound();
  }

  const session = await auth();
  const isOwner = session?.user?.id === user.id;

  // If passport is private and visitor is not owner, show privacy card
  if (!user.isPassportPublic && !isOwner) {
    return (
      <main className="bg-background flex min-h-screen items-center justify-center px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="border-border bg-card w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="border-border bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-extrabold">This Passport is Private</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            @{user.username || "builder"} has chosen to keep their Developer Passport credentials
            and activity private.
          </p>
          <Link
            href="/"
            className="text-foreground bg-muted hover:bg-muted border-border hover:text-foreground inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to KailshiansX</span>
          </Link>
        </div>
      </main>
    );
  }

  const passport = await getDeveloperPassportData(user.id);
  if (!passport) {
    notFound();
  }

  return (
    <main className="bg-background min-h-screen px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Top Breadcrumb and Official Verification Ribbon */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Link
            href="/community"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 self-start text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Community</span>
          </Link>

          <div className="text-muted-foreground bg-card border-border flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-sm sm:self-auto">
            <CheckCircle2 className="text-success h-3.5 w-3.5" />
            <span>Verified Developer Credential • KailshiansX Platform</span>
          </div>
        </div>

        {/* Developer Passport Card */}
        <DeveloperPassportCard passport={passport} isOwner={isOwner} />

        {/* Progression Ladder */}
        <ProgressionLadder progression={passport.progression} />

        {/* Achievement Badges Showcase */}
        <BadgesGrid badges={passport.badges} />

        {/* Participation Timeline */}
        <ParticipationTimeline timeline={passport.timeline} />

        {/* Footer verification note */}
        <div className="border-border text-muted-foreground border-t pt-6 text-center text-xs">
          <p>
            KailshiansX Developer Passport provides cryptographic, verified proof of attendance,
            workshop builds, and leadership contributions.
          </p>
        </div>
      </div>
    </main>
  );
}
