-- Migración v2 — correr en Supabase Dashboard > SQL Editor, sobre el schema.sql ya aplicado.
-- No reescribe nada existente, solo agrega columnas/tablas.

-- ── Épica 1 (US1.7, US1.6): idioma activo persistente + flag de onboarding ──
alter table profiles add column active_lang text;
alter table profiles add column onboarding_completed boolean default false;

-- ── Épica 3 (US3.5, US3.6): origen y visibilidad de un texto ──
alter table texts add column owner_id uuid references auth.users(id);
alter table texts add column is_public boolean default false;
alter table texts add column source_type text default 'curated';
-- source_type: 'curated' (dominio público / escrito por admin) | 'user' (importado, privado por defecto)

-- Un usuario puede marcar su propio texto importado como público (US3.5)
create policy "Users can update own texts" on texts for update using (auth.uid() = owner_id);
-- La política "Texts are public" (select) ya cubre lectura; se ajusta para no exponer textos
-- privados de otros usuarios:
drop policy if exists "Texts are public" on texts;
create policy "Curated and public texts are visible to all" on texts
  for select using (source_type = 'curated' or is_public = true or auth.uid() = owner_id);

-- ── Épica 3 (nota técnica) + Épica 4 (US4.1): caché de traducciones ──
create table translations_cache (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  source_lang text not null,
  target_lang text not null,
  translation text not null,
  created_at timestamptz default now(),
  unique(word, source_lang, target_lang)
);
alter table translations_cache enable row level security;
create policy "Translations cache is public read" on translations_cache for select using (true);
-- Solo el service role (API route) escribe acá — no hay policy de insert para usuarios anónimos.

-- ── Épica 12: gramática contextualizada (solo catálogo curado en MVP) ──
create table grammar_points (
  id uuid default gen_random_uuid() primary key,
  text_id uuid references texts(id) on delete cascade,
  sentence_index int not null,       -- qué oración del texto dispara esto (0-indexed)
  language text not null,
  title text not null,               -- ej. "¿Por qué imparfait aquí?"
  body text not null,                -- explicación de 3-5 min
  quiz_question text,                -- opcional: pregunta de la Épica 12 (US12.2)
  quiz_options text[],
  quiz_correct_index int,
  created_at timestamptz default now()
);
alter table grammar_points enable row level security;
create policy "Grammar points are public read" on grammar_points for select using (true);
-- Escritura: solo vía Supabase Studio / script de curación, no expuesto a usuarios.

-- ── daily_stats.words_seen ya cubre parte de US7.2, sin cambios necesarios ──
