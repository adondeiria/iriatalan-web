---
name: blog-image
description: Genera la imagen hero del blog. Propone 3 conceptos de prompt para Higgsfield, espera tu elección, invoca el MCP de Higgsfield para generar, te muestra el preview, y al aprobar sube el asset a Sanity automáticamente.
arguments:
  - name: slug
    required: true
    description: Slug del blog para el que generas imagen hero.
---

# /blog-image — concepto + generación + upload a Sanity

## Uso

```
/blog-image <slug>
```

Ejemplo:
```
/blog-image modalidad-40-imss-conviene
```

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Confirma phase = `edits-applied`.
3. Lee el draft actual para entender:
   - Título
   - Topic (paleta visual asociada)
   - 2-3 frases clave que el hero image debe evocar
4. Genera **3 conceptos de prompt** con la regla TALAN:
   - Paleta acorde al topic
   - Sin caras de stock, sin texto sobreimpuesto
   - Tono profesional, sobrio, cero hype visual
   - Memoria: "2+ personas mismo género = diferenciar explícito en prompt"
5. Te pregunta cuál concepto generamos (1, 2, 3 o mezcla).
6. Invoca el MCP de Higgsfield con el prompt aprobado.
7. Te muestra el preview.
8. Si dices "regenera" o "ajusta X" → itera.
9. Si dices "úsala" → descarga la imagen, sube a Sanity Content Lake como asset, te da el `_ref`.
10. Actualiza state: `imageConcept`, `imageAsset`, phase → `image-approved`.
11. Te pregunta si pasamos a publicar con `/blog-publish <slug>`.

## Qué NO hace

- NO genera más de una imagen sin tu OK.
- NO sube a Sanity hasta que tú apruebes el preview.
- NO publica el blog (eso es `/blog-publish`).

## Prerequisitos

- Higgsfield MCP activo (memoria del usuario: plan FREE 2026-05-06; verificar créditos actuales antes de generar).
- `SANITY_API_WRITE_TOKEN` en `.env.local` (mismo que usa `draft-push.mjs`).

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-image <slug>`. Genera 3 conceptos visuales, espera elección de Iria, invoca el MCP de Higgsfield, muestra preview, espera aprobación, sube a Sanity, actualiza state.
