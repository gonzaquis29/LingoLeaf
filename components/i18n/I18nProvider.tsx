'use client'

import { createContext, useContext } from 'react'
import { t as translate } from '@/lib/i18n/t'
import type { DictKey, UiLang } from '@/lib/i18n/dict'

const UiLangContext = createContext<UiLang>('es')

export function I18nProvider({ uiLang, children }: { uiLang: UiLang; children: React.ReactNode }) {
  return <UiLangContext.Provider value={uiLang}>{children}</UiLangContext.Provider>
}

// Hook para Client Components — los Server Components llaman a t(key, uiLang) directo,
// ya que no pueden usar Context.
export function useT() {
  const uiLang = useContext(UiLangContext)
  return (key: DictKey) => translate(key, uiLang)
}
