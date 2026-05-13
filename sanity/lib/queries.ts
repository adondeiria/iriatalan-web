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
 * Filtra `!draft` → drafts retornan null → /blog/[slug] llama notFound().
 */
export const ARTICLE_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug && !draft][0]{
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
 * Filtra `!draft` → drafts NO generan páginas estáticas.
 */
export const ALL_ARTICLES_SLUGS_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current) && !draft]{
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
      publishedAt
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
