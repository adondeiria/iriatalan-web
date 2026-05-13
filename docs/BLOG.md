# Blog — Cómo publicar, schema, y reglas editoriales

> Sistema: Sanity CMS + Next.js App Router. Drafts no indexables.
> Stack: ver `package.json`. Convenciones del blog viven en este archivo.

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
| Script seed drafts | `scripts/seed-drafts.mjs` |
| Script seed glosario | `scripts/seed-glossary.mjs` |
