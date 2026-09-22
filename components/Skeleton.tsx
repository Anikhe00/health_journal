// A pulsing gray block, the building piece for every route's loading.tsx skeleton.
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}
