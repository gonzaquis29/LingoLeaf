import { after } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Language } from '@/types'

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get'

// Caché-primero: MyMemory tiene cuota diaria chica compartida por IP, así que cada palabra
// se traduce una sola vez por par de idiomas y queda servida desde translations_cache después.
export async function translateWord(
  word: string,
  sourceLang: Language,
  targetLang: Language
): Promise<string> {
  const supabase = createAdminClient()
  const key = word.toLowerCase()

  const { data: cached } = await supabase
    .from('translations_cache')
    .select('translation')
    .eq('word', key)
    .eq('source_lang', sourceLang)
    .eq('target_lang', targetLang)
    .maybeSingle()

  if (cached) return cached.translation

  const res = await fetch(
    `${MYMEMORY_URL}?q=${encodeURIComponent(word)}&langpair=${sourceLang}|${targetLang}`
  )
  const data = await res.json()
  const translation: string = data.responseData?.translatedText ?? ''

  if (translation) {
    // La escritura al caché no bloquea la respuesta: el usuario ya tiene su traducción.
    after(async () => {
      await supabase
        .from('translations_cache')
        .upsert(
          { word: key, source_lang: sourceLang, target_lang: targetLang, translation },
          { onConflict: 'word,source_lang,target_lang' }
        )
    })
  }

  return translation
}
