import type { Level } from '@/types'

// Heurística por longitud media de palabra — no es NLP real, aproxima el nivel mientras no haya
// un detector más preciso (deuda técnica reconocida, igual que la lematización — ver Épica 11).
export function detectLevel(content: string, wordCount: number): Level {
  if (wordCount === 0) return 'A1'
  const letters = content.replace(/[^\p{L}]/gu, '').length
  const avgWordLength = letters / wordCount

  if (wordCount < 60 && avgWordLength < 4.6) return 'A1'
  if (avgWordLength < 5) return 'A2'
  if (avgWordLength < 5.6) return 'B1'
  if (avgWordLength < 6.2) return 'B2'
  return 'C1'
}
