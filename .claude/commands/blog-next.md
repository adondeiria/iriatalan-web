---
name: blog-next
description: Recomienda qué blog escribir esta semana. Lee el state file, el idea-backlog y los drafts del NDJSON, aplica criterios de seasonality MX + topic gap + nicho diferenciador, y te propone 1-3 candidatos. NO transiciona fases. Solo recomienda.
---

# /blog-next — qué escribo esta semana

## Uso

```
/blog-next
```

Sin argumentos.

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. El conductor lee:
   - `sanity/seeds/blog-pipeline-state.json`
   - `sanity/seeds/idea-backlog.md`
   - `sanity/seeds/draft-articles.ndjson`
3. Identifica candidatos:
   - Ideas con `phase=idea` o `brief-approved` en el state
   - Drafts del NDJSON aún no empezados
   - Blogs estancados (>7 días sin avance)
4. Prioriza por:
   - Seasonality fiscal MX (PPR marzo-abril, GMM oct-nov, educacional jul-ago, aguinaldo dic, regreso a clases ago)
   - Topic gap en el sitio
   - Search demand (validación con WebSearch si dudoso)
   - Nichos diferenciadores TALAN (LGBT+ con hijos, neurodivergentes, mujeres solas, mexicanos en el extranjero, foreigners in Mexico)
5. Devuelve tabla con 1-3 recomendaciones + justificación + esfuerzo estimado.
6. Pregunta cuál arrancas con `arranca <slug>`.

## Qué NO hace

- NO empieza a escribir.
- NO modifica state.
- NO commitea decisiones.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-next`. Sigue su workflow para recomendar 1-3 blogs candidatos para esta semana con justificación.
