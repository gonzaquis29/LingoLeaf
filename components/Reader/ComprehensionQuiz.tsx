'use client'

import { useState } from 'react'
import { COLORS, CARD_RADIUS, accentBase } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { Language } from '@/types'

interface Question {
  id: string
  question: string
  options: string[]
  correct_index: number
}

// Quiz de comprensión sobre el texto completo — distinto del quiz de gramática (GrammarPanel),
// que está anclado a una oración específica. Sin puntos ni moneda (Épica 9): el resultado es
// informativo ("cuánto entendiste"), no una recompensa que acumular.
export function ComprehensionQuiz({ questions, language }: { questions: Question[]; language: Language }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const accent = accentBase(language)

  if (questions.length === 0) return null

  function reset() {
    setOpen(false)
    setIndex(0)
    setSelected(null)
    setCorrectCount(0)
  }

  if (!open) {
    return (
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-jakarta rounded-full px-6 py-3 text-sm font-bold text-white"
          style={{ background: accent }}
        >
          {t('quiz_start_cta')}
        </button>
      </div>
    )
  }

  if (index >= questions.length) {
    return (
      <div
        className="mx-auto mt-6 text-center"
        style={{ maxWidth: 480, background: COLORS.creamCard, borderRadius: CARD_RADIUS, padding: '32px 28px', border: '1px solid rgba(20,24,28,0.08)' }}
      >
        <h3 className="font-jakarta mb-2" style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
          {correctCount}/{questions.length} {t('quiz_correct_suffix')}
        </h3>
        <p className="text-sm" style={{ color: COLORS.muted }}>
          {correctCount === questions.length ? t('quiz_all_correct') : t('quiz_retry_hint')}
        </p>
        <button type="button" onClick={reset} className="mt-4 text-sm underline" style={{ color: COLORS.muted }}>
          {t('quiz_close')}
        </button>
      </div>
    )
  }

  const current = questions[index]
  const isLast = index === questions.length - 1

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correct_index) setCorrectCount((c) => c + 1)
  }

  function handleNext() {
    setSelected(null)
    setIndex((i) => i + 1)
  }

  return (
    <div
      className="mx-auto mt-6"
      style={{ maxWidth: 480, background: COLORS.creamCard, borderRadius: CARD_RADIUS, padding: 28, border: '1px solid rgba(20,24,28,0.08)' }}
    >
      <p className="mb-3 text-xs font-semibold" style={{ color: COLORS.muted }}>
        {t('quiz_question_prefix')} {index + 1} {t('quiz_question_of')} {questions.length}
      </p>
      <p className="font-jakarta mb-4" style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
        {current.question}
      </p>
      <div className="flex flex-col gap-2">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.correct_index
          const chosen = selected === i
          const showResult = selected !== null
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              className="rounded-lg px-4 py-3 text-left text-sm"
              style={{
                background: showResult ? (isCorrect ? COLORS.stateKnownSoft : chosen ? COLORS.stateNewSoft : COLORS.mossSoft) : COLORS.mossSoft,
                color: COLORS.ink,
                cursor: selected === null ? 'pointer' : 'default',
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <button
          type="button"
          onClick={handleNext}
          className="font-jakarta mt-4 rounded-full px-5 py-2.5 text-sm font-bold text-white"
          style={{ background: accent }}
        >
          {isLast ? t('quiz_see_result') : t('quiz_next')}
        </button>
      )}
    </div>
  )
}
