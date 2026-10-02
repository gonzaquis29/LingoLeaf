export type Language = 'fr' | 'de' | 'zh' | 'en' | 'es'
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type WordStatus = 'new' | 'learning' | 'known'
export type Grade = 'again' | 'hard' | 'good' | 'easy'
export type SourceType = 'curated' | 'user'

export interface Text {
  id: string
  title: string
  content: string
  language: Language
  level: Level
  source: string
  source_url?: string
  word_count: number
  owner_id?: string
  is_public: boolean
  source_type: SourceType
  cover_url?: string | null
  created_at: string
}

export interface GrammarPoint {
  id: string
  text_id: string
  sentence_index: number
  language: Language
  title: string
  body: string
  quiz_question?: string
  quiz_options?: string[]
  quiz_correct_index?: number
  created_at: string
}

export interface TranslationCacheEntry {
  word: string
  source_lang: Language
  target_lang: Language
  translation: string
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
  active_lang?: Language
  onboarding_completed: boolean
  streak_days: number
  last_active_date: string
}

export interface TranslationResult {
  word: string
  translation: string
  language: Language
}
