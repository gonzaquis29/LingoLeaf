# Jerarquía visual y uso de color — diseño

**Fecha**: 2026-08-09
**Estado**: aprobado, implementación en curso

## Problema

La UI se sentía genérica pese a tener un sistema de diseño propio (`lib/theme.ts`, portado de
`LingoLeaf-vf.html`: paleta oklch, acento por idioma, Figtree + Plus Jakarta Sans, radio asimétrico).
Diagnóstico del usuario: el color se usa muy poco (reservado a botones/detalles chicos) y falta
jerarquía tipográfica real (los tamaños/pesos no crean suficiente contraste).

## Exploración descartada

Se probaron 6 direcciones que reconsideraban paleta/tipografía desde cero (herbario/botánico, cuaderno
de lectura/marginalia, crecimiento orgánico, laboratorio de idiomas/fonética, fichero de catálogo,
mosaico multi-escritura). Ninguna convenció — varias caían en el cliché de "diseño hecho por IA"
(papel cálido + serif + acento tierra). Conclusión: la base original (moss/oklch, Figtree + Plus
Jakarta Sans, logo de hoja) ya es la correcta; el problema no era la paleta sino cómo se estaba usando.

## Diseño aprobado

Misma base de `lib/theme.ts`, sin cambios de paleta/tipografía. Dos reglas nuevas:

1. **Escala tipográfica dramática y selectiva**: un solo elemento "hero" por pantalla (título del
   texto, racha, resultado del quiz, % conocido) salta a 40-52px en Plus Jakarta Sans extrabold,
   tracking negativo (`-0.02em`), line-height ajustado (~1.0-1.05). Todo lo demás se mantiene chico —
   el contraste viene de restringir el resto, no de agrandar todo.
2. **Uso de color más generoso, pero no uniforme**: fondos "hero" llevan un lavado `accentSoft` del
   idioma activo en vez de blanco/crema plano; los números importantes se pintan directo del acento
   (no negro + puntito de color al lado); una etiqueta "eyebrow" (mayúsculas, 11px, negrita, color de
   acento) precede cada título grande.

**Regla de aplicación explícita — no parejo en toda la app**: el tratamiento va en la zona "hero" de
cada pantalla, no en listas ni en grids de tarjetas repetidas (si cada tarjeta de Biblioteca o cada fila
de Vocabulario lleva el lavado de color completo, se vuelve ruido en vez de jerarquía).

### Por pantalla

- **Biblioteca**: franja de encabezado con tratamiento completo (eyebrow + título grande + lavado de
  color). Las tarjetas de texto del grid quedan como están hoy.
- **Lector**: título del texto en tipografía grande. Los contadores nuevas/aprendiendo/conocidas del
  banner pasan de punto+texto chico a números grandes.
- **Repaso**: resultado final (X/N) y el intervalo bajo cada botón de calificación se agrandan.
- **Perfil**: el bloque de racha se agranda significativamente respecto a como está hoy.
- **Vocabulario y resultados de catálogo**: sin cambios — son listas, no momentos "hero".

## Fuera de alcance

- No se cambia paleta, tipografía, logo, ni el radio asimétrico de tarjetas (`CARD_RADIUS`) — siguen
  siendo los del prototipo validado.
- No se tocan Auth/Onboarding (la tarjeta flotante ya tiene su propia jerarquía por tamaño de card) más
  allá de posiblemente sumar el patrón de etiqueta "eyebrow" si encaja al implementar.
