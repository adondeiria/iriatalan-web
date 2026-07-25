import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PortableTextBlock } from "@portabletext/react";

import {
  AuthorCard,
  CategoryBadge,
  LastUpdated,
  TLDRBox,
} from "@/components/blog/article-meta";
import { PortableTextRenderer } from "@/components/portable-text";
import { GlossaryMentions } from "@/components/blog/glossary-mentions";
import { RelatedPosts } from "@/components/blog/related-posts";
import { RelatedServices } from "@/components/blog/related-services";
import { TableOfContents } from "@/components/blog/table-of-contents";

import { sanityFetch } from "../../../../sanity/lib/fetch";
import {
  ALL_ARTICLES_SLUGS_QUERY,
  ARTICLE_QUERY,
} from "../../../../sanity/lib/queries";
import { TOPIC_LABELS, topicHref } from "@/lib/blog";
import { WA_NUMBER_FALLBACK, waBlogMessage, waHref } from "@/lib/whatsapp";
import {
  AuthorData,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

// ISR: regenerar cada 30 seg para que nuevos artículos publicados desde Sanity
// (vía /draft-push o cambio del toggle draft=false) aparezcan rápido sin
// necesidad de redeploy manual. dynamicParams explícito = slugs no pre-generados
// caen a SSR + cache (default true en App Router, lo dejamos explícito).
export const revalidate = 30;
export const dynamicParams = true;

type ArticleAuthor = AuthorData & {
  credentials?: Array<{ title?: string; issuer?: string; category?: string }>;
};

type ArticleData = {
  _id: string;
  title: string;
  slug: string;
  author?: ArticleAuthor | null;
  reviewedBy?: { name?: string; slug?: string; title?: string } | null;
  publishedAt: string;
  updatedAt?: string;
  lastReviewed?: string;
  topic?: string;
  format?: string;
  tldr?: string;
  questionsAnswered?: string[];
  excerpt?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
  body?: unknown[] | null;
  faqs?: Array<{
    _id?: string;
    question?: string;
    answerText?: string | null;
    answer?: unknown[] | null;
    topic?: string;
  }> | null;
  sources?: Array<{ title?: string; url?: string; publisher?: string }> | null;
  relatedArticles?: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    topic?: string;
    publishedAt?: string;
    heroImage?: { asset?: { url?: string }; alt?: string } | null;
  }> | null;
  wordCount?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export async function generateStaticParams() {
  const slugs =
    (await sanityFetch<Array<{ slug: string }>>({
      query: ALL_ARTICLES_SLUGS_QUERY,
    }).catch(() => null)) ?? [];
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await sanityFetch<ArticleData | null>({
    query: ARTICLE_QUERY,
    params: { slug },
    tags: [`article:${slug}`],
  }).catch(() => null);

  if (!article) {
    return {
      title: "Artículo no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = article.seoTitle || `${article.title} | ${SITE_NAME}`;
  const description =
    article.seoDescription ||
    article.excerpt ||
    article.tldr ||
    `Artículo de Iria Talan sobre ${
      TOPIC_LABELS[article.topic ?? ""] ?? article.topic ?? "planeación patrimonial"
    }.`;

  return {
    // `absolute` evita que el template del root (`%s | ${SITE_NAME}`) vuelva a
    // pegar la marca: `title` ya la incluye, y sin esto salía duplicada
    // ("… | Iria Talan / RIF | Iria Talan / RIF") en todo artículo.
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/blog/${slug}`,
      title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime:
        article.lastReviewed ?? article.updatedAt ?? article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: article.heroImage?.asset?.url
        ? [
            {
              url: article.heroImage.asset.url,
              alt: article.heroImage.alt ?? article.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await sanityFetch<ArticleData | null>({
    query: ARTICLE_QUERY,
    params: { slug },
    tags: [`article:${slug}`],
  }).catch(() => null);

  if (!article) {
    notFound();
  }

  const faqItems: FAQItem[] =
    article.faqs
      ?.filter((f) => f.question && f.answerText)
      .map((f) => ({ question: f.question!, answerText: f.answerText })) ?? [];

  const categoryHref = topicHref(article.topic);
  const topicLabel = article.topic
    ? TOPIC_LABELS[article.topic] ?? article.topic
    : null;

  const pageSchema = buildGraph(
    buildArticleSchema({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      tldr: article.tldr,
      questionsAnswered: article.questionsAnswered,
      format: article.format,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      lastReviewed: article.lastReviewed,
      heroImage: article.heroImage ?? undefined,
      author: article.author ?? undefined,
      reviewedBy: article.reviewedBy ?? undefined,
      sources: article.sources ?? undefined,
      topic: article.topic,
      wordCount: article.wordCount,
    }),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
      ...(categoryHref && topicLabel
        ? [{ name: topicLabel, path: categoryHref }]
        : []),
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
    buildFAQPageSchema(faqItems)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <article>
          <section className="px-6 pt-16 pb-6 max-w-3xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              <Link href="/" className="hover:underline">
                Inicio
              </Link>
              {" / "}
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
              {categoryHref && topicLabel && (
                <>
                  {" / "}
                  <Link href={categoryHref} className="hover:underline">
                    {topicLabel}
                  </Link>
                </>
              )}
            </p>
            {article.topic && (
              <div className="mt-5">
                <CategoryBadge topic={article.topic} />
              </div>
            )}
            <h1
              data-speakable="title"
              className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light"
            >
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-5 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-warm-brown/70 dark:text-cream-light/65">
              {article.author?.name && (
                <span>
                  Por{" "}
                  <Link
                    href="/sobre-iria"
                    className="font-medium text-ink dark:text-cream-light hover:underline"
                  >
                    {article.author.name}
                  </Link>
                </span>
              )}
              <span aria-hidden>·</span>
              <LastUpdated
                publishedAt={article.publishedAt}
                updatedAt={article.updatedAt}
                lastReviewed={article.lastReviewed}
              />
              {article.reviewedBy?.name && (
                <>
                  <span aria-hidden>·</span>
                  <span>Revisado por {article.reviewedBy.name}</span>
                </>
              )}
            </div>
          </section>

          {article.tldr && (
            <section className="px-6 max-w-3xl mx-auto w-full">
              <TLDRBox>{article.tldr}</TLDRBox>
            </section>
          )}

          {article.heroImage?.asset?.url && (
            <section className="px-6 mt-6 max-w-4xl mx-auto w-full">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-warm-brown/10">
                <Image
                  src={article.heroImage.asset.url}
                  alt={article.heroImage.alt ?? article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 64rem"
                  className="object-cover"
                  priority
                />
              </div>
            </section>
          )}

          {article.body &&
            Array.isArray(article.body) &&
            article.body.length > 0 && (
              <section className="px-6 py-10 sm:py-12 max-w-3xl mx-auto w-full">
                <TableOfContents body={article.body as unknown[]} />
                <PortableTextRenderer
                  value={article.body as PortableTextBlock[]}
                />
              </section>
            )}

          {faqItems.length > 0 && (
            <section className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
              <div className="max-w-3xl mx-auto w-full">
                <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
                  Preguntas relacionadas
                </h2>
                <div className="mt-8 space-y-8">
                  {faqItems.map((f, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6"
                    >
                      <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                        {f.question}
                      </h3>
                      <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                        {f.answerText}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {article.sources && article.sources.length > 0 && (
            <section className="px-6 py-12 border-t border-warm-brown/15 dark:border-warm-brown/30">
              <div className="max-w-3xl mx-auto w-full">
                <h2 className="text-sm uppercase tracking-wider text-rif-gris">
                  Fuentes
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  {article.sources
                    .filter((s) => s.title && s.url)
                    .map((s, i) => (
                      <li key={i} className="leading-relaxed">
                        <a
                          href={s.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink dark:text-cream-light underline hover:text-burgundy dark:hover:text-burgundy"
                        >
                          {s.title}
                        </a>
                        {s.publisher && (
                          <span className="text-warm-brown/60 dark:text-cream-light/55">
                            {" "}— {s.publisher}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </section>
          )}

          <section className="px-6 pt-8 max-w-3xl mx-auto w-full">
            <AuthorCard
              author={
                article.author
                  ? {
                      name: article.author.name,
                      title: article.author.title,
                      bio: article.author.bio,
                      photo: article.author.photo ?? null,
                      credentials: article.author.credentials,
                    }
                  : null
              }
              reviewedBy={article.reviewedBy ?? null}
            />
          </section>

          <GlossaryMentions body={article.body ?? undefined} />

          <RelatedPosts
            topic={article.topic}
            currentSlug={article.slug}
            manual={article.relatedArticles ?? undefined}
          />

          <RelatedServices topic={article.topic} />

          <section className="px-6 py-16 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream/40 dark:bg-coffee/30">
            <div className="max-w-3xl mx-auto w-full text-center">
              <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
                ¿Tienes una situación específica?
              </h2>
              <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-xl mx-auto">
                Cada caso es distinto. Escríbeme y lo vemos con calma — te
                escucho primero, recomiendo después.
              </p>
              {/* WhatsApp como acción principal: el lector que llegó hasta aquí
                  es el lead más caliente del artículo, y el mensaje ya llega
                  con el título del artículo precargado. "Agenda sesión" queda
                  como secundaria para quien prefiere el formulario. */}
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waHref(
                    WA_NUMBER_FALLBACK,
                    waBlogMessage(article.title)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-burgundy text-cream-light px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition"
                >
                  Escríbeme por WhatsApp
                </a>
                <Link
                  href="/contacto#agendar"
                  className="inline-flex items-center justify-center rounded-full border border-warm-brown/30 dark:border-warm-brown/50 px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase text-ink dark:text-cream-light hover:border-burgundy transition"
                >
                  Agenda sesión inicial
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
