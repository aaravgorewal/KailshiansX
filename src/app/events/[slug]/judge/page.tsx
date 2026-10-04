import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getJudgeEvaluationQueue } from "@/server/hackathons/service";
import { JudgePortalClient, type JudgeQueueData } from "@/components/hackathons/JudgePortalClient";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface JudgePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JudgePageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.event.findUnique({
    where: { slug },
    select: { title: true },
  });

  return {
    title: event ? `Judge Portal — ${event.title} | KailshiansX` : "Judge Portal | KailshiansX",
    description:
      "Grand jury evaluation and rubric scoring cockpit for hackathon project submissions.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function JudgePortalPage({ params }: JudgePageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=/events/${slug}/judge`);
  }

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      hackathonDetail: true,
    },
  });

  if (!event || event.type !== "HACKATHON" || !event.hackathonDetail) {
    notFound();
  }

  const queue = await getJudgeEvaluationQueue(event.hackathonDetail.id, session.user.id);

  if (!queue) {
    return (
      <div className="bg-surface-950 text-surface-100 flex min-h-screen items-center justify-center p-4">
        <div className="border-surface-800 bg-surface-900/60 w-full max-w-md space-y-4 rounded-3xl border p-8 text-center backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-black text-white">Access Restricted</h1>
          <p className="text-surface-400 text-xs sm:text-sm">
            You do not have an active judge assignment for{" "}
            <strong className="text-surface-200">{event.title}</strong>. If you are an official jury
            member, please contact the hackathon director to assign your judge account.
          </p>
          <div className="pt-2">
            <Button variant="outline" asChild className="w-full">
              <Link href={`/events/${event.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Hackathon
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Serialize queue for client
  const initialData: JudgeQueueData = {
    event: {
      id: event.id,
      title: event.title,
      slug: event.slug,
    },
    judge: {
      id: queue.judge.id,
      title: queue.judge.title,
      company: queue.judge.company,
      track: queue.judge.track,
      active: queue.judge.active,
    },
    rubrics: queue.rubrics.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      maxScore: r.maxScore,
      weight: Number(r.weight),
      sortOrder: r.sortOrder,
    })),
    submissions: queue.submissions.map((sub) => ({
      id: sub.id,
      teamId: sub.teamId,
      title: sub.title,
      tagline: sub.tagline,
      description: sub.description,
      track: sub.track,
      repoUrl: sub.repoUrl,
      demoUrl: sub.demoUrl,
      deckUrl: sub.deckUrl,
      videoUrl: sub.videoUrl,
      techStack: sub.techStack,
      status: sub.status,
      submittedAt: sub.submittedAt.toISOString(),
      team: {
        id: sub.team.id,
        name: sub.team.name,
        members: sub.team.members.map((m) => ({
          id: m.id,
          role: m.role,
          user: {
            name: m.user.name,
            email: m.user.email,
          },
        })),
      },
      problemStatement: sub.problemStatement
        ? {
            id: sub.problemStatement.id,
            title: sub.problemStatement.title,
          }
        : null,
      myScore: sub.myScore
        ? {
            id: sub.myScore.id,
            totalScore: Number(sub.myScore.totalScore),
            criteriaScores: sub.myScore.criteriaScores,
            feedback: sub.myScore.feedback,
            privateNotes: sub.myScore.privateNotes,
          }
        : null,
    })),
  };

  return <JudgePortalClient initialData={initialData} />;
}
