'use client'

import { useState } from 'react'
import { COLORS, CARD_RADIUS } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { GrammarPoint } from '@/types'

function GrammarQuiz({ point }: { point: GrammarPoint }) {
  const t = useT()
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(20,24,28,0.08)' }}>
      <p className="mb-2 text-sm font-semibold" style={{ color: COLORS.ink }}>
        {point.quiz_question}
      </p>
      <div className="flex flex-col gap-1.5">
        {point.quiz_options?.map((opt, i) => {
          const isCorrect = i === point.quiz_correct_index
          const chosen = selected === i
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className="rounded-lg px-3 py-2 text-left text-sm"
              style={{
                background: chosen ? (isCorrect ? COLORS.stateKnownSoft : COLORS.stateNewSoft) : COLORS.mossSoft,
                color: COLORS.ink,
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <p
          className="mt-2 text-xs font-semibold"
          style={{ color: selected === point.quiz_correct_index ? COLORS.stateKnown : COLORS.stateNew }}
        >
          {selected === point.quiz_correct_index ? t('grammar_correct') : t('grammar_incorrect')}
        </p>
      )}
    </div>
  )
}

// AC US12.1: vive en un panel lateral fijo, separado de la burbuja de traducción de palabra.
export function GrammarPanel({ points }: { points: GrammarPoint[] }) {
  const t = useT()
  const [openId, setOpenId] = useState<string | null>(points[0]?.id ?? null)

  return (
    <aside className="sticky top-[88px] hidden w-[280px] shrink-0 self-start lg:block">
      <h2
        className="font-jakarta mb-3"
        style={{ fontSize: 12.5, fontWeight: 800, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {t('reader_grammar_title')}
      </h2>
      <div className="flex flex-col gap-3">
        {points.map((point) => {
          const open = openId === point.id
          return (
            <div
              key={point.id}
              style={{ background: COLORS.creamCard, borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)', padding: 16 }}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : point.id)}
                className="font-jakarta w-full text-left"
                style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}
              >
                {point.title}
              </button>
              {open && (
                <div className="mt-2 text-sm leading-relaxed" style={{ color: COLORS.muted }}>
                  <p>{point.body}</p>
                  {point.quiz_question && <GrammarQuiz point={point} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
