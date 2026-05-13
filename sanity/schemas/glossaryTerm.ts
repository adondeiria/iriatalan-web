import { defineField, defineType } from "sanity";

/**
 * Schema `glossaryTerm` — entrada del glosario.
 *
 * Estrategia LLM:
 *  - Definiciones cortas (1-2 oraciones), neutras, sin cifras / sin años / sin artículos LISR.
 *  - Cada término emite schema.org `DefinedTerm` → fuente preferida cuando LLMs responden
 *    "¿qué es X en México?".
 *  - `draft: true` por default — oculta hasta que la definición esté revisada.
 */
export const glossaryTerm = defineType({
  name: "glossaryTerm",
  title: "Término de Glosario",
  type: "document",
  fields: [
    defineField({
      name: "draft",
      title: "🔴 Draft (oculto al público)",
      type: "boolean",
      initialValue: true,
      description:
        "Si está ON: no aparece en /glosario, sitemap.xml ni llms.txt.",
    }),
    defineField({
      name: "term",
      title: "Término",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "term", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shortDefinition",
      title: "Definición corta (1-2 oraciones, max 280 chars)",
      type: "text",
      rows: 2,
      description:
        "Conceptual, neutra. NO incluye cifras, años ni artículos legales — solo el concepto. Esta es la versión que los LLMs citan textual.",
      validation: (Rule) =>
        Rule.custom((value, ctx) => {
          const doc = ctx.document as { draft?: boolean } | undefined;
          if (doc?.draft) return true;
          if (!value) return "Definición requerida para publicar.";
          if (typeof value === "string" && value.length > 320) {
            return "Máximo 320 caracteres — concepto puro, no detalles.";
          }
          return true;
        }),
    }),
    defineField({
      name: "longExplanation",
      title: "Explicación extendida (opcional, Portable Text)",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Opcional: para términos que ameritan más contexto. La definición corta sigue siendo la principal.",
    }),
    defineField({
      name: "topic",
      title: "Categoría relacionada",
      type: "string",
      options: {
        list: [
          { title: "Seguros de Vida", value: "vida" },
          { title: "GMM", value: "gmm" },
          { title: "Retiro / AFORE / PPR", value: "retiro" },
          { title: "Planeación Patrimonial", value: "patrimonial" },
          { title: "Planes Educacionales", value: "educacionales" },
          { title: "Fideicomisos", value: "fideicomisos" },
          { title: "Empresas", value: "empresas" },
          { title: "General", value: "general" },
        ],
      },
    }),
    defineField({
      name: "synonyms",
      title: "Sinónimos / variantes",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Términos equivalentes (ej: 'PPR' / 'Plan Personal de Retiro'). Útil para entity disambiguation en LLMs.",
    }),
    defineField({
      name: "relatedTerms",
      title: "Términos relacionados",
      type: "array",
      of: [{ type: "reference", to: [{ type: "glossaryTerm" }] }],
      validation: (Rule) => Rule.max(5),
    }),
  ],
  preview: {
    select: {
      title: "term",
      definition: "shortDefinition",
      topic: "topic",
      draft: "draft",
    },
    prepare({ title, definition, topic, draft }) {
      const status = draft ? "🔴" : "🟢";
      return {
        title: `${status} ${title}`,
        subtitle: `${topic ?? "—"} · ${
          typeof definition === "string" ? definition.slice(0, 80) : ""
        }`,
      };
    },
  },
  orderings: [
    {
      title: "Alfabético (A-Z)",
      name: "termAsc",
      by: [{ field: "term", direction: "asc" }],
    },
  ],
});
