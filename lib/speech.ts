const LANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
}

// Web Speech API nativa del navegador: sin key, sin backend, sin costo.
export function speak(text: string, language: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANG_MAP[language] || language
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}
