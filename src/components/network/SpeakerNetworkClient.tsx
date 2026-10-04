// src/components/network/SpeakerNetworkClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SpeakerSummary {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo: string | null;
  designation: string | null;
  organisation: string | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  isMentor: boolean;
  isSpeaker: boolean;
  topics: string[];
  sessionTypes: string[];
  availabilityStatus: string;
  weeklyAvailabilityHours: number;
  preferredCadence: string | null;
  meetingPlatform: string | null;
  rating: number;
  totalSessionsConducted: number;
  totalEvents: number;
}

interface FilterOptions {
  topics: string[];
  sessionTypes: string[];
}

export function SpeakerNetworkClient({
  initialSpeakers,
  filterOptions,
}: {
  initialSpeakers: SpeakerSummary[];
  filterOptions: FilterOptions;
}) {
  const [speakers] = useState<SpeakerSummary[]>(initialSpeakers);
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Booking Modal State
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerSummary | null>(null);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingTopic, setBookingTopic] = useState("");
  const [bookingSessionType, setBookingSessionType] = useState("1:1 Mentorship");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingDesc, setBookingDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filtered = speakers.filter((s) => {
    const matchesTopic = selectedTopic === "ALL" || s.topics.includes(selectedTopic);
    const matchesType = selectedType === "ALL" || s.sessionTypes.includes(selectedType);
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.designation || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.organisation || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.bio || "").toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesType && matchesSearch;
  });

  const handleOpenBooking = (s: SpeakerSummary) => {
    setSelectedSpeaker(s);
    setBookingTopic(s.topics[0] || "System Design");
    setBookingTitle(`Mentorship Session with ${s.name}`);
    setBookingSessionType(s.sessionTypes[0] || "1:1 Mentorship");
    setBookingSuccess(false);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpeaker || !bookingDate) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/network/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speakerId: selectedSpeaker.id,
          title: bookingTitle,
          topic: bookingTopic,
          sessionType: bookingSessionType,
          description: bookingDesc,
          preferredDate: new Date(bookingDate).toISOString(),
          durationMinutes: 45,
          format: "VIRTUAL",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBookingSuccess(true);
      } else {
        alert(json.error || "Please sign in to request a mentorship session.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Hero Header */}
      <section className="border-surface-800 via-surface-950 to-surface-950 relative overflow-hidden border-b bg-gradient-to-b from-purple-950/20 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.15),rgba(255,255,255,0))]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-purple-400 uppercase">
              Mentor &amp; Speaker Network (PRD §28 &amp; §30)
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Connect with Industry Mentors &amp; Speakers
            </h1>

            <p className="text-surface-300 mt-4 text-sm leading-relaxed sm:text-lg">
              Book 1:1 mentorship, invite keynote speakers to your campus chapter, or request
              project code reviews from vetted engineering leaders and tech founders.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/me/mentor">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-white shadow-xl shadow-purple-600/25 hover:from-purple-500 hover:to-pink-500">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Mentor Cockpit
                </Button>
              </Link>
              <Link href="/me/bookings">
                <Button
                  variant="outline"
                  className="border-surface-700 hover:bg-surface-800 font-bold text-white"
                >
                  My Booked Sessions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {/* Topic Filters */}
        <div className="flex flex-wrap items-center gap-2 pb-4">
          <button
            onClick={() => setSelectedTopic("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              selectedTopic === "ALL"
                ? "bg-purple-600 text-white"
                : "bg-surface-900 border-surface-800 text-surface-400 border hover:text-white"
            }`}
          >
            All Topics
          </button>
          {filterOptions.topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                selectedTopic === t
                  ? "bg-purple-600 text-white"
                  : "bg-surface-900 border-surface-800 text-surface-400 border hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search & Session Type controls */}
        <div className="border-surface-800 bg-surface-900/60 mt-4 flex flex-col justify-between gap-4 rounded-3xl border p-5 backdrop-blur-md sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-surface-400 mr-2 text-xs font-bold uppercase">Format:</span>
            {[
              "ALL",
              "1:1 Mentorship",
              "Keynote Talk",
              "Hands-on Workshop",
              "Hackathon Judging",
            ].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedType(fmt)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedType === fmt
                    ? "bg-surface-800 border border-purple-500/30 font-bold text-purple-300"
                    : "text-surface-400 hover:text-surface-200"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-surface-500 absolute top-2.5 left-3 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, role, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-surface-700 bg-surface-950 placeholder-surface-500 w-full rounded-xl border py-2 pr-3 pl-9 text-xs text-white focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Speakers Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-md transition-all hover:shadow-2xl hover:shadow-purple-950/20"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-lg font-bold text-purple-300">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white transition-colors group-hover:text-purple-300">
                        {s.name}
                      </h3>
                      <p className="text-surface-400 text-xs">{s.designation}</p>
                      <p className="text-surface-500 text-xs">{s.organisation}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      s.availabilityStatus === "AVAILABLE"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {s.availabilityStatus}
                  </span>
                </div>

                {s.bio && (
                  <p className="text-surface-400 mt-4 line-clamp-3 text-xs leading-relaxed">
                    {s.bio}
                  </p>
                )}

                {/* Topics Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="border-surface-800 bg-surface-950 text-surface-300 rounded-lg border px-2 py-0.5 text-[10px] font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                  {s.topics.length > 3 && (
                    <span className="bg-surface-800 text-surface-500 rounded-lg px-1.5 py-0.5 text-[10px]">
                      +{s.topics.length - 3}
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="border-surface-800/80 text-surface-400 mt-6 flex items-center justify-between border-t pt-4 text-xs">
                  <div className="flex items-center gap-1 font-bold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{s.rating.toFixed(1)}</span>
                    <span className="text-surface-500 font-normal">
                      ({s.totalSessionsConducted} sessions)
                    </span>
                  </div>

                  <span className="text-surface-400 text-[11px]">
                    {s.weeklyAvailabilityHours}h / week
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 pt-2">
                <Link href={`/network/speakers/${s.slug}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="border-surface-700 hover:bg-surface-800 w-full text-xs font-bold text-white"
                  >
                    Profile
                  </Button>
                </Link>
                <Button
                  id={`btn-book-${s.slug}`}
                  onClick={() => handleOpenBooking(s)}
                  className="flex-1 bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                >
                  Book Session
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border-surface-800 text-surface-400 rounded-3xl border border-dashed py-16 text-center text-sm">
            No mentors found matching your filters.
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {selectedSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-950 w-full max-w-lg rounded-3xl border p-6 shadow-2xl">
            {bookingSuccess ? (
              <div className="space-y-4 py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Booking Request Enqueued!</h3>
                <p className="text-surface-400 mx-auto max-w-sm text-xs">
                  Your request has been routed to <strong>{selectedSpeaker.name}</strong>. You will
                  receive a calendar invite and Google Meet link once confirmed.
                </p>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Link href="/me/bookings">
                    <Button className="bg-purple-600 text-xs font-bold text-white hover:bg-purple-500">
                      View My Bookings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSpeaker(null)}
                    className="border-surface-700 text-xs text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-surface-800 flex items-center gap-3 border-b pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 font-bold text-purple-300">
                    {selectedSpeaker.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Book Session with {selectedSpeaker.name}
                    </h3>
                    <p className="text-surface-400 text-xs">{selectedSpeaker.designation}</p>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4 text-left">
                  <div>
                    <label className="text-surface-300 text-xs font-bold">Session Type</label>
                    <select
                      value={bookingSessionType}
                      onChange={(e) => setBookingSessionType(e.target.value)}
                      className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    >
                      {selectedSpeaker.sessionTypes.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                      <option value="1:1 Mentorship">1:1 Mentorship</option>
                      <option value="Keynote Talk">Keynote Talk</option>
                      <option value="Hands-on Workshop">Hands-on Workshop</option>
                      <option value="Hackathon Judging">Hackathon Judging</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-surface-300 text-xs font-bold">
                      Topic of Discussion
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed consensus or architecture critique"
                      value={bookingTopic}
                      onChange={(e) => setBookingTopic(e.target.value)}
                      className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-surface-300 text-xs font-bold">
                      Preferred Date &amp; Time (IST)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-surface-500 mt-1 text-[11px]">
                      Mentor&apos;s preferred time:{" "}
                      {selectedSpeaker.preferredCadence || "Weekdays & Weekends"}
                    </p>
                  </div>

                  <div>
                    <label className="text-surface-300 text-xs font-bold">
                      Session Goals &amp; Questions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide specific questions, repo links, or slides to make the session highly productive..."
                      value={bookingDesc}
                      onChange={(e) => setBookingDesc(e.target.value)}
                      className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedSpeaker(null)}
                      className="text-surface-400 text-xs hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
