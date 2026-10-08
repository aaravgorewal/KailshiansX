// src/app/about/loading.tsx
// Skeleton matching final layout of /about page

export default function AboutLoading() {
  return (
    <div className="container-page min-h-screen space-y-16 py-16 sm:py-24">
      {/* Mission statement skeleton */}
      <div className="max-w-3xl space-y-6">
        <div className="space-y-3">
          <div className="bg-muted h-10 w-full animate-pulse rounded-lg sm:h-12" />
          <div className="bg-muted h-10 w-4/5 animate-pulse rounded-lg sm:h-12" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-5 w-full animate-pulse rounded" />
          <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
        </div>
      </div>

      {/* Founder section skeleton */}
      <div className="border-border space-y-6 border-t pt-12 pb-2">
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
        <div className="flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-start">
          <div className="bg-muted size-24 shrink-0 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-5 w-40 animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* Team grid skeleton */}
      <div className="border-border space-y-6 border-t pt-12 pb-2">
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-muted h-3.5 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-40 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
