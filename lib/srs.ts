import { Grade, WordStatus } from '@/types'

interface SrsState {
  ease_factor: number
  interval_days: number
  repetitions: number
}

interface SrsResult extends SrsState {
  due_date: string
  status: WordStatus
}

const GRADE_EASE_DELTA: Record<Exclude<Grade, 'again'>, number> = {
  hard: -0.15,
  good: 0,
  easy: 0.15,
}

// Algoritmo de la familia SM-2 (misma base que el scheduler de Anki), adaptado a 4 botones.
export function schedule(state: SrsState, grade: Grade): SrsResult {
  let { ease_factor: ease, interval_days: interval, repetitions } = state

  if (grade === 'again') {
    repetitions = 0
    interval = 1
    ease = Math.max(1.3, ease - 0.2)
  } else {
    repetitions += 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 6
    else interval = Math.round(interval * ease)

    ease = Math.max(1.3, ease + GRADE_EASE_DELTA[grade])
    if (grade === 'hard') interval = Math.max(1, Math.round(interval * 0.8))
    if (grade === 'easy') interval = Math.round(interval * 1.3)
  }

  const due = new Date()
  due.setDate(due.getDate() + interval)

  const status: WordStatus = interval >= 21 ? 'known' : repetitions === 0 ? 'new' : 'learning'

  return { ease_factor: ease, interval_days: interval, repetitions, due_date: due.toISOString(), status }
}

export function newCardState(): SrsState & { due_date: string; status: WordStatus } {
  return { ease_factor: 2.5, interval_days: 0, repetitions: 0, due_date: new Date().toISOString(), status: 'new' }
}
