-- Lingoleaf — setup completo para un proyecto de Supabase nuevo.
-- Consolida schema.sql + migration_v2/v3/v4.sql + seed.sql + seed_grammar.sql +
-- seed_comprehension.sql en un solo archivo, con el estado FINAL de cada tabla
-- (sin los pasos intermedios de alter/drop que solo tenían sentido migrando
-- una base ya en uso). Correr una sola vez, completo, en el SQL Editor de un
-- proyecto recién creado.
--
-- Los archivos individuales (schema.sql, migration_v2.sql, etc.) quedan en el
-- repo como historial de cómo se llegó a este estado — no hace falta correrlos
-- si usás este archivo.

-- ─────────────────────────────────────────────────────────────────────────
-- Tablas
-- ─────────────────────────────────────────────────────────────────────────

create table texts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  language text not null,
  level text not null,
  source text,
  source_url text,
  word_count int,
  owner_id uuid references auth.users(id),
  is_public boolean default false,
  source_type text default 'curated', -- 'curated' (dominio público / admin) | 'user' (importado)
  cover_url text,
  created_at timestamptz default now()
);

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

create table reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  text_id uuid references texts(id) on delete cascade,
  progress_pct int default 0,
  completed boolean default false,
  last_read_at timestamptz default now(),
  unique(user_id, text_id)
);

create table daily_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  date date default current_date,
  words_seen int default 0,
  words_marked int default 0,
  minutes_read int default 0,
  unique(user_id, date)
);

create table profiles (
  id uuid references auth.users(id) primary key,
  native_language text default 'es',
  learning_languages text[] default '{}',
  active_lang text,
  onboarding_completed boolean default false,
  streak_days int default 0,
  last_active_date date,
  created_at timestamptz default now()
);

create table translations_cache (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  source_lang text not null,
  target_lang text not null,
  translation text not null,
  created_at timestamptz default now(),
  unique(word, source_lang, target_lang)
);

create table grammar_points (
  id uuid default gen_random_uuid() primary key,
  text_id uuid references texts(id) on delete cascade,
  sentence_index int not null,       -- qué oración del texto dispara esto (0-indexed)
  language text not null,
  title text not null,
  body text not null,
  quiz_question text,
  quiz_options text[],
  quiz_correct_index int,
  created_at timestamptz default now()
);

create table comprehension_questions (
  id uuid default gen_random_uuid() primary key,
  text_id uuid references texts(id) on delete cascade,
  position int not null default 0,
  question text not null,
  options text[] not null,
  correct_index int not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

alter table texts enable row level security;
alter table vocabulary enable row level security;
alter table reading_progress enable row level security;
alter table daily_stats enable row level security;
alter table profiles enable row level security;
alter table translations_cache enable row level security;
alter table grammar_points enable row level security;
alter table comprehension_questions enable row level security;

create policy "Curated and public texts are visible to all" on texts
  for select using (source_type = 'curated' or is_public = true or auth.uid() = owner_id);
create policy "Users can insert own texts" on texts for insert with check (auth.uid() = owner_id);
create policy "Users can update own texts" on texts for update using (auth.uid() = owner_id);

create policy "Users see own vocabulary" on vocabulary for all using (auth.uid() = user_id);
create policy "Users see own progress" on reading_progress for all using (auth.uid() = user_id);
create policy "Users see own stats" on daily_stats for all using (auth.uid() = user_id);
create policy "Users see own profile" on profiles for all using (auth.uid() = id);

-- Lectura pública; la escritura la hace únicamente lib/supabase/admin.ts (service role),
-- que bypassa RLS — no hay policy de insert para usuarios anónimos.
create policy "Translations cache is public read" on translations_cache for select using (true);
create policy "Grammar points are public read" on grammar_points for select using (true);
create policy "Comprehension questions are public read" on comprehension_questions for select using (true);

-- ─────────────────────────────────────────────────────────────────────────
-- Storage — portadas de texto (bucket público, cualquier usuario autenticado
-- puede subir/reemplazar; misma postura de confianza que ya rige "texts").
-- ─────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('text-covers', 'text-covers', true)
  on conflict (id) do nothing;

create policy "Authenticated users can upload text covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'text-covers');
create policy "Authenticated users can update text covers" on storage.objects
  for update to authenticated using (bucket_id = 'text-covers');

-- ─────────────────────────────────────────────────────────────────────────
-- Trigger: crea la fila de profiles automáticamente al registrarse
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Contenido semilla — 5 textos
-- ─────────────────────────────────────────────────────────────────────────

insert into texts (title, content, language, level, source, word_count) values

('Le Petit Prince — Chapitre I',
'Lorsque j''avais six ans j''ai vu, une fois, une magnifique image, dans un livre sur la Forêt Vierge, appelé "Histoires Vécues". Ça représentait un boa constricteur qui avalait un fauve. Voilà la copie du dessin. On disait dans le livre: "Les boas constricteurs avalent leur proie tout entière, sans la mâcher. Ensuite ils ne peuvent plus bouger et ils dorment pendant les six mois de leur digestion."
J''ai alors beaucoup réfléchi sur les aventures de la jungle et, à mon tour, j''ai réussi, avec un crayon de couleur, à tracer mon premier dessin. Mon dessin numéro 1. Il était comme ça.',
'fr', 'B1', 'gutenberg', 120),

('Mein Tag — Ein einfacher Text',
'Jeden Morgen stehe ich um sieben Uhr auf. Ich dusche und frühstücke. Zum Frühstück esse ich Brot mit Butter und trinke Kaffee. Dann fahre ich mit dem Bus zur Arbeit. Ich arbeite in einem Büro in der Stadtmitte. Meine Kollegen sind sehr nett. Um zwölf Uhr esse ich in der Kantine zu Mittag. Nachmittags arbeite ich weiter bis um fünf Uhr. Dann fahre ich wieder nach Hause. Abends koche ich und schaue fern oder lese ein Buch. Um zehn Uhr gehe ich schlafen.',
'de', 'A2', 'original', 95),

('A Day at the Park',
'It is a sunny day. Anna and her dog go to the park. The park is big and green. There are many trees and flowers. Anna throws a ball and the dog runs fast. Other children play on the swings. An old man reads a book on a bench. A woman walks with a baby in a pram. The dog is happy. Anna is happy too. They stay at the park for two hours. Then they walk home. Anna gives the dog water and food. The dog sleeps. Anna watches television.',
'en', 'A1', 'original', 85),

('La ciudad de mis sueños',
'Mi ciudad favorita es Barcelona. Está en el norte de España, cerca del mar Mediterráneo. Tiene playas muy bonitas y mucha cultura. Lo más famoso de Barcelona es la Sagrada Familia, una iglesia enorme diseñada por el arquitecto Antoni Gaudí. También hay otros edificios de Gaudí muy originales, como el Parque Güell. La ciudad tiene un barrio antiguo que se llama el Barrio Gótico, con calles estrechas y edificios históricos. La gente de Barcelona es muy amable y le gusta salir a cenar tarde, normalmente a las nueve o las diez de la noche.',
'es', 'A2', 'original', 100),

('我的家庭 — Mi familia',
'我有一个很幸福的家庭。我的爸爸是老师，他在学校工作。我的妈妈是医生，她在医院上班。我有一个哥哥和一个妹妹。哥哥今年二十岁，在大学读书。妹妹十岁，在小学读书。我们家有一只猫，它叫小白。周末的时候，我们全家一起去公园散步或者在家看电影。我很爱我的家人。',
'zh', 'A2', 'original', 60);

-- ─────────────────────────────────────────────────────────────────────────
-- Contenido semilla — gramática (Épica 12, 2 puntos por texto)
-- ─────────────────────────────────────────────────────────────────────────

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'fr',
  '¿Por qué "j''avais" y no "j''ai eu"?',
  'El imparfait ("j''avais six ans") describe un estado de fondo — cómo eran las cosas — mientras que el passé composé ("j''ai vu") marca la acción puntual que ocurrió durante ese estado. Es el patrón clásico "descripción + evento" del francés narrativo.',
  '¿Por qué se usa "j''avais" (imparfait) y no "j''ai eu" (passé composé) para dar la edad?',
  array['Porque describe un estado de fondo, no una acción puntual', 'Porque "avoir" nunca usa passé composé', 'Porque es una regla arbitraria sin motivo'],
  0
from texts where title = 'Le Petit Prince — Chapitre I';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 3, 'fr',
  '"sans la mâcher" — sin + infinitivo',
  '"Sans" + infinitivo funciona igual que "sin" + infinitivo en español: describe una acción que NO ocurre. "Avaler sans mâcher" = tragar sin masticar. El verbo después de "sans" siempre queda en infinitivo, nunca conjugado.',
  '¿Qué función cumple "sans" + infinitivo en "sans la mâcher"?',
  array['Indica una acción que NO se hace, igual que "sin + infinitivo" en español', 'Es un tiempo verbal especial del francés', 'Convierte el verbo en sustantivo'],
  0
from texts where title = 'Le Petit Prince — Chapitre I';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'de',
  '¿Por qué "auf" está al final?',
  '"Aufstehen" (levantarse) es un verbo separable: el prefijo "auf" se separa del verbo y se manda al final de la oración principal ("Ich stehe ... auf"). En el infinitivo van juntos, pero en una oración conjugada se separan siempre.',
  '¿Dónde va el prefijo "auf" de "aufstehen" en una oración principal?',
  array['Al final de la oración', 'Pegado siempre al verbo, como en el infinitivo', 'Al principio de la oración'],
  0
from texts where title = 'Mein Tag — Ein einfacher Text';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 3, 'de',
  '"mit dem Bus" — dativo después de "mit"',
  'La preposición "mit" (con) siempre rige el caso dativo. Por eso "der Bus" se convierte en "dem Bus": el artículo cambia de forma para marcar el caso, no el sustantivo en sí.',
  'La preposición "mit" siempre exige el caso:',
  array['Dativo', 'Acusativo', 'Genitivo'],
  0
from texts where title = 'Mein Tag — Ein einfacher Text';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'en',
  'El "it" que no significa nada',
  'En inglés, hablar del clima siempre requiere un sujeto explícito aunque no haya nada real a lo que se refiera — es el "dummy it". "It is sunny" no se puede decir solo "Is sunny", a diferencia del español donde "Hace sol" no necesita sujeto.',
  'En "It is a sunny day", ¿a qué se refiere "it"?',
  array['A nada en concreto — es obligatorio en inglés para hablar del clima', 'Al sol', 'Al día anterior'],
  0
from texts where title = 'A Day at the Park';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 1, 'en',
  '"Anna and her dog go" — sujeto compuesto',
  'Cuando dos sujetos se unen con "and" ("Anna and her dog"), el verbo va en plural ("go"), aunque cada sujeto por separado sea singular ("Anna goes", "the dog goes"). Es el mismo patrón que en español: "Anna y su perro van".',
  '"Anna and her dog go to the park" usa "go" y no "goes" porque:',
  array['El sujeto compuesto siempre lleva el verbo en plural', 'Anna es un sustantivo plural', 'Es un error del texto'],
  0
from texts where title = 'A Day at the Park';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 3, 'es',
  '"diseñada por" — voz pasiva',
  'La voz pasiva se forma con "ser" + participio + "por" + el agente que realiza la acción: "la Sagrada Familia [fue] diseñada por Gaudí". El participio concuerda en género y número con el sujeto ("diseñada", femenino, por "la Sagrada Familia").',
  '"diseñada por el arquitecto" es voz pasiva. ¿Cómo se forma?',
  array['ser/estar + participio + por + agente', 'el participio solo, sin verbo auxiliar', 'con el verbo "hacer" siempre'],
  0
from texts where title = 'La ciudad de mis sueños';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 6, 'es',
  '"le gusta" — verbos como gustar',
  'Con "gustar" el sujeto gramatical es la cosa que gusta ("salir a cenar tarde"), y la persona aparece como objeto indirecto ("le"). Por eso se dice "le gusta salir", no "él gusta salir" — el verbo concuerda con lo que gusta, no con la persona.',
  'En "le gusta salir", ¿qué función tiene "le"?',
  array['Objeto indirecto — quien recibe el gusto, no quien actúa', 'Sujeto de la oración', 'Un artículo'],
  0
from texts where title = 'La ciudad de mis sueños';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 1, 'zh',
  '"在学校工作" — 在 + lugar antes del verbo',
  'En chino, la estructura "en + lugar" (在学校 = "en la escuela") va ANTES del verbo, al revés que en español ("trabaja en la escuela"). El orden literal es "él en-escuela trabaja".',
  '¿Dónde va "在 + lugar" respecto al verbo en chino?',
  array['Antes del verbo, al revés que en español', 'Después del verbo, igual que en español', 'Al final de toda la oración siempre'],
  0
from texts where title = '我的家庭 — Mi familia';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 4, 'zh',
  'La edad sin verbo "ser": "二十岁"',
  'Para dar la edad, el chino no usa el verbo "ser" (是): "哥哥今年二十岁" es literalmente "hermano este-año veinte-años", sin ningún verbo entre el sujeto y la edad. Añadir "是" aquí sonaría antinatural.',
  '"哥哥今年二十岁" (mi hermano tiene 20 años) no usa el verbo "ser" (是). ¿Por qué?',
  array['La edad en chino se expresa con número + 岁 directamente, sin verbo', 'Es un error común de los principiantes', 'Solo se omite "是" con animales'],
  0
from texts where title = '我的家庭 — Mi familia';

-- ─────────────────────────────────────────────────────────────────────────
-- Contenido semilla — quiz de comprensión (Épica 4, US4.9, 3 preguntas por texto)
-- ─────────────────────────────────────────────────────────────────────────

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Qué representaba la imagen que vio el narrador en el libro sobre la Selva Virgen?',
  array['Un boa constrictor tragándose una fiera', 'Un león cazando', 'Un elefante en la selva'], 0
from texts where title = 'Le Petit Prince — Chapitre I';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'Según el libro, ¿qué hacen los boas después de tragar a su presa?',
  array['Duermen seis meses sin poder moverse', 'Vomitan de inmediato', 'Corren muy rápido'], 0
from texts where title = 'Le Petit Prince — Chapitre I';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Qué edad tenía el narrador cuando vio esta imagen por primera vez?',
  array['Seis años', 'Diez años', 'Tres años'], 0
from texts where title = 'Le Petit Prince — Chapitre I';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿A qué hora se levanta la persona cada mañana?',
  array['A las siete', 'A las ocho', 'A las seis'], 0
from texts where title = 'Mein Tag — Ein einfacher Text';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Qué come de desayuno?',
  array['Pan con mantequilla y café', 'Cereal con leche', 'Huevos y jugo'], 0
from texts where title = 'Mein Tag — Ein einfacher Text';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Cómo llega al trabajo?',
  array['En autobús', 'Caminando', 'En bicicleta'], 0
from texts where title = 'Mein Tag — Ein einfacher Text';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Qué hace Anna en el parque con la pelota?',
  array['Se la lanza al perro', 'La pierde', 'La guarda en su bolso'], 0
from texts where title = 'A Day at the Park';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Cuánto tiempo se quedan en el parque?',
  array['Dos horas', 'Media hora', 'Todo el día'], 0
from texts where title = 'A Day at the Park';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Qué hace Anna al llegar a casa, antes de que el perro duerma?',
  array['Le da agua y comida al perro', 'Lo baña', 'Lo deja afuera'], 0
from texts where title = 'A Day at the Park';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Quién diseñó la Sagrada Familia?',
  array['Antoni Gaudí', 'Pablo Picasso', 'Salvador Dalí'], 0
from texts where title = 'La ciudad de mis sueños';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿A qué hora suele salir a cenar la gente de Barcelona?',
  array['A las nueve o las diez de la noche', 'A las seis de la tarde', 'Al mediodía'], 0
from texts where title = 'La ciudad de mis sueños';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Cómo se llama el barrio antiguo de calles estrechas?',
  array['El Barrio Gótico', 'El Eixample', 'La Barceloneta'], 0
from texts where title = 'La ciudad de mis sueños';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿A qué se dedica el papá de la familia?',
  array['Es maestro', 'Es médico', 'Es ingeniero'], 0
from texts where title = '我的家庭 — Mi familia';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Cómo se llama el gato de la familia?',
  array['小白 (Xiǎobái)', '小黑 (Xiǎohēi)', '咪咪 (Mīmī)'], 0
from texts where title = '我的家庭 — Mi familia';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Qué hace la familia los fines de semana?',
  array['Pasean en el parque o ven películas en casa', 'Van de viaje al extranjero', 'Trabajan todo el día'], 0
from texts where title = '我的家庭 — Mi familia';

-- ─────────────────────────────────────────────────────────────────────────
-- Contenido semilla ampliado (v2) — 15 textos más, 3 por idioma, repartidos
-- entre niveles A1 y C1. Regla nueva (solo para este contenido, no retroactiva
-- sobre los 5 textos de arriba): los quizzes de comprensión van en el idioma
-- destino para nivel A2 en adelante; los grammar_points siguen siempre en
-- español. Ver docs/superpowers/specs/2026-08-09-library-reader-content-design.md
-- ─────────────────────────────────────────────────────────────────────────
-- ─────────────────────────────────────────────────────────────────────────
-- 1) Textos — 15 nuevos (3 por idioma: fr, de, en, es, zh)
-- ─────────────────────────────────────────────────────────────────────────

insert into texts (title, content, language, level, source, word_count) values

-- Francés — A1, B1, C1
('Le marché du samedi',
'Le samedi matin, Julie va au marché avec sa mère. Le marché est près de la maison. Il y a beaucoup de fruits et de légumes. Julie aime les fraises et les pommes. Sa mère achète du pain frais et du fromage. Un vieux monsieur vend des fleurs jaunes et rouges. Julie choisit trois roses pour sa grand-mère. Après le marché, elles boivent un chocolat chaud dans un petit café. Julie est très contente de sa matinée.',
'fr', 'A1', 'original', 77),

('Au restaurant',
'Le serveur demande à Julien s''il a une réservation. Julien répond que oui, au nom de Dupont, pour deux personnes. Le serveur les installe à une table près de la fenêtre et leur donne la carte. Il demande s''ils ont déjà choisi une boisson. Julien commande un verre de vin rouge et sa femme demande de l''eau minérale. Comme entrée, le serveur recommande la soupe à l''oignon, qui est la spécialité du restaurant. Ils décident de prendre deux soupes. Pour le plat principal, Julien choisit le poulet rôti avec des légumes et sa femme préfère le poisson du jour. Pendant le repas, Julien demande au serveur d''où viennent les légumes, et celui-ci explique qu''ils sont achetés chaque matin au marché local. Après le plat principal, ils hésitent longtemps entre plusieurs desserts, avant de choisir finalement une tarte aux pommes à partager. Après le repas, le serveur apporte l''addition et demande si tout s''est bien passé. Le couple répond que le dîner était délicieux et qu''ils reviendront bientôt avec des amis.',
'fr', 'B1', 'original', 170),

('Faut-il apprendre plusieurs langues étrangères ?',
'À l''heure de la mondialisation, la question de l''apprentissage des langues étrangères suscite des débats passionnés. Certains soutiennent qu''il est indispensable de maîtriser plusieurs langues pour réussir professionnellement, tandis que d''autres estiment qu''une seule langue véhiculaire, comme l''anglais, suffit largement dans un monde interconnecté. Il me semble pourtant que cette vision est trop réductrice.

Apprendre une langue, ce n''est pas seulement acquérir un outil de communication, c''est aussi s''ouvrir à une culture, à une manière de penser différente. Chaque langue porte en elle une vision du monde particulière, et il serait dommage de se priver de cette richesse sous prétexte que l''anglais permettrait, en théorie, de tout comprendre. De plus, des études montrent que le bilinguisme, voire le plurilinguisme, améliore les capacités cognitives, retarde certaines maladies neurodégénératives et développe la flexibilité mentale.

Il ne faut pas non plus négliger l''aspect économique. Dans un marché du travail globalisé, les entreprises recherchent activement des candidats capables de négocier avec des partenaires étrangers dans leur propre langue. Bien que l''anglais reste incontournable, il ne garantit pas, à lui seul, la confiance nécessaire pour conclure certains accords commerciaux.

Certes, il faut reconnaître que l''apprentissage d''une langue demande du temps, de la persévérance et, souvent, des ressources financières que tout le monde n''a pas. C''est pourquoi il conviendrait que les systèmes éducatifs investissent davantage dans l''enseignement précoce des langues, dès le plus jeune âge, afin que cet apprentissage ne reste pas un privilège réservé à quelques-uns.

En définitive, apprendre plusieurs langues n''est peut-être pas strictement nécessaire pour survivre dans le monde moderne, mais cela reste, à mon sens, l''un des investissements personnels les plus enrichissants que l''on puisse faire.',
'fr', 'C1', 'original', 274),

-- Alemán — A1, B1, C1
('Ein Ausflug in die Berge',
'Am Sonntag fährt Familie Meyer in die Berge. Der Himmel ist blau und die Sonne scheint. Sie parken das Auto und beginnen die Wanderung. Der Weg ist steil, aber schön. Die Kinder sammeln bunte Blumen. Nach zwei Stunden erreichen sie einen kleinen See. Das Wasser ist klar und kalt. Sie essen Brot und Käse und trinken Tee aus einer Thermoskanne. Ein Adler fliegt über ihre Köpfe. Am Nachmittag gehen sie zurück zum Auto. Alle sind müde, aber glücklich.',
'de', 'A1', 'original', 78),

('Beim Arzt',
'Frau Becker geht zum Arzt, weil sie seit drei Tagen Kopfschmerzen hat. Die Arzthelferin begrüßt sie freundlich und bittet sie, im Wartezimmer Platz zu nehmen. Nach zehn Minuten ruft der Arzt sie auf. Er fragt, seit wann die Schmerzen bestehen und ob sie auch Fieber hat. Frau Becker erklärt, dass die Schmerzen morgens am schlimmsten sind und dass sie schlecht schläft. Der Arzt misst ihren Blutdruck und schaut sich ihre Augen an. Er vermutet, dass der Stress bei der Arbeit die Ursache sein könnte. Deshalb empfiehlt er ihr, mehr Wasser zu trinken, regelmäßig Pausen zu machen und abends früher ins Bett zu gehen. Falls die Kopfschmerzen nicht besser werden, soll sie in einer Woche wiederkommen. Frau Becker bedankt sich und fragt, ob sie ein Rezept für Schmerztabletten bekommen kann. Der Arzt stellt ihr ein Rezept aus und wünscht ihr gute Besserung. Auf dem Weg nach Hause kauft sie die Tabletten in der Apotheke gleich neben der Praxis.',
'de', 'B1', 'original', 157),

('Die Mülltrennung in Deutschland',
'Die Mülltrennung gehört in Deutschland seit Jahrzehnten zum Alltag und wird von den meisten Bürgerinnen und Bürgern als selbstverständlich betrachtet. Anders als in vielen anderen Ländern wird der Hausmüll hier üblicherweise in mehrere Kategorien unterteilt: Papier, Glas, Bioabfall, Verpackungen mit dem sogenannten Grünen Punkt und Restmüll. Jede dieser Kategorien landet in einer eigenen Tonne, die meist unterschiedlich gefärbt ist, um Verwechslungen zu vermeiden.

Das System wurde in den 1990er-Jahren eingeführt, nachdem die Deponien zunehmend überfüllt waren und der Gesetzgeber die Industrie dazu verpflichtete, für die Entsorgung ihrer Verpackungen selbst aufzukommen. Seitdem hat sich die Recyclingquote deutlich erhöht, auch wenn Kritiker anmerken, dass ein erheblicher Teil des angeblich getrennten Mülls letztlich doch verbrannt wird, weil die Sortieranlagen nicht immer sauber arbeiten.

Für viele Zugezogene, ob aus dem Ausland oder aus einer anderen deutschen Stadt, stellt das Trennsystem zunächst eine Herausforderung dar, da die Regeln von Kommune zu Kommune leicht variieren können. Was in einer Stadt in die Biotonne gehört, muss in einer anderen möglicherweise in den Restmüll. Hinzu kommt das Pfandsystem für Flaschen und Dosen, das Verbrauchern einen finanziellen Anreiz bietet, Verpackungen zurückzugeben, anstatt sie wegzuwerfen.

Trotz gelegentlicher Verwirrung gilt die deutsche Mülltrennung international als vorbildlich und wird oft als Beispiel dafür angeführt, wie eine Gesellschaft durch klare Regeln und langfristige Gewöhnung ihr Konsumverhalten nachhaltiger gestalten kann. In manchen Bundesländern wird das Thema inzwischen sogar schon in der Grundschule behandelt, damit Kinder von klein auf lernen, verantwortungsvoll mit Ressourcen umzugehen. Ob dieses System angesichts wachsender Müllmengen und des boomenden Online-Handels mit seinen unzähligen Kartons langfristig ausreicht, bleibt allerdings eine offene Frage, die Umweltverbände und Politik weiterhin intensiv diskutieren.',
'de', 'C1', 'original', 267),

-- Inglés — A2, B1, C1
('Booking a Hotel Room',
'The receptionist greets the caller and asks how she can help. Laura says she would like to book a room for next weekend. The receptionist asks how many nights she will stay. Laura answers two nights, from Friday to Sunday. The receptionist asks if she wants a single room or a double room. Laura says a double room, because her husband is coming with her. The receptionist offers a room with a view of the garden for eighty euros per night, breakfast included. Laura says that sounds perfect and asks if she can pay by credit card. The receptionist explains that she can pay now online or later at the hotel. Laura decides to pay now and gives her name and phone number. The receptionist thanks her and confirms that the room is booked. She says they look forward to seeing her on Friday.',
'en', 'A2', 'original', 144),

('Should Schools Teach Coding?',
'In recent years, more and more schools around the world have started teaching computer programming, sometimes from a very young age. Some people think this is an excellent idea, while others believe it takes time away from more traditional subjects like history or art.

In my opinion, learning the basics of coding is useful for almost everyone, not just future programmers. When students write their first simple program, they learn to break a big problem into small steps and to think logically about how to solve it. These skills are helpful in many other subjects, including math and science.

Of course, not every student will become a software developer, and schools should not force children to spend all their time in front of a screen. However, offering coding as an optional class, or including it briefly within technology lessons, seems like a reasonable compromise.

Technology is already part of almost every job today, so understanding a little about how computers work will probably help students in their future careers, whatever field they choose. For this reason, I believe schools should continue to introduce coding, as long as it does not replace other important subjects.',
'en', 'B1', 'original', 194),

('How Coffee Reaches Your Cup',
'Few people who sip their morning coffee ever stop to consider the extraordinarily long journey the beans have made before reaching their cup. That journey typically begins on a farm somewhere near the equator, in countries such as Brazil, Colombia, Ethiopia or Vietnam, where the climate and altitude are ideal for growing coffee plants.

Coffee cherries, as the fruit is called, are usually harvested by hand, since they ripen at different times even on the same branch. Once picked, the cherries must be processed quickly to prevent spoilage. Depending on the region, farmers use either the washed method, in which the fruit is removed and the beans are fermented in water, or the natural method, in which the cherries are dried whole in the sun. Each technique produces a noticeably different flavor.

After processing, the beans are dried, sorted by size and quality, and then exported, often through a complex chain of intermediaries, cooperatives and exporters. This is one of the most controversial stages of the industry, since farmers frequently receive only a small fraction of the final retail price, while roasters, distributors and retailers in wealthier countries capture most of the value.

Once the green beans arrive at their destination, they are roasted, a process that transforms their color, aroma and chemical composition within minutes. Roasting is considered an art in itself, since even a few seconds can make the difference between a balanced cup and a burnt, bitter one. Finally, the roasted beans are ground and brewed, releasing the hundreds of aromatic compounds that give coffee its distinctive taste.

Understanding this entire chain, from a remote hillside farm to a cup on a kitchen table, has led many consumers to pay closer attention to where their coffee comes from and how the people who grow it are treated.',
'en', 'C1', 'original', 300),

-- Español — A1, B2, C1
('Un día en la playa',
'Es domingo y hace mucho sol. Marta y sus amigos van a la playa. Llevan toallas, sombrillas y mucha agua. El mar está tranquilo y el agua está fría. Los niños construyen un castillo de arena. Marta nada un poco y después descansa bajo la sombrilla. A la hora de comer, todos comen bocadillos y fruta. Un perro pasa corriendo cerca de ellos. Por la tarde, el cielo se pone naranja y rosa. Marta saca muchas fotos antes de volver a casa.',
'es', 'A1', 'original', 82),

('El tapeo: una tradición española',
'El tapeo es una de las costumbres sociales más características de España y, para muchos visitantes extranjeros, una de las experiencias culturales más memorables del país. Consiste en ir de bar en bar comiendo pequeñas porciones de comida, llamadas tapas, mientras se conversa con amigos o familiares.

El origen exacto de esta tradición no está del todo claro, aunque existen varias leyendas al respecto. Una de las más conocidas cuenta que los taberneros cubrían los vasos de vino con una rodaja de pan o jamón para evitar que entraran moscas, y que esa costumbre terminó convirtiéndose en un plato en sí mismo. Sea cual sea su origen real, lo cierto es que hoy en día el tapeo forma parte fundamental de la vida social en ciudades como Sevilla, Granada o Madrid.

A diferencia de una cena tradicional, el tapeo no sigue un horario fijo ni requiere sentarse a una mesa durante horas. Los grupos suelen moverse de un local a otro, probando especialidades distintas en cada parada: unas croquetas aquí, un poco de jamón ibérico allá, unas patatas bravas más adelante. Esta forma de comer fomenta la conversación y la convivencia, ya que la comida nunca es el único centro de atención.

En los últimos años, el tapeo se ha exportado a numerosos países, donde han surgido restaurantes especializados en este formato. Sin embargo, muchos españoles insisten en que la experiencia auténtica solo puede vivirse recorriendo las calles de una ciudad española, tapa tras tapa, entre risas y conversación.',
'es', 'B2', 'original', 249),

('El teletrabajo, ¿libertad o aislamiento?',
'Desde que la pandemia obligó a millones de personas a trabajar desde casa, el teletrabajo ha dejado de ser una excepción reservada a unos pocos privilegiados para convertirse en una modalidad laboral ampliamente extendida. Sus defensores destacan la flexibilidad horaria, el ahorro de tiempo y dinero en desplazamientos, y una supuesta mejora en la conciliación entre la vida personal y profesional. Sus detractores, en cambio, advierten sobre los riesgos de aislamiento social, la dificultad para desconectar del trabajo y el debilitamiento de la cultura de equipo.

A mi juicio, ambas posturas contienen una parte de verdad, y reducir el debate a una simple dicotomía entre libertad y aislamiento resulta excesivamente simplista. El teletrabajo no afecta a todos los empleados de la misma manera: quienes viven solos, por ejemplo, suelen experimentar una sensación de soledad mucho mayor que quienes comparten piso o tienen familia, mientras que quienes disfrutan de un espacio adecuado en casa trabajan con más comodidad que quienes deben improvisar una oficina en la mesa de la cocina.

Asimismo, conviene distinguir entre el teletrabajo impuesto de forma abrupta durante una emergencia sanitaria y un modelo híbrido bien planificado, en el que la empresa invierte en formación, en herramientas digitales adecuadas y, sobre todo, en mantener momentos de encuentro presencial que refuercen los vínculos entre compañeros. Sin esa planificación, cualquier modalidad de trabajo, remota o presencial, corre el riesgo de generar insatisfacción.

En definitiva, no creo que el teletrabajo sea intrínsecamente bueno ni malo. Su éxito depende, sobre todo, de que las empresas escuchen a sus empleados, ofrezcan alternativas flexibles y no confundan la autonomía con el abandono. Solo así podrá aprovecharse su enorme potencial sin sacrificar el bienestar de quienes lo practican.',
'es', 'C1', 'original', 283),

-- Chino — A1, A2, B1
('在商店',
'小明去商店买东西。售货员问他需要什么。小明说他想买一支笔和一本本子。售货员给他看几种笔，有红色的，也有蓝色的。小明选了一支蓝色的笔。本子的价钱是五块钱，笔的价钱是三块钱。小明一共付了八块钱。售货员说谢谢，欢迎下次再来。小明拿着东西高兴地回家了。',
'zh', 'A1', 'original', 60),

('第一次骑自行车',
'小美今年八岁，她一直想学骑自行车。星期六早上，爸爸带她去公园。公园里有一条很长的小路，两边都是绿树。爸爸先扶着自行车，让小美坐上去。小美有点儿害怕，但是她还是慢慢地开始蹬车。爸爸在后面跑着，一直扶着车。过了几分钟，爸爸悄悄地放开了手，可是小美还在往前骑，没有发现。她突然回头看，发现爸爸已经在很远的地方了。小美很惊讶，也很高兴，因为她终于学会了自己骑自行车。她骑得越来越快，笑得也越来越开心。回家的路上，小美一直跟妈妈说今天的事情。',
'zh', 'A2', 'original', 105),

('手机应该怎么用？',
'现在几乎每个人都有手机，手机也改变了我们的生活方式。有人认为手机让生活更方便，因为我们可以用手机聊天、查资料、看新闻，甚至工作。但是也有人担心，很多人花在手机上的时间太多了，反而减少了和家人朋友面对面交流的机会。

我觉得手机本身并不是问题，关键在于我们怎么使用它。如果我们每天花很多时间看手机上的短视频，却没有时间陪伴家人或者做运动，那手机就变成了一种负担，而不是帮助。相反，如果我们合理安排时间，比如只在工作或学习需要的时候使用手机，那手机就可以真正提高我们的生活质量。

另外，家长也应该注意孩子使用手机的时间。很多孩子从很小的时候就开始用手机看视频或者玩游戏，这可能会影响他们的视力和学习。因此，家长可以和孩子一起制定使用手机的规则，比如每天只能用手机一个小时。

总之，手机是一个很有用的工具，但是我们应该学会控制自己，而不是让手机控制我们的生活。',
'zh', 'B1', 'original', 188);

-- ─────────────────────────────────────────────────────────────────────────
-- 2) grammar_points — 2 por texto (30 en total), siempre en español
-- ─────────────────────────────────────────────────────────────────────────

-- Le marché du samedi (fr, A1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'fr',
  '¿Por qué "au marché" y no "à le marché"?',
  'En francés, la preposición "à" y el artículo "le" se contraen obligatoriamente en "au". Nunca se pueden escribir por separado: "va au marché" (no "va à le marché"). Es una regla fija, no una elección de estilo.',
  '¿Por qué se dice "au marché" y no "à le marché"?',
  array['Porque "à" + "le" se contraen siempre en "au"', 'Porque "au" es la forma femenina de "à"', 'Porque es un error habitual que se tolera'],
  0
from texts where title = 'Le marché du samedi';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 4, 'fr',
  '"du pain" — el artículo partitivo',
  '"Du" es el artículo partitivo: se usa para hablar de una cantidad indeterminada de algo que no se cuenta, como el pan o el queso. Equivale a "algo de" en español, aunque en español casi siempre se omite ese artículo ("compra pan", no "compra algo de pan").',
  '¿Qué función cumple "du" en "du pain frais"?',
  array['Artículo partitivo: una cantidad indeterminada de algo incontable', 'Artículo definido masculino singular', 'Preposición de lugar'],
  0
from texts where title = 'Le marché du samedi';

-- Au restaurant (fr, B1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'fr',
  '"s''il a une réservation" — la pregunta indirecta',
  'En una pregunta indirecta (dentro de otra oración), el francés usa "si" en lugar de "est-ce que", y no hay inversión entre sujeto y verbo. "Il demande s''il a une réservation" equivale a "le pregunta si tiene una reserva".',
  'En "demande... s''il a une réservation", ¿qué marca que es una pregunta indirecta?',
  array['El uso de "si" sin inversión sujeto-verbo', 'El uso de "est-ce que"', 'La inversión sujeto-verbo, como en una pregunta directa'],
  0
from texts where title = 'Au restaurant';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 9, 'fr',
  '"avant de choisir" — avant de + infinitivo',
  '"Avant de" + infinitivo indica una acción anterior a otra, y solo se usa cuando el sujeto de las dos acciones es el mismo. Equivale a "antes de" + infinitivo en español: "avant de choisir" = "antes de elegir".',
  '¿Por qué "choisir" queda en infinitivo después de "avant de"?',
  array['Porque "avant de" siempre va seguido de infinitivo cuando el sujeto no cambia', 'Porque "avant de" es un tiempo verbal en sí mismo', 'Porque "choisir" es un verbo irregular'],
  0
from texts where title = 'Au restaurant';

-- Faut-il apprendre plusieurs langues étrangères ? (fr, C1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 8, 'fr',
  '"Bien que l''anglais reste" — bien que + subjuntivo',
  '"Bien que" (aunque) siempre exige subjuntivo en la cláusula que introduce, incluso cuando el hecho es real, como aquí, que el inglés sea indispensable. Es una de las conjunciones concesivas más frecuentes en el registro argumentativo formal.',
  '¿Por qué "reste" está en subjuntivo después de "bien que"?',
  array['Porque "bien que" exige siempre subjuntivo en su cláusula', 'Porque "reste" está mal escrito', 'Porque el subjuntivo solo se usa para expresar dudas'],
  0
from texts where title = 'Faut-il apprendre plusieurs langues étrangères ?';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 10, 'fr',
  '"il conviendrait que" — condicional + subjuntivo',
  '"Il conviendrait que" combina un condicional impersonal ("convendría") con subjuntivo en la subordinada ("investissent"). Esta combinación es típica del registro argumentativo formal para presentar una recomendación hipotética y matizada.',
  '"il conviendrait que les systèmes... investissent" combina:',
  array['Un condicional impersonal + subjuntivo en la subordinada', 'Dos verbos en indicativo', 'Un imperativo + infinitivo'],
  0
from texts where title = 'Faut-il apprendre plusieurs langues étrangères ?';

-- Ein Ausflug in die Berge (de, A1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 9, 'de',
  '"Am Nachmittag gehen sie" — la regla V2',
  'Cuando una oración alemana empieza con un elemento que no es el sujeto (aquí "Am Nachmittag"), el verbo conjugado sigue ocupando la segunda posición y el sujeto pasa después: "Am Nachmittag gehen sie zurück". Es la regla V2, central en la sintaxis alemana.',
  'En "Am Nachmittag gehen sie zurück zum Auto", ¿por qué "gehen" va antes que "sie"?',
  array['Porque el verbo conjugado siempre ocupa la segunda posición (regla V2)', 'Porque es una pregunta', 'Porque "gehen" es un verbo modal'],
  0
from texts where title = 'Ein Ausflug in die Berge';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 7, 'de',
  '"Brot und Käse" sin artículo',
  'En alemán, los sustantivos incontables usados en sentido genérico, como "Brot" (pan) o "Käse" (queso), no llevan artículo. Es distinto del español, donde a veces aparece "el pan, el queso" aunque se hable de forma general.',
  '¿Por qué "Brot" y "Käse" no llevan artículo en "Sie essen Brot und Käse"?',
  array['Porque son sustantivos incontables usados en sentido genérico', 'Porque están en plural', 'Porque son nombres propios'],
  0
from texts where title = 'Ein Ausflug in die Berge';

-- Beim Arzt (de, B1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'de',
  '"weil sie... hat" — el verbo al final',
  'La conjunción "weil" (porque) manda el verbo conjugado al final de la oración subordinada: "weil sie seit drei Tagen Kopfschmerzen hat". Además, "seit" (desde hace) rige siempre dativo y expresa una acción que continúa en el presente.',
  'En la subordinada introducida por "weil", ¿dónde va el verbo conjugado?',
  array['Al final de la subordinada', 'En segunda posición, como en la oración principal', 'Al principio de la subordinada'],
  0
from texts where title = 'Beim Arzt';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 7, 'de',
  '"empfiehlt... zu trinken" — zu + infinitivo',
  'Verbos como "empfehlen" (recomendar) van seguidos de una construcción con "zu" + infinitivo cuando el sujeto no cambia. Aquí se encadenan tres infinitivos con "zu": "zu trinken", "zu machen", "zu gehen".',
  '¿Qué estructura sigue a "empfiehlt ihr" para dar los tres consejos?',
  array['zu + infinitivo', 'dass + verbo conjugado', 'el imperativo directo'],
  0
from texts where title = 'Beim Arzt';

-- Die Mülltrennung in Deutschland (de, C1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 3, 'de',
  '"wurde eingeführt" — voz pasiva en pretérito',
  '"Wurde eingeführt" es voz pasiva en pretérito (Präteritum Passiv): "werden" conjugado en pretérito + participio II. Se usa para centrar la atención en la acción (la introducción del sistema) en vez de en quién la realizó.',
  '"Das System wurde... eingeführt" es un ejemplo de:',
  array['Voz pasiva en pretérito (werden + participio II)', 'Voz activa en presente', 'Subjuntivo I (discurso indirecto)'],
  0
from texts where title = 'Die Mülltrennung in Deutschland';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 4, 'de',
  '"hat sich... erhöht" — verbo reflexivo',
  '"Sich erhöhen" es un verbo reflexivo: la tasa "se eleva" a sí misma, no eleva otra cosa. Nótese también que "dass" manda el verbo conjugado ("wird") al final de su cláusula, incluso dentro de una oración ya introducida por "auch wenn".',
  '¿Qué tipo de verbo es "sich erhöhen" en "die Recyclingquote hat sich... erhöht"?',
  array['Un verbo reflexivo', 'Un verbo modal', 'Un verbo separable'],
  0
from texts where title = 'Die Mülltrennung in Deutschland';

-- Booking a Hotel Room (en, A2)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 1, 'en',
  '"would like to" — una forma educada de pedir',
  '"Would like to" es una manera cortés de decir "want to", muy usada para pedir cosas con educación. Aquí aparece además en estilo indirecto ("Laura says she would like..."), sin comillas ni signo de interrogación.',
  '¿Por qué se usa "would like to book" en vez de "want to book"?',
  array['Es una forma más educada/cortés de pedir algo', 'Está en tiempo pasado', 'Es una orden directa'],
  0
from texts where title = 'Booking a Hotel Room';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 6, 'en',
  '"breakfast included" — participio como frase reducida',
  '"Breakfast included" es una forma reducida de "with breakfast included" ("con el desayuno incluido"), sin verbo conjugado. Estas construcciones con participio pasado son muy comunes en inglés para dar información de forma breve.',
  '"breakfast included" es una forma reducida de:',
  array['"with breakfast included" (el desayuno está incluido)', '"the breakfast was included yesterday"', 'una pregunta sobre el desayuno'],
  0
from texts where title = 'Booking a Hotel Room';

-- Should Schools Teach Coding? (en, B1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 1, 'en',
  '"while" como conector de contraste',
  'En esta oración, "while" no significa "mientras" en sentido temporal, sino que introduce un contraste entre dos opiniones opuestas, equivalente a "mientras que" en español. Es un conector típico de los textos de opinión en inglés.',
  'En "some people think this..., while others believe...", "while" funciona como:',
  array['Conector de contraste (mientras que)', 'Conector de tiempo (durante)', 'Conjunción condicional (si)'],
  0
from texts where title = 'Should Schools Teach Coding?';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 5, 'en',
  '"should not force" — recomendación, no prohibición',
  '"Should" expresa una recomendación o una obligación moral, distinta de "must", que expresa una obligación estricta. "Should not force" significa "no deberían obligar": es una sugerencia sobre lo que sería correcto hacer, no una prohibición legal.',
  '"schools should not force children" expresa...',
  array['Una recomendación, no una prohibición absoluta', 'Una obligación legal estricta', 'Una acción que ya ocurrió en el pasado'],
  0
from texts where title = 'Should Schools Teach Coding?';

-- How Coffee Reaches Your Cup (en, C1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 4, 'en',
  '"in which" — relativo con preposición',
  '"In which" es un pronombre relativo con preposición, típico del registro formal escrito, equivalente a "en el/la cual" en español. Aparece dos veces aquí para explicar cada método de procesamiento del café.',
  '¿Por qué se usa "in which" en "the washed method, in which the fruit is removed..."?',
  array['Es un relativo con preposición, propio del registro formal', 'Es una pregunta indirecta', 'Es una construcción pasiva especial'],
  0
from texts where title = 'How Coffee Reaches Your Cup';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 9, 'en',
  '"a burnt, bitter one" — "one" para no repetir',
  '"One" sustituye a "cup" para evitar repetirlo: "a burnt, bitter one" equivale a "a burnt, bitter cup". Es un recurso muy común en inglés para no repetir un sustantivo ya mencionado antes en la oración.',
  'En "a burnt, bitter one", ¿a qué sustituye "one"?',
  array['A "cup", para no repetirlo', 'Al café en general, como concepto', 'A "roasting"'],
  0
from texts where title = 'How Coffee Reaches Your Cup';

-- Un día en la playa (es, A1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 0, 'es',
  '"hace mucho sol" — construcciones impersonales del clima',
  'En español, el clima se describe con construcciones impersonales con "hacer" ("hace sol", "hace calor"), sin sujeto gramatical explícito. Es distinto del inglés, que necesita un sujeto obligatorio aunque no signifique nada ("it is sunny").',
  '¿Por qué "hace mucho sol" no tiene un sujeto explícito?',
  array['Porque es una construcción impersonal típica para hablar del clima', 'Porque falta una palabra en la oración', '"Sol" es el sujeto de la oración'],
  0
from texts where title = 'Un día en la playa';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 8, 'es',
  '"se pone naranja" — ponerse + adjetivo',
  '"Ponerse" + adjetivo describe un cambio de estado, no una característica permanente: el cielo cambia de color en ese momento. Es distinto de "ser" o "estar", que describirían una cualidad fija o una situación más estable.',
  '"el cielo se pone naranja y rosa" describe...',
  array['Un cambio de estado que ocurre en ese momento', 'Una característica fija y permanente del cielo', 'Una acción que ya terminó hace mucho tiempo'],
  0
from texts where title = 'Un día en la playa';

-- El tapeo: una tradición española (es, B2)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 3, 'es',
  '"para evitar que entraran" — finalidad + subjuntivo',
  '"Para evitar que" introduce una finalidad negativa y exige subjuntivo en la subordinada ("entraran"), porque se trata de una acción hipotética que se quiere impedir, no un hecho constatado como real.',
  '¿Por qué "entraran" está en subjuntivo después de "para evitar que"?',
  array['Porque las conjunciones finales con "que" exigen subjuntivo', 'Porque describe un hecho pasado y seguro', 'Porque "evitar" siempre lleva infinitivo obligatoriamente'],
  0
from texts where title = 'El tapeo: una tradición española';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 6, 'es',
  '"suelen moverse" — soler + infinitivo',
  '"Soler" + infinitivo expresa una acción habitual: "suelen moverse" significa "normalmente se mueven". El gerundio que sigue, "probando", indica una acción simultánea a la principal, sin necesitar otro verbo conjugado.',
  '"los grupos suelen moverse de un local a otro" expresa...',
  array['Una acción habitual, algo que ocurre normalmente', 'Una obligación estricta', 'Una acción única que ocurrió una sola vez'],
  0
from texts where title = 'El tapeo: una tradición española';

-- El teletrabajo, ¿libertad o aislamiento? (es, C1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 3, 'es',
  '"reducir el debate... resulta simplista" — infinitivo como sujeto',
  'En español, un infinitivo puede funcionar como sujeto de la oración, igual que un sustantivo: "reducir el debate a una simple dicotomía... resulta excesivamente simplista" equivale a "esa reducción resulta simplista".',
  'En esta oración, "reducir el debate a una simple dicotomía" funciona como:',
  array['El sujeto de la oración (infinitivo sustantivado)', 'El complemento directo del verbo', 'Un mandato o instrucción'],
  0
from texts where title = 'El teletrabajo, ¿libertad o aislamiento?';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 7, 'es',
  '"no creo que sea" — negación de opinión + subjuntivo',
  'Los verbos de opinión en forma negativa, como "no creo que", exigen subjuntivo en la subordinada ("sea"), porque niegan la certeza de lo afirmado. En cambio, "creo que" en forma afirmativa llevaría indicativo ("es").',
  '¿Por qué "sea" está en subjuntivo después de "no creo que"?',
  array['Porque la negación del verbo de opinión exige subjuntivo', 'Porque "malo" es un adjetivo irregular', 'Porque toda la oración es una pregunta'],
  0
from texts where title = 'El teletrabajo, ¿libertad o aislamiento?';

-- 在商店 (zh, A1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 2, 'zh',
  '"一支笔" — los clasificadores numerales',
  'En chino, entre un número y un sustantivo casi siempre debe aparecer un clasificador (量词) apropiado: "一支笔" (una pluma, clasificador 支) o "一本本子" (un cuaderno, clasificador 本). No se puede decir simplemente "一笔".',
  '¿Por qué "一支笔" necesita la palabra "支" entre el número y "笔"?',
  array['Porque en chino los números siempre necesitan un clasificador antes del sustantivo', 'Porque "支" significa "pluma"', 'Porque "支" es un adjetivo que describe el color'],
  0
from texts where title = '在商店';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 5, 'zh',
  '"本子的价钱" — 的 posesivo',
  '"的" conecta un sustantivo con otro para indicar posesión o atributo, como "de" en español: "本子的价钱" significa "el precio del cuaderno" (literalmente "cuaderno-的-precio"). El poseedor siempre va antes de "的".',
  'En "本子的价钱" (el precio del cuaderno), ¿qué función tiene "的"?',
  array['Marca posesión/atributo, como "de" en español', 'Es un verbo que significa "tener"', 'Es un clasificador numeral'],
  0
from texts where title = '在商店';

-- 第一次骑自行车 (zh, A2)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 6, 'zh',
  '"放开了手" — 了 de acción completada',
  '"了" justo después del verbo (放开了) marca que la acción ya se completó: soltó la mano. En contraste, "还在往前骑" usa "在" antes del verbo para indicar una acción en curso: seguía pedaleando en ese mismo momento.',
  '¿Qué indica "了" en "爸爸悄悄地放开了手"?',
  array['Que la acción ya se completó (soltó la mano)', 'Que la acción es habitual y se repite todos los días', 'Que la acción todavía no ha ocurrido'],
  0
from texts where title = '第一次骑自行车';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 8, 'zh',
  '"学会" — verbo compuesto de resultado',
  '"学会" es un verbo compuesto de resultado: "学" (estudiar/aprender) + "会" (saber hacer, como resultado logrado). Juntos significan "aprender hasta dominarlo", a diferencia de usar solo "学", que indica el proceso sin garantizar el resultado.',
  '¿Qué añade "会" al verbo "学" en la palabra "学会"?',
  array['Indica que el aprendizaje llegó a un resultado logrado (ya sabe hacerlo)', 'Indica que apenas empezó a aprender algo nuevo', 'Es un clasificador numeral'],
  0
from texts where title = '第一次骑自行车';

-- 手机应该怎么用？ (zh, B1)
insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 4, 'zh',
  '"如果...那..." — estructura condicional',
  '"如果...那..." forma una estructura condicional (si..., entonces...), muy común en chino para expresar una hipótesis y su consecuencia. Aquí "那" funciona como "entonces", no como el pronombre demostrativo "ese/esa".',
  'En esta oración, ¿qué función tiene "那" antes de "手机就变成了"?',
  array['Introduce la consecuencia de una condición (entonces)', 'Es un pronombre demostrativo (ese/esa)', 'Es un clasificador numeral'],
  0
from texts where title = '手机应该怎么用？';

insert into grammar_points (text_id, sentence_index, language, title, body, quiz_question, quiz_options, quiz_correct_index)
select id, 8, 'zh',
  '"用手机一个小时" — el complemento de duración',
  '"一个小时" (una hora) se coloca después del verbo "用手机" para indicar la duración de la acción, un complemento de duración típico del chino. Es distinto del español, donde "una hora" suele ir antes o al final sin una posición fija tan estricta.',
  '¿Dónde se coloca "一个小时" (una hora) respecto al verbo para indicar cuánto dura la acción?',
  array['Después del verbo, como complemento de duración', 'Siempre antes del verbo', 'Al principio de toda la oración'],
  0
from texts where title = '手机应该怎么用？';

-- ─────────────────────────────────────────────────────────────────────────
-- 3) comprehension_questions — 3 por texto (45 en total).
--    Textos A1 (fr/de/es/zh): preguntas en español.
--    Textos A2 en adelante: preguntas en el idioma del texto.
-- ─────────────────────────────────────────────────────────────────────────

-- Le marché du samedi (fr, A1 — español)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Con quién va Julie al mercado?',
  array['Con su madre', 'Con su padre', 'Con su abuela'], 0
from texts where title = 'Le marché du samedi';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Qué compra la madre de Julie en el mercado?',
  array['Pan fresco y queso', 'Carne y pescado', 'Zapatos'], 0
from texts where title = 'Le marché du samedi';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Qué hacen Julie y su madre después del mercado?',
  array['Beben un chocolate caliente en un café', 'Van al cine', 'Vuelven directo a casa sin parar'], 0
from texts where title = 'Le marché du samedi';

-- Au restaurant (fr, B1 — francés)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Au nom de qui est la réservation ?',
  array['Dupont', 'Martin', 'Lefèvre'], 0
from texts where title = 'Au restaurant';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'Qu''est-ce que le serveur recommande comme entrée ?',
  array['La soupe à l''oignon', 'La salade verte', 'Les escargots'], 0
from texts where title = 'Au restaurant';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'Que choisissent-ils comme dessert ?',
  array['Une tarte aux pommes', 'Une glace au chocolat', 'Rien, ils n''ont pas de dessert'], 0
from texts where title = 'Au restaurant';

-- Faut-il apprendre plusieurs langues étrangères ? (fr, C1 — francés)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Selon l''auteur, qu''est-ce qu''apprendre une langue permet, au-delà de la communication ?',
  array['S''ouvrir à une culture et à une autre manière de penser', 'Gagner plus d''argent immédiatement', 'Éviter d''apprendre l''anglais'], 0
from texts where title = 'Faut-il apprendre plusieurs langues étrangères ?';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'Que montrent les études mentionnées dans le texte à propos du plurilinguisme ?',
  array['Il améliore les capacités cognitives et retarde certaines maladies', 'Il n''a aucun effet sur le cerveau', 'Il complique uniquement la vie quotidienne'], 0
from texts where title = 'Faut-il apprendre plusieurs langues étrangères ?';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'Quelle est la conclusion de l''auteur sur l''apprentissage de plusieurs langues ?',
  array['Ce n''est pas strictement nécessaire, mais cela reste très enrichissant', 'C''est totalement inutile aujourd''hui', 'C''est obligatoire pour tout le monde'], 0
from texts where title = 'Faut-il apprendre plusieurs langues étrangères ?';

-- Ein Ausflug in die Berge (de, A1 — español)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Qué día va la familia Meyer a las montañas?',
  array['El domingo', 'El sábado', 'El lunes'], 0
from texts where title = 'Ein Ausflug in die Berge';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Qué hacen los niños durante la caminata?',
  array['Recogen flores de colores', 'Pescan en el lago', 'Duermen en una tienda de campaña'], 0
from texts where title = 'Ein Ausflug in die Berge';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Qué animal ven volar sobre ellos?',
  array['Un águila', 'Un oso', 'Un ciervo'], 0
from texts where title = 'Ein Ausflug in die Berge';

-- Beim Arzt (de, B1 — alemán)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Seit wann hat Frau Becker Kopfschmerzen?',
  array['Seit drei Tagen', 'Seit einer Woche', 'Seit heute Morgen'], 0
from texts where title = 'Beim Arzt';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'Was vermutet der Arzt als Ursache für die Kopfschmerzen?',
  array['Stress bei der Arbeit', 'Eine Erkältung', 'Eine Allergie'], 0
from texts where title = 'Beim Arzt';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'Was soll Frau Becker tun, wenn die Kopfschmerzen nicht besser werden?',
  array['In einer Woche wiederkommen', 'Sofort ins Krankenhaus gehen', 'Die Arbeit kündigen'], 0
from texts where title = 'Beim Arzt';

-- Die Mülltrennung in Deutschland (de, C1 — alemán)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Wann wurde das Mülltrennungssystem in Deutschland eingeführt?',
  array['In den 1990er-Jahren', 'Im 19. Jahrhundert', 'Nach dem Zweiten Weltkrieg'], 0
from texts where title = 'Die Mülltrennung in Deutschland';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'Was kritisieren manche Menschen am deutschen Recyclingsystem?',
  array['Dass ein Teil des getrennten Mülls trotzdem verbrannt wird', 'Dass es in Deutschland gar keine Mülltrennung gibt', 'Dass die Tonnen zu klein sind'], 0
from texts where title = 'Die Mülltrennung in Deutschland';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'Was bietet das Pfandsystem den Verbrauchern?',
  array['Einen finanziellen Anreiz, Flaschen und Dosen zurückzugeben', 'Kostenlose Mülltonnen für zu Hause', 'Einen Rabatt beim nächsten Einkauf'], 0
from texts where title = 'Die Mülltrennung in Deutschland';

-- Booking a Hotel Room (en, A2 — inglés)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'How many nights does Laura want to stay?',
  array['Two nights', 'Three nights', 'One night'], 0
from texts where title = 'Booking a Hotel Room';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'Why does Laura want a double room?',
  array['Because her husband is coming with her', 'Because it is cheaper than a single room', 'Because the single rooms are full'], 0
from texts where title = 'Booking a Hotel Room';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'How does Laura decide to pay?',
  array['Now, online', 'Later, at the hotel', 'She does not pay at all'], 0
from texts where title = 'Booking a Hotel Room';

-- Should Schools Teach Coding? (en, B1 — inglés)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'According to the text, what is one benefit of learning to code?',
  array['It teaches students to think logically and solve problems step by step', 'It guarantees a high-paying job for everyone', 'It replaces the need for math class'], 0
from texts where title = 'Should Schools Teach Coding?';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'What does the author suggest schools should NOT do?',
  array['Force children to spend all their time in front of a screen', 'Teach any technology at all', 'Allow students to choose their own subjects'], 0
from texts where title = 'Should Schools Teach Coding?';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'What is the author''s overall opinion about coding in schools?',
  array['Schools should continue to introduce coding without replacing other subjects', 'Coding should be the only subject taught', 'Coding is not useful for most students'], 0
from texts where title = 'Should Schools Teach Coding?';

-- How Coffee Reaches Your Cup (en, C1 — inglés)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Why are coffee cherries usually harvested by hand?',
  array['Because they ripen at different times, even on the same branch', 'Because machines cannot reach coffee farms', 'Because hand-picked coffee is always cheaper'], 0
from texts where title = 'How Coffee Reaches Your Cup';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, 'According to the text, what is one of the most controversial stages of the coffee industry?',
  array['Exporting, since farmers often receive only a small fraction of the retail price', 'Roasting, because it takes too long', 'Harvesting, because it is dangerous'], 0
from texts where title = 'How Coffee Reaches Your Cup';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, 'What can even a few seconds of difference in roasting cause?',
  array['The difference between a balanced cup and a burnt, bitter one', 'No difference at all', 'A change in the coffee''s country of origin'], 0
from texts where title = 'How Coffee Reaches Your Cup';

-- Un día en la playa (es, A1 — español)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Qué construyen los niños en la playa?',
  array['Un castillo de arena', 'Una piscina', 'Un barco de papel'], 0
from texts where title = 'Un día en la playa';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Qué hace Marta antes de comer?',
  array['Nada un poco y descansa bajo la sombrilla', 'Duerme toda la mañana', 'Juega un partido de fútbol'], 0
from texts where title = 'Un día en la playa';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿De qué color se pone el cielo por la tarde?',
  array['Naranja y rosa', 'Gris y negro', 'Verde'], 0
from texts where title = 'Un día en la playa';

-- El tapeo: una tradición española (es, B2 — español)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Según una de las leyendas, ¿para qué cubrían los taberneros los vasos de vino?',
  array['Para evitar que entraran moscas', 'Para que el vino se enfriara más rápido', 'Para decorar la barra del bar'], 0
from texts where title = 'El tapeo: una tradición española';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Qué es lo que más fomenta el tapeo, según el texto?',
  array['La conversación y la convivencia', 'Comer en silencio y rápido', 'Comer lo más barato posible'], 0
from texts where title = 'El tapeo: una tradición española';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Dónde insisten muchos españoles que se vive la experiencia auténtica del tapeo?',
  array['Recorriendo las calles de una ciudad española', 'Solo en restaurantes de lujo', 'Únicamente cocinando en casa'], 0
from texts where title = 'El tapeo: una tradición española';

-- El teletrabajo, ¿libertad o aislamiento? (es, C1 — español)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, 'Según el texto, ¿qué grupo suele experimentar más soledad con el teletrabajo?',
  array['Quienes viven solos', 'Quienes tienen hijos pequeños', 'Quienes trabajan en oficinas muy grandes'], 0
from texts where title = 'El teletrabajo, ¿libertad o aislamiento?';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿Qué distingue el autor entre dos formas distintas de teletrabajo?',
  array['El teletrabajo impuesto abruptamente y un modelo híbrido bien planificado', 'El teletrabajo legal y el teletrabajo ilegal', 'El teletrabajo pagado y el no pagado'], 0
from texts where title = 'El teletrabajo, ¿libertad o aislamiento?';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Cuál es la conclusión final del autor sobre el teletrabajo?',
  array['No es intrínsecamente bueno ni malo; su éxito depende de cómo lo gestionen las empresas', 'Siempre es mejor que el trabajo presencial', 'Debería prohibirse en todas las empresas'], 0
from texts where title = 'El teletrabajo, ¿libertad o aislamiento?';

-- 在商店 (zh, A1 — español)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '¿Qué quiere comprar Xiaoming en la tienda?',
  array['Una pluma y un cuaderno', 'Un libro y un lápiz', 'Un par de zapatos'], 0
from texts where title = '在商店';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '¿De qué color es la pluma que elige Xiaoming?',
  array['Azul', 'Roja', 'Negra'], 0
from texts where title = '在商店';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '¿Cuánto paga Xiaoming en total?',
  array['Ocho yuanes', 'Cinco yuanes', 'Diez yuanes'], 0
from texts where title = '在商店';

-- 第一次骑自行车 (zh, A2 — chino)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '小美今年几岁？',
  array['八岁', '十岁', '六岁'], 0
from texts where title = '第一次骑自行车';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '爸爸带小美去哪儿学骑自行车？',
  array['公园', '学校', '家里的院子'], 0
from texts where title = '第一次骑自行车';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '小美学会骑自行车以后有什么感觉？',
  array['很惊讶也很高兴', '很害怕也很生气', '很累也很难过'], 0
from texts where title = '第一次骑自行车';

-- 手机应该怎么用？ (zh, B1 — chino)
insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 0, '作者认为手机本身是不是问题？',
  array['不是，关键在于我们怎么使用它', '是，手机本身就是问题', '手机应该被完全禁止'], 0
from texts where title = '手机应该怎么用？';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 1, '如果每天花很多时间看短视频，却没有时间陪家人，会怎么样？',
  array['手机就变成了一种负担', '手机会变得更聪明', '什么都不会改变'], 0
from texts where title = '手机应该怎么用？';

insert into comprehension_questions (text_id, position, question, options, correct_index)
select id, 2, '作者建议家长和孩子一起做什么？',
  array['制定使用手机的规则，比如每天只能用一个小时', '完全不让孩子用手机', '让孩子随便用手机，没有规则'], 0
from texts where title = '手机应该怎么用？';
