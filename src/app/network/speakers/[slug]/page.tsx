// src/app/network/speakers/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpeakerProfileBySlug } from "@/server/speakers/service";
import { Star, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const speaker = await getSpeakerProfileBySlug(slug);
  if (!speaker) {
    return { title: "Speaker Not Found | KailshiansX" };
  }
  return {
    title: `${speaker.name} — Mentor & Speaker | KailshiansX`,
    description: speaker.bio || "Verified KailshiansX engineering mentor.",
  };
}

export default async function SpeakerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const speaker = await getSpeakerProfileBySlug(slug);

  if (!speaker) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Header */}
      <section className="border-surface-800 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b from-purple-950/20 py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/network/speakers"
              className="text-surface-400 hover:text-surface-200 inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Network Directory</span>
            </Link>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-2 border-purple-500/30 bg-purple-500/10 text-3xl font-black text-purple-300">
              {speaker.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-bold text-purple-400">
                  Verified Mentor &amp; Speaker
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400">
                  {speaker.availabilityStatus}
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {speaker.name}
              </h1>

              <p className="text-surface-300 text-sm font-medium">
                {speaker.designation} {speaker.organisation ? `at ${speaker.organisation}` : ""}
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <span>{speaker.rating.toFixed(1)} / 5.0 rating</span>
                <span className="text-surface-500 font-normal">
                  ({speaker.totalSessionsConducted} sessions conducted)
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link href="/network/speakers">
                <Button className="bg-purple-600 font-bold text-white hover:bg-purple-500">
                  Book 1:1 Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Bio */}
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">About the Mentor</h2>
              <p className="text-surface-300 mt-3 text-sm leading-relaxed whitespace-pre-line">
                {speaker.bio ||
                  "Experienced technical builder and mentor within the KailshiansX network."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {speaker.topics.map((t) => (
                  <span
                    key={t}
                    className="border-surface-800 bg-surface-950 rounded-lg border px-2.5 py-1 text-xs font-medium text-purple-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Verified Reviews */}
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">Verified Builder Reviews</h2>
              <div className="mt-4 space-y-4">
                {speaker.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border-surface-800 bg-surface-950/60 rounded-2xl border p-4"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{rev.rating} / 5.0</span>
                        <span className="text-surface-500 font-normal">({rev.sessionType})</span>
                      </div>
                      <span className="text-surface-500">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {rev.feedback && (
                      <p className="text-surface-300 mt-2 text-xs leading-relaxed">
                        &ldquo;{rev.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                ))}

                {speaker.reviews.length === 0 && (
                  <p className="text-surface-500 py-4 text-center text-xs">
                    No public reviews yet. Be the first to book a session!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border-surface-800 bg-surface-900/60 rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-base font-bold text-white">Session Formats</h3>
              <div className="mt-4 space-y-2 text-xs">
                {speaker.sessionTypes.map((st) => (
                  <div
                    key={st}
                    className="border-surface-800 bg-surface-950 text-surface-300 flex items-center gap-2 rounded-xl border p-2.5 font-medium"
                  >
                    <Video className="h-4 w-4 text-purple-400" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>

              <div className="border-surface-800 mt-6 space-y-2 border-t pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-400">Weekly Quota:</span>
                  <span className="font-bold text-white">
                    {speaker.weeklyAvailabilityHours} hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Preferred Cadence:</span>
                  <span className="max-w-[160px] truncate text-right font-bold text-white">
                    {speaker.preferredCadence || "Flexible"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Default Platform:</span>
                  <span className="font-bold text-emerald-400">
                    {speaker.meetingPlatform || "Google Meet"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
