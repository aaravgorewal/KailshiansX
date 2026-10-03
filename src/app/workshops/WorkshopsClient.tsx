"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HostWorkshopModal } from "./HostWorkshopModal";
import { RequestCollegeWorkshopModal } from "./RequestCollegeWorkshopModal";
import { WORKSHOP_CATEGORIES } from "@/lib/validations/workshop-forms";

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

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  MERN: <Code2 className="size-3.5" />,
  Backend: <Database className="size-3.5" />,
  "System Design": <Cpu className="size-3.5" />,
  DevOps: <Terminal className="size-3.5" />,
  Cloud: <Globe className="size-3.5" />,
  AI: <Sparkles className="text-brand-400 size-3.5" />,
  Blockchain: <Shield className="size-3.5" />,
  "Open Source": <Terminal className="size-3.5 text-emerald-400" />,
  Career: <Briefcase className="size-3.5" />,
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
    <div className="space-y-12">
      {/* Modals */}
      <HostWorkshopModal isOpen={isHostModalOpen} onClose={handleCloseHostModal} />
      <RequestCollegeWorkshopModal isOpen={isRequestModalOpen} onClose={handleCloseRequestModal} />

      {/* Dual CTAs & Program Highlights Bar */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Host Workshop Card */}
        <div className="border-surface-800 from-surface-900/90 via-surface-900/60 to-surface-950 group hover:border-brand-500/50 relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xl transition-all sm:p-8">
          <div className="bg-brand-500/10 group-hover:bg-brand-500/20 pointer-events-none absolute -top-8 -right-8 size-40 rounded-full blur-2xl transition-all" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-brand-500/10 text-brand-400 border-brand-500/20 rounded-xl border p-2">
                <Sparkles className="size-4" />
              </span>
              <Badge variant="brand">For Engineers & Mentors</Badge>
            </div>
            <h3 className="text-surface-50 group-hover:text-brand-300 text-xl font-bold transition-colors">
              Host a Hands-On Workshop
            </h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Have mastery over System Design, AI, DevOps, Rust, or MERN? Lead a masterclass for
              100+ vetted builders. We sponsor venue logistics, equipment, promotion, and
              honorariums.
            </p>
          </div>

          <div className="pt-6">
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenHostModal}
              className="shadow-brand-500/20 w-full shadow-lg sm:w-auto"
            >
              <span>Submit Workshop Proposal</span>
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>

        {/* Request at College Card */}
        <div className="border-surface-800 from-surface-900/90 via-surface-900/60 to-surface-950 group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-xl transition-all hover:border-emerald-500/50 sm:p-8">
          <div className="pointer-events-none absolute -top-8 -right-8 size-40 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:bg-emerald-500/20" />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <School className="size-4" />
              </span>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">
                For Campuses & Student Clubs
              </Badge>
            </div>
            <h3 className="text-surface-50 text-xl font-bold transition-colors group-hover:text-emerald-300">
              Request a Workshop at Your College
            </h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Campus Lead, Society Head, or Faculty Coordinator? Bring an official KailshiansX
              intensive bootcamp directly to your university auditorium or computer labs.
            </p>
          </div>

          <div className="pt-6">
            <Button
              variant="secondary"
              size="md"
              onClick={handleOpenRequestModal}
              className="w-full hover:border-emerald-500/50 sm:w-auto"
            >
              <span>Request for Your Campus</span>
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs & Category Filter Bar */}
      <div className="space-y-6 pt-4">
        {/* Main Segmented Switcher */}
        <div className="border-surface-800 flex flex-col items-stretch justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
          <div className="bg-surface-900/80 border-surface-800 inline-flex rounded-2xl border p-1.5">
            <button
              type="button"
              onClick={() => updateFilters("upcoming", activeCategory)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "upcoming"
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              <span>Upcoming Workshops</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px]">
                {counts.upcoming}
              </span>
            </button>
            <button
              type="button"
              onClick={() => updateFilters("past", activeCategory)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "past"
                  ? "bg-brand-600 text-white shadow-md"
                  : "text-surface-400 hover:text-surface-200"
              }`}
            >
              <span>Past Workshops Archive</span>
              <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px]">
                {counts.past}
              </span>
            </button>
          </div>

          <div className="text-surface-400 flex items-center gap-1.5 text-xs">
            <Filter className="text-surface-500 size-3.5" />
            <span>Showing {workshops.length} workshops</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => updateFilters(activeTab, "ALL")}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
              activeCategory === "ALL"
                ? "bg-surface-100 text-surface-950 font-semibold shadow-sm"
                : "bg-surface-900 border-surface-800 text-surface-300 hover:border-surface-700 hover:text-surface-100 border"
            }`}
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
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-brand-500 shadow-brand-500/20 font-semibold text-white shadow-md"
                    : "bg-surface-900 border-surface-800 text-surface-300 hover:border-surface-700 hover:text-surface-100 border"
                }`}
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
        <div className="border-surface-800 bg-surface-900/30 space-y-4 rounded-3xl border border-dashed p-12 text-center">
          <div className="bg-surface-800 text-surface-400 mx-auto flex size-14 items-center justify-center rounded-2xl">
            <Code2 className="size-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-surface-200 text-base font-bold">
              No {activeCategory} Workshops Found
            </h4>
            <p className="text-surface-400 mx-auto max-w-sm text-xs">
              We haven&apos;t scheduled a workshop in this specific category yet. Propose hosting
              one or request it for your campus!
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => updateFilters(activeTab, "ALL")}>
              View All Tracks
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenRequestModal}>
              Request {activeCategory} Workshop
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workshops.map((w) => {
            const startDate = new Date(w.startDate);
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

            const primarySpeaker = w.speakers[0]?.speaker;
            const primaryTicket = w.ticketTypes[0];
            const isFree = !primaryTicket || primaryTicket.price === 0;

            return (
              <div
                key={w.id}
                className="group border-surface-800 from-surface-900 via-surface-900/90 to-surface-950 hover:border-surface-700 flex flex-col justify-between rounded-3xl border bg-gradient-to-b p-6 shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Category & Format Pill */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="text-brand-300 border-brand-500/30 gap-1.5 py-1"
                    >
                      {CATEGORY_ICONS[w.category || ""] || <Code2 className="size-3" />}
                      <span>{w.category || "Technical"}</span>
                    </Badge>

                    <Badge variant="surface" className="text-[11px]">
                      {w.attendanceMode === "VIRTUAL" ? "Virtual Live" : "In-Person Campus"}
                    </Badge>
                  </div>

                  {/* Title & Overview */}
                  <div className="space-y-2">
                    <Link
                      href={`/events/${w.slug}`}
                      className="text-surface-50 group-hover:text-brand-400 line-clamp-2 text-lg font-bold transition-colors"
                    >
                      {w.title}
                    </Link>
                    <p className="text-surface-400 line-clamp-3 text-xs leading-relaxed">
                      {w.overview}
                    </p>
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="border-surface-800/80 text-surface-300 space-y-1.5 border-t pt-2 text-xs">
                    <div className="text-surface-300 flex items-center gap-2">
                      <Calendar className="text-brand-400 size-3.5 shrink-0" />
                      <span>{dateStr}</span>
                      <span className="text-surface-600">•</span>
                      <Clock className="text-surface-500 size-3.5 shrink-0" />
                      <span>{timeStr}</span>
                    </div>

                    <div className="text-surface-400 flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 shrink-0 text-rose-400" />
                      <span className="truncate">
                        {w.venue || "Campus Lab"},{" "}
                        {w.city ? `${w.city.name}, ${w.city.state}` : "India"}
                      </span>
                    </div>
                  </div>

                  {/* Instructor / Mentor */}
                  {primarySpeaker && (
                    <div className="border-surface-800/80 flex items-center gap-3 border-t pt-3">
                      <div className="from-brand-600 flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr to-indigo-600 text-xs font-bold text-white shadow-inner">
                        {primarySpeaker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-surface-100 truncate text-xs font-semibold">
                          {primarySpeaker.name}
                        </p>
                        <p className="text-surface-400 truncate text-[11px]">
                          {primarySpeaker.designation}{" "}
                          {primarySpeaker.organisation ? `@ ${primarySpeaker.organisation}` : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Pricing & Action */}
                <div className="border-surface-800 mt-6 flex items-center justify-between gap-3 border-t pt-6">
                  <div>
                    <span className="text-surface-500 block text-[10px] tracking-wider uppercase">
                      Pass
                    </span>
                    <span className="text-surface-100 text-sm font-bold">
                      {isFree ? (
                        <span className="text-emerald-400">Free Community RSVP</span>
                      ) : (
                        `₹${primaryTicket.price}`
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTab === "upcoming" ? (
                      <Button asChild variant="primary" size="sm">
                        <Link href={`/events/${w.slug}/register`}>
                          <span>Register</span>
                          <ArrowRight className="ml-1 size-3.5" />
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
