-- Migración v4 — correr después de migration_v3.sql en el SQL Editor de Supabase.
-- Quiz de comprensión lectora (distinto del quiz de gramática, que vive en grammar_points):
-- preguntas sobre el texto completo, no ancladas a una oración específica.

create table comprehension_questions (
  id uuid default gen_random_uuid() primary key,
  text_id uuid references texts(id) on delete cascade,
  position int not null default 0,
  question text not null,
  options text[] not null,
  correct_index int not null,
  created_at timestamptz default now()
);
alter table comprehension_questions enable row level security;
create policy "Comprehension questions are public read" on comprehension_questions for select using (true);
-- Escritura: solo vía Supabase Studio / script de curación, igual que grammar_points.
