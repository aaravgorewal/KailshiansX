import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Mic, Award, Compass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export type SpeakerRole = "SPEAKER" | "JUDGE" | "MENTOR";

export interface SpeakerSocials {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface SpeakerCardProps {
  id?: string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  bio?: string;
  topics?: string[];
  speakerRole?: SpeakerRole;
  socials?: SpeakerSocials;
  sessionsCount?: number;
  href?: string;
  className?: string;
}

// Crisp inline SVGs for dev socials without needing heavy icon packages
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92m1.37 9.74v-8.37H5.09v8.37z" />
    </svg>
  );
}

export function SpeakerCard({
  name,
  role,
  company,
  avatarUrl,
  bio,
  topics = [],
  speakerRole = "SPEAKER",
  socials,
  sessionsCount,
  href,
  className,
}: SpeakerCardProps) {
  const roleBadge = {
    SPEAKER: { label: "Speaker", variant: "brand" as const, icon: <Mic className="size-3" /> },
    JUDGE: { label: "Judge", variant: "accent" as const, icon: <Award className="size-3" /> },
    MENTOR: { label: "Mentor", variant: "success" as const, icon: <Compass className="size-3" /> },
  }[speakerRole];

  return (
    <div
      className={cn(
        "group border-surface-800 bg-surface-900/80 hover:border-surface-700 relative flex flex-col items-center rounded-2xl border p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      {/* Role badge top right */}
      <div className="absolute top-4 right-4">
        <Badge variant={roleBadge.variant} size="sm" icon={roleBadge.icon}>
          {roleBadge.label}
        </Badge>
      </div>

      {/* Avatar with gradient ring */}
      <div className="relative mt-2 mb-4">
        <div className="from-brand-500 via-accent-500 to-brand-400 size-24 rounded-full bg-gradient-to-tr p-1 transition-shadow group-hover:shadow-[0_0_20px_rgba(61,97,252,0.3)] sm:size-28">
          {avatarUrl ? (
            <div className="relative size-full overflow-hidden rounded-full">
              <Image
                src={avatarUrl}
                alt={name}
                fill
                sizes="112px"
                className="bg-surface-950 size-full rounded-full object-cover"
                loading="lazy"
                unoptimized={avatarUrl.startsWith("data:")}
              />
            </div>
          ) : (
            <div className="bg-surface-950 text-surface-200 flex size-full items-center justify-center rounded-full text-xl font-bold">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {sessionsCount && (
          <span
            className="bg-surface-900 border-surface-700 text-brand-300 absolute -right-1 -bottom-1 rounded-full border px-2 py-0.5 font-mono text-[10px] shadow-sm"
            title={`${sessionsCount} community sessions`}
          >
            {sessionsCount} talks
          </span>
        )}
      </div>

      {/* Name and headline */}
      <h3 className="text-surface-50 group-hover:text-brand-300 text-lg font-bold transition-colors">
        {href ? (
          <Link href={href} className="focus-visible:underline focus-visible:outline-none">
            {name}
          </Link>
        ) : (
          name
        )}
      </h3>

      <div className="text-surface-300 mt-1 text-xs font-medium sm:text-sm">{role}</div>
      <div className="text-brand-400 mt-0.5 font-mono text-xs">@{company}</div>

      {/* Bio snippet */}
      {bio && (
        <p className="text-surface-400 mt-3 line-clamp-3 max-w-[260px] text-xs leading-relaxed">
          {bio}
        </p>
      )}

      {/* Topic chips */}
      {topics.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
          {topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="bg-surface-800/80 text-surface-300 border-surface-700/60 rounded-full border px-2 py-0.5 text-[10px]"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Social links */}
      {socials && (
        <div className="border-surface-800/80 mt-5 flex w-full items-center justify-center gap-3 border-t pt-4">
          {socials.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s GitHub profile`}
              className="text-surface-400 focus-visible:ring-brand-500 rounded-md p-1 transition-colors hover:text-white focus-visible:ring-1"
            >
              <GithubIcon className="size-4" />
            </a>
          )}
          {socials.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s X / Twitter profile`}
              className="text-surface-400 focus-visible:ring-brand-500 rounded-md p-1 transition-colors hover:text-white focus-visible:ring-1"
            >
              <TwitterIcon className="size-4" />
            </a>
          )}
          {socials.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s LinkedIn profile`}
              className="text-surface-400 focus-visible:ring-brand-500 rounded-md p-1 transition-colors hover:text-white focus-visible:ring-1"
            >
              <LinkedinIcon className="size-4" />
            </a>
          )}
          {socials.website && (
            <a
              href={socials.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s Website`}
              className="text-surface-400 focus-visible:ring-brand-500 rounded-md p-1 transition-colors hover:text-white focus-visible:ring-1"
            >
              <Globe className="size-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
