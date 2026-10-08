"use client";

import * as React from "react";
import Image from "next/image";

interface FounderAvatarProps {
  photo?: string | null;
  name: string;
}

export function FounderAvatar({ photo, name }: FounderAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "K";

  if (!photo || hasError) {
    return (
      <div
        className="bg-primary/10 text-primary-hover dark:text-primary border-border/80 flex size-16 shrink-0 items-center justify-center rounded-full border text-base font-bold"
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="border-border bg-muted relative size-16 shrink-0 overflow-hidden rounded-full border">
      <Image
        src={photo}
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
