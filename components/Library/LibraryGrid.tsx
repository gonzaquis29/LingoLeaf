'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { TextCoverArt } from '@/components/Library/TextCoverArt'
import { CoverScene, coverSceneFor } from '@/components/Library/CoverScenes'
import { COLORS, CARD_RADIUS, pillButtonStyle, accentSoft } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { Language, Level } from '@/types'

interface CardText {
  id: string
  title: string
  level: Level
  word_count: number
  cover_url?: string | null
  knownPct: number
  pctColor: string
  pctLabel: string
}

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']

export function LibraryGrid({
  texts,
  language,
  accent,
  accentStrongColor,
}: {
  texts: CardText[]
  language: Language
  accent: string
  accentStrongColor: string
}) {
  const t = useT()
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all')

  const availableLevels = useMemo(
    () => LEVELS.filter((lvl) => texts.some((t) => t.level === lvl)),
    [texts]
  )
  const filtered = levelFilter === 'all' ? texts : texts.filter((t) => t.level === levelFilter)

  return (
    <div className="px-8">
      {availableLevels.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setLevelFilter('all')} style={pillButtonStyle(levelFilter === 'all', accent)}>
            {t('library_all_levels')}
          </button>
          {availableLevels.map((lvl) => (
            <button key={lvl} type="button" onClick={() => setLevelFilter(lvl)} style={pillButtonStyle(levelFilter === lvl, accent)}>
              {lvl}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/add"
          className="lf-tap relative flex min-h-[230px] flex-col items-center justify-end gap-1.5 overflow-hidden px-5 pb-6 text-center"
          style={{
            borderRadius: CARD_RADIUS,
            background: `linear-gradient(160deg, ${accentSoft(language)} 0%, #fff 85%)`,
            border: `2px dashed ${accent}`,
          }}
        >
          <div className="pointer-events-none absolute left-1/2 top-5 flex -translate-x-1/2 items-end">
            {[
              { title: 'coffee', rot: -9, dy: 6 },
              { title: 'playa', rot: 0, dy: 0 },
              { title: 'mountain', rot: 9, dy: 6 },
            ].map((c, i) => (
              <div
                key={c.title}
                className="h-[62px] w-[88px] overflow-hidden"
                style={{
                  borderRadius: 12,
                  transform: `rotate(${c.rot}deg) translateY(${c.dy}px)`,
                  marginLeft: i ? -14 : 0,
                  boxShadow: '0 6px 16px rgba(20,24,28,0.18)',
                  border: '3px solid #fff',
                  zIndex: i === 1 ? 2 : 1,
                }}
              >
                {(() => {
                  const art = coverSceneFor(c.title)
                  return art ? <CoverScene art={art} /> : null
                })()}
              </div>
            ))}
          </div>
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl font-light text-white"
            style={{ background: accent, boxShadow: `0 6px 16px ${accent}` }}
          >
            +
          </span>
          <span className="font-jakarta mt-1 text-[15px] font-extrabold" style={{ color: accentStrongColor }}>
            {t('library_add_content')}
          </span>
          <span className="text-[12.5px]" style={{ color: COLORS.muted }}>
            {t('library_add_hint')}
          </span>
        </Link>

        {filtered.map((text) => (
          <div
            key={text.id}
            className="flex flex-col overflow-hidden"
            style={{ background: COLORS.creamCard, borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)' }}
          >
            <div className="h-[130px] overflow-hidden">
              <TextCoverArt textId={text.id} language={language} coverUrl={text.cover_url} title={text.title} />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 px-[18px] pb-5 pt-[18px]">
              <h3 className="font-jakarta" style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink }}>
                {text.title}
              </h3>
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: COLORS.muted }}>
                <span>{t('library_level')} {text.level}</span>
                <span>·</span>
                <span>{text.word_count} {t('library_words')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-[9px] w-[9px] rounded-full" style={{ background: text.pctColor }} />
                <span className="text-[13px] font-semibold" style={{ color: text.pctColor }}>
                  {text.knownPct}% {t('library_known')} · {text.pctLabel}
                </span>
              </div>
              <Link
                href={`/reader/${text.id}`}
                className="lf-tap font-jakarta mt-1.5 w-full rounded-full py-2.5 text-center text-sm font-bold text-white"
                style={{ background: accent }}
              >
                {t('library_read')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
