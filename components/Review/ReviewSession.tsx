'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { reviewWord } from '@/app/actions/vocabulary'
import { schedule } from '@/lib/srs'
import { COLORS, CARD_RADIUS, accentBase } from '@/lib/theme'
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

const GRADES: { grade: Grade; label: string; color: string }[] = [
  { grade: 'again', label: 'Otra vez', color: COLORS.stateNew },
  { grade: 'hard', label: 'Difícil', color: 'oklch(60% 0.15 50)' },
  { grade: 'good', label: 'Bien', color: COLORS.stateKnown },
  { grade: 'easy', label: 'Fácil', color: COLORS.mossMid },
]

function formatInterval(days: number): string {
  if (days <= 0) return 'hoy'
  if (days === 1) return 'mañana'
  if (days < 30) return `${days} d`
  const months = Math.round(days / 30)
  return months === 1 ? '1 mes' : `${months} meses`
}

function blankContext(context: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`\\b${escaped}\\b`, 'i')
  return re.test(context) ? context.replace(re, '____') : context
}

// AC US6.2/US6.3: el frente muestra la oración con la palabra oculta (estilo Anki), y el
// intervalo resultante de cada botón se ve ANTES de elegir — nada de memorizar el algoritmo.
export function ReviewSession({ cards, language }: { cards: Card[]; language: Language }) {
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
        <h1 className="font-jakarta mb-2" style={{ fontSize: 22, fontWeight: 800, color: COLORS.ink }}>
          {reviewedCount > 0 ? '¡Repaso del día terminado!' : 'No tienes tarjetas pendientes'}
        </h1>
        <p className="mb-6 text-sm" style={{ color: COLORS.muted }}>
          {reviewedCount > 0
            ? `Repasaste ${reviewedCount} palabra${reviewedCount === 1 ? '' : 's'}.`
            : 'Vuelve más tarde o agrega palabras nuevas desde Vocabulario.'}
        </p>
        <Link
          href="/library"
          className="lf-tap font-jakarta rounded-full px-6 py-3 text-sm font-bold text-white"
          style={{ background: accent }}
        >
          Volver a la Biblioteca
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
            {revealed ? current.word : '¿Qué significa esta palabra?'}
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
            Mostrar respuesta
          </button>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {GRADES.map(({ grade, label, color }) => {
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
                  {label}
                  <span className="mt-0.5 block text-[11px] font-normal opacity-90">
                    {formatInterval(preview.interval_days)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/library" className="text-sm underline" style={{ color: COLORS.muted }}>
          Salir del repaso
        </Link>
      </div>
    </div>
  )
}
