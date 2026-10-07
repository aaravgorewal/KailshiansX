"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  School,
  ArrowRight,
  Filter,
  Code2,
  Cpu,
  Database,
  Globe,
  Terminal,
  Shield,
  Briefcase,
  Brain,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HostWorkshopModal } from "./HostWorkshopModal";
import { RequestCollegeWorkshopModal } from "./RequestCollegeWorkshopModal";
import { WORKSHOP_CATEGORIES } from "@/lib/validations/workshop-forms";
import { formatDate, formatTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

export interface SerializedWorkshop {
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
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    quota: number;
  }>;
}

interface WorkshopsClientProps {
  workshops: SerializedWorkshop[];
  counts: {
    upcoming: number;
    past: number;
    total: number;
  };
  initialTab?: "upcoming" | "past";
  initialCategory?: string;
}

// Plain Lucide icons in text-muted-foreground
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  MERN: <Code2 className="text-muted-foreground size-3.5" aria-hidden="true" />,
  Backend: <Database className="text-muted-foreground size-3.5" aria-hidden="true" />,
  "System Design": <Cpu className="text-muted-foreground size-3.5" aria-hidden="true" />,
  DevOps: <Terminal className="text-muted-foreground size-3.5" aria-hidden="true" />,
  Cloud: <Globe className="text-muted-foreground size-3.5" aria-hidden="true" />,
  AI: <Brain className="text-muted-foreground size-3.5" aria-hidden="true" />,
  Blockchain: <Shield className="text-muted-foreground size-3.5" aria-hidden="true" />,
  "Open Source": <Terminal className="text-muted-foreground size-3.5" aria-hidden="true" />,
  Career: <Briefcase className="text-muted-foreground size-3.5" aria-hidden="true" />,
};

export function WorkshopsClient({
  workshops,
  counts,
  initialTab = "upcoming",
  initialCategory = "ALL",
}: WorkshopsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab: "upcoming" | "past" =
    tabParam === "past" || tabParam === "upcoming" ? tabParam : initialTab;

  const catParam = searchParams.get("category");
  const activeCategory: string = catParam || initialCategory;

  const modalParam = searchParams.get("modal");
  const [hostModalOpened, setHostModalOpened] = React.useState(false);
  const [requestModalOpened, setRequestModalOpened] = React.useState(false);

  const isHostModalOpen = modalParam === "host" || hostModalOpened;
  const isRequestModalOpen = modalParam === "request" || requestModalOpened;

  const updateFilters = (newTab: "upcoming" | "past", newCat: string) => {
    const params = new URLSearchParams();
    if (newTab !== "upcoming") params.set("tab", newTab);
    if (newCat !== "ALL") params.set("category", newCat);

    const qs = params.toString();
    router.push(`/workshops${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const handleOpenHostModal = () => {
    setHostModalOpened(true);
  };

  const handleOpenRequestModal = () => {
    setRequestModalOpened(true);
  };

  const handleCloseHostModal = () => {
    setHostModalOpened(false);
    if (modalParam === "host") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("modal");
      const qs = params.toString();
      router.push(`/workshops${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  };

  const handleCloseRequestModal = () => {
    setRequestModalOpened(false);
    if (modalParam === "request") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("modal");
      const qs = params.toString();
      router.push(`/workshops${qs ? `?${qs}` : ""}`, { scroll: false });
    }
  };

  return (
    <div className="space-y-10">
      {/* Modals */}
      <HostWorkshopModal isOpen={isHostModalOpen} onClose={handleCloseHostModal} />
      <RequestCollegeWorkshopModal isOpen={isRequestModalOpen} onClose={handleCloseRequestModal} />

      {/* Action Cards (Host & Request) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Host Workshop Card */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="border-border bg-muted text-foreground flex size-8 items-center justify-center rounded-md border">
                <BookOpen className="size-4" aria-hidden="true" />
              </span>
              <Badge variant="neutral" size="sm">
                For Engineers &amp; Mentors
              </Badge>
            </div>
            <h3 className="text-foreground text-lg font-bold">Host a Hands-On Workshop</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Lead a masterclass for vetted builders on System Design, AI, DevOps, Rust, or MERN. We
              sponsor venue logistics, equipment, promotion, and honorariums.
            </p>
          </div>

          <div className="pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenHostModal}
              className="w-full gap-1.5 sm:w-auto"
            >
              <span>Submit proposal</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </Card>

        {/* Request at College Card */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="border-border bg-muted text-foreground flex size-8 items-center justify-center rounded-md border">
                <School className="size-4" aria-hidden="true" />
              </span>
              <Badge variant="neutral" size="sm">
                For Campuses &amp; Clubs
              </Badge>
            </div>
            <h3 className="text-foreground text-lg font-bold">
              Request a Workshop at Your College
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Bring an official KailshiansX intensive bootcamp directly to your university
              auditorium, campus club, or computer labs.
            </p>
          </div>

          <div className="pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOpenRequestModal}
              className="w-full gap-1.5 sm:w-auto"
            >
              <span>Request for campus</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Tabs & Category Filter Bar */}
      <div className="space-y-4">
        {/* Main Segmented Switcher */}
        <div className="border-border flex flex-col items-stretch justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
          <div className="border-border bg-muted inline-flex items-center rounded-lg border p-1">
            <button
              type="button"
              onClick={() => updateFilters("upcoming", activeCategory)}
              className={cn(
                "focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
                activeTab === "upcoming"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Upcoming</span>
              {counts.upcoming > 0 && (
                <span className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                  {counts.upcoming}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => updateFilters("past", activeCategory)}
              className={cn(
                "focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
                activeTab === "past"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Past Archive</span>
              {counts.past > 0 && (
                <span className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                  {counts.past}
                </span>
              )}
            </button>
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Filter className="size-3.5" aria-hidden="true" />
            <span>Showing {workshops.length} workshops</span>
          </div>
        </div>

        {/* Category Filter Chips: neutral style, selected = border-primary */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">Track:</span>
          <button
            type="button"
            onClick={() => updateFilters(activeTab, "ALL")}
            className={cn(
              "focus-visible:ring-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors select-none focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
              activeCategory === "ALL"
                ? "border-primary bg-muted text-accent-text font-semibold"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            )}
          >
            All Tracks
          </button>

          {WORKSHOP_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => updateFilters(activeTab, cat)}
                className={cn(
                  "focus-visible:ring-ring flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors select-none focus-visible:ring-2 focus-visible:outline-none active:opacity-80",
                  isSelected
                    ? "border-primary bg-muted text-accent-text font-semibold"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                )}
              >
                {CATEGORY_ICONS[cat]}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workshops Grid */}
      {workshops.length === 0 ? (
        <div className="border-border bg-card/40 space-y-3 rounded-lg border border-dashed p-10 text-center">
          <div className="border-border bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-md border">
            <Code2 className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-foreground text-base font-bold">
              No {activeCategory === "ALL" ? "" : activeCategory} Workshops Found
            </h4>
            <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs">
              No workshops are currently scheduled under this filter. Propose hosting one or request
              it for your campus!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => updateFilters(activeTab, "ALL")}>
              View All Tracks
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenRequestModal}>
              Request Workshop
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((w) => {
            const dateStr = formatDate(w.startDate);
            const timeStr = formatTime(w.startDate);
            const primarySpeaker = w.speakers[0]?.speaker;
            const primaryTicket = w.ticketTypes[0];
            const isFree = !primaryTicket || primaryTicket.price === 0;

            return (
              <Card key={w.id} className="group relative flex h-full flex-col justify-between p-5">
                <div className="space-y-3">
                  {/* Category & Past/Upcoming State */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground flex items-center gap-1.5 font-medium">
                      {CATEGORY_ICONS[w.category || ""] || <Code2 className="size-3" />}
                      <span>{w.category || "Technical"}</span>
                    </span>

                    {/* Past/upcoming state shown as small neutral text, not colored pills */}
                    <span className="text-muted-foreground font-mono text-xs">
                      {activeTab === "past" ? "Past session" : "Upcoming"}
                    </span>
                  </div>

                  {/* Title & Overview with clickable card overlay */}
                  <div className="space-y-1.5">
                    <h3
                      title={w.title}
                      className="text-foreground hover:text-accent-text line-clamp-2 text-base font-bold transition-colors"
                    >
                      <Link
                        href={`/events/${w.slug}`}
                        className="after:absolute after:inset-0 after:z-0 focus-visible:underline focus-visible:outline-none"
                      >
                        {w.title}
                      </Link>
                    </h3>
                    {w.overview && (
                      <p
                        title={w.overview}
                        className="text-muted-foreground line-clamp-2 text-xs leading-relaxed"
                      >
                        {w.overview}
                      </p>
                    )}
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="border-border text-muted-foreground space-y-1 border-t pt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-foreground size-3.5 shrink-0" aria-hidden="true" />
                      <span>{dateStr}</span>
                      {timeStr && (
                        <>
                          <span>·</span>
                          <Clock
                            className="text-muted-foreground size-3 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{timeStr}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <MapPin
                        className="text-muted-foreground size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {w.venue || "Campus Lab"}
                        {w.city ? `, ${w.city.name}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Instructor / Mentor */}
                  {primarySpeaker && (
                    <div className="border-border flex items-center gap-2.5 border-t pt-2.5">
                      <div className="bg-muted text-foreground flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold">
                        {primarySpeaker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="text-foreground truncate font-medium">
                          {primarySpeaker.name}
                        </p>
                        <p className="text-muted-foreground truncate">
                          {primarySpeaker.designation}
                          {primarySpeaker.organisation ? ` @ ${primarySpeaker.organisation}` : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Pricing & Action (relative z-10 for interactivity) */}
                <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-3">
                  <div>
                    <span className="text-foreground text-xs font-bold">
                      {isFree ? "Free RSVP" : `₹${primaryTicket.price}`}
                    </span>
                  </div>

                  <div className="relative z-10">
                    {activeTab === "upcoming" ? (
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/events/${w.slug}/register`}>
                          <span>Register</span>
                          <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/events/${w.slug}`}>
                          <span>View Recap</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
