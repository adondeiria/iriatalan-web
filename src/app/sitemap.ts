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
  { path: "/mujeres", priority: 0.85 },
  { path: "/familias-arcoiris", priority: 0.85 },
  { path: "/hijos-neurodivergentes", priority: 0.85 },
  { path: "/recursos", priority: 0.8 },
  { path: "/blog", priority: 0.8 },
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

  const serviceUrls: MetadataRoute.Sitemap =
    data?.services?.map((s) => ({
      url: `${SITE_URL}/${s.slug}`,
      lastModified: new Date(s._updatedAt),
      priority: 0.9,
    })) ?? [];

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

  return [...staticUrls, ...serviceUrls, ...articleUrls, ...resourceUrls];
}
