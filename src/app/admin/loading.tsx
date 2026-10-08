// src/app/admin/loading.tsx
// Skeleton matching final layout of admin routes (no blocking spinners)

export default function AdminLoading() {
  return (
    <div className="space-y-4">
      {/* Page Header skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="bg-muted h-7 w-36 animate-pulse rounded-md" />
          <div className="bg-muted h-3.5 w-64 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
      </div>

      {/* Toolbar skeleton: search + filter + export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="bg-muted h-9 w-64 animate-pulse rounded-md" />
          <div className="bg-muted h-9 w-36 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
      </div>

      {/* Table skeleton with sticky header & rows */}
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-border bg-muted/40 border-b">
              <tr>
                <th className="px-4 py-3">
                  <div className="bg-muted h-4 w-12 animate-pulse rounded" />
                </th>
                <th className="px-4 py-3">
                  <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                </th>
                <th className="px-4 py-3">
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                </th>
                <th className="px-4 py-3">
                  <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                </th>
                <th className="px-4 py-3">
                  <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                </th>
                <th className="px-4 py-3 text-right">
                  <div className="bg-muted ml-auto h-4 w-12 animate-pulse rounded" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3.5">
                    <div className="bg-muted h-4 w-14 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="bg-muted h-4 w-40 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="bg-muted h-4 w-16 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="bg-muted ml-auto h-4 w-10 animate-pulse rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer / pagination skeleton */}
        <div className="border-border flex items-center justify-between border-t px-4 py-3">
          <div className="bg-muted h-3.5 w-32 animate-pulse rounded" />
          <div className="flex gap-2">
            <div className="bg-muted h-8 w-16 animate-pulse rounded" />
            <div className="bg-muted h-8 w-16 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
