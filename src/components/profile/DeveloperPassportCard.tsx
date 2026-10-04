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
  Sparkles,
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
    <div className="border-surface-700/80 from-surface-900/90 to-surface-950 relative overflow-hidden rounded-2xl border bg-gradient-to-b p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      {/* Decorative neon gradient header accents */}
      <div className="bg-brand-500/10 pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="border-surface-800 relative z-10 flex flex-col items-start justify-between gap-6 border-b pb-6 lg:flex-row lg:items-center">
        {/* User Identity Info */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="ring-surface-700/60 bg-surface-800 relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl shadow-xl ring-4 sm:h-24 sm:w-24">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 80px, 96px"
              />
            ) : (
              <div className="from-brand-600 flex h-full w-full items-center justify-center bg-gradient-to-tr to-indigo-600 text-3xl font-extrabold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-surface-200 absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] font-bold tracking-widest uppercase backdrop-blur-xs">
              Pass ID
            </div>
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                {user.name}
              </h2>
              <span className="text-surface-400 bg-surface-800/80 border-surface-700/60 rounded-md border px-2 py-0.5 font-mono text-xs">
                @{user.username}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm",
                  highestRank.badgeColor
                )}
              >
                <Sparkles className="h-3 w-3" />
                {highestRank.label}
              </span>
            </div>

            <p className="text-surface-300 mb-2 line-clamp-1 max-w-xl text-sm font-medium">
              {user.headline || "Passionate builder active in the KailshiansX community"}
            </p>

            {user.bio && (
              <p className="text-surface-400 mb-3 line-clamp-2 max-w-2xl text-xs leading-relaxed">
                {user.bio}
              </p>
            )}

            {/* Social links */}
            <div className="text-surface-400 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-surface-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member {stats.memberDays} days
              </span>

              {user.github && (
                <a
                  href={`https://github.com/${user.github.replace(/^https?:\/\/github.com\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 transition-colors hover:text-white"
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
                  className="flex items-center gap-1 transition-colors hover:text-white"
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
                  className="flex items-center gap-1 transition-colors hover:text-white"
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
                  className="flex items-center gap-1 transition-colors hover:text-white"
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
            <div className="bg-surface-800/80 border-surface-700/80 flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs sm:w-auto sm:justify-end">
              <span className="text-surface-200 flex items-center gap-1.5 font-medium">
                {isPublic ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Passport is Public
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
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
                  isPublic ? "bg-emerald-500" : "bg-surface-600",
                  toggling && "cursor-wait opacity-50"
                )}
                aria-label="Toggle passport visibility"
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
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
              className="bg-surface-800 hover:bg-surface-700 text-surface-200 border-surface-700 flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition-colors hover:text-white sm:flex-initial"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
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
              className="bg-brand-500 hover:bg-brand-600 flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors sm:flex-initial"
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
          <span className="text-surface-400 mr-2 text-xs font-semibold">Skills & Stacks:</span>
          {user.skills.map((skill) => (
            <span
              key={skill}
              className="bg-surface-800/90 text-surface-200 border-surface-700/60 rounded-lg border px-2.5 py-0.5 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Quick Stats Grid Bar */}
      <div className="border-surface-800/80 mt-4 grid grid-cols-2 gap-3 border-t pt-6 sm:grid-cols-4">
        <div className="bg-surface-950/60 border-surface-800/80 rounded-xl border p-3 text-center">
          <div className="text-xl font-black text-white sm:text-2xl">{stats.eventsAttended}</div>
          <div className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
            Events Attended
          </div>
        </div>
        <div className="bg-surface-950/60 border-surface-800/80 rounded-xl border p-3 text-center">
          <div className="text-xl font-black text-teal-400 sm:text-2xl">
            {stats.workshopsCompleted}
          </div>
          <div className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
            Workshops
          </div>
        </div>
        <div className="bg-surface-950/60 border-surface-800/80 rounded-xl border p-3 text-center">
          <div className="text-xl font-black text-amber-400 sm:text-2xl">
            {stats.hackathonsJoined}
          </div>
          <div className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
            Hackathons
          </div>
        </div>
        <div className="bg-surface-950/60 border-surface-800/80 rounded-xl border p-3 text-center">
          <div className="text-xl font-black text-purple-400 sm:text-2xl">
            {stats.certificatesEarned}
          </div>
          <div className="text-surface-400 mt-0.5 text-[11px] font-medium tracking-wider uppercase">
            Certificates
          </div>
        </div>
      </div>
    </div>
  );
}
