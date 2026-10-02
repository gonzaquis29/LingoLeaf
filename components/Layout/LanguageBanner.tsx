import type { ReactNode } from 'react'
import { COLORS, accentBase, accentSoft, accentStrong } from '@/lib/theme'
import { languageInfo } from '@/lib/languages'
import type { Language } from '@/types'

// Banner de cabecera con una ilustración propia (SVG, sin copyright) alusiva al país del idioma
// activo. Los colores salen del acento del idioma para que armonice con el resto de la pantalla;
// solo los detalles puntuales (sol, linternas, bus) usan colores fijos.
const RED = '#E5533D'
const GOLD = '#FFD25E'
const TERRACOTTA = '#D9604C'

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.85">
      <ellipse cx="0" cy="0" rx="26" ry="9" />
      <ellipse cx="-10" cy="-7" rx="14" ry="9" />
      <ellipse cx="9" cy="-9" rx="12" ry="9" />
    </g>
  )
}

function Scene({ language, base, strong }: { language: Language; base: string; strong: string }) {
  switch (language) {
    case 'zh': {
      const tiers = [0, 1, 2]
      return (
        <>
          <circle cx="330" cy="62" r="40" fill={RED} opacity="0.85" />
          <path d="M0 200 L70 112 L130 160 L205 92 L285 170 L355 122 L420 180 V200 Z" fill={base} opacity="0.32" />
          <path d="M0 200 L60 150 L120 185 L190 140 L260 190 L340 150 L420 195 V200 Z" fill={strong} opacity="0.28" />
          {[70, 108, 146].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2={30 + (i % 2) * 14} stroke={strong} strokeWidth="1.5" />
              <rect x={x - 6} y={28 + (i % 2) * 14} width="12" height="4" fill={GOLD} />
              <ellipse cx={x} cy={46 + (i % 2) * 14} rx="13" ry="15" fill={RED} />
              <rect x={x - 5} y={60 + (i % 2) * 14} width="10" height="3" fill={GOLD} />
              <line x1={x} y1={63 + (i % 2) * 14} x2={x} y2={74 + (i % 2) * 14} stroke={GOLD} strokeWidth="1.5" />
            </g>
          ))}
          <rect x="222" y="156" width="56" height="44" fill={strong} />
          {tiers.map((i) => {
            const w = 50 - i * 10
            const y = 152 - i * 34
            return (
              <g key={i}>
                <rect x={250 - w + 8} y={y} width={2 * w - 16} height="26" fill={strong} />
                <rect x={250 - 4} y={y + 8} width="8" height="14" fill={GOLD} />
                <path
                  d={`M${250 - w - 8} ${y + 4} Q${250 - w + 4} ${y + 2} ${250 - w + 10} ${y - 8} L${250 + w - 10} ${y - 8} Q${250 + w - 4} ${y + 2} ${250 + w + 8} ${y + 4} Z`}
                  fill={base}
                />
              </g>
            )
          })}
          <line x1="250" y1="42" x2="250" y2="20" stroke={strong} strokeWidth="3" />
          <circle cx="250" cy="18" r="3.5" fill={GOLD} />
          {[[20, 40], [180, 30], [200, 78], [395, 28], [372, 98], [30, 120]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 4 : 6} fill="#fff" opacity="0.9" />
          ))}
        </>
      )
    }
    case 'fr':
      return (
        <>
          <Cloud x={120} y={50} s={1.2} />
          <Cloud x={380} y={120} />
          <path d="M0 200 Q110 176 210 192 T420 184 V200 Z" fill={base} opacity="0.3" />
          <g transform="translate(350 70)">
            <ellipse cx="0" cy="0" rx="26" ry="30" fill={strong} />
            <path d="M-9 -29 Q-18 0 -6 30 H6 Q18 0 9 -29 Z" fill="#fff" />
            <rect x="-9" y="38" width="18" height="12" fill={TERRACOTTA} />
            <line x1="-8" y1="30" x2="-7" y2="38" stroke={strong} />
            <line x1="8" y1="30" x2="7" y2="38" stroke={strong} />
          </g>
          <polygon points="258,34 262,34 262,12 258,12" fill={strong} />
          <polygon points="260,34 269,118 251,118" fill={strong} />
          <polygon points="251,118 269,118 292,200 278,200 266,160 254,160 242,200 228,200" fill={strong} />
          <rect x="249" y="116" width="22" height="5" fill={base} />
          <rect x="243" y="150" width="34" height="5" fill={base} />
          <path d="M240 200 Q260 168 280 200 Z" fill={base} opacity="0.35" />
          {[[150, 150], [190, 168], [60, 170]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="5" fill={i === 1 ? GOLD : '#fff'} opacity="0.9" />
          ))}
        </>
      )
    case 'de':
      return (
        <>
          <Cloud x={100} y={46} s={1.1} />
          <Cloud x={370} y={34} s={0.9} />
          <path d="M0 200 Q120 120 250 150 T420 130 V200 Z" fill={base} opacity="0.35" />
          <path d="M0 200 Q140 158 300 176 T420 168 V200 Z" fill={strong} opacity="0.3" />
          <rect x="216" y="100" width="100" height="74" fill="#fff" opacity="0.95" />
          <rect x="216" y="100" width="100" height="74" fill={strong} opacity="0.18" />
          {[[196, 70, 30, 104, 40], [300, 56, 26, 118, 28], [254, 78, 22, 96, 30]].map(([x, y, w, h, roofH], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#fff" />
              <rect x={x} y={y} width={w} height={h} fill={strong} opacity="0.14" />
              <polygon points={`${x - 5},${y} ${x + w + 5},${y} ${x + w / 2},${y - roofH}`} fill={TERRACOTTA} />
              <rect x={x + w / 2 - 3} y={y + 12} width="6" height="12" rx="3" fill={strong} />
            </g>
          ))}
          {[236, 262, 288].map((x) => (
            <rect key={x} x={x} y="122" width="7" height="12" rx="3" fill={GOLD} />
          ))}
          {[[40, 190, 1.2], [78, 184, 1], [120, 192, 0.9], [352, 188, 1.1], [392, 182, 1.3]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <polygon points="0,-44 -13,-14 13,-14" fill={strong} />
              <polygon points="0,-30 -17,0 17,0" fill={strong} />
              <rect x="-2" y="0" width="4" height="8" fill="#6B4528" />
            </g>
          ))}
        </>
      )
    case 'en':
      return (
        <>
          <Cloud x={120} y={54} s={1.2} />
          <Cloud x={380} y={44} s={0.9} />
          <path d="M0 200 Q130 182 230 192 T420 186 V200 Z" fill={base} opacity="0.3" />
          <rect x="196" y="150" width="130" height="50" fill={strong} opacity="0.55" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={206 + i * 24} y="162" width="10" height="16" fill={GOLD} opacity="0.85" />
          ))}
          <polygon points="232,64 308,64 270,14" fill={strong} />
          <line x1="270" y1="14" x2="270" y2="2" stroke={strong} strokeWidth="2.5" />
          <rect x="244" y="64" width="52" height="92" fill={strong} />
          <rect x="238" y="148" width="64" height="10" fill={strong} />
          <circle cx="270" cy="92" r="17" fill="#fff" />
          <circle cx="270" cy="92" r="17" fill="none" stroke={GOLD} strokeWidth="3" />
          <path d="M270 92 V80 M270 92 L279 97" stroke={strong} strokeWidth="2.2" strokeLinecap="round" />
          {[112, 126, 140].map((y) => (
            <rect key={y} x="256" y={y} width="28" height="6" rx="3" fill={base} opacity="0.7" />
          ))}
          <g transform="translate(332 158)">
            <rect x="0" y="0" width="76" height="30" rx="6" fill={RED} />
            <rect x="0" y="0" width="76" height="30" rx="6" fill="none" />
            {[8, 26, 44, 62].map((x) => (
              <rect key={x} x={x} y="5" width="10" height="9" fill="#fff" opacity="0.9" />
            ))}
            <circle cx="16" cy="32" r="6" fill="#2B2F36" />
            <circle cx="60" cy="32" r="6" fill="#2B2F36" />
          </g>
        </>
      )
    case 'es':
    default:
      return (
        <>
          <circle cx="316" cy="70" r="46" fill={GOLD} opacity="0.55" />
          <circle cx="316" cy="70" r="32" fill={GOLD} />
          <path d="M0 200 Q120 176 240 192 T420 182 V200 Z" fill={base} opacity="0.28" />
          {[[24, 150, 56], [96, 138, 50], [330, 144, 60], [394, 152, 40]].map(([x, y, w], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={200 - y} fill="#fff" />
              <rect x={x} y={y} width={w} height={200 - y} fill={strong} opacity="0.08" />
              <polygon points={`${x - 5},${y} ${x + w + 5},${y} ${x + w / 2},${y - 16}`} fill={TERRACOTTA} />
              <rect x={x + w / 2 - 5} y={y + 14} width="10" height="14" rx="5" fill={strong} opacity="0.7" />
            </g>
          ))}
          <rect x="220" y="56" width="44" height="144" fill="#fff" />
          <rect x="220" y="56" width="44" height="144" fill={strong} opacity="0.1" />
          <polygon points="214,56 270,56 242,24" fill={TERRACOTTA} />
          <path d="M232 94 a10 10 0 0 1 20 0 v20 h-20 z" fill={strong} />
          <circle cx="242" cy="90" r="3" fill={GOLD} />
          <rect x="232" y="132" width="20" height="26" rx="10" fill={strong} opacity="0.7" />
          <g transform="translate(168 200)">
            <path d="M0 0 Q-4 -50 4 -86" stroke="#6B4528" strokeWidth="5" fill="none" strokeLinecap="round" />
            {[-60, -25, 10, 45, 80].map((r) => (
              <path key={r} d="M4 -86 q22 -4 34 14" stroke={strong} strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${r} 4 -86)`} />
            ))}
          </g>
        </>
      )
  }
}

export function LanguageBanner({
  language,
  children,
  className = '',
}: {
  language: Language
  children: ReactNode
  className?: string
}) {
  const base = accentBase(language)
  const strong = accentStrong(language)
  return (
    <div className={`relative overflow-hidden px-8 py-9 ${className}`} style={{ background: accentSoft(language), minHeight: 196 }}>
      <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d="M0 200 V150 Q160 108 330 150 T660 138 T1000 118 V200 Z" fill={base} opacity="0.16" />
        <path d="M0 200 V176 Q200 146 420 176 T820 166 T1000 160 V200 Z" fill={strong} opacity="0.1" />
      </svg>
      <svg
        viewBox="0 0 420 200"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 hidden h-full sm:block"
        style={{
          aspectRatio: '420 / 200',
          maskImage: 'linear-gradient(to right, transparent 0%, #000 22%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 22%)',
        }}
      >
        <Scene language={language} base={base} strong={strong} />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Cabecera estándar de cada pantalla: etiqueta del idioma activo + título (+ subtítulo opcional).
// Todas las pantallas la usan para verse igual; `children` permite sumar contenido propio (p. ej. la racha).
export function PageBanner({
  language,
  title,
  subtitle,
  eyebrow,
  children,
  className = 'mb-8',
}: {
  language: Language
  title: string
  subtitle?: string
  eyebrow?: string
  children?: ReactNode
  className?: string
}) {
  const info = languageInfo(language)
  return (
    <LanguageBanner language={language} className={className}>
      <p
        className="font-jakarta mb-1.5 text-[11px] font-bold uppercase"
        style={{ letterSpacing: '0.08em', color: accentStrong(language) }}
      >
        {eyebrow ?? (info && `${info.flag} ${info.label}`)}
      </p>
      <h1
        className="font-jakarta"
        style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: COLORS.ink }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-[15px]" style={{ color: COLORS.muted }}>
          {subtitle}
        </p>
      )}
      {children}
    </LanguageBanner>
  )
}
