"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Trophy,
  Zap,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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
  const startDate = new Date(event.startDate);
  const isPast = startDate < new Date();

  const judges = event.speakers.filter((s) => s.role === "JUDGE");
  const mentors = event.speakers.filter((s) => s.role === "MENTOR");

  return (
    <div className="space-y-16">
      {/* Edition Selector Bar */}
      <div className="border-surface-800 flex flex-col items-stretch justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h2 className="text-surface-100 text-xl font-bold">Select Hackathon Season</h2>
          <p className="text-surface-400 text-xs">
            Browse rules, problem statements, prizes, and results by edition
          </p>
        </div>

        <div className="bg-surface-900 border-surface-800 inline-flex rounded-2xl border p-1.5">
          {editions.map((ed) => {
            const isSelected = ed.editionNo === activeEditionNo;
            const edIsPast = new Date(ed.event.startDate) < new Date();

            return (
              <button
                key={ed.id}
                type="button"
                onClick={() => handleSelectEdition(ed.editionNo)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                <span>Season {String(ed.editionNo).padStart(2, "0")}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] ${
                    edIsPast ? "text-surface-400 bg-black/40" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {edIsPast ? "Results" : "Upcoming"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Edition Hero Card */}
      <section className="from-surface-900 via-surface-900/90 relative space-y-6 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br to-purple-950/20 p-6 shadow-2xl sm:p-9">
        <div className="pointer-events-none absolute -right-12 -bottom-12 size-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Badge variant="brand" className="gap-1.5 py-1 text-xs">
              <Zap className="size-3.5 text-purple-400" />
              <span>Season {String(currentEdition.editionNo).padStart(2, "0")}</span>
            </Badge>

            {currentEdition.theme && (
              <Badge variant="outline" className="border-purple-500/40 text-xs text-purple-300">
                Theme: {currentEdition.theme}
              </Badge>
            )}

            {isPast ? (
              <Badge variant="surface" className="text-xs">
                Season Completed
              </Badge>
            ) : (
              <Badge variant="success" className="animate-pulse text-xs">
                Registrations Open
              </Badge>
            )}
          </div>

          {/* Team Size Pill */}
          {detail && (
            <div className="bg-surface-950/80 border-surface-800 text-surface-200 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium">
              <Users className="text-brand-400 size-3.5" />
              <span>
                Team Size: {detail.minTeamSize} – {detail.maxTeamSize} Builders
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-surface-50 text-2xl font-extrabold tracking-tight sm:text-4xl">
            {event.title}
          </h3>
          {event.overview && (
            <p className="text-surface-300 max-w-3xl text-xs leading-relaxed sm:text-sm">
              {event.overview}
            </p>
          )}
        </div>

        {/* Date, Venue, City */}
        <div className="text-surface-300 flex flex-wrap items-center gap-6 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0 text-purple-400" />
            <span>
              {new Date(event.startDate).toLocaleDateString("en-IN", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="text-surface-400 size-4 shrink-0" />
            <span>36 Continuous Hours of Engineering</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-rose-400" />
            <span>
              {event.venue || "Convention Centre"},{" "}
              {event.city ? `${event.city.name}, ${event.city.state}` : "India"}
            </span>
          </div>
        </div>

        {/* CTAs Bar */}
        <div className="border-surface-800/80 flex flex-wrap items-center gap-3 border-t pt-4">
          {!isPast ? (
            <Button asChild variant="primary" size="lg" className="shadow-lg shadow-purple-500/25">
              <Link href={`/events/${event.slug}/register`}>
                <span>Register Team Pass</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="secondary" size="md">
              <a href="#results">
                <Trophy className="mr-2 size-4 text-amber-400" />
                <span>View Winners & Projects</span>
              </a>
            </Button>
          )}

          {detail?.submissionUrl && (
            <Button asChild variant="outline" size="md">
              <a href={detail.submissionUrl} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="mr-2 size-4" />
                <span>Submissions Repository</span>
                <ExternalLink className="text-surface-400 ml-1.5 size-3.5" />
              </a>
            </Button>
          )}

          <Button asChild variant="secondary" size="md">
            <Link href={`/events/${event.slug}`}>
              <span>View Full Event Page</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Tracks Section (PRD §9) */}
      {event.tracks.length > 0 && (
        <section className="space-y-6">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Hackathon Tracks</h3>
            <p className="text-surface-400 text-xs">
              Pick a domain and build solutions tailored to the core problem themes
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {event.tracks.map((track) => (
              <div
                key={track.id}
                className="border-surface-800 bg-surface-900/60 hover:border-surface-700 space-y-3 rounded-3xl border p-6 backdrop-blur-sm transition"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: track.color || "#8b5cf6" }}
                  />
                  <h4 className="text-surface-100 text-base font-bold">{track.name}</h4>
                </div>
                {track.description && (
                  <p className="text-surface-400 text-xs leading-relaxed">{track.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Problem Statements Section (PRD §9) */}
      {detail?.problemStatements && detail.problemStatements.length > 0 && (
        <section className="space-y-6">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Industry Problem Statements</h3>
            <p className="text-surface-400 text-xs">
              Vetted engineering challenges submitted by partner unicorns and tech collectives
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {detail.problemStatements.map((ps) => (
              <div
                key={ps.id}
                className="border-surface-800 bg-surface-900/80 flex flex-col justify-between space-y-4 rounded-3xl border p-6 shadow-lg transition hover:border-purple-500/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-purple-500/40 text-xs text-purple-300"
                    >
                      {ps.track}
                    </Badge>
                    <span className="text-surface-500 font-mono text-xs">{ps.id}</span>
                  </div>

                  <h4 className="text-surface-50 text-base leading-snug font-bold">{ps.title}</h4>
                  <p className="text-surface-300 text-xs leading-relaxed">{ps.description}</p>
                </div>

                {ps.criteria && ps.criteria.length > 0 && (
                  <div className="border-surface-800 space-y-2 border-t pt-3">
                    <span className="text-surface-400 block text-[10px] font-bold tracking-wider uppercase">
                      Evaluation Criteria:
                    </span>
                    <ul className="space-y-1">
                      {ps.criteria.map((c, i) => (
                        <li key={i} className="text-surface-300 flex items-start gap-2 text-xs">
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prizes Section (PRD §9) */}
      {detail?.prizes && detail.prizes.length > 0 && (
        <section className="space-y-6">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Prize Pool & Bounties</h3>
            <p className="text-surface-400 text-xs">
              Direct cash rewards, compute credits, and seed incubation backing
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {detail.prizes.map((prize, idx) => {
              const isFirst = idx === 0;

              return (
                <div
                  key={idx}
                  className={`flex flex-col justify-between space-y-4 rounded-3xl border p-6 shadow-xl sm:p-7 ${
                    isFirst
                      ? "via-surface-900 to-surface-950 border-amber-500/40 bg-gradient-to-b from-amber-950/20"
                      : "border-surface-800 bg-surface-900/60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Trophy
                        className={`size-6 ${isFirst ? "text-amber-400" : "text-purple-400"}`}
                      />
                      <Badge variant={isFirst ? "accent" : "surface"} className="text-xs">
                        Tier {idx + 1}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-surface-200 text-sm font-bold">{prize.title}</h4>
                      <p className="text-surface-50 mt-1 text-2xl font-black">{prize.amount}</p>
                    </div>

                    {prize.perks && prize.perks.length > 0 && (
                      <div className="border-surface-800/80 space-y-1.5 border-t pt-3">
                        {prize.perks.map((perk, pIdx) => (
                          <div
                            key={pIdx}
                            className="text-surface-300 flex items-start gap-2 text-xs"
                          >
                            <Sparkles className="mt-0.5 size-3 shrink-0 text-amber-400" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Rules & Eligibility Section (PRD §9) */}
      {detail?.rules && (
        <section className="space-y-4">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Rules & Code of Conduct</h3>
            <p className="text-surface-400 text-xs">
              Fair play, commit timelines, and submission integrity guidelines
            </p>
          </div>

          <div className="border-surface-800 bg-surface-900/40 space-y-4 rounded-3xl border p-6 sm:p-8">
            <div className="text-brand-300 flex items-center gap-2 text-xs font-semibold">
              <ShieldAlert className="size-4" />
              <span>Official Participation Rules</span>
            </div>
            <pre className="text-surface-300 font-sans text-xs leading-relaxed whitespace-pre-wrap">
              {detail.rules}
            </pre>
          </div>
        </section>
      )}

      {/* 36-Hour Timeline Section (PRD §9) */}
      {event.scheduleItems.length > 0 && (
        <section className="space-y-6">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Hackathon Schedule & Timeline</h3>
            <p className="text-surface-400 text-xs">
              Key checkpoints, mentorship slots, submission freeze, and judging rounds
            </p>
          </div>

          <div className="border-surface-800 relative space-y-6 border-l pl-6 sm:pl-8">
            {event.scheduleItems.map((slot) => {
              const start = new Date(slot.startTime);
              const timeStr = start.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });

              return (
                <div key={slot.id} className="group relative">
                  <div className="border-surface-950 absolute top-1 -left-[31px] size-3.5 rounded-full border-2 bg-purple-500 sm:-left-[39px]" />
                  <div className="border-surface-800 bg-surface-900/60 space-y-1 rounded-2xl border p-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                      <span>{timeStr}</span>
                      <span className="text-surface-500 text-[11px]">
                        {start.toLocaleDateString("en-IN", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h4 className="text-surface-100 text-sm font-bold">{slot.title}</h4>
                    {slot.description && (
                      <p className="text-surface-400 text-xs">{slot.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Judges & Mentors (PRD §9) */}
      {(judges.length > 0 || mentors.length > 0) && (
        <section className="space-y-8">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Judges & Technical Mentors</h3>
            <p className="text-surface-400 text-xs">
              Industry architects reviewing code, architecture, and live product demos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[...judges, ...mentors].map((item, idx) => (
              <div
                key={idx}
                className="border-surface-800 bg-surface-900/60 flex flex-col justify-between space-y-3 rounded-2xl border p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-xs font-bold text-white">
                      {item.speaker.name.slice(0, 2).toUpperCase()}
                    </div>
                    <Badge
                      variant={item.role === "JUDGE" ? "brand" : "accent"}
                      className="text-[10px]"
                    >
                      {item.role === "JUDGE" ? "Judge" : "Mentor"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-surface-100 text-sm font-bold">{item.speaker.name}</h4>
                    <p className="truncate text-xs text-purple-300">
                      {item.speaker.designation}{" "}
                      {item.speaker.organisation ? `@ ${item.speaker.organisation}` : ""}
                    </p>
                  </div>
                </div>

                <div className="border-surface-800 flex items-center gap-2 border-t pt-2">
                  {item.speaker.linkedin && (
                    <a
                      href={item.speaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 text-[11px] hover:text-purple-300"
                    >
                      LinkedIn
                    </a>
                  )}
                  {item.speaker.github && (
                    <a
                      href={item.speaker.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-surface-400 text-[11px] hover:text-purple-300"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sponsors & Partners (PRD §9) */}
      {event.partners.length > 0 && (
        <section className="space-y-6">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Hackathon Sponsors & Partners</h3>
            <p className="text-surface-400 text-xs">
              Infrastructure and cloud credits provided by our ecosystem partners
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {event.partners.map((item, idx) => (
              <div
                key={idx}
                className="border-surface-800 bg-surface-900/40 flex flex-col items-center justify-center space-y-1.5 rounded-2xl border p-4 text-center"
              >
                <Building className="text-surface-500 size-6" />
                <span className="text-surface-200 text-xs font-bold">{item.partner.name}</span>
                <Badge variant="surface" className="text-[9px]">
                  {item.tier || "Partner"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results & Winning Projects Showcase (PRD §9) */}
      {detail?.results && detail.results.length > 0 && (
        <section id="results" className="space-y-6 pt-6">
          <div className="border-surface-800 flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-surface-100 text-xl font-bold">Winner Showcase & Results</h3>
              <p className="text-surface-400 text-xs">
                Official podium teams and verified open-source project repositories
              </p>
            </div>
            <Badge variant="success">Verified Winners</Badge>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {detail.results.map((result) => {
              const isWinner = result.rank === 1;

              return (
                <div
                  key={result.rank}
                  className={`flex flex-col justify-between space-y-4 rounded-3xl border p-6 shadow-2xl sm:p-7 ${
                    isWinner
                      ? "via-surface-900 to-surface-950 border-amber-500/50 bg-gradient-to-b from-amber-950/20"
                      : "border-surface-800 bg-surface-900/70"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        Rank #{result.rank}
                      </span>
                      <Badge variant={isWinner ? "accent" : "surface"} className="text-xs">
                        {result.title}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-surface-50 text-lg font-bold">{result.projectName}</h4>
                      <p className="text-xs font-medium text-purple-300">by {result.teamName}</p>
                    </div>

                    {result.description && (
                      <p className="text-surface-300 text-xs leading-relaxed">
                        {result.description}
                      </p>
                    )}
                  </div>

                  {/* Links */}
                  <div className="border-surface-800 flex items-center gap-3 border-t pt-3">
                    {result.repoUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={result.repoUrl} target="_blank" rel="noopener noreferrer">
                          <GithubIcon className="mr-1.5 size-3.5" />
                          <span>Code</span>
                        </a>
                      </Button>
                    )}
                    {result.demoUrl && (
                      <Button asChild variant="secondary" size="sm">
                        <a href={result.demoUrl} target="_blank" rel="noopener noreferrer">
                          <span>Live Demo</span>
                          <ExternalLink className="ml-1 size-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Photo Gallery (PRD §9) */}
      {event.galleryAlbums.length > 0 && event.galleryAlbums[0].images.length > 0 && (
        <section className="space-y-6">
          <div className="border-surface-800 border-b pb-3">
            <h3 className="text-surface-100 text-xl font-bold">Edition Gallery Highlights</h3>
            <p className="text-surface-400 text-xs">
              Photographs captured across hacking, pitch demos, and awards
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {event.galleryAlbums[0].images.map((img) => (
              <div
                key={img.id}
                className="group border-surface-800 bg-surface-900 relative aspect-video overflow-hidden rounded-2xl border shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption || "Hackathon highlight"}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3.5">
                    <p className="truncate text-xs font-medium text-white">{img.caption}</p>
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
