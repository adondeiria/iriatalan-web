import type { MetadataRoute } from "next";

import { sanityFetch } from "../../sanity/lib/fetch";
import { SITEMAP_QUERY } from "../../sanity/lib/queries";
import { SITE_URL } from "@/lib/seo";
import { TOPIC_TO_URL_SLUG, type ArticleTopic } from "@/lib/blog";
import { isReservedRecursoSlug } from "@/lib/recursos";

// ISR: regenerar sitemap cada 60 seg para que crawlers vean nuevos slugs
// publicados sin necesidad de redeploy.
export const revalidate = 60;

type SitemapData = {
  services: Array<{ slug: string; _updatedAt: string }>;
  articles: Array<{
    slug: string;
    _updatedAt: string;
    publishedAt?: string;
    topic?: string;
  }>;
  glossaryTerms: Array<{ slug: string; _updatedAt: string }>;
  resources: Array<{ slug: string; _updatedAt: string }>;
} | null;

/** Fecha más reciente de una colección; undefined si está vacía. */
function newestDate(items: Array<{ _updatedAt: string }>): Date | undefined {
  if (items.length === 0) return undefined;
  return new Date(
    Math.max(...items.map((i) => new Date(i._updatedAt).getTime()))
  );
}

const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1.0 },
  { path: "/sobre-iria", priority: 0.9 },
  { path: "/retiro", priority: 0.9 },
  { path: "/gmm", priority: 0.9 },
  { path: "/empresas", priority: 0.9 },
  { path: "/patrimonial", priority: 0.9 },
  { path: "/seguros-vida", priority: 0.9 },
  { path: "/planes-educacionales", priority: 0.85 },
  { path: "/fondos-de-inversion", priority: 0.85 },
  { path: "/personas", priority: 0.9 },
  { path: "/personas/mujeres", priority: 0.85 },
  { path: "/personas/familias-arcoiris", priority: 0.85 },
  { path: "/personas/hijos-neurodivergentes", priority: 0.85 },
  { path: "/personas/mexicanos-en-el-extranjero", priority: 0.85 },
  // Páginas en inglés (International Families).
  { path: "/foreigners-in-mexico", priority: 0.85 },
  { path: "/international-health-insurance", priority: 0.8 },
  { path: "/retirement-planning", priority: 0.8 },
  { path: "/guia", priority: 0.8 },
  // Solo la puerta pública. `/perfil-inversionista/sesion` va con
  // `noindex, nofollow` porque muestra la estrategia guía interna y el bloque
  // de acuerdo con la asesora — no debe entrar aquí nunca.
  { path: "/perfil-inversionista", priority: 0.8 },
  { path: "/blog/silencios", priority: 0.6 },
  { path: "/contacto", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await sanityFetch<SitemapData>({
    query: SITEMAP_QUERY,
    revalidate: 3600,
  }).catch(() => null);

  const articles = data?.articles ?? [];

  // Sin `lastModified` en rutas estáticas: antes se emitía `new Date()`, que
  // con ISR reporta "modificado ahora mismo" en cada regeneración. Un lastmod
  // que nunca envejece es una señal falsa y los buscadores terminan
  // descartando el lastmod de TODO el sitemap. Omitirlo es honesto; las rutas
  // dinámicas de abajo sí llevan fecha real desde Sanity.
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    priority: r.priority,
  }));

  // Dedupe contra rutas estáticas: si Sanity tiene un service con slug
  // "gmm", "retiro", etc., evita emitir la URL dos veces.
  const staticPaths = new Set(STATIC_ROUTES.map((r) => r.path));
  const serviceUrls: MetadataRoute.Sitemap =
    data?.services
      ?.filter((s) => !staticPaths.has(`/${s.slug}`))
      .map((s) => ({
        url: `${SITE_URL}/${s.slug}`,
        lastModified: new Date(s._updatedAt),
        priority: 0.9,
      })) ?? [];

  // /blog/[slug] — drafts ya excluidos por SITEMAP_QUERY (`!draft && publishedAt <= now()`)
  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(a._updatedAt),
    priority: 0.7,
  }));

  // /glosario/[slug] — drafts excluidos por SITEMAP_QUERY
  const glossaryUrls: MetadataRoute.Sitemap =
    data?.glossaryTerms?.map((t) => ({
      url: `${SITE_URL}/glosario/${t.slug}`,
      lastModified: new Date(t._updatedAt),
      priority: 0.5,
    })) ?? [];

  // /recursos/documentos/[slug] — el detalle vive bajo /documentos, no bajo
  // /recursos directo: así ninguna ruta dinámica es hermana de las secciones
  // fijas del hub. Un slug reservado se descarta igual, por si alguna vez se
  // reintroduce un [slug] a ese nivel: la ruta estática ganaría y el documento
  // quedaría inalcanzable mientras el sitemap seguiría anunciándolo.
  const resourceUrls: MetadataRoute.Sitemap =
    data?.resources
      ?.filter((r) => !isReservedRecursoSlug(r.slug))
      .map((r) => ({
        url: `${SITE_URL}/recursos/documentos/${r.slug}`,
        lastModified: new Date(r._updatedAt),
        priority: 0.6,
      })) ?? [];

  // /blog/categoria/[slug] — un hub por topic con artículos publicados.
  // Emiten CollectionPage + ItemList y son indexables, pero faltaban en el
  // sitemap. Solo se incluyen los topics con contenido: /blog/categoria/[slug]
  // se marca noindex cuando está vacío, así que emitirlos daría soft-404.
  const articlesByTopic = new Map<string, typeof articles>();
  for (const a of articles) {
    if (!a.topic || !(a.topic in TOPIC_TO_URL_SLUG)) continue;
    const bucket = articlesByTopic.get(a.topic) ?? [];
    bucket.push(a);
    articlesByTopic.set(a.topic, bucket);
  }

  const categoryUrls: MetadataRoute.Sitemap = [...articlesByTopic.entries()].map(
    ([topic, items]) => ({
      url: `${SITE_URL}/blog/categoria/${TOPIC_TO_URL_SLUG[topic as ArticleTopic]}`,
      lastModified: newestDate(items),
      priority: 0.7,
    })
  );

  // /blog index — solo si hay artículos publicados (evita soft-404).
  // lastModified = artículo más reciente, no "ahora".
  const blogIndexUrl: MetadataRoute.Sitemap =
    articleUrls.length > 0
      ? [
          {
            url: `${SITE_URL}/blog`,
            lastModified: newestDate(articles),
            priority: 0.8,
          },
        ]
      : [];

  // /glosario index — solo si hay términos publicados
  const glossaryIndexUrl: MetadataRoute.Sitemap =
    glossaryUrls.length > 0
      ? [
          {
            url: `${SITE_URL}/glosario`,
            lastModified: newestDate(data?.glossaryTerms ?? []),
            priority: 0.7,
          },
        ]
      : [];

  // /recursos (hub) y /recursos/documentos (biblioteca de aseguradoras).
  // Ambas SIEMPRE presentes: sirven contenido estático estable e indexable
  // aunque no haya un solo recurso en Sanity — el hub reúne artículos,
  // glosario y guías, y la biblioteca tiene los canales de WhatsApp, los
  // folders de OneDrive con condiciones generales y los buscadores de médicos.
  //
  // El hub va sin lastModified a propósito: su frescura no depende de los
  // documentos de aseguradoras, y un lastmod que no corresponde degrada la
  // confianza en el sitemap completo.
  const recursosIndexUrl: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/recursos`,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/recursos/documentos`,
      lastModified: newestDate(data?.resources ?? []),
      priority: 0.8,
    },
  ];

  return [
    ...staticUrls,
    ...blogIndexUrl,
    ...categoryUrls,
    ...glossaryIndexUrl,
    ...recursosIndexUrl,
    ...serviceUrls,
    ...articleUrls,
    ...glossaryUrls,
    ...resourceUrls,
  ];
}
