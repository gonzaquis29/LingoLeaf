'use client'

import { useState } from 'react'
import { PasteTextForm } from '@/components/Add/PasteTextForm'
import { UrlImportForm } from '@/components/Add/UrlImportForm'
import { CatalogSearch } from '@/components/Add/CatalogSearch'
import { pillButtonStyle, accentBase } from '@/lib/theme'
import type { Language, Level } from '@/types'

type Tab = 'paste' | 'url' | 'search'

interface CatalogText {
  id: string
  title: string
  language: Language
  level: Level
  word_count: number
}

export function AddContentTabs({ activeLang, catalogTexts }: { activeLang: Language; catalogTexts: CatalogText[] }) {
  const [tab, setTab] = useState<Tab>('paste')
  const accent = accentBase(activeLang)

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2.5">
        <button type="button" onClick={() => setTab('paste')} style={pillButtonStyle(tab === 'paste', accent)}>
          Pegar texto
        </button>
        <button type="button" onClick={() => setTab('url')} style={pillButtonStyle(tab === 'url', accent)}>
          Pegar URL
        </button>
        <button type="button" onClick={() => setTab('search')} style={pillButtonStyle(tab === 'search', accent)}>
          Buscar catálogo
        </button>
      </div>
      {tab === 'paste' && <PasteTextForm defaultLanguage={activeLang} />}
      {tab === 'url' && <UrlImportForm defaultLanguage={activeLang} />}
      {tab === 'search' && <CatalogSearch texts={catalogTexts} />}
    </div>
  )
}
