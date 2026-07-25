import { defineArrayMember, defineField, defineType } from "sanity";

export const author = defineType({
  name: "author",
  title: "Autor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre completo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Cargo / título profesional",
      type: "string",
      description: "Ej: Asesora Financiera RIF · Especialista en Seguros de Vida y GMM",
    }),
    defineField({
      name: "photo",
      title: "Foto profesional",
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
      name: "bio",
      title: "Bio corta (cards, footer)",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(280),
    }),
    defineField({
      name: "longBio",
      title: "Bio extendida (página /sobre-iria)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "credentials",
      title: "Credenciales (E-E-A-T)",
      description:
        "MDRT TOT, AMASFAC, Yale, LSE, BMV, IMEF, Tec Monterrey, CNSF, etc. Orden de mayor a menor relevancia.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "credential",
          fields: [
            defineField({
              name: "title",
              title: "Credencial",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "issuer",
              title: "Institución emisora",
              type: "string",
            }),
            defineField({
              name: "year",
              title: "Año / período",
              type: "string",
            }),
            defineField({
              name: "category",
              title: "Categoría",
              type: "string",
              options: {
                list: [
                  { title: "Industria (MDRT, AMASFAC)", value: "industria" },
                  { title: "Académica (Yale, LSE, Tec)", value: "academica" },
                  { title: "Regulatoria (CNSF, BMV)", value: "regulatoria" },
                  { title: "Carrier (Diamante GNP, etc.)", value: "carrier" },
                ],
              },
            }),
            defineField({
              name: "url",
              title: "URL de verificación",
              type: "url",
              description: "Opcional — link a credencial verificable",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "issuer" },
          },
        }),
      ],
    }),
    defineField({
      name: "carriers",
      title: "Aseguradoras autorizadas",
      description: "BUPA, MetLife, Allianz, Seguros Monterrey NYL, AXA, GNP, etc.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "specialties",
      title: "Especialidades",
      description: "Ej: Seguros de Vida, GMM, Fideicomisos neurodivergentes, Patrimonial HNWI",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "languages",
      title: "Idiomas",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales / contacto",
      type: "object",
      fields: [
        defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "facebook", title: "Facebook", type: "url" }),
        defineField({
          name: "whatsapp",
          title: "WhatsApp (E.164)",
          type: "string",
          description: "Formato +52...",
        }),
        defineField({ name: "email", title: "Email", type: "string" }),
      ],
    }),
    defineField({
      name: "officeAddress",
      title: "Dirección oficina",
      type: "text",
      rows: 2,
      description:
        "Dirección completa, ej: Homero 205 Int 702, Col. Polanco V Secc, Miguel Hidalgo, CDMX 11560. Es la fuente de verdad: alimenta LocalBusiness.address y Person.workLocation del JSON-LD, y la FAQ de oficina en /sobre-iria. Conviene que coincida letra por letra con la ficha de Google Business y con el aviso de privacidad.",
    }),
    defineField({
      name: "sameAs",
      title: "Perfiles canonical (schema.org Person.sameAs)",
      type: "array",
      of: [{ type: "url" }],
      description:
        "URLs canonical para schema.org Person.sameAs: LinkedIn, MDRT directorio, AMASFAC perfil, CNSF registro, Wikipedia, etc. Crítico para EEAT.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "title", media: "photo" },
  },
});
