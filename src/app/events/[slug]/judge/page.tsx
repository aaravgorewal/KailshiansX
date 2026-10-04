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
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center p-4">
        <div className="border-border bg-card w-full max-w-md space-y-4 rounded-lg border p-6 text-center sm:p-8">
          <div className="border-destructive/20 bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-md border">
            <ShieldAlert className="size-6" />
          </div>
          <h1 className="text-foreground text-xl font-bold">Access Restricted</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            You do not have an active judge assignment for{" "}
            <strong className="text-foreground">{event.title}</strong>. If you are an official jury
            member, please contact the hackathon director to assign your judge account.
          </p>
          <div className="pt-2">
            <Button variant="secondary" asChild className="w-full">
              <Link href={`/events/${event.slug}`}>
                <ArrowLeft className="mr-2 size-4" />
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
