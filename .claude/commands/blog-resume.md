---
name: blog-resume
description: Retoma un blog específico. Reporta phase actual, archivos asociados, y la próxima acción concreta que debes correr. Read-only — propone pero no ejecuta.
arguments:
  - name: slug
    required: true
    description: Slug del blog a retomar. Ej. `modalidad-40-imss-conviene`.
---

# /blog-resume — retoma un blog donde lo dejaste

## Uso

```
/blog-resume <slug>
```

Ejemplo:
```
/blog-resume modalidad-40-imss-conviene
```

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Lee `sanity/seeds/blog-pipeline-state.json` filtrando por slug.
3. Si no existe → te avisa que uses `/blog-idea`.
4. Si existe → reporta:
   - Phase actual
   - `lastTouched` (cuánto tiempo lleva ahí)
   - `draftHistoryFile` (último .md archivado)
   - `docxFile` (si hay Word exportado)
   - `imageAsset` (si hay imagen aprobada)
5. **Próxima acción concreta**: el comando exacto que debes correr (`/blog-write X`, `/blog-export-word X`, `/blog-apply-edits X`, `/blog-image X`, `/blog-publish X`).

## Qué NO hace

- NO ejecuta la próxima acción sola. Te la propone y tú decides.
- NO modifica state.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-resume <slug>`. Reporta el estado del blog y propone la próxima acción.
