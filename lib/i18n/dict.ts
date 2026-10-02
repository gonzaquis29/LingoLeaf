export type UiLang = 'es' | 'en'

// Cobertura: solo la interfaz posterior al onboarding (donde ya sabemos native_language).
// Login/registro/onboarding eligen el idioma nativo, así que por definición todavía no
// pueden localizarse en base a él — se quedan en español ahí.
export const dict = {
  // Header
  nav_library: { es: 'Biblioteca', en: 'Library' },
  nav_vocabulary: { es: 'Vocabulario', en: 'Vocabulary' },
  nav_review: { es: 'Repaso', en: 'Review' },
  nav_profile: { es: 'Perfil', en: 'Profile' },
  nav_add_content: { es: 'Agregar contenido', en: 'Add content' },
  nav_add_language: { es: '+ Agregar idioma', en: '+ Add language' },
  nav_sign_out: { es: 'Cerrar sesión', en: 'Sign out' },

  // Library
  library_eyebrow_prefix: { es: '', en: '' },
  library_title: { es: 'Biblioteca', en: 'Library' },
  library_add_content: { es: 'Agrega tu propio texto', en: 'Add your own text' },
  library_add_hint: { es: 'Pega, importa de una URL o elige del catálogo', en: 'Paste, import from a URL or pick from the catalog' },
  library_level: { es: 'Nivel', en: 'Level' },
  library_words: { es: 'palabras', en: 'words' },
  library_known: { es: 'conocido', en: 'known' },
  library_read: { es: 'Leer', en: 'Read' },
  library_all_levels: { es: 'Todos los niveles', en: 'All levels' },
  pct_very_hard: { es: 'Muy difícil', en: 'Very hard' },
  pct_challenging: { es: 'Desafiante', en: 'Challenging' },
  pct_ideal: { es: 'Nivel ideal', en: 'Ideal level' },
  pct_mastered: { es: 'Ya lo dominas', en: 'Already mastered' },

  // Reader
  reader_level: { es: 'Nivel', en: 'Level' },
  reader_hint: {
    es: 'Toca cualquier palabra resaltada para ver su traducción y añadirla a tu repaso.',
    en: 'Tap any highlighted word to see its translation and add it to your review.',
  },
  reader_stat_new: { es: 'nuevas', en: 'new' },
  reader_stat_learning: { es: 'aprendiendo', en: 'learning' },
  reader_stat_known: { es: 'conocidas', en: 'known' },
  reader_legend_new: { es: 'Nueva', en: 'New' },
  reader_legend_known: { es: 'Conocida (sin marca)', en: 'Known (unmarked)' },
  reader_session_label: { es: 'Esta sesión:', en: 'This session:' },
  reader_session_empty: { es: 'toca una palabra del texto para empezar', en: 'tap a word in the text to start' },
  reader_grammar_title: { es: 'Gramática en este texto', en: 'Grammar in this text' },
  grammar_correct: { es: '¡Correcto!', en: 'Correct!' },
  grammar_incorrect: { es: 'No es esa — intenta de nuevo.', en: "That's not it — try again." },
  quiz_start_cta: { es: 'Hacer quiz de comprensión →', en: 'Take comprehension quiz →' },
  quiz_correct_suffix: { es: 'correctas', en: 'correct' },
  quiz_all_correct: { es: '¡Entendiste todo el texto!', en: 'You understood the whole text!' },
  quiz_retry_hint: {
    es: 'Repasa el texto de nuevo si quieres mejorar tu resultado.',
    en: 'Read the text again if you want to improve your score.',
  },
  quiz_close: { es: 'Cerrar', en: 'Close' },
  quiz_question_prefix: { es: 'Pregunta', en: 'Question' },
  quiz_question_of: { es: 'de', en: 'of' },
  quiz_next: { es: 'Siguiente', en: 'Next' },
  quiz_see_result: { es: 'Ver resultado', en: 'See result' },

  // WordBubble
  bubble_translating: { es: 'Traduciendo…', en: 'Translating…' },
  bubble_learning_level: { es: 'Aprendiendo · nivel', en: 'Learning · level' },
  bubble_known: { es: 'Conocida', en: 'Known' },
  bubble_hint: {
    es: 'Se irá aclarando con cada repaso hasta que la marques como conocida.',
    en: 'It will get lighter with each review until you mark it as known.',
  },
  bubble_add: { es: '+ Añadir a repaso', en: '+ Add to review' },
  bubble_saving: { es: 'Guardando…', en: 'Saving…' },
  bubble_already_know: { es: 'Ya la sé', en: 'I already know it' },
  bubble_remove: { es: 'Quitar de repaso', en: 'Remove from review' },

  // Review
  review_progress: { es: 'de', en: 'of' },
  review_show_answer: { es: 'Mostrar respuesta', en: 'Show answer' },
  review_finished_eyebrow: { es: 'Repaso del día terminado', en: "Today's review finished" },
  review_eyebrow: { es: 'Repaso', en: 'Review' },
  review_none_pending: { es: 'No tienes tarjetas pendientes', en: 'No cards pending' },
  review_none_pending_hint: {
    es: 'Vuelve más tarde o agrega palabras nuevas desde Vocabulario.',
    en: 'Come back later or add new words from Vocabulary.',
  },
  review_words_reviewed: { es: 'repasada(s) hoy', en: 'reviewed today' },
  review_back_to_library: { es: 'Volver a la Biblioteca', en: 'Back to Library' },
  review_exit: { es: 'Salir del repaso', en: 'Exit review' },
  grade_again: { es: 'Otra vez', en: 'Again' },
  grade_hard: { es: 'Difícil', en: 'Hard' },
  grade_good: { es: 'Bien', en: 'Good' },
  grade_easy: { es: 'Fácil', en: 'Easy' },
  review_question: { es: '¿Qué significa esta palabra?', en: 'What does this word mean?' },
  time_today: { es: 'hoy', en: 'today' },
  time_tomorrow: { es: 'mañana', en: 'tomorrow' },
  time_month: { es: '1 mes', en: '1 month' },
  time_months: { es: 'meses', en: 'months' },

  // Profile
  profile_eyebrow: { es: 'Perfil · racha', en: 'Profile · streak' },
  profile_streak_suffix: { es: 'días de racha usando Lingoleaf', en: 'day streak using Lingoleaf' },
  profile_streak_suffix_singular: { es: 'día de racha usando Lingoleaf', en: 'day streak using Lingoleaf' },
  profile_native_language: { es: 'Idioma nativo', en: 'Native language' },
  profile_learning_languages: { es: 'Idiomas que estás aprendiendo', en: "Languages you're learning" },
  common_saving: { es: 'Guardando…', en: 'Saving…' },
  common_save_changes: { es: 'Guardar cambios', en: 'Save changes' },

  // Vocabulary
  vocab_title: { es: 'Vocabulario', en: 'Vocabulary' },
  vocab_add_word: { es: 'Agregar una palabra', en: 'Add a word' },
  vocab_word: { es: 'Palabra', en: 'Word' },
  vocab_translation: { es: 'Traducción', en: 'Translation' },
  vocab_context: { es: 'Contexto (opcional)', en: 'Context (optional)' },
  vocab_cancel: { es: 'Cancelar', en: 'Cancel' },
  vocab_save: { es: 'Guardar', en: 'Save' },
  vocab_filter_all: { es: 'Todas', en: 'All' },
  vocab_status_new: { es: 'Nueva', en: 'New' },
  vocab_status_learning: { es: 'Aprendiendo', en: 'Learning' },
  vocab_status_known: { es: 'Conocida', en: 'Known' },
  vocab_level_short: { es: 'Nivel', en: 'Level' },
  vocab_export: { es: 'Exportar', en: 'Export' },
  vocab_export_anki: { es: 'Mazo de Anki (.apkg)', en: 'Anki deck (.apkg)' },
  vocab_generating: { es: 'Generando…', en: 'Generating…' },
  vocab_empty_language: { es: 'Todavía no guardaste ninguna palabra en este idioma.', en: "You haven't saved any words in this language yet." },
  vocab_empty_filter: { es: 'Nada en este filtro.', en: 'Nothing in this filter.' },
  vocab_due: { es: 'vence', en: 'due' },
  vocab_add_aria: { es: 'Agregar palabra', en: 'Add word' },

  // Add content
  add_title: { es: 'Agregar contenido', en: 'Add content' },
  add_tab_paste: { es: 'Pegar texto', en: 'Paste text' },
  add_tab_url: { es: 'Pegar URL', en: 'Paste URL' },
  add_tab_search: { es: 'Buscar catálogo', en: 'Search catalog' },
  add_subtitle: { es: 'Convierte cualquier texto en una lección de lectura', en: 'Turn any text into a reading lesson' },
  add_desc_paste: { es: 'Un artículo, una letra de canción o un capítulo', en: 'An article, song lyrics or a chapter' },
  add_desc_url: { es: 'Importamos el texto limpio de una página web', en: 'We pull the clean text from a web page' },
  add_desc_search: { es: 'Textos listos para leer, con gramática incluida', en: 'Ready-to-read texts with grammar included' },
} as const

export type DictKey = keyof typeof dict
