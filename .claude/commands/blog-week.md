---
name: blog-week
description: Modo proactivo semanal. Lee state + idea-backlog + draft-articles.ndjson, aplica criterios (seasonality MX, topic gap, nichos), recomienda 1-3 blogs candidatos para esta semana, y al aprobar arranca research+draft en background.
---

# /blog-week — qué desarrolla el agente esta semana

## Uso

```
/blog-week
```

Sin argumentos.

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. El conductor lee:
   - `sanity/seeds/blog-pipeline-state.json`
   - `sanity/seeds/idea-backlog.md`
   - `sanity/seeds/draft-articles.ndjson`
3. Identifica candidatos para esta semana (ver criterios de `/blog-next`).
4. **Diferencia con `/blog-next`**: además de recomendar, ofrece arrancar 1-3 blogs en background simultáneo.
5. Iria responde algo como "arranca X y Y" o "solo arranca X".
6. El conductor transiciona phase de los seleccionados a `researching` y delega a `iriatalan-seo-blog` Modo 5 (si phase=idea) o Modo 2 (si phase=brief-approved).
7. Cuando un blog llegue a `word-exported`, te notifica.

## Cadencia esperada

Corre 1 vez por semana (lunes/martes). Si quieres 1 blog/semana, arrancas 1. Si quieres 2-3, arrancas múltiples.

## Qué NO hace

- NO escribe contenido directamente (delega).
- NO publica nada.
- NO arranca blogs sin tu OK explícito.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-week`. Reporte de candidatos + propuesta de arrancar 1-3 simultáneos en background.
