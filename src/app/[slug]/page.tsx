import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PortableTextBlock } from "@portabletext/react";

import { PortableTextRenderer } from "@/components/portable-text";

import { sanityFetch } from "../../../sanity/lib/fetch";
import {
  ALL_SERVICES_SLUGS_QUERY,
  SERVICE_QUERY,
} from "../../../sanity/lib/queries";
import {
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

type ServiceData = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  priority?: number;
  shortDescription?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
  body?: unknown[] | null;
  keyBenefits?: string[] | null;
  objectionsAddressed?: Array<{ objection?: string; response?: string }> | null;
  faqs?: Array<{
    _id?: string;
    question?: string;
    answerText?: string | null;
    answer?: unknown[] | null;
    topic?: string;
  }> | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  carriersAvailable?: string[] | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  vida_pillar: "Pillar — Seguros de Vida",
  gmm_pillar: "Pillar — GMM",
  individuos: "Individuos",
  hnwi: "HNWI",
  empresas: "Empresas",
  casos: "Casos especiales",
};

export async function generateStaticParams() {
  const slugs =
    (await sanityFetch<Array<{ slug: string }>>({
      query: ALL_SERVICES_SLUGS_QUERY,
    }).catch(() => null)) ?? [];
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await sanityFetch<ServiceData | null>({
    query: SERVICE_QUERY,
    params: { slug },
    tags: [`service:${slug}`],
  }).catch(() => null);

  if (!service) {
    return {
      title: "Servicio no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = service.seoTitle || `${service.title} | ${SITE_NAME}`;
  const description =
    service.seoDescription ||
    service.shortDescription ||
    `Asesoría especializada en ${service.title}. Iria Talan, MDRT Top of the Table.`;

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${slug}`,
      title,
      description,
      images: service.heroImage?.asset?.url
        ? [{ url: service.heroImage.asset.url, alt: service.heroImage.alt }]
        : undefined,
    },
  };
}

function buildServiceSchema(service: ServiceData) {
  return {
    "@type": "FinancialProduct" as const,
    "@id": `${SITE_URL}/${service.slug}#financialproduct`,
    name: service.title,
    description: service.shortDescription || service.seoDescription,
    image: service.heroImage?.asset?.url,
    url: `${SITE_URL}/${service.slug}`,
    provider: { "@id": `${SITE_URL}#financialservice` },
    category: CATEGORY_LABELS[service.category] ?? service.category,
    audience: { "@type": "Audience", audienceType: "Familias afluentes y HNWI México" },
    areaServed: { "@type": "Country", name: "México" },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const service = await sanityFetch<ServiceData | null>({
    query: SERVICE_QUERY,
    params: { slug },
    tags: [`service:${slug}`],
  }).catch(() => null);

  if (!service) {
    notFound();
  }

  const ctaUrl = service.ctaUrl || "https://calendly.com/iriatalan";
  const ctaText = service.ctaText || "Agenda consulta gratis 30 min";

  const faqItems: FAQItem[] =
    service.faqs
      ?.filter((f) => f.question && f.answerText)
      .map((f) => ({ question: f.question!, answerText: f.answerText })) ?? [];

  const pageSchema = buildGraph(
    buildServiceSchema(service),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: service.title, path: `/${service.slug}` },
    ]),
    buildFAQPageSchema(faqItems)
  );

  const isPillar =
    service.category === "vida_pillar" || service.category === "gmm_pillar";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            {" / "}
            {isPillar ? "⭐ Servicio pillar" : CATEGORY_LABELS[service.category] ?? service.category}
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            {service.title}
          </h1>
          {service.shortDescription && (
            <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              {service.shortDescription}
            </p>
          )}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              {ctaText}
            </a>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        {service.body && Array.isArray(service.body) && service.body.length > 0 && (
          <section className="px-6 py-8 sm:py-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-3xl mx-auto w-full">
              <PortableTextRenderer value={service.body as PortableTextBlock[]} />
            </div>
          </section>
        )}

        {service.keyBenefits && service.keyBenefits.length > 0 && (
          <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Beneficios clave
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {service.keyBenefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300 leading-relaxed"
                  >
                    <span className="text-zinc-400 mt-1.5">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {service.objectionsAddressed && service.objectionsAddressed.length > 0 && (
          <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Lo que la gente nos pregunta antes de contratar
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Las objeciones reales que escucho — y cómo las resolvemos.
              </p>
              <div className="mt-10 space-y-8">
                {service.objectionsAddressed
                  .filter((o) => o.objection && o.response)
                  .map((o, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6"
                    >
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {o.objection}
                      </h3>
                      <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {o.response}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {service.carriersAvailable && service.carriersAvailable.length > 0 && (
          <section className="px-6 py-8 sm:py-12 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto w-full">
              <p className="text-sm uppercase tracking-wider text-zinc-500">
                Aseguradoras disponibles
              </p>
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-zinc-700 dark:text-zinc-300">
                {service.carriersAvailable.map((c) => (
                  <span key={c} className="font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {service.faqs && service.faqs.length > 0 && (
          <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-3xl mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Preguntas frecuentes
              </h2>
              <div className="mt-10 space-y-8">
                {service.faqs
                  .filter((f) => f.question)
                  .map((f) => (
                    <div key={f._id ?? f.question}>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {f.question}
                      </h3>
                      {f.answer &&
                      Array.isArray(f.answer) &&
                      f.answer.length > 0 ? (
                        <div className="mt-2">
                          <PortableTextRenderer value={f.answer as PortableTextBlock[]} />
                        </div>
                      ) : f.answerText ? (
                        <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {f.answerText}
                        </p>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-6 py-12 sm:py-20 max-w-4xl mx-auto w-full">
          <div className="rounded-3xl bg-rif-rojo text-white p-10 sm:p-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight max-w-xl mx-auto">
              ¿Listas para hablar de {service.title.toLowerCase()}?
            </h2>
            <p className="mt-3 opacity-80 max-w-md mx-auto">
              30 min de consulta gratuita. Te escucho primero, recomiendo después.
            </p>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              {ctaText}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
