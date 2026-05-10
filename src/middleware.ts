import { NextResponse } from "next/server";

/**
 * Devuelve HTTP 410 Gone para paths heredados de WordPress que ya no existen.
 * 410 le indica a Google que la URL fue removida permanentemente — acelera
 * la deindexación vs un 404 (que Google reintenta crawlear durante meses).
 *
 * Importante: las URLs con redirect 301/308 en next.config.ts se procesan
 * ANTES del middleware, así que esto solo aplica a paths sin redirect.
 */
const GONE_BODY =
  "Gone — esta página fue removida del sitio. Visita https://iriatalan.com.mx para el contenido actual.";

function gone() {
  return new NextResponse(GONE_BODY, {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export function middleware() {
  return gone();
}

export const config = {
  matcher: [
    "/tag/:path*",
    "/category/:path*",
    "/author/:path*",
    "/wp-admin/:path*",
    "/wp-content/:path*",
    "/wp-includes/:path*",
    "/wp-login.php",
    "/xmlrpc.php",
    "/feed/:path*",
    "/comments/feed/:path*",
    "/sample-page",
    "/hello-world",
    "/videos",
    "/videos/:path*",
    // Posts demo lorem-ipsum del theme WP — descubiertos via firecrawl 2026-05-10.
    // Google sigue indexándolos como 404 soft; 410 Gone acelera deindex.
    "/what-consumers-want-from-businesses",
    "/giving-buyers-more-options-with-financing",
    "/how-to-go-freelance-your-step-by-step-guide",
    "/seven-ways-to-handle-unexpected-expenses-and-financial-emergencies",
  ],
};
