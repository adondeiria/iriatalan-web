import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home (singleton)",
  type: "document",
  fields: [
    defineField({
      name: "heroTitle",
      title: "Hero — título",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Headline principal. Debe comunicar la promesa central.",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero — subtítulo",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "heroCtaText",
      title: "Hero CTA — texto botón",
      type: "string",
      initialValue: "Agenda consulta gratis 30 min",
    }),
    defineField({
      name: "heroCtaUrl",
      title: "Hero CTA — URL",
      type: "url",
      description: "Calendly de Iria",
    }),
    defineField({
      name: "heroImage",
      title: "Hero imagen / fondo",
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
      name: "featuredServices",
      title: "Servicios destacados",
      description:
        "Recomendado: Vida y GMM primero (alineado a meta 239→1200 pólizas y No.1 vida México)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "service" }] }],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "valueProps",
      title: "Propuestas de valor",
      description: "Razones para elegir a Iria — credenciales, carriers, experiencia",
      type: "array",
      of: [
        defineField({
          name: "valueProp",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Título",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Descripción",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "icon",
              title: "Icono (lucide name)",
              type: "string",
              description: "Nombre del icono lucide-react. Ej: shield, award, users",
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
    }),
    defineField({
      name: "testimonials",
      title: "Testimonios",
      type: "array",
      of: [
        defineField({
          name: "testimonial",
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Cita",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "name", title: "Nombre", type: "string" }),
            defineField({
              name: "role",
              title: "Cargo / contexto",
              type: "string",
            }),
            defineField({
              name: "photo",
              title: "Foto",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: { select: { title: "name", subtitle: "role", media: "photo" } },
        }),
      ],
    }),
    defineField({
      name: "trustSignals",
      title: "Señales de confianza (logos, números)",
      type: "object",
      fields: [
        defineField({
          name: "carriersShown",
          title: "Aseguradoras mostradas",
          type: "array",
          of: [{ type: "string" }],
          options: { layout: "tags" },
        }),
        defineField({
          name: "stats",
          title: "Números clave (opcional)",
          type: "array",
          of: [
            defineField({
              name: "stat",
              type: "object",
              fields: [
                defineField({ name: "label", title: "Label", type: "string" }),
                defineField({ name: "value", title: "Valor", type: "string" }),
              ],
            }),
          ],
        }),
      ],
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
    select: { title: "heroTitle", media: "heroImage" },
    prepare({ title, media }) {
      return { title: title || "Home (sin título)", subtitle: "Singleton", media };
    },
  },
});
