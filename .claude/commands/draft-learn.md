---
name: draft-learn
description: Aprender de las correcciones que Iria hizo a un draft. Compara el draft generado por el agente (en draft-history/) contra la versión final corregida (que Iria entrega como .docx o markdown), extrae los cambios significativos, los categoriza con ayuda de Iria, y los escribe al voice corpus correspondiente.
arguments:
  - name: slug
    required: true
    description: El slug del artículo a aprender (ej. `modalidad-40-imss-conviene`).
  - name: revised-file
    required: false
    description: Ruta al archivo .docx o .md con la versión corregida por Iria. Si se omite, el comando pregunta dónde está.
---

# /draft-learn — sistema de aprendizaje del agente iriatalan-seo-blog

## Cuándo se invoca

Después de que Iria revisa un draft generado por el agente y lo corrige a su estilo. El comando extrae los aprendizajes de esa corrección y los persiste en el voice corpus para que el próximo draft incorpore el aprendizaje.

## Uso

```
/draft-learn <slug>
/draft-learn <slug> <ruta-al-docx-corregido>
```

Ejemplos:
- `/draft-learn modalidad-40-imss-conviene C:\Users\iriat\Documents\modalidad-40-imss-DRAFT-revision-FINAL.docx`
- `/draft-learn modalidad-40-imss-conviene` (luego el comando pregunta dónde está el archivo)

## Lo que hace, paso por paso

### Paso 1 — Cargar el draft original del agente

Busca en `sanity/seeds/draft-history/` el archivo más reciente que coincida con el patrón `<slug>__*.md`. Si hay varios timestamps, usa el más reciente. Si NO encuentra archivo, detente y pregunta a Iria:

> "No encuentro un draft archivado para `<slug>`. ¿Tienes el markdown original del agente? Pégalo aquí y guardamos como `<slug>__<YYYY-MM-DD-HHMMSS>.md` en draft-history antes de continuar."

### Paso 2 — Cargar la versión corregida de Iria

Si la ruta del archivo corregido viene como argumento, úsala. Si es `.docx`:

1. Invoca la skill `anthropic-skills:docx` para extraer texto: `extract-text <ruta>` o usar pandoc.
2. Convierte el output a markdown plano para facilitar el diff.

Si la ruta NO viene, pregunta:

> "¿Dónde está el archivo corregido? Puede ser:
> - Una ruta a un `.docx` o `.md` en tu compu.
> - Texto pegado directo en este chat (puedes pegarlo entre triple backticks)."

### Paso 3 — Hacer el diff semántico (no diff literal)

NO uses `git diff` ni diff de líneas — eso da ruido inservible. Usa diff semántico al nivel de párrafo:

1. Parsea ambas versiones en bloques estructurales: heading (H1/H2/H3), párrafo, item de lista, bloque de tabla, callout.
2. Empareja bloques por proximidad estructural + similitud léxica (no necesitas algoritmo formal — el LLM lo hace bien suficiente).
3. Para cada par emparejado, clasifica el cambio:
   - **EQUAL** — sin cambio
   - **REWORDED** — mismo punto, distinta voz/palabras (← interés alto)
   - **REPLACED** — cambio sustantivo (← interés alto)
   - **ADDED** — bloque nuevo que Iria añadió (← interés medio)
   - **REMOVED** — bloque que Iria borró (← interés alto)
4. Solo presenta a Iria los cambios marcados REWORDED, REPLACED, REMOVED, y los ADDED no triviales. EQUAL no aporta señal.

### Paso 4 — Pedir categorización a Iria (uno por uno)

Para cada cambio detectado, presenta el bloque ORIGINAL (del agente) y el FINAL (de Iria), y pregunta una sola vez:

```
Cambio #N de M

ORIGINAL (agente):
> <bloque del agente>

FINAL (Iria):
> <bloque corregido>

¿Qué tipo de aprendizaje es?
(a) Voz/tono — frase que sonaba a IA o muy formal; tú la dijiste mejor
(b) Dato/cifra — cifra incorrecta o fuente equivocada
(c) Estructural — agregaste/quitaste un H2, reordenaste, cambiaste el flujo
(d) Nicho/audiencia — falta de matiz para mexicano de [perfil X]
(e) Vocabulario — término técnico o de marca que no usé bien
(f) Ignorar — preferencia personal sin lección generalizable

[a/b/c/d/e/f]
```

Acepta también respuesta `salir` para detener el flujo a media corrección.

### Paso 5 — Persistir según la categoría

- **(a) Voz/tono** → escribe en `sanity/seeds/voice-corpus/iria-voice-do.md` el bloque de Iria + en `iria-voice-dont.md` el bloque del agente. Datar con `(YYYY-MM-DD)`.
- **(b) Dato/cifra** → NO se persiste en voice corpus. Avisa: "esto es un fix de dato, no de voz — ¿lo agrego al checklist de fact-check del draft?" y procede según diga Iria.
- **(c) Estructural** → resume el cambio en una entrada en `iria-voice-do.md` bajo sección "Estructura y ritmo". Si es un patrón mayor (ej. "siempre poner pregunta de elegibilidad antes de costo"), proponer al final del flujo: "¿agrego esto como regla en el system prompt del agente?".
- **(d) Nicho/audiencia** → escribir entrada en `iria-vocabulary.md` bajo sección "Nichos diferenciadores".
- **(e) Vocabulario** → escribir en `iria-vocabulary.md` con la convención correcta.
- **(f) Ignorar** → no persiste nada.

### Paso 6 — Opción de párrafo modelo

Si Iria reescribió un párrafo completo con su voz clara (cambio REPLACED grande, categoría (a)), pregunta al final:

> "¿Guardo este párrafo como ejemplo modelo en iria-example-paragraphs.md? Es de los que mejor capturan tu voz."

Si dice sí, agrega siguiendo la plantilla del archivo.

### Paso 7 — Resumen final

Imprime el resumen:

```
## Resumen de aprendizaje — <slug>

- Cambios procesados: N
- Voz/tono añadidos al corpus: X
- Términos añadidos al vocabulary: Y
- Patrones estructurales detectados: Z
- Párrafos modelo añadidos: W
- Reglas propuestas para el system prompt del agente: V (pendientes de tu OK)

Archivos modificados:
- sanity/seeds/voice-corpus/iria-voice-do.md
- sanity/seeds/voice-corpus/iria-voice-dont.md
- (etc.)

Próximo draft del agente debería capturar estos aprendizajes automático.
```

## Reglas operacionales del comando

- **NUNCA borrar entradas existentes** del voice corpus. Solo append.
- **NUNCA editar el draft-history archivado**. Es histórico inmutable.
- **NO commitear automático**. Iria decide cuándo commit + push.
- **Si un cambio es ambiguo**, pregunta antes de categorizar. Mejor pausar que adivinar.
- **Datar TODAS las entradas nuevas** con `(YYYY-MM-DD)`.
- **Si el comando se interrumpe a media corrección**, persiste lo procesado hasta el momento y reporta cuántos cambios quedaron sin procesar.

## Cómo se complementa con el agente

El agente `iriatalan-seo-blog` lee `sanity/seeds/voice-corpus/*` en pre-flight de Modos 2 y 5. Cada draft nuevo del agente incorpora todo lo que `/draft-learn` ha ido aprendiendo. Así, el agente mejora pasivamente sin tocar su system prompt.

Cuando un patrón aparece 3+ veces en `iria-voice-do.md`, el comando puede sugerir promover ese patrón al system prompt del agente — pero solo con OK explícito de Iria.

## Limitaciones honestas

- El comando **no entrena al modelo**. Solo enriquece el contexto que el agente lee.
- La calidad del aprendizaje depende del cuidado de Iria al categorizar. Si responde (f) "ignorar" a todo, el corpus no crece.
- Después de 50+ entradas en `do.md`/`dont.md`, conviene hacer un pase de consolidación manual (mergear entradas redundantes, agrupar por tema).
- Para drafts MUY pequeños (≤500 palabras), el ratio de señal a ruido del diff es bajo. Funciona mejor con drafts de 1500+ palabras.
