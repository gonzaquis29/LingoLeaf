'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { reviewWord } from '@/app/actions/vocabulary'
import { schedule } from '@/lib/srs'
import { COLORS, CARD_RADIUS, accentBase } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { DictKey } from '@/lib/i18n/dict'
import type { Grade, Language } from '@/types'

interface Card {
  id: string
  word: string
  translation: string
  context?: string
  ease_factor: number
  interval_days: number
  repetitions: number
}

const GRADES: { grade: Grade; labelKey: DictKey; color: string }[] = [
  { grade: 'again', labelKey: 'grade_again', color: COLORS.stateNew },
  { grade: 'hard', labelKey: 'grade_hard', color: 'oklch(60% 0.15 50)' },
  { grade: 'good', labelKey: 'grade_good', color: COLORS.stateKnown },
  { grade: 'easy', labelKey: 'grade_easy', color: COLORS.mossMid },
]

function formatInterval(days: number, t: (key: DictKey) => string): string {
  if (days <= 0) return t('time_today')
  if (days === 1) return t('time_tomorrow')
  if (days < 30) return `${days} d`
  const months = Math.round(days / 30)
  return months === 1 ? t('time_month') : `${months} ${t('time_months')}`
}

function blankContext(context: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`\\b${escaped}\\b`, 'i')
  return re.test(context) ? context.replace(re, '____') : context
}

// AC US6.2/US6.3: el frente muestra la oración con la palabra oculta (estilo Anki), y el
// intervalo resultante de cada botón se ve ANTES de elegir — nada de memorizar el algoritmo.
export function ReviewSession({ cards, language }: { cards: Card[]; language: Language }) {
  const t = useT()
  const [queue] = useState(cards)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const accent = accentBase(language)

  const current = queue[index]

  // AC US6.4: pantalla de cierre cuando no quedan tarjetas.
  if (!current) {
    return (
      <div className="text-center">
        {reviewedCount > 0 && (
          <svg
            className="lf-completion-icon mx-auto mb-3"
            width="52"
            height="52"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M16 4C25 8 27 18 16 28C5 18 7 8 16 4Z" fill={accent} />
            <path d="M16 9V24M16 15L11 11M16 21L21 17" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        )}
        {reviewedCount > 0 && (
          <p
            className="font-jakarta mb-1 text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.08em', color: accent }}
          >
            {t('review_finished_eyebrow')}
          </p>
        )}
        {reviewedCount > 0 ? (
          <p
            className="font-jakarta mb-2"
            style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: accent }}
          >
            {reviewedCount}
          </p>
        ) : (
          <h2 className="font-jakarta mb-2" style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink }}>
            {t('review_none_pending')}
          </h2>
        )}
        <p className="mb-6 text-sm" style={{ color: COLORS.muted }}>
          {reviewedCount > 0 ? t('review_words_reviewed') : t('review_none_pending_hint')}
        </p>
        <Link
          href="/library"
          className="lf-tap font-jakarta rounded-full px-6 py-3 text-sm font-bold text-white"
          style={{ background: accent }}
        >
          {t('review_back_to_library')}
        </Link>
      </div>
    )
  }

  // AC US6.5: cada calificación persiste de inmediato (reviewWord), así que salir a la mitad
  // no pierde nada de lo ya calificado — no hay estado "pendiente de guardar" que perder.
  function handleGrade(grade: Grade) {
    startTransition(async () => {
      await reviewWord(current.id, grade)
      setReviewedCount((c) => c + 1)
      setRevealed(false)
      setIndex((i) => i + 1)
    })
  }

  return (
    <div>
      <p className="mb-4 text-center text-xs font-semibold" style={{ color: COLORS.muted }}>
        {index + 1} / {queue.length}
      </p>
      <div
        className="mx-auto text-center"
        style={{
          maxWidth: 480,
          background: COLORS.creamCard,
          borderRadius: CARD_RADIUS,
          border: '1px solid rgba(20,24,28,0.08)',
          padding: '40px 32px',
        }}
      >
        {current.context ? (
          <p className="text-lg leading-relaxed" style={{ color: COLORS.ink }}>
            {revealed ? current.context : blankContext(current.context, current.word)}
          </p>
        ) : (
          <p className="text-lg" style={{ color: COLORS.ink }}>
            {revealed ? current.word : t('review_question')}
          </p>
        )}

        {revealed && (
          <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(20,24,28,0.1)' }}>
            <p className="font-jakarta" style={{ fontSize: 20, fontWeight: 800, color: accent }}>
              {current.word}
            </p>
            <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
              {current.translation}
            </p>
          </div>
        )}

        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="font-jakarta mt-6 rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ background: accent }}
          >
            {t('review_show_answer')}
          </button>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GRADES.map(({ grade, labelKey, color }) => {
              const preview = schedule(
                { ease_factor: current.ease_factor, interval_days: current.interval_days, repetitions: current.repetitions },
                grade
              )
              return (
                <button
                  key={grade}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleGrade(grade)}
                  className="font-jakarta rounded-xl px-2 py-3 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: color }}
                >
                  {t(labelKey)}
                  <span className="mt-1 block text-[15px] font-extrabold opacity-95">
                    {formatInterval(preview.interval_days, t)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/library" className="text-sm underline" style={{ color: COLORS.muted }}>
          {t('review_exit')}
        </Link>
      </div>
    </div>
  )
}
