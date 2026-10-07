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
              <span>Back to Mentor &amp; Speaker Network</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-1 text-xs font-bold">
                  Mentor Operations Cockpit
                </span>
                <span className="border-success/30 bg-success/10 text-success rounded-full border px-3 py-1 text-xs font-bold">
                  Status: {profile?.availabilityStatus || "AVAILABLE"}
                </span>
              </div>

              <h1 className="text-foreground mt-2 text-2xl font-black sm:text-4xl">
                {profile?.name ? `${profile.name} — Session Queue` : "Mentor Command Center"}
              </h1>

              <p className="text-muted-foreground mt-2 text-xs sm:text-sm">
                Manage incoming mentorship requests, publish Google Meet links, and adjust weekly
                booking hours.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                id="btn-edit-availability"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                variant="outline"
                className="border-border hover:bg-muted text-foreground font-bold"
              >
                <Settings className="text-primary mr-2 h-4 w-4" />
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
          <div className="bg-card border-primary/40 rounded-3xl border p-6 shadow-2xl backdrop-blur-md">
            <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
              <Settings className="text-primary h-5 w-5" />
              Availability &amp; Booking Preferences
            </h3>

            <form
              onSubmit={handleSaveAvailability}
              className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Availability Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="AVAILABLE">Available for bookings</option>
                  <option value="LIMITED">Limited spots this week</option>
                  <option value="BUSY">Busy / High Load</option>
                  <option value="UNAVAILABLE">Unavailable / On Leave</option>
                </select>
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Weekly Hours Quota
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(Number(e.target.value))}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Preferred Meeting Platform
                </label>
                <input
                  type="text"
                  placeholder="Google Meet / Zoom"
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground text-xs font-bold">
                  Preferred Days / Times
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekdays after 7 PM IST"
                  value={cadenceInput}
                  onChange={(e) => setCadenceInput(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 sm:col-span-2 lg:col-span-4">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold"
                >
                  {isSavingProfile ? "Saving..." : "Save Availability"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* KPI Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border-border bg-card rounded-2xl border p-5">
            <span className="text-muted-foreground text-xs font-bold uppercase">
              Pending Review
            </span>
            <div className="text-primary mt-2 text-3xl font-black">{pendingBookings.length}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Requires confirmation or reschedule
            </p>
          </div>

          <div className="border-border bg-card rounded-2xl border p-5">
            <span className="text-muted-foreground text-xs font-bold uppercase">
              Upcoming Sessions
            </span>
            <div className="text-success mt-2 text-3xl font-black">{confirmedBookings.length}</div>
            <p className="text-muted-foreground mt-1 text-xs">Google Meet links attached</p>
          </div>

          <div className="border-border bg-card rounded-2xl border p-5">
            <span className="text-muted-foreground text-xs font-bold uppercase">
              Average Rating
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-foreground text-3xl font-black">
                {profile?.rating.toFixed(1) || "5.0"}
              </span>
              <Star className="fill-warning text-warning h-5 w-5" />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              From {profile?.totalSessionsConducted || 0} completed builder sessions
            </p>
          </div>
        </div>

        {/* SECTION 1: PENDING REQUESTS */}
        <div className="space-y-4">
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
            <Clock className="text-primary h-5 w-5" />
            Pending Booking Requests ({pendingBookings.length})
          </h2>

          <div className="space-y-4">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-card border-border flex flex-col justify-between gap-6 rounded-3xl border p-6 backdrop-blur-md lg:flex-row lg:items-center"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="border-border bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-xs font-bold">
                      {b.sessionType}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Requested: {new Date(b.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <h3 className="text-foreground text-lg font-bold">{b.title}</h3>
                  <p className="text-muted-foreground text-xs">Topic: {b.topic}</p>

                  {b.description && (
                    <p className="text-muted-foreground bg-background border-border max-w-2xl rounded-xl border p-3 text-xs">
                      {b.description}
                    </p>
                  )}

                  <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xs">
                    <span className="text-foreground flex items-center gap-1 font-bold">
                      <Users className="text-primary h-3.5 w-3.5" />
                      Requester: {b.requester.name || b.requester.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="text-primary h-3.5 w-3.5" />
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
                      <span className="text-primary flex items-center gap-1">
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
                    className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold"
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
                    className="border-border text-muted-foreground hover:bg-muted hover:text-foreground text-xs font-bold"
                  >
                    <XCircle className="text-destructive mr-1.5 h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}

            {pendingBookings.length === 0 && (
              <div className="border-border text-muted-foreground rounded-2xl border border-dashed py-12 text-center text-xs">
                No pending session requests at the moment.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: CONFIRMED SESSIONS */}
        <div className="space-y-4">
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
            <Calendar className="text-success h-5 w-5" />
            Upcoming Confirmed Sessions ({confirmedBookings.length})
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {confirmedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-card border-success/20 rounded-3xl border p-6 backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="border-success/30 bg-success/10 text-success rounded-full border px-2.5 py-0.5 text-xs font-bold">
                    Confirmed
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(b.preferredDate).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <h3 className="text-foreground mt-3 text-lg font-bold">{b.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">Topic: {b.topic}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  Builder: <strong>{b.requester.name || b.requester.email}</strong>
                </p>

                {b.meetingUrl && (
                  <div className="border-border mt-4 border-t pt-4">
                    <a
                      href={b.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-colors"
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
            <div className="border-border text-muted-foreground rounded-2xl border border-dashed py-12 text-center text-xs">
              No confirmed sessions scheduled yet.
            </div>
          )}
        </div>
      </div>

      {/* RESPOND MODAL */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="border-border bg-background w-full max-w-md rounded-3xl border p-6 shadow-2xl">
            <h3 className="text-foreground text-lg font-bold">
              {actionType === "ACCEPT" ? "Confirm & Accept Session" : "Decline Booking Request"}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {actionType === "ACCEPT"
                ? `Attach the meeting link for ${activeBooking.requester.name || activeBooking.requester.email}`
                : "Provide a brief note or alternate time for the builder."}
            </p>

            <form onSubmit={handleRespondBooking} className="mt-4 space-y-4">
              {actionType === "ACCEPT" ? (
                <div>
                  <label className="text-muted-foreground text-xs font-bold">
                    Google Meet / Zoom URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={meetingUrlInput}
                    onChange={(e) => setMeetingUrlInput(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-muted-foreground text-xs font-bold">
                    Reason for Declining
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule clash with production deployment"
                    value={declineReasonInput}
                    onChange={(e) => setDeclineReasonInput(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary mt-1 w-full rounded-xl border px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="border-border flex items-center justify-end gap-3 border-t pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveBooking(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className={`text-primary-foreground text-xs font-bold ${
                    actionType === "ACCEPT"
                      ? "bg-primary hover:bg-primary-hover"
                      : "bg-destructive hover:bg-destructive-hover"
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
