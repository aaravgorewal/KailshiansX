"use client";

// src/components/admin/certificates/AdminCertificatesClient.tsx
// Complete Admin Certificate Studio implementing :
// 1. Pick event
// 2. Import participants (from event registrations or CSV)
// 3. Choose template & drag-position fields
// 4. Bulk-generate PDFs with unique IDs & queue emails
// 5. Track delivery rate and audit logs

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Zap,
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
        <div className="bg-card border-border rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Total Issued
            </span>
            <Award className="text-primary h-4 w-4" />
          </div>
          <div className="text-foreground text-2xl font-black">{stats.totalIssued}</div>
          <div className="text-muted-foreground mt-1 text-xs">Verifiable certificates</div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Delivered
            </span>
            <CheckCircle2 className="text-success h-4 w-4" />
          </div>
          <div className="text-success text-2xl font-black">{stats.sentCount}</div>
          <div className="text-muted-foreground mt-1 text-xs">Sent via Resend queue</div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Delivery Rate
            </span>
            <Percent className="text-success h-4 w-4" />
          </div>
          <div className="text-success text-2xl font-black">{stats.deliveryRate}%</div>
          <div className="bg-muted mt-2 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-success h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.deliveryRate))}%` }}
            />
          </div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              In Queue
            </span>
            <Clock className="text-primary h-4 w-4" />
          </div>
          <div className="text-primary text-2xl font-black">{stats.pendingCount}</div>
          <div className="text-muted-foreground mt-1 text-xs">Pending dispatch</div>
        </div>

        <div className="bg-card border-border rounded-2xl border p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Failed
            </span>
            <AlertTriangle className="text-destructive h-4 w-4" />
          </div>
          <div className="text-destructive text-2xl font-black">{stats.failedCount}</div>
          <button
            type="button"
            onClick={handleRetryFailed}
            disabled={retrying || stats.failedCount === 0}
            className="text-primary hover:text-primary mt-1 flex items-center gap-1 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40"
          >
            <RefreshCw className={cn("h-3 w-3", retrying && "animate-spin")} />
            <span>Retry Failed</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-border flex items-center gap-3 border-b pb-3">
        <button
          type="button"
          id="tab-certificate-studio"
          onClick={() => setActiveTab("STUDIO")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            activeTab === "STUDIO"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          <Zap className="h-4 w-4" />
          <span>Certificate Studio &amp; Designer</span>
        </button>

        <button
          type="button"
          id="tab-delivery-tracker"
          onClick={() => setActiveTab("TRACKER")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all",
            activeTab === "TRACKER"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-card"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Issued Registry &amp; Delivery Tracker</span>
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            {certificates.length}
          </span>
        </button>

        <Link
          href="/verify"
          target="_blank"
          className="text-primary hover:text-primary bg-primary/10 hover:bg-primary/20 border-primary/30 ml-auto flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
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
          <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                  Step 1
                </span>
                <h3 className="text-foreground mt-2 text-lg font-extrabold">Select Event</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Pick the hackathon, workshop, or meetup to generate certificates for.
                </p>
              </div>

              {selectedEvent && (
                <div className="hidden text-right sm:block">
                  <span className="text-muted-foreground text-xs font-semibold">
                    {selectedEvent.confirmedRegistrationsCount} registered attendees
                  </span>
                  <div className="text-muted-foreground text-xs">
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
              className="bg-background border-border focus:ring-ring text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:ring-2 focus:outline-hidden"
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
          <div className="bg-card border-border space-y-5 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                  Step 2
                </span>
                <h3 className="text-foreground mt-2 text-lg font-extrabold">Import Participants</h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Load participants directly from confirmed event registrations or upload a custom
                  CSV list.
                </p>
              </div>

              {/* Import Mode Switcher */}
              <div className="bg-background border-border flex items-center gap-1.5 self-start rounded-xl border p-1.5 sm:self-auto">
                <button
                  type="button"
                  onClick={() => setImportMode("REGISTRATIONS")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    importMode === "REGISTRATIONS"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
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
                <div className="text-muted-foreground border-border flex items-center justify-between border-b pb-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectAll(selectedParticipantIds.size !== eventParticipants.length)
                      }
                      className="text-primary hover:text-primary text-xs font-semibold"
                    >
                      {selectedParticipantIds.size === eventParticipants.length
                        ? "Deselect All"
                        : "Select All Attendees"}
                    </button>
                    <span>
                      Selected{" "}
                      <strong className="text-foreground">{selectedParticipantIds.size}</strong> of{" "}
                      {eventParticipants.length} attendees
                    </span>
                  </div>

                  {loadingParticipants && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Loading...
                    </span>
                  )}
                </div>

                <div className="border-border divide-border bg-background max-h-72 divide-y overflow-y-auto rounded-xl border">
                  {eventParticipants.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-xs">
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
                              ? "bg-primary/10 text-foreground"
                              : "hover:bg-card text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="border-border bg-card text-primary focus:ring-ring pointer-events-none rounded"
                            />
                            <div>
                              <div className="text-foreground flex items-center gap-2 font-bold">
                                <span>{p.name}</span>
                                {p.checkedInAt && (
                                  <span className="py-0.2 border-success/20 bg-success/10 text-success rounded-full border px-2 text-xs">
                                    Checked In
                                  </span>
                                )}
                              </div>
                              <div className="text-muted-foreground text-xs">{p.email}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground font-mono text-xs">
                              {p.registrationCode}
                            </span>
                            {hasCert && (
                              <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2 py-0.5 text-xs font-bold">
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
                <label className="text-muted-foreground block text-xs font-semibold">
                  Paste CSV Data (Format: Name, Email, [RegistrationCode])
                </label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="Aarav Sharma, aarav@example.com&#10;Priya Patel, priya@example.com"
                  className="bg-background border-border text-foreground focus:ring-ring w-full rounded-xl border p-3.5 font-mono text-xs leading-relaxed focus:ring-2 focus:outline-hidden"
                />
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>Detected {parseCsvParticipants().length} valid participant records</span>
                  <span className="text-xs">Columns: Name, Email (comma or tab separated)</span>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: TEMPLATE & DRAG-POSITION DESIGNER */}
          <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xl backdrop-blur-xl">
            <div>
              <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                Step 3
              </span>
              <h3 className="text-foreground mt-2 text-lg font-extrabold">
                Template Designer &amp; Coordinate Mapping
              </h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
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
          <div className="bg-card border-border space-y-5 rounded-2xl border p-6 shadow-xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="border-border bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                  Step 4
                </span>
                <h3 className="text-foreground mt-2 text-lg font-extrabold">
                  Bulk PDF Generation &amp; Dispatch
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Generates tamper-proof vector PDFs with cryptographic IDs and dispatches them via
                  Resend queue.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-foreground flex cursor-pointer items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={sendEmailNow}
                    onChange={(e) => setSendEmailNow(e.target.checked)}
                    className="border-border bg-card text-primary focus:ring-ring rounded"
                  />
                  <span>Queue Email Notification</span>
                </label>
              </div>
            </div>

            {generationResult && (
              <div className="animate-in fade-in text-success border-success/20 bg-success/10 flex items-center gap-3 rounded-xl border p-4 text-xs">
                <CheckCircle2 className="text-success h-5 w-5 shrink-0" />
                <span>{generationResult}</span>
              </div>
            )}

            <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
              <div className="text-muted-foreground text-xs">
                Ready to generate certificates for{" "}
                <strong className="text-foreground">
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
                className="bg-primary hover:bg-primary-hover text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition-all disabled:opacity-50 sm:w-auto"
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
          <div className="bg-card border-border flex flex-col items-stretch justify-between gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by recipient name, email, or credential ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-border placeholder:text-muted-foreground focus:ring-ring text-foreground w-full rounded-xl border py-2 pr-4 pl-9 text-xs focus:ring-2 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="bg-background border-border text-foreground rounded-xl border px-3 py-2 text-xs"
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
                className="bg-background border-border text-foreground rounded-xl border px-3 py-2 text-xs"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="SENT">Delivered (SENT)</option>
                <option value="PENDING">In Queue (PENDING)</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-background border-border text-muted-foreground border-b text-xs tracking-wider uppercase">
                  <tr>
                    <th className="px-5 py-3.5">Credential ID</th>
                    <th className="px-5 py-3.5">Recipient</th>
                    <th className="px-5 py-3.5">Event</th>
                    <th className="px-5 py-3.5">Delivery Status</th>
                    <th className="px-5 py-3.5">Issued At</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-muted-foreground py-12 text-center">
                        No certificates found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCertificates.map((cert) => {
                      const isDelivered = cert.deliveryStatus === "SENT";
                      const isPending =
                        cert.deliveryStatus === "PENDING" || cert.deliveryStatus === "PROCESSING";

                      return (
                        <tr key={cert.id} className="hover:bg-muted transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-primary bg-background border-border rounded-md border px-2 py-0.5 font-mono font-bold">
                              {cert.uniqueId}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-foreground font-bold">{cert.participantName}</div>
                            <div className="text-muted-foreground text-xs">
                              {cert.participantEmail}
                            </div>
                          </td>
                          <td className="text-muted-foreground max-w-[200px] truncate px-5 py-3.5 font-medium">
                            {cert.eventTitle}
                          </td>
                          <td className="px-5 py-3.5">
                            {isDelivered ? (
                              <span className="border-success/20 bg-success/10 text-success inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                Delivered
                              </span>
                            ) : isPending ? (
                              <span className="border-border bg-muted text-primary inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                <Clock className="h-3 w-3" />
                                Queued
                              </span>
                            ) : (
                              <span className="border-destructive/30 bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                <AlertTriangle className="h-3 w-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="text-muted-foreground px-5 py-3.5">
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
                                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1.5 transition-colors"
                                title="Download Signed PDF"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <Link
                                href={`/verify?id=${encodeURIComponent(cert.uniqueId)}`}
                                target="_blank"
                                className="text-muted-foreground hover:text-primary hover:bg-muted rounded-lg p-1.5 transition-colors"
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
