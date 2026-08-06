export function Logo({ accent = '#14181C' }: { accent?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16 4C25 8 27 18 16 28C5 18 7 8 16 4Z" fill={accent} />
        <path
          d="M16 9V24M16 15L11 11M16 21L21 17"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-jakarta text-[19px] font-extrabold" style={{ color: '#14181C' }}>
        Lingoleaf
      </span>
    </div>
  )
}
