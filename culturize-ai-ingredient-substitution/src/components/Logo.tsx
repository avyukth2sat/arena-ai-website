export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <clipPath id="culturize-bowl">
          <path d="M6 22h36a18 18 0 0 1-36 0Z" />
        </clipPath>
      </defs>
      <path d="M6 22h36a18 18 0 0 1-36 0Z" fill="#C4462A" />
      <g clipPath="url(#culturize-bowl)" stroke="#EFA23A" strokeWidth="2" strokeLinecap="round">
        <path d="M24 22v18" />
        <path d="M15 22c0 8 4 14 9 18" />
        <path d="M33 22c0 8-4 14-9 18" />
        <path d="M4 30h40" />
      </g>
      <path d="M4.5 22h39" stroke="#211A15" strokeWidth="2.5" strokeLinecap="round" />
      <g stroke="#2F6A4D" strokeWidth="2.4" strokeLinecap="round">
        <path d="M17 16c-2.2-2 2.2-4 0-6.5" />
        <path d="M24 16c-2.2-2 2.2-4 0-6.5" />
        <path d="M31 16c-2.2-2 2.2-4 0-6.5" />
      </g>
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`font-display text-[1.55rem] font-semibold tracking-tight ${inverted ? "text-cream" : "text-ink"}`}>
        Cultur<span className="text-paprika">ize</span>
      </span>
    </span>
  );
}
