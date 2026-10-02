# Biblioteca, Lector y contenido — mejoras post-testing

**Fecha:** 2026-08-09
**Estado:** Implementado

## Problema

Tras probar la app, surgieron varios problemas de UX y una decisión de producto:

1. Tarjetas de texto genéricas (portada placeholder de texto, fondo azul fijo que no combina con el idioma).
2. Violación de la heurística de Nielsen de control y libertad: agregar una palabra a repaso no se podía deshacer.
3. El subrayado de progreso de dominio (nueva/aprendiendo 1-4/conocida) no se explicaba en ningún lado.
4. La interfaz entera está codificada en español fijo, sin adaptarse al idioma nativo del usuario.
5. Biblioteca con muy pocos textos siempre iguales — no se siente como una biblioteca real para explorar.

## Decisiones

### Lector — dominio visual + deshacer
- El subrayado se reemplaza por **resaltado de fondo**: rojo suave para "nueva", degradé de 4 tonos (más oscuro → casi blanco) para "aprendiendo" según nivel, sin marca para "conocida" (así funciona el método: solo se resalta lo que todavía no se domina).
- Leyenda de 4 puntos junto al banner de progreso explica el degradé.
- La burbuja de palabra explica el mecanismo la primera vez que se puede agregar una palabra.
- Nueva acción `removeWord` + botón "Quitar de repaso" en la burbuja: cualquier palabra agregada (nueva, aprendiendo o conocida) se puede sacar del repaso en cualquier momento.

### Biblioteca — portadas
- Nueva columna `texts.cover_url` + bucket de Storage `text-covers` (público, cualquier usuario autenticado puede subir/reemplazar — misma postura de confianza que ya rige la tabla `texts`).
- Flujo de carga de portada opcional en "Pegar texto".
- Si no hay portada cargada: patrón abstracto generado con los colores de acento del idioma, determinístico por id de texto (mismo patrón siempre para el mismo texto, sin llamar a nada externo).
- Filtro por nivel sobre el catálogo completo (se muestran todos los textos disponibles del idioma activo, no una selección "mía" separada de "explorar" — esa separación se evalúa más adelante si hace falta).
- Se encontró y arregló un bug preexistente no reportado: la tabla `texts` no tenía policy de `insert`, así que "Pegar texto" fallaba silenciosamente por RLS.

### Internacionalización de la interfaz
- Alcance acordado: **solo inglés y español** por ahora (los dos idiomas nativos que el usuario probó). Francés/alemán/chino como idioma nativo caen a español.
- Login, registro y el primer paso de onboarding (elegir idioma nativo) quedan en español — no pueden localizarse antes de que el usuario elija su idioma nativo.
- Diccionario centralizado (`lib/i18n/dict.ts`) + `I18nProvider`/`useT()` para Client Components y `t(key, uiLang)` para Server Components, aplicado a Header, Biblioteca, Lector (banner, leyenda, burbuja, gramática, quiz), Repaso, Perfil, Vocabulario y Agregar contenido.

### Contenido — seed ampliado
- Textos nuevos, originales (no copiados de fuentes con copyright), repartidos en los 5 idiomas y varios niveles (no solo el nivel ya cubierto).
- Regla nueva: los quizzes de comprensión lectora van en el **idioma destino** para niveles A2 en adelante (A1 se queda en español, porque un principiante todavía no puede leer la pregunta). Los puntos de gramática siguen en español en todos los niveles (son explicaciones meta para un hablante de español).
- El seed original de 5 textos no se toca — las nuevas reglas aplican solo al contenido nuevo.

## Fuera de alcance (por ahora)
- i18n para francés/alemán/chino como idioma nativo.
- Separación "mi biblioteca" vs. "explorar/descubrir" — se evalúa de nuevo una vez que el catálogo sea más grande.
- Traducir Login/Registro/Onboarding (dependen del idioma que se está por elegir).
