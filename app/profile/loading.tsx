import Skeleton from "@/components/Skeleton";

// Shown while the profile's details load.
export default function ProfileLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="card space-y-3 py-2!">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex justify-between gap-4 py-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden p-0!">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
