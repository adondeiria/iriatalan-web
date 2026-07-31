import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PortableTextBlock } from "@portabletext/react";

import { PortableTextRenderer } from "@/components/portable-text";

import { sanityFetch } from "../../../../../sanity/lib/fetch";
import {
  ALL_RESOURCES_SLUGS_QUERY,
  RESOURCE_QUERY,
} from "../../../../../sanity/lib/queries";
import {
  buildBreadcrumbSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import {
  categoryLabel,
  formatFileSize,
  getDownloadUrl,
  isReservedRecursoSlug,
  productLineLabel,
  type ResourceBase,
} from "@/lib/recursos";

type ResourceData = ResourceBase & {
  fileType?: string | null;
  description?: unknown[] | null;
  seoTitle?: string | null;
  _updatedAt: string;
};

export async function generateStaticParams() {
  const slugs =
    (await sanityFetch<Array<{ slug: string }>>({
      query: ALL_RESOURCES_SLUGS_QUERY,
    }).catch(() => null)) ?? [];
  // Un slug reservado nunca se pre-genera ni se anuncia: colisionaría con una
  // sección fija de /recursos y el documento quedaría inalcanzable.
  return slugs
    .filter((s) => !isReservedRecursoSlug(s.slug))
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await sanityFetch<ResourceData | null>({
    query: RESOURCE_QUERY,
    params: { slug },
    tags: [`resource:${slug}`],
  }).catch(() => null);

  if (!resource) {
    return {
      title: "Recurso no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title =
    resource.seoTitle ||
    `${resource.title} — ${resource.carrier} | ${SITE_NAME}`;
  const description =
    resource.seoDescription ||
    `${categoryLabel(resource.category)} de ${resource.carrier}${
      resource.year ? ` (${resource.year})` : ""
    }. Documento oficial publicado por la aseguradora.`;

  return {
    // `absolute`: el title ya trae la marca; sin esto el template del root la
    // pegaba una segunda vez.
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/recursos/documentos/${slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/recursos/documentos/${slug}`,
      title,
      description,
    },
  };
}

function buildDocumentSchema(r: ResourceData) {
  const url = getDownloadUrl(r);
  return {
    "@type": "DigitalDocument" as const,
    "@id": `${SITE_URL}/recursos/documentos/${r.slug}#document`,
    name: r.title,
    description: r.seoDescription,
    url: `${SITE_URL}/recursos/documentos/${r.slug}`,
    contentUrl: url ?? undefined,
    encodingFormat: r.fileType ?? "application/pdf",
    inLanguage: "es-MX",
    datePublished: r.year ? `${r.year.slice(0, 4)}-01-01` : undefined,
    dateModified: r._updatedAt,
    provider: { "@type": "Organization", name: r.carrier },
    publisher: { "@id": `${SITE_URL}#organization` },
    about: categoryLabel(r.category),
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const resource = await sanityFetch<ResourceData | null>({
    query: RESOURCE_QUERY,
    params: { slug },
    tags: [`resource:${slug}`],
  }).catch(() => null);

  if (!resource) {
    notFound();
  }

  const downloadUrl = getDownloadUrl(resource);
  const fileSize = formatFileSize(resource.fileSize);

  const pageSchema = buildGraph(
    buildDocumentSchema(resource),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Recursos", path: "/recursos" },
      { name: "Documentos de aseguradoras", path: "/recursos/documentos" },
      {
        name: resource.title,
        path: `/recursos/documentos/${resource.slug}`,
      },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-16 pb-8 max-w-3xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-rif-gris">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}
            <Link href="/recursos" className="hover:underline">Recursos</Link>
            {" / "}
            <Link href="/recursos/documentos" className="hover:underline">
              Documentos
            </Link>
            {" / "}
            {resource.carrier}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-burgundy font-medium">
            {categoryLabel(resource.category)}
            {resource.productLine && resource.productLine !== "otro" && (
              <span> · {productLineLabel(resource.productLine)}</span>
            )}
            {resource.year && <span> · {resource.year}</span>}
          </p>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1] text-ink dark:text-cream-light">
            {resource.title}
          </h1>
        </section>

        <section className="px-6 pb-10 max-w-3xl mx-auto w-full">
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-burgundy text-cream-light px-7 py-3.5 text-sm font-medium hover:bg-burgundy-deep transition"
            >
              {resource.fileUrl ? "Descargar PDF" : "Ver documento"}
              {fileSize && (
                <span className="text-cream-light/70 text-xs">({fileSize})</span>
              )}
            </a>
          ) : (
            <p className="text-warm-brown/85 dark:text-cream-light/65 italic">
              Documento próximamente disponible.
            </p>
          )}
          {!resource.fileUrl && resource.externalUrl && (
            <p className="mt-3 text-xs text-warm-brown/60 dark:text-cream-light/55">
              Hospedado en el sitio de {resource.carrier}.
            </p>
          )}
        </section>

        {resource.description && Array.isArray(resource.description) && resource.description.length > 0 && (
          <section className="px-6 py-10 sm:py-14 border-t border-warm-brown/15 dark:border-warm-brown/30 max-w-3xl mx-auto w-full">
            <PortableTextRenderer
              value={resource.description as PortableTextBlock[]}
            />
          </section>
        )}

        <section className="px-6 py-10 border-t border-warm-brown/15 dark:border-warm-brown/30 max-w-3xl mx-auto w-full">
          <p className="text-xs text-rif-gris leading-relaxed">
            Este documento es provisto por {resource.carrier} con fines
            informativos. La versión vigente de cada póliza prevalece sobre
            cualquier copia descargada. Para confirmar vigencia o resolver dudas,{" "}
            <Link href="/contacto" className="underline">
              agenda una sesión inicial
            </Link>
            .
          </p>
          <p className="mt-4">
            <Link
              href="/recursos/documentos"
              className="text-sm font-medium underline hover:text-burgundy"
            >
              ← Ver todos los documentos
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
