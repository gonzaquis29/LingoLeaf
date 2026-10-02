import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { Header } from '@/components/Layout/Header'
import { ProfileLanguages } from '@/components/Profile/ProfileLanguages'
import { PageBanner } from '@/components/Layout/LanguageBanner'
import { accentStrong } from '@/lib/theme'
import { getDueCount } from '@/lib/dueCount'
import { t, uiLangFromNative } from '@/lib/i18n/t'

export default async function ProfilePage() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('native_language, learning_languages, active_lang, onboarding_completed, streak_days')
    .eq('id', userId)
    .single()
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
        <PageBanner language={profile.active_lang} title={t('nav_profile', uiLang)}>
          <p className="mt-3 flex items-center gap-2 text-[15px] font-semibold" style={{ color: accentStrong(profile.active_lang) }}>
            <span className="text-xl">🔥</span>
            {profile.streak_days}{' '}
            {profile.streak_days === 1 ? t('profile_streak_suffix_singular', uiLang) : t('profile_streak_suffix', uiLang)}
          </p>
        </PageBanner>
        <div className="mx-auto w-full max-w-[640px] px-8">
          <ProfileLanguages
            nativeLanguage={profile.native_language}
            learningLanguages={profile.learning_languages}
            activeLang={profile.active_lang}
          />
        </div>
      </main>
    </>
  )
}
