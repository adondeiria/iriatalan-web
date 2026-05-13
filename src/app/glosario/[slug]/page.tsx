import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PortableTextBlock } from "@portabletext/react";

import { PortableTextRenderer } from "@/components/portable-text";
import { sanityFetch } from "../../../../sanity/lib/fetch";
import {
  ALL_GLOSSARY_SLUGS_QUERY,
  GLOSSARY_TERM_QUERY,
} from "../../../../sanity/lib/queries";
import { TOPIC_LABELS, topicHref } from "@/lib/blog";
import {
  buildBreadcrumbSchema,
  buildDefinedTermSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

type GlossaryTermData = {
  _id: string;
  term: string;
  slug: string;
  shortDefinition?: string;
  longExplanation?: unknown[] | null;
  topic?: string;
  synonyms?: string[];
  relatedTerms?: Array<{
    _id: string;
    term: string;
    slug: string;
    shortDefinition?: string;
    draft?: boolean;
  }> | null;
};

export async function generateStaticParams() {
  const slugs =
    (await sanityFetch<Array<{ slug: string }>>({
      query: ALL_GLOSSARY_SLUGS_QUERY,
    }).catch(() => null)) ?? [];
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = await sanityFetch<GlossaryTermData | null>({
    query: GLOSSARY_TERM_QUERY,
    params: { slug },
    tags: [`glossaryTerm:${slug}`],
  }).catch(() => null);

  if (!term) {
    return {
      title: "Término no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `${term.term} — Glosario | ${SITE_NAME}`;
  const description = term.shortDefinition ?? `Definición de ${term.term}`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/glosario/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/glosario/${slug}`,
      title,
      description,
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const term = await sanityFetch<GlossaryTermData | null>({
    query: GLOSSARY_TERM_QUERY,
    params: { slug },
    tags: [`glossaryTerm:${slug}`],
  }).catch(() => null);

  if (!term) {
    notFound();
  }

  const topicLabel = term.topic
    ? TOPIC_LABELS[term.topic] ?? term.topic
    : null;
  const categoryHref = topicHref(term.topic);

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Glosario", path: "/glosario" },
      { name: term.term, path: `/glosario/${slug}` },
    ]),
    buildDefinedTermSchema({
      term: term.term,
      slug: term.slug,
      shortDefinition: term.shortDefinition ?? "",
      topic: term.topic,
      synonyms: term.synonyms,
    })
  );

  const visibleRelated = (term.relatedTerms ?? []).filter((r) => !r.draft);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        <article>
          <section className="px-6 pt-16 pb-6 max-w-2xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-cream-light0">
              <Link href="/" className="hover:underline">
                Inicio
              </Link>
              {" / "}
              <Link href="/glosario" className="hover:underline">
                Glosario
              </Link>
            </p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.24em] font-medium text-burgundy">
              Glosario
            </p>
            <h1 className="mt-2 font-serif text-4xl sm:text-5xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
              {term.term}
            </h1>
            {term.synonyms && term.synonyms.length > 0 && (
              <p className="mt-3 text-sm text-warm-brown/70 dark:text-cream-light/65 italic">
                También conocido como: {term.synonyms.join(", ")}
              </p>
            )}
          </section>

          {term.shortDefinition && (
            <section className="px-6 max-w-2xl mx-auto w-full">
              <p
                data-speakable="definition"
                className="mt-2 text-xl text-ink dark:text-cream-light leading-relaxed"
              >
                {term.shortDefinition}
              </p>
            </section>
          )}

          {term.longExplanation &&
            Array.isArray(term.longExplanation) &&
            term.longExplanation.length > 0 && (
              <section className="px-6 py-10 max-w-2xl mx-auto w-full">
                <PortableTextRenderer
                  value={term.longExplanation as PortableTextBlock[]}
                />
              </section>
            )}

          {categoryHref && topicLabel && (
            <section className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
              <p className="text-sm text-warm-brown/85 dark:text-cream-light/65">
                Más sobre{" "}
                <Link
                  href={categoryHref}
                  className="text-burgundy hover:underline underline-offset-4"
                >
                  {topicLabel}
                </Link>
                .
              </p>
            </section>
          )}

          {visibleRelated.length > 0 && (
            <section className="px-6 py-12 border-t border-warm-brown/15 dark:border-warm-brown/30">
              <div className="max-w-2xl mx-auto w-full">
                <h2 className="font-serif text-2xl tracking-tight text-ink dark:text-cream-light">
                  Términos relacionados
                </h2>
                <ul className="mt-5 space-y-4 list-none">
                  {visibleRelated.map((r) => (
                    <li key={r._id}>
                      <Link
                        href={`/glosario/${r.slug}`}
                        className="group block"
                      >
                        <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                          {r.term}
                        </h3>
                        {r.shortDefinition && (
                          <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                            {r.shortDefinition}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="px-6 py-14 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream/40 dark:bg-coffee/30">
            <div className="max-w-2xl mx-auto w-full text-center">
              <h2 className="font-serif text-xl sm:text-2xl tracking-tight leading-tight">
                ¿Quieres que revisemos tu caso?
              </h2>
              <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-xl mx-auto">
                Las definiciones cortas son punto de partida — tu situación
                específica probablemente requiere conversación.
              </p>
              <Link
                href="/contacto"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-burgundy text-cream-light px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition"
              >
                Agenda sesión inicial
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
