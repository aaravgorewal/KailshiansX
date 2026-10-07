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
      <div className="border-border bg-background rounded-2xl border border-dashed py-16 text-center">
        <Award className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
        <h4 className="text-foreground mb-1 text-lg font-bold">No Certificates Earned Yet</h4>
        <p className="text-muted-foreground mx-auto mb-5 max-w-md text-sm">
          Participate in KailshiansX workshops, tech talks, or hackathons to earn verifiable digital
          credentials.
        </p>
        <Link
          href="/workshops"
          className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-colors"
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
          className="group border-border bg-card hover:bg-card hover:border-border relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300"
        >
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="border-border bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase">
                {cert.template.templateType || "Verified Credential"}
              </span>

              <span className="border-success/20 bg-success/10 text-success inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cryptographically Signed
              </span>
            </div>

            <h3 className="text-foreground group-hover:text-primary mb-1 line-clamp-1 text-base font-bold transition-colors">
              {cert.event.title}
            </h3>

            <p className="text-muted-foreground mb-3 text-xs font-medium">
              Awarded to{" "}
              <span className="text-foreground font-semibold">{cert.participantName}</span>
            </p>

            <div className="bg-background border-border mb-4 space-y-1.5 rounded-xl border p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credential ID:</span>
                <span className="text-primary font-mono font-bold">{cert.uniqueId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Issue Date:</span>
                <span className="text-foreground">
                  {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Permanent Record
            </span>

            {cert.certificateUrl ? (
              <a
                href={cert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </a>
            ) : (
              <span className="text-muted-foreground text-xs font-medium">
                Digital Verification Active
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
