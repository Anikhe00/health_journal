import Skeleton from "@/components/Skeleton";

// Shown the instant someone opens the timeline, while its entries load.
export default function DashboardLoading() {
  return (
    <div data-fill-height className="flex h-full flex-col gap-4 sm:gap-5">
      <div className="shrink-0 space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-14 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-hidden">
        {[0, 1].map((group) => (
          <div key={group} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-2 sm:space-y-4">
              {[0, 1].map((card) => (
                <div key={card} className="card space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
