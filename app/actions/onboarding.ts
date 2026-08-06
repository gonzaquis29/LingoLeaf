'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionState } from '@/app/actions/auth'
import type { Language } from '@/types'

// AC US1.2: idioma nativo único + idiomas a aprender (mínimo 1).
// AC US1.7: el primer idioma a aprender elegido queda como idioma activo inicial.
export async function saveLanguages(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nativeLanguage = String(formData.get('native_language') ?? '') as Language
  const learningLanguages = formData.getAll('learning_languages').map(String) as Language[]

  if (!nativeLanguage) return { error: 'Elige tu idioma nativo.' }
  if (learningLanguages.length === 0) return { error: 'Elige al menos un idioma para aprender.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      native_language: nativeLanguage,
      learning_languages: learningLanguages,
      active_lang: learningLanguages[0],
    })
    .eq('id', user.id)

  if (error) return { error: 'No se pudo guardar. Intenta de nuevo.' }

  redirect('/onboarding/tutorial')
}

// AC US1.6: se dispara solo la primera vez — flag en el perfil que no vuelve a activarse.
export async function completeOnboarding() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)

  redirect('/library')
}
