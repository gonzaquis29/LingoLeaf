import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { Header } from '@/components/Layout/Header'
import { PageBanner } from '@/components/Layout/LanguageBanner'
import { AddContentTabs } from '@/components/Add/AddContentTabs'
import { getDueCount } from '@/lib/dueCount'
import { t, uiLangFromNative } from '@/lib/i18n/t'

export default async function AddPage() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  // El catálogo no depende del perfil — se piden en paralelo.
  const [{ data: profile }, { data: catalogTexts }] = await Promise.all([
    supabase
      .from('profiles')
      .select('active_lang, learning_languages, onboarding_completed, streak_days, native_language')
      .eq('id', userId)
      .single(),
    supabase.from('texts').select('id, title, language, level, word_count, cover_url').eq('source_type', 'curated').order('title', { ascending: true }),
  ])
  if (!profile?.onboarding_completed || !profile.active_lang) redirect('/onboarding')
  const uiLang = uiLangFromNative(profile.native_language)

  const dueCount = await getDueCount(supabase, userId, profile.active_lang)

  return (
    <>
      <Header
        activeLang={profile.active_lang}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={dueCount}
      />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <PageBanner language={profile.active_lang} title={t('add_title', uiLang)} subtitle={t('add_subtitle', uiLang)} />
        <div className="px-8">
          <AddContentTabs activeLang={profile.active_lang} catalogTexts={catalogTexts ?? []} />
        </div>
      </main>
    </>
  )
}
