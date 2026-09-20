// The icons used by the header nav (tablet and up) and the bottom bar (phones).
type IconProps = { className?: string };

const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function TimelineIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} strokeWidth="1.8" className={className}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function PassportIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} strokeWidth="1.8" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.6-1.4 1.8-2 3-2s2.4.6 3 2M15 10h3M15 13h3" />
    </svg>
  );
}

export function PlusIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} strokeWidth="2.4" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function UserIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} strokeWidth="1.8" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  );
}
