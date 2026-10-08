// src/app/gallery/loading.tsx
// Skeleton matching final layout of gallery directory

export default function GalleryLoading() {
  return (
    <div className="container-page min-h-screen space-y-10 py-12 sm:py-16">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="bg-muted h-10 w-44 animate-pulse rounded-lg sm:h-12" />
        <div className="bg-muted h-4 w-3/4 max-w-lg animate-pulse rounded sm:h-5" />
      </div>

      {/* Category filter pills skeleton */}
      <div className="flex gap-2">
        <div className="bg-muted h-8 w-16 animate-pulse rounded-full" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded-full" />
        <div className="bg-muted h-8 w-20 animate-pulse rounded-full" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded-full" />
      </div>

      {/* Albums grid skeleton (3 columns) */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-border bg-card space-y-3 rounded-xl border p-3">
            <div className="bg-muted aspect-[4/3] w-full animate-pulse rounded-lg" />
            <div className="space-y-1.5 p-1">
              <div className="bg-muted h-5 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-3.5 w-1/2 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
