import { defineQuery } from "next-sanity";

/**
 * Queries GROQ — fuente única de verdad para fetching desde Sanity.
 *
 * Convención drafts:
 *  - Documentos `article` y `glossaryTerm` tienen un campo `draft: boolean`.
 *  - Queries PÚBLICAS filtran `!draft` para que los stubs nunca aparezcan en
 *    sitemap.xml, llms.txt, /blog index, /blog/[slug] (404), category pages,
 *    /glosario, ni en related posts.
 *  - Para previsualizar drafts: usar Sanity Studio (no hay vista pública de preview).
 */

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    heroTitle,
    heroSubtitle,
    heroCtaText,
    heroCtaUrl,
    heroImage{ ..., asset-> },
    "featuredServices": featuredServices[]->{
      _id, title, "slug": slug.current, category, priority,
      shortDescription, heroImage{ ..., asset-> }
    },
    valueProps[]{ title, description, icon },
    testimonials[]{ quote, name, role, photo{ ..., asset-> } },
    trustSignals{ carriersShown, stats[]{ label, value } },
    seoTitle,
    seoDescription
  }
`);

export const SOBRE_IRIA_QUERY = defineQuery(`
  *[_type == "author"] | order(_createdAt asc)[0]{
    _id, name, "slug": slug.current, title,
    photo{ ..., asset-> },
    bio,
    longBio,
    credentials[]{ title, issuer, year, category, url },
    carriers,
    specialties,
    languages,
    socialLinks,
    officeAddress,
    sameAs
  }
`);

export const SERVICE_QUERY = defineQuery(`
  *[_type == "service" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, category, priority,
    shortDescription,
    heroImage{ ..., asset-> },
    body,
    keyBenefits,
    objectionsAddressed[]{ objection, response },
    "faqs": faqs[]->{
      _id, question,
      "answerText": pt::text(answer),
      answer,
      topic
    },
    ctaText,
    ctaUrl,
    carriersAvailable,
    seoTitle,
    seoDescription
  }
`);

export const ALL_SERVICES_SLUGS_QUERY = defineQuery(`
  *[_type == "service" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`);

export const FEATURED_SERVICES_QUERY = defineQuery(`
  *[_type == "service"] | order(priority asc)[0...6]{
    _id, title, "slug": slug.current, category, priority,
    shortDescription, heroImage{ ..., asset-> }
  }
`);

// =========================================================
// ARTICLES (BLOG)
// =========================================================

/**
 * ARTICLE_QUERY — un solo artículo por slug.
 * Filtra `!draft && publishedAt <= now()` → drafts y fechas futuras retornan
 * null → /blog/[slug] llama notFound().
 *
 * El filtro de fecha es el MISMO predicado que usan BLOG_INDEX_QUERY, las
 * categorías, related y el sitemap. Antes esta query solo filtraba `!draft`, y
 * esa diferencia creaba "artículos fantasma": un artículo con `publishedAt`
 * nulo o futuro respondía 200 por URL directa —y hasta generaba página
 * estática— pero no aparecía en ningún listado ni en el sitemap. Google lo
 * indexaba como página huérfana. Fue exactamente lo que le pasó a
 * `rentas-vitalicias-mexico`.
 *
 * Consecuencia buscada: un artículo programado a futuro da 404 hasta su fecha,
 * y uno sin `publishedAt` da 404 hasta que se le ponga. La revisión previa a
 * publicar se hace en Studio, no por URL pública, así que esto no estorba el
 * flujo.
 */
export const ARTICLE_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug && !draft && publishedAt <= now()][0]{
    _id, title, "slug": slug.current,
    "author": author->{ _id, name, "slug": slug.current, title, bio, photo{ ..., asset-> }, sameAs, socialLinks, credentials[]{ title, issuer, year, category } },
    "reviewedBy": reviewedBy->{ _id, name, "slug": slug.current, title },
    publishedAt,
    updatedAt,
    lastReviewed,
    topic,
    format,
    tldr,
    questionsAnswered,
    excerpt,
    heroImage{ ..., asset-> },
    video{ videoId, name, description, uploadDate, duration },
    body[]{
      ...,
      _type == "glossaryReference" => {
        ...,
        "term": term->{ _id, term, "slug": slug.current, shortDefinition, draft }
      }
    },
    "faqs": faqs[]->{
      _id, question,
      "answerText": pt::text(answer),
      answer,
      topic
    },
    sources[]{ title, url, publisher },
    "relatedArticles": relatedArticles[]->{
      _id, title, "slug": slug.current, excerpt, topic, publishedAt, heroImage{ ..., asset-> }
    },
    wordCount,
    seoTitle,
    seoDescription
  }
`);

/**
 * ALL_ARTICLES_SLUGS_QUERY — para generateStaticParams.
 * Filtra `!draft && publishedAt <= now()` → drafts y fechas futuras NO generan
 * páginas estáticas.
 *
 * Mismo predicado que ARTICLE_QUERY a propósito: si aquí se pre-renderizara un
 * slug que allá da null, el build generaría una página que solo sabe hacer
 * notFound(). Con `dynamicParams` por defecto, un slug fuera de esta lista se
 * resuelve on-demand y cae en el 404 correcto.
 */
export const ALL_ARTICLES_SLUGS_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current) && !draft && publishedAt <= now()]{
    "slug": slug.current,
    _updatedAt,
    publishedAt
  }
`);

/**
 * BLOG_INDEX_QUERY — listado público de blog.
 * Filtra `!draft && publishedAt <= now()` → futuras fechas tampoco aparecen.
 */
export const BLOG_INDEX_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current) && !draft && publishedAt <= now()] | order(publishedAt desc){
    _id, title, "slug": slug.current,
    excerpt,
    tldr,
    publishedAt,
    updatedAt,
    topic,
    format,
    heroImage{ ..., asset-> },
    "author": author->{ name, "slug": slug.current, photo{ ..., asset-> } }
  }
`);

/**
 * BLOG_BY_TOPIC_QUERY — listado filtrado por categoría.
 * Para /blog/categoria/[slug].
 */
export const BLOG_BY_TOPIC_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current) && !draft && publishedAt <= now() && topic == $topic] | order(publishedAt desc){
    _id, title, "slug": slug.current,
    excerpt,
    tldr,
    publishedAt,
    topic,
    format,
    heroImage{ ..., asset-> },
    "author": author->{ name, "slug": slug.current, photo{ ..., asset-> } }
  }
`);

/**
 * ARTICLES_BY_TOPICS_QUERY — artículos publicados de uno o varios topics.
 *
 * Alimenta el bloque "artículos relacionados" de las páginas de servicio, que
 * cierra el interlinking en el sentido que faltaba: `related-services.tsx` ya
 * llevaba del artículo al servicio, pero ninguna página de servicio enlazaba a un
 * solo artículo — el cluster era una calle de un solo sentido.
 *
 * Acepta varios topics porque algunas páginas de servicio no tienen artículos
 * propios todavía y conviene que tomen de temas vecinos en vez de quedar vacías.
 * El orden del array `$topics` NO ordena el resultado: eso se decide por fecha,
 * para que lo más reciente salga primero.
 *
 * Sin límite en la query (GROQ no acepta slices con variable); el componente
 * recorta. Trae 6 como máximo razonable para elegir.
 */
export const ARTICLES_BY_TOPICS_QUERY = defineQuery(`
  *[_type == "article" && !draft && publishedAt <= now() && topic in $topics] | order(publishedAt desc)[0...6]{
    _id, title, "slug": slug.current, excerpt, tldr, topic, format, publishedAt
  }
`);

/**
 * RELATED_ARTICLES_QUERY — fallback automático cuando relatedArticles está vacío.
 * Trae 3 del mismo topic, excluyendo el artículo actual.
 */
export const RELATED_ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && !draft && publishedAt <= now() && topic == $topic && slug.current != $excludeSlug] | order(publishedAt desc)[0...3]{
    _id, title, "slug": slug.current, excerpt, topic, publishedAt, heroImage{ ..., asset-> }
  }
`);

// =========================================================
// GLOSSARY
// =========================================================

/**
 * GLOSSARY_INDEX_QUERY — listado público de términos.
 */
export const GLOSSARY_INDEX_QUERY = defineQuery(`
  *[_type == "glossaryTerm" && defined(slug.current) && !draft] | order(term asc){
    _id, term, "slug": slug.current,
    shortDefinition,
    topic,
    synonyms
  }
`);

/**
 * GLOSSARY_TERM_QUERY — un solo término por slug, con relacionados.
 */
export const GLOSSARY_TERM_QUERY = defineQuery(`
  *[_type == "glossaryTerm" && slug.current == $slug && !draft][0]{
    _id, term, "slug": slug.current,
    shortDefinition,
    longExplanation,
    topic,
    synonyms,
    "relatedTerms": relatedTerms[]->{
      _id, term, "slug": slug.current, shortDefinition, draft
    }
  }
`);

/**
 * ALL_GLOSSARY_SLUGS_QUERY — para generateStaticParams de /glosario/[slug].
 */
export const ALL_GLOSSARY_SLUGS_QUERY = defineQuery(`
  *[_type == "glossaryTerm" && defined(slug.current) && !draft]{
    "slug": slug.current,
    _updatedAt
  }
`);

// =========================================================
// SITEMAP (drafts excluidos)
// =========================================================

export const SITEMAP_QUERY = defineQuery(`
  {
    "services": *[_type == "service" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    },
    "articles": *[_type == "article" && defined(slug.current) && !draft && publishedAt <= now()]{
      "slug": slug.current,
      _updatedAt,
      publishedAt,
      topic
    },
    "glossaryTerms": *[_type == "glossaryTerm" && defined(slug.current) && !draft]{
      "slug": slug.current,
      _updatedAt
    },
    "resources": *[_type == "resource" && defined(slug.current) && isPublic == true]{
      "slug": slug.current,
      _updatedAt
    }
  }
`);

// =========================================================
// RESOURCES (sin cambios)
// =========================================================

export const RESOURCES_LIST_QUERY = defineQuery(`
  *[_type == "resource" && isPublic == true && defined(slug.current)]
    | order(carrier asc, category asc, year desc){
      _id,
      title,
      "slug": slug.current,
      carrier,
      category,
      productLine,
      year,
      "fileUrl": file.asset->url,
      "fileSize": file.asset->size,
      externalUrl,
      seoDescription
    }
`);

export const RESOURCE_QUERY = defineQuery(`
  *[_type == "resource" && slug.current == $slug && isPublic == true][0]{
    _id,
    title,
    "slug": slug.current,
    carrier,
    category,
    productLine,
    year,
    "fileUrl": file.asset->url,
    "fileSize": file.asset->size,
    "fileType": file.asset->mimeType,
    externalUrl,
    description,
    seoTitle,
    seoDescription,
    _updatedAt
  }
`);

export const ALL_RESOURCES_SLUGS_QUERY = defineQuery(`
  *[_type == "resource" && defined(slug.current) && isPublic == true]{
    "slug": slug.current,
    _updatedAt
  }
`);
