# draft-history — archivo de drafts generados por el agente

Aquí se guarda cada draft que produce el agente `iriatalan-seo-blog` cuando completa el Modo 2 (DRAFT WRITING). El comando `/draft-learn <slug>` lo usa para comparar contra la versión corregida que devuelve Iria.

## Formato de archivo

```
<slug>__<YYYY-MM-DD-HHMMSS>.md
```

Ejemplo: `modalidad-40-imss-conviene__2026-05-14-091400.md`.

Si Iria corrige el mismo slug varias veces, cada iteración queda con su propio timestamp — así se puede ver la trayectoria de mejora del agente para ese artículo.

## Contenido de cada archivo

El draft completo en markdown:
- TL;DR
- Excerpt
- Key Takeaways
- Body con H2/H3
- Disclaimer
- Sources
- JSON metadata (al final, como bloque de código)

Sin diff. Sin metadata adicional. Sin comentarios.

## Reglas

- **Append-only**. El agente nunca borra ni edita archivos viejos. Solo crea nuevos.
- **No commitear los archivos pesados** del .docx revisado aquí — esos viven en `C:\Users\iriat\Documents\` o donde Iria los guarde fuera del repo.
- **Si el draft no se publica**, igual queda archivado — sirve para entender qué descartamos y por qué.
- **Mantenimiento**: cada 6 meses, Iria decide si archivar los más viejos a un zip y limpiarlos, o dejarlos.

## Por qué dentro de `sanity/seeds/`

Esta carpeta es la "raíz de datos no-runtime" del proyecto. Convive con `draft-articles.ndjson`, `glossary-terms.ndjson`, `idea-backlog.md`, `voice-corpus/`. Mantener todo junto facilita backup y descubribilidad.

## Lo que NO va aquí

- Versiones corregidas por Iria (esas las guarda ella en `C:\Users\iriat\Documents\` o donde prefiera).
- Drafts publicados (esos viven en Sanity Studio, no en archivos).
- Borradores parciales del agente (solo drafts completos al final de Modo 2).

---

**Mantenimiento**: agente `iriatalan-seo-blog` (escribe) + comando `/draft-learn` (lee).
