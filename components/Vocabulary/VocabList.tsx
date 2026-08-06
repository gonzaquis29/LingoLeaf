'use client'

import { useMemo, useState } from 'react'
import { wordLevel } from '@/lib/srs'
import { downloadCsv, downloadApkg } from '@/lib/export'
import { COLORS, CARD_RADIUS, pillButtonStyle } from '@/lib/theme'
import { AddWordModal } from '@/components/Vocabulary/AddWordModal'
import type { Language, WordStatus } from '@/types'

interface VocabRow {
  id: string
  word: string
  translation: string
  context?: string
  language: Language
  status: WordStatus
  repetitions: number
  due_date: string
  created_at: string
}

const STATUS_LABEL: Record<WordStatus, string> = { new: 'Nueva', learning: 'Aprendiendo', known: 'Conocida' }
const STATUS_COLOR: Record<WordStatus, string> = {
  new: COLORS.stateNew,
  learning: COLORS.stateLearning,
  known: COLORS.stateKnown,
}

// AC US5.1/US5.2: lista completa con traducción/contexto, filtro por estado (el idioma ya viene
// filtrado por el idioma activo — US1.7), y nivel 1-4 visible en las palabras "aprendiendo".
export function VocabList({ words, language }: { words: VocabRow[]; language: Language }) {
  const [filter, setFilter] = useState<'all' | WordStatus>('all')
  const [rows, setRows] = useState(words)
  const [modalOpen, setModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const filtered = useMemo(() => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)), [rows, filter])

  // AC US8.1/US8.2: exporta lo que está filtrado ahora mismo (idioma ya viene fijado por el
  // idioma activo — US1.7 — y el estado por el filtro de esta pantalla).
  function handleExportCsv() {
    downloadCsv(filtered, `vocabulario-${language}.csv`)
  }

  async function handleExportApkg() {
    setExporting(true)
    try {
      await downloadApkg(filtered, `Lingoleaf-${language}`)
    } catch {
      // el fetch en downloadApkg ya loguea el fallo de red; no hay más que mostrar acá sin un toast global
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="relative">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'new', 'learning', 'known'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={pillButtonStyle(filter === f, f === 'all' ? COLORS.mossMid : STATUS_COLOR[f])}
            >
              {f === 'all' ? 'Todas' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        <details className="relative">
          <summary
            className="cursor-pointer list-none rounded-full px-4 py-2 text-xs font-bold"
            style={{ border: '1px solid rgba(20,24,28,0.14)', color: COLORS.ink }}
          >
            Exportar
          </summary>
          <div
            className="absolute right-0 top-[38px] z-30 w-[190px] rounded-2xl p-2"
            style={{ background: '#fff', boxShadow: '0 12px 30px rgba(20,24,28,0.18)' }}
          >
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filtered.length === 0}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm disabled:opacity-50"
              style={{ color: COLORS.ink }}
            >
              CSV
            </button>
            <button
              type="button"
              onClick={handleExportApkg}
              disabled={filtered.length === 0 || exporting}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm disabled:opacity-50"
              style={{ color: COLORS.ink }}
            >
              {exporting ? 'Generando…' : 'Mazo de Anki (.apkg)'}
            </button>
          </div>
        </details>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm" style={{ color: COLORS.muted }}>
          {rows.length === 0 ? 'Todavía no guardaste ninguna palabra en este idioma.' : 'Nada en este filtro.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-4 p-4"
              style={{ background: COLORS.creamCard, borderRadius: CARD_RADIUS, border: '1px solid rgba(20,24,28,0.08)' }}
            >
              <div className="min-w-0">
                <p className="font-jakarta" style={{ fontWeight: 700, color: COLORS.ink, fontSize: 15 }}>
                  {row.word}
                </p>
                <p className="text-sm" style={{ color: COLORS.muted }}>
                  {row.translation}
                </p>
                {row.context && (
                  <p className="mt-1 truncate text-xs italic" style={{ color: COLORS.muted, maxWidth: 340 }}>
                    &quot;{row.context}&quot;
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs font-semibold" style={{ color: STATUS_COLOR[row.status] }}>
                  {STATUS_LABEL[row.status]}
                  {row.status === 'learning' ? ` · Nivel ${wordLevel(row.repetitions)}/4` : ''}
                </span>
                <p className="mt-0.5 text-[11px]" style={{ color: COLORS.muted }}>
                  vence {new Date(row.due_date).toLocaleDateString('es')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white"
        style={{ background: COLORS.mossMid, boxShadow: '0 12px 30px rgba(20,24,28,0.25)' }}
        aria-label="Agregar palabra"
      >
        +
      </button>

      {modalOpen && (
        <AddWordModal
          language={language}
          onClose={() => setModalOpen(false)}
          onSaved={(row) => {
            setRows((r) => [row, ...r])
            setModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
