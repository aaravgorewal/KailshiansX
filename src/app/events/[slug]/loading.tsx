// src/app/events/[slug]/loading.tsx
// Skeleton matching final layout of event detail page

export default function EventDetailLoading() {
  return (
    <article className="py-12 pb-28 md:py-20 lg:pb-20">
      <div className="container-page">
        {/* Header skeleton */}
        <header className="max-w-4xl space-y-4">
          <div className="bg-muted h-10 w-3/4 max-w-xl animate-pulse rounded-lg sm:h-12" />
          <div className="bg-muted h-4 w-1/2 max-w-md animate-pulse rounded sm:h-5" />
        </header>

        {/* Large cover image skeleton */}
        <div className="bg-muted mt-8 aspect-video max-h-[500px] w-full animate-pulse rounded-2xl" />

        {/* Two-column layout skeleton */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 md:mt-16 lg:grid-cols-3 lg:gap-16">
          {/* Left Column (Overview, Schedule, Speakers) */}
          <div className="space-y-12 md:space-y-16 lg:col-span-2">
            {/* Overview section skeleton */}
            <div className="space-y-4">
              <div className="bg-muted h-8 w-32 animate-pulse rounded" />
              <div className="space-y-2">
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
                <div className="bg-muted h-4 w-4/6 animate-pulse rounded" />
              </div>
            </div>

            {/* Schedule section skeleton */}
            <div className="space-y-4">
              <div className="bg-muted h-8 w-32 animate-pulse rounded" />
              <div className="border-border space-y-3 border-t pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-6 py-2">
                    <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-48 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Ticket purchase card skeleton) */}
          <div className="border-border bg-card space-y-6 rounded-2xl border p-6">
            <div className="bg-muted h-6 w-24 animate-pulse rounded" />
            <div className="space-y-3">
              <div className="bg-muted h-12 w-full animate-pulse rounded-lg" />
              <div className="bg-muted h-12 w-full animate-pulse rounded-lg" />
            </div>
            <div className="bg-muted h-10 w-full animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}
