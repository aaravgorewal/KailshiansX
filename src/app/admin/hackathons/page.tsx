import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/require-role";
import { db } from "@/lib/db";
import { Trophy, Calendar, Gavel, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Hackathon Engine | KailshiansX Admin",
  description:
    "Manage hackathons, team formations, problem statements, judging, and prize disbursements.",
};

export default async function AdminHackathonsIndexPage() {
  await requireAdmin();

  const hackathons = await db.event.findMany({
    where: {
      type: "HACKATHON",
      deletedAt: null,
    },
    include: {
      city: true,
      hackathonDetail: {
        include: {
          _count: {
            select: {
              teams: true,
              submissions: true,
              judges: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            <Trophy className="text-brand-400 h-7 w-7" />
            Hackathons Engine Control
          </h1>
          <p className="text-surface-400 mt-1 text-xs sm:text-sm">
            Manage teams, problem statements, submissions, rubric scoring, leaderboards, and prize
            disbursements per .
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((h) => {
          const detail = h.hackathonDetail;
          const isPublished = detail?.isResultsPublished;

          return (
            <div
              key={h.id}
              className="border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-xl transition-all hover:shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-brand-500/10 border-brand-500/20 text-brand-400 rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
                    Hackathon
                  </span>
                  {isPublished ? (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Results Published
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-400">
                      Judging Active
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">{h.title}</h2>
                  <div className="text-surface-400 mt-1 flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(h.startDate).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>&bull;</span>
                    <span>{h.city?.name || "India (Online)"}</span>
                  </div>
                </div>

                {detail && (
                  <div className="border-surface-800 grid grid-cols-3 gap-2 border-y py-3 text-center">
                    <div>
                      <div className="text-surface-400 text-[10px] font-bold uppercase">Teams</div>
                      <div className="mt-0.5 font-mono text-base font-black text-white">
                        {detail._count.teams}
                      </div>
                    </div>
                    <div>
                      <div className="text-surface-400 text-[10px] font-bold uppercase">
                        Projects
                      </div>
                      <div className="text-brand-400 mt-0.5 font-mono text-base font-black">
                        {detail._count.submissions}
                      </div>
                    </div>
                    <div>
                      <div className="text-surface-400 text-[10px] font-bold uppercase">Judges</div>
                      <div className="mt-0.5 font-mono text-base font-black text-purple-400">
                        {detail._count.judges}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-6">
                <Button
                  className="bg-brand-500 hover:bg-brand-600 w-full font-bold text-white"
                  asChild
                >
                  <Link href={`/admin/hackathons/${detail?.id || h.id}`}>
                    Control Room &amp; Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/events/${h.slug}/judge`}>
                      <Gavel className="mr-1 h-3.5 w-3.5 text-purple-400" />
                      Judge View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/events/${h.slug}`} target="_blank">
                      <ExternalLink className="mr-1 h-3.5 w-3.5" />
                      Public Page
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
