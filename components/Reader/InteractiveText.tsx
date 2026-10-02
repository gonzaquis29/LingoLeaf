'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { saveWord, markWordKnown, removeWord } from '@/app/actions/vocabulary'
import { speak, speechSupported } from '@/lib/speech'
import { wordLevel } from '@/lib/srs'
import { COLORS, accentBase, accentSoft, learningHighlight } from '@/lib/theme'
import { WordBubble } from '@/components/Reader/WordBubble'
import { useT } from '@/components/i18n/I18nProvider'
import type { Token } from '@/lib/tokenize'
import type { Language, WordStatus } from '@/types'

interface VocabEntry {
  id: string
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
  const t = useT()
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
      const result = await saveWord({
        word: token.text,
        translation,
        context: sentences[token.sentenceIndex],
        language,
        textId,
      })
      if (!result.id) return
      setVocab((v) => ({ ...v, [lower]: { id: result.id!, translation, status: 'new', repetitions: 0 } }))
    })
  }

  function handleMarkKnown(token: Token) {
    const lower = token.text.toLowerCase()
    const translation = vocab[lower]?.translation || translations[lower]
    if (!translation) return

    startTransition(async () => {
      const result = await markWordKnown({
        word: token.text,
        translation,
        context: sentences[token.sentenceIndex],
        language,
        textId,
      })
      if (!result.id) return
      setVocab((v) => ({ ...v, [lower]: { id: result.id!, translation, status: 'known', repetitions: 4 } }))
    })
  }

  function handleRemove(token: Token, key: string) {
    const lower = token.text.toLowerCase()
    const entry = vocab[lower]
    if (!entry) return

    startTransition(async () => {
      await removeWord(entry.id)
      setVocab((v) => {
        const next = { ...v }
        delete next[lower]
        return next
      })
      setSessionWords((s) => s.filter((w) => w.key !== key))
    })
  }

  return (
    <div>
      {/* AC del aprendizaje "el Lector no puede sentirse vacío": banner con progreso siempre visible. */}
      <div className="mb-3.5 overflow-hidden rounded-2xl" style={{ background: accent }}>
        <div className="flex items-center gap-3.5 px-5 py-3">
          <span
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-xs text-white"
            style={{ background: accentStrong }}
          >
            ☝
          </span>
          <span className="text-[13px]" style={{ color: '#3A3D42' }}>
            {t('reader_hint')}
          </span>
        </div>
        <div className="grid grid-cols-3" style={{ background: 'rgba(255,255,255,0.55)' }}>
          {[
            { label: t('reader_stat_new'), value: counts.newCount, color: COLORS.stateNew },
            { label: t('reader_stat_learning'), value: counts.learningCount, color: COLORS.stateLearning },
            { label: t('reader_stat_known'), value: counts.knownCount, color: COLORS.stateKnown },
          ].map((stat) => (
            <div key={stat.label} className="px-5 py-3 text-center">
              <p
                className="font-jakarta"
                style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: stat.color }}
              >
                {stat.value}
              </p>
              <p
                className="mt-1 text-[10.5px] font-bold uppercase"
                style={{ letterSpacing: '0.06em', color: stat.color, opacity: 0.85 }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-5 py-2.5" style={{ background: 'rgba(255,255,255,0.35)' }}>
          <span className="text-[10.5px] font-semibold" style={{ color: '#3A3D42' }}>
            {t('reader_legend_new')}
          </span>
          {[1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: learningHighlight(level), border: '1px solid rgba(20,24,28,0.12)' }}
              aria-hidden="true"
            />
          ))}
          <span className="text-[10.5px] font-semibold" style={{ color: '#3A3D42' }}>
            {t('reader_legend_known')}
          </span>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 px-1">
        <span className="text-[13px]" style={{ color: COLORS.muted }}>
          {t('reader_session_label')}
        </span>
        {sessionWords.length === 0 ? (
          <span className="text-[13px] italic" style={{ color: '#9A9DA4' }}>
            {t('reader_session_empty')}
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

          let highlight = 'transparent'
          if (entry?.status === 'new') highlight = COLORS.stateNewSoft
          else if (entry?.status === 'learning') highlight = learningHighlight(wordLevel(entry.repetitions))

          return (
            <span key={key} className="relative" data-word-key={key}>
              <button
                type="button"
                onClick={() => handleTap(token, key)}
                className="cursor-pointer rounded px-0.5"
                style={{
                  background: highlight,
                  boxShadow: isActive ? `0 0 0 2px ${accentStrong}` : 'none',
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
                  onRemove={entry ? () => handleRemove(token, key) : undefined}
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
