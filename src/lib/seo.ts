/**
 * JSON-LD schema.org generators alineados a EEAT para YMYL (finanzas).
 * Combinar múltiples schemas con @graph en una sola etiqueta <script>.
 */

export const SITE_URL = "https://iriatalan.com.mx";
export const SITE_NAME = "Iria Talan / RIF";

/**
 * SameAs fallback — perfiles canonical públicos de Iria Talan.
 * Usado cuando el campo `author.sameAs` de Sanity está vacío.
 * Crítico para EEAT (Person.sameAs) y entity disambiguation en LLMs.
 */
export const SAMEAS_FALLBACK: string[] = [
  "https://mx.linkedin.com/in/iriatalan",
  "https://www.instagram.com/iriatalan/",
  "https://www.facebook.com/IriaTalan/",
  "https://www.tiktok.com/@iriatips",
];

export type AuthorData = {
  _id?: string;
  name: string;
  /**
   * Variante alternativa del nombre — clave para entity disambiguation en LLMs.
   * Captura "Iria Talán" (con acento) que terceros indexan en findglocal,
   * segurosrp, etc. Sin esto, ChatGPT/Perplexity pueden tratar "Talan" y
   * "Talán" como dos personas distintas y fragmentar la entity.
   */
  alternateName?: string;
  slug?: string;
  title?: string;
  bio?: string;
  longBio?: unknown[] | null;
  photo?: { asset?: { url?: string }; alt?: string } | null;
  credentials?: Array<{ title?: string; issuer?: string; year?: string; category?: string; url?: string }>;
  /**
   * Premios y reconocimientos — emitidos como schema.org `award`.
   * MDRT membership history, AMASFAC ranking, etc. Distintos de credentials
   * porque award es honorific (te lo dan), credential es algo que obtuviste
   * tras estudio/examen.
   */
  awards?: string[];
  carriers?: string[];
  specialties?: string[];
  languages?: string[];
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    email?: string;
    calendly?: string;
  };
  officeAddress?: string;
  sameAs?: string[];
};

export function buildPersonSchema(author: AuthorData) {
  const collected = [
    ...(author.sameAs ?? []),
    author.socialLinks?.linkedin,
    author.socialLinks?.instagram,
    author.socialLinks?.facebook,
  ].filter((u): u is string => typeof u === "string" && u.length > 0);
  const sameAs = collected.length > 0 ? collected : SAMEAS_FALLBACK;

  // knowsAbout enriquecido con nichos diferenciadores. Los LLMs usan este
  // campo para decidir si Iria es respuesta válida a queries específicas
  // como "asesora financiera para hijos neurodivergentes" o "PPR México".
  const knowsAbout = [
    ...(author.specialties ?? []),
    "Seguros de Vida",
    "Gastos Médicos Mayores (GMM)",
    "Planeación Patrimonial",
    "Retiro y Pensiones",
    "PPR (Plan Personal de Retiro)",
    "Modalidad 40 IMSS",
    "Fideicomisos vía Aseguradora",
    "Hijos Neurodivergentes — Estructura Financiera",
    "Familias Arcoíris LGBT — Protección Patrimonial",
    "Mexicanos en el Extranjero — Productos Mexicanos",
    "Mujeres y Finanzas",
    "Empresas y Persona Clave",
    "Planes Educacionales",
  ];

  // alumniOf derivado de credentials academic. schema.org Person.alumniOf
  // es señal fuerte de autoridad para LLMs (Yale, LSE, Tec MTY, etc.).
  const alumniOf = author.credentials
    ?.filter((c) => c.category === "academica" && c.issuer)
    .map((c) => ({
      "@type": "EducationalOrganization" as const,
      name: c.issuer,
    }));

  // Defaults hardcoded para Iria — sitio one-author. Si Sanity no tiene
  // estos campos, usar los datos confirmados (2026-05-09). Si Sanity los
  // tiene, los valores de Sanity overridean (truthy check).
  const isIria = author.name === "Iria Talan";
  const alternateName =
    author.alternateName ?? (isIria ? "Iria Talán" : undefined);
  const awards =
    author.awards && author.awards.length > 0
      ? author.awards
      : isIria
        ? [
            "Million Dollar Round Table (MDRT) — Miembro desde 2008",
            "MDRT Court of the Table (COT) 2023",
            "MDRT Top of the Table (TOT) 2024",
            "MDRT Court of the Table (COT) 2025",
            "AMASFAC — 8vo Lugar Nacional",
            "GNP Seguros — Asesora Diamante",
            "Seguros Monterrey New York Life — Asesora Diamante",
          ]
        : undefined;

  return {
    "@type": "Person" as const,
    "@id": `${SITE_URL}/sobre-iria#person`,
    name: author.name,
    alternateName,
    jobTitle: author.title,
    description: author.bio,
    image: author.photo?.asset?.url,
    url: `${SITE_URL}/sobre-iria`,
    knowsAbout,
    knowsLanguage: author.languages,
    nationality: { "@type": "Country", name: "México" },
    workLocation: author.officeAddress
      ? { "@type": "Place", name: author.officeAddress }
      : { "@type": "Place", name: "Ciudad de México, México" },
    award: awards,
    alumniOf: alumniOf && alumniOf.length > 0 ? alumniOf : undefined,
    worksFor: { "@id": `${SITE_URL}#organization` },
    hasCredential: author.credentials?.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.title,
      credentialCategory: c.category,
      recognizedBy: c.issuer
        ? { "@type": "Organization", name: c.issuer }
        : undefined,
      url: c.url,
    })),
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function buildFinancialAdvisorSchema(author: AuthorData) {
  return {
    "@type": "FinancialService" as const,
    "@id": `${SITE_URL}#financialservice`,
    name: SITE_NAME,
    url: SITE_URL,
    description: author.bio,
    image: author.photo?.asset?.url,
    address: author.officeAddress
      ? {
          "@type": "PostalAddress",
          streetAddress: author.officeAddress,
          addressCountry: "MX",
        }
      : undefined,
    areaServed: { "@type": "Country", name: "México" },
    serviceType: [
      "Seguros de Vida",
      "Gastos Médicos Mayores",
      "Planeación Patrimonial",
      "Fideicomisos",
      "Retiro y Pensiones",
      "Planes Educacionales",
    ],
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    telephone: author.socialLinks?.whatsapp,
    email: author.socialLinks?.email,
  };
}

export function buildOrganizationSchema(author?: AuthorData) {
  const sameAs =
    author?.sameAs && author.sameAs.length > 0 ? author.sameAs : SAMEAS_FALLBACK;
  return {
    "@type": "Organization" as const,
    "@id": `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/LOGOVECTORRIF.svg`,
    founder: author ? { "@id": `${SITE_URL}/sobre-iria#person` } : undefined,
    sameAs,
  };
}

export function buildWebSiteSchema() {
  return {
    "@type": "WebSite" as const,
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "es-MX",
    publisher: { "@id": `${SITE_URL}#organization` },
  };
}

export type FAQItem = { question: string; answerText?: string | null };

export function buildFAQPageSchema(faqs: FAQItem[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@type": "FAQPage" as const,
    mainEntity: faqs
      .filter((f) => f.question && f.answerText)
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answerText,
        },
      })),
  };
}

export type ArticleData = {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  heroImage?: { asset?: { url?: string }; alt?: string };
  author?: AuthorData;
  reviewedBy?: { name?: string };
  sources?: Array<{ title?: string; url?: string; publisher?: string }>;
  topic?: string;
  wordCount?: number;
};

export function buildArticleSchema(article: ArticleData) {
  return {
    "@type": "Article" as const,
    "@id": `${SITE_URL}/blog/${article.slug}#article`,
    headline: article.title,
    description: article.excerpt,
    image: article.heroImage?.asset?.url,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "es-MX",
    wordCount: article.wordCount,
    keywords: article.topic,
    author: article.author
      ? { "@id": `${SITE_URL}/sobre-iria#person` }
      : undefined,
    reviewedBy: article.reviewedBy?.name
      ? { "@type": "Person", name: article.reviewedBy.name }
      : undefined,
    citation: article.sources?.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
      publisher: s.publisher
        ? { "@type": "Organization", name: s.publisher }
        : undefined,
    })),
    publisher: { "@id": `${SITE_URL}#organization` },
    mainEntityOfPage: `${SITE_URL}/blog/${article.slug}`,
  };
}

export type Breadcrumb = { name: string; path: string };

export function buildBreadcrumbSchema(crumbs: Breadcrumb[]) {
  if (!crumbs || crumbs.length === 0) return null;
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function buildLocalBusinessSchema(author?: AuthorData) {
  const sameAs =
    author?.sameAs && author.sameAs.length > 0 ? author.sameAs : SAMEAS_FALLBACK;
  return {
    "@type": "LocalBusiness" as const,
    "@id": `${SITE_URL}#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    telephone: author?.socialLinks?.whatsapp ?? "+525512683401",
    email: author?.socialLinks?.email ?? "soporte@talan.com.mx",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ciudad de México",
      addressRegion: "CDMX",
      addressCountry: "MX",
    },
    areaServed: { "@type": "Country", name: "México" },
    priceRange: "$$$$",
    openingHours: "Mo-Fr 09:00-18:00",
    sameAs,
  };
}

export function buildGraph(...schemas: Array<unknown | null | undefined>) {
  const valid = schemas.filter(
    (s): s is Record<string, unknown> => Boolean(s) && typeof s === "object"
  );
  return {
    "@context": "https://schema.org",
    "@graph": valid,
  };
}
