// src/components/network/UserBookingsClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Video, Star, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookingRecord {
  id: string;
  title: string;
  topic: string;
  sessionType: string;
  description: string;
  preferredDate: string | Date;
  durationMinutes: number;
  format: string;
  meetingUrl: string | null;
  status: string;
  declinedReason: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string | Date;
  speaker: {
    id: string;
    name: string;
    slug: string;
    photo: string | null;
    designation: string | null;
    organisation: string | null;
    meetingPlatform: string | null;
  };
  chapter: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function UserBookingsClient({ initialBookings }: { initialBookings: BookingRecord[] }) {
  const [bookings, setBookings] = useState<BookingRecord[]>(initialBookings);

  // Rating Modal
  const [ratingBooking, setRatingBooking] = useState<BookingRecord | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleRateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;
    setIsSubmittingRating(true);
    try {
      const res = await fetch(`/api/network/bookings/${ratingBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMPLETE",
          rating: ratingScore,
          feedback: feedbackText,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === ratingBooking.id ? { ...b, ...json.data } : b))
        );
        setRatingBooking(null);
      } else {
        alert(json.error || "Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen pb-24">
      {/* Header */}
      <div className="border-border bg-background border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/network/speakers"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Mentors Directory</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-1 text-xs font-bold">
                My Builder Journey
              </span>
              <h1 className="text-foreground mt-2 text-2xl font-black sm:text-4xl">
                Requested Mentorship &amp; Speaking Sessions
              </h1>
              <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
                Track status updates, access virtual meeting links, and leave verified ratings.
              </p>
            </div>

            <Link href="/network/speakers">
              <Button className="bg-primary text-foreground hover:bg-primary font-bold">
                Book Another Mentor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="border-border bg-card hover:border-border flex flex-col justify-between gap-6 rounded-3xl border p-6 backdrop-blur-md transition-all sm:flex-row sm:items-center"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      b.status === "ACCEPTED"
                        ? "border-success/20 bg-success/10 text-success border"
                        : b.status === "PENDING"
                          ? "border-border bg-primary/10 text-primary border"
                          : b.status === "COMPLETED"
                            ? "border-primary/20 bg-primary/10 text-primary border"
                            : "border-destructive/20 bg-destructive/10 text-destructive border"
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-muted-foreground text-xs">{b.sessionType}</span>
                </div>

                <h3 className="text-foreground text-lg font-bold">{b.title}</h3>
                <p className="text-muted-foreground text-xs">Topic: {b.topic}</p>

                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                  <span className="text-foreground font-bold">
                    Mentor: {b.speaker.name} ({b.speaker.designation})
                  </span>
                  <span>
                    Proposed Date:{" "}
                    {new Date(b.preferredDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {b.declinedReason && (
                  <p className="text-destructive mt-2 text-xs">
                    Decline Reason: {b.declinedReason}
                  </p>
                )}

                {b.rating && (
                  <div className="text-primary flex items-center gap-1.5 pt-1 text-xs">
                    <Star className="fill-warning text-warning h-3.5 w-3.5" />
                    <span>Your rating: {b.rating}/5 stars</span>
                    {b.feedback && (
                      <span className="text-muted-foreground">— &ldquo;{b.feedback}&rdquo;</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {b.status === "ACCEPTED" && b.meetingUrl && (
                  <a
                    href={b.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold"
                  >
                    <Video className="h-4 w-4" />
                    Join Google Meet
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {b.status === "ACCEPTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRatingBooking(b)}
                    className="border-border hover:bg-muted text-foreground text-xs font-bold"
                  >
                    <Star className="text-primary mr-1.5 h-3.5 w-3.5" />
                    Complete &amp; Rate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="border-border rounded-3xl border border-dashed py-16 text-center">
            <Calendar className="text-muted-foreground mx-auto h-10 w-10" />
            <h3 className="text-foreground mt-3 text-base font-bold">No Booked Sessions</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Explore our vetted mentors to get code reviews, system design feedback, and career
              guidance.
            </p>
            <Link href="/network/speakers">
              <Button className="bg-primary text-primary-foreground hover:bg-primary-hover mt-4 text-xs font-bold">
                Explore Mentors Directory
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* RATING MODAL */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-border bg-background w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-foreground text-lg font-bold">Rate Mentorship Session</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Leave feedback for <strong>{ratingBooking.speaker.name}</strong> to update their
              verified rating.
            </p>

            <form onSubmit={handleRateSession} className="mt-4 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Rating (1 to 5 Stars)
                </label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className="p-1 text-2xl transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= ratingScore
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Qualitative Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="How did this session impact your technical clarity or project?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="border-border flex items-center justify-end gap-3 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRatingBooking(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold"
                >
                  {isSubmittingRating ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
