// src/app/me/mentor/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMentorIncomingBookings } from "@/server/speakers/service";
import { MentorCockpitClient } from "@/components/network/MentorCockpitClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentor Cockpit | KailshiansX",
  description: "Manage incoming builder booking requests, availability hours, and sessions.",
};

export default async function MentorDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/me/mentor");
  }

  // Find or provision speaker profile for mentor
  let speaker = await db.speaker.findFirst({
    where: { userId: session.user.id },
  });

  if (!speaker) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    const slug = `${(user?.username || user?.name || "mentor").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${session.user.id.slice(-6)}`;
    speaker = await db.speaker.create({
      data: {
        name: user?.name || "Anonymous Mentor",
        slug,
        userId: session.user.id,
        bio: user?.bio,
        designation: user?.headline || "Engineering Mentor",
        topics: user?.skills || ["Distributed Systems", "Full Stack Next.js"],
        sessionTypes: ["1:1 Mentorship", "System Architecture Review"],
        isMentor: true,
        isSpeaker: true,
      },
    });
  }

  const incomingBookings = await getMentorIncomingBookings(session.user.id);

  return (
    <MentorCockpitClient
      initialBookings={incomingBookings.map((b) => ({
        ...b,
        preferredDate: b.preferredDate.toISOString(),
        createdAt: b.createdAt.toISOString(),
      }))}
      initialSpeakerProfile={speaker}
    />
  );
}
