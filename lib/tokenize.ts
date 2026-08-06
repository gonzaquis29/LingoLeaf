import type { Language } from '@/types'

export interface Token {
  text: string
  isWordLike: boolean
  sentenceIndex: number
}

export interface TokenizedText {
  sentences: string[]
  tokens: Token[]
}

const SEGMENTER_LOCALE: Record<Language, string> = {
  fr: 'fr',
  de: 'de',
  en: 'en',
  es: 'es',
  zh: 'zh',
}

// Intl.Segmenter con locale 'zh' segmenta por diccionario, no por espacios — necesario porque
// el chino no separa palabras visualmente. Si la calidad no alcanza, jieba-wasm queda como fallback.
// Segmenta primero por oración (para anclar grammar_points.sentence_index y el contexto de
// vocabulary.context) y dentro de cada oración por palabra.
export function tokenizeText(text: string, language: Language): TokenizedText {
  const locale = SEGMENTER_LOCALE[language]
  const sentenceSegmenter = new Intl.Segmenter(locale, { granularity: 'sentence' })
  const wordSegmenter = new Intl.Segmenter(locale, { granularity: 'word' })

  const sentences: string[] = []
  const tokens: Token[] = []

  let sentenceIndex = 0
  for (const { segment: sentence } of sentenceSegmenter.segment(text)) {
    const trimmed = sentence.trim()
    if (!trimmed) continue
    sentences.push(trimmed)
    for (const { segment, isWordLike } of wordSegmenter.segment(sentence)) {
      tokens.push({ text: segment, isWordLike: Boolean(isWordLike), sentenceIndex })
    }
    sentenceIndex++
  }

  return { sentences, tokens }
}
