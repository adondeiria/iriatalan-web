import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { sanityFetch } from "../../../../../sanity/lib/fetch";
import { BLOG_BY_TOPIC_QUERY } from "../../../../../sanity/lib/queries";
import {
  formatDateMx,
  isValidTopicSlug,
  TOPIC_DESCRIPTIONS,
  TOPIC_LABELS,
  TOPIC_TO_URL_SLUG,
  URL_SLUG_TO_TOPIC,
  type ArticleTopic,
} from "@/lib/blog";
import {
  buildBreadcrumbSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

type ArticleListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  tldr?: string;
  publishedAt: string;
  topic?: string;
  format?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
  author?: { name: string; slug?: string } | null;
};

export function generateStaticParams() {
  // Genera una página por categoría definida en lib/blog.ts.
  return Object.values(TOPIC_TO_URL_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidTopicSlug(slug)) {
    return {
      title: "Categoría no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const topic = URL_SLUG_TO_TOPIC[slug];
  const label = TOPIC_LABELS[topic] ?? slug;
  const description = TOPIC_DESCRIPTIONS[topic] ?? "";

  // Solo indexamos si hay al menos 1 artículo publicado en la categoría.
  const articles =
    (await sanityFetch<ArticleListItem[]>({
      query: BLOG_BY_TOPIC_QUERY,
      params: { topic },
      tags: ["article"],
    }).catch(() => null)) ?? [];
  const isEmpty = articles.length === 0;

  return {
    title: `${label} | Blog ${SITE_NAME}`,
    description,
    alternates: { canonical: `${SITE_URL}/blog/categoria/${slug}` },
    robots: isEmpty
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/blog/categoria/${slug}`,
      title: `${label} | Blog ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValidTopicSlug(slug)) {
    notFound();
  }

  const topic: ArticleTopic = URL_SLUG_TO_TOPIC[slug];
  const label = TOPIC_LABELS[topic] ?? slug;
  const description = TOPIC_DESCRIPTIONS[topic] ?? "";

  const articles =
    (await sanityFetch<ArticleListItem[]>({
      query: BLOG_BY_TOPIC_QUERY,
      params: { topic },
      tags: ["article"],
    }).catch(() => null)) ?? [];

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: label, path: `/blog/categoria/${slug}` },
    ]),
    articles.length > 0
      ? {
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/blog/categoria/${slug}#collection`,
          name: `${label} — Blog ${SITE_NAME}`,
          description,
          url: `${SITE_URL}/blog/categoria/${slug}`,
          inLanguage: "es-MX",
          isPartOf: { "@id": `${SITE_URL}#website` },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: articles.length,
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/blog/${a.slug}`,
              name: a.title,
            })),
          },
        }
      : null
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-cream-light0">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            {" / "}
            <Link href="/blog" className="hover:underline">
              Blog
            </Link>
            {` / ${label}`}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-[0.24em] font-medium text-burgundy">
            Categoría
          </p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            {label}
          </h1>
          {description && (
            <p className="mt-5 text-lg text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </section>

        <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-warm-brown/20 dark:border-warm-brown/40 p-12 text-center">
              <h2 className="text-xl font-semibold text-ink dark:text-cream-light">
                Próximamente
              </h2>
              <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65 max-w-md mx-auto">
                Estoy preparando los primeros artículos de esta categoría.
                Mientras tanto, agenda una sesión inicial si quieres conversar
                sobre {label.toLowerCase()}.
              </p>
              <Link
                href="/contacto"
                className="mt-6 inline-block text-sm font-medium underline"
              >
                Agenda sesión inicial →
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <Link
                  key={a._id}
                  href={`/blog/${a.slug}`}
                  className="group flex flex-col"
                >
                  {a.heroImage?.asset?.url && (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-warm-brown/10">
                      <Image
                        src={a.heroImage.asset.url}
                        alt={a.heroImage.alt ?? a.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <h2 className="mt-5 font-serif text-xl leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                    {a.title}
                  </h2>
                  {(a.excerpt || a.tldr) && (
                    <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed line-clamp-3">
                      {a.excerpt ?? a.tldr}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-warm-brown/60 dark:text-cream-light/55">
                    {formatDateMx(a.publishedAt)}
                    {a.author?.name && ` · ${a.author.name}`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
