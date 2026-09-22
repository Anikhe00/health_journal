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

// className is optional: inside a button, pass "size-5 shrink-0" so the icon takes the button's colour.
export const PencilIcon = ({ className }: { className?: string }) => (
  <Svg className={className}>
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

export const TrashIcon = ({ className = "size-5 shrink-0 text-red-600" }: { className?: string }) => (
  <Svg className={className}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />
  </Svg>
);

export const ShareIcon = ({ className }: { className?: string } = {}) => (
  <Svg className={className}>
    <circle cx="6" cy="12" r="2.2" />
    <circle cx="17" cy="6" r="2.2" />
    <circle cx="17" cy="18" r="2.2" />
    <path d="m8 11 7-4M8 13l7 4" />
  </Svg>
);

export const PrinterIcon = () => (
  <Svg>
    <path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7v-6Z" />
  </Svg>
);

export const ArchiveIcon = ({ className }: { className?: string } = {}) => (
  <Svg className={className}>
    <path d="M4 7h16v3H4V7ZM6 10v9h12v-9M10 14h4" />
  </Svg>
);

export const DevicesIcon = () => (
  <Svg>
    <rect x="3" y="5" width="13" height="10" rx="1.5" />
    <path d="M1.5 18.5h16M18 9h2.5A1.5 1.5 0 0 1 22 10.5v8a1.5 1.5 0 0 1-1.5 1.5H18a1.5 1.5 0 0 1-1.5-1.5v-8A1.5 1.5 0 0 1 18 9Z" />
  </Svg>
);
