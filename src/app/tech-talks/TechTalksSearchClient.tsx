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
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate, formatTime } from "@/lib/format-date";

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

const POPULAR_TOPICS = [
  "Next.js",
  "PostgreSQL",
  "AI Agents",
  "System Design",
  "Microservices",
  "Rust",
];

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
    <div className="space-y-8">
      {/* Controls Container */}
      <div className="border-border bg-card space-y-4 rounded-lg border p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search talks by topic, speaker, or keyword..."
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full rounded-md border py-2 pr-9 pl-9 text-sm focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Neutral Tab Chips */}
          <div className="inline-flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "all"
                  ? "border-primary bg-background text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              All Talks ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "upcoming"
                  ? "border-primary bg-background text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming ({counts.upcoming})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("past")}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "past"
                  ? "border-primary bg-background text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              Archive ({counts.past})
            </button>
          </div>
        </div>

        {/* Popular Topic Chips */}
        <div className="border-border flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
          <span className="text-muted-foreground">Topics:</span>
          {POPULAR_TOPICS.map((topic) => {
            const isSelected = searchQuery.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                type="button"
                onClick={() => handleQueryChange(isSelected ? "" : topic)}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                  isSelected
                    ? "border-primary bg-background text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {topic}
              </button>
            );
          })}
          {isSearching && (
            <span className="text-muted-foreground ml-auto text-xs">Searching...</span>
          )}
        </div>
      </div>

      {/* Talks Grid */}
      {talks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="border-border bg-muted text-muted-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-lg border">
            <Search className="size-6" />
          </div>
          <h3 className="text-foreground text-base font-semibold">No Tech Talks Found</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
            {searchQuery
              ? `No sessions matched "${searchQuery}". Try a different keyword.`
              : "No sessions currently available in this category."}
          </p>
          {searchQuery && (
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={handleClearSearch}>
                Clear Search Filter
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk) => {
            const isUpcoming = new Date(talk.startDate) >= new Date();
            const dateStr = formatDate(talk.startDate);
            const timeStr = formatTime(talk.startDate);
            const speaker = talk.speakers[0]?.speaker;
            const hostPartner = talk.partners[0]?.partner;
            const resource = talk.techTalkResource;
            const takeawaysCount = Array.isArray(resource?.keyTakeaways)
              ? resource.keyTakeaways.length
              : 0;

            return (
              <Card
                key={talk.id}
                className="hover:border-muted-foreground flex flex-col justify-between p-6 transition-[border-color] duration-150"
              >
                <div className="space-y-4">
                  {/* Host Institution & Status (Neutral text, no colored pills) */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="text-muted-foreground flex items-center gap-1.5 truncate">
                      <School className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {hostPartner?.name || "Kailshians Community"}
                      </span>
                    </div>

                    <span className="text-muted-foreground shrink-0 text-xs font-medium">
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>
                  </div>

                  {/* Title & Overview */}
                  <div className="space-y-1.5">
                    <Link
                      href={`/tech-talks/${talk.slug}`}
                      className="text-foreground hover:text-primary line-clamp-2 text-base font-semibold transition-colors"
                    >
                      {talk.title}
                    </Link>
                    {talk.overview && (
                      <p className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
                        {talk.overview}
                      </p>
                    )}
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="border-border text-muted-foreground space-y-1 border-t pt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">
                        {talk.attendanceMode === "VIRTUAL"
                          ? "Virtual Livestream"
                          : `${talk.venue || "Venue"}, ${talk.city?.name || "India"}`}
                      </span>
                    </div>
                  </div>

                  {/* Speaker Profile */}
                  {speaker && (
                    <div className="border-border flex items-center gap-3 border-t pt-3">
                      <div className="border-border bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                        {speaker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-xs font-medium">
                          {speaker.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {speaker.designation}
                          {speaker.organisation ? ` @ ${speaker.organisation}` : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resource Links as small neutral tags with icons */}
                  {resource && (
                    <div className="border-border flex flex-wrap gap-1.5 border-t pt-3">
                      {resource.videoUrl && (
                        <a
                          href={resource.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs transition-colors"
                        >
                          <Video className="size-3" />
                          <span>Video</span>
                        </a>
                      )}
                      {resource.slideUrl && (
                        <a
                          href={resource.slideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-primary inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs transition-colors"
                        >
                          <FileText className="size-3" />
                          <span>Slides</span>
                        </a>
                      )}
                      {takeawaysCount > 0 && (
                        <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs">
                          <Lightbulb className="size-3" />
                          <span>{takeawaysCount} Takeaways</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
                  <span className="text-muted-foreground text-xs">
                    {talk.attendanceMode === "VIRTUAL" ? "Online Stream" : "In-Person Stage"}
                  </span>

                  <Button asChild variant={isUpcoming ? "primary" : "secondary"} size="sm">
                    <Link href={`/tech-talks/${talk.slug}`}>
                      <span>{isUpcoming ? "View Details" : "Session Archive"}</span>
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
