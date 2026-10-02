import { CoverScene, coverSceneFor } from '@/components/Library/CoverScenes'
import { accentBase, accentSoft, accentStrong } from '@/lib/theme'
import type { Language } from '@/types'

// Hash simple y determinístico: la misma portada (patrón + variante) sale siempre para el
// mismo texto, sin depender de estado ni de una llamada a un generador externo.
function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

// Alternativa para textos sin foto ni ilustración propia (ej. los que pega el usuario):
// cuatro composiciones abstractas para que la biblioteca no se sienta repetitiva.
function Pattern({ variant, base, strong }: { variant: number; base: string; strong: string }) {
  switch (variant) {
    case 0:
      return (
        <svg viewBox="0 0 200 130" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="40" cy="30" r="70" fill={base} opacity="0.55" />
          <circle cx="165" cy="110" r="50" fill={strong} opacity="0.35" />
        </svg>
      )
    case 1:
      return (
        <svg viewBox="0 0 200 130" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 90 Q 50 40 100 90 T 200 90 V130 H0 Z" fill={base} opacity="0.55" />
          <path d="M0 110 Q 60 70 120 110 T 200 105 V130 H0 Z" fill={strong} opacity="0.4" />
        </svg>
      )
    case 2:
      return (
        <svg viewBox="0 0 200 130" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
          <rect x="-20" y="-20" width="120" height="170" fill={base} opacity="0.5" transform="rotate(18 40 65)" />
          <rect x="120" y="-20" width="100" height="170" fill={strong} opacity="0.3" transform="rotate(-12 170 65)" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 200 130" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="0,130 90,10 200,130" fill={base} opacity="0.5" />
          <polygon points="60,130 160,50 200,130" fill={strong} opacity="0.35" />
        </svg>
      )
  }
}

export function TextCoverArt({
  textId,
  language,
  coverUrl,
  title,
}: {
  textId: string
  language: Language
  coverUrl?: string | null
  title: string
}) {
  if (coverUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- portadas subidas por usuarios, no optimizables por dominio fijo
    return <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
  }

  const scene = coverSceneFor(title)
  if (scene) return <CoverScene art={scene} />

  const hash = hashString(textId)
  const variant = hash % 4

  return (
    <div className="h-full w-full" style={{ background: accentSoft(language) }}>
      <Pattern variant={variant} base={accentBase(language)} strong={accentStrong(language)} />
    </div>
  )
}
