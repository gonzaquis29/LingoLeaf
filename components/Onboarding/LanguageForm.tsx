'use client'

import { useActionState } from 'react'
import { saveLanguages } from '@/app/actions/onboarding'
import { LANGUAGES } from '@/lib/languages'
import { accentBase } from '@/lib/theme'
import { authButtonStyle, authHeadingStyle } from '@/components/Auth/authStyles'
import { LangPill } from '@/components/Shared/LangPill'

export function LanguageForm() {
  const [state, formAction, pending] = useActionState(saveLanguages, undefined)

  return (
    <form action={formAction} className="font-sans">
      <h1 className="font-jakarta" style={authHeadingStyle}>
        ¿Cuál es tu idioma nativo?
      </h1>
      <p className="mb-6 text-sm" style={{ color: '#6B6E76' }}>
        Lo usamos para tus traducciones y explicaciones de gramática.
      </p>
      <div className="mb-7 flex flex-wrap gap-2.5">
        {LANGUAGES.map((lang) => (
          <LangPill
            key={lang.code}
            inputType="radio"
            name="native_language"
            value={lang.code}
            label={lang.label}
            flag={lang.flag}
            defaultChecked={lang.code === 'es'}
          />
        ))}
      </div>

      <h2 className="font-jakarta" style={{ ...authHeadingStyle, fontSize: 20 }}>
        ¿Qué idiomas quieres aprender?
      </h2>
      <p className="mb-6 text-sm" style={{ color: '#6B6E76' }}>
        Elige al menos uno. El primero que marques queda como tu idioma activo.
      </p>
      <div className="mb-7 flex flex-wrap gap-2.5">
        {LANGUAGES.map((lang) => (
          <LangPill
            key={lang.code}
            inputType="checkbox"
            name="learning_languages"
            value={lang.code}
            label={lang.label}
            flag={lang.flag}
          />
        ))}
      </div>

      {state?.error && (
        <p role="alert" className="mb-3 text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="font-jakarta" style={authButtonStyle(accentBase())}>
        {pending ? 'Guardando…' : 'Continuar'}
      </button>
    </form>
  )
}
