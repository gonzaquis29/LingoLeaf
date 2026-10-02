import type { Language } from '@/types'

// Portado 1:1 desde LingoLeaf-vf.html (el prototipo validado) — misma identidad visual,
// no una reinterpretación. Cualquier cambio de color debe hacerse ahí primero.
export const COLORS = {
  ink: '#14181C',
  moss900: '#14181C',
  mossMid: 'oklch(55% 0.15 145)',
  mossSoft: '#F1F2F4',
  cream: '#FFFFFF',
  creamCard: '#FAFAFB',
  muted: '#6B6E76',
  stateNew: 'oklch(58% 0.20 25)',
  stateLearning: 'oklch(68% 0.16 70)',
  stateKnown: 'oklch(55% 0.15 145)',
  stateNewSoft: 'oklch(94% 0.05 25)',
  stateLearningSoft: 'oklch(94% 0.05 70)',
  stateKnownSoft: 'oklch(93% 0.045 145)',
} as const

const ACCENT_HUES: Record<Language, number> = { fr: 264, zh: 22, de: 100, en: 190, es: 330 }

export function accentBase(code?: Language): string {
  return `oklch(58% 0.19 ${code ? ACCENT_HUES[code] : 264})`
}
export function accentSoft(code?: Language): string {
  return `oklch(95% 0.05 ${code ? ACCENT_HUES[code] : 264})`
}
export function accentStrong(code?: Language): string {
  return `oklch(40% 0.15 ${code ? ACCENT_HUES[code] : 264})`
}

// Radio asimétrico (una esquina recta) — la firma "menos rectangular" del prototipo,
// usada en tarjetas y paneles flotantes.
export const CARD_RADIUS = '28px 28px 28px 10px'

// Fórmula exacta de LingoLeaf-vf.html: el subrayado de una palabra "aprendiendo" se hace
// más oscuro a medida que sube de nivel (1-4).
export function learningShade(level: number): string {
  return `oklch(${78 - (level || 1) * 4}% 0.16 70)`
}

// Resaltado de fondo (no subrayado) para palabras "aprendiendo": se va aclarando con cada
// nivel (1-4), acercándose visualmente al blanco (= sin marca = conocida) a medida que se domina.
export function learningHighlight(level: number): string {
  const lvl = Math.min(Math.max(level || 1, 1), 4)
  return `oklch(${82 + lvl * 4}% ${0.09 - lvl * 0.015} 70)`
}

// AC US2.2: el % de palabras conocidas es el criterio principal para elegir qué leer —
// mismos umbrales que LingoLeaf-vf.html. Devuelve una key de i18n, no el texto ya traducido,
// porque este helper también se llama desde Server Components sin acceso directo al hook de i18n.
export function pctInfo(pct: number): { labelKey: 'pct_very_hard' | 'pct_challenging' | 'pct_ideal' | 'pct_mastered'; color: string } {
  if (pct < 70) return { labelKey: 'pct_very_hard', color: COLORS.stateNew }
  if (pct < 90) return { labelKey: 'pct_challenging', color: COLORS.stateLearning }
  if (pct < 98) return { labelKey: 'pct_ideal', color: COLORS.mossMid }
  return { labelKey: 'pct_mastered', color: COLORS.moss900 }
}

// Estilo de pill de tab/filtro reusado en Agregar contenido, Vocabulario y Repaso.
export function pillButtonStyle(active: boolean, color: string = COLORS.stateNew) {
  return {
    padding: '8px 16px',
    borderRadius: 100,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    border: active ? '1px solid transparent' : '1px solid rgba(30,42,32,0.16)',
    background: active ? color : '#fff',
    color: active ? '#fff' : COLORS.ink,
  } as const
}
