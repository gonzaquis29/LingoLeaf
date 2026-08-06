import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Layout/Header'
import { VocabList } from '@/components/Vocabulary/VocabList'
import { getDueCount } from '@/lib/dueCount'
import { COLORS } from '@/lib/theme'

export default async function VocabularyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_lang, learning_languages, onboarding_completed, streak_days')
    .eq('id', user.id)
    .single()
  if (!profile?.onboarding_completed || !profile.active_lang) redirect('/onboarding')

  const [{ data: words }, dueCount] = await Promise.all([
    supabase
      .from('vocabulary')
      .select('id, word, translation, context, language, status, repetitions, due_date, created_at')
      .eq('user_id', user.id)
      .eq('language', profile.active_lang)
      .order('created_at', { ascending: false }),
    getDueCount(supabase, user.id, profile.active_lang),
  ])

  return (
    <>
      <Header
        activeLang={profile.active_lang}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={dueCount}
      />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-8 pb-20 pt-8">
        <h1 className="font-jakarta mb-6" style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink }}>
          Vocabulario
        </h1>
        <VocabList words={words ?? []} language={profile.active_lang} />
      </main>
    </>
  )
}
