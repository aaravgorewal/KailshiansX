import Link from "next/link";
import { formatDayNumber, formatMonthShort, formatTime } from "@/lib/format-date";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export interface EventRowProps {
  id: string;
  slug: string;
  title: string;
  startDate: Date | string;
  city?: string | null;
  seriesName?: string | null;
  ticketTypes: Array<{ price: number | string | { toString(): string }; isFree?: boolean }>;
  isPast?: boolean;
  recordingUrl?: string | null;
  galleryAlbumId?: string | null;
}

export function EventRow({
  slug,
  title,
  startDate,
  city,
  seriesName,
  ticketTypes,
  isPast,
  recordingUrl,
  galleryAlbumId,
}: EventRowProps) {
  const dayNumber = formatDayNumber(startDate);
  const monthStr = formatMonthShort(startDate);
  const timeStr = formatTime(startDate);

  const locationTime = city ? `${city} • ${timeStr}` : timeStr;

  const isFree =
    ticketTypes.length === 0 || ticketTypes.some((t) => t.isFree || Number(t.price) === 0);

  const minPrice =
    ticketTypes.length > 0 ? Math.min(...ticketTypes.map((t) => Number(t.price))) : 0;

  const priceLabel = isFree ? "Free" : `₹${minPrice.toLocaleString("en-IN")}`;

  return (
    <div className="group hover:bg-muted/40 relative -mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-6 transition-colors sm:-mx-4 sm:gap-8 sm:px-4 sm:py-8">
      <Link
        href={`/events/${slug}`}
        className="focus-visible:ring-ring absolute inset-0 z-0 rounded-lg focus-visible:ring-2 focus-visible:outline-none"
        aria-label={title}
      />

      <div className="pointer-events-none z-10 flex min-w-0 items-center gap-4 sm:gap-8">
        <div className="flex min-w-[3.25rem] shrink-0 flex-col items-start sm:min-w-[4.25rem]">
          <span className="display text-foreground font-mono leading-none">{dayNumber}</span>
          <span className="text-muted-foreground mt-1 font-mono text-xs tracking-wider uppercase">
            {monthStr}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground group-hover:text-accent-text line-clamp-2 text-base font-semibold transition-colors sm:text-lg md:text-xl">
              {title}
            </h2>
            {seriesName && (
              <span className="text-muted-foreground font-mono text-xs">{seriesName}</span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 truncate text-xs sm:text-sm">{locationTime}</p>
        </div>
      </div>

      <div className="z-10 flex shrink-0 items-center gap-3 sm:gap-6">
        {/* Past event recording/photos link if available */}
        {isPast && (recordingUrl || galleryAlbumId) && (
          <div className="text-accent-text pointer-events-auto flex items-center gap-1.5 text-xs font-medium">
            {recordingUrl && (
              <a
                href={recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Recording
              </a>
            )}
            {recordingUrl && galleryAlbumId && <span className="text-muted-foreground">/</span>}
            {galleryAlbumId && (
              <Link href={`/gallery/${galleryAlbumId}`} className="hover:underline">
                Photos
              </Link>
            )}
          </div>
        )}

        <span className="text-foreground font-mono text-xs font-medium sm:text-sm">
          {priceLabel}
        </span>
        <ArrowRightIcon className="text-muted-foreground group-hover:text-foreground pointer-events-none size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1 sm:size-5" />
      </div>
    </div>
  );
}
