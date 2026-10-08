// src/app/gallery/[albumId]/loading.tsx
// Skeleton matching final layout of gallery album detail

export default function AlbumLoading() {
  return (
    <div className="container-page min-h-screen space-y-12 py-12 sm:py-16">
      {/* Back button & Title skeleton */}
      <div className="space-y-4">
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="bg-muted h-9 w-3/4 max-w-lg animate-pulse rounded-lg sm:h-11" />
        <div className="bg-muted h-4 w-48 animate-pulse rounded" />
      </div>

      {/* Photo grid skeleton (4 columns) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted border-border aspect-[4/3] w-full animate-pulse rounded-lg border"
          />
        ))}
      </div>
    </div>
  );
}
