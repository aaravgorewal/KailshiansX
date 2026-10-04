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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { triggerCommunityModal } from "./CommunityModalsClient";

export function CommunityCtaGrid() {
  const [showJoinPrompt, setShowJoinPrompt] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Join Community */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <Users className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Join Community</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Connect with builders, hackathon teams, and mentors in our centralized builder hub on
              WhatsApp and Discord.
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
        </Card>

        {/* 2. Become Campus Lead */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <GraduationCap className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Become Campus Lead</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Spearhead technical energy at your college. Form a chapter, run workshops, lead
              hackathon teams, and get 1:1 mentorship.
            </p>
          </div>
          <div className="pt-6">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/campus-leads">
                <span>Apply as Campus Lead</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* 3. Become State Lead */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <Crown className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Become State Lead</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Drive multi-city developer ecosystem expansion across your state. Onboard campus
              leads, oversee meetup series, and command event budgets.
            </p>
          </div>
          <div className="pt-6">
            <Button asChild variant="secondary" size="sm" className="w-full">
              <Link href="/state-leads">
                <span>Apply as State Lead</span>
                <ArrowRight className="ml-1.5 size-3.5" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* 4. Start a Chapter */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <BookOpen className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Start a Chapter</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Are you a faculty member or student club president? Partner with KailshiansX to
              establish an officially backed engineering chapter.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => triggerCommunityModal("chapter")}
            >
              <span>Submit Chapter Proposal</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </Card>

        {/* 5. Become a Mentor */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <Award className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Become a Mentor</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Guide passionate college hackers through sprint checkpoints at hackathons. Conduct
              code reviews and architecture audits.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => triggerCommunityModal("mentor")}
            >
              <span>Join Mentorship Pool</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </Card>

        {/* 6. Become a Speaker */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-3">
            <div className="border-border bg-muted text-foreground flex size-10 items-center justify-center rounded-lg border">
              <Mic className="size-5" />
            </div>
            <h3 className="text-foreground text-base font-semibold">Become a Speaker</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Take the stage at our regional meetup series or host dedicated Tech Talks on advanced
              engineering subjects.
            </p>
          </div>
          <div className="pt-6">
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => triggerCommunityModal("speaker")}
            >
              <span>Submit Speaker Profile</span>
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Join Community Modal Prompt */}
      {showJoinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="border-border bg-card relative w-full max-w-md space-y-6 rounded-lg border p-6 shadow-xl sm:p-8">
            <button
              onClick={() => setShowJoinPrompt(false)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-4 rounded-md p-1.5"
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>

            <div className="border-border bg-muted text-foreground flex size-11 items-center justify-center rounded-lg border">
              <MessageSquare className="size-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-foreground text-lg font-bold">Choose Your Community Hub</h3>
              <p className="text-muted-foreground text-xs">
                Join our regional city groups and tech discussion channels to find teammates, get
                event updates, and share projects.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <a
                href="https://chat.whatsapp.com/kailshiansx"
                target="_blank"
                rel="noreferrer"
                className="group border-border bg-muted/40 hover:border-foreground/40 hover:bg-muted flex items-center justify-between rounded-lg border p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="border-border bg-background text-foreground flex size-9 items-center justify-center rounded-md border text-xs font-bold">
                    WA
                  </div>
                  <div>
                    <h4 className="text-foreground text-xs font-semibold">
                      WhatsApp Community & City Announce
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Instant hackathon announcements and passes
                    </p>
                  </div>
                </div>
                <ExternalLink className="text-muted-foreground group-hover:text-foreground size-3.5" />
              </a>

              <a
                href="https://discord.gg/kailshiansx"
                target="_blank"
                rel="noreferrer"
                className="group border-border bg-muted/40 hover:border-foreground/40 hover:bg-muted flex items-center justify-between rounded-lg border p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="border-border bg-background text-foreground flex size-9 items-center justify-center rounded-md border text-xs font-bold">
                    DC
                  </div>
                  <div>
                    <h4 className="text-foreground text-xs font-semibold">
                      Discord Builder Server
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Technical chat, code reviews & team formation
                    </p>
                  </div>
                </div>
                <ExternalLink className="text-muted-foreground group-hover:text-foreground size-3.5" />
              </a>
            </div>

            <Button
              variant="secondary"
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
