import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — política explícita de crawling.
 * User-agents LLM verificados contra documentación oficial mayo 2026.
 * Permitimos crawlers de búsqueda IA (queremos ser citados); bloqueamos
 * /studio y /api por seguridad.
 */
export default function robots(): MetadataRoute.Robots {
  const llmAllowedAgents = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "Bytespider",
    "FacebookBot",
    "Amazonbot",
    "Cohere-AI",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/api/", "/_next/static/"],
      },
      ...llmAllowedAgents.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/studio", "/api/", "/_next/static/"],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
