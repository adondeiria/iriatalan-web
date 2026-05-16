# iria-example-paragraphs — párrafos modelo para style transfer

> Párrafos completos donde la voz de Iria está clara. El agente los lee como referencia de estilo en pre-flight de Modo 2 (DRAFT WRITING).

## Cómo se llena este archivo

Cada bloque es un párrafo o sección corta (≤200 palabras) que:
1. Iria escribió originalmente, o
2. Iria validó después de revisar y aprobar.

Datado para entender la antigüedad. Marcado con etiqueta de contexto (`#explicacion`, `#cierre`, `#caso`, `#transicion`).

---

## Estado inicial: vacío

Este archivo arranca vacío. Se llena conforme:

- Iria devuelva drafts revisados y `/draft-learn` extraiga párrafos enteros que ella reformuló o aprobó.
- Iria pegue manualmente fragmentos de textos suyos previos (ej. emails a clientes, scripts de video, posts de LinkedIn que considere representativos).

**Meta**: 10 ejemplos en 8 semanas. Con eso, el agente tiene material suficiente para style transfer real.

---

## Plantilla para añadir un ejemplo manualmente

```
### Ejemplo: <título corto descriptivo>

**Contexto**: <de dónde viene este párrafo y qué intentaba lograr>
**Etiquetas**: #explicacion #cierre #caso #transicion (uno o más)
**Fecha**: YYYY-MM-DD

> <el párrafo, tal cual lo escribió Iria, sin reformular>

---
```

---

## Por qué este archivo es el más valioso de todos a largo plazo

Las reglas en `do.md` y `dont.md` son útiles pero abstractas. Los párrafos completos enseñan al modelo el **flujo, ritmo, transiciones y respiración** entre oraciones, que es lo que más distingue una voz humana de un texto LLM.

Cuando este archivo tenga 10-15 ejemplos, el agente puede hacer **few-shot style transfer**: "redacta este H2 con el ritmo de los ejemplos #3 y #7".
