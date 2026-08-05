export type Language = 'fr' | 'de' | 'zh' | 'en' | 'es'
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type WordStatus = 'new' | 'learning' | 'known'
export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface Text {
  id: string
  title: string
  content: string
  language: Language
  level: Level
  source: string
  source_url?: string
  word_count: number
  created_at: string
}

export interface VocabularyItem {
  id: string
  user_id: string
  word: string
  translation: string
  context?: string
  language: Language
  status: WordStatus
  ease_factor: number
  interval_days: number
  repetitions: number
  due_date: string
  last_reviewed_at?: string
  text_id?: string
  created_at: string
  updated_at: string
}

export interface ReadingProgress {
  user_id: string
  text_id: string
  progress_pct: number
  completed: boolean
  last_read_at: string
}

export interface DailyStats {
  date: string
  words_seen: number
  words_marked: number
  minutes_read: number
}

export interface Profile {
  id: string
  native_language: Language
  learning_languages: Language[]
  streak_days: number
  last_active_date: string
}

export interface TranslationResult {
  word: string
  translation: string
  language: Language
}
