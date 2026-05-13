/**
 * Helpers compartidos del blog — taxonomía, slugs URL-friendly, formato de fechas.
 *
 * Importado por:
 *  - /blog/page.tsx
 *  - /blog/[slug]/page.tsx
 *  - /blog/categoria/[slug]/page.tsx
 *  - /glosario/[slug]/page.tsx
 */

// Topics canónicos = valores del campo `article.topic` en Sanity schema.
// Mantener sincronizado con sanity/schemas/article.ts y sanity/schemas/glossaryTerm.ts.
export type ArticleTopic =
  | "vida"
  | "gmm"
  | "retiro"
  | "patrimonial"
  | "educacionales"
  | "fideicomisos"
  | "empresas"
  | "casos";

// Display name humano de cada topic.
export const TOPIC_LABELS: Record<string, string> = {
  vida: "Seguros de Vida",
  gmm: "GMM",
  retiro: "Retiro / AFORE",
  patrimonial: "Planeación Patrimonial",
  educacionales: "Planes Educacionales",
  fideicomisos: "Fideicomisos",
  empresas: "Empresas",
  casos: "Casos especiales",
};

// Descripción breve por categoría (para metadata de /blog/categoria/[slug]).
export const TOPIC_DESCRIPTIONS: Record<string, string> = {
  vida: "Artículos sobre seguros de vida en México: cómo elegirlos, qué cubren, errores comunes y diferencias entre productos.",
  gmm: "Artículos sobre Gastos Médicos Mayores: coberturas, deducibles, suma asegurada y cómo evaluar carriers en México.",
  retiro: "Artículos sobre planeación de retiro: PPR, AFORE, Modalidad 40 IMSS y estrategias para profesionistas y emprendedores.",
  patrimonial: "Artículos sobre planeación patrimonial: estructuras de protección, sucesión y vehículos de inversión.",
  educacionales: "Artículos sobre planes educacionales para ahorrar para la universidad de los hijos en México.",
  fideicomisos: "Artículos sobre fideicomisos en México: para qué sirven, cuándo usarlos y diferencias frente a otras estructuras.",
  empresas: "Artículos sobre seguros para empresas: Persona Clave, GMM colectivo, vida grupo y planes de retiro empresarial.",
  casos: "Artículos sobre situaciones especiales: divorcios, hijos neurodivergentes, mexicanos en el extranjero, familias arcoíris.",
};

// URL slug ↔ topic value mapping.
// El URL slug es más legible/citable que el valor interno corto.
// Ejemplo: /blog/categoria/seguros-de-vida → topic="vida"
export const TOPIC_TO_URL_SLUG: Record<ArticleTopic, string> = {
  vida: "seguros-de-vida",
  gmm: "gastos-medicos-mayores",
  retiro: "retiro-y-afore",
  patrimonial: "planeacion-patrimonial",
  educacionales: "planes-educacionales",
  fideicomisos: "fideicomisos",
  empresas: "seguros-empresariales",
  casos: "casos-especiales",
};

// Reverse map para resolver /blog/categoria/[slug] → topic.
export const URL_SLUG_TO_TOPIC: Record<string, ArticleTopic> = Object.fromEntries(
  Object.entries(TOPIC_TO_URL_SLUG).map(([t, s]) => [s, t as ArticleTopic])
) as Record<string, ArticleTopic>;

export function isValidTopicSlug(slug: string): slug is keyof typeof URL_SLUG_TO_TOPIC {
  return slug in URL_SLUG_TO_TOPIC;
}

// Formatos editoriales — sincronizado con sanity/schemas/article.ts `format` enum.
export type ArticleFormat =
  | "guia"
  | "comparativa"
  | "que-es"
  | "checklist"
  | "errores"
  | "faq";

export const FORMAT_LABELS: Record<string, string> = {
  guia: "Guía",
  comparativa: "Comparativa",
  "que-es": "Concepto",
  checklist: "Checklist",
  errores: "Errores comunes",
  faq: "Preguntas frecuentes",
};

// Formato de fecha consistente para todo el blog.
export function formatDateMx(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Genera href absoluto de la página de categoría a partir del valor topic.
export function topicHref(topic: string | undefined | null): string | null {
  if (!topic) return null;
  const slug = TOPIC_TO_URL_SLUG[topic as ArticleTopic];
  return slug ? `/blog/categoria/${slug}` : null;
}
