'use client'

import { useActionState } from 'react'
import { addText } from '@/app/actions/texts'
import { LANGUAGES } from '@/lib/languages'
import { authInputStyle, authButtonStyle } from '@/components/Auth/authStyles'
import { accentBase } from '@/lib/theme'
import type { Language } from '@/types'

export function PasteTextForm({ defaultLanguage }: { defaultLanguage: Language }) {
  const [state, formAction, pending] = useActionState(addText, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-3.5" style={{ maxWidth: 560 }}>
      <input name="title" placeholder="Título" required style={authInputStyle} />
      <div className="flex gap-3">
        <select name="language" defaultValue={defaultLanguage} style={{ ...authInputStyle, marginBottom: 0 }}>
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
      <textarea
        name="content"
        placeholder="Pega tu texto aquí (mínimo 15 palabras)"
        required
        rows={10}
        style={{ ...authInputStyle, marginBottom: 0, resize: 'vertical', fontFamily: 'inherit' }}
      />
      <div>
        <label className="mb-1 block text-xs font-semibold" style={{ color: '#6B6E76' }}>
          Portada (opcional) — si no subís una, generamos una automática
        </label>
        <input type="file" name="cover" accept="image/*" style={{ ...authInputStyle, marginBottom: 0, padding: '8px 10px' }} />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="font-jakarta self-start"
        style={{ ...authButtonStyle(accentBase(defaultLanguage)), width: 'auto', padding: '12px 28px', marginTop: 4 }}
      >
        {pending ? 'Guardando…' : 'Guardar en mi biblioteca'}
      </button>
    </form>
  )
}
