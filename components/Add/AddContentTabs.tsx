'use client'

import { useState } from 'react'
import { PasteTextForm } from '@/components/Add/PasteTextForm'
import { UrlImportForm } from '@/components/Add/UrlImportForm'
import { CatalogSearch } from '@/components/Add/CatalogSearch'
import { accentBase, accentSoft, accentStrong, CARD_RADIUS, COLORS } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { Language, Level } from '@/types'

type Tab = 'paste' | 'url' | 'search'

interface CatalogText {
  id: string
  title: string
  language: Language
  level: Level
  word_count: number
  cover_url?: string | null
}

export function AddContentTabs({ activeLang, catalogTexts }: { activeLang: Language; catalogTexts: CatalogText[] }) {
  const t = useT()
  const [tab, setTab] = useState<Tab>('paste')
  const accent = accentBase(activeLang)

  const options: { id: Tab; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'paste',
      label: t('add_tab_paste'),
      desc: t('add_desc_paste'),
      icon: <path d="M8 4h8l4 4v12H8zM16 4v4h4M11 12h6M11 16h6" />,
    },
    {
      id: 'url',
      label: t('add_tab_url'),
      desc: t('add_desc_url'),
      icon: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
    },
    {
      id: 'search',
      label: t('add_tab_search'),
      desc: t('add_desc_search'),
      icon: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />,
    },
  ]

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {options.map((o) => {
          const active = tab === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setTab(o.id)}
              className="lf-tap flex items-start gap-3.5 p-4 text-left"
              style={{
                borderRadius: CARD_RADIUS,
                background: active ? accentSoft(activeLang) : COLORS.creamCard,
                border: active ? `2px solid ${accent}` : '2px solid rgba(20,24,28,0.08)',
              }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: active ? accent : accentSoft(activeLang), color: active ? '#fff' : accentStrong(activeLang) }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {o.icon}
                </svg>
              </span>
              <span>
                <span className="font-jakarta block text-[15px] font-extrabold" style={{ color: COLORS.ink }}>
                  {o.label}
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-snug" style={{ color: COLORS.muted }}>
                  {o.desc}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {tab === 'paste' && <PasteTextForm defaultLanguage={activeLang} />}
      {tab === 'url' && <UrlImportForm defaultLanguage={activeLang} />}
      {tab === 'search' && <CatalogSearch texts={catalogTexts} />}
    </div>
  )
}
