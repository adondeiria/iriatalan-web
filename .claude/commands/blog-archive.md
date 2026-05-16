---
name: blog-archive
description: Pausar/cancelar un blog del pipeline sin romper state. Marca phase=archived. La entrada se preserva en blog-pipeline-state.json (append-only) pero deja de aparecer en /blog-status y /blog-next.
arguments:
  - name: slug
    required: true
    description: Slug del blog a archivar.
---

# /blog-archive — pausar/cancelar un blog

## Uso

```
/blog-archive <slug>
```

Ejemplo:
```
/blog-archive blog-de-prueba-dry-run
```

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Lee state. Confirma que el slug existe.
3. Pregunta confirmación: *"Vas a archivar `<slug>` (phase=`<actual>`). El draft archivado en draft-history/ se preserva pero el blog desaparece de /blog-next. ¿Procedo?"*
4. Al confirmar, transiciona phase → `archived` + actualiza `lastTouched`.
5. Si phase actual era `published` o `done`, NO archivar — usa otro mecanismo si quieres despublicar.

## Qué NO hace

- NO borra entradas del state (append-only).
- NO despublica de Sanity (si ya está live, sigue live).
- NO borra el .docx ni el draft-history.

## Cuándo usarlo

- Cuando una idea ya no aplica (cambió estacionalidad, regulación cambió, dejó de interesarte).
- Cuando un blog se atascó técnicamente y quieres limpiar el pipeline.
- Para dry-run cleanup tras pruebas.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-archive <slug>`. Confirma con Iria antes de transicionar a archived.
