"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/format-date";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export interface SerializedHackathonDetail {
  minTeamSize: number;
  maxTeamSize: number;
  rules: string | null;
  submissionUrl: string | null;
  submissionDeadline: string | null;
  prizes: Array<{
    title: string;
    amount: string;
    perks?: string[];
  }> | null;
  problemStatements: Array<{
    id: string;
    track: string;
    title: string;
    description: string;
    criteria?: string[];
  }> | null;
  results: Array<{
    rank: number;
    title: string;
    teamName: string;
    projectName: string;
    description?: string;
    repoUrl?: string;
    demoUrl?: string;
    track?: string;
  }> | null;
}

export interface SerializedHackathonEdition {
  id: string;
  editionNo: number;
  theme: string | null;
  event: {
    id: string;
    slug: string;
    title: string;
    overview: string | null;
    startDate: string;
    endDate: string | null;
    venue: string | null;
    city: { name: string; state: string } | null;
    tracks: Array<{
      id: string;
      name: string;
      description: string | null;
      color: string | null;
    }>;
    scheduleItems: Array<{
      id: string;
      title: string;
      description: string | null;
      startTime: string;
      endTime: string | null;
    }>;
    speakers: Array<{
      role: string;
      speaker: {
        id: string;
        name: string;
        designation: string | null;
        organisation: string | null;
        photo: string | null;
        bio: string | null;
        linkedin: string | null;
        github: string | null;
      };
    }>;
    partners: Array<{
      tier: string;
      partner: {
        id: string;
        name: string;
        logo: string | null;
        website: string | null;
      };
    }>;
    ticketTypes: Array<{
      id: string;
      name: string;
      price: number;
      quota: number;
    }>;
    galleryAlbums: Array<{
      title: string;
      images: Array<{
        id: string;
        url: string;
        caption: string | null;
      }>;
    }>;
    hackathonDetail: SerializedHackathonDetail | null;
  };
}

interface HackathonSeriesClientProps {
  series: {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    description: string | null;
    purpose: string | null;
    city: string | null;
    region: string | null;
  };
  editions: SerializedHackathonEdition[];
  initialEditionNo: number;
}

export function HackathonSeriesClient({
  series,
  editions,
  initialEditionNo,
}: HackathonSeriesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeEditionNo = Number(searchParams.get("edition")) || initialEditionNo;
  const currentEdition = editions.find((e) => e.editionNo === activeEditionNo) || editions[0];

  const handleSelectEdition = (editionNo: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("edition", String(editionNo));
    router.push(`/hackathon-series/${series.slug}?${params.toString()}`, { scroll: false });
  };

  if (!currentEdition) return null;

  const event = currentEdition.event;
  const detail = event.hackathonDetail;
  const isPast = new Date(event.startDate) < new Date();

  const judges = event.speakers.filter((s) => s.role === "JUDGE");
  const mentors = event.speakers.filter((s) => s.role === "MENTOR");

  return (
    <div className="space-y-12">
      {/* Edition Selector Bar */}
      <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-bold">Hackathon Editions</h2>
          <p className="text-muted-foreground text-xs">
            Select an edition to view problem statements, prizes, and schedule
          </p>
        </div>

        {/* Neutral Chips: selected = border-primary */}
        <div className="inline-flex flex-wrap gap-2">
          {editions.map((ed) => {
            const isSelected = ed.editionNo === activeEditionNo;
            const edIsPast = new Date(ed.event.startDate) < new Date();

            return (
              <button
                key={ed.id}
                type="button"
                onClick={() => handleSelectEdition(ed.editionNo)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-primary bg-background text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Season {String(ed.editionNo).padStart(2, "0")}</span>
                <span className="text-muted-foreground ml-1.5">
                  ({edIsPast ? "Past" : "Upcoming"})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Edition Card */}
      <Card className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground text-xs font-semibold">
              Season {String(currentEdition.editionNo).padStart(2, "0")}
            </span>

            {currentEdition.theme && (
              <span className="text-muted-foreground text-xs">• Theme: {currentEdition.theme}</span>
            )}
          </div>

          <div className="text-muted-foreground flex items-center gap-4 text-xs">
            {detail && (
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                <span>
                  Teams: {detail.minTeamSize}–{detail.maxTeamSize} builders
                </span>
              </div>
            )}
            <span className="text-foreground font-medium">
              {isPast ? "Season Concluded" : "Registrations Open"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-foreground text-xl font-bold sm:text-2xl">{event.title}</h3>
          {event.overview && (
            <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed sm:text-sm">
              {event.overview}
            </p>
          )}
        </div>

        {/* Date, Venue, City */}
        <div className="border-border text-muted-foreground flex flex-wrap items-center gap-6 border-t pt-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            <span>36 Continuous Hours</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            <span>
              {event.venue || "Convention Centre"},{" "}
              {event.city ? `${event.city.name}, ${event.city.state}` : "India"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-border flex flex-wrap items-center gap-3 border-t pt-4">
          {!isPast ? (
            <Button asChild variant="primary" size="md">
              <Link href={`/events/${event.slug}/register`}>
                <span>Register Team Pass</span>
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" size="md">
              <a href="#results">
                <span>View Results & Projects</span>
              </a>
            </Button>
          )}

          {detail?.submissionUrl && (
            <Button asChild variant="secondary" size="md">
              <a href={detail.submissionUrl} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="mr-1.5 size-3.5" />
                <span>Submissions Repo</span>
                <ExternalLink className="ml-1 size-3" />
              </a>
            </Button>
          )}

          <Button asChild variant="ghost" size="md">
            <Link href={`/events/${event.slug}`}>
              <span>Full Event Page</span>
            </Link>
          </Button>
        </div>
      </Card>

      {/* Tracks Section */}
      {event.tracks.length > 0 && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Hackathon Tracks</h3>
            <p className="text-muted-foreground text-xs">
              Select a track tailored to your product build focus
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {event.tracks.map((track) => (
              <Card key={track.id} className="space-y-2 p-5">
                <h4 className="text-foreground text-sm font-semibold">{track.name}</h4>
                {track.description && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {track.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Problem Statements */}
      {detail?.problemStatements && detail.problemStatements.length > 0 && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Problem Statements</h3>
            <p className="text-muted-foreground text-xs">
              Industry problem statements and engineering challenges
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {detail.problemStatements.map((ps) => (
              <Card key={ps.id} className="flex flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{ps.track}</span>
                    <span className="text-muted-foreground font-mono">{ps.id}</span>
                  </div>

                  <h4 className="text-foreground text-sm font-semibold">{ps.title}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{ps.description}</p>
                </div>

                {ps.criteria && ps.criteria.length > 0 && (
                  <div className="border-border space-y-1 border-t pt-3">
                    <span className="text-foreground block text-xs font-medium">Criteria:</span>
                    <ul className="text-muted-foreground list-inside list-disc space-y-0.5 text-xs">
                      {ps.criteria.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Prizes Section: Table Format */}
      {detail?.prizes && detail.prizes.length > 0 && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Prize Pool</h3>
            <p className="text-muted-foreground text-xs">
              Bounties, awards, and cloud compute rewards
            </p>
          </div>

          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-muted/60 text-muted-foreground border-b">
                <tr>
                  <th className="p-3.5 font-medium">Tier / Standing</th>
                  <th className="p-3.5 font-medium">Prize Category</th>
                  <th className="p-3.5 font-medium">Reward / Amount</th>
                  <th className="p-3.5 font-medium">Perks & Bounties</th>
                </tr>
              </thead>
              <tbody className="divide-border bg-card divide-y">
                {detail.prizes.map((prize, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 transition-colors">
                    <td className="text-muted-foreground p-3.5 font-mono">Tier {idx + 1}</td>
                    <td className="text-foreground p-3.5 font-medium">{prize.title}</td>
                    <td className="text-foreground p-3.5 font-bold">{prize.amount}</td>
                    <td className="text-muted-foreground p-3.5">
                      {prize.perks && prize.perks.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {prize.perks.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="border-border bg-muted text-foreground rounded border px-2 py-0.5 text-xs"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Rules Section */}
      {detail?.rules && (
        <section className="space-y-3">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Rules & Guidelines</h3>
            <p className="text-muted-foreground text-xs">
              Submission guidelines, commit deadlines, and code policies
            </p>
          </div>

          <Card className="space-y-3 p-5 sm:p-6">
            <div className="text-foreground flex items-center gap-2 text-xs font-semibold">
              <ShieldAlert className="size-4" />
              <span>Official Rules</span>
            </div>
            <pre className="text-muted-foreground font-sans text-xs leading-relaxed whitespace-pre-wrap">
              {detail.rules}
            </pre>
          </Card>
        </section>
      )}

      {/* Timeline: Simple Vertical List */}
      {event.scheduleItems.length > 0 && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Timeline</h3>
            <p className="text-muted-foreground text-xs">
              Checkpoints, submission freeze, and judging schedule
            </p>
          </div>

          <div className="space-y-2.5">
            {event.scheduleItems.map((slot) => {
              const timeStr = formatTime(slot.startTime);
              const dateStr = formatDate(slot.startTime);

              return (
                <div
                  key={slot.id}
                  className="border-border bg-card flex flex-col gap-1 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5">
                    <h4 className="text-foreground text-xs font-semibold">{slot.title}</h4>
                    {slot.description && (
                      <p className="text-muted-foreground text-xs">{slot.description}</p>
                    )}
                  </div>
                  <div className="text-muted-foreground shrink-0 text-xs sm:text-right">
                    <span className="text-foreground font-medium">{timeStr}</span>
                    <span className="ml-2">• {dateStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Judges & Mentors */}
      {(judges.length > 0 || mentors.length > 0) && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Judges & Mentors</h3>
            <p className="text-muted-foreground text-xs">
              Architects reviewing project code, architecture, and live demos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[...judges, ...mentors].map((item, idx) => (
              <Card key={idx} className="flex flex-col justify-between space-y-3 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border text-xs font-semibold">
                      {item.speaker.name.slice(0, 2).toUpperCase()}
                    </div>
                    <Badge variant="neutral">{item.role === "JUDGE" ? "Judge" : "Mentor"}</Badge>
                  </div>

                  <div>
                    <h4 className="text-foreground text-xs font-semibold">{item.speaker.name}</h4>
                    <p className="text-muted-foreground truncate text-xs">
                      {item.speaker.designation}
                      {item.speaker.organisation ? ` @ ${item.speaker.organisation}` : ""}
                    </p>
                  </div>
                </div>

                <div className="border-border text-muted-foreground flex items-center gap-3 border-t pt-2 text-xs">
                  {item.speaker.linkedin && (
                    <a
                      href={item.speaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      LinkedIn
                    </a>
                  )}
                  {item.speaker.github && (
                    <a
                      href={item.speaker.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Sponsors & Partners */}
      {event.partners.length > 0 && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Sponsors & Partners</h3>
            <p className="text-muted-foreground text-xs">
              Infrastructure and prizes provided by our ecosystem partners
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {event.partners.map((item, idx) => (
              <Card
                key={idx}
                className="flex flex-col items-center justify-center space-y-1.5 p-4 text-center"
              >
                <Building className="text-muted-foreground size-5" />
                <span className="text-foreground text-xs font-semibold">{item.partner.name}</span>
                <span className="text-muted-foreground text-xs">{item.tier || "Partner"}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Results & Winning Projects Showcase */}
      {detail?.results && detail.results.length > 0 && (
        <section id="results" className="space-y-4 pt-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Results & Podium Teams</h3>
            <p className="text-muted-foreground text-xs">
              Verified winners and project repositories
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {detail.results.map((result) => (
              <Card key={result.rank} className="flex flex-col justify-between space-y-3 p-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold">Rank #{result.rank}</span>
                    <span className="text-muted-foreground">{result.title}</span>
                  </div>

                  <div>
                    <h4 className="text-foreground text-sm font-semibold">{result.projectName}</h4>
                    <p className="text-muted-foreground text-xs">by {result.teamName}</p>
                  </div>

                  {result.description && (
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {result.description}
                    </p>
                  )}
                </div>

                <div className="border-border flex items-center gap-2 border-t pt-3">
                  {result.repoUrl && (
                    <Button asChild variant="secondary" size="sm">
                      <a href={result.repoUrl} target="_blank" rel="noopener noreferrer">
                        <GithubIcon className="mr-1.5 size-3.5" />
                        <span>Code</span>
                      </a>
                    </Button>
                  )}
                  {result.demoUrl && (
                    <Button asChild variant="ghost" size="sm">
                      <a href={result.demoUrl} target="_blank" rel="noopener noreferrer">
                        <span>Demo</span>
                        <ExternalLink className="ml-1 size-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      {event.galleryAlbums.length > 0 && event.galleryAlbums[0].images.length > 0 && (
        <section className="space-y-4">
          <div className="border-border border-b pb-3">
            <h3 className="text-foreground text-lg font-bold">Highlights Gallery</h3>
            <p className="text-muted-foreground text-xs">
              Photographs captured across hackathon sprints and presentations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {event.galleryAlbums[0].images.map((img) => (
              <div
                key={img.id}
                className="border-border bg-muted relative aspect-video overflow-hidden rounded-lg border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption || "Hackathon highlight"}
                  className="size-full object-cover"
                />
                {img.caption && (
                  <div className="bg-scrim absolute inset-0 flex flex-col justify-end p-3">
                    <p className="text-foreground truncate text-xs font-medium">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
