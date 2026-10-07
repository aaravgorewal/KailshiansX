// src/components/network/SpeakerNetworkClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, Search, Zap } from "lucide-react";
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
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Hero Header */}
      <section className="border-border bg-card relative overflow-hidden border-b py-16 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase">
              Mentor &amp; Speaker Network ()
            </span>

            <h1 className="text-foreground mt-4 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Connect with Industry Mentors &amp; Speakers
            </h1>

            <p className="text-muted-foreground mt-4 text-sm leading-relaxed sm:text-lg">
              Book 1:1 mentorship, invite keynote speakers to your campus chapter, or request
              project code reviews from vetted engineering leaders and tech founders.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/me/mentor">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold shadow-sm">
                  <Zap className="mr-2 h-4 w-4" />
                  Mentor Cockpit
                </Button>
              </Link>
              <Link href="/me/bookings">
                <Button
                  variant="outline"
                  className="border-border hover:bg-muted text-foreground font-bold"
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
                ? "bg-primary text-primary-foreground"
                : "bg-card border-border text-muted-foreground hover:text-foreground border"
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
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:text-foreground border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search & Session Type controls */}
        <div className="border-border bg-card mt-4 flex flex-col justify-between gap-4 rounded-3xl border p-5 backdrop-blur-md sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground mr-2 text-xs font-bold uppercase">Format:</span>
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
                    ? "bg-muted border-primary/30 text-primary border font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name, role, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-background placeholder:text-muted-foreground text-foreground focus:border-primary w-full rounded-xl border py-2 pr-3 pl-9 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Speakers Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group border-border bg-card hover:border-border flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-md transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="border-primary/20 bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                        {s.name}
                      </h3>
                      <p className="text-muted-foreground text-xs">{s.designation}</p>
                      <p className="text-muted-foreground text-xs">{s.organisation}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      s.availabilityStatus === "AVAILABLE"
                        ? "border-success/20 bg-success/10 text-success border"
                        : "border-border bg-primary/10 text-primary border"
                    }`}
                  >
                    {s.availabilityStatus}
                  </span>
                </div>

                {s.bio && (
                  <p className="text-muted-foreground mt-4 line-clamp-3 text-xs leading-relaxed">
                    {s.bio}
                  </p>
                )}

                {/* Topics Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="border-border bg-background text-muted-foreground rounded-lg border px-2 py-0.5 text-xs font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                  {s.topics.length > 3 && (
                    <span className="bg-muted text-muted-foreground rounded-lg px-1.5 py-0.5 text-xs">
                      +{s.topics.length - 3}
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="border-border text-muted-foreground mt-6 flex items-center justify-between border-t pt-4 text-xs">
                  <div className="text-primary flex items-center gap-1 font-bold">
                    <Star className="fill-warning text-warning h-3.5 w-3.5" />
                    <span>{s.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal">
                      ({s.totalSessionsConducted} sessions)
                    </span>
                  </div>

                  <span className="text-muted-foreground text-xs">
                    {s.weeklyAvailabilityHours}h / week
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2 pt-2">
                <Link href={`/network/speakers/${s.slug}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-muted text-foreground w-full text-xs font-bold"
                  >
                    Profile
                  </Button>
                </Link>
                <Button
                  id={`btn-book-${s.slug}`}
                  onClick={() => handleOpenBooking(s)}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover flex-1 text-xs font-bold"
                >
                  Book Session
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border-border text-muted-foreground rounded-3xl border border-dashed py-16 text-center text-sm">
            No mentors found matching your filters.
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {selectedSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-border bg-background w-full max-w-lg rounded-3xl border p-6 shadow-2xl">
            {bookingSuccess ? (
              <div className="space-y-4 py-8 text-center">
                <div className="border-success/30 bg-success/10 text-success mx-auto flex h-14 w-14 items-center justify-center rounded-full border">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-foreground text-xl font-bold">Booking Request Enqueued!</h3>
                <p className="text-muted-foreground mx-auto max-w-sm text-xs">
                  Your request has been routed to <strong>{selectedSpeaker.name}</strong>. You will
                  receive a calendar invite and Google Meet link once confirmed.
                </p>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Link href="/me/bookings">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold">
                      View My Bookings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSpeaker(null)}
                    className="border-border text-foreground text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-border flex items-center gap-3 border-b pb-4">
                  <div className="border-primary/20 bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border font-bold">
                    {selectedSpeaker.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-foreground text-base font-bold">
                      Book Session with {selectedSpeaker.name}
                    </h3>
                    <p className="text-muted-foreground text-xs">{selectedSpeaker.designation}</p>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="mt-4 space-y-4 text-left">
                  <div>
                    <label className="text-muted-foreground text-xs font-bold">Session Type</label>
                    <select
                      value={bookingSessionType}
                      onChange={(e) => setBookingSessionType(e.target.value)}
                      className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
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
                    <label className="text-muted-foreground text-xs font-bold">
                      Topic of Discussion
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed consensus or architecture critique"
                      value={bookingTopic}
                      onChange={(e) => setBookingTopic(e.target.value)}
                      className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground text-xs font-bold">
                      Preferred Date &amp; Time (IST)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    />
                    <p className="text-muted-foreground mt-1 text-xs">
                      Mentor&apos;s preferred time:{" "}
                      {selectedSpeaker.preferredCadence || "Weekdays & Weekends"}
                    </p>
                  </div>

                  <div>
                    <label className="text-muted-foreground text-xs font-bold">
                      Session Goals &amp; Questions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide specific questions, repo links, or slides to make the session highly productive..."
                      value={bookingDesc}
                      onChange={(e) => setBookingDesc(e.target.value)}
                      className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="border-border flex items-center justify-end gap-3 border-t pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedSpeaker(null)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold"
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
