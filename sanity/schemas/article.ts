import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Schema `article` — blog post.
 *
 * Estrategia citabilidad LLM (Perplexity, ChatGPT, Google AI Overviews):
 *  - `tldr`: respuesta autocontenida 2-4 líneas → render arriba del fold + speakable JSON-LD
 *  - `questionsAnswered`: preguntas literales que el artículo responde → matching query intent
 *  - `format`: determina si emite `Article` o `HowTo` schema
 *  - `lastReviewed`: distinta de updatedAt — permite "revisado en X" sin tocar dateModified
 *
 * Drafts:
 *  - `draft: true` (default) — oculta de sitemap, llms.txt, /blog index, /blog/[slug] (404), category pages
 *  - Para publicar: cambiar a `draft: false` + setear `publishedAt` + `author`
 *  - Validation aflojada cuando draft=true para permitir scaffolds vacíos
 */
export const article = defineType({
  name: "article",
  title: "Artículo",
  type: "document",
  groups: [
    { name: "core", title: "Esencial", default: true },
    { name: "citability", title: "Citabilidad LLM" },
    { name: "content", title: "Contenido" },
    { name: "eeat", title: "EEAT / Fuentes" },
    { name: "seo", title: "SEO" },
    { name: "meta", title: "Meta" },
  ],
  fields: [
    // ---------- CORE ----------
    defineField({
      name: "draft",
      title: "🔴 Draft (oculto al público)",
      type: "boolean",
      group: "core",
      initialValue: true,
      description:
        "Si está ON: el artículo NO aparece en /blog, /blog/[slug] (404), sitemap.xml ni llms.txt. Cambia a OFF cuando esté listo para publicar.",
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "core",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "core",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "topic",
      title: "Categoría",
      type: "string",
      group: "core",
      options: {
        list: [
          { title: "⭐ Seguros de Vida", value: "vida" },
          { title: "⭐ GMM (Gastos Médicos Mayores)", value: "gmm" },
          { title: "Retiro / AFORE / PPR", value: "retiro" },
          { title: "Planeación Patrimonial", value: "patrimonial" },
          { title: "Planes Educacionales", value: "educacionales" },
          { title: "Fideicomisos", value: "fideicomisos" },
          { title: "Empresas", value: "empresas" },
          { title: "Casos especiales", value: "casos" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "format",
      title: "Formato editorial",
      type: "string",
      group: "core",
      description:
        "Determina el schema.org type (HowTo vs Article) y el layout del post.",
      options: {
        list: [
          { title: "Guía paso a paso (HowTo)", value: "guia" },
          { title: "Comparativa (A vs B)", value: "comparativa" },
          { title: "¿Qué es / explicación de concepto?", value: "que-es" },
          { title: "Checklist (qué revisar antes de…)", value: "checklist" },
          { title: "Errores comunes (qué evitar)", value: "errores" },
          { title: "FAQ extenso", value: "faq" },
        ],
      },
      initialValue: "que-es",
      validation: (Rule) => Rule.required(),
    }),

    // ---------- CITABILIDAD LLM ----------
    defineField({
      name: "tldr",
      title: "TL;DR — respuesta autocontenida (2-4 líneas)",
      type: "text",
      group: "citability",
      rows: 3,
      description:
        "La respuesta directa, sin marketing. Se renderiza arriba del fold y se marca como `speakable` en JSON-LD. Esto es lo que Perplexity/ChatGPT citan literal.",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value) return "Requerido para publicar (no draft).";
          if (typeof value === "string" && value.length > 320) {
            return "Máximo 320 caracteres — debe ser conciso para que sea citable.";
          }
          return true;
        }),
    }),
    defineField({
      name: "questionsAnswered",
      title: "Preguntas que este artículo responde",
      type: "array",
      group: "citability",
      of: [{ type: "string" }],
      description:
        "3-7 preguntas literales como las escribiría un usuario en Google/ChatGPT. Ej: '¿Cuánto cuesta un GMM en México?'. Cada pregunta debe corresponder a una sección H2 del artículo.",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value || (Array.isArray(value) && value.length < 3)) {
            return "Mínimo 3 preguntas para publicar.";
          }
          return true;
        }),
    }),

    // ---------- CONTENIDO ----------
    defineField({
      name: "excerpt",
      title: "Excerpt (160 chars — meta description)",
      type: "text",
      group: "content",
      rows: 2,
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value) return "Requerido para publicar.";
          if (typeof value === "string" && value.length > 160) {
            return "Máximo 160 caracteres.";
          }
          return true;
        }),
    }),
    defineField({
      name: "heroImage",
      title: "Imagen hero",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Contenido (Portable Text)",
      type: "array",
      group: "content",
      description:
        "Headings H2 = preguntas literales del usuario. Párrafos cortos. Tablas en HTML (no imagen).",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
        },
        // ----- CUSTOM BLOCK: keyTakeaways -----
        defineArrayMember({
          name: "keyTakeaways",
          title: "Key Takeaways (puntos clave)",
          type: "object",
          fields: [
            defineField({
              name: "items",
              title: "Bullets (3-5 puntos)",
              type: "array",
              of: [{ type: "string" }],
              validation: (Rule) => Rule.required().min(2).max(7),
            }),
          ],
          preview: {
            select: { items: "items" },
            prepare({ items }) {
              return {
                title: "⭐ Key Takeaways",
                subtitle: Array.isArray(items)
                  ? `${items.length} puntos`
                  : "Sin puntos",
              };
            },
          },
        }),
        // ----- CUSTOM BLOCK: comparisonTable -----
        defineArrayMember({
          name: "comparisonTable",
          title: "Tabla comparativa",
          type: "object",
          fields: [
            defineField({
              name: "caption",
              title: "Caption / pregunta de tabla",
              type: "string",
            }),
            defineField({
              name: "headers",
              title: "Encabezados de columna",
              type: "array",
              of: [{ type: "string" }],
              validation: (Rule) => Rule.required().min(2).max(6),
            }),
            defineField({
              name: "rows",
              title: "Filas",
              type: "array",
              of: [
                defineArrayMember({
                  name: "row",
                  type: "object",
                  fields: [
                    defineField({
                      name: "cells",
                      title: "Celdas (debe coincidir # con headers)",
                      type: "array",
                      of: [{ type: "string" }],
                      validation: (Rule) => Rule.required().min(2),
                    }),
                  ],
                  preview: {
                    select: { cells: "cells" },
                    prepare({ cells }) {
                      return {
                        title: Array.isArray(cells)
                          ? cells.join(" · ")
                          : "Fila vacía",
                      };
                    },
                  },
                }),
              ],
              validation: (Rule) => Rule.required().min(1),
            }),
          ],
          preview: {
            select: { caption: "caption" },
            prepare({ caption }) {
              return {
                title: "📊 Tabla comparativa",
                subtitle: caption ?? "Sin caption",
              };
            },
          },
        }),
        // ----- CUSTOM BLOCK: disclaimer -----
        defineArrayMember({
          name: "disclaimer",
          title: "Disclaimer educativo",
          type: "object",
          fields: [
            defineField({
              name: "variant",
              title: "Tipo",
              type: "string",
              options: {
                list: [
                  { title: "Financiero", value: "financiero" },
                  { title: "Médico", value: "medico" },
                  { title: "Legal", value: "legal" },
                  { title: "Genérico", value: "generico" },
                ],
              },
              initialValue: "financiero",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "text",
              title: "Texto del disclaimer",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { variant: "variant", text: "text" },
            prepare({ variant, text }) {
              return {
                title: `⚠️ Disclaimer ${variant ?? ""}`,
                subtitle: typeof text === "string" ? text.slice(0, 80) : "",
              };
            },
          },
        }),
        // ----- CUSTOM BLOCK: dataCallout -----
        defineArrayMember({
          name: "dataCallout",
          title: "Cita de fuente (data callout)",
          type: "object",
          description:
            "Cita inline con publisher + fecha + URL. Render con publisher visible en HTML (no solo en JSON-LD sources).",
          fields: [
            defineField({
              name: "claim",
              title: "Dato / cita textual",
              type: "text",
              rows: 2,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "sourceName",
              title: "Nombre de la fuente",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "publisher",
              title: "Editor / institución",
              type: "string",
              description: "CNSF, AMIS, BMV, Banxico, IMSS, SAT, CONDUSEF...",
            }),
            defineField({
              name: "sourceUrl",
              title: "URL de la fuente",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "publishedAt",
              title: "Fecha de la fuente",
              type: "date",
            }),
          ],
          preview: {
            select: {
              claim: "claim",
              publisher: "publisher",
              sourceName: "sourceName",
            },
            prepare({ claim, publisher, sourceName }) {
              return {
                title: `📎 ${publisher ?? sourceName ?? "Fuente"}`,
                subtitle: typeof claim === "string" ? claim.slice(0, 80) : "",
              };
            },
          },
        }),
        // ----- CUSTOM BLOCK: glossaryReference -----
        defineArrayMember({
          name: "glossaryReference",
          title: "Referencia a glosario",
          type: "object",
          fields: [
            defineField({
              name: "term",
              title: "Término del glosario",
              type: "reference",
              to: [{ type: "glossaryTerm" }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "display",
              title: "Texto visible (opcional, default = term.term)",
              type: "string",
            }),
          ],
          preview: {
            select: { term: "term.term", display: "display" },
            prepare({ term, display }) {
              return {
                title: `📖 ${display ?? term ?? "Término"}`,
                subtitle: "Link a /glosario",
              };
            },
          },
        }),
        // ----- CUSTOM BLOCK: ctaWhatsApp -----
        defineArrayMember({
          name: "ctaWhatsApp",
          title: "CTA WhatsApp",
          type: "object",
          description:
            "Tarjeta de llamada-a-acción que abre WhatsApp con mensaje pre-llenado.",
          fields: [
            defineField({
              name: "heading",
              title: "Encabezado",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "text",
              title: "Texto descriptivo",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "buttonLabel",
              title: "Texto del botón",
              type: "string",
              initialValue: "Escríbeme por WhatsApp",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "preFilledMessage",
              title: "Mensaje pre-llenado",
              type: "text",
              rows: 2,
              description:
                "Lo que aparece pre-escrito en WhatsApp. El visitante lo puede editar antes de mandar.",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { heading: "heading", buttonLabel: "buttonLabel" },
            prepare({ heading, buttonLabel }) {
              return {
                title: `💬 ${heading ?? "CTA WhatsApp"}`,
                subtitle: buttonLabel,
              };
            },
          },
        }),
        // ----- CUSTOM BLOCK: externalToolLink -----
        defineArrayMember({
          name: "externalToolLink",
          title: "Link a herramienta externa",
          type: "object",
          description:
            "Tarjeta que invita al lector a usar una herramienta oficial externa (simulador IMSS, calculadora SAT, etc.).",
          fields: [
            defineField({
              name: "badge",
              title: "Etiqueta superior",
              type: "string",
              description: 'Ej: "Herramienta oficial", "Simulador IMSS".',
              initialValue: "Herramienta oficial",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "title",
              title: "Título de la tarjeta",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Descripción",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "url",
              title: "URL externa",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "buttonLabel",
              title: "Texto del botón",
              type: "string",
              initialValue: "Abrir herramienta →",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "publisher",
              title: "Editor / institución",
              type: "string",
              description: "IMSS, SAT, CONDUSEF, Banxico, INEGI...",
            }),
          ],
          preview: {
            select: { title: "title", publisher: "publisher" },
            prepare({ title, publisher }) {
              return {
                title: `🔗 ${title ?? "Herramienta externa"}`,
                subtitle: publisher ?? "Sin publisher",
              };
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return "Body requerido para publicar.";
          }
          return true;
        }),
    }),
    defineField({
      name: "faqs",
      title: "Preguntas relacionadas",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "faq" }] }],
    }),
    defineField({
      name: "relatedArticles",
      title: "Artículos relacionados (manual override)",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "article" }] }],
      description:
        "Opcional. Si está vacío, /blog/[slug] muestra 3 del mismo topic automático.",
      validation: (Rule) => Rule.max(3),
    }),

    // ---------- EEAT / FUENTES ----------
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      group: "eeat",
      to: [{ type: "author" }],
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value) return "Autor requerido para publicar.";
          return true;
        }),
    }),
    defineField({
      name: "reviewedBy",
      title: "Revisado por (experto)",
      type: "reference",
      group: "eeat",
      to: [{ type: "author" }],
      description:
        "Crítico EEAT YMYL: experto que validó el contenido. Para finanzas Google requiere autoridad demostrable.",
    }),
    defineField({
      name: "sources",
      title: "Fuentes y citas",
      type: "array",
      group: "eeat",
      of: [
        defineArrayMember({
          name: "source",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Título de la fuente",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "publisher",
              title: "Editor / institución",
              type: "string",
              description: "CNSF, AMIS, BMV, Banxico, IMSS, SAT, CONDUSEF",
            }),
          ],
          preview: { select: { title: "title", subtitle: "publisher" } },
        }),
      ],
      description:
        "Citas a fuentes oficiales. Aumenta confianza para LLMs y Google EEAT.",
    }),

    // ---------- META ----------
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      group: "meta",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value) return "Fecha de publicación requerida.";
          return true;
        }),
    }),
    defineField({
      name: "updatedAt",
      title: "Última actualización (dateModified)",
      type: "datetime",
      group: "meta",
      description:
        "Refresca al hacer edits significativos. Schema.org dateModified.",
    }),
    defineField({
      name: "lastReviewed",
      title: "Última revisión técnica",
      type: "datetime",
      group: "meta",
      description:
        "Cuándo se revisó la vigencia técnica del contenido (aunque no haya cambios). Render como 'Revisado: DD mes YYYY'.",
    }),
    defineField({
      name: "wordCount",
      title: "Palabras (target 1500+)",
      type: "number",
      group: "meta",
      readOnly: true,
      description: "Aspiracional: 1500+ para autoridad SEO/AEO",
    }),

    // ---------- SEO ----------
    defineField({
      name: "seoTitle",
      title: "SEO title (max 60 chars)",
      type: "string",
      group: "seo",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description (max 160 chars)",
      type: "text",
      group: "seo",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      topic: "topic",
      publishedAt: "publishedAt",
      draft: "draft",
      media: "heroImage",
    },
    prepare({ title, topic, publishedAt, draft, media }) {
      const date = publishedAt
        ? new Date(publishedAt).toISOString().split("T")[0]
        : "—";
      const status = draft ? "🔴 DRAFT" : "🟢 PUB";
      return {
        title,
        subtitle: `${status} · ${topic ?? "?"} · ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Drafts primero, luego más recientes",
      name: "draftFirst",
      by: [
        { field: "draft", direction: "desc" },
        { field: "publishedAt", direction: "desc" },
      ],
    },
    {
      title: "Fecha publicación (recientes primero)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
