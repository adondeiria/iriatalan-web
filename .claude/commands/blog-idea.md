---
name: blog-idea
description: Captura una idea de blog en el pipeline. La idea queda en `sanity/seeds/idea-backlog.md` + entrada en `blog-pipeline-state.json` con phase=idea. No triagea ni redacta automático — Iria decide después con `/blog-next` qué procesar.
arguments:
  - name: idea
    required: true
    description: El tema o título de la idea en lenguaje libre. Entre comillas si tiene espacios. Ej. `"Cuándo conviene Modalidad 40 antes de los 60"`.
---

# /blog-idea — captura idea suelta al pipeline

## Uso

```
/blog-idea "<tema o título humano>"
```

Ejemplos:
- `/blog-idea "Cuándo conviene Modalidad 40 antes de los 60"`
- `/blog-idea "Diferencia entre PPR y AFORE — qué le conviene a un freelance"`
- `/blog-idea "GMM internacional para familia con hijo neurodivergente"`

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. El conductor lee `blog-pipeline-state.json`.
3. Genera un slug kebab-case sin acentos.
4. Si ya existe → te avisa y propone `/blog-resume <slug>` o variante con sufijo.
5. Si es nuevo → append entrada nueva al state file con `phase=idea` + append bloque al `idea-backlog.md`.
6. Te pregunta si quieres triagearla ya (delega a `iriatalan-seo-blog` Modo 5) o dejarla para después.

## Qué NO hace

- NO redacta el draft.
- NO investiga keywords.
- NO confirma viabilidad del topic.
- Para todo eso, usa `/blog-next` (selección) o `arranca <slug>` después del triage.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` para procesar una idea nueva: `<idea del argumento>`. Sigue el workflow del comando `/blog-idea` definido en su agent file.
