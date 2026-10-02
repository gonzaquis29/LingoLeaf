import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { Header } from '@/components/Layout/Header'
import { PageBanner } from '@/components/Layout/LanguageBanner'
import { LibraryGrid } from '@/components/Library/LibraryGrid'
import { tokenizeText } from '@/lib/tokenize'
import { getDueCount } from '@/lib/dueCount'
import { accentBase, accentStrong, pctInfo } from '@/lib/theme'
import { t, uiLangFromNative } from '@/lib/i18n/t'

export default async function LibraryPage() {
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('active_lang, learning_languages, onboarding_completed, streak_days, native_language')
    .eq('id', userId)
    .single()

  if (!profile?.onboarding_completed || !profile.active_lang) redirect('/onboarding')
  const activeLang = profile.active_lang
  const uiLang = uiLangFromNative(profile.native_language)

  // Tres consultas independientes entre sí — en paralelo, no una tras otra.
  const [{ data: texts }, { data: knownRows }, dueCount] = await Promise.all([
    supabase
      .from('texts')
      .select('id, title, content, level, word_count, cover_url')
      .eq('language', activeLang)
      .order('created_at', { ascending: true }),
    supabase.from('vocabulary').select('word').eq('user_id', userId).eq('language', activeLang).eq('status', 'known'),
    getDueCount(supabase, userId, activeLang),
  ])
  const knownSet = new Set(knownRows?.map((w) => w.word.toLowerCase()))

  const accent = accentBase(activeLang)
  const accentStrongColor = accentStrong(activeLang)

  return (
    <>
      <Header
        activeLang={activeLang}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={dueCount}
      />
      <main className="mx-auto w-full max-w-[1180px] flex-1 pb-20">
        <PageBanner language={activeLang} title={t('library_title', uiLang)} />

        <LibraryGrid
          texts={(texts ?? []).map((text) => {
            const wordTokens = tokenizeText(text.content, activeLang).tokens.filter((tok) => tok.isWordLike)
            const uniqueWords = new Set(wordTokens.map((tok) => tok.text.toLowerCase()))
            const knownCount = [...uniqueWords].filter((w) => knownSet.has(w)).length
            const knownPct = uniqueWords.size ? Math.round((knownCount / uniqueWords.size) * 100) : 0
            const info = pctInfo(knownPct)
            return {
              id: text.id,
              title: text.title,
              level: text.level,
              word_count: text.word_count,
              cover_url: text.cover_url,
              knownPct,
              pctColor: info.color,
              pctLabel: t(info.labelKey, uiLang),
            }
          })}
          language={activeLang}
          accent={accent}
          accentStrongColor={accentStrongColor}
        />
      </main>
    </>
  )
}
