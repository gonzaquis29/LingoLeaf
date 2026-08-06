-- Contenido curado a mano (Épica 12) para los 5 textos semilla de seed.sql — 2 puntos por texto,
-- con quiz. sentence_index calculado con Intl.Segmenter (granularity: 'sentence') sobre el
-- contenido real de cada texto, para que ancle a la oración correcta en el Lector.

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
