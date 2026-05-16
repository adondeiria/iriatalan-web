---
name: blog-apply-edits
description: Aplica las correcciones que Iria hizo en Word al draft. Iria pega el texto corregido (de Word ya con Track Changes aceptadas, o markdown limpio). El conductor reconstruye el draft preservando metadata, guarda nueva versión en draft-history/, y enriquece el voice corpus vía /draft-learn.
arguments:
  - name: slug
    required: true
    description: Slug del blog cuyas correcciones aplicas.
---

# /blog-apply-edits — aplicar correcciones del Word al draft

## Uso

```
/blog-apply-edits <slug>
```

Después de correrlo, pega el texto corregido en el siguiente mensaje. Ejemplo:

```
/blog-apply-edits modalidad-40-imss-conviene

Modalidad 40 puede aumentar muchísimo tu pensión...
[todo el texto del Word, copy-paste bruto]
```

O en dos turnos:
1. `/blog-apply-edits modalidad-40-imss-conviene`
2. El conductor pregunta: "Pega aquí el texto corregido."
3. Tú pegas en el siguiente mensaje.

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Confirma phase = `awaiting-edits`.
3. Lee el archivo más reciente `draft-history/<slug>__*.md` para preservar header (Slug/Topic/Format/etc.).
4. Detecta si el pegado es texto plano (Word copy-paste) o markdown.
5. Reconstruye el draft:
   - Header de metadata original (sin cambios).
   - Body del texto pegado, re-marcando H2 como `## ¿pregunta?` si vino plano, listas con `-`, etc.
   - Preserva TL;DR, Excerpt, Disclaimer, Sources si existían.
6. Guarda como nuevo archivo: `draft-history/<slug>__<YYYY-MM-DD-HHMMSS>.md`.
7. Invoca `/draft-learn <slug>` para extraer aprendizajes del diff y enriquecer voice corpus.
8. Actualiza state: `draftHistoryFile`, `edits.round++`, `edits.appliedAt`, phase → `edits-applied`.
9. Te pregunta si pasamos a imagen con `/blog-image <slug>`.

## Qué NO hace

- NO publica.
- NO sube a Sanity.
- NO sobrescribe el draft anterior (es append-only — la versión vieja queda archivada).

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-apply-edits <slug>`. Pide a Iria el texto corregido si no lo pegó. Reconstruye el draft preservando metadata, guarda en draft-history, invoca /draft-learn, y transiciona phase.
