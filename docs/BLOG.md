# Blog — Cómo publicar, schema, y reglas editoriales

> Sistema: Sanity CMS + Next.js App Router. Drafts no indexables.
> Stack: ver `package.json`. Convenciones del blog viven en este archivo.

---

## Flujo automatizado con `iriatalan-blog-conductor`

> **Recomendado**: usa el agente conductor para que el pipeline corra solo desde "idea" hasta "artículo live". Si prefieres flujo manual, salta a la sección siguiente.

El agente `iriatalan-blog-conductor` (`.claude/agents/iriatalan-blog-conductor.md`) orquesta el pipeline editorial end-to-end. Tú interactúas con él vía slash commands; él delega a los sub-agentes y scripts:

### Slash commands disponibles

| Comando | Para qué |
|---|---|
| `/blog-idea "<tema>"` | Captura una idea suelta cuando se te ocurre |
| `/blog-next` | Recomienda 1-3 candidatos para esta semana (seasonality MX + topic gap + nichos) |
| `/blog-status` | Tabla de todos los blogs y en qué fase están |
| `/blog-resume <slug>` | Retoma un blog donde lo dejaste; te dice qué falta |
| `/blog-week` | Modo proactivo semanal — recomienda + arranca 1-3 blogs en background |
| `/blog-archive <slug>` | Pausar/cancelar un blog del pipeline (preserva state) |
| `/blog-write <slug>` | Investiga + redacta el draft (delega a `iriatalan-seo-blog`) y lo exporta a Word |
| `/blog-export-word <slug>` | (Re)genera el `.docx` desde el draft actual |
| `/blog-apply-edits <slug>` | Aplica tus correcciones del Word (pegas el texto al chat) |
| `/blog-image <slug>` | Propone 3 conceptos visuales, genera con Higgsfield, sube a Sanity |
| `/blog-publish <slug>` | Push + draft:false + revalidate Vercel + verify markers en producción |

### Las 11 fases del pipeline (state persistente)

```
idea → brief-approved → researching → drafting → word-exported
     → awaiting-edits → edits-applied → image-concepts → image-approved
     → published → done
```

El estado vive en `sanity/seeds/blog-pipeline-state.json` (committed). Cada entrada tiene `slug, title, topic, format, phase, created, lastTouched (ISO 8601), draftHistoryFile, docxFile, edits, imageConcept, imageAsset, sanityDocId, publishedUrl, verifyMarkers[]`.

### Checkpoints humanos

El conductor SIEMPRE espera tu OK explícito en 3 puntos antes de publicar:

1. **Word**: tras `/blog-export-word`, abres `borradores/<slug>.docx`, marcas cambios, y vuelves con `/blog-apply-edits`.
2. **Imagen**: tras `/blog-image`, eliges 1 de 3 conceptos y apruebas el preview generado.
3. **Publish**: tras `/blog-publish`, das "sí" explícito antes de que el agente publique + revalide.

### Archivos que se crean / modifican

| Archivo | Quién lo escribe | Cuándo |
|---|---|---|
| `sanity/seeds/blog-pipeline-state.json` | conductor | cada transición de fase |
| `sanity/seeds/idea-backlog.md` | conductor | en `/blog-idea` (append) |
| `sanity/seeds/draft-history/<slug>__<YYYY-MM-DD-HHMMSS>.md` | `iriatalan-seo-blog` Modo 2 + conductor en apply-edits | al final de redacción y de cada revisión |
| `borradores/<slug>.docx` (gitignored) | `scripts/draft-export-docx.mjs` | en `/blog-export-word` |
| `sanity/seeds/voice-corpus/*.md` | `/draft-learn` (invocado por conductor en apply-edits) | enriquece voz Iria con cada revisión |

### Requisitos antes de usar el conductor

1. **Instalar la lib docx**: `npm install docx --save-dev` (una sola vez).
2. **Setear `REVALIDATE_SECRET`** en `.env.local` (string aleatoria, 32+ chars) Y en Vercel env vars (Production + Preview).
3. **Setear `SITE_URL`** en `.env.local` (`https://iriatalan.com.mx`).
4. **Setear `SANITY_API_WRITE_TOKEN`** en `.env.local` con scope Editor (ya existe si usaste `/draft-push`).
5. **Higgsfield MCP** activo en Claude Code (ya configurado).

### Flujo típico end-to-end

```
/blog-idea "Cómo combinar PPR y Modalidad 40 para un mexicano de 50 años"
   → idea capturada en backlog

/blog-next
   → recomienda 3 candidatos; eliges uno

arranca <slug>
   → conductor llama a iriatalan-seo-blog Modo 2
   → 30-60 min de research + draft + voice corpus + fact-check
   → al terminar, exporta a Word

[abres borradores/<slug>.docx en tu laptop, marcas cambios]

/blog-apply-edits <slug>
   [pegas el texto corregido]
   → conductor reconstruye el draft + enriquece voice corpus

/blog-image <slug>
   → propone 3 conceptos
   eliges 1
   → genera con Higgsfield, muestra preview
   apruebas
   → sube a Sanity

/blog-publish <slug>
   → push --apply --publish (draft:false)
   → revalidate Vercel
   → verify markers en https://iriatalan.com.mx/blog/<slug>
   → ✅ live en producción
```

Total: 1-3 horas activas tuyas + tiempo background del agente. Mucho menos que los 2 días del flujo manual.

---

## Cómo convertir un draft en artículo publicado

Cada artículo del blog vive en Sanity como documento de tipo `article`. Hay 12
drafts pre-creados (slugs en `sanity/seeds/draft-articles.ndjson`). Para
publicar uno:

1. Abre **Sanity Studio** → `https://iriatalan.com.mx/studio/structure/article`.
2. Busca el draft (chip rojo "🔴 DRAFT" en el preview).
3. Llena los campos en el grupo **Esencial**:
   - **Título** (humano, no SEO)
   - **Categoría** (`topic`)
   - **Formato editorial** (`format`) — determina si emite `Article` o `HowTo` en JSON-LD
4. Llena el grupo **Citabilidad LLM** (crítico — esto se cita literal):
   - **TL;DR** — 2-4 líneas autocontenidas (max 320 chars). Es lo que ChatGPT/Perplexity citarán.
   - **Preguntas que responde** — 3-7 preguntas literales tipo "¿Cuánto cuesta un GMM en México?"
5. Llena el grupo **Contenido**:
   - **Excerpt** (160 chars, va a meta description)
   - **Imagen hero** (con alt text obligatorio)
   - **Body** (Portable Text — ver sección "Estructura editorial" abajo)
   - **FAQs** (opcional, refs a documentos `faq`)
6. Llena el grupo **EEAT / Fuentes** (crítico YMYL):
   - **Autor** (siempre Iria salvo guest post)
   - **Revisado por** (opcional, refuerza autoridad)
   - **Fuentes** — al menos 2-3 citas a CNSF, AMIS, BMV, Banxico, IMSS, SAT o CONDUSEF
7. Llena el grupo **Meta**:
   - **Fecha de publicación**
   - **Última actualización** (igual a publicación al crear)
8. Llena el grupo **SEO** (opcional — usa título y excerpt si vacíos).
9. **Apaga el toggle "🔴 Draft (oculto al público)"**.
10. Click "Publish" en Studio.

Listo. El artículo aparece automático en:
- `/blog` index
- `/blog/categoria/{slug}` correspondiente
- `/blog/{slug}` detail
- `sitemap.xml`
- `RelatedPosts` de otros artículos del mismo topic

---

## Estructura editorial obligatoria

Cada artículo publicado debe seguir este orden en el `body` (Portable Text):

1. **H1** — el campo `title` (se renderiza automático, no lo metas en body).
2. **TL;DR box** — el campo `tldr` (se renderiza automático arriba del fold).
3. **Key Takeaways** — bloque custom "⭐ Key Takeaways" con 3-5 bullets. Aparece después del hero.
4. **Cuerpo principal**:
   - H2 = preguntas literales del usuario (lo que escribirían en Google).
     - ✅ "¿Qué cubre un seguro de vida en México?"
     - ❌ "Cobertura del seguro de vida"
   - Párrafos cortos (máx 3 oraciones).
   - Listas y tablas comparativas cuando aclaren — usa el bloque custom "📊 Tabla comparativa".
   - Citas inline con publisher visible — usa el bloque custom "📎 Cita de fuente".
   - Términos técnicos enlazados a `/glosario` — usa el bloque custom "📖 Referencia a glosario".
5. **Disclaimer** — bloque custom "⚠️ Disclaimer" con variante (financiero / médico / legal) si aplica.

El layout de la página agrega automático:
- Breadcrumbs (Inicio → Blog → Categoría → Artículo)
- Tabla de contenido (si hay 3+ H2/H3)
- Author card al pie con credenciales priorizadas (MDRT, AMASFAC, CNSF, Yale, LSE)
- Related Posts (3 del mismo topic, o el override manual `relatedArticles`)
- CTA "Agenda sesión inicial"

---

## Reglas críticas de redacción (YMYL finanzas México)

**NO inventes**:
- Cifras fiscales (montos deducibles, topes LISR, etc.) — siempre cita Banxico/SAT/IMSS.
- Regulación mexicana — siempre cita CNSF/CONDUSEF.
- Coberturas de productos específicos — siempre cita el carrier.
- Resultados financieros prometidos.

**SÍ usa**:
- Placeholders explícitos cuando falte un dato real: `[FUENTE_PENDIENTE]`, `[VERIFICAR_CIFRA]`.
- Disclaimers cuando aplique (especialmente en casos médicos/legales/fiscales).
- "Generalmente" / "en muchas pólizas" en vez de afirmaciones absolutas.

**Tono**:
- Profesional, humano, sobrio.
- Cero hype. Evita "descubre", "transforma", "revoluciona".
- Apellido **Talan** sin acento. Siempre.

---

## Custom blocks Portable Text

Disponibles en el body de cualquier artículo:

| Block | Cuándo usarlo |
|---|---|
| Key Takeaways | Resumir 3-5 puntos al inicio del artículo. LLMs citan estos literales. |
| Tabla comparativa | A vs B. Renderiza `<table>` HTML real (no imagen — Perplexity la extrae). |
| Disclaimer | Aviso financiero/médico/legal/genérico. Refuerza responsabilidad EEAT. |
| Cita de fuente (data callout) | Cita de CNSF/AMIS/Banxico con publisher + fecha + URL visibles. |
| Referencia a glosario | Link inline a `/glosario/{slug}`. Si el término está en draft, renderiza como texto. |

---

## Glosario

14 términos pre-creados (drafts). Cada uno tiene:
- `term` (display)
- `slug`
- `shortDefinition` (1-2 oraciones, max 320 chars, sin cifras/años)
- `topic` (categoría relacionada)
- `synonyms` (variantes — entity disambiguation LLM)
- `relatedTerms` (opcional, max 5 refs)

**Para publicar un término**: igual que un artículo, apaga el toggle "🔴 Draft" y publica.

**Editorial rule**: las definiciones deben ser **conceptuales y neutras**. Sin
cifras, sin años, sin artículos LISR. Para detalles específicos enlaza al
artículo del blog correspondiente.

---

## Seeds — cómo correrlos

Los 12 drafts y 14 términos no se crean automático en Sanity. Para sembrarlos:

```bash
# 1. Asegúrate de tener SANITY_API_WRITE_TOKEN en .env.local
#    (pídelo en sanity.io/manage → IRIA TALAN RIF → API → Tokens, scope Editor)

# 2. Dry-run primero (imprime lo que crearía, no toca Sanity)
node scripts/seed-drafts.mjs
node scripts/seed-glossary.mjs

# 3. Si todo se ve bien, aplica
node scripts/seed-drafts.mjs --apply
node scripts/seed-glossary.mjs --apply
```

Ambos scripts son **idempotentes** (`createIfNotExists`). Re-correrlos no
sobrescribe ediciones que hayas hecho en Studio.

---

## Push automático a Sanity — `/draft-push`

Para no tener que llenar campo por campo en Studio cada vez, existe el comando `/draft-push <slug>` que sube un draft archivado del repo (en `sanity/seeds/draft-history/<slug>__*.md`) directo a Sanity como documento `article` con `draft: true`. Tú solo entras a Studio, revisas última vez, llenas lo que falta (autor + imagen hero) y publicas con 1 click.

### Flujo completo

```
iriatalan-seo-blog (Modo 2) → genera draft → guarda en draft-history/
                                                        │
                                                        ▼
              Tú revisas (en chat o exportado a Word), corriges
                                                        │
                                                        ▼
                                /draft-learn <slug> → enriquece voice corpus
                                                        │
                                                        ▼
                            /draft-push <slug> → sube a Sanity como draft
                                                        │
                                                        ▼
                                Tú en Studio: autor + imagen + Publish
```

### Cómo usarlo

1. Cuando tengas un draft revisado y archivado en `sanity/seeds/draft-history/`, corre:
   ```
   /draft-push modalidad-40-imss-conviene
   ```
2. El agente `iriatalan-sanity-publisher` orquestra:
   - Verifica que el draft existe.
   - Corre **dry-run primero** (imprime el doc, NO toca Sanity).
   - Te pide confirmación explícita.
   - Corre **--apply** después de tu OK.
   - Te devuelve el URL del doc en Studio.

### Qué se sube automático y qué tú llenas en Studio

**El script puebla automático**:
- `_id`, `_type`, `draft: true`, `title`, `slug.current`, `topic`, `format`.
- `tldr`, `excerpt`.
- `questionsAnswered` (extraído de los H2 que empiezan con `¿`).
- `body` completo con custom blocks (`keyTakeaways`, `dataCallout`, `disclaimer`, `comparisonTable`).
- `sources` (array con title/url/publisher).
- `lastReviewed` (fecha de hoy ISO).

**Tú llenas en Studio antes de publicar**:
- **Autor** (reference a Iria Talan — selecciona del dropdown).
- **Imagen hero** con alt text descriptivo.
- **`dataCallout.sourceUrl`** real para cada callout marcado "Pendiente — completar en Studio" (el script pone placeholder).
- **`seoTitle`** y **`seoDescription`** (si no estaban en el draft).
- Verificar que los `sources` tengan publisher y URL correctos.
- Apagar el toggle 🔴 Draft.
- Click Publish.

### Prerequisito — `SANITY_API_WRITE_TOKEN`

El script lee este token de `.env.local`. Si no existe, falla con mensaje claro. Para crearlo:

1. Abre [https://sanity.io/manage](https://sanity.io/manage).
2. Selecciona el proyecto **IRIA TALAN RIF** (`0xa0dciq`).
3. Menú **API** → tab **Tokens** → **Add API token**.
4. Nombre: `draft-push (Iria laptop)`. Scope: **Editor**.
5. Copia el token y pégalo en `.env.local`:
   ```
   SANITY_API_WRITE_TOKEN=sk...
   ```
6. Guarda. El mismo token sirve también para `seed-drafts.mjs` y `seed-glossary.mjs`.

### Errores comunes

| Mensaje | Causa | Cómo arreglar |
|---|---|---|
| `Falta SANITY_API_WRITE_TOKEN` | No hay token en `.env.local` | Crea uno (ver arriba) |
| `No hay archivos en draft-history para slug "X"` | El draft no fue archivado | Corre `iriatalan-seo-blog` en Modo 2 primero |
| `HTTP 401` | Token inválido | Regenera el token |
| `HTTP 422` | Schema validation falló | El parser no maneja un campo nuevo del schema — ajustar `scripts/draft-push.mjs` |
| `tldr tiene N chars (max 320)` | El draft excede el límite | Edita el draft archivado o vuelve al agente SEO |

---

## Citabilidad LLM — qué emite el sitio en JSON-LD

Cada artículo publicado emite (vía `lib/seo.ts:buildArticleSchema`):

- `@type: Article` con headline, description, abstract (= tldr), image,
  datePublished, dateModified, inLanguage es-MX, wordCount, keywords.
- `about: Thing` enlazado al concepto canónico (seguro de vida, GMM, etc.)
  con sameAs a Wikipedia cuando aplica.
- `mainEntity: Question[]` derivado de `questionsAnswered` — híbrido
  Article+FAQ sin duplicar schema.
- `speakable: SpeakableSpecification` apuntando a `[data-speakable='tldr']`
  y `[data-speakable='title']` — priorización para voice/answer engines.
- `citation: CreativeWork[]` derivado de `sources`.
- `author`, `reviewedBy`, `publisher` con `@id` a la entity de Iria/Org.
- `isAccessibleForFree: true`.

Cada término del glosario emite (vía `lib/seo.ts:buildDefinedTermSchema`):

- `@type: DefinedTerm` con name, description, alternateName (= synonyms),
  inDefinedTermSet apuntando al glosario completo.

---

## Checklist antes de publicar

- [ ] Toggle `draft` apagado
- [ ] TL;DR llenado (2-4 líneas, sin marketing)
- [ ] Preguntas que responde (3-7, literales tipo H2)
- [ ] Excerpt llenado (≤160 chars)
- [ ] H2 del body = preguntas literales (no títulos de marketing)
- [ ] Fuentes con publisher (CNSF, AMIS, Banxico, etc.)
- [ ] Imagen hero con alt text
- [ ] Sin cifras inventadas / sin regulación inventada
- [ ] `publishedAt` correcto
- [ ] Disclaimer si aplica (variante apropiada)

---

## Agente dedicado: `iriatalan-seo-blog`

Existe un agente custom scoped al repo en
[`.claude/agents/iriatalan-seo-blog.md`](../.claude/agents/iriatalan-seo-blog.md)
que automatiza el trabajo SEO/AEO/GEO del blog.

### Cuándo se activa automático

El agente tiene auto-trigger configurado para que Claude Code lo invoque
cuando digas frases como:

- *"blog semanal"* / *"qué escribo esta semana"* → **Weekly Plan mode**
- *"redacta el artículo X"* / *"draft del [topic]"* → **Draft Writing mode**
- *"audita /blog/[slug]"* / *"review SEO del artículo X"* → **Audit mode**
- *"keywords para [topic]"* / *"intent research"* → **Research mode**
- *"tengo una idea para el blog"* / *"escribe sobre X"* / *"procesa el backlog de ideas"* → **Idea → Brief → Draft mode**

### Cuándo invocarlo manual

Si quieres forzar la invocación, puedes pedir explícitamente:

> *"Usa el agente iriatalan-seo-blog para [tarea]"*

### Los 5 modos del agente

| Modo | Para qué sirve | Input que necesita |
|---|---|---|
| **Weekly Plan** | Decidir qué artículo escribir esta semana | nada (lee el estado de drafts solo) |
| **Draft Writing** | Escribir el contenido completo de un draft | slug del draft (ej. `como-elegir-seguro-de-vida-mexico`) |
| **Audit** | Revisar un artículo publicado y sugerir mejoras | slug ya publicado |
| **Research** | Keyword + competitor analysis para un topic | un topic o pregunta |
| **Idea → Brief → Draft** | Convertir ideas frescas de Iria en briefs aprobables y luego drafts | idea en chat ("escribe sobre X") o `sanity/seeds/idea-backlog.md` |

### Modo 5 — cómo darle ideas al agente

Hay dos canales:

1. **Chat directo** — escribe *"tengo una idea para el blog: [tu idea]"* o *"escribe sobre [tema]"*. El agente devuelve un brief de 1 página por idea (slug propuesto, topic, format, keyword, competencia, questionsAnswered, TL;DR boceto, ángulo TALAN diferenciador, veredicto 🟢/🟡/🔴). Después aprueba con *"aprueba [slug]"* y el agente agrega la línea al NDJSON.

2. **Backlog batch** — anota ideas sueltas en [`sanity/seeds/idea-backlog.md`](../sanity/seeds/idea-backlog.md) (una por bloque, separadas por `---`). Cuando le digas *"procesa el backlog de ideas"*, las triagea todas y marca cada bloque con `**triaged: 🟢|🟡|🔴** — YYYY-MM-DD`.

El agente NO toca otros archivos. Solo agrega al `draft-articles.ndjson` cuando apruebas, y marca el `idea-backlog.md` cuando procesa el batch.

### Sistema de aprendizaje: voice corpus + /draft-learn

Para que el agente mejore con cada draft sin que tengas que reeditar su system prompt, existe un **voice corpus** en [`sanity/seeds/voice-corpus/`](../sanity/seeds/voice-corpus/) con 4 archivos:

| Archivo | Qué guarda |
|---|---|
| `iria-voice-do.md` | Frases, modos de decir, transiciones que SÍ son tuyas |
| `iria-voice-dont.md` | Frases que NUNCA usarías (tics LLM, corporate, marketing) |
| `iria-vocabulary.md` | Terminología específica (productos, carriers, nichos, conceptos legales) |
| `iria-example-paragraphs.md` | Párrafos modelo para style transfer (se llena con drafts revisados) |

El agente lee estos archivos **siempre antes de redactar** (Modos 2 y 5). Cada draft incorpora todo lo que el corpus ha acumulado.

**Cómo se alimenta el corpus**:

1. El agente genera un draft y lo archiva en [`sanity/seeds/draft-history/<slug>__<timestamp>.md`](../sanity/seeds/draft-history/).
2. Tú lo revisas, corriges, y devuelves la versión final (en `.docx` o markdown).
3. Invocas **`/draft-learn <slug> <ruta-al-archivo-corregido>`** en una sesión Claude Code del repo.
4. El comando compara el draft archivado vs tu versión final, te pregunta categoría de cada cambio (voz / dato / estructural / nicho / vocabulario / ignorar), y persiste los aprendizajes al archivo correcto del corpus.

**Resultado**: cada draft nuevo del agente arranca con más contexto sobre tu voz. Después de 5-10 ciclos, los drafts deberían sonar mucho más a ti desde la primera versión.

**Lo que el sistema NO hace** (honestidad de expectativa):

- No reentrena el modelo LLM. Eso no es posible desde el cliente.
- No funciona si nunca invocas `/draft-learn`. El corpus se queda como lo dejaste.
- No reemplaza tu revisión humana. Es complemento, no sustituto.
- Para drafts cortos (≤500 palabras) el aprendizaje es marginal — el ratio de señal/ruido es bajo.

### Reglas internas del agente

El agente conoce:
- Tus credenciales (MDRT TOT, AMASFAC 8vo, CNSF, Yale, LSE) y las usa para EEAT
- Los 12 drafts pendientes y los 14 términos del glosario
- El schema Sanity con todos los campos LLM-ready (tldr, questionsAnswered, format, lastReviewed)
- Los custom Portable Text blocks disponibles
- Reglas YMYL México (no inventar cifras/regulación/coberturas)
- Apellido **Talan** sin acento
- Fuentes oficiales aceptadas (CNSF, AMIS, Banxico, IMSS, SAT, CONDUSEF, INEGI)
- Skills que debe invocar para cada modo

### Lo que NO hace el agente

- Implementar componentes/rutas/schemas (eso es main thread)
- Decidir paleta/tipografía/layout (eso es skill `aesthetic-override-iriatalan`)
- Ejecutar git commit / push / build (eso lo decides tú)
- Publicar directo a Sanity Studio (genera markdown + JSON, tú pegas en Studio)

### Expectativas honestas

El agente **maximiza condiciones** para ranking, no **garantiza** ranking.
SEO orgánico tarda 3-6 meses en mostrar resultados para artículos nuevos.
La calidad de los drafts + consistencia editorial semanal mueven la aguja.

---

## Archivos relevantes (mapa rápido)

| Qué | Dónde |
|---|---|
| Schema artículo | `sanity/schemas/article.ts` |
| Schema glosario | `sanity/schemas/glossaryTerm.ts` |
| Queries GROQ (todas filtran drafts) | `sanity/lib/queries.ts` |
| JSON-LD generators | `src/lib/seo.ts` |
| Taxonomía topic ↔ URL slug | `src/lib/blog.ts` |
| Componentes blog (TLDRBox, AuthorCard, etc.) | `src/components/blog/` |
| Renderer Portable Text + custom blocks | `src/components/portable-text.tsx` |
| /blog index | `src/app/blog/page.tsx` |
| /blog/{slug} | `src/app/blog/[slug]/page.tsx` |
| /blog/categoria/{slug} | `src/app/blog/categoria/[slug]/page.tsx` |
| /glosario index | `src/app/glosario/page.tsx` |
| /glosario/{slug} | `src/app/glosario/[slug]/page.tsx` |
| sitemap dinámico | `src/app/sitemap.ts` |
| robots.txt | `src/app/robots.ts` |
| llms.txt | `public/llms.txt` |
| Seed NDJSON drafts | `sanity/seeds/draft-articles.ndjson` |
| Seed NDJSON glosario | `sanity/seeds/glossary-terms.ndjson` |
| Buzón de ideas para el agente (Modo 5) | `sanity/seeds/idea-backlog.md` |
| Voice corpus (aprendizaje continuo del agente) | `sanity/seeds/voice-corpus/` |
| Archivo de drafts generados (para `/draft-learn`) | `sanity/seeds/draft-history/` |
| Slash command de aprendizaje | `.claude/commands/draft-learn.md` |
| Slash command de push a Sanity | `.claude/commands/draft-push.md` |
| Script seed drafts | `scripts/seed-drafts.mjs` |
| Script seed glosario | `scripts/seed-glossary.mjs` |
| Script push a Sanity (markdown → Portable Text → HTTP API) | `scripts/draft-push.mjs` |
| Agente SEO/AEO del blog (research + redacción) | `.claude/agents/iriatalan-seo-blog.md` |
| Agente publisher (push a Sanity con `draft: true`) | `.claude/agents/iriatalan-sanity-publisher.md` |
