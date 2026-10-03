import * as React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type PartnerTier =
  "TITLE" | "PLATINUM" | "GOLD" | "SILVER" | "COMMUNITY" | "VENUE" | "ECOSYSTEM";

export interface PartnerItem {
  id?: string;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  tier?: PartnerTier;
  description?: string;
}

export interface PartnerLogoGridProps {
  partners: PartnerItem[];
  groupByTier?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
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
  columns = 4,
  className,
}: PartnerLogoGridProps) {
  const gridColClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-4 md:grid-cols-6",
  }[columns];

  const renderCard = (partner: PartnerItem) => {
    const CardContent = (
      <div className="group border-surface-800 bg-surface-900/60 hover:border-surface-600 hover:bg-surface-850 relative flex h-24 w-full items-center justify-center rounded-xl border p-4 backdrop-blur-sm transition-all duration-300 hover:shadow-lg sm:h-28">
        {partner.logoUrl ? (
          <img
            src={partner.logoUrl}
            alt={partner.name}
            className="max-h-12 max-w-[130px] object-contain opacity-60 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-surface-300 group-hover:text-surface-100 text-sm font-semibold transition-colors">
              {partner.name}
            </span>
            {partner.tier && (
              <span className="text-surface-500 mt-0.5 font-mono text-[10px]">{partner.tier}</span>
            )}
          </div>
        )}

        {partner.websiteUrl && (
          <span className="text-surface-400 group-hover:text-brand-400 absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <ExternalLink className="size-3" aria-hidden="true" />
          </span>
        )}
      </div>
    );

    if (partner.websiteUrl) {
      return (
        <a
          key={partner.name}
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${partner.name} website`}
          className="focus-visible:ring-brand-500 rounded-xl focus-visible:ring-2 focus-visible:outline-none"
        >
          {CardContent}
        </a>
      );
    }

    return <div key={partner.name}>{CardContent}</div>;
  };

  if (!groupByTier) {
    return (
      <div className={cn("grid gap-4 sm:gap-6", gridColClass, className)}>
        {partners.map(renderCard)}
      </div>
    );
  }

  // Group by tiers
  const grouped = tierOrder
    .map((tier) => ({
      tier,
      label: tierLabels[tier],
      items: partners.filter((p) => p.tier === tier),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className={cn("space-y-10 sm:space-y-12", className)}>
      {grouped.map(({ tier, label, items }) => (
        <div key={tier} className="space-y-4">
          <div className="flex items-center gap-3">
            <h4 className="text-surface-400 font-mono text-xs tracking-wider uppercase">{label}</h4>
            <div className="bg-surface-800 h-px flex-1" />
          </div>

          <div className={cn("grid gap-4 sm:gap-6", gridColClass)}>{items.map(renderCard)}</div>
        </div>
      ))}
    </div>
  );
}
