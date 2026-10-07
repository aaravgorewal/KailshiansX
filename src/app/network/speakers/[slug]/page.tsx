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
    openGraph: {
      title: `${speaker.name} — Mentor & Speaker | KailshiansX`,
      description: speaker.bio || "Verified KailshiansX engineering mentor.",
      images: speaker.photo ? [{ url: speaker.photo }] : undefined,
    },
  };
}

export default async function SpeakerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const speaker = await getSpeakerProfileBySlug(slug);

  if (!speaker) {
    notFound();
  }

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Header */}
      <section className="border-border bg-card relative overflow-hidden border-b py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/network/speakers"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Network Directory</span>
            </Link>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="border-primary/30 bg-primary/10 text-primary flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-2 text-3xl font-black">
              {speaker.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-0.5 text-xs font-bold">
                  Verified Mentor &amp; Speaker
                </span>
                <span className="border-success/30 bg-success/10 text-success rounded-full border px-3 py-0.5 text-xs font-bold">
                  {speaker.availabilityStatus}
                </span>
              </div>

              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
                {speaker.name}
              </h1>

              <p className="text-muted-foreground text-sm font-medium">
                {speaker.designation} {speaker.organisation ? `at ${speaker.organisation}` : ""}
              </p>

              <div className="text-primary flex items-center gap-2 text-sm font-bold">
                <Star className="fill-warning text-warning h-4 w-4" />
                <span>{speaker.rating.toFixed(1)} / 5.0 rating</span>
                <span className="text-muted-foreground font-normal">
                  ({speaker.totalSessionsConducted} sessions conducted)
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link href="/network/speakers">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold">
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
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-foreground text-lg font-bold">About the Mentor</h2>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed whitespace-pre-line">
                {speaker.bio ||
                  "Experienced technical builder and mentor within the KailshiansX network."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {speaker.topics.map((t) => (
                  <span
                    key={t}
                    className="border-border bg-background text-primary rounded-lg border px-2.5 py-1 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Verified Reviews */}
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h2 className="text-foreground text-lg font-bold">Verified Builder Reviews</h2>
              <div className="mt-4 space-y-4">
                {speaker.reviews.map((rev) => (
                  <div key={rev.id} className="border-border bg-background rounded-2xl border p-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-primary flex items-center gap-1 font-bold">
                        <Star className="fill-warning text-warning h-3.5 w-3.5" />
                        <span>{rev.rating} / 5.0</span>
                        <span className="text-muted-foreground font-normal">
                          ({rev.sessionType})
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {rev.feedback && (
                      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        &ldquo;{rev.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                ))}

                {speaker.reviews.length === 0 && (
                  <p className="text-muted-foreground py-4 text-center text-xs">
                    No public reviews yet. Be the first to book a session!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-6 backdrop-blur-md">
              <h3 className="text-foreground text-base font-bold">Session Formats</h3>
              <div className="mt-4 space-y-2 text-xs">
                {speaker.sessionTypes.map((st) => (
                  <div
                    key={st}
                    className="border-border bg-background text-muted-foreground flex items-center gap-2 rounded-xl border p-2.5 font-medium"
                  >
                    <Video className="text-primary h-4 w-4" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>

              <div className="border-border mt-6 space-y-2 border-t pt-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weekly Quota:</span>
                  <span className="text-foreground font-bold">
                    {speaker.weeklyAvailabilityHours} hours
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred Cadence:</span>
                  <span className="text-foreground max-w-[160px] truncate text-right font-bold">
                    {speaker.preferredCadence || "Flexible"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Default Platform:</span>
                  <span className="text-success font-bold">
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
