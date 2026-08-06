'use client'

import { useState, useActionState } from 'react'
import { addText } from '@/app/actions/texts'
import { LANGUAGES, languageInfo } from '@/lib/languages'
import { authInputStyle, authButtonStyle } from '@/components/Auth/authStyles'
import { accentBase, COLORS } from '@/lib/theme'
import type { Language } from '@/types'

interface Preview {
  title: string
  content: string
  language: Language
  wordCount: number
}

export function UrlImportForm({ defaultLanguage }: { defaultLanguage: Language }) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [state, formAction, pending] = useActionState(addText, undefined)

  async function handleExtract() {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFetchError(data.error || 'No se pudo extraer el contenido.')
        return
      }
      setPreview(data)
    } catch {
      setFetchError('No se pudo acceder a esa URL.')
    } finally {
      setLoading(false)
    }
  }

  if (!preview) {
    return (
      <div className="flex flex-col gap-3.5" style={{ maxWidth: 560 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com/articulo"
          style={authInputStyle}
        />
        {fetchError && (
          <p role="alert" className="text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
            {fetchError}
          </p>
        )}
        <button
          type="button"
          onClick={handleExtract}
          disabled={loading || !url}
          className="font-jakarta self-start"
          style={{ ...authButtonStyle(accentBase(defaultLanguage)), width: 'auto', padding: '12px 28px', marginTop: 4 }}
        >
          {loading ? 'Extrayendo…' : 'Extraer contenido'}
        </button>
      </div>
    )
  }

  const info = languageInfo(preview.language)

  return (
    <form action={formAction} className="flex flex-col gap-3.5" style={{ maxWidth: 560 }}>
      <input name="title" defaultValue={preview.title} style={authInputStyle} />
      <input type="hidden" name="content" value={preview.content} />
      <div className="flex gap-3">
        <select name="language" defaultValue={preview.language} style={{ ...authInputStyle, marginBottom: 0 }}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
        <select name="level" defaultValue="auto" style={{ ...authInputStyle, marginBottom: 0 }}>
          <option value="auto">Detectar automáticamente</option>
          {['A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs" style={{ color: COLORS.muted }}>
        Idioma detectado: {info?.flag} {info?.label} · {preview.wordCount} palabras
      </p>
      <div
        className="max-h-40 overflow-y-auto rounded-lg p-3 text-sm"
        style={{ background: COLORS.mossSoft, color: COLORS.ink }}
      >
        {preview.content.slice(0, 800)}
        {preview.content.length > 800 ? '…' : ''}
      </div>

      {state?.error && (
        <p role="alert" className="text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setPreview(null)} className="text-sm underline" style={{ color: COLORS.muted }}>
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="font-jakarta"
          style={{ ...authButtonStyle(accentBase(defaultLanguage)), width: 'auto', padding: '12px 28px', marginTop: 0 }}
        >
          {pending ? 'Guardando…' : 'Guardar en mi biblioteca'}
        </button>
      </div>
    </form>
  )
}
