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
        "El ORDEN de este arreglo decide el orden de los grupos en /sobre-iria y del award[] en el JSON-LD. Orden acordado: Yale (Executive Education) → LSE → Tec de Monterrey → MDRT Top of the Table → AMASFAC → Asesora Diamante → CNSF. La formación va primero porque el cliente reconoce 'Yale' y no 'Top of the Table'. Yale y LSE SIEMPRE con 'Executive Education': son programas ejecutivos, no posgrados.",
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
          description:
            "Formato +52... — es el WABA conectado a respond.io, donde el equipo atiende los chats. Alimenta TODOS los botones de WhatsApp del sitio y el `telephone` del JSON-LD que Google cruza con la ficha de Google Business: si cambia aquí, hay que cambiarlo también en la ficha el mismo día o se rompe la consistencia NAP.",
        }),
        defineField({
          name: "phone",
          title: "Teléfono para llamadas (E.164)",
          type: "string",
          description:
            "Formato +52... — la línea de voz que aparece en el `tel:` del footer. Va aparte del WhatsApp a propósito: un número WABA no recibe llamadas, así que si aquí se pusiera el mismo, quien marque no encontraría a nadie.",
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
        "Dirección sin número interior. Ej: Homero 205, Col. Polanco V Secc, Miguel Hidalgo, CDMX 11560. Es la fuente de verdad: alimenta LocalBusiness.address y Person.workLocation del JSON-LD, y la FAQ de oficina en /sobre-iria. Tiene que coincidir LETRA POR LETRA con la ficha de Google Business y con el aviso de privacidad — el NAP es como Google confirma que la ficha y el sitio son el mismo negocio, así que una sola forma de la dirección en todas las superficies.",
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
