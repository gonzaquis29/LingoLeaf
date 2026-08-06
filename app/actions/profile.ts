'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionState } from '@/app/actions/auth'
import type { Language } from '@/types'

// AC US7.3: cambiar idioma nativo o agregar/quitar idiomas aprendidos.
export async function updateLanguages(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nativeLanguage = String(formData.get('native_language') ?? '') as Language
  const learningLanguages = formData.getAll('learning_languages').map(String) as Language[]

  if (!nativeLanguage) return { error: 'Elige tu idioma nativo.' }
  if (learningLanguages.length === 0) return { error: 'Elige al menos un idioma para aprender.' }

  const { data: profile } = await supabase.from('profiles').select('active_lang').eq('id', user.id).single()
  const activeStillValid = profile?.active_lang && learningLanguages.includes(profile.active_lang)

  const { error } = await supabase
    .from('profiles')
    .update({
      native_language: nativeLanguage,
      learning_languages: learningLanguages,
      active_lang: activeStillValid ? profile.active_lang : learningLanguages[0],
    })
    .eq('id', user.id)

  if (error) return { error: 'No se pudo guardar.' }
  revalidatePath('/profile')
  return undefined
}

// AC US1.7: cambiar el idioma activo desde cualquier pantalla — Perfil es donde vive el control explícito.
// Redirige a Biblioteca a propósito: si cambiás de idioma estando en el Lector de un texto en
// otro idioma, quedarte en esa misma pantalla no muestra ningún efecto del cambio y se siente
// como si el botón no hiciera nada. Biblioteca es donde el nuevo idioma activo se nota de inmediato.
export async function setActiveLang(lang: Language) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('profiles').update({ active_lang: lang }).eq('id', user.id)
  revalidatePath('/', 'layout')
  redirect('/library')
}
