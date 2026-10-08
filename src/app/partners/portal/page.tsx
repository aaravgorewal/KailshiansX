// src/app/partners/portal/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function PartnerPortalEntryPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setIsNavigating(true);
    router.push(`/partners/portal/${accessCode.trim().toUpperCase()}`);
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col justify-center pb-24">
      <div className="relative mx-auto w-full max-w-lg px-4 sm:px-6">
        <div className="space-y-3 text-center">
          <div className="border-primary/30 bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
            <Building2 className="h-7 w-7" />
          </div>

          <span className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase">
            Official Brand Sponsor Access
          </span>

          <h1 className="text-foreground text-3xl font-black sm:text-4xl">Partner Portal</h1>

          <p className="text-muted-foreground text-xs sm:text-sm">
            Enter your unique organization access code to inspect deliverables status, audience
            telemetry, and post-event impact reports.
          </p>
        </div>

        <div className="border-border bg-card mt-8 rounded-3xl border p-6 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted-foreground text-xs font-bold">
                Partner Portal Access Code
              </label>
              <input
                id="input-partner-code"
                type="text"
                required
                placeholder="e.g. KX-SPN-NIRMAN or KX-SPN-XXXX"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="border-border bg-background placeholder:text-muted-foreground text-foreground focus:border-primary mt-1 w-full rounded-xl border px-4 py-3 font-mono text-sm tracking-wider uppercase focus:outline-none"
              />
            </div>

            <Button
              id="btn-access-portal"
              type="submit"
              disabled={isNavigating || !accessCode.trim()}
              className="bg-primary hover:bg-primary-hover text-primary-foreground w-full py-3 font-bold shadow-sm"
            >
              {isNavigating ? "Authenticating..." : "Access Executive Dashboard"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="border-border mt-6 border-t pt-4 text-center">
            <p className="text-muted-foreground text-xs">
              Need access? Contact your KailshiansX Partnership Manager or explore our sponsor
              packages.
            </p>
            <div className="text-primary mt-2 flex items-center justify-center gap-4 text-xs font-medium">
              <Link href="/partner" className="hover:underline">
                Sponsor an Event
              </Link>
              <span>•</span>
              <Link href="/events" className="hover:underline">
                Upcoming Hackathons
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
