import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { RELATED_ARTICLES_QUERY } from "../../../sanity/lib/queries";
import { CategoryBadge } from "@/components/blog/article-meta";
import { formatDateMx } from "@/lib/blog";

/**
 * RelatedPosts — server component.
 *
 * Estrategia:
 *  1. Si el artículo trae `relatedArticles` manual (max 3), usar esos.
 *  2. Si no, query auto por mismo `topic` excluyendo el slug actual.
 *  3. Si tampoco hay (todo aún draft / 0 publicados del topic) → no renderiza nada.
 *
 * Citabilidad LLM: cluster de enlaces internos por tema = boost authority signal.
 * Los LLMs siguen estos enlaces para validar profundidad del autor en un topic.
 */

type RelatedPostItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  topic?: string;
  publishedAt?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
};

export async function RelatedPosts({
  topic,
  currentSlug,
  manual,
}: {
  topic?: string;
  currentSlug: string;
  manual?: RelatedPostItem[] | null;
}) {
  let posts: RelatedPostItem[] = manual ?? [];

  if (posts.length === 0 && topic) {
    posts =
      (await sanityFetch<RelatedPostItem[]>({
        query: RELATED_ARTICLES_QUERY,
        params: { topic, excludeSlug: currentSlug },
        tags: ["article"],
      }).catch(() => [])) ?? [];
  }

  if (!posts || posts.length === 0) return null;

  return (
    <section
      className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30"
      aria-label="Artículos relacionados"
    >
      <div className="max-w-5xl mx-auto w-full">
        <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
          Sigue leyendo
        </p>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
          Artículos relacionados
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p._id}
              href={`/blog/${p.slug}`}
              className="group flex flex-col"
            >
              {p.heroImage?.asset?.url && (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-warm-brown/10">
                  <Image
                    src={p.heroImage.asset.url}
                    alt={p.heroImage.alt ?? p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              {p.topic && (
                <div className="mt-4">
                  <CategoryBadge topic={p.topic} size="sm" />
                </div>
              )}
              <h3 className="mt-2 font-serif text-lg leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                {p.title}
              </h3>
              {p.excerpt && (
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed line-clamp-3">
                  {p.excerpt}
                </p>
              )}
              {p.publishedAt && (
                <p className="mt-3 text-xs text-warm-brown/60 dark:text-cream-light/55">
                  {formatDateMx(p.publishedAt)}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
