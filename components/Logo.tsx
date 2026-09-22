// The app's icon: a heartbeat line on a rounded teal tile. Used in the header, the landing page,
// and (as static files) app/icon.svg and app/apple-icon.tsx for the browser tab and home screen.
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="7" fill="#0f766e" />
      <path
        d="M4.6 12.6h2.7l1.15-2.3 1.75 4.1 1.55-5.15 1.35 3.35h5.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The mark plus the wordmark, for the header and the landing page.
export default function Logo({ className = "", markClassName = "size-7" }: { className?: string; markClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      Health Journal
    </span>
  );
}
