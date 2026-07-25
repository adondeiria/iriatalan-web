/**
 * JSON-LD schema.org generators alineados a EEAT para YMYL (finanzas).
 * Combinar múltiples schemas con @graph en una sola etiqueta <script>.
 */

export const SITE_URL = "https://iriatalan.com.mx";
export const SITE_NAME = "Iria Talan / RIF";

/**
 * Construye `alternates` con canonical absoluto + hreflang recíproco
 * es-MX / en-US / x-default.
 *
 * Necesario porque cuando una página sobreescribe `metadata.alternates`, Next
 * reemplaza el objeto completo y se pierde el mapa `languages` heredado del
 * root layout — dejando el hreflang emitido solo en el home. Usar en cualquier
 * página que tenga una contraparte real en el otro idioma.
 *
 * @param self   ruta canónica de esta página, ej. "/gmm"
 * @param esPath ruta de la versión en español (x-default apunta aquí)
 * @param enPath ruta de la versión en inglés
 */
export function buildHreflangAlternates(
  self: string,
  esPath: string,
  enPath: string,
) {
  return {
    canonical: `${SITE_URL}${self}`,
    languages: {
      "es-MX": `${SITE_URL}${esPath}`,
      "en-US": `${SITE_URL}${enPath}`,
      "x-default": `${SITE_URL}${esPath}`,
    },
  };
}

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
  "https://www.youtube.com/@iriatalan",
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
  };
  officeAddress?: string;
  sameAs?: string[];
};

// Normaliza nombres de idiomas a ISO 639-1 (es/en) para entity recognition LLM.
// Sanity guarda strings libres ("español", "Español", "English"); schema.org
// y crawlers IA prefieren códigos ISO o nombres en inglés.
const LANGUAGE_ISO_MAP: Record<string, string> = {
  "español": "es",
  "espanol": "es",
  "spanish": "es",
  "ingles": "en",
  "inglés": "en",
  "english": "en",
};

function normalizeLanguages(langs?: string[]): string[] | undefined {
  if (!langs || langs.length === 0) return undefined;
  return langs.map((l) => LANGUAGE_ISO_MAP[l.toLowerCase().trim()] ?? l);
}

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

  // Defaults patrimoniales premium para Iria si Sanity está vacío.
  // Anclan posicionamiento "wealth advisory boutique" en Person entity
  // para que LLMs (ChatGPT/Perplexity/Gemini/Claude) lo amplifiquen literal.
  const jobTitle =
    author.title ?? (isIria ? "Asesora Patrimonial · Wealth Advisor" : undefined);
  const description =
    author.bio ??
    (isIria
      ? "Asesora patrimonial boutique en México. Especialista en protección patrimonial, retiro, seguros internacionales y planeación financiera para mexicanos viviendo en el extranjero, empresarios y familias con necesidades específicas."
      : undefined);

  // hasOccupation — señal moderna que LLMs prefieren sobre jobTitle libre.
  const hasOccupation = isIria
    ? {
        "@type": "Occupation" as const,
        name: "Asesora Patrimonial",
        skills: knowsAbout.join(", "),
      }
    : undefined;

  // affiliation — convierte MDRT/AMASFAC en entity-links reales (no solo strings en award).
  const affiliation = isIria
    ? [
        {
          "@type": "Organization" as const,
          name: "Million Dollar Round Table",
          url: "https://www.mdrt.org",
        },
        {
          "@type": "Organization" as const,
          name: "AMASFAC — Asociación Mexicana de Asesores Financieros",
        },
      ]
    : undefined;

  return {
    "@type": "Person" as const,
    "@id": `${SITE_URL}/sobre-iria#person`,
    name: author.name,
    alternateName,
    jobTitle,
    description,
    hasOccupation,
    affiliation,
    image: author.photo?.asset?.url,
    url: `${SITE_URL}/sobre-iria`,
    knowsAbout,
    knowsLanguage: normalizeLanguages(author.languages),
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
    // areaServed ampliado a EUA — clave para "mexicanos viviendo en el extranjero".
    areaServed: [
      { "@type": "Country", name: "México" },
      { "@type": "Country", name: "Estados Unidos" },
    ],
    // serviceType ampliado al posicionamiento wealth advisory boutique.
    // Cada string es señal entity para LLMs cuando responden "¿qué hace X?".
    serviceType: [
      "Asesoría Patrimonial Boutique",
      "Wealth Advisory",
      "Planeación Patrimonial Internacional",
      "Protección Patrimonial",
      "Estructura Patrimonial Familiar",
      "Retiro y Pensiones",
      "Seguros de Vida",
      "Seguros Internacionales",
      "Gastos Médicos Mayores",
      "Gastos Médicos Mayores Internacional",
      "Fideicomisos vía Aseguradora",
      "Planes Educacionales",
      "Asesoría para Mexicanos en el Extranjero",
    ],
    // audience — schema.org canonical para "¿para quién es este servicio?".
    // LLMs lo citan textualmente al responder queries de matching.
    audience: [
      { "@type": "Audience", audienceType: "Mexicanos viviendo en el extranjero" },
      { "@type": "Audience", audienceType: "Empresarios y dueños de negocio" },
      { "@type": "Audience", audienceType: "Familias con hijos neurodivergentes" },
      { "@type": "Audience", audienceType: "Familias arcoíris LGBT" },
      { "@type": "Audience", audienceType: "Mujeres en construcción patrimonial" },
      { "@type": "Audience", audienceType: "Profesionistas con patrimonio en formación" },
    ],
    // priceRange "$$$$" señaliza tier premium boutique (no comparador masivo).
    priceRange: "$$$$",
    // hasOfferCatalog — el campo que ChatGPT/Perplexity citan textualmente
    // al responder "¿qué servicios ofrece X?". Estructura > strings sueltos.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de Asesoría Patrimonial",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Planeación Patrimonial Internacional",
            description:
              "Estrategia patrimonial para mexicanos viviendo en EUA o extranjeros con activos en México.",
            areaServed: [
              { "@type": "Country", name: "México" },
              { "@type": "Country", name: "Estados Unidos" },
            ],
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Retiro y Pensiones",
            description:
              "Estrategias de retiro para empresarios, profesionistas independientes y planeación pre-jubilatoria.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Protección Patrimonial Familiar",
            description:
              "Seguros de vida, fideicomisos vía aseguradora y estructura patrimonial para familias.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Gastos Médicos Mayores Internacional",
            description:
              "GMM nacional e internacional para individuos, familias y empresas.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Planes Educacionales",
            description:
              "Estructura financiera para educación de hijos, incluidas familias con hijos neurodivergentes.",
          },
        },
      ],
    },
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
    logo: `${SITE_URL}/logo-rif.svg`,
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
  /**
   * Última revisión técnica (vigencia) — distinta de updatedAt (cambios al texto).
   * Si se setea, gana sobre updatedAt para schema.org `dateModified`.
   */
  lastReviewed?: string;
  heroImage?: { asset?: { url?: string }; alt?: string };
  author?: AuthorData;
  reviewedBy?: { name?: string };
  sources?: Array<{ title?: string; url?: string; publisher?: string }>;
  topic?: string;
  /**
   * Formato editorial — decide subtipo de schema y layout.
   * Valores: guia | comparativa | que-es | checklist | errores | faq
   */
  format?: string;
  /**
   * Respuesta autocontenida (2-4 líneas) renderizada arriba del fold.
   * Marcada como `speakable` en JSON-LD → priorizada por voice y answer engines.
   */
  tldr?: string;
  /**
   * Preguntas literales que el artículo responde — matching de intención de búsqueda.
   */
  questionsAnswered?: string[];
  wordCount?: number;
};

// Mapeo topic → schema.org `about` Thing.
// Refuerza entity matching para LLMs que responden "¿qué dice X sobre concepto Y?".
const TOPIC_ABOUT_THING: Record<string, { name: string; sameAs?: string }> = {
  vida: { name: "Seguro de vida", sameAs: "https://es.wikipedia.org/wiki/Seguro_de_vida" },
  gmm: { name: "Gastos médicos mayores" },
  retiro: { name: "Pensión", sameAs: "https://es.wikipedia.org/wiki/Pensi%C3%B3n" },
  patrimonial: { name: "Planeación patrimonial" },
  educacionales: { name: "Plan educacional" },
  fideicomisos: { name: "Fideicomiso", sameAs: "https://es.wikipedia.org/wiki/Fideicomiso" },
  empresas: { name: "Seguros para empresas" },
  casos: { name: "Asesoría financiera especializada" },
};

export function buildArticleSchema(article: ArticleData) {
  // dateModified = lastReviewed (si existe) > updatedAt > publishedAt.
  // LLMs prefieren documentos recientemente revisados.
  const dateModified =
    article.lastReviewed ?? article.updatedAt ?? article.publishedAt;

  // `about` enlaza el artículo a un concepto canónico (Thing).
  const aboutThing = article.topic
    ? TOPIC_ABOUT_THING[article.topic]
    : undefined;

  // `speakable` selector apunta a la TLDR + H1 → voice / answer surfaces leen
  // estos elementos preferentemente. CSS selectors basados en data-attrs estables.
  const speakable = article.tldr
    ? {
        "@type": "SpeakableSpecification" as const,
        cssSelector: ["[data-speakable='tldr']", "[data-speakable='title']"],
      }
    : undefined;

  // mainEntity = Question[] cuando hay questionsAnswered → híbrido Article+FAQ
  // sin duplicar FAQ schema. Las preguntas tipo H2 se citan literal.
  const mainEntity =
    article.questionsAnswered && article.questionsAnswered.length > 0
      ? article.questionsAnswered.map((q) => ({
          "@type": "Question" as const,
          name: q,
        }))
      : undefined;

  return {
    "@type": "Article" as const,
    "@id": `${SITE_URL}/blog/${article.slug}#article`,
    headline: article.title,
    description: article.excerpt ?? article.tldr,
    abstract: article.tldr,
    image: article.heroImage?.asset?.url,
    datePublished: article.publishedAt,
    dateModified,
    inLanguage: "es-MX",
    isAccessibleForFree: true,
    wordCount: article.wordCount,
    keywords: article.topic,
    articleSection: article.topic,
    about: aboutThing
      ? {
          "@type": "Thing" as const,
          name: aboutThing.name,
          sameAs: aboutThing.sameAs,
        }
      : undefined,
    mainEntity,
    speakable,
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

// ------------------------------------------------------------------
// GLOSARIO — schema.org DefinedTerm
// ------------------------------------------------------------------

export type DefinedTermData = {
  term: string;
  slug: string;
  shortDefinition: string;
  topic?: string;
  synonyms?: string[];
};

/**
 * Schema.org DefinedTerm — fuente canonical cuando LLMs responden
 * "¿qué es X?". Combinado con `inDefinedTermSet` permite que Perplexity/ChatGPT
 * traten el glosario como referencia citable.
 */
export function buildDefinedTermSchema(t: DefinedTermData) {
  return {
    "@type": "DefinedTerm" as const,
    "@id": `${SITE_URL}/glosario/${t.slug}#term`,
    name: t.term,
    description: t.shortDefinition,
    url: `${SITE_URL}/glosario/${t.slug}`,
    inLanguage: "es-MX",
    alternateName: t.synonyms && t.synonyms.length > 0 ? t.synonyms : undefined,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": `${SITE_URL}/glosario#set`,
      name: "Glosario de seguros y planeación patrimonial",
      url: `${SITE_URL}/glosario`,
      publisher: { "@id": `${SITE_URL}#organization` },
    },
  };
}

export function buildDefinedTermSetSchema(termCount: number) {
  return {
    "@type": "DefinedTermSet" as const,
    "@id": `${SITE_URL}/glosario#set`,
    name: "Glosario de seguros y planeación patrimonial",
    description:
      "Definiciones breves de términos comunes en seguros, retiro y planeación patrimonial en México.",
    url: `${SITE_URL}/glosario`,
    inLanguage: "es-MX",
    numberOfItems: termCount,
    publisher: { "@id": `${SITE_URL}#organization` },
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
    // Multi-type: wealth advisor NO es retail. FinancialService + ProfessionalService
    // categorizan correctamente (boutique advisory premium, no tienda física).
    // Preserva señales locales (address, openingHours, areaServed).
    "@type": ["FinancialService", "ProfessionalService"] as const,
    "@id": `${SITE_URL}#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    image: author?.photo?.asset?.url ?? `${SITE_URL}/img/iria/iria-portrait-02.jpg`,
    telephone: author?.socialLinks?.whatsapp ?? "+525512683401",
    email: author?.socialLinks?.email ?? "soporte@talan.com.mx",
    // `streetAddress` sale de `officeAddress` del autor (Sanity), igual que en
    // buildFinancialAdvisorSchema. Antes este nodo solo declaraba ciudad y país:
    // un LocalBusiness sin calle es más débil para búsqueda local, y es
    // precisamente el nodo al que /contacto apunta como `mainEntity` y el que
    // debe coincidir con la ficha de Google Business.
    address: {
      "@type": "PostalAddress",
      ...(author?.officeAddress ? { streetAddress: author.officeAddress } : {}),
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
