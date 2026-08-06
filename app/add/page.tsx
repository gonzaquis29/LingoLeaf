import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Layout/Header'
import { AddContentTabs } from '@/components/Add/AddContentTabs'
import { getDueCount } from '@/lib/dueCount'
import { COLORS } from '@/lib/theme'

export default async function AddPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // El catálogo no depende del perfil — se piden en paralelo.
  const [{ data: profile }, { data: catalogTexts }] = await Promise.all([
    supabase
      .from('profiles')
      .select('active_lang, learning_languages, onboarding_completed, streak_days')
      .eq('id', user.id)
      .single(),
    supabase.from('texts').select('id, title, language, level, word_count').eq('source_type', 'curated').order('title', { ascending: true }),
  ])
  if (!profile?.onboarding_completed || !profile.active_lang) redirect('/onboarding')

  const dueCount = await getDueCount(supabase, user.id, profile.active_lang)

  return (
    <>
      <Header
        activeLang={profile.active_lang}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={dueCount}
      />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-8 pb-20 pt-8">
        <h1 className="font-jakarta mb-6" style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink }}>
          Agregar contenido
        </h1>
        <AddContentTabs activeLang={profile.active_lang} catalogTexts={catalogTexts ?? []} />
      </main>
    </>
  )
}
