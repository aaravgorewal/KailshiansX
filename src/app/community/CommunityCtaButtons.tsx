"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Crown,
  BookOpen,
  Award,
  Mic,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { triggerCommunityModal } from "./CommunityModalsClient";

export function CommunityCtaGrid() {
  const [showJoinPrompt, setShowJoinPrompt] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Join Community */}
        <div className="border-surface-800 bg-surface-900/80 hover:border-brand-500/50 flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition-all hover:-translate-y-1">
          <div className="space-y-3">
            <div className="bg-brand-500/20 text-brand-400 border-brand-500/30 flex size-11 items-center justify-center rounded-2xl border">
              <Users className="size-5" />
            </div>
            <h3 className="text-surface-50 text-lg font-bold">Join Community</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Connect with 1,200+ builders, hackathon teams, and mentors in our centralized builder
              hub on WhatsApp and Discord.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => setShowJoinPrompt(true)}
            >
              <span>Enter Community Circle</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>

        {/* 2. Become Campus Lead */}
        <div className="border-surface-800 bg-surface-900/80 hover:border-brand-500/50 flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition-all hover:-translate-y-1">
          <div className="space-y-3">
            <div className="bg-brand-500/20 text-brand-400 border-brand-500/30 flex size-11 items-center justify-center rounded-2xl border">
              <GraduationCap className="size-5" />
            </div>
            <h3 className="text-surface-50 text-lg font-bold">Become Campus Lead</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Spearhead technical energy at your college. Form a chapter, run workshops, lead
              hackathon teams, and get 1:1 mentorship.
            </p>
          </div>
          <div className="pt-6">
            <Button asChild variant="outline" size="sm" className="hover:border-brand-500 w-full">
              <Link href="/campus-leads">
                <span>Apply as Campus Lead</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 3. Become State Lead */}
        <div className="border-surface-800 bg-surface-900/80 flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-purple-500/50">
          <div className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/20 text-purple-400">
              <Crown className="size-5" />
            </div>
            <h3 className="text-surface-50 text-lg font-bold">Become State Lead</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Drive multi-city developer ecosystem expansion across your state. Onboard campus
              leads, oversee meetup series, and command event budgets.
            </p>
          </div>
          <div className="pt-6">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-purple-300 hover:border-purple-500"
            >
              <Link href="/state-leads">
                <span>Apply as State Lead</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 4. Start a Chapter */}
        <div className="border-surface-800 bg-surface-900/80 flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-emerald-500/50">
          <div className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
              <BookOpen className="size-5" />
            </div>
            <h3 className="text-surface-50 text-lg font-bold">Start a Chapter</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Are you a faculty member or student club president? Partner with KailshiansX to
              establish an officially backed engineering chapter.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-emerald-300 hover:border-emerald-500"
              onClick={() => triggerCommunityModal("chapter")}
            >
              <span>Submit Chapter Proposal</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>

        {/* 5. Become a Mentor */}
        <div className="border-surface-800 bg-surface-900/80 flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-indigo-500/50">
          <div className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
              <Award className="size-5" />
            </div>
            <h3 className="text-surface-50 text-lg font-bold">Become a Mentor</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Guide passionate college hackers through 36-hour sprint checkpoints at NirmanX and
              AarambhX. Conduct code reviews and architecture audits.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-indigo-300 hover:border-indigo-500"
              onClick={() => triggerCommunityModal("mentor")}
            >
              <span>Join Mentorship Pool</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>

        {/* 6. Become a Speaker */}
        <div className="border-surface-800 bg-surface-900/80 flex flex-col justify-between rounded-3xl border p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-amber-500/50">
          <div className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/20 text-amber-400">
              <Mic className="size-5" />
            </div>
            <h3 className="text-surface-50 text-lg font-bold">Become a Speaker</h3>
            <p className="text-surface-400 text-xs leading-relaxed">
              Take the stage at our regional meetup series (RaibarX, PadharoX, TricityX) or host
              dedicated Tech Talks on advanced engineering subjects.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-amber-300 hover:border-amber-500"
              onClick={() => triggerCommunityModal("speaker")}
            >
              <span>Submit Speaker Profile</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Join Community Modal Prompt */}
      {showJoinPrompt && (
        <div className="bg-surface-950/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="border-surface-800 bg-surface-900 relative w-full max-w-md space-y-6 rounded-3xl border p-6 text-center shadow-2xl sm:p-8">
            <div className="bg-brand-500/20 text-brand-400 border-brand-500/30 mx-auto flex size-14 items-center justify-center rounded-2xl border">
              <MessageSquare className="size-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-surface-50 text-xl font-bold">Choose Your Community Hub</h3>
              <p className="text-surface-400 mx-auto max-w-sm text-xs">
                Join our regional city groups and tech discussion channels to find teammates, get
                event updates, and share projects.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <a
                href="https://chat.whatsapp.com/kailshiansx"
                target="_blank"
                rel="noreferrer"
                className="border-surface-800 bg-surface-950/60 hover:bg-surface-950 group flex items-center justify-between rounded-2xl border p-3.5 transition hover:border-emerald-500/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/20 text-xs font-bold text-emerald-400">
                    WA
                  </div>
                  <div>
                    <h4 className="text-surface-100 text-xs font-bold group-hover:text-emerald-300">
                      WhatsApp Community & City Announce
                    </h4>
                    <p className="text-surface-500 text-[10px]">
                      Instant hackathon announcements and passes
                    </p>
                  </div>
                </div>
                <ExternalLink className="text-surface-500 size-3.5 group-hover:text-emerald-400" />
              </a>

              <a
                href="https://discord.gg/kailshiansx"
                target="_blank"
                rel="noreferrer"
                className="border-surface-800 bg-surface-950/60 hover:bg-surface-950 group flex items-center justify-between rounded-2xl border p-3.5 transition hover:border-indigo-500/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/20 text-xs font-bold text-indigo-400">
                    DC
                  </div>
                  <div>
                    <h4 className="text-surface-100 text-xs font-bold group-hover:text-indigo-300">
                      Discord Builder Server
                    </h4>
                    <p className="text-surface-500 text-[10px]">
                      Technical chat, code reviews & team formation
                    </p>
                  </div>
                </div>
                <ExternalLink className="text-surface-500 size-3.5 group-hover:text-indigo-400" />
              </a>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowJoinPrompt(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
