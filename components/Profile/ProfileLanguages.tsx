'use client'

import { useActionState } from 'react'
import { updateLanguages } from '@/app/actions/profile'
import { LANGUAGES } from '@/lib/languages'
import { LangPill } from '@/components/Shared/LangPill'
import { authButtonStyle } from '@/components/Auth/authStyles'
import { accentBase, COLORS } from '@/lib/theme'
import { useT } from '@/components/i18n/I18nProvider'
import type { Language } from '@/types'

// AC US7.3: cambiar idioma nativo o agregar/quitar idiomas aprendidos.
export function ProfileLanguages({
  nativeLanguage,
  learningLanguages,
  activeLang,
}: {
  nativeLanguage: Language
  learningLanguages: Language[]
  activeLang: Language
}) {
  const t = useT()
  const [state, formAction, pending] = useActionState(updateLanguages, undefined)

  return (
    <form action={formAction}>
      <h2 className="font-jakarta mb-3" style={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}>
        {t('profile_native_language')}
      </h2>
      <div className="mb-6 flex flex-wrap gap-2.5">
        {LANGUAGES.map((lang) => (
          <LangPill
            key={lang.code}
            inputType="radio"
            name="native_language"
            value={lang.code}
            label={lang.label}
            flag={lang.flag}
            defaultChecked={lang.code === nativeLanguage}
          />
        ))}
      </div>

      <h2 className="font-jakarta mb-3" style={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}>
        {t('profile_learning_languages')}
      </h2>
      <div className="mb-6 flex flex-wrap gap-2.5">
        {LANGUAGES.map((lang) => (
          <LangPill
            key={lang.code}
            inputType="checkbox"
            name="learning_languages"
            value={lang.code}
            label={lang.label}
            flag={lang.flag}
            defaultChecked={learningLanguages.includes(lang.code)}
          />
        ))}
      </div>

      {state?.error && (
        <p role="alert" className="mb-3 text-sm" style={{ color: 'oklch(58% 0.20 25)' }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="font-jakarta"
        style={{ ...authButtonStyle(accentBase(activeLang)), width: 'auto', padding: '12px 28px' }}
      >
        {pending ? t('common_saving') : t('common_save_changes')}
      </button>
    </form>
  )
}
