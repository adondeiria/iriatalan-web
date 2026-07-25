import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — política explícita de crawling.
 *
 * Esto era `src/app/robots.ts` con `MetadataRoute.Robots`. Se movió a un Route
 * Handler por una sola razón: el tipo de Next solo admite `rules`, `sitemap` y
 * `host`, y no hay forma de emitir una línea propia que apunte a `/llms.txt`.
 * Un agente de IA que lee robots.txt no tiene cómo enterarse de que existe el
 * archivo que le explica el sitio.
 *
 * La salida es idéntica a la que generaba Next (verificada contra el
 * robots.txt en producción) más el bloque de comentarios inicial. Los
 * comentarios con `#` son parte del estándar y los parsers los ignoran, así
 * que la política de crawling no cambia.
 *
 * User-agents LLM verificados contra documentación oficial mayo 2026.
 * Permitimos crawlers de búsqueda IA (queremos ser citados); bloqueamos
 * /studio y /api por seguridad.
 */

export const dynamic = "force-static";

const LLM_ALLOWED_AGENTS = [
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

const DISALLOW = ["/studio", "/api/", "/_next/static/"];

function bloque(userAgent: string): string {
  return [
    `User-Agent: ${userAgent}`,
    "Allow: /",
    ...DISALLOW.map((p) => `Disallow: ${p}`),
  ].join("\n");
}

export function GET() {
  const cuerpo = [
    `# Guía para agentes de IA: ${SITE_URL}/llms.txt`,
    "# Resumen del sitio, temas cubiertos y credenciales de la asesora,",
    "# en formato pensado para LLMs.",
    "",
    // Cada bloque lleva su propio \n para que queden separados por línea en blanco.
    ...["*", ...LLM_ALLOWED_AGENTS].map((ua) => `${bloque(ua)}\n`),
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(cuerpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
