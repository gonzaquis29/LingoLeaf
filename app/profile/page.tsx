import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Layout/Header'
import { ProfileLanguages } from '@/components/Profile/ProfileLanguages'
import { getDueCount } from '@/lib/dueCount'
import { COLORS, CARD_RADIUS } from '@/lib/theme'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('native_language, learning_languages, active_lang, onboarding_completed, streak_days')
    .eq('id', user.id)
    .single()
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
      <main className="mx-auto w-full max-w-[640px] flex-1 px-8 pb-20 pt-8">
        <h1 className="font-jakarta mb-6" style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink }}>
          Perfil
        </h1>

        <div
          className="mb-8 flex items-center gap-4 p-5"
          style={{ background: 'oklch(92% 0.05 40)', borderRadius: CARD_RADIUS }}
        >
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-jakarta" style={{ fontSize: 22, fontWeight: 800, color: 'oklch(42% 0.14 40)' }}>
              {profile.streak_days} día{profile.streak_days === 1 ? '' : 's'}
            </p>
            <p className="text-sm" style={{ color: 'oklch(42% 0.14 40)' }}>
              de racha usando Lingoleaf
            </p>
          </div>
        </div>

        <ProfileLanguages nativeLanguage={profile.native_language} learningLanguages={profile.learning_languages} />
      </main>
    </>
  )
}
