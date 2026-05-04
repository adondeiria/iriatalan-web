import { defineQuery } from "next-sanity";

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

export const ARTICLE_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug][0]{
    _id, title, "slug": slug.current,
    "author": author->{ _id, name, "slug": slug.current, title, photo{ ..., asset-> }, sameAs },
    "reviewedBy": reviewedBy->{ _id, name, "slug": slug.current, title },
    publishedAt,
    updatedAt,
    topic,
    excerpt,
    heroImage{ ..., asset-> },
    body,
    "faqs": faqs[]->{
      _id, question,
      "answerText": pt::text(answer),
      answer,
      topic
    },
    sources[]{ title, url, publisher },
    wordCount,
    seoTitle,
    seoDescription
  }
`);

export const ALL_ARTICLES_SLUGS_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt,
    publishedAt
  }
`);

export const BLOG_INDEX_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc){
    _id, title, "slug": slug.current,
    excerpt,
    publishedAt,
    topic,
    heroImage{ ..., asset-> },
    "author": author->{ name, "slug": slug.current, photo{ ..., asset-> } }
  }
`);

export const SITEMAP_QUERY = defineQuery(`
  {
    "services": *[_type == "service" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    },
    "articles": *[_type == "article" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt,
      publishedAt
    }
  }
`);
