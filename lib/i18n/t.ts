import { dict, type DictKey, type UiLang } from '@/lib/i18n/dict'
import type { Language } from '@/types'

// Alcance i18n (decidido con el usuario): solo inglés y español por ahora. Cualquier otro
// idioma nativo (fr/de/zh) cae a español — es el idioma en el que ya está el resto del texto
// no traducido, así que no se ve una mezcla de dos idiomas desconocidos.
export function uiLangFromNative(native?: Language | null): UiLang {
  return native === 'en' ? 'en' : 'es'
}

export function t(key: DictKey, lang: UiLang): string {
  return dict[key][lang]
}
