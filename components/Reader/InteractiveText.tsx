'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { saveWord, markWordKnown } from '@/app/actions/vocabulary'
import { speak, speechSupported } from '@/lib/speech'
import { wordLevel } from '@/lib/srs'
import { COLORS, accentBase, accentSoft, learningShade } from '@/lib/theme'
import { WordBubble } from '@/components/Reader/WordBubble'
import type { Token } from '@/lib/tokenize'
import type { Language, WordStatus } from '@/types'

interface VocabEntry {
  translation: string
  status: WordStatus
  repetitions: number
}

interface SessionChip {
  key: string
  word: string
  status: WordStatus
}

export function InteractiveText({
  sentences,
  tokens,
  language,
  nativeLanguage,
  textId,
  initialVocab,
}: {
  sentences: string[]
  tokens: Token[]
  language: Language
  nativeLanguage: Language
  textId: string
  initialVocab: Record<string, VocabEntry>
}) {
  const [vocab, setVocab] = useState(initialVocab)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [sessionWords, setSessionWords] = useState<SessionChip[]>([])
  const [isPending, startTransition] = useTransition()
  const accent = accentSoft(language)
  const accentStrong = accentBase(language)

  const wordTokens = useMemo(() => tokens.filter((t) => t.isWordLike), [tokens])
  const counts = useMemo(() => {
    let newCount = 0
    let learningCount = 0
    let knownCount = 0
    for (const token of wordTokens) {
      const entry = vocab[token.text.toLowerCase()]
      if (!entry) continue
      if (entry.status === 'new') newCount++
      else if (entry.status === 'learning') learningCount++
      else knownCount++
    }
    return { newCount, learningCount, knownCount }
  }, [wordTokens, vocab])

  async function handleTap(token: Token, key: string) {
    if (activeKey === key) {
      setActiveKey(null)
      return
    }
    setActiveKey(key)
    const lower = token.text.toLowerCase()

    const existing = vocab[lower]
    if (existing) {
      pushSession(key, token.text, existing.status)
      return
    }
    if (translations[lower]) {
      pushSession(key, token.text, 'new')
      return
    }

    setLoadingKey(key)
    try {
      const res = await fetch(
        `/api/translate?word=${encodeURIComponent(token.text)}&from=${language}&to=${nativeLanguage}`
      )
      const data = await res.json()
      if (data.translation) {
        setTranslations((t) => ({ ...t, [lower]: data.translation }))
        pushSession(key, token.text, 'new')
      }
    } finally {
      setLoadingKey(null)
    }
  }

  // Cerrar la burbuja al clickear afuera — antes solo se cerraba tocando la misma palabra otra vez.
  useEffect(() => {
    if (!activeKey) return
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest(`[data-word-key="${activeKey}"]`)) {
        setActiveKey(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [activeKey])

  function pushSession(key: string, word: string, status: WordStatus) {
    setSessionWords((s) => (s.find((w) => w.key === key) ? s : [...s, { key, word, status }]))
  }

  function handleSave(token: Token) {
    const lower = token.text.toLowerCase()
    const translation = vocab[lower]?.translation || translations[lower]
    if (!translation) return

    startTransition(async () => {
      await saveWord({
        word: token.text,
        translation,
        context: sentences[token.sentenceIndex],
        language,
        textId,
      })
      setVocab((v) => ({ ...v, [lower]: { translation, status: 'new', repetitions: 0 } }))
    })
  }

  function handleMarkKnown(token: Token) {
    const lower = token.text.toLowerCase()
    const translation = vocab[lower]?.translation || translations[lower]
    if (!translation) return

    startTransition(async () => {
      await markWordKnown({
        word: token.text,
        translation,
        context: sentences[token.sentenceIndex],
        language,
        textId,
      })
      setVocab((v) => ({ ...v, [lower]: { translation, status: 'known', repetitions: 4 } }))
    })
  }

  return (
    <div>
      {/* AC del aprendizaje "el Lector no puede sentirse vacío": banner con progreso siempre visible. */}
      <div
        className="mb-3.5 flex flex-wrap items-center gap-3.5 rounded-2xl px-5 py-3.5"
        style={{ background: accent }}
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-sm text-white"
          style={{ background: accentStrong }}
        >
          ☝
        </span>
        <span className="flex-1 text-[13.5px]" style={{ color: '#3A3D42' }}>
          Toca cualquier palabra subrayada para ver su traducción y añadirla a tu repaso.
        </span>
        <div className="flex flex-wrap gap-3.5">
          <span className="text-[13px] font-semibold" style={{ color: COLORS.stateNew }}>
            ● {counts.newCount} nuevas
          </span>
          <span className="text-[13px] font-semibold" style={{ color: COLORS.stateLearning }}>
            ● {counts.learningCount} aprendiendo
          </span>
          <span className="text-[13px] font-semibold" style={{ color: COLORS.stateKnown }}>
            ● {counts.knownCount} conocidas
          </span>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 px-1">
        <span className="text-[13px]" style={{ color: COLORS.muted }}>
          Esta sesión:
        </span>
        {sessionWords.length === 0 ? (
          <span className="text-[13px] italic" style={{ color: '#9A9DA4' }}>
            toca una palabra del texto para empezar
          </span>
        ) : (
          sessionWords.map((chip) => (
            <span
              key={chip.key}
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                background: chip.status === 'known' ? COLORS.stateKnownSoft : COLORS.stateNewSoft,
                color: chip.status === 'known' ? COLORS.stateKnown : COLORS.stateNew,
              }}
            >
              {chip.word}
            </span>
          ))
        )}
      </div>

      <p
        className="text-[22px] leading-[2.15]"
        style={{
          color: COLORS.ink,
          background: COLORS.creamCard,
          borderRadius: 24,
          padding: '40px 44px',
          borderLeft: '1px solid rgba(20,24,28,0.08)',
          borderRight: '1px solid rgba(20,24,28,0.08)',
          borderBottom: '1px solid rgba(20,24,28,0.08)',
          borderTop: `5px solid ${accentStrong}`,
        }}
      >
        {tokens.map((token, i) => {
          const key = `${token.sentenceIndex}-${i}`
          if (!token.isWordLike) return <span key={key}>{token.text}</span>

          const lower = token.text.toLowerCase()
          const entry = vocab[lower]
          const isActive = activeKey === key
          const translation = entry?.translation || translations[lower]

          let decorationColor = 'transparent'
          if (entry?.status === 'new') decorationColor = COLORS.stateNew
          else if (entry?.status === 'learning') decorationColor = learningShade(wordLevel(entry.repetitions))

          return (
            <span key={key} className="relative" data-word-key={key}>
              <button
                type="button"
                onClick={() => handleTap(token, key)}
                className="cursor-pointer rounded px-0.5"
                style={{
                  background: isActive ? accent : 'transparent',
                  textDecorationLine: decorationColor === 'transparent' ? 'none' : 'underline',
                  textDecorationColor: decorationColor,
                  textDecorationThickness: '2.5px',
                  textUnderlineOffset: '4px',
                  color: COLORS.ink,
                }}
              >
                {token.text}
              </button>
              {isActive && (
                <WordBubble
                  word={token.text}
                  translation={translation}
                  loading={loadingKey === key}
                  level={entry?.status === 'learning' ? wordLevel(entry.repetitions) : undefined}
                  status={entry?.status}
                  onSpeak={speechSupported() ? () => speak(token.text, language) : undefined}
                  onSave={!entry && translation ? () => handleSave(token) : undefined}
                  onMarkKnown={entry?.status !== 'known' && translation ? () => handleMarkKnown(token) : undefined}
                  saving={isPending}
                />
              )}
            </span>
          )
        })}
      </p>
    </div>
  )
}
