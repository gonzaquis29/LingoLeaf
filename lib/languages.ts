import type { Language } from '@/types'

// Fuente única de verdad para nombre + bandera por idioma — reutilizada en Onboarding,
// el selector de idioma activo (US1.7) y cualquier lugar que liste idiomas.
export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Francés', flag: '🇫🇷' },
  { code: 'de', label: 'Alemán', flag: '🇩🇪' },
  { code: 'en', label: 'Inglés', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: 'Chino', flag: '🇨🇳' },
]

export function languageInfo(code: Language) {
  return LANGUAGES.find((l) => l.code === code)
}
