// src/components/network/MentorCockpitClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  Star,
  Settings,
  Users,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BookingItem {
  id: string;
  title: string;
  topic: string;
  sessionType: string;
  description: string;
  preferredDate: string;
  durationMinutes: number;
  format: string;
  meetingUrl: string | null;
  status: string;
  declinedReason: string | null;
  mentorNotes: string | null;
  rating: number | null;
  feedback: string | null;
  createdAt: string;
  requester: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    username: string | null;
    headline: string | null;
  };
  chapter: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export function MentorCockpitClient({
  initialBookings,
  initialSpeakerProfile,
}: {
  initialBookings: BookingItem[];
  initialSpeakerProfile: {
    id: string;
    name: string;
    slug: string;
    designation: string | null;
    organisation: string | null;
    bio: string | null;
    topics: string[];
    sessionTypes: string[];
    availabilityStatus: string;
    weeklyAvailabilityHours: number;
    preferredCadence: string | null;
    meetingPlatform: string | null;
    calendlyUrl: string | null;
    rating: number;
    totalSessionsConducted: number;
  } | null;
}) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [profile, setProfile] = useState(initialSpeakerProfile);

  // Availability Edit Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [statusInput, setStatusInput] = useState(profile?.availabilityStatus || "AVAILABLE");
  const [hoursInput, setHoursInput] = useState(profile?.weeklyAvailabilityHours || 5);
  const [cadenceInput, setCadenceInput] = useState(
    profile?.preferredCadence || "Weekdays after 6:00 PM IST"
  );
  const [platformInput, setPlatformInput] = useState(profile?.meetingPlatform || "Google Meet");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Response Modal State
  const [activeBooking, setActiveBooking] = useState<BookingItem | null>(null);
  const [actionType, setActionType] = useState<"ACCEPT" | "DECLINE">("ACCEPT");
  const [meetingUrlInput, setMeetingUrlInput] = useState("https://meet.google.com/kws-session");
  const [declineReasonInput, setDeclineReasonInput] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "ACCEPTED");

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/network/speakers/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speakerId: profile?.id,
          availabilityStatus: statusInput,
          weeklyAvailabilityHours: Number(hoursInput),
          preferredCadence: cadenceInput,
          meetingPlatform: platformInput,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProfile((prev) => (prev ? { ...prev, ...json.data } : json.data));
        setIsEditingProfile(false);
      } else {
        alert(json.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRespondBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;
    setIsSubmittingResponse(true);
    try {
      const res = await fetch(`/api/network/bookings/${activeBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          meetingUrl: actionType === "ACCEPT" ? meetingUrlInput : undefined,
          declinedReason: actionType === "DECLINE" ? declineReasonInput : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === activeBooking.id ? { ...b, ...json.data } : b))
        );
        setActiveBooking(null);
      } else {
        alert(json.error || "Failed to respond to booking");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingResponse(false);
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
              <span>Back to Mentor &amp; Speaker Network</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
                  Mentor Operations Cockpit
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  Status: {profile?.availabilityStatus || "AVAILABLE"}
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">
                {profile?.name ? `${profile.name} — Session Queue` : "Mentor Command Center"}
              </h1>

              <p className="text-surface-400 mt-2 text-xs sm:text-sm">
                Manage incoming mentorship requests, publish Google Meet links, and adjust weekly
                booking hours.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                id="btn-edit-availability"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant="outline"
                className="border-surface-700 hover:bg-surface-800 font-bold text-white"
              >
                <Settings className="mr-2 h-4 w-4 text-purple-400" />
                {isEditingProfile ? "Close Settings" : "Edit Availability"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8 sm:px-6 lg:px-8">
        {/* Availability Settings Drawer/Card */}
        {isEditingProfile && (
          <div className="bg-surface-900/90 rounded-3xl border border-purple-500/40 p-6 shadow-2xl backdrop-blur-md">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Settings className="h-5 w-5 text-purple-400" />
              Availability &amp; Booking Preferences
            </h3>

            <form
              onSubmit={handleSaveAvailability}
              className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="text-surface-300 text-xs font-bold">Availability Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="border-surface-700 bg-surface-950 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="AVAILABLE">Available for bookings</option>
                  <option value="LIMITED">Limited spots this week</option>
                  <option value="BUSY">Busy / High Load</option>
                  <option value="UNAVAILABLE">Unavailable / On Leave</option>
                </select>
              </div>

              <div>
                <label className="text-surface-300 text-xs font-bold">Weekly Hours Quota</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(Number(e.target.value))}
                  className="border-surface-700 bg-surface-950 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-surface-300 text-xs font-bold">
                  Preferred Meeting Platform
                </label>
                <input
                  type="text"
                  placeholder="Google Meet / Zoom"
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  className="border-surface-700 bg-surface-950 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-surface-300 text-xs font-bold">Preferred Days / Times</label>
                <input
                  type="text"
                  placeholder="e.g. Weekdays after 7 PM IST"
                  value={cadenceInput}
                  onChange={(e) => setCadenceInput(e.target.value)}
                  className="border-surface-700 bg-surface-950 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 sm:col-span-2 lg:col-span-4">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                >
                  {isSavingProfile ? "Saving..." : "Save Availability"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5">
            <span className="text-surface-400 text-xs font-bold uppercase">Pending Review</span>
            <div className="mt-2 text-3xl font-black text-amber-400">{pendingBookings.length}</div>
            <p className="text-surface-500 mt-1 text-xs">Requires confirmation or reschedule</p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5">
            <span className="text-surface-400 text-xs font-bold uppercase">Upcoming Sessions</span>
            <div className="mt-2 text-3xl font-black text-emerald-400">
              {confirmedBookings.length}
            </div>
            <p className="text-surface-500 mt-1 text-xs">Google Meet links attached</p>
          </div>

          <div className="border-surface-800 bg-surface-900/60 rounded-2xl border p-5">
            <span className="text-surface-400 text-xs font-bold uppercase">Average Rating</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl font-black text-white">
                {profile?.rating.toFixed(1) || "5.0"}
              </span>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-surface-500 mt-1 text-xs">
              From {profile?.totalSessionsConducted || 0} completed builder sessions
            </p>
          </div>
        </div>

        {/* SECTION 1: PENDING REQUESTS */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Clock className="h-5 w-5 text-amber-400" />
            Pending Booking Requests ({pendingBookings.length})
          </h2>

          <div className="space-y-4">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-surface-900/60 flex flex-col justify-between gap-6 rounded-3xl border border-amber-500/20 p-6 backdrop-blur-md lg:flex-row lg:items-center"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                      {b.sessionType}
                    </span>
                    <span className="text-surface-400 text-xs">
                      Requested: {new Date(b.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{b.title}</h3>
                  <p className="text-surface-400 text-xs">Topic: {b.topic}</p>

                  {b.description && (
                    <p className="text-surface-300 bg-surface-950/60 border-surface-800 max-w-2xl rounded-xl border p-3 text-xs">
                      {b.description}
                    </p>
                  )}

                  <div className="text-surface-400 flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 font-bold text-white">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                      Requester: {b.requester.name || b.requester.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-pink-400" />
                      Proposed Date:{" "}
                      {new Date(b.preferredDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {b.chapter && (
                      <span className="flex items-center gap-1 text-purple-300">
                        Chapter: {b.chapter.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Button
                    id={`btn-accept-${b.id}`}
                    onClick={() => {
                      setActiveBooking(b);
                      setActionType("ACCEPT");
                    }}
                    className="bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Accept Session
                  </Button>
                  <Button
                    id={`btn-decline-${b.id}`}
                    onClick={() => {
                      setActiveBooking(b);
                      setActionType("DECLINE");
                    }}
                    variant="outline"
                    className="border-surface-700 text-surface-300 hover:bg-surface-800 text-xs font-bold hover:text-white"
                  >
                    <XCircle className="mr-1.5 h-4 w-4 text-red-400" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {pendingBookings.length === 0 && (
              <div className="border-surface-800 text-surface-400 rounded-2xl border border-dashed py-12 text-center text-xs">
                No pending session requests at the moment.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: CONFIRMED SESSIONS */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <Calendar className="h-5 w-5 text-emerald-400" />
            Upcoming Confirmed Sessions ({confirmedBookings.length})
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {confirmedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-surface-900/60 rounded-3xl border border-emerald-500/20 p-6 backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    Confirmed
                  </span>
                  <span className="text-surface-400 text-xs">
                    {new Date(b.preferredDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-white">{b.title}</h3>
                <p className="text-surface-400 mt-1 text-xs">Topic: {b.topic}</p>
                <p className="text-surface-300 mt-2 text-xs">
                  Builder: <strong>{b.requester.name || b.requester.email}</strong>
                </p>

                {b.meetingUrl && (
                  <div className="border-surface-800 mt-4 border-t pt-4">
                    <a
                      href={b.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-purple-500"
                    >
                      <Video className="h-4 w-4" />
                      Launch Meeting Link
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {confirmedBookings.length === 0 && (
            <div className="border-surface-800 text-surface-400 rounded-2xl border border-dashed py-12 text-center text-xs">
              No confirmed sessions scheduled yet.
            </div>
          )}
        </div>
      </div>

      {/* RESPOND MODAL */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-950 w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {actionType === "ACCEPT" ? "Confirm & Accept Session" : "Decline Booking Request"}
            </h3>
            <p className="text-surface-400 mt-1 text-xs">
              {actionType === "ACCEPT"
                ? `Attach the meeting link for ${activeBooking.requester.name || activeBooking.requester.email}`
                : "Provide a brief note or alternate time for the builder."}
            </p>

            <form onSubmit={handleRespondBooking} className="mt-4 space-y-4">
              {actionType === "ACCEPT" ? (
                <div>
                  <label className="text-surface-300 text-xs font-bold">
                    Google Meet / Zoom URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={meetingUrlInput}
                    onChange={(e) => setMeetingUrlInput(e.target.value)}
                    className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-surface-300 text-xs font-bold">Reason for Declining</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule clash with production deployment"
                    value={declineReasonInput}
                    onChange={(e) => setDeclineReasonInput(e.target.value)}
                    className="border-surface-700 bg-surface-900 mt-1 w-full rounded-xl border px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="border-surface-800 flex items-center justify-end gap-3 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveBooking(null)}
                  className="text-surface-400 text-xs hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className={`text-xs font-bold text-white ${
                    actionType === "ACCEPT"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  {isSubmittingResponse
                    ? "Updating..."
                    : actionType === "ACCEPT"
                      ? "Confirm & Notify Builder"
                      : "Decline Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
