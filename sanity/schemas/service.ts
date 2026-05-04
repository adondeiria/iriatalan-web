import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Servicio",
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
      title: "Slug (URL final)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description:
        "URLs top-level: 'seguros-vida', 'gmm', 'planeacion-retiro', 'planes-educacionales', 'hnwi/fideicomisos', etc.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      options: {
        list: [
          { title: "⭐ Pillar — Seguros de Vida", value: "vida_pillar" },
          { title: "⭐ Pillar — GMM", value: "gmm_pillar" },
          { title: "Individuos (otros)", value: "individuos" },
          { title: "HNWI", value: "hnwi" },
          { title: "Empresas", value: "empresas" },
          { title: "Casos especiales", value: "casos" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "priority",
      title: "Prioridad estratégica",
      description:
        "1 = top (Vida y GMM). Define orden en home, menú y sitemap. Alineado a meta No.1 vida México + 239→1200 pólizas.",
      type: "number",
      initialValue: 99,
      validation: (Rule) => Rule.required().min(1).max(99),
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta (meta description, cards)",
      type: "text",
      rows: 3,
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
      title: "Contenido principal",
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
          ],
        },
      ],
    }),
    defineField({
      name: "keyBenefits",
      title: "Beneficios clave",
      type: "array",
      of: [{ type: "string" }],
      description: "Ej: protección familiar, deducibilidad fiscal, suma asegurada flexible",
    }),
    defineField({
      name: "objectionsAddressed",
      title: "Objeciones que atiende este servicio",
      description:
        "Crítico para meta 239→1200 GMM: precio percibido, suma asegurada, deducible, red médica, hospitales",
      type: "array",
      of: [
        defineField({
          name: "objection",
          type: "object",
          fields: [
            defineField({ name: "objection", title: "Objeción", type: "string" }),
            defineField({ name: "response", title: "Respuesta", type: "text", rows: 3 }),
          ],
          preview: { select: { title: "objection" } },
        }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "Preguntas frecuentes (FAQ refs)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "faq" }] }],
    }),
    defineField({
      name: "ctaText",
      title: "Texto CTA principal",
      type: "string",
      initialValue: "Agenda consulta gratis 30 min",
    }),
    defineField({
      name: "ctaUrl",
      title: "URL CTA",
      type: "url",
      description: "Default: link a Calendly de Iria",
    }),
    defineField({
      name: "carriersAvailable",
      title: "Carriers disponibles para este servicio",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title (override <title>)",
      type: "string",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description (meta)",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      priority: "priority",
      media: "heroImage",
    },
    prepare({ title, category, priority, media }) {
      return {
        title,
        subtitle: `[P${priority}] ${category}`,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Prioridad estratégica (top primero)",
      name: "priorityAsc",
      by: [{ field: "priority", direction: "asc" }],
    },
    {
      title: "Categoría",
      name: "categoryAsc",
      by: [{ field: "category", direction: "asc" }],
    },
  ],
});
