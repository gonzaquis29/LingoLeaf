import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Layout/Header'
import { ReviewSession } from '@/components/Review/ReviewSession'
import { COLORS } from '@/lib/theme'

export default async function ReviewPage() {
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

  const { data: cards } = await supabase
    .from('vocabulary')
    .select('id, word, translation, context, ease_factor, interval_days, repetitions')
    .eq('user_id', user.id)
    .eq('language', profile.active_lang)
    .lte('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  return (
    <>
      <Header
        activeLang={profile.active_lang}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={cards?.length ?? 0}
      />
      <main className="mx-auto w-full max-w-[860px] flex-1 px-8 pb-20 pt-10">
        <h1 className="font-jakarta mb-8 text-center" style={{ fontSize: 24, fontWeight: 800, color: COLORS.ink }}>
          Repaso
        </h1>
        <ReviewSession cards={cards ?? []} language={profile.active_lang} />
      </main>
    </>
  )
}
