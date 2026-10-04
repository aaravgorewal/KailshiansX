"use client";

// src/components/admin/certificates/AdminCertificatesClient.tsx
// Complete Admin Certificate Studio implementing PRD §21:
// 1. Pick event
// 2. Import participants (from event registrations or CSV)
// 3. Choose template & drag-position fields
// 4. Bulk-generate PDFs with unique IDs & queue emails
// 5. Track delivery rate and audit logs

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  ExternalLink,
  Search,
  FileSpreadsheet,
  Send,
  ShieldCheck,
  Percent,
  Layers,
} from "lucide-react";
import { CertificateDesignerCanvas } from "./CertificateDesignerCanvas";
import type { CertificateTemplateConfig } from "@/server/certificates/pdf";
import { cn } from "@/lib/utils";

export interface EventOption {
  id: string;
  title: string;
  slug: string;
  type: string;
  startDate: string;
  confirmedRegistrationsCount: number;
}

export interface IssuedCertificateItem {
  id: string;
  uniqueId: string;
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventSlug: string;
  issuedAt: string;
  deliveryStatus: "SENT" | "PENDING" | "PROCESSING" | "FAILED";
  emailSentAt: string | null;
  registrationCode: string | null;
}

export interface DeliveryStats {
  totalIssued: number;
  sentCount: number;
  pendingCount: number;
  failedCount: number;
  deliveryRate: number;
}

export interface EventParticipantItem {
  id: string;
  registrationCode: string;
  name: string;
  email: string;
  checkedInAt: string | null;
  certificate: { id: string; uniqueId: string } | null;
}

export interface GeneratedCertificateResult {
  id: string;
  uniqueId: string;
  name: string;
  email: string;
  status?: "SENT" | "PENDING" | "PROCESSING" | "FAILED";
}

interface Props {
  events: EventOption[];
  initialStats: DeliveryStats;
  initialCertificates: IssuedCertificateItem[];
}

export function AdminCertificatesClient({ events, initialStats, initialCertificates }: Props) {
  const [activeTab, setActiveTab] = useState<"STUDIO" | "TRACKER">("STUDIO");
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || "");
  const [importMode, setImportMode] = useState<"REGISTRATIONS" | "CSV">("REGISTRATIONS");

  // Registration participants loaded from event
  const [eventParticipants, setEventParticipants] = useState<EventParticipantItem[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(new Set());
  const [loadingParticipants, setLoadingParticipants] = useState(Boolean(events[0]?.id));

  // CSV paste input
  const [csvText, setCsvText] = useState(
    "Aarav Sharma, aarav@example.com\nPriya Patel, priya@example.com\nRohan Verma, rohan@example.com"
  );

  // Template design state
  const [customDesignUrl, setCustomDesignUrl] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CertificateTemplateConfig["fields"] | null>(
    null
  );

  // Dispatch options
  const [sendEmailNow, setSendEmailNow] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<string | null>(null);

  // Delivery tracker state
  const [stats, setStats] = useState<DeliveryStats>(initialStats);
  const [certificates, setCertificates] = useState<IssuedCertificateItem[]>(initialCertificates);
  const [filterEvent, setFilterEvent] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [retrying, setRetrying] = useState(false);

  // Load participants when selected event changes
  useEffect(() => {
    if (!selectedEventId) return;
    let isCancelled = false;

    fetch(`/api/admin/certificates/events/${selectedEventId}/participants`)
      .then((res) => res.json())
      .then((json) => {
        if (isCancelled) return;
        if (json.success && Array.isArray(json.data)) {
          const participants = json.data as EventParticipantItem[];
          setEventParticipants(participants);
          // Select all participants who don't have a certificate yet by default
          const unissued = participants.filter((p) => !p.certificate).map((p) => p.id);
          setSelectedParticipantIds(
            new Set(unissued.length > 0 ? unissued : participants.map((p) => p.id))
          );
        }
      })
      .catch((err) => {
        if (!isCancelled) console.error("Failed to load participants:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingParticipants(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedEventId]);

  // Select all / toggle participants
  const handleToggleParticipant = (id: string) => {
    setSelectedParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedParticipantIds(new Set(eventParticipants.map((p) => p.id)));
    } else {
      setSelectedParticipantIds(new Set());
    }
  };

  // Parse CSV text into participant list
  const parseCsvParticipants = (): { name: string; email: string; registrationCode?: string }[] => {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const list: { name: string; email: string; registrationCode?: string }[] = [];

    for (const line of lines) {
      // Skip header row if present
      if (line.toLowerCase().startsWith("name,") || line.toLowerCase().startsWith("name\t"))
        continue;

      const parts = line.split(/[,\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const [name, email, code] = parts;
        if (email.includes("@")) {
          list.push({ name, email, registrationCode: code || undefined });
        }
      }
    }
    return list;
  };

  // Trigger bulk generation
  const handleBulkGenerate = async () => {
    if (!selectedEventId) {
      alert("Please select an event first.");
      return;
    }

    let participantsToGenerate: {
      name: string;
      email: string;
      registrationCode?: string;
      registrationId?: string;
    }[] = [];

    if (importMode === "REGISTRATIONS") {
      const selected = eventParticipants.filter((p) => selectedParticipantIds.has(p.id));
      if (selected.length === 0) {
        alert("Please select at least one participant.");
        return;
      }
      participantsToGenerate = selected.map((p) => ({
        name: p.name,
        email: p.email,
        registrationId: p.id,
        registrationCode: p.registrationCode,
      }));
    } else {
      participantsToGenerate = parseCsvParticipants();
      if (participantsToGenerate.length === 0) {
        alert("Please provide at least one valid participant in Name, Email format.");
        return;
      }
    }

    setGenerating(true);
    setGenerationResult(null);

    try {
      const res = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          participants: participantsToGenerate,
          sendEmailNow,
          customDesignUrl,
          customFields,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setGenerationResult(json.message);
        // Refresh delivery stats
        const currentEvent = events.find((e) => e.id === selectedEventId);
        setStats((prev) => ({
          ...prev,
          totalIssued: prev.totalIssued + json.data.createdCount,
          sentCount: prev.sentCount + json.data.emailsQueued,
          deliveryRate: Number(
            (
              ((prev.sentCount + json.data.emailsQueued) /
                (prev.totalIssued + json.data.createdCount)) *
              100
            ).toFixed(1)
          ),
        }));

        // Add newly generated certificates to list
        if (Array.isArray(json.data.certificates)) {
          const generatedList = json.data.certificates as GeneratedCertificateResult[];
          const newEntries: IssuedCertificateItem[] = generatedList.map((c) => ({
            id: c.id,
            uniqueId: c.uniqueId,
            participantName: c.name,
            participantEmail: c.email,
            eventTitle: currentEvent?.title || "Event",
            eventSlug: currentEvent?.slug || "event",
            issuedAt: new Date().toISOString(),
            deliveryStatus: c.status || "SENT",
            emailSentAt: new Date().toISOString(),
            registrationCode: null,
          }));
          setCertificates((prev) => [...newEntries, ...prev]);
        }
      } else {
        alert(json.error || "Failed to generate certificates");
      }
    } catch (err: unknown) {
      console.error("Bulk generate error:", err);
      alert("Error occurred while generating certificates.");
    } finally {
      setGenerating(false);
    }
  };

  // Retry failed deliveries
  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const res = await fetch("/api/admin/certificates/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: filterEvent !== "ALL" ? filterEvent : undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        alert(`Successfully retried delivery for ${json.data.retriedCount} certificates.`);
        setStats((prev) => ({
          ...prev,
          sentCount: prev.sentCount + json.data.retriedCount,
          failedCount: Math.max(0, prev.failedCount - json.data.retriedCount),
          deliveryRate: Number(
            (((prev.sentCount + json.data.retriedCount) / prev.totalIssued) * 100).toFixed(1)
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to retry:", err);
    } finally {
      setRetrying(false);
    }
  };

  // Filtered certificates table
  const filteredCertificates = certificates.filter((cert) => {
    if (filterEvent !== "ALL" && cert.eventTitle !== filterEvent) return false;
    if (filterStatus !== "ALL" && cert.deliveryStatus !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        cert.participantName.toLowerCase().includes(q) ||
        cert.participantEmail.toLowerCase().includes(q) ||
        cert.uniqueId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="space-y-8">
      {/* KPI Delivery Rate Stats Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-semibold tracking-wider uppercase">
              Total Issued
            </span>
            <Award className="text-brand-400 h-4 w-4" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalIssued}</div>
          <div className="text-surface-400 mt-1 text-[11px]">Verifiable certificates</div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-semibold tracking-wider uppercase">
              Delivered
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.sentCount}</div>
          <div className="text-surface-400 mt-1 text-[11px]">Sent via Resend queue</div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-semibold tracking-wider uppercase">
              Delivery Rate
            </span>
            <Percent className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{stats.deliveryRate}%</div>
          <div className="bg-surface-800 mt-2 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-1.5 rounded-full bg-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.deliveryRate))}%` }}
            />
          </div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-semibold tracking-wider uppercase">
              In Queue
            </span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.pendingCount}</div>
          <div className="text-surface-400 mt-1 text-[11px]">Pending dispatch</div>
        </div>

        <div className="bg-surface-900/80 border-surface-800 rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-surface-400 text-xs font-semibold tracking-wider uppercase">
              Failed
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats.failedCount}</div>
          <button
            type="button"
            onClick={handleRetryFailed}
            disabled={retrying || stats.failedCount === 0}
            className="text-brand-400 hover:text-brand-300 mt-1 flex items-center gap-1 text-[11px] font-semibold disabled:pointer-events-none disabled:opacity-40"
          >
            <RefreshCw className={cn("h-3 w-3", retrying && "animate-spin")} />
            <span>Retry Failed</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-surface-800 flex items-center gap-3 border-b pb-3">
        <button
          type="button"
          id="tab-certificate-studio"
          onClick={() => setActiveTab("STUDIO")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            activeTab === "STUDIO"
              ? "bg-brand-500 shadow-brand-500/20 text-white shadow-lg"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-900"
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>Certificate Studio &amp; Designer</span>
        </button>

        <button
          type="button"
          id="tab-delivery-tracker"
          onClick={() => setActiveTab("TRACKER")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            activeTab === "TRACKER"
              ? "bg-brand-500 shadow-brand-500/20 text-white shadow-lg"
              : "text-surface-400 hover:text-surface-200 hover:bg-surface-900"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Issued Registry &amp; Delivery Tracker</span>
          <span className="bg-surface-800 text-surface-300 rounded-full px-2 py-0.5 text-xs">
            {certificates.length}
          </span>
        </button>

        <Link
          href="/verify"
          target="_blank"
          className="text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border-brand-500/30 ml-auto flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Public /verify Portal</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* TAB 1: STUDIO */}
      {activeTab === "STUDIO" && (
        <div className="animate-in fade-in space-y-8 duration-200">
          {/* STEP 1: PICK EVENT */}
          <div className="bg-surface-900/80 border-surface-800 space-y-4 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                  Step 1
                </span>
                <h3 className="mt-2 text-lg font-extrabold text-white">Select Event</h3>
                <p className="text-surface-400 mt-0.5 text-xs">
                  Pick the hackathon, workshop, or meetup to generate certificates for.
                </p>
              </div>

              {selectedEvent && (
                <div className="hidden text-right sm:block">
                  <span className="text-surface-300 text-xs font-semibold">
                    {selectedEvent.confirmedRegistrationsCount} registered attendees
                  </span>
                  <div className="text-surface-400 text-[11px]">
                    {new Date(selectedEvent.startDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              )}
            </div>

            <select
              id="select-cert-event"
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setLoadingParticipants(true);
              }}
              className="bg-surface-950 border-surface-700 focus:ring-brand-500 w-full rounded-xl border px-4 py-3 text-sm font-medium text-white focus:ring-2 focus:outline-hidden"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.type}) — {e.confirmedRegistrationsCount} Attendees —{" "}
                  {new Date(e.startDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: IMPORT PARTICIPANTS */}
          <div className="bg-surface-900/80 border-surface-800 space-y-5 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-teal-400 uppercase">
                  Step 2
                </span>
                <h3 className="mt-2 text-lg font-extrabold text-white">Import Participants</h3>
                <p className="text-surface-400 mt-0.5 text-xs">
                  Load participants directly from confirmed event registrations or upload a custom
                  CSV list.
                </p>
              </div>

              {/* Import Mode Switcher */}
              <div className="bg-surface-950 border-surface-800 flex items-center gap-1.5 self-start rounded-xl border p-1.5 sm:self-auto">
                <button
                  type="button"
                  onClick={() => setImportMode("REGISTRATIONS")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    importMode === "REGISTRATIONS"
                      ? "bg-brand-500 text-white"
                      : "text-surface-400 hover:text-white"
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>From Registrations</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode("CSV")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    importMode === "CSV"
                      ? "bg-brand-500 text-white"
                      : "text-surface-400 hover:text-white"
                  )}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>CSV Upload / Paste</span>
                </button>
              </div>
            </div>

            {/* Mode A: Event Registrations Table */}
            {importMode === "REGISTRATIONS" && (
              <div className="space-y-4">
                <div className="text-surface-400 border-surface-800 flex items-center justify-between border-b pb-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAll(selectedParticipantIds.size !== eventParticipants.length)
                      }
                      className="text-brand-400 hover:text-brand-300 text-xs font-semibold"
                    >
                      {selectedParticipantIds.size === eventParticipants.length
                        ? "Deselect All"
                        : "Select All Attendees"}
                    </button>
                    <span>
                      Selected <strong className="text-white">{selectedParticipantIds.size}</strong>{" "}
                      of {eventParticipants.length} attendees
                    </span>
                  </div>

                  {loadingParticipants && (
                    <span className="text-surface-400 flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>

                <div className="border-surface-800 divide-surface-800/60 bg-surface-950/60 max-h-72 divide-y overflow-y-auto rounded-xl border">
                  {eventParticipants.length === 0 ? (
                    <div className="text-surface-500 py-8 text-center text-xs">
                      No confirmed registrations found for this event yet. Switch to CSV tab or
                      select another event.
                    </div>
                  ) : (
                    eventParticipants.map((p) => {
                      const isSelected = selectedParticipantIds.has(p.id);
                      const hasCert = Boolean(p.certificate);

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleParticipant(p.id)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between p-3 text-xs transition-colors",
                            isSelected
                              ? "bg-brand-500/10 text-surface-100"
                              : "hover:bg-surface-900/60 text-surface-400"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-500 pointer-events-none rounded"
                            />
                            <div>
                              <div className="flex items-center gap-2 font-bold text-white">
                                <span>{p.name}</span>
                                {p.checkedInAt && (
                                  <span className="py-0.2 rounded-full border border-emerald-800/80 bg-emerald-950/80 px-2 text-[10px] text-emerald-400">
                                    Checked In
                                  </span>
                                )}
                              </div>
                              <div className="text-surface-400 text-[11px]">{p.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-surface-400 font-mono text-[11px]">
                              {p.registrationCode}
                            </span>
                            {hasCert && (
                              <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                                Issued: {p.certificate?.uniqueId}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Mode B: CSV Paste & Upload */}
            {importMode === "CSV" && (
              <div className="space-y-3">
                <label className="text-surface-300 block text-xs font-semibold">
                  Paste CSV Data (Format: Name, Email, [RegistrationCode])
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Aarav Sharma, aarav@example.com&#10;Priya Patel, priya@example.com"
                  className="bg-surface-950 border-surface-700 text-surface-200 focus:ring-brand-500 w-full rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:ring-2 focus:outline-hidden"
                />
                <div className="text-surface-400 flex items-center justify-between text-xs">
                  <span>Detected {parseCsvParticipants().length} valid participant records</span>
                  <span className="text-[11px]">Columns: Name, Email (comma or tab separated)</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: TEMPLATE & DRAG-POSITION DESIGNER */}
          <div className="bg-surface-900/80 border-surface-800 space-y-4 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div>
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-purple-400 uppercase">
                Step 3
              </span>
              <h3 className="mt-2 text-lg font-extrabold text-white">
                Template Designer &amp; Coordinate Mapping
              </h3>
              <p className="text-surface-400 mt-0.5 text-xs">
                Drag and position Name, Event Title, Date, ID, and scannable QR verification box on
                your chosen certificate design.
              </p>
            </div>

            <CertificateDesignerCanvas
              sampleRecipientName={eventParticipants[0]?.name || "Dev Builder"}
              sampleEventTitle={selectedEvent?.title || "NirmanX Hackathon"}
              sampleDate={new Date().toLocaleDateString("en-IN", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              initialTemplateUrl={customDesignUrl}
              initialFields={customFields || undefined}
              onChange={(data) => {
                setCustomDesignUrl(data.templateUrl);
                setCustomFields(data.fields);
              }}
            />
          </div>

          {/* STEP 4: BULK GENERATE & EMAIL DISPATCH */}
          <div className="from-brand-950/40 via-surface-900 border-brand-500/30 space-y-5 rounded-2xl border bg-gradient-to-r to-purple-950/40 p-6 shadow-xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                  Step 4
                </span>
                <h3 className="mt-2 text-lg font-extrabold text-white">
                  Bulk PDF Generation &amp; Dispatch
                </h3>
                <p className="text-surface-400 mt-0.5 text-xs">
                  Generates tamper-proof vector PDFs with cryptographic IDs and dispatches them via
                  Resend queue.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-surface-200 flex cursor-pointer items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={sendEmailNow}
                    onChange={(e) => setSendEmailNow(e.target.checked)}
                    className="border-surface-700 bg-surface-900 text-brand-500 focus:ring-brand-500 rounded"
                  />
                  <span>Queue Email Notification</span>
                </label>
              </div>
            </div>

            {generationResult && (
              <div className="animate-in fade-in flex items-center gap-3 rounded-xl border border-emerald-800/80 bg-emerald-950/60 p-4 text-xs text-emerald-300">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>{generationResult}</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
              <div className="text-surface-400 text-xs">
                Ready to generate certificates for{" "}
                <strong className="text-white">
                  {importMode === "REGISTRATIONS"
                    ? selectedParticipantIds.size
                    : parseCsvParticipants().length}
                </strong>{" "}
                participants.
              </div>

              <button
                type="button"
                id="btn-bulk-generate-certificates"
                onClick={handleBulkGenerate}
                disabled={generating}
                className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/30 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 sm:w-auto"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Bulk-Generating Signed PDFs...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Generate &amp; Issue Certificates</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRY & DELIVERY TRACKER */}
      {activeTab === "TRACKER" && (
        <div className="animate-in fade-in space-y-6 duration-200">
          {/* Filter Bar */}
          <div className="bg-surface-900/80 border-surface-800 flex flex-col items-stretch justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-surface-400 pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by recipient name, email, or credential ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-950 border-surface-700/80 placeholder-surface-500 focus:ring-brand-500 w-full rounded-xl border py-2 pr-4 pl-9 text-xs text-white focus:ring-2 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="bg-surface-950 border-surface-700 text-surface-200 rounded-xl border px-3 py-2 text-xs"
              >
                <option value="ALL">All Events</option>
                {events.map((e) => (
                  <option key={e.id} value={e.title}>
                    {e.title}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface-950 border-surface-700 text-surface-200 rounded-xl border px-3 py-2 text-xs"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="SENT">Delivered (SENT)</option>
                <option value="PENDING">In Queue (PENDING)</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="border-surface-800 bg-surface-900/70 overflow-hidden rounded-2xl border shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-950/80 border-surface-800 text-surface-400 border-b text-[10px] tracking-wider uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Credential ID</th>
                    <th className="px-5 py-3.5">Recipient</th>
                    <th className="px-5 py-3.5">Event</th>
                    <th className="px-5 py-3.5">Delivery Status</th>
                    <th className="px-5 py-3.5">Issued At</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-surface-800/60 divide-y">
                  {filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-surface-500 py-12 text-center">
                        No certificates found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCertificates.map((cert) => {
                      const isDelivered = cert.deliveryStatus === "SENT";
                      const isPending =
                        cert.deliveryStatus === "PENDING" || cert.deliveryStatus === "PROCESSING";

                      return (
                        <tr key={cert.id} className="hover:bg-surface-800/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-brand-400 bg-surface-950 border-surface-800 rounded-md border px-2 py-0.5 font-mono font-bold">
                              {cert.uniqueId}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-white">{cert.participantName}</div>
                            <div className="text-surface-400 text-[11px]">
                              {cert.participantEmail}
                            </div>
                          </td>
                          <td className="text-surface-300 max-w-[200px] truncate px-5 py-3.5 font-medium">
                            {cert.eventTitle}
                          </td>
                          <td className="px-5 py-3.5">
                            {isDelivered ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Delivered
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-800/60 bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                                <Clock className="h-3 w-3" />
                                Queued
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-rose-800/60 bg-rose-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                                <AlertTriangle className="h-3 w-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="text-surface-400 px-5 py-3.5">
                            {new Date(cert.issuedAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/api/certificates/${cert.uniqueId}/download`}
                                download
                                className="text-surface-400 hover:bg-surface-800 rounded-lg p-1.5 transition-colors hover:text-white"
                                title="Download Signed PDF"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <Link
                                href={`/verify?id=${encodeURIComponent(cert.uniqueId)}`}
                                target="_blank"
                                className="text-surface-400 hover:text-brand-300 hover:bg-surface-800 rounded-lg p-1.5 transition-colors"
                                title="Open Public Verification"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
