---
name: blog-write
description: Arranca la redacción de un blog. Si phase=idea, primero delega a seo-blog Modo 5 para brief. Si phase=brief-approved, delega a Modo 2 para redactar el draft. Al terminar, transiciona a word-exported invocando el export Word automático.
arguments:
  - name: slug
    required: true
    description: Slug del blog a redactar. Debe existir en el state file (creado vía /blog-idea o brief aprobado).
---

# /blog-write — redactar el draft del blog

## Uso

```
/blog-write <slug>
```

Ejemplo:
```
/blog-write modalidad-40-imss-conviene
```

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Lee state. Confirma phase ∈ {idea, brief-approved}.
3. Si phase=idea → delega a `iriatalan-seo-blog` Modo 5 (IDEA → BRIEF). Espera que Iria apruebe el brief.
4. Si phase=brief-approved → transiciona a `researching` y delega a `iriatalan-seo-blog` Modo 2 (DRAFT WRITING).
5. Al terminar (con archivo en `draft-history/`), invoca automático `/blog-export-word <slug>`.
6. Phase final: `word-exported`.

## Qué NO hace

- NO publica.
- NO genera imagen.
- NO sube a Sanity.
- Solo redacta + exporta Word.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-write <slug>`. Sigue su workflow para delegar a iriatalan-seo-blog y transicionar al state correcto.
