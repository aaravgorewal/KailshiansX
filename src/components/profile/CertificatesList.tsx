"use client";

// src/components/profile/CertificatesList.tsx
// Displays verifiable certificates earned by the member.

import React from "react";
import Link from "next/link";
import { Award, CheckCircle2, Download, Calendar } from "lucide-react";
import type { MemberCertificate } from "@/server/users/profile";

interface Props {
  certificates: MemberCertificate[];
}

export function CertificatesList({ certificates }: Props) {
  if (certificates.length === 0) {
    return (
      <div className="border-surface-800 bg-surface-950/40 rounded-2xl border border-dashed py-16 text-center">
        <Award className="text-surface-600 mx-auto mb-3 h-12 w-12" />
        <h4 className="mb-1 text-lg font-bold text-white">No Certificates Earned Yet</h4>
        <p className="text-surface-400 mx-auto mb-5 max-w-md text-sm">
          Participate in KailshiansX workshops, tech talks, or hackathons to earn verifiable digital
          credentials.
        </p>
        <Link
          href="/workshops"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors"
        >
          Browse Workshops
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {certificates.map((cert) => (
        <div
          key={cert.id}
          className="group border-surface-800 bg-surface-900/70 hover:bg-surface-900 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40"
        >
          {/* Subtle gold ambient glow */}
          <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl" />

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                {cert.template.templateType || "Verified Credential"}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cryptographically Signed
              </span>
            </div>

            <h3 className="mb-1 line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-amber-300">
              {cert.event.title}
            </h3>

            <p className="text-surface-300 mb-3 text-xs font-medium">
              Awarded to <span className="font-semibold text-white">{cert.participantName}</span>
            </p>

            <div className="bg-surface-950/70 border-surface-800/80 mb-4 space-y-1.5 rounded-xl border p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-surface-400">Credential ID:</span>
                <span className="font-mono font-bold text-amber-400">{cert.uniqueId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-400">Issue Date:</span>
                <span className="text-surface-200">
                  {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="border-surface-800/70 flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-surface-400 flex items-center gap-1 text-[11px]">
              <Calendar className="h-3 w-3" />
              Permanent Record
            </span>

            {cert.certificateUrl ? (
              <a
                href={cert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-500"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </a>
            ) : (
              <span className="text-surface-400 text-xs font-medium">
                Digital Verification Active
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
