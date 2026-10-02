import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { Header } from '@/components/Layout/Header'
import { PageBanner } from '@/components/Layout/LanguageBanner'
import { VocabList } from '@/components/Vocabulary/VocabList'
import { getDueCount } from '@/lib/dueCount'
import { t, uiLangFromNative } from '@/lib/i18n/t'

export default async function VocabularyPage() {
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

  const [{ data: words }, dueCount] = await Promise.all([
    supabase
      .from('vocabulary')
      .select('id, word, translation, context, language, status, repetitions, due_date, created_at')
      .eq('user_id', userId)
      .eq('language', profile.active_lang)
      .order('created_at', { ascending: false }),
    getDueCount(supabase, userId, profile.active_lang),
  ])

  return (
    <>
      <Header
        activeLang={profile.active_lang}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={dueCount}
      />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <PageBanner language={profile.active_lang} title={t('vocab_title', uiLang)} />
        <div className="mx-auto w-full max-w-[860px] px-8">
          <VocabList words={words ?? []} language={profile.active_lang} />
        </div>
      </main>
    </>
  )
}
