import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Recurso (PDF / documento aseguradora)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      description:
        "Ej: 'Condiciones Generales GMM Plus BUPA 2026' o 'Formato de Reclamación Vida MetLife'",
      type: "string",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      description:
        "URL amigable. Ej: condiciones-generales-bupa-gmm-2026, formato-reclamacion-metlife-vida",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "carrier",
      title: "Aseguradora",
      type: "string",
      options: {
        list: [
          { title: "BUPA", value: "BUPA" },
          { title: "MetLife", value: "MetLife" },
          { title: "Allianz", value: "Allianz" },
          { title: "Seguros Monterrey New York Life", value: "Seguros Monterrey NYL" },
          { title: "AXA", value: "AXA" },
          { title: "GNP", value: "GNP" },
          { title: "Otra (no listada)", value: "otra" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría del documento",
      type: "string",
      options: {
        list: [
          { title: "📋 Condiciones Generales", value: "condiciones_generales" },
          { title: "📝 Formato de Reclamación", value: "formato_reclamacion" },
          { title: "🔄 Formato Alta / Baja", value: "formato_alta_baja" },
          { title: "🏥 Cuadro Médico / Red Hospitalaria", value: "cuadro_medico" },
          { title: "💲 Tabulador / Tarifas", value: "tabulador" },
          { title: "📄 Folleto Producto", value: "folleto_producto" },
          { title: "📘 Guía de Usuario / Manual", value: "guia_usuario" },
          { title: "🔒 Aviso de Privacidad", value: "aviso_privacidad" },
          { title: "📁 Otro", value: "otro" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "productLine",
      title: "Línea de producto",
      type: "string",
      options: {
        list: [
          { title: "Vida individual", value: "vida" },
          { title: "GMM individual", value: "gmm" },
          { title: "Vida grupo / colectivo", value: "vida_grupo" },
          { title: "GMM empresarial", value: "gmm_empresarial" },
          { title: "Autos", value: "autos" },
          { title: "Daños / Hogar", value: "dano_hogar" },
          { title: "Retiro / AFORE", value: "retiro" },
          { title: "Educacional", value: "educacional" },
          { title: "Otro / N/A", value: "otro" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Año / vigencia",
      description: "Ej: '2026', '2025-2026', 'sin fecha'",
      type: "string",
    }),
    defineField({
      name: "file",
      title: "Archivo PDF (subir copia)",
      description:
        "Sube el PDF si quieres hospedarlo aquí (mejor para SEO). Si prefieres linkear al carrier, deja esto vacío y llena 'URL externa' abajo.",
      type: "file",
      options: { accept: ".pdf,.doc,.docx" },
    }),
    defineField({
      name: "externalUrl",
      title: "URL externa (alternativa al archivo)",
      description:
        "Solo si NO hospedas copia: link al PDF en el sitio del carrier. No usar ambos campos a la vez.",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          scheme: ["http", "https"],
          allowRelative: false,
        }),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      description: "1-3 párrafos explicando de qué se trata. Mejora ranking SEO/AEO.",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "isPublic",
      title: "Documento público (visible en /recursos)",
      type: "boolean",
      initialValue: true,
      description:
        "Default: público (todos pueden verlo). Si lo desmarcas, no aparece en el listado.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title (override)",
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
      carrier: "carrier",
      category: "category",
      year: "year",
    },
    prepare({ title, carrier, category, year }) {
      const yearStr = year ? ` · ${year}` : "";
      return {
        title,
        subtitle: `${carrier ?? "?"} · ${category ?? "?"}${yearStr}`,
      };
    },
  },
  orderings: [
    {
      title: "Por aseguradora",
      name: "carrierAsc",
      by: [
        { field: "carrier", direction: "asc" },
        { field: "category", direction: "asc" },
      ],
    },
    {
      title: "Por categoría",
      name: "categoryAsc",
      by: [
        { field: "category", direction: "asc" },
        { field: "carrier", direction: "asc" },
      ],
    },
    {
      title: "Más recientes (año)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
});
