'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { tokenizeText } from '@/lib/tokenize'
import { detectLevel } from '@/lib/level'
import type { Language, Level } from '@/types'

const MIN_WORDS = 15

export type AddTextState = { error: string } | undefined

// AC US3.1 (pegar texto) y US3.2 (confirmar el preview extraído de una URL) comparten esta acción —
// ambas terminan guardando un texto propio con el mismo contrato.
export async function addText(_prev: AddTextState, formData: FormData): Promise<AddTextState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const language = String(formData.get('language') ?? '') as Language
  const levelInput = String(formData.get('level') ?? 'auto')

  if (!title) return { error: 'Ponle un título al texto.' }
  if (!language) return { error: 'Elige el idioma del texto.' }
  if (!content) return { error: 'El contenido no puede estar vacío.' }

  const { tokens } = tokenizeText(content, language)
  const wordCount = tokens.filter((t) => t.isWordLike).length

  if (wordCount < MIN_WORDS) {
    return { error: `El texto necesita al menos ${MIN_WORDS} palabras (tiene ${wordCount}).` }
  }

  const level = (levelInput === 'auto' ? detectLevel(content, wordCount) : levelInput) as Level

  const { error } = await supabase.from('texts').insert({
    title,
    content,
    language,
    level,
    source: 'user',
    word_count: wordCount,
    owner_id: user.id,
    is_public: false,
    source_type: 'user',
  })

  if (error) return { error: 'No se pudo guardar el texto.' }
  redirect('/library')
}
