import { franc } from 'franc-min'
import type { Language } from '@/types'

const FRANC_TO_APP: Record<string, Language> = {
  fra: 'fr',
  deu: 'de',
  eng: 'en',
  spa: 'es',
  cmn: 'zh',
}

// franc-min es un detector offline por trigramas (sin API, sin costo) — necesita ~10 caracteres
// para ser confiable; con menos, o si detecta un idioma que la app no soporta, usa el fallback.
export function detectLanguage(text: string, fallback: Language = 'en'): Language {
  const code = franc(text, { minLength: 10 })
  return FRANC_TO_APP[code] ?? fallback
}
