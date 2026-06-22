import type { Metadata } from "next";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { GLOSSARY_INDEX_QUERY } from "../../../sanity/lib/queries";
import { TOPIC_LABELS } from "@/lib/blog";
import {
  buildBreadcrumbSchema,
  buildDefinedTermSetSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

type GlossaryTermItem = {
  _id: string;
  term: string;
  slug: string;
  shortDefinition?: string;
  topic?: string;
  synonyms?: string[];
};

export async function generateMetadata(): Promise<Metadata> {
  const terms =
    (await sanityFetch<GlossaryTermItem[]>({
      query: GLOSSARY_INDEX_QUERY,
      tags: ["glossaryTerm"],
    }).catch(() => null)) ?? [];
  const isEmpty = terms.length === 0;

  return {
    title: `Glosario — Seguros y planeación patrimonial | ${SITE_NAME}`,
    description:
      "Definiciones breves de términos comunes en seguros, retiro y planeación patrimonial en México: deducible, coaseguro, suma asegurada, AFORE, PPR, fideicomiso y más.",
    alternates: { canonical: `${SITE_URL}/glosario` },
    robots: isEmpty
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/glosario`,
      title: `Glosario | ${SITE_NAME}`,
      description:
        "Definiciones breves y claras de términos de seguros y planeación patrimonial en México.",
    },
  };
}

export default async function GlossaryIndexPage() {
  const terms =
    (await sanityFetch<GlossaryTermItem[]>({
      query: GLOSSARY_INDEX_QUERY,
      tags: ["glossaryTerm"],
    }).catch(() => null)) ?? [];

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Glosario", path: "/glosario" },
    ]),
    terms.length > 0 ? buildDefinedTermSetSchema(terms.length) : null
  );

  const byTopic = terms.reduce<Record<string, GlossaryTermItem[]>>(
    (acc, t) => {
      const key = t.topic ?? "general";
      (acc[key] ??= []).push(t);
      return acc;
    },
    {}
  );
  const topicOrder = [
    "vida",
    "gmm",
    "retiro",
    "patrimonial",
    "educacionales",
    "fideicomisos",
    "empresas",
    "general",
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-20 pb-10 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-rif-gris">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            {" / Glosario"}
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Glosario
          </h1>
          <p className="mt-5 text-lg text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Definiciones breves y claras de términos comunes en seguros,
            retiro y planeación patrimonial en México. Sin tecnicismo
            innecesario.
          </p>
        </section>

        <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
          {terms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-warm-brown/20 dark:border-warm-brown/40 p-12 text-center">
              <h2 className="text-xl font-semibold text-ink dark:text-cream-light">
                Próximamente
              </h2>
              <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65 max-w-md mx-auto">
                Estoy publicando las primeras definiciones del glosario.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {topicOrder
                .filter((t) => byTopic[t])
                .map((topicKey) => {
                  const items = byTopic[topicKey];
                  const groupLabel =
                    topicKey === "general"
                      ? "General"
                      : TOPIC_LABELS[topicKey] ?? topicKey;
                  return (
                    <div key={topicKey}>
                      <h2 className="font-serif text-2xl tracking-tight text-ink dark:text-cream-light">
                        {groupLabel}
                      </h2>
                      <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 list-none">
                        {items.map((t) => (
                          <li key={t._id}>
                            <Link
                              href={`/glosario/${t.slug}`}
                              className="group block"
                            >
                              <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                                {t.term}
                              </h3>
                              {t.shortDefinition && (
                                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed line-clamp-2">
                                  {t.shortDefinition}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
