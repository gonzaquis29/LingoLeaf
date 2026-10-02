'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { schedule, newCardState } from '@/lib/srs'
import type { Language, Grade } from '@/types'

// AC US4.x / US12.1 (guardar desde el Lector) y US5.5 (agregar palabra suelta desde Vocabulario) —
// misma lógica: si la palabra ya existe para este usuario+idioma, no se toca (no resetea su progreso
// de SRS); si no existe, se crea con el estado inicial de una tarjeta nueva.
export async function saveWord(input: {
  word: string
  translation: string
  context?: string
  language: Language
  textId?: string
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const word = input.word.trim()
  if (!word || !input.translation.trim()) return { error: 'Falta la palabra o la traducción.' }

  const { data: existing } = await supabase
    .from('vocabulary')
    .select('id')
    .eq('user_id', user.id)
    .eq('word', word)
    .eq('language', input.language)
    .maybeSingle()

  if (existing) return { id: existing.id }

  const card = newCardState()
  const { data: inserted, error } = await supabase
    .from('vocabulary')
    .insert({
      user_id: user.id,
      word,
      translation: input.translation.trim(),
      context: input.context,
      language: input.language,
      text_id: input.textId,
      ...card,
    })
    .select('id')
    .single()

  if (error) return { error: 'No se pudo guardar la palabra.' }
  return { id: inserted.id }
}

// "Ya la sé" en la burbuja del Lector — salto directo a 'known' sin pasar por el ciclo de
// repaso, para palabras que el usuario ya domina de entrada. Mismo umbral que schedule()
// usa para considerar una tarjeta 'known' (interval_days >= 21).
export async function markWordKnown(input: {
  word: string
  translation: string
  context?: string
  language: Language
  textId?: string
}): Promise<{ error?: string; id?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const word = input.word.trim()
  if (!word || !input.translation.trim()) return { error: 'Falta la palabra o la traducción.' }

  const knownState = {
    ease_factor: 2.5,
    interval_days: 21,
    repetitions: 4,
    due_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    status: 'known' as const,
  }

  const { data: existing } = await supabase
    .from('vocabulary')
    .select('id')
    .eq('user_id', user.id)
    .eq('word', word)
    .eq('language', input.language)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('vocabulary').update(knownState).eq('id', existing.id)
    if (error) return { error: 'No se pudo actualizar.' }
    return { id: existing.id }
  }

  const { data: inserted, error } = await supabase
    .from('vocabulary')
    .insert({
      user_id: user.id,
      word,
      translation: input.translation.trim(),
      context: input.context,
      language: input.language,
      text_id: input.textId,
      ...knownState,
    })
    .select('id')
    .single()

  if (error) return { error: 'No se pudo guardar la palabra.' }
  return { id: inserted.id }
}

// Deshacer: el usuario puede quitar una palabra de su repaso en cualquier momento, desde la
// burbuja del Lector o desde Vocabulario — cumple con la heurística de Nielsen de control y
// libertad del usuario (ninguna acción de "agregar" queda sin forma de revertirse).
export async function removeWord(vocabId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('vocabulary').delete().eq('id', vocabId).eq('user_id', user.id)
  if (error) return { error: 'No se pudo quitar la palabra.' }
  return {}
}

// AC US6.x: aplica SM-2 (schedule()) y persiste el nuevo estado de la tarjeta.
export async function reviewWord(vocabId: string, grade: Grade): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: card } = await supabase
    .from('vocabulary')
    .select('ease_factor, interval_days, repetitions')
    .eq('id', vocabId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!card) return { error: 'Tarjeta no encontrada.' }

  const result = schedule(card, grade)

  const { error } = await supabase
    .from('vocabulary')
    .update({ ...result, last_reviewed_at: new Date().toISOString() })
    .eq('id', vocabId)
    .eq('user_id', user.id)

  if (error) return { error: 'No se pudo guardar el repaso.' }
  return {}
}
