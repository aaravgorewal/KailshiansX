import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth/require-role";
import { db } from "@/lib/db";
import {
  AdminHackathonControlClient,
  type AdminHackathonData,
} from "@/components/hackathons/AdminHackathonControlClient";

interface AdminHackathonPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Hackathon Control Room | KailshiansX Admin",
  description:
    "Live management of submissions, judge scoring matrix, prize payouts, and certificate issuance.",
};

export default async function AdminHackathonPage({ params }: AdminHackathonPageProps) {
  await requireAdmin();
  const { id } = await params;

  // Lookup hackathon detail by either HackathonDetail ID or Event ID
  const detail = await db.hackathonDetail.findFirst({
    where: {
      OR: [{ id }, { eventId: id }],
    },
    include: {
      event: true,
      teams: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
      submissions: {
        include: {
          team: true,
          scores: true,
        },
        orderBy: [{ normalizedScore: "desc" }, { submittedAt: "asc" }],
      },
      judges: {
        include: {
          user: true,
        },
      },
      prizesList: {
        include: {
          winningTeam: true,
        },
        orderBy: { rank: "asc" },
      },
    },
  });

  if (!detail) {
    notFound();
  }

  const initialData: AdminHackathonData = {
    event: {
      id: detail.event.id,
      title: detail.event.title,
      slug: detail.event.slug,
    },
    detail: {
      id: detail.id,
      eventId: detail.eventId,
      isResultsPublished: detail.isResultsPublished,
      resultsPublishedAt: detail.resultsPublishedAt?.toISOString() || null,
    },
    teams: detail.teams.map((t) => ({
      id: t.id,
      name: t.name,
      track: t.track,
      status: t.status,
      inviteCode: t.inviteCode,
      members: t.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: {
          name: m.user.name,
          email: m.user.email,
        },
      })),
    })),
    submissions: detail.submissions.map((sub) => ({
      id: sub.id,
      teamId: sub.teamId,
      teamName: sub.team.name,
      title: sub.title,
      track: sub.track,
      repoUrl: sub.repoUrl,
      demoUrl: sub.demoUrl,
      deckUrl: sub.deckUrl,
      videoUrl: sub.videoUrl,
      normalizedScore: sub.normalizedScore ? Number(sub.normalizedScore) : null,
      rank: sub.rank,
      isWinner: sub.isWinner,
      winnerTier: sub.winnerTier,
      evaluationsCount: sub.scores.length,
      submittedAt: sub.submittedAt.toISOString(),
    })),
    judges: detail.judges.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      track: j.track,
      active: j.active,
      user: {
        id: j.user.id,
        name: j.user.name,
        email: j.user.email,
      },
    })),
    prizes: detail.prizesList.map((p) => ({
      id: p.id,
      title: p.title,
      track: p.track,
      rank: p.rank,
      cashAmount: Number(p.cashAmount),
      currency: p.currency,
      disbursementStatus: p.disbursementStatus,
      disbursedAt: p.disbursedAt?.toISOString() || null,
      transactionRef: p.transactionRef,
      winningTeam: p.winningTeam
        ? {
            id: p.winningTeam.id,
            name: p.winningTeam.name,
          }
        : null,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <AdminHackathonControlClient initialData={initialData} />
    </div>
  );
}
