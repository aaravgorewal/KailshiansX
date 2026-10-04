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
    <div className="min-h-screen bg-[#07090e] pb-24 text-white">
      {/* Header */}
      <div className="border-surface-800 bg-surface-950/80 border-b backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4">
            <Link
              href="/network/speakers"
              className="text-surface-400 hover:text-surface-200 inline-flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Mentors Directory</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                My Builder Journey
              </span>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
                Requested Mentorship &amp; Speaking Sessions
              </h1>
              <p className="text-surface-400 mt-2 text-xs sm:text-sm">
                Track status updates, access virtual meeting links, and leave verified ratings.
              </p>
            </div>

            <Link href="/network/speakers">
              <Button className="bg-purple-600 font-bold text-white hover:bg-purple-500">
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
              className="border-surface-800 bg-surface-900/60 hover:border-surface-700 flex flex-col justify-between gap-6 rounded-3xl border p-6 backdrop-blur-md transition-all sm:flex-row sm:items-center"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      b.status === "ACCEPTED"
                        ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : b.status === "PENDING"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                          : b.status === "COMPLETED"
                            ? "border border-purple-500/20 bg-purple-500/10 text-purple-400"
                            : "border border-red-500/20 bg-red-500/10 text-red-400"
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-surface-400 text-xs">{b.sessionType}</span>
                </div>

                <h3 className="text-lg font-bold text-white">{b.title}</h3>
                <p className="text-surface-400 text-xs">Topic: {b.topic}</p>

                <div className="text-surface-400 flex flex-wrap items-center gap-4 text-xs">
                  <span className="font-bold text-white">
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
                  <p className="mt-2 text-xs text-red-400">Decline Reason: {b.declinedReason}</p>
                )}

                {b.rating && (
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>Your rating: {b.rating}/5 stars</span>
                    {b.feedback && (
                      <span className="text-surface-400">— &ldquo;{b.feedback}&rdquo;</span>
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
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500"
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
                    className="border-surface-700 hover:bg-surface-800 text-xs font-bold text-white"
                  >
                    <Star className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                    Complete &amp; Rate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="border-surface-800 rounded-3xl border border-dashed py-16 text-center">
            <Calendar className="text-surface-600 mx-auto h-10 w-10" />
            <h3 className="mt-3 text-base font-bold text-white">No Booked Sessions</h3>
            <p className="text-surface-400 mt-1 text-xs">
              Explore our vetted mentors to get code reviews, system design feedback, and career
              guidance.
            </p>
            <Link href="/network/speakers">
              <Button className="mt-4 bg-purple-600 text-xs font-bold text-white hover:bg-purple-500">
                Explore Mentors Directory
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* RATING MODAL */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-950 w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Rate Mentorship Session</h3>
            <p className="text-surface-400 mt-1 text-xs">
              Leave feedback for <strong>{ratingBooking.speaker.name}</strong> to update their
              verified rating.
            </p>

            <form onSubmit={handleRateSession} className="mt-4 space-y-4">
              <div>
                <label className="text-surface-300 text-xs font-bold">Rating (1 to 5 Stars)</label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingScore(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= ratingScore ? "fill-amber-400 text-amber-400" : "text-surface-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-surface-300 text-xs font-bold">Qualitative Feedback</label>
                <textarea
                  rows={3}
                  placeholder="How did this session impact your technical clarity or project?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRatingBooking(null)}
                  className="text-surface-400 text-xs hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
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
