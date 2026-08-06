'use client'

import { useState, useTransition } from 'react'
import { completeOnboarding } from '@/app/actions/onboarding'
import { COLORS, accentBase } from '@/lib/theme'
import { authButtonStyle, authHeadingStyle } from '@/components/Auth/authStyles'

const DEMO_SENTENCE = ['It', 'is', 'a', 'sunny', 'day.', 'Anna', 'and', 'her', 'dog', 'go', 'to', 'the', 'park.']
const DEMO_WORD_INDEX = 3 // "sunny"

const LEVELS = [
  { label: 'Nueva', bg: COLORS.stateNewSoft, dot: COLORS.stateNew },
  { label: 'Aprendiendo', bg: COLORS.stateLearningSoft, dot: COLORS.stateLearning },
  { label: 'Conocida', bg: COLORS.stateKnownSoft, dot: COLORS.stateKnown },
]

function StepIntro() {
  return (
    <div className="text-center">
      <h1 className="font-jakarta" style={{ ...authHeadingStyle, textAlign: 'center' }}>
        ¡Todo listo!
      </h1>
      <p className="text-sm leading-relaxed" style={{ color: '#3A3D42' }}>
        Te mostramos la interfaz real: cómo tocar una palabra para traducirla, cómo se ve una
        tarjeta de repaso, y qué significan los colores de cada palabra. Nada de video aparte.
      </p>
    </div>
  )
}

function StepWord() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <h2 className="font-jakarta mb-1.5" style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
        Toca cualquier palabra para traducirla
      </h2>
      <p className="mb-5 text-sm" style={{ color: COLORS.muted }}>
        Aparece una burbuja anclada a esa palabra — el texto de alrededor no se mueve.
      </p>
      <p className="text-lg leading-relaxed">
        {DEMO_SENTENCE.map((word, i) =>
          i === DEMO_WORD_INDEX ? (
            <span key={i} className="relative inline-block">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={{
                  borderRadius: 4,
                  borderBottom: `2px solid ${COLORS.stateLearning}`,
                  background: COLORS.stateLearningSoft,
                  padding: '0 2px',
                }}
              >
                {word}
              </button>
              {open && (
                <span
                  className="absolute left-1/2 top-full z-10 mt-2 w-40 -translate-x-1/2 rounded-xl p-3 text-left text-sm"
                  style={{ background: '#fff', boxShadow: '0 12px 30px rgba(20,24,28,0.18)' }}
                >
                  <strong className="block" style={{ color: COLORS.ink }}>
                    soleado
                  </strong>
                  <span style={{ color: COLORS.muted }}>adjetivo · A1</span>
                </span>
              )}
            </span>
          ) : (
            <span key={i}> {word}</span>
          )
        )}
      </p>
    </div>
  )
}

function StepLevels() {
  return (
    <div>
      <h2 className="font-jakarta mb-5" style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
        Los colores muestran qué tan bien conoces cada palabra
      </h2>
      <ul className="flex flex-col gap-2">
        {LEVELS.map((level) => (
          <li
            key={level.label}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
            style={{ background: level.bg }}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: level.dot }} />
            {level.label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs" style={{ color: COLORS.muted }}>
        &quot;Aprendiendo&quot; tiene 4 niveles internos — el color se intensifica a medida que la
        repasas.
      </p>
    </div>
  )
}

function StepReview() {
  const grades = [
    { label: 'Otra vez', color: COLORS.stateNew, bg: COLORS.stateNewSoft },
    { label: 'Difícil', color: COLORS.stateLearning, bg: COLORS.stateLearningSoft },
    { label: 'Bien', color: COLORS.stateKnown, bg: COLORS.stateKnownSoft },
    { label: 'Fácil', color: COLORS.stateKnown, bg: COLORS.stateKnownSoft },
  ]
  return (
    <div>
      <h2 className="font-jakarta mb-5" style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
        Repasas con la frase completa, no la palabra sola
      </h2>
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: COLORS.mossSoft, borderRadius: '20px 20px 20px 8px' }}
      >
        <p className="text-base leading-relaxed" style={{ color: COLORS.ink }}>
          Anna and her dog go to the{' '}
          <span className="rounded px-2" style={{ background: '#fff' }}>
            ____
          </span>
          .
        </p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          {grades.map((g) => (
            <span key={g.label} className="rounded-lg px-2 py-1.5 font-semibold" style={{ background: g.bg, color: g.color }}>
              {g.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const STEPS = [StepIntro, StepWord, StepLevels, StepReview]

export function GuidedTour() {
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()
  const accent = accentBase()

  const finish = () => startTransition(() => completeOnboarding())

  const Current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div>
      <Current />

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={finish}
          disabled={isPending}
          className="text-sm underline disabled:opacity-60"
          style={{ color: COLORS.muted }}
        >
          Saltar
        </button>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: i === step ? accent : 'rgba(20,24,28,0.15)' }}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          className="font-jakarta text-sm"
          style={{ ...authButtonStyle(accent), width: 'auto', marginTop: 0, padding: '10px 20px' }}
        >
          {isLast ? 'Empezar a leer' : 'Siguiente'}
        </button>
      </div>
    </div>
  )
}
