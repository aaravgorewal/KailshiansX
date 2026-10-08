"use client";

// src/components/certificates/PublicVerifyClient.tsx
// Interactive Public Certificate Verification Client.
// Supports search by Certificate ID, Email, or Registration Code;
// displays cryptographic verification shield, live preview card, and PDF download.

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Download,
  Share2,
  Check,
  ExternalLink,
  Award,
  QrCode,
  ArrowRight,
  Zap,
} from "lucide-react";

export interface VerifiedCertificateData {
  id: string;
  uniqueId: string;
  participantName: string;
  participantEmail: string;
  issuedAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    type: string;
    startDate: string;
    city: string | null;
    venue: string | null;
  };
  registrationCode: string | null;
  template: {
    id: string;
    name: string;
    templateUrl: string | null;
    fields: Record<string, unknown>;
  };
  user: {
    id: string;
    username: string | null;
    image: string | null;
  } | null;
  verified: boolean;
  verificationUrl: string;
}

interface Props {
  initialQuery?: string;
  initialCertificate?: VerifiedCertificateData | null;
}

export function PublicVerifyClient({ initialQuery = "", initialCertificate = null }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<VerifiedCertificateData | null>(
    initialCertificate
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialQuery && !initialCertificate
      ? "No verified certificate found matching this identifier. Please verify your ID."
      : null
  );
  const [copied, setCopied] = useState(false);

  const handleVerify = async (searchTarget?: string) => {
    const q = (searchTarget ?? query).trim();
    if (!q) {
      setErrorMessage("Please enter a Certificate ID, email address, or registration code.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/certificates/verify?q=${encodeURIComponent(q)}`);
      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setCertificate(json.data);
        // Update URL query string without reloading
        const url = new URL(window.location.href);
        url.searchParams.set("id", json.data.uniqueId);
        window.history.replaceState({}, "", url.toString());
      } else {
        setCertificate(null);
        setErrorMessage(
          json.error ||
            "No verified certificate found matching this identifier. Please verify your ID."
        );
      }
    } catch (err: unknown) {
      console.error("Verification error:", err);
      setErrorMessage("A network error occurred while verifying the credential. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!certificate) return;
    const shareUrl = `${window.location.origin}/verify?id=${encodeURIComponent(certificate.uniqueId)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // Generate LinkedIn Add-to-Profile URL
  const getLinkedInCertUrl = (cert: VerifiedCertificateData) => {
    const d = new Date(cert.issuedAt);
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: `Certificate of Excellence: ${cert.event.title}`,
      organizationName: "KailshiansX",
      issueYear: String(d.getFullYear()),
      issueMonth: String(d.getMonth() + 1),
      certUrl: `${typeof window !== "undefined" ? window.location.origin : "https://kailshiansx.com"}/verify?id=${cert.uniqueId}`,
      certId: cert.uniqueId,
    });
    return `https://www.linkedin.com/profile/add?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Search Header Form */}
      <div className="bg-card border-border space-y-5 rounded-3xl border p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="bg-primary/10 border-primary/20 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border shadow-inner">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <div>
          <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Verify KailshiansX Credential
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-xs leading-relaxed sm:text-sm">
            Enter an official Certificate ID (
            <span className="text-foreground font-mono">KX-CERT-...</span>), attendee email address,
            or event registration code to verify authenticity.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="mx-auto flex max-w-2xl flex-col items-center gap-3 sm:flex-row"
        >
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
            <input
              type="text"
              id="input-verify-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. KX-CERT-9A8B7C6D, aarav@example.com, or KX-PA01-0001"
              className="bg-background border-border placeholder:text-muted-foreground focus:ring-ring text-foreground w-full rounded-2xl border py-3.5 pr-4 pl-11 text-sm font-medium focus:ring-2 focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            id="btn-verify-submit"
            disabled={loading}
            className="bg-primary hover:bg-primary-hover text-primary-foreground flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold shadow-lg transition-all disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Credential</span>
              </>
            )}
          </button>
        </form>

        {errorMessage && (
          <div className="animate-in fade-in border-destructive/30 bg-destructive/10 text-destructive mx-auto flex max-w-xl items-center justify-center gap-2.5 rounded-2xl border p-4 text-xs font-semibold">
            <ShieldAlert className="text-destructive h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* VERIFICATION RESULT */}
      {certificate && (
        <div className="animate-in fade-in space-y-8 duration-300">
          {/* Verified Official Ribbon */}
          <div className="border-success/30 bg-success/10 flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-xl sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-center gap-3.5">
              <div className="border-success/40 bg-success/20 text-success flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <div className="text-foreground flex items-center gap-2 text-sm font-extrabold">
                  <span>Cryptographically Verified Certificate</span>
                  <span className="border-success/30 bg-success/20 text-success rounded-full border px-2 py-0.5 text-xs font-bold">
                    Official
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Issued by <strong className="text-foreground">Kailshians Web Services</strong> on{" "}
                  {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                id="btn-copy-verify-link"
                onClick={handleCopyLink}
                className="bg-muted hover:bg-muted text-foreground border-border hover:text-foreground flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors"
              >
                {copied ? (
                  <Check className="text-success h-3.5 w-3.5" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Link Copied!" : "Share Link"}</span>
              </button>

              <a
                href={`/api/certificates/${certificate.uniqueId}/download`}
                download
                id="btn-download-verified-pdf"
                className="bg-primary hover:bg-primary-hover text-primary-foreground flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Signed PDF</span>
              </a>
            </div>
          </div>

          {/* High-Resolution Certificate Visual Card */}
          <div className="border-border bg-card relative overflow-hidden rounded-3xl border-2 p-8 text-center shadow-2xl sm:p-12">
            {/* Inner Border */}
            <div className="border-primary/20 pointer-events-none absolute inset-4 rounded-2xl border sm:inset-6" />
            <div className="border-border pointer-events-none absolute inset-6 rounded-xl border sm:inset-8" />

            <div className="relative z-10 mx-auto max-w-2xl space-y-6">
              {/* Top Insignia */}
              <div className="bg-primary/10 border-primary/30 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-widest uppercase">
                <Zap className="h-3.5 w-3.5" />
                <span>KailshiansX · Certificate of Achievement</span>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase">
                  This is proudly presented to
                </p>
                <h2 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-4xl">
                  {certificate.participantName}
                </h2>
              </div>

              <p className="text-muted-foreground mx-auto max-w-lg text-xs leading-relaxed sm:text-sm">
                for distinguished participation and verified engineering excellence during
              </p>

              <div>
                <h3 className="text-primary text-lg font-black sm:text-2xl">
                  {certificate.event.title}
                </h3>
                <span className="text-muted-foreground bg-muted border-border mt-2 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase">
                  {certificate.event.type}
                </span>
              </div>

              {/* Signatures & Verification Row */}
              <div className="border-border grid grid-cols-1 items-center gap-6 border-t pt-8 sm:grid-cols-3">
                <div className="text-left">
                  <div className="text-foreground text-xs font-bold">Aarav Gorewal</div>
                  <div className="text-muted-foreground text-xs">Founder, KailshiansX</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-foreground inline-block rounded-xl p-2 shadow-md">
                    <QrCode className="text-background h-12 w-12" />
                  </div>
                  <span className="text-primary mt-1 font-mono text-xs font-bold">
                    {certificate.uniqueId}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-foreground text-xs font-bold">
                    {certificate.event.city || "National"} Chapter
                  </div>
                  <div className="text-muted-foreground text-xs">Authorized Issuing Authority</div>
                </div>
              </div>
            </div>
          </div>

          {/* Credential Metadata Details Table */}
          <div className="bg-card border-border space-y-4 rounded-2xl border p-6">
            <h4 className="text-foreground flex items-center gap-2 text-sm font-bold">
              <Award className="text-primary h-4 w-4" />
              <span>Verifiable Credential Metadata</span>
            </h4>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-background border-border rounded-xl border p-3.5">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  Credential ID
                </div>
                <div className="text-primary mt-0.5 font-mono text-sm font-bold select-all">
                  {certificate.uniqueId}
                </div>
              </div>

              <div className="bg-background border-border rounded-xl border p-3.5">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  Date of Issuance
                </div>
                <div className="text-foreground mt-0.5 text-sm font-semibold">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="bg-background border-border rounded-xl border p-3.5">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  Registration Code
                </div>
                <div className="text-foreground mt-0.5 font-mono text-sm font-semibold">
                  {certificate.registrationCode || "Direct Issue"}
                </div>
              </div>

              <div className="bg-background border-border rounded-xl border p-3.5">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  Associated Account
                </div>
                <div className="text-foreground mt-0.5 text-sm font-semibold">
                  {certificate.user?.username ? (
                    <Link
                      href={`/passport/${certificate.user.username}`}
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      <span>@{certificate.user.username}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    "Community Member"
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={getLinkedInCertUrl(certificate)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-hover text-primary-foreground inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-colors"
              >
                <span>Add to LinkedIn Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <Link
                href={`/events/${certificate.event.slug}`}
                className="bg-muted hover:bg-muted text-foreground border-border inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors"
              >
                <span>Inspect Event Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
