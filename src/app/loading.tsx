// src/app/loading.tsx
// Root skeleton matching public layout (no blocking spinners)

export default function Loading() {
  return (
    <div className="py-16 md:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column Text Skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="bg-muted h-12 w-4/5 animate-pulse rounded-xl sm:h-16" />
              <div className="bg-muted h-12 w-3/5 animate-pulse rounded-xl sm:h-16" />
            </div>
            <div className="max-w-lg space-y-2">
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
            </div>
            <div className="flex gap-4 pt-4">
              <div className="bg-muted h-11 w-36 animate-pulse rounded-lg" />
              <div className="bg-muted h-11 w-44 animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Right Column Image Skeleton */}
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <div className="bg-muted aspect-[4/5] w-full animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
