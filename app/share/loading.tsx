import Skeleton from "@/components/Skeleton";

// Shown while the share links and eligible entries load.
export default function ShareLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <Skeleton className="h-10 w-32 rounded-lg" />

      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="card space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}
