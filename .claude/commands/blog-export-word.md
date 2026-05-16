---
name: blog-export-word
description: Exporta el draft markdown actual a un archivo Word (.docx) listo para que Iria revise fuera del chat. El Word resalta claims con fuente, dataCallouts pendientes, disclaimers, y deja espacio para Track Changes.
arguments:
  - name: slug
    required: true
    description: Slug del blog a exportar.
---

# /blog-export-word — convierte el draft a Word

## Uso

```
/blog-export-word <slug>
```

Ejemplo:
```
/blog-export-word modalidad-40-imss-conviene
```

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Lee state. Confirma phase ∈ {drafting, word-exported, awaiting-edits, edits-applied, published, done}.
3. Lee el archivo más reciente `sanity/seeds/draft-history/<slug>__*.md`.
4. Ejecuta `node scripts/draft-export-docx.mjs <slug>`.
5. El script genera `borradores/<slug>.docx` con:
   - H1 = título
   - TL;DR en bloque destacado
   - Body con H2/H3 nativos de Word
   - **Claims con fuente** resaltados en amarillo
   - **dataCallouts pendientes** resaltados en rojo
   - **[VERIFICAR_CIFRA]** o **[FUENTE_PENDIENTE]** resaltados en rojo
   - Disclaimer al final en bloque gris
6. Actualiza state: `docxFile` + phase → `awaiting-edits`.
7. Te dice exactamente dónde está el archivo y qué hacer después (`/blog-apply-edits <slug>`).

## Qué NO hace

- NO modifica el draft markdown original.
- NO sube nada a Sanity.
- NO traduce Word de vuelta a markdown (eso es `/blog-apply-edits`).

## Prerequisitos

- `scripts/draft-export-docx.mjs` debe existir.
- Iria tiene Word instalado (o LibreOffice / Google Docs / cualquiera que abra `.docx`).
- Carpeta `borradores/` existe en la raíz del repo (la crea el script si falta — está gitignored).

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-export-word <slug>`. Ejecuta el script de export y transiciona phase a awaiting-edits.
