import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { ARTICLES_BY_TOPICS_QUERY } from "../../../sanity/lib/queries";
import { FORMAT_LABELS, TOPIC_LABELS, formatDateMx } from "@/lib/blog";

/**
 * RelatedArticles — server component. El sentido que faltaba del interlinking.
 *
 * `related-services.tsx` ya llevaba del artículo a la página de servicio, pero
 * ninguna de las 8 páginas de servicio enlazaba a un solo artículo (0 ocurrencias
 * de `href="/blog`). El cluster temático era una calle de un solo sentido: el
 * contenido pasaba autoridad a las páginas que venden, y las que venden no
 * devolvían nada ni señalaban de qué temas hay profundidad.
 *
 * Consulta Sanity en vez de llevar una lista fija de artículos: así se puebla solo
 * cuando Iria publica, sin tocar código. Una lista escrita a mano quedaría vieja
 * al segundo artículo.
 *
 * Si no hay artículos para esos topics no renderiza NADA — una sección
 * "artículos relacionados" vacía es peor que no tenerla, y hoy `vida`, `empresas`
 * y `casos` todavía no tienen artículos propios.
 */

type ArticleCard = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  tldr?: string;
  topic?: string;
  format?: string;
  publishedAt?: string;
};

type Props = {
  /**
   * Topics de los que tomar artículos, en orden de preferencia temática. El
   * orden NO decide el resultado (eso lo hace la fecha), pero documenta de qué
   * temas se nutre esta página.
   */
  topics: string[];
  /** Encabezado. Por defecto uno genérico. */
  heading?: string;
  /** Frase bajo el encabezado, para hilar con el contenido de la página. */
  intro?: string;
  /** Cuántos mostrar como máximo. */
  limit?: number;
};

export async function RelatedArticles({
  topics,
  heading = "Léelo a fondo en el blog",
  intro,
  limit = 3,
}: Props) {
  if (!topics || topics.length === 0) return null;

  const articles =
    (await sanityFetch<ArticleCard[]>({
      query: ARTICLES_BY_TOPICS_QUERY,
      params: { topics },
      tags: ["article"],
    }).catch(() => null)) ?? [];

  if (articles.length === 0) return null;

  const visibles = articles.slice(0, limit);

  return (
    <section
      className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30"
      aria-label="Artículos relacionados"
    >
      <div className="max-w-5xl mx-auto w-full">
        <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
          Del blog
        </p>
        <h2 className="mt-3 font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
          {heading}
        </h2>
        {intro ? (
          <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            {intro}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {visibles.map((a) => (
            <Link
              key={a._id}
              href={`/blog/${a.slug}`}
              className="group flex flex-col p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
            >
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-warm-brown/70 dark:text-cream-light/50">
                {a.format && FORMAT_LABELS[a.format] ? (
                  <span>{FORMAT_LABELS[a.format]}</span>
                ) : null}
                {a.topic && TOPIC_LABELS[a.topic] ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{TOPIC_LABELS[a.topic]}</span>
                  </>
                ) : null}
              </span>
              <h3 className="mt-2 font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500 leading-snug">
                {a.title}
              </h3>
              {(a.excerpt || a.tldr) && (
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed line-clamp-3">
                  {a.excerpt || a.tldr}
                </p>
              )}
              <span className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-burgundy group-hover:underline">
                  Leer →
                </span>
                {a.publishedAt ? (
                  <time
                    dateTime={a.publishedAt}
                    className="text-xs text-warm-brown/60 dark:text-cream-light/40"
                  >
                    {formatDateMx(a.publishedAt)}
                  </time>
                ) : null}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="mt-8 inline-block text-sm font-medium underline text-warm-brown dark:text-cream-light/85 hover:text-burgundy transition-colors duration-500"
        >
          Ver todos los artículos →
        </Link>
      </div>
    </section>
  );
}
