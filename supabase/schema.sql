-- Tabla de textos (contenido de la biblioteca)
create table texts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  language text not null,
  level text not null,
  source text,
  source_url text,
  word_count int,
  created_at timestamptz default now()
);

-- Tabla de vocabulario del usuario, con estado de repetición espaciada (SM-2)
create table vocabulary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  word text not null,
  translation text not null,
  context text,
  language text not null,
  text_id uuid references texts(id),

  status text default 'new',
  ease_factor real default 2.5,
  interval_days int default 0,
  repetitions int default 0,
  due_date timestamptz default now(),
  last_reviewed_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, word, language)
);

-- Tabla de progreso de lectura
create table reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  text_id uuid references texts(id) on delete cascade,
  progress_pct int default 0,
  completed boolean default false,
  last_read_at timestamptz default now(),
  unique(user_id, text_id)
);

-- Estadísticas diarias (fase posterior, se deja creada desde ya)
create table daily_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date default current_date,
  words_seen int default 0,
  words_marked int default 0,
  minutes_read int default 0,
  unique(user_id, date)
);

-- Perfiles de usuario
create table profiles (
  id uuid references auth.users(id) primary key,
  native_language text default 'es',
  learning_languages text[] default '{}',
  streak_days int default 0,
  last_active_date date,
  created_at timestamptz default now()
);

-- RLS: cada usuario solo ve sus propios datos
alter table vocabulary enable row level security;
alter table reading_progress enable row level security;
alter table daily_stats enable row level security;
alter table profiles enable row level security;

create policy "Users see own vocabulary" on vocabulary for all using (auth.uid() = user_id);
create policy "Users see own progress" on reading_progress for all using (auth.uid() = user_id);
create policy "Users see own stats" on daily_stats for all using (auth.uid() = user_id);
create policy "Users see own profile" on profiles for all using (auth.uid() = id);

-- Los textos son públicos (lectura)
alter table texts enable row level security;
create policy "Texts are public" on texts for select using (true);
