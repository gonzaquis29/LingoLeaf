'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { saveWord } from '@/app/actions/vocabulary'
import { authInputStyle, authButtonStyle } from '@/components/Auth/authStyles'
import { COLORS, CARD_RADIUS, accentBase } from '@/lib/theme'
import type { Language, WordStatus } from '@/types'

interface SavedRow {
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

// AC US5.5: formulario simple para agregar una palabra suelta al vocabulario del idioma activo,
// sin que venga de un texto — abierto desde el botón "+" de la pantalla de Vocabulario.
export function AddWordModal({
  language,
  onClose,
  onSaved,
}: {
  language: Language
  onClose: () => void
  onSaved: (row: SavedRow) => void
}) {
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [context, setContext] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveWord({ word, translation, context: context || undefined, language })
      if (result.error) {
        setError(result.error)
        return
      }
      onSaved({
        id: crypto.randomUUID(),
        word,
        translation,
        context: context || undefined,
        language,
        status: 'new',
        repetitions: 0,
        due_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(20,24,28,0.4)' }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full"
        style={{ maxWidth: 380, background: '#fff', borderRadius: CARD_RADIUS, padding: '28px 24px' }}
      >
        <h2 className="font-jakarta mb-4" style={{ fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
          Agregar una palabra
        </h2>
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Palabra" required style={authInputStyle} />
        <input
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder="Traducción"
          required
          style={authInputStyle}
        />
        <input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Contexto (opcional)"
          style={{ ...authInputStyle, marginBottom: 8 }}
        />
        {error && (
          <p role="alert" className="text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
            {error}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4">
          <button type="button" onClick={onClose} className="text-sm underline" style={{ color: COLORS.muted }}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="font-jakarta"
            style={{ ...authButtonStyle(accentBase(language)), width: 'auto', padding: '10px 22px', marginTop: 0 }}
          >
            {isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
