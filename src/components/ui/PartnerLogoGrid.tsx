"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type PartnerTier =
  "TITLE" | "PLATINUM" | "GOLD" | "SILVER" | "COMMUNITY" | "VENUE" | "ECOSYSTEM";

export interface PartnerLogo {
  id?: string | number;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier?: PartnerTier | string;
}

export type PartnerItem = PartnerLogo;

export interface PartnerLogoGridProps {
  partners: PartnerLogo[];
  groupByTier?: boolean;
  title?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  grayscale?: boolean;
  className?: string;
}

const tierOrder: PartnerTier[] = [
  "TITLE",
  "PLATINUM",
  "GOLD",
  "SILVER",
  "COMMUNITY",
  "VENUE",
  "ECOSYSTEM",
];

const tierLabels: Record<PartnerTier, string> = {
  TITLE: "Title Partner",
  PLATINUM: "Platinum Partners",
  GOLD: "Gold Partners",
  SILVER: "Silver Partners",
  COMMUNITY: "Community Partners",
  VENUE: "Venue & Infrastructure Partners",
  ECOSYSTEM: "Ecosystem Partners",
};

export function PartnerLogoGrid({
  partners,
  groupByTier = false,
  title,
  columns = 4,
  grayscale = true,
  className,
}: PartnerLogoGridProps) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
  }[columns];

  const renderCard = (partner: PartnerLogo, idx: number) => {
    const key = partner.id ?? `${partner.name}-${idx}`;
    const CardInner = (
      <div className="border-border bg-card hover:border-muted-foreground relative flex h-24 w-full items-center justify-center rounded-lg border p-4 transition-colors duration-150 sm:h-28">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            width={130}
            height={48}
            className={cn(
              "max-h-12 max-w-[130px] object-contain transition-opacity duration-150",
              grayscale
                ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                : "opacity-80 hover:opacity-100"
            )}
            loading="lazy"
            unoptimized={partner.logoUrl.startsWith("data:")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-foreground text-sm font-semibold">{partner.name}</span>
            {partner.tier && (
              <span className="text-muted-foreground mt-0.5 font-mono text-xs">{partner.tier}</span>
            )}
          </div>
        )}

        {partner.websiteUrl && (
          <span className="text-muted-foreground hover:text-foreground absolute top-2 right-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            <ExternalLink className="size-3" aria-hidden="true" />
          </span>
        )}
      </div>
    );

    if (partner.websiteUrl) {
      return (
        <Link
          key={key}
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group focus-visible:ring-ring block rounded-lg outline-none focus-visible:ring-2"
          aria-label={`Visit ${partner.name} website`}
        >
          {CardInner}
        </Link>
      );
    }

    return <div key={key}>{CardInner}</div>;
  };

  if (groupByTier) {
    const grouped = tierOrder.reduce<Record<string, PartnerLogo[]>>((acc, tier) => {
      const matched = partners.filter((p) => p.tier === tier);
      if (matched.length > 0) {
        acc[tier] = matched;
      }
      return acc;
    }, {});

    const untiered = partners.filter((p) => !p.tier || !tierOrder.includes(p.tier as PartnerTier));
    if (untiered.length > 0) {
      grouped.COMMUNITY = [...(grouped.COMMUNITY || []), ...untiered];
    }

    return (
      <div className={cn("w-full space-y-8", className)}>
        {Object.entries(grouped).map(([tierKey, list]) => (
          <div key={tierKey} className="space-y-4">
            <h4 className="text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase">
              {tierLabels[tierKey as PartnerTier] || tierKey}
            </h4>
            <div className={cn("grid gap-4", colClass)}>
              {list.map((partner, idx) => renderCard(partner, idx))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {title && (
        <h4 className="text-muted-foreground text-center text-xs font-semibold tracking-wider uppercase">
          {title}
        </h4>
      )}

      <div className={cn("grid gap-4", colClass)}>
        {partners.map((partner, idx) => renderCard(partner, idx))}
      </div>
    </div>
  );
}
