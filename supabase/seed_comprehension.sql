-- 3 preguntas de comprensión lectora por texto semilla (contenido real, no genérico).
-- Correr después de migration_v4.sql.

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
