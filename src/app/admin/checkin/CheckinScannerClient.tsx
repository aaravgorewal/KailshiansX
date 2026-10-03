"use client";

import * as React from "react";
import jsQR from "jsqr";
import {
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  UserCheck,
  Sparkles,
  Mail,
  Phone,
  Building,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { checkinAttendee, lookupRegistrations, type CheckinResult } from "@/server/admin/checkin";

export interface EventOption {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  city?: string | null;
}

interface CheckinScannerClientProps {
  events: EventOption[];
  initialEventId?: string;
  recentCheckins: Array<{
    id: string;
    attendeeName: string;
    email: string;
    registrationCode: string;
    eventTitle: string;
    ticketTier: string;
    checkedInAt: string;
    checkedInBy?: string | null;
    method: string;
  }>;
}

export function CheckinScannerClient({
  events,
  initialEventId,
  recentCheckins: initialRecent,
}: CheckinScannerClientProps) {
  const [selectedEventId, setSelectedEventId] = React.useState<string>(initialEventId || "");
  const [activeTab, setActiveTab] = React.useState<"camera" | "search">("camera");

  // Camera state
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [cameras, setCameras] = React.useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string>("");
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  // Scan cooldown & processing lock
  const [isProcessing, setIsProcessing] = React.useState(false);
  const lastScannedCodeRef = React.useRef<string>("");
  const scanCooldownTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Result state
  const [lastResult, setLastResult] = React.useState<CheckinResult | null>(null);
  const [recentList, setRecentList] = React.useState(initialRecent);

  // Manual search state
  type SearchResultItem = Awaited<ReturnType<typeof lookupRegistrations>>[number];
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Audio tone synthesizer using Web Audio API
  const playChime = React.useCallback(
    (type: "success" | "warning" | "error") => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();

        if (type === "success") {
          // Cheerful high double beep
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
          gain1.gain.setValueAtTime(0.3, ctx.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.25);
        } else if (type === "warning") {
          // Low amber buzz
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
          osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.1); // C4
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } else {
          // Error buzz
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(180, ctx.currentTime);
          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (err) {
        console.error("Audio error:", err);
      }
    },
    [soundEnabled]
  );

  // Enumerate video cameras
  React.useEffect(() => {
    async function listCameras() {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoDevices);
        // Default to rear/back camera if found
        const backCam = videoDevices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("environment") ||
            d.label.toLowerCase().includes("rear")
        );
        if (backCam) {
          setSelectedDeviceId(backCam.deviceId);
        } else if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Camera listing error:", err);
      }
    }
    listCameras();
  }, []);

  // Handle processing of a scanned or entered code
  const handleCheckin = React.useCallback(
    async (code: string, method: "QR" | "MANUAL" = "QR") => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const res = await checkinAttendee({
          qrTokenOrCode: code,
          eventId: selectedEventId || undefined,
          method,
        });

        setLastResult(res);

        if (res.success && res.attendee) {
          playChime("success");
          setRecentList((prev) => [
            {
              id: `${Date.now()}`,
              attendeeName: res.attendee!.name,
              email: res.attendee!.email,
              registrationCode: res.attendee!.registrationCode,
              eventTitle: res.attendee!.eventTitle,
              ticketTier: res.attendee!.ticketTier,
              checkedInAt: res.attendee!.checkedInAt || new Date().toISOString(),
              checkedInBy: res.attendee!.checkedInBy || "You",
              method,
            },
            ...prev.slice(0, 14),
          ]);
        } else if (res.alreadyCheckedIn) {
          playChime("warning");
        } else {
          playChime("error");
        }
      } catch (err) {
        console.error("Check-in error:", err);
        setLastResult({
          success: false,
          error: "An unexpected error occurred while checking in.",
        });
        playChime("error");
      } finally {
        // Unlock after short delay
        setTimeout(() => {
          setIsProcessing(false);
        }, 1200);
      }
    },
    [isProcessing, selectedEventId, playChime]
  );

  // Camera video stream lifecycle
  React.useEffect(() => {
    if (activeTab !== "camera") {
      return;
    }

    let currentStream: MediaStream | null = null;
    let animationFrameId: number;

    async function startCamera() {
      setCameraError(null);
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "environment" },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play();
          setCameraActive(true);
          scanFrame();
        }
      } catch (err: unknown) {
        console.error("Camera access failed:", err);
        const isNotAllowed = err instanceof Error && err.name === "NotAllowedError";
        setCameraError(
          isNotAllowed
            ? "Camera permission denied. Please allow camera access in your browser."
            : "Could not start camera stream. Use manual search or check device settings."
        );
        setCameraActive(false);
      }
    }

    function scanFrame() {
      if (!videoRef.current || !canvasRef.current) {
        animationFrameId = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          const scannedText = code.data.trim();
          // Avoid scanning same QR within 3 seconds
          if (scannedText !== lastScannedCodeRef.current) {
            lastScannedCodeRef.current = scannedText;
            if (scanCooldownTimerRef.current) clearTimeout(scanCooldownTimerRef.current);
            scanCooldownTimerRef.current = setTimeout(() => {
              lastScannedCodeRef.current = "";
            }, 3000);

            handleCheckin(scannedText, "QR");
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [activeTab, selectedDeviceId, handleCheckin]);

  // Manual search execution with debounce
  React.useEffect(() => {
    if (activeTab !== "search") return;

    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await lookupRegistrations({
          search: q,
          eventId: selectedEventId || undefined,
        });
        setSearchResults(results);
      } catch (err) {
        console.error("Lookup failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedEventId, activeTab]);

  return (
    <div className="space-y-8">
      {/* Event Filter & Audio Toggle Toolbar */}
      <div className="border-surface-800 bg-surface-900/80 flex flex-col items-stretch justify-between gap-4 rounded-2xl border p-4 backdrop-blur-md sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <label
            htmlFor="event-filter"
            className="text-surface-400 shrink-0 text-xs font-semibold tracking-wider uppercase"
          >
            Event Context:
          </label>
          <select
            id="event-filter"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="border-surface-700 bg-surface-950 text-surface-100 focus:border-brand-500 focus:ring-brand-500 w-full max-w-md rounded-xl border px-3.5 py-2 text-sm transition outline-none focus:ring-1"
          >
            <option value="">⚡ Universal Scanner (All Events)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.city || "Online"})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {cameras.length > 1 && activeTab === "camera" && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="border-surface-700 bg-surface-950 text-surface-200 rounded-xl border px-3 py-1.5 text-xs outline-none"
            >
              {cameras.map((c, i) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="text-surface-400 hover:text-surface-100"
            title={soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
          >
            {soundEnabled ? (
              <Volume2 className="text-brand-400 size-4" />
            ) : (
              <VolumeX className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-surface-800 flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
            activeTab === "camera"
              ? "border-brand-500 text-brand-400 bg-brand-500/5"
              : "text-surface-400 hover:text-surface-200 border-transparent"
          }`}
        >
          <Camera className="size-4" />
          <span>Camera QR Scanner</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-semibold transition-all ${
            activeTab === "search"
              ? "border-brand-500 text-brand-400 bg-brand-500/5"
              : "text-surface-400 hover:text-surface-200 border-transparent"
          }`}
        >
          <Search className="size-4" />
          <span>Manual Search & Check-in</span>
        </button>
      </div>

      {/* Main Scanner Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Scanner or Manual Search View */}
        <div className="space-y-6 lg:col-span-7">
          {activeTab === "camera" && (
            <div className="border-surface-800 bg-surface-950 relative overflow-hidden rounded-3xl border shadow-2xl">
              {/* Hidden canvas for jsQR frame analysis */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Video preview */}
              <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Reticle / Viewfinder Frame */}
                {cameraActive && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="border-brand-500/70 relative size-64 rounded-3xl border-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] sm:size-72">
                      {/* Laser scanning bar */}
                      <div className="via-brand-400 absolute inset-x-2 top-0 h-1 animate-pulse bg-gradient-to-r from-transparent to-transparent shadow-[0_0_15px_#3d61fc]" />

                      {/* Corner markers */}
                      <div className="border-brand-400 absolute -top-1 -left-1 size-6 rounded-tl-xl border-t-4 border-l-4" />
                      <div className="border-brand-400 absolute -top-1 -right-1 size-6 rounded-tr-xl border-t-4 border-r-4" />
                      <div className="border-brand-400 absolute -bottom-1 -left-1 size-6 rounded-bl-xl border-b-4 border-l-4" />
                      <div className="border-brand-400 absolute -right-1 -bottom-1 size-6 rounded-br-xl border-r-4 border-b-4" />

                      {/* Processing state indicator */}
                      {isProcessing && (
                        <div className="bg-brand-950/60 absolute inset-0 flex items-center justify-center rounded-3xl backdrop-blur-xs">
                          <RefreshCw className="text-brand-400 size-8 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Banner if camera fails */}
                {cameraError && (
                  <div className="bg-surface-950/90 absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <XCircle className="size-12 text-rose-500" />
                    <p className="text-surface-200 max-w-sm text-sm">{cameraError}</p>
                    <Button variant="secondary" size="sm" onClick={() => setActiveTab("search")}>
                      Switch to Manual Search
                    </Button>
                  </div>
                )}
              </div>

              {/* Scanner Status Bar */}
              <div className="border-surface-800 bg-surface-900/90 flex items-center justify-between border-t px-6 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-2.5 rounded-full ${cameraActive ? "animate-pulse bg-emerald-400" : "bg-surface-600"}`}
                  />
                  <span className="text-surface-300 text-xs">
                    {cameraActive ? "Aim camera at attendee's QR Pass" : "Camera idle"}
                  </span>
                </div>
                <span className="text-surface-500 font-mono text-xs">Auto-Detect 60FPS</span>
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="border-surface-800 bg-surface-900/60 space-y-6 rounded-3xl border p-6">
              <div className="space-y-2">
                <label className="text-surface-400 text-xs font-semibold tracking-wider uppercase">
                  Search Attendee Directory
                </label>
                <div className="relative">
                  <Search className="text-surface-400 absolute top-3.5 left-3.5 size-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type Name, Email, Phone, or KX-XXXX-XXXX..."
                    className="border-surface-700 bg-surface-950 text-surface-100 placeholder:text-surface-500 focus:border-brand-500 focus:ring-brand-500 w-full rounded-xl border py-3 pr-4 pl-10 text-sm transition outline-none focus:ring-1"
                    autoFocus
                  />
                  {isSearching && (
                    <RefreshCw className="text-brand-400 absolute top-3.5 right-3.5 size-4 animate-spin" />
                  )}
                </div>
              </div>

              {/* Search results list */}
              <div className="space-y-3">
                {searchResults.length === 0 && searchQuery.trim() && !isSearching && (
                  <div className="text-surface-500 border-surface-800 rounded-2xl border border-dashed p-8 text-center text-sm">
                    No registrations found matching &quot;{searchQuery}&quot;.
                  </div>
                )}

                {searchResults.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="border-surface-800 bg-surface-950/70 hover:border-surface-700 flex flex-col justify-between gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-surface-100 text-sm font-bold">{attendee.name}</span>
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {attendee.registrationCode}
                        </Badge>
                        <Badge variant="surface" className="text-[11px]">
                          {attendee.ticketTier}
                        </Badge>
                      </div>
                      <div className="text-surface-400 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" /> {attendee.email}
                        </span>
                        {attendee.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="size-3" /> {attendee.phone}
                          </span>
                        )}
                        {attendee.college && (
                          <span className="inline-flex items-center gap-1">
                            <Building className="size-3" /> {attendee.college}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {attendee.isCheckedIn ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="size-3.5" /> Checked In
                        </div>
                      ) : attendee.status !== "CONFIRMED" ? (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                          {attendee.status}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleCheckin(attendee.registrationCode, "MANUAL")}
                          disabled={isProcessing}
                          className="w-full sm:w-auto"
                        >
                          <UserCheck className="mr-1 size-3.5" /> Check In
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick manual entry bar if camera cannot read */}
          {activeTab === "camera" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("passCode") as HTMLInputElement;
                if (input && input.value.trim()) {
                  handleCheckin(input.value.trim(), "MANUAL");
                  input.value = "";
                }
              }}
              className="flex gap-2"
            >
              <input
                name="passCode"
                type="text"
                placeholder="Or paste/type code manually (e.g. KX-PX01-0001)..."
                className="border-surface-800 bg-surface-900/80 text-surface-200 placeholder:text-surface-500 focus:border-brand-500 flex-1 rounded-xl border px-4 py-2.5 text-xs outline-none"
              />
              <Button type="submit" variant="secondary" size="sm" disabled={isProcessing}>
                Verify
              </Button>
            </form>
          )}
        </div>

        {/* Right Column: Scan Result Card & Recent Activity Feed */}
        <div className="space-y-6 lg:col-span-5">
          {/* Result Card Modal / Banner */}
          {lastResult && (
            <div
              className={`rounded-3xl border p-6 shadow-2xl transition-all ${
                lastResult.success
                  ? "via-surface-900 to-surface-950 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40"
                  : lastResult.alreadyCheckedIn
                    ? "via-surface-900 to-surface-950 border-amber-500/40 bg-gradient-to-br from-amber-950/40"
                    : "via-surface-900 to-surface-950 border-rose-500/40 bg-gradient-to-br from-rose-950/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-2xl ${
                      lastResult.success
                        ? "bg-emerald-500/20 text-emerald-400"
                        : lastResult.alreadyCheckedIn
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {lastResult.success ? (
                      <CheckCircle2 className="size-6" />
                    ) : lastResult.alreadyCheckedIn ? (
                      <AlertTriangle className="size-6" />
                    ) : (
                      <XCircle className="size-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-surface-100 text-base font-bold">
                      {lastResult.success
                        ? "Access Approved"
                        : lastResult.alreadyCheckedIn
                          ? "Already Checked In!"
                          : "Entry Declined"}
                    </h3>
                    <p className="text-surface-400 text-xs">
                      {lastResult.message || lastResult.error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLastResult(null)}
                  className="text-surface-500 hover:text-surface-300 text-xs"
                >
                  ✕
                </button>
              </div>

              {lastResult.attendee && (
                <div className="border-surface-800 mt-5 space-y-3 border-t pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-surface-50 text-lg font-bold">
                      {lastResult.attendee.name}
                    </span>
                    <Badge variant="brand" className="font-mono text-xs">
                      {lastResult.attendee.registrationCode}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-950/60 border-surface-800 rounded-xl border p-2.5">
                      <span className="text-surface-500 block text-[10px] uppercase">Tier</span>
                      <span className="text-brand-300 font-semibold">
                        {lastResult.attendee.ticketTier}
                      </span>
                    </div>
                    <div className="bg-surface-950/60 border-surface-800 rounded-xl border p-2.5">
                      <span className="text-surface-500 block text-[10px] uppercase">Event</span>
                      <span className="text-surface-200 block truncate font-semibold">
                        {lastResult.attendee.eventTitle}
                      </span>
                    </div>
                  </div>

                  {lastResult.attendee.college && (
                    <p className="text-surface-300 flex items-center gap-1.5 text-xs">
                      <Building className="text-surface-400 size-3" />
                      {lastResult.attendee.college}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recent Check-ins Feed */}
          <div className="border-surface-800 bg-surface-900/60 space-y-4 rounded-3xl border p-6">
            <div className="border-surface-800 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-brand-400 size-4" />
                <h3 className="text-surface-100 text-sm font-bold">Live Activity Feed</h3>
              </div>
              <Badge variant="outline" className="text-xs">
                {recentList.length} scans
              </Badge>
            </div>

            <div className="max-h-[380px] space-y-3 overflow-y-auto pr-1">
              {recentList.length === 0 ? (
                <p className="text-surface-500 py-8 text-center text-xs">
                  No check-ins recorded yet. Start scanning badges.
                </p>
              ) : (
                recentList.map((c) => (
                  <div
                    key={c.id}
                    className="bg-surface-950/60 border-surface-800/80 flex items-center justify-between rounded-xl border p-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-surface-200 font-semibold">{c.attendeeName}</span>
                        <Badge variant="surface" className="px-1.5 py-0 text-[10px]">
                          {c.ticketTier}
                        </Badge>
                      </div>
                      <p className="text-surface-500 font-mono text-[11px]">{c.registrationCode}</p>
                    </div>

                    <div className="text-surface-400 text-right text-[11px]">
                      <span>
                        {new Date(c.checkedInAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-surface-500 block text-[10px] uppercase">
                        {c.method}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
