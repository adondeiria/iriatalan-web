import { defineField, defineType } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Pregunta",
      type: "string",
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: "answer",
      title: "Respuesta",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "topic",
      title: "Tema",
      type: "string",
      options: {
        list: [
          { title: "Seguros de Vida", value: "vida" },
          { title: "GMM", value: "gmm" },
          { title: "Retiro / AFORE", value: "retiro" },
          { title: "Patrimonial", value: "patrimonial" },
          { title: "Planes Educacionales", value: "educacionales" },
          { title: "Fideicomisos", value: "fideicomisos" },
          { title: "Empresas", value: "empresas" },
          { title: "Casos especiales", value: "casos" },
          { title: "General", value: "general" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "topic" },
  },
});
