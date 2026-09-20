// The look of the action rows (passport and profile pages): an icon, a label and a chevron.
export const rowClass =
  "flex w-full items-center gap-3 px-4 py-3.5 text-left text-base font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-60";

const icon = "size-5 shrink-0 text-slate-500";

function Svg({ className = icon, children }: { className?: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export const DownloadIcon = () => (
  <Svg>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
  </Svg>
);

export const EyeIcon = () => (
  <Svg>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </Svg>
);

export const PencilIcon = () => (
  <Svg>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3ZM14 7l3 3" />
  </Svg>
);

export const ChevronRight = ({ className = "" }: { className?: string }) => (
  <Svg className={`size-4 shrink-0 text-slate-400 ${className}`}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const LogoutIcon = () => (
  <Svg>
    <path d="M10 5H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9" />
  </Svg>
);

export const TrashIcon = () => (
  <Svg className="size-5 shrink-0 text-red-600">
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />
  </Svg>
);
