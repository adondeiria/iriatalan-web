import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Artículo",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Última actualización",
      type: "datetime",
      description: "Refresca al hacer edits significativos. Schema.org dateModified.",
    }),
    defineField({
      name: "topic",
      title: "Tema principal",
      type: "string",
      options: {
        list: [
          { title: "⭐ Seguros de Vida", value: "vida" },
          { title: "⭐ GMM", value: "gmm" },
          { title: "Retiro / AFORE", value: "retiro" },
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
      name: "excerpt",
      title: "Excerpt (resumen 160 char)",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: "heroImage",
      title: "Imagen hero",
      type: "image",
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
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "faqs",
      title: "Preguntas relacionadas",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faq" }] }],
    }),
    defineField({
      name: "wordCount",
      title: "Palabras (target 1500+)",
      type: "number",
      readOnly: true,
      description: "Aspiracional: 1500+ palabras para autoridad SEO/AEO",
    }),
    defineField({
      name: "reviewedBy",
      title: "Revisado por (experto)",
      type: "reference",
      to: [{ type: "author" }],
      description:
        "Crítico EEAT YMYL: experto que validó el contenido. Para finanzas Google requiere autoridad demostrable.",
    }),
    defineField({
      name: "sources",
      title: "Fuentes y citas",
      type: "array",
      of: [
        defineField({
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
              description: "Ej: CNSF, AMIS, BMV, Banxico, IMSS",
            }),
          ],
          preview: { select: { title: "title", subtitle: "publisher" } },
        }),
      ],
      description:
        "Citas a CNSF, AMIS, BMV, Banxico, IMSS, etc. Aumenta confianza para LLMs y Google EEAT.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      topic: "topic",
      publishedAt: "publishedAt",
      media: "heroImage",
    },
    prepare({ title, topic, publishedAt, media }) {
      const date = publishedAt
        ? new Date(publishedAt).toISOString().split("T")[0]
        : "sin fecha";
      return {
        title,
        subtitle: `${topic ?? "?"} — ${date}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Fecha publicación (recientes primero)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
