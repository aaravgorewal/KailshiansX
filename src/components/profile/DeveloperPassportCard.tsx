"use client";

// src/components/profile/DeveloperPassportCard.tsx
// Interactive developer card featuring user identity, public/private toggle,
// share buttons, and social handles.

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  Share2,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Zap,
} from "lucide-react";
import type { DeveloperPassportData } from "@/server/users/passport";
import { cn } from "@/lib/utils";

interface Props {
  passport: DeveloperPassportData;
  isOwner?: boolean;
  onVisibilityChange?: (isPublic: boolean) => Promise<void>;
}

export function DeveloperPassportCard({ passport, isOwner = false, onVisibilityChange }: Props) {
  const { user, highestRank, stats } = passport;
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(user.isPassportPublic);
  const [toggling, setToggling] = useState(false);

  // Compute public share URL
  const passportPath = `/passport/${encodeURIComponent(user.username || user.id)}`;
  const fullShareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${passportPath}`
      : `https://kailshiansx.com${passportPath}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleToggleVisibility = async () => {
    if (!onVisibilityChange || toggling) return;
    const nextVal = !isPublic;
    setToggling(true);
    try {
      await onVisibilityChange(nextVal);
      setIsPublic(nextVal);
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="bg-card border-border relative overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-8">
      {/* Decorative neon gradient header accents */}

      <div className="border-border relative z-10 flex flex-col items-start justify-between gap-6 border-b pb-6 lg:flex-row lg:items-center">
        {/* User Identity Info */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="ring-border bg-muted relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-xl ring-4 sm:h-24 sm:w-24">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
              />
            ) : (
              <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center text-3xl font-extrabold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-foreground bg-background/80 absolute inset-x-0 bottom-0 py-0.5 text-center text-xs font-bold tracking-widest uppercase">
              Pass ID
            </div>
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
                {user.name}
              </h2>
              <span className="text-muted-foreground bg-muted border-border rounded-md border px-2 py-0.5 font-mono text-xs">
                @{user.username}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm",
                  highestRank.badgeColor
                )}
              >
                <Zap className="h-3 w-3" />
                {highestRank.label}
              </span>
            </div>

            <p className="text-muted-foreground mb-2 line-clamp-1 max-w-xl text-sm font-medium">
              {user.headline || "Passionate builder active in the KailshiansX community"}
            </p>

            {user.bio && (
              <p className="text-muted-foreground mb-3 line-clamp-2 max-w-2xl text-xs leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Social links */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member {stats.memberDays} days
              </span>

              {user.github && (
                <a
                  href={`https://github.com/${user.github.replace(/^https?:\/\/github.com\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  GitHub
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}

              {user.linkedin && (
                <a
                  href={
                    user.linkedin.startsWith("http") ? user.linkedin : `https://${user.linkedin}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  LinkedIn
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}

              {user.twitter && (
                <a
                  href={`https://x.com/${user.twitter.replace(/^@/, "").replace(/^https?:\/\/x.com\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  X
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}

              {user.website && (
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Public Toggle */}
        <div className="flex w-full shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto lg:flex-col lg:items-end">
          {/* Public / Private toggle (owner only) */}
          {isOwner && onVisibilityChange && (
            <div className="bg-muted border-border flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs sm:w-auto sm:justify-end">
              <span className="text-foreground flex items-center gap-1.5 font-medium">
                {isPublic ? (
                  <>
                    <ShieldCheck className="text-success h-4 w-4" />
                    Passport is Public
                  </>
                ) : (
                  <>
                    <ShieldAlert className="text-primary h-4 w-4" />
                    Passport is Private
                  </>
                )}
              </span>

              <button
                type="button"
                id="toggle-passport-visibility"
                onClick={handleToggleVisibility}
                disabled={toggling}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                  isPublic ? "bg-success" : "bg-muted",
                  toggling && "cursor-wait opacity-50"
                )}
                aria-label="Toggle passport visibility"
              >
                <span
                  className={cn(
                    "bg-card pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md ring-0 transition duration-200 ease-in-out",
                    isPublic ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          )}

          {/* Share & Copy Buttons */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              id="copy-passport-link"
              onClick={handleCopyLink}
              className="bg-muted hover:bg-muted text-foreground border-border hover:text-foreground flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors sm:flex-initial"
            >
              {copied ? (
                <>
                  <Check className="text-success h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <Link
              href={passportPath}
              target="_blank"
              id="view-public-passport"
              className="bg-primary hover:bg-primary-hover text-primary-foreground flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-md transition-colors sm:flex-initial"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Public View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Skills Pill Badges */}
      {user.skills && user.skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-4">
          <span className="text-muted-foreground mr-2 text-xs font-semibold">Skills & Stacks:</span>
          {user.skills.map((skill) => (
            <span
              key={skill}
              className="bg-muted text-foreground border-border rounded-lg border px-2.5 py-0.5 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Quick Stats Grid Bar */}
      <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4">
        <div className="bg-background border-border rounded-xl border p-3 text-center">
          <div className="text-foreground text-xl font-black sm:text-2xl">
            {stats.eventsAttended}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs font-medium tracking-wider uppercase">
            Events Attended
          </div>
        </div>
        <div className="bg-background border-border rounded-xl border p-3 text-center">
          <div className="text-success text-xl font-black sm:text-2xl">
            {stats.workshopsCompleted}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs font-medium tracking-wider uppercase">
            Workshops
          </div>
        </div>
        <div className="bg-background border-border rounded-xl border p-3 text-center">
          <div className="text-primary text-xl font-black sm:text-2xl">
            {stats.hackathonsJoined}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs font-medium tracking-wider uppercase">
            Hackathons
          </div>
        </div>
        <div className="bg-background border-border rounded-xl border p-3 text-center">
          <div className="text-primary text-xl font-black sm:text-2xl">
            {stats.certificatesEarned}
          </div>
          <div className="text-muted-foreground mt-0.5 text-xs font-medium tracking-wider uppercase">
            Certificates
          </div>
        </div>
      </div>
    </div>
  );
}
