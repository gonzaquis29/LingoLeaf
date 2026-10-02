'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { LANGUAGES, languageInfo } from '@/lib/languages'
import { COLORS, CARD_RADIUS, pillButtonStyle, accentBase } from '@/lib/theme'
import { TextCoverArt } from '@/components/Library/TextCoverArt'
import { authInputStyle } from '@/components/Auth/authStyles'
import type { Language, Level } from '@/types'

interface CatalogText {
  id: string
  title: string
  language: Language
  level: Level
  word_count: number
  cover_url?: string | null
}

// AC US3.3: buscador + filtro de idioma sobre el catálogo curado, con acceso directo a leer.
export function CatalogSearch({ texts }: { texts: CatalogText[] }) {
  const [query, setQuery] = useState('')
  const [langFilter, setLangFilter] = useState<Language | 'all'>('all')

  const filtered = useMemo(
    () =>
      texts.filter(
        (t) => (langFilter === 'all' || t.language === langFilter) && t.title.toLowerCase().includes(query.toLowerCase())
      ),
    [texts, query, langFilter]
  )

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por título…"
        style={{ ...authInputStyle, maxWidth: 340 }}
      />
      <div className="mb-4 mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => setLangFilter('all')} style={pillButtonStyle(langFilter === 'all', COLORS.ink)}>
          Todos
        </button>
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLangFilter(l.code)}
            style={pillButtonStyle(langFilter === l.code, accentBase(l.code))}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const info = languageInfo(t.language)
          return (
            <li
              key={t.id}
              className="flex flex-col overflow-hidden"
              style={{ background: COLORS.creamCard, borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)' }}
            >
              <div className="h-[110px] overflow-hidden">
                <TextCoverArt textId={t.id} language={t.language} coverUrl={t.cover_url} title={t.title} />
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="font-jakarta" style={{ fontWeight: 700, color: COLORS.ink, fontSize: 15 }}>
                  {t.title}
                </p>
                <p className="text-xs" style={{ color: COLORS.muted }}>
                  {info?.flag} {info?.label} · Nivel {t.level} · {t.word_count} palabras
                </p>
                <Link
                  href={`/reader/${t.id}`}
                  className="lf-tap font-jakarta mt-2.5 rounded-full py-2 text-center text-sm font-bold text-white"
                  style={{ background: accentBase(t.language) }}
                >
                  Leer
                </Link>
              </div>
            </li>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm" style={{ color: COLORS.muted }}>
            Sin resultados.
          </p>
        )}
      </ul>
    </div>
  )
}
