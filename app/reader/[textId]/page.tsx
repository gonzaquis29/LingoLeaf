import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from '@/lib/supabase/auth'
import { Header } from '@/components/Layout/Header'
import { InteractiveText } from '@/components/Reader/InteractiveText'
import { GrammarPanel } from '@/components/Reader/GrammarPanel'
import { ComprehensionQuiz } from '@/components/Reader/ComprehensionQuiz'
import { tokenizeText } from '@/lib/tokenize'
import { getDueCount } from '@/lib/dueCount'
import { COLORS, accentBase } from '@/lib/theme'
import { t, uiLangFromNative } from '@/lib/i18n/t'
import type { WordStatus } from '@/types'

export default async function ReaderPage({ params }: { params: Promise<{ textId: string }> }) {
  const { textId } = await params
  const supabase = await createClient()
  const userId = await getUserId(supabase)
  if (!userId) redirect('/login')

  // Perfil y texto no dependen entre sí — en paralelo.
  const [{ data: profile }, { data: text }] = await Promise.all([
    supabase
      .from('profiles')
      .select('active_lang, native_language, learning_languages, streak_days, onboarding_completed')
      .eq('id', userId)
      .single(),
    supabase.from('texts').select('id, title, content, language, level').eq('id', textId).maybeSingle(),
  ])
  if (!profile?.onboarding_completed) redirect('/onboarding')
  if (!text) notFound()
  const uiLang = uiLangFromNative(profile.native_language)

  const { sentences, tokens } = tokenizeText(text.content, text.language)

  // Estas cuatro sí dependen del texto (idioma/id), pero no entre sí — también en paralelo.
  const [{ data: vocabRows }, { data: grammarPoints }, { data: comprehensionQuestions }, dueCount] = await Promise.all([
    supabase.from('vocabulary').select('id, word, translation, status, repetitions').eq('user_id', userId).eq('language', text.language),
    supabase
      .from('grammar_points')
      .select('id, text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index, created_at')
      .eq('text_id', text.id)
      .order('sentence_index', { ascending: true }),
    supabase
      .from('comprehension_questions')
      .select('id, question, options, correct_index')
      .eq('text_id', text.id)
      .order('position', { ascending: true }),
    getDueCount(supabase, userId, text.language),
  ])

  const initialVocab: Record<string, { id: string; translation: string; status: WordStatus; repetitions: number }> = {}
  vocabRows?.forEach((v) => {
    initialVocab[v.word.toLowerCase()] = {
      id: v.id,
      translation: v.translation,
      status: v.status as WordStatus,
      repetitions: v.repetitions,
    }
  })

  return (
    <>
      <Header
        activeLang={profile.active_lang ?? undefined}
        learningLanguages={profile.learning_languages}
        streakDays={profile.streak_days}
        dueCount={dueCount}
      />
      <main className="mx-auto flex w-full max-w-[1180px] flex-1 gap-10 px-8 pb-20 pt-8">
        <div className="min-w-0 flex-1">
          <p
            className="font-jakarta mb-1.5 text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.08em', color: accentBase(text.language) }}
          >
            {t('reader_level', uiLang)} {text.level}
          </p>
          <h1
            className="font-jakarta mb-7"
            style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: COLORS.ink }}
          >
            {text.title}
          </h1>
          <InteractiveText
            sentences={sentences}
            tokens={tokens}
            language={text.language}
            nativeLanguage={profile.native_language}
            textId={text.id}
            initialVocab={initialVocab}
          />
          <ComprehensionQuiz questions={comprehensionQuestions ?? []} language={text.language} />
        </div>
        {grammarPoints && grammarPoints.length > 0 && <GrammarPanel points={grammarPoints} />}
      </main>
    </>
  )
}
