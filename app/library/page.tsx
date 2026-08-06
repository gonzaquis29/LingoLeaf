import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/Layout/Header'
import { languageInfo } from '@/lib/languages'
import { tokenizeText } from '@/lib/tokenize'
import { getDueCount } from '@/lib/dueCount'
import { COLORS, CARD_RADIUS, accentBase, accentStrong, pctInfo } from '@/lib/theme'

export default async function LibraryPage() {
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
  const activeLang = profile.active_lang

  // Tres consultas independientes entre sí — en paralelo, no una tras otra.
  const [{ data: texts }, { data: knownRows }, dueCount] = await Promise.all([
    supabase
      .from('texts')
      .select('id, title, content, level, word_count')
      .eq('language', activeLang)
      .order('created_at', { ascending: true }),
    supabase.from('vocabulary').select('word').eq('user_id', user.id).eq('language', activeLang).eq('status', 'known'),
    getDueCount(supabase, user.id, activeLang),
  ])
  const knownSet = new Set(knownRows?.map((w) => w.word.toLowerCase()))

  const active = languageInfo(activeLang)
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
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-8 pb-20 pt-8">
        <h1 className="font-jakarta mb-5" style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink }}>
          Biblioteca {active ? `· ${active.flag} ${active.label}` : ''}
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/add"
            className="lf-tap flex min-h-[230px] flex-col items-center justify-center gap-2.5"
            style={{ border: `2px dashed ${accent}`, borderRadius: CARD_RADIUS, background: 'oklch(95% 0.05 264)' }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-white"
              style={{ background: accent }}
            >
              +
            </span>
            <span className="text-sm font-bold" style={{ color: accentStrongColor }}>
              Agregar contenido
            </span>
          </Link>

          {texts?.map((text) => {
            const wordTokens = tokenizeText(text.content, activeLang).tokens.filter((t) => t.isWordLike)
            const uniqueWords = new Set(wordTokens.map((t) => t.text.toLowerCase()))
            const knownCount = [...uniqueWords].filter((w) => knownSet.has(w)).length
            const knownPct = uniqueWords.size ? Math.round((knownCount / uniqueWords.size) * 100) : 0
            const info = pctInfo(knownPct)

            return (
              <div
                key={text.id}
                className="flex flex-col overflow-hidden"
                style={{ background: COLORS.creamCard, borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)' }}
              >
                <div className="flex h-[130px] items-center justify-center" style={{ background: 'oklch(95% 0.05 264)' }}>
                  <span
                    className="rounded px-2.5 py-1 text-[11px]"
                    style={{ fontFamily: 'ui-monospace,monospace', color: accentStrongColor, background: '#fff' }}
                  >
                    portada del texto
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 px-[18px] pb-5 pt-[18px]">
                  <h3 className="font-jakarta" style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
                    {text.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[12.5px]" style={{ color: COLORS.muted }}>
                    <span>Nivel {text.level}</span>
                    <span>·</span>
                    <span>{text.word_count} palabras</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-[9px] w-[9px] rounded-full" style={{ background: info.color }} />
                    <span className="text-[13px] font-semibold" style={{ color: info.color }}>
                      {knownPct}% conocido · {info.label}
                    </span>
                  </div>
                  <Link
                    href={`/reader/${text.id}`}
                    className="lf-tap font-jakarta mt-1.5 w-full rounded-full py-2.5 text-center text-sm font-bold text-white"
                    style={{ background: accent }}
                  >
                    Leer
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
