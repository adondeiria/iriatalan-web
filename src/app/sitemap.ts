import type { MetadataRoute } from "next";

import { sanityFetch } from "../../sanity/lib/fetch";
import { SITEMAP_QUERY } from "../../sanity/lib/queries";
import { SITE_URL } from "@/lib/seo";

type SitemapData = {
  services: Array<{ slug: string; _updatedAt: string }>;
  articles: Array<{ slug: string; _updatedAt: string; publishedAt?: string }>;
  resources: Array<{ slug: string; _updatedAt: string }>;
} | null;

const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1.0 },
  { path: "/sobre-iria", priority: 0.9 },
  { path: "/retiro", priority: 0.9 },
  { path: "/gmm", priority: 0.9 },
  { path: "/empresas", priority: 0.9 },
  { path: "/patrimonial", priority: 0.9 },
  { path: "/personas", priority: 0.9 },
  { path: "/personas/mujeres", priority: 0.85 },
  { path: "/personas/familias-arcoiris", priority: 0.85 },
  { path: "/personas/hijos-neurodivergentes", priority: 0.85 },
  { path: "/personas/mexicanos-en-el-extranjero", priority: 0.85 },
  { path: "/foreigners-in-mexico", priority: 0.85 },
  { path: "/recursos", priority: 0.8 },
  { path: "/contacto", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await sanityFetch<SitemapData>({
    query: SITEMAP_QUERY,
    revalidate: 3600,
  }).catch(() => null);

  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    priority: r.priority,
  }));

  // Dedupe contra rutas estáticas: si Sanity tiene un service con slug
  // "gmm", "retiro", etc., evita emitir la URL dos veces (Next.js sirve
  // la ruta estática en /gmm — la URL dinámica nunca se renderizaría).
  const staticPaths = new Set(STATIC_ROUTES.map((r) => r.path));
  const serviceUrls: MetadataRoute.Sitemap =
    data?.services
      ?.filter((s) => !staticPaths.has(`/${s.slug}`))
      .map((s) => ({
        url: `${SITE_URL}/${s.slug}`,
        lastModified: new Date(s._updatedAt),
        priority: 0.9,
      })) ?? [];

  // /blog/[slug] y /recursos/[slug] ya existen como rutas dinámicas con
  // generateStaticParams, así que es seguro emitir las URLs desde Sanity.
  const articleUrls: MetadataRoute.Sitemap =
    data?.articles?.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a._updatedAt),
      priority: 0.7,
    })) ?? [];

  const resourceUrls: MetadataRoute.Sitemap =
    data?.resources?.map((r) => ({
      url: `${SITE_URL}/recursos/${r.slug}`,
      lastModified: new Date(r._updatedAt),
      priority: 0.6,
    })) ?? [];

  // Index /blog se agrega solo si hay artículos publicados; evita exponer
  // la página "Próximamente" como soft-404 mientras la biblioteca esté vacía.
  const blogIndexUrl: MetadataRoute.Sitemap =
    articleUrls.length > 0
      ? [
          {
            url: `${SITE_URL}/blog`,
            lastModified: now,
            priority: 0.8,
          },
        ]
      : [];

  return [
    ...staticUrls,
    ...blogIndexUrl,
    ...serviceUrls,
    ...articleUrls,
    ...resourceUrls,
  ];
}
