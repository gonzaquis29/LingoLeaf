import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { Header } from '@/components/Layout/Header'
import { PageBanner } from '@/components/Layout/LanguageBanner'
import { ReviewSession } from '@/components/Review/ReviewSession'
import { t, uiLangFromNative } from '@/lib/i18n/t'

export default async function ReviewPage() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_lang, learning_languages, onboarding_completed, streak_days, native_language')
    .eq('id', userId)
    .single()
  if (!profile?.onboarding_completed || !profile.active_lang) redirect('/onboarding')
  const uiLang = uiLangFromNative(profile.native_language)

  const { data: cards } = await supabase
    .from('vocabulary')
    .select('id, word, translation, context, ease_factor, interval_days, repetitions')
    .eq('user_id', userId)
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
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <PageBanner language={profile.active_lang} title={t('review_eyebrow', uiLang)} />
        <div className="mx-auto w-full max-w-[860px] px-8">
          <ReviewSession cards={cards ?? []} language={profile.active_lang} />
        </div>
      </main>
    </>
  )
}
