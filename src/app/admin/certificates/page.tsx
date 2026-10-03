// src/app/admin/certificates/page.tsx
// Phase 2 stub for Automated Certificate Generation & Verification Engine (PRD §22 & §24)

import type { Metadata } from "next";
import { Award, QrCode, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/server/auth/require-role";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Certificates Engine (Phase 2) | KailshiansX Admin",
};

export default async function AdminCertificatesStubPage() {
  await requireAdmin();

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="border-surface-800 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400">
              PRD §24 Roadmap
            </span>
            <Badge variant="outline" size="sm" className="text-[10px]">
              Phase 2 Specification
            </Badge>
          </div>
          <h1 className="text-surface-50 text-2xl font-bold">
            Certificate Generation & Verification Engine
          </h1>
          <p className="text-surface-400 mt-1 text-xs sm:text-sm">
            Cryptographically signed PDF certificates issued automatically upon verified gate
            attendance.
          </p>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-surface-900/60 border-surface-800 space-y-3 rounded-2xl border p-5">
          <div className="bg-brand-500/10 text-brand-400 flex h-9 w-9 items-center justify-center rounded-xl">
            <QrCode className="h-5 w-5" />
          </div>
          <h3 className="text-surface-100 text-sm font-bold">Tamper-Proof Verification</h3>
          <p className="text-surface-400 text-xs leading-relaxed">
            Each certificate generates a unique cryptographic ID (`KX-CERT-XXXX-XXXX`) linked to a
            public verification page accessible to employers.
          </p>
        </div>

        <div className="bg-surface-900/60 border-surface-800 space-y-3 rounded-2xl border p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="text-surface-100 text-sm font-bold">Dynamic Coordinate Mapping</h3>
          <p className="text-surface-400 text-xs leading-relaxed">
            Configurable S3 base templates with JSON field mapping: Participant Name, Event Title,
            Date, Issue ID, and QR code placement.
          </p>
        </div>

        <div className="bg-surface-900/60 border-surface-800 space-y-3 rounded-2xl border p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-surface-100 text-sm font-bold">Automated Dispatch</h3>
          <p className="text-surface-400 text-xs leading-relaxed">
            As soon as an attendee is scanned at the venue via Live QR Scanner, a background worker
            renders and dispatches the high-resolution PDF via Resend.
          </p>
        </div>
      </div>

      {/* Sample Certificate Mockup Preview */}
      <div className="bg-surface-900/40 border-surface-800 space-y-4 rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-surface-100 flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Interactive Certificate Template Preview</span>
          </h3>
          <span className="text-surface-500 font-mono text-[11px]">
            Canvas Engine: Node-Canvas / PDFKit
          </span>
        </div>

        <div className="from-surface-950 via-surface-900 to-surface-950 border-brand-500/30 relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-8 text-center shadow-2xl">
          {/* Subtle corner badge */}
          <div className="bg-surface-800 text-surface-300 border-surface-700 absolute top-4 right-4 flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px]">
            <ShieldCheck className="text-brand-400 h-3.5 w-3.5" />
            <span>ID: KX-CERT-DEMO-2025</span>
          </div>

          <div className="mx-auto max-w-md space-y-4">
            <p className="text-brand-400 font-mono text-xs font-bold tracking-widest uppercase">
              KailshiansX · Certificate of Achievement
            </p>
            <h2 className="text-surface-50 font-serif text-2xl font-black tracking-wide">
              Aryan Sharma
            </h2>
            <p className="text-surface-300 text-xs leading-relaxed">
              has successfully completed and demonstrated outstanding systems engineering rigor
              during the flagship 36-hour hackathon
            </p>
            <p className="text-surface-100 text-sm font-bold tracking-wider uppercase">
              NirmanX 2025 · National Builder Edition
            </p>

            <div className="text-surface-400 border-surface-800/80 flex items-center justify-center gap-8 border-t pt-4 text-[11px]">
              <div>
                <span className="text-surface-200 block font-bold">Aarav Gorewal</span>
                <span className="text-[10px]">Founder, KailshiansX</span>
              </div>
              <div className="bg-surface-950 border-surface-700 text-surface-500 flex h-12 w-12 items-center justify-center rounded-lg border font-mono text-[10px]">
                [QR]
              </div>
              <div>
                <span className="text-surface-200 block font-bold">MNIT Jaipur</span>
                <span className="text-[10px]">Host Chapter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
