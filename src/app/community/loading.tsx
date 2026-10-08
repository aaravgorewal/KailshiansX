// src/app/community/loading.tsx
// Skeleton matching final layout of /community page

export default function CommunityLoading() {
  return (
    <div className="min-h-screen py-16 sm:py-24">
      <div className="container-page mx-auto max-w-3xl space-y-16 sm:space-y-20">
        {/* Hero Block skeleton */}
        <div className="space-y-6">
          <div className="bg-muted h-12 w-56 animate-pulse rounded-lg sm:h-16" />
          <div className="space-y-2">
            <div className="bg-muted h-5 w-full animate-pulse rounded" />
            <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="bg-muted h-11 w-40 animate-pulse rounded-lg" />
            <div className="bg-muted h-11 w-48 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* How it works skeleton (4 rows) */}
        <div className="space-y-6">
          <div className="bg-muted h-7 w-36 animate-pulse rounded" />
          <div className="divide-border border-border divide-y border-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 py-4 sm:gap-6 sm:py-5">
                <div className="bg-muted h-4 w-6 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                  <div className="bg-muted h-3.5 w-3/4 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form skeleton */}
        <div className="border-border bg-card space-y-6 rounded-xl border p-6 sm:p-8">
          <div className="bg-muted h-7 w-48 animate-pulse rounded" />
          <div className="space-y-4">
            <div className="bg-muted h-10 w-full animate-pulse rounded-lg" />
            <div className="bg-muted h-10 w-full animate-pulse rounded-lg" />
            <div className="bg-muted h-10 w-full animate-pulse rounded-lg" />
            <div className="bg-muted h-24 w-full animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
