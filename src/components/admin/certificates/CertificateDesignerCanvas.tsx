"use client";

// src/components/admin/certificates/CertificateDesignerCanvas.tsx
// Interactive visual certificate template designer with drag-and-drop coordinate mapping
// for Recipient Name, Event Title, Issue Date, Credential ID, and Verification QR code.

import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  Move,
  Type,
  Calendar,
  QrCode,
  Hash,
  RotateCcw,
  Sparkles,
  Sliders,
} from "lucide-react";
import type { CertificateTemplateConfig, CertificateFieldConfig } from "@/server/certificates/pdf";
import { cn } from "@/lib/utils";

interface Props {
  sampleRecipientName?: string;
  sampleEventTitle?: string;
  sampleDate?: string;
  initialTemplateUrl?: string | null;
  initialFields?: CertificateTemplateConfig["fields"];
  onChange: (data: {
    templateUrl: string | null;
    fields: NonNullable<CertificateTemplateConfig["fields"]>;
  }) => void;
}

type ActiveFieldKey = "recipientName" | "eventTitle" | "issueDate" | "uniqueId" | "qrCode";

export function CertificateDesignerCanvas({
  sampleRecipientName = "Aarav Sharma",
  sampleEventTitle = "NirmanX 2026 · Flagship Hackathon",
  sampleDate = "October 4, 2026",
  initialTemplateUrl = null,
  initialFields,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<ActiveFieldKey>("recipientName");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(initialTemplateUrl);
  const [draggingKey, setDraggingKey] = useState<ActiveFieldKey | null>(null);

  const [fields, setFields] = useState<NonNullable<CertificateTemplateConfig["fields"]>>({
    recipientName: {
      x: 50,
      y: 36,
      fontSize: 32,
      color: "#ffffff",
      align: "center",
      ...initialFields?.recipientName,
    },
    eventTitle: {
      x: 50,
      y: 54,
      fontSize: 20,
      color: "#38bdf8",
      align: "center",
      ...initialFields?.eventTitle,
    },
    issueDate: {
      x: 50,
      y: 65,
      fontSize: 11,
      color: "#94a3b8",
      align: "center",
      ...initialFields?.issueDate,
    },
    qrCode: {
      x: 50,
      y: 77,
      size: 68,
      align: "center",
      ...initialFields?.qrCode,
    },
    uniqueId: {
      x: 50,
      y: 92,
      fontSize: 10,
      color: "#94a3b8",
      align: "center",
      ...initialFields?.uniqueId,
    },
  });

  const updateField = useCallback(
    (key: ActiveFieldKey, updates: Partial<CertificateFieldConfig>) => {
      setFields((prev) => {
        const next = {
          ...prev,
          [key]: { ...prev[key], ...updates } as CertificateFieldConfig,
        };
        onChange({ templateUrl: backgroundUrl, fields: next });
        return next;
      });
    },
    [backgroundUrl, onChange]
  );

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent, key: ActiveFieldKey) => {
    e.stopPropagation();
    setActiveKey(key);
    setDraggingKey(key);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingKey || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = ((e.clientY - rect.top) / rect.height) * 100;

      // Bound between 5% and 95%
      const boundedX = Math.round(Math.max(5, Math.min(95, rawX)) * 10) / 10;
      const boundedY = Math.round(Math.max(5, Math.min(95, rawY)) * 10) / 10;

      updateField(draggingKey, { x: boundedX, y: boundedY });
    },
    [draggingKey, updateField]
  );

  const handleMouseUp = () => {
    setDraggingKey(null);
  };

  // Upload custom design image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a PNG or JPG certificate template image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBackgroundUrl(dataUrl);
      onChange({ templateUrl: dataUrl, fields });
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    setBackgroundUrl(null);
    const defaults: NonNullable<CertificateTemplateConfig["fields"]> = {
      recipientName: { x: 50, y: 36, fontSize: 32, color: "#ffffff", align: "center" },
      eventTitle: { x: 50, y: 54, fontSize: 20, color: "#38bdf8", align: "center" },
      issueDate: { x: 50, y: 65, fontSize: 11, color: "#94a3b8", align: "center" },
      qrCode: { x: 50, y: 77, size: 68, align: "center" },
      uniqueId: { x: 50, y: 92, fontSize: 10, color: "#94a3b8", align: "center" },
    };
    setFields(defaults);
    onChange({ templateUrl: null, fields: defaults });
  };

  const activeField: CertificateFieldConfig = fields[activeKey] || { x: 50, y: 50 };

  return (
    <div className="space-y-6">
      {/* Top action toolbar */}
      <div className="bg-surface-900/60 border-surface-800 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="cert-design-upload"
            className="bg-brand-500 hover:bg-brand-600 flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Custom Design (PNG/JPG)</span>
            <input
              id="cert-design-upload"
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {backgroundUrl && (
            <button
              type="button"
              onClick={() => {
                setBackgroundUrl(null);
                onChange({ templateUrl: null, fields });
              }}
              className="text-surface-400 bg-surface-800 border-surface-700 rounded-xl border px-3 py-2 text-xs font-medium hover:text-white"
            >
              Clear Custom Artwork
            </button>
          )}

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-surface-400 bg-surface-800 hover:bg-surface-700 border-surface-700 flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Coordinates</span>
          </button>
        </div>

        <div className="text-surface-400 flex items-center gap-2 text-xs">
          <span className="bg-surface-800/80 border-surface-700/60 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium">
            <Move className="text-brand-400 h-3.5 w-3.5" />
            Click &amp; drag elements on canvas to position
          </span>
        </div>
      </div>

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Certificate Canvas (842:595 standard landscape ratio) */}
        <div className="flex flex-col items-center lg:col-span-8">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="border-surface-700 bg-surface-950 relative aspect-[842/595] w-full overflow-hidden rounded-2xl border-2 shadow-2xl select-none"
            style={{
              backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* If no custom image background, render default elegant vector template preview */}
            {!backgroundUrl && (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
                {/* Border frames */}
                <div className="border-brand-500/40 pointer-events-none absolute inset-4 rounded-xl border" />
                <div className="pointer-events-none absolute inset-6 rounded-lg border border-amber-500/30" />

                {/* Header text */}
                <div className="pt-2 text-center">
                  <div className="text-brand-400 text-[10px] font-bold tracking-widest uppercase">
                    KailshiansX · Developer Platform &amp; Builder Ecosystem
                  </div>
                  <div className="mt-1 font-serif text-xl font-black tracking-wide text-white sm:text-2xl">
                    CERTIFICATE OF EXCELLENCE
                  </div>
                  <div className="text-surface-400 mt-1 text-[11px] font-medium tracking-wider uppercase">
                    This is proudly presented to
                  </div>
                </div>

                {/* Middle subtitle */}
                <div className="text-surface-400 px-12 text-center text-xs">
                  for distinguished participation and verified engineering excellence in
                </div>

                {/* Signatures */}
                <div className="text-surface-400 flex items-end justify-between px-6 pb-2 text-[11px]">
                  <div className="border-surface-700 w-36 border-t pt-1 text-left">
                    <div className="text-xs font-bold text-white">Aarav Gorewal</div>
                    <div className="text-[9px]">Founder, KailshiansX</div>
                  </div>
                  <div className="border-surface-700 w-36 border-t pt-1 text-right">
                    <div className="text-xs font-bold text-white">KWS Engineering</div>
                    <div className="text-[9px]">Verified Issuing Chapter</div>
                  </div>
                </div>
              </div>
            )}

            {/* Draggable 1: Recipient Name */}
            {fields.recipientName && (
              <div
                onMouseDown={(e) => handleMouseDown(e, "recipientName")}
                className={cn(
                  "absolute cursor-move rounded-lg border px-2 py-0.5 transition-shadow",
                  activeKey === "recipientName"
                    ? "border-brand-400 bg-brand-500/10 ring-brand-500/40 shadow-lg ring-2"
                    : "hover:border-surface-500/50 hover:bg-surface-800/30 border-transparent"
                )}
                style={{
                  left: `${fields.recipientName.x}%`,
                  top: `${fields.recipientName.y}%`,
                  transform:
                    fields.recipientName.align === "center"
                      ? "translate(-50%, -50%)"
                      : fields.recipientName.align === "right"
                        ? "translate(-100%, -50%)"
                        : "translate(0, -50%)",
                  color: fields.recipientName.color || "#ffffff",
                  fontSize: `clamp(14px, ${(fields.recipientName.fontSize || 32) * 0.45}px, 32px)`,
                  fontWeight: 800,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <span>{sampleRecipientName}</span>
              </div>
            )}

            {/* Draggable 2: Event Title */}
            {fields.eventTitle && (
              <div
                onMouseDown={(e) => handleMouseDown(e, "eventTitle")}
                className={cn(
                  "absolute cursor-move rounded-lg border px-2 py-0.5 transition-shadow",
                  activeKey === "eventTitle"
                    ? "border-brand-400 bg-brand-500/10 ring-brand-500/40 shadow-lg ring-2"
                    : "hover:border-surface-500/50 hover:bg-surface-800/30 border-transparent"
                )}
                style={{
                  left: `${fields.eventTitle.x}%`,
                  top: `${fields.eventTitle.y}%`,
                  transform:
                    fields.eventTitle.align === "center"
                      ? "translate(-50%, -50%)"
                      : fields.eventTitle.align === "right"
                        ? "translate(-100%, -50%)"
                        : "translate(0, -50%)",
                  color: fields.eventTitle.color || "#38bdf8",
                  fontSize: `clamp(11px, ${(fields.eventTitle.fontSize || 20) * 0.55}px, 20px)`,
                  fontWeight: 700,
                }}
              >
                <span>{sampleEventTitle}</span>
              </div>
            )}

            {/* Draggable 3: Issue Date */}
            {fields.issueDate && (
              <div
                onMouseDown={(e) => handleMouseDown(e, "issueDate")}
                className={cn(
                  "absolute cursor-move rounded-lg border px-2 py-0.5 transition-shadow",
                  activeKey === "issueDate"
                    ? "border-brand-400 bg-brand-500/10 ring-brand-500/40 shadow-lg ring-2"
                    : "hover:border-surface-500/50 hover:bg-surface-800/30 border-transparent"
                )}
                style={{
                  left: `${fields.issueDate.x}%`,
                  top: `${fields.issueDate.y}%`,
                  transform:
                    fields.issueDate.align === "center"
                      ? "translate(-50%, -50%)"
                      : fields.issueDate.align === "right"
                        ? "translate(-100%, -50%)"
                        : "translate(0, -50%)",
                  color: fields.issueDate.color || "#94a3b8",
                  fontSize: `clamp(9px, ${(fields.issueDate.fontSize || 11) * 0.8}px, 12px)`,
                  fontWeight: 500,
                }}
              >
                <span>Issued on {sampleDate}</span>
              </div>
            )}

            {/* Draggable 4: QR Code Box */}
            {fields.qrCode && (
              <div
                onMouseDown={(e) => handleMouseDown(e, "qrCode")}
                className={cn(
                  "absolute flex cursor-move items-center justify-center rounded-xl border bg-white p-1 shadow-md transition-shadow",
                  activeKey === "qrCode"
                    ? "border-brand-400 ring-brand-500/40 shadow-xl ring-2"
                    : "border-surface-300"
                )}
                style={{
                  left: `${fields.qrCode.x}%`,
                  top: `${fields.qrCode.y}%`,
                  width: `${fields.qrCode.size || 68}px`,
                  height: `${fields.qrCode.size || 68}px`,
                  transform:
                    fields.qrCode.align === "center"
                      ? "translate(-50%, -50%)"
                      : fields.qrCode.align === "right"
                        ? "translate(-100%, -50%)"
                        : "translate(0, -50%)",
                }}
              >
                <QrCode className="h-full w-full text-slate-900" />
              </div>
            )}

            {/* Draggable 5: Credential ID */}
            {fields.uniqueId && (
              <div
                onMouseDown={(e) => handleMouseDown(e, "uniqueId")}
                className={cn(
                  "absolute cursor-move rounded-lg border px-2 py-0.5 font-mono transition-shadow",
                  activeKey === "uniqueId"
                    ? "border-brand-400 bg-brand-500/10 ring-brand-500/40 shadow-lg ring-2"
                    : "hover:border-surface-500/50 hover:bg-surface-800/30 border-transparent"
                )}
                style={{
                  left: `${fields.uniqueId.x}%`,
                  top: `${fields.uniqueId.y}%`,
                  transform:
                    fields.uniqueId.align === "center"
                      ? "translate(-50%, -50%)"
                      : fields.uniqueId.align === "right"
                        ? "translate(-100%, -50%)"
                        : "translate(0, -50%)",
                  color: fields.uniqueId.color || "#94a3b8",
                  fontSize: `clamp(8px, ${(fields.uniqueId.fontSize || 10) * 0.9}px, 11px)`,
                  fontWeight: 600,
                }}
              >
                <span>CREDENTIAL ID: KX-CERT-DEMO-2026</span>
              </div>
            )}
          </div>

          <p className="text-surface-500 mt-3 text-center text-xs">
            Standard ISO 216 A4 Landscape proportions (842 × 595 pt). Exact pixel-perfect mapping in
            final PDF.
          </p>
        </div>

        {/* Properties & Fine-Tuning Sidebar */}
        <div className="bg-surface-900/80 border-surface-800 space-y-5 rounded-2xl border p-5 backdrop-blur-xl lg:col-span-4">
          <div className="border-surface-800 flex items-center justify-between border-b pb-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-white">
              <Sliders className="text-brand-400 h-4 w-4" />
              <span>Element Properties</span>
            </h4>
            <span className="text-brand-400 bg-brand-500/10 border-brand-500/20 rounded-md border px-2 py-0.5 font-mono text-[11px]">
              {activeKey}
            </span>
          </div>

          {/* Element Selection Pills */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "recipientName" as const, label: "Recipient Name", icon: Type },
              { key: "eventTitle" as const, label: "Event Title", icon: Sparkles },
              { key: "issueDate" as const, label: "Issue Date", icon: Calendar },
              { key: "qrCode" as const, label: "QR Code Box", icon: QrCode },
              { key: "uniqueId" as const, label: "Credential ID", icon: Hash },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveKey(item.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl p-2.5 text-left text-xs font-semibold transition-all",
                    isActive
                      ? "bg-brand-500 shadow-brand-500/20 text-white shadow-md"
                      : "bg-surface-800/80 text-surface-300 hover:bg-surface-700/80 hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Coordinate Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span className="text-surface-400">Horizontal Position (X%)</span>
                <span className="text-brand-400 font-mono">{activeField.x ?? 50}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="0.5"
                value={activeField.x ?? 50}
                onChange={(e) => updateField(activeKey, { x: parseFloat(e.target.value) })}
                className="accent-brand-500 w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span className="text-surface-400">Vertical Position (Y%)</span>
                <span className="text-brand-400 font-mono">{activeField.y ?? 50}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                step="0.5"
                value={activeField.y ?? 50}
                onChange={(e) => updateField(activeKey, { y: parseFloat(e.target.value) })}
                className="accent-brand-500 w-full cursor-pointer"
              />
            </div>

            {/* Font size or QR Size */}
            {activeKey === "qrCode" ? (
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-surface-400">QR Code Size</span>
                  <span className="text-brand-400 font-mono">{activeField.size ?? 68}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="2"
                  value={activeField.size ?? 68}
                  onChange={(e) => updateField(activeKey, { size: parseInt(e.target.value) })}
                  className="accent-brand-500 w-full cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-surface-400">Font Size</span>
                  <span className="text-brand-400 font-mono">{activeField.fontSize ?? 16}pt</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="48"
                  step="1"
                  value={activeField.fontSize ?? 16}
                  onChange={(e) => updateField(activeKey, { fontSize: parseInt(e.target.value) })}
                  className="accent-brand-500 w-full cursor-pointer"
                />
              </div>
            )}

            {/* Color picker for text elements */}
            {activeKey !== "qrCode" && (
              <div>
                <span className="text-surface-400 mb-2 block text-xs font-semibold">
                  Text Color
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeField.color || "#ffffff"}
                    onChange={(e) => updateField(activeKey, { color: e.target.value })}
                    className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent"
                  />
                  <div className="flex gap-1.5">
                    {["#ffffff", "#38bdf8", "#f59e0b", "#a855f7", "#10b981", "#cbd5e1"].map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateField(activeKey, { color })}
                          className="border-surface-700 h-6 w-6 rounded-md border shadow-sm"
                          style={{ backgroundColor: color }}
                          aria-label={`Color ${color}`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alignment */}
            <div>
              <span className="text-surface-400 mb-2 block text-xs font-semibold">Alignment</span>
              <div className="grid grid-cols-3 gap-2">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateField(activeKey, { align })}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                      (activeField.align || "center") === align
                        ? "bg-surface-700 border-surface-600 border text-white"
                        : "bg-surface-800/60 text-surface-400 hover:text-surface-200"
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
