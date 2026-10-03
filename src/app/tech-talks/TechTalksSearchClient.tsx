"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Calendar,
  MapPin,
  Video,
  FileText,
  Lightbulb,
  ArrowRight,
  School,
  Radio,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface SerializedTechTalk {
  id: string;
  slug: string;
  title: string;
  overview: string | null;
  category: string | null;
  attendanceMode: string;
  startDate: string;
  endDate: string | null;
  venue: string | null;
  venueAddress: string | null;
  city: { name: string; state: string } | null;
  speakers: Array<{
    speaker: {
      id: string;
      name: string;
      designation: string | null;
      organisation: string | null;
      avatar: string | null;
    };
  }>;
  partners: Array<{
    partner: {
      id: string;
      name: string;
      category: string | null;
      logo: string | null;
    };
  }>;
  techTalkResource: {
    id: string;
    slideUrl: string | null;
    videoUrl: string | null;
    repoUrl: string | null;
    keyTakeaways: unknown;
    tags: string[];
  } | null;
}

interface TechTalksSearchClientProps {
  talks: SerializedTechTalk[];
  counts: {
    upcoming: number;
    past: number;
    total: number;
  };
  initialTab?: "all" | "upcoming" | "past";
  initialQuery?: string;
}

export function TechTalksSearchClient({
  talks,
  counts,
  initialTab = "all",
  initialQuery = "",
}: TechTalksSearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: "all" | "upcoming" | "past" =
    tabParam === "upcoming" || tabParam === "past" || tabParam === "all" ? tabParam : initialTab;

  const currentQ = searchParams.get("q") ?? initialQuery;
  const [searchQuery, setSearchQuery] = React.useState(currentQ);
  const [isSearching, setIsSearching] = React.useState(false);

  // Debounced search sync to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const activeQ = searchParams.get("q") ?? "";
      if (searchQuery.trim() === activeQ.trim()) {
        setIsSearching(false);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else {
        params.delete("q");
      }

      const qs = params.toString();
      router.push(`/tech-talks${qs ? `?${qs}` : ""}`, { scroll: false });
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, router]);

  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    setIsSearching(true);
  };

  const handleTabChange = (newTab: "all" | "upcoming" | "past") => {
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === "all") {
      params.delete("tab");
    } else {
      params.set("tab", newTab);
    }
    const qs = params.toString();
    router.push(`/tech-talks${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    const qs = params.toString();
    router.push(`/tech-talks${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="space-y-10">
      {/* Search Bar & Tab Controls */}
      <div className="border-surface-800 bg-surface-900/80 space-y-6 rounded-3xl border p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
          {/* Postgres Full-Text Search Input */}
          <div className="relative flex-1">
            <Search className="text-surface-400 absolute top-3.5 left-4 size-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search talks by topic, speaker, host college, PostgreSQL, AI, Next.js..."
              className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500 w-full rounded-2xl border py-3 pr-10 pl-11 text-sm transition outline-none focus:ring-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-surface-400 hover:text-surface-100 absolute top-3.5 right-3.5"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Segmented Switcher */}
          <div className="bg-surface-950 border-surface-800 inline-flex shrink-0 rounded-2xl border p-1">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              All Talks ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "upcoming"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              Upcoming ({counts.upcoming})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("past")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === "past"
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              Past Knowledge Archive ({counts.past})
            </button>
          </div>
        </div>

        {/* Search status / keywords suggestions */}
        <div className="border-surface-800/80 flex flex-wrap items-center justify-between gap-2 border-t pt-2 text-xs">
          <div className="text-surface-400 flex items-center gap-2">
            <span className="text-surface-300 font-medium">
              {searchQuery
                ? `Searching Postgres archive for "${searchQuery}"`
                : "Search knowledge base:"}
            </span>
            {isSearching && (
              <span className="text-brand-400 animate-pulse text-[11px]">• Searching...</span>
            )}
          </div>

          <div className="text-surface-400 flex flex-wrap items-center gap-1.5">
            <span className="text-surface-500 text-[11px]">Popular:</span>
            {["Next.js", "PostgreSQL", "AI Agents", "System Design", "Microservices", "ZKP"].map(
              (keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => handleQueryChange(keyword)}
                  className="bg-surface-950 text-surface-300 border-surface-800 hover:border-brand-500 hover:text-brand-300 rounded-lg border px-2.5 py-1 text-[11px] transition"
                >
                  {keyword}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Talks Grid */}
      {talks.length === 0 ? (
        <div className="border-surface-800 bg-surface-900/30 space-y-4 rounded-3xl border border-dashed p-12 text-center">
          <div className="bg-surface-800 text-surface-400 mx-auto flex size-14 items-center justify-center rounded-2xl">
            <Search className="size-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-surface-200 text-base font-bold">No Tech Talks Found</h4>
            <p className="text-surface-400 mx-auto max-w-sm text-xs">
              No sessions matched your search &quot;{searchQuery}&quot;. Try adjusting your keywords
              or browse all archive sessions.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleClearSearch}>
            Clear Search Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk) => {
            const startDate = new Date(talk.startDate);
            const isUpcoming = startDate >= new Date();
            const dateStr = startDate.toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            const speaker = talk.speakers[0]?.speaker;
            const hostPartner = talk.partners[0]?.partner;
            const resource = talk.techTalkResource;
            const takeawaysCount = Array.isArray(resource?.keyTakeaways)
              ? resource.keyTakeaways.length
              : 0;

            return (
              <div
                key={talk.id}
                className="group border-surface-800 from-surface-900 via-surface-900/90 to-surface-950 hover:border-surface-700 flex flex-col justify-between rounded-3xl border bg-gradient-to-b p-6 shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Host Institution & Live Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-brand-300 flex items-center gap-1.5 truncate text-xs font-medium">
                      <School className="text-brand-400 size-3.5 shrink-0" />
                      <span className="truncate">
                        {hostPartner?.name || "Kailshians Community"}
                      </span>
                    </div>

                    <Badge
                      variant={isUpcoming ? "brand" : "surface"}
                      className="shrink-0 font-mono text-[10px] tracking-wider uppercase"
                    >
                      {isUpcoming ? (
                        <span className="flex items-center gap-1">
                          <Radio className="size-2.5 animate-pulse text-emerald-400" />
                          Upcoming Live
                        </span>
                      ) : (
                        "Archived"
                      )}
                    </Badge>
                  </div>

                  {/* Topic Title & Overview */}
                  <div className="space-y-2">
                    <Link
                      href={`/tech-talks/${talk.slug}`}
                      className="text-surface-50 group-hover:text-brand-400 line-clamp-2 text-lg font-bold transition-colors"
                    >
                      {talk.title}
                    </Link>
                    <p className="text-surface-400 line-clamp-3 text-xs leading-relaxed">
                      {talk.overview}
                    </p>
                  </div>

                  {/* Date, Time & Mode */}
                  <div className="border-surface-800/80 text-surface-300 space-y-1 border-t pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-brand-400 size-3.5 shrink-0" />
                      <span>{dateStr}</span>
                      <span className="text-surface-600">•</span>
                      <span>{timeStr}</span>
                    </div>

                    <div className="text-surface-400 flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 shrink-0 text-rose-400" />
                      <span className="truncate">
                        {talk.attendanceMode === "VIRTUAL"
                          ? "Virtual Livestream"
                          : `${talk.venue || "Venue"}, ${talk.city?.name || "India"}`}
                      </span>
                    </div>
                  </div>

                  {/* Speaker Profile */}
                  {speaker && (
                    <div className="border-surface-800/80 flex items-center gap-3 border-t pt-3">
                      <div className="from-brand-600 to-accent-600 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr via-indigo-600 text-xs font-bold text-white shadow-md">
                        {speaker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-surface-100 truncate text-xs font-semibold">
                          {speaker.name}
                        </p>
                        <p className="text-surface-400 truncate text-[11px]">
                          {speaker.designation}{" "}
                          {speaker.organisation ? `@ ${speaker.organisation}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Post-Event Resource Badges */}
                  {resource && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {resource.videoUrl && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                          <Video className="size-2.5" /> Video
                        </span>
                      )}
                      {resource.slideUrl && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                          <FileText className="size-2.5" /> Slides
                        </span>
                      )}
                      {takeawaysCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          <Lightbulb className="size-2.5" /> {takeawaysCount} Takeaways
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="border-surface-800 mt-6 flex items-center justify-between border-t pt-6">
                  <span className="text-surface-400 font-mono text-[11px]">
                    {talk.attendanceMode === "VIRTUAL" ? "Online Stream" : "In-Person Stage"}
                  </span>

                  <Button asChild variant={isUpcoming ? "primary" : "secondary"} size="sm">
                    <Link href={`/tech-talks/${talk.slug}`}>
                      <span>{isUpcoming ? "Register Pass" : "Explore Knowledge"}</span>
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
