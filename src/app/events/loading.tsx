// src/app/events/loading.tsx
// Skeleton matching final layout of /events directory

export default function EventsLoading() {
  return (
    <div className="py-12 md:py-20">
      <div className="container-page">
        {/* Title skeleton */}
        <div className="mb-8 md:mb-12">
          <div className="bg-muted h-10 w-48 animate-pulse rounded-lg sm:h-12" />
        </div>

        {/* Filter bar skeleton */}
        <div className="border-border mb-8 border-b pb-6 sm:mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter pills skeleton */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="bg-muted h-5 w-10 animate-pulse rounded" />
              <div className="bg-muted h-5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-5 w-20 animate-pulse rounded" />
              <div className="bg-muted h-5 w-20 animate-pulse rounded" />
              <div className="bg-muted h-5 w-14 animate-pulse rounded" />
            </div>

            {/* City & When toggle skeleton */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="bg-muted h-9 w-32 animate-pulse rounded-lg" />
              <div className="bg-muted h-5 w-24 animate-pulse rounded" />
            </div>
          </div>
        </div>

        {/* Event rows skeleton matching EventRow */}
        <div className="divide-border border-border divide-y border-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-2 py-6 sm:gap-8 sm:px-4 sm:py-8"
            >
              {/* Date & Title block */}
              <div className="flex min-w-0 items-center gap-4 sm:gap-8">
                {/* Date block */}
                <div className="flex min-w-[3.25rem] shrink-0 flex-col items-start sm:min-w-[4.25rem]">
                  <div className="bg-muted h-8 w-8 animate-pulse rounded sm:h-10 sm:w-10" />
                  <div className="bg-muted mt-1 h-3 w-8 animate-pulse rounded" />
                </div>

                {/* Details */}
                <div className="min-w-0 space-y-2">
                  <div className="bg-muted h-5 w-48 animate-pulse rounded sm:h-6 sm:w-80" />
                  <div className="bg-muted h-3.5 w-32 animate-pulse rounded sm:w-44" />
                </div>
              </div>

              {/* Price & Arrow */}
              <div className="flex shrink-0 items-center gap-3 sm:gap-6">
                <div className="bg-muted h-4 w-12 animate-pulse rounded" />
                <div className="bg-muted size-4 animate-pulse rounded sm:size-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
