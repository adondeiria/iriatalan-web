import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF primero (30-50% más ligero que WebP); el optimizador negocia por
    // header Accept. Cache de 31 días para no re-transformar en cada miss.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    // Calidades permitidas: 75 default (escenas), 82/85 para héroes con rostros
    // (el retrato mostraba artefactos a 75). Next 16 exige declararlas.
    qualities: [75, 82, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      // Miniaturas de YouTube para el facade de video en artículos.
      // Pasarlas por el optimizador (en vez de un <img> directo) hace que el
      // navegador NUNCA contacte a YouTube antes del clic: la trae el servidor.
      // Eso mantiene el embed del lado correcto del banner de consentimiento.
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  // X-Robots-Tag noindex defense-in-depth para Sanity Studio.
  // Robots.txt es declarativo (crawlers pueden ignorarlo); el header HTTP
  // es enforcement directo y se respeta universalmente.
  async headers() {
    return [
      {
        source: "/studio/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
      {
        source: "/studio",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },

  // 301 redirects from legacy WordPress URLs.
  // Google sitelinks still point to /quienes-somos and /servicios (404 on new site).
  async redirects() {
    return [
      { source: "/quienes-somos", destination: "/sobre-iria", permanent: true },
      { source: "/quienes-somos/", destination: "/sobre-iria", permanent: true },
      { source: "/servicios", destination: "/", permanent: true },
      { source: "/servicios/", destination: "/", permanent: true },
      // /contacto tiene página propia — sin redirect
      // Legacy service pages — best-effort mapping
      { source: "/seguros-gastos-medicos", destination: "/gmm", permanent: true },
      { source: "/seguros-gastos-medicos/", destination: "/gmm", permanent: true },
      { source: "/retiro-y-pensiones", destination: "/retiro", permanent: true },
      { source: "/retiro-y-pensiones/", destination: "/retiro", permanent: true },
      // Additional WordPress sitelinks captured from Google SERP (2026-05-07)
      { source: "/soy-cliente", destination: "/recursos", permanent: true },
      { source: "/soy-cliente/", destination: "/recursos", permanent: true },
      // /clientes — descubierto por firecrawl 2026-05-10 (Google sigue indexándola)
      { source: "/clientes", destination: "/recursos", permanent: true },
      { source: "/clientes/", destination: "/recursos", permanent: true },
      // /clientes-resp — portal-cliente WP viejo, rastreada sin indexar (GSC 2026-07)
      { source: "/clientes-resp", destination: "/recursos", permanent: true },
      { source: "/clientes-resp/", destination: "/recursos", permanent: true },
      { source: "/our-services", destination: "/", permanent: true },
      { source: "/our-services/", destination: "/", permanent: true },
      { source: "/hablemos", destination: "/", permanent: true },
      { source: "/hablemos/", destination: "/", permanent: true },
      // English variants commonly indexed
      { source: "/about-us", destination: "/sobre-iria", permanent: true },
      { source: "/about-us/", destination: "/sobre-iria", permanent: true },
      { source: "/about-our-company", destination: "/sobre-iria", permanent: true },
      { source: "/about-our-company/", destination: "/sobre-iria", permanent: true },
      { source: "/contact", destination: "/contacto", permanent: true },
      { source: "/contact/", destination: "/contacto", permanent: true },
      { source: "/contact-us", destination: "/contacto", permanent: true },
      { source: "/contact-us/", destination: "/contacto", permanent: true },
      { source: "/english", destination: "/", permanent: true },
      { source: "/english/", destination: "/", permanent: true },
      // Restructure 2026-05-10: 4 nichos movidos bajo /personas/* para
      // crear topical hub. Preservar SEO con 308 (=301 SEO-equivalente).
      { source: "/mexicanos-en-el-extranjero", destination: "/personas/mexicanos-en-el-extranjero", permanent: true },
      { source: "/mexicanos-en-el-extranjero/", destination: "/personas/mexicanos-en-el-extranjero", permanent: true },
      { source: "/hijos-neurodivergentes", destination: "/personas/hijos-neurodivergentes", permanent: true },
      { source: "/hijos-neurodivergentes/", destination: "/personas/hijos-neurodivergentes", permanent: true },
      { source: "/familias-arcoiris", destination: "/personas/familias-arcoiris", permanent: true },
      { source: "/familias-arcoiris/", destination: "/personas/familias-arcoiris", permanent: true },
      { source: "/mujeres", destination: "/personas/mujeres", permanent: true },
      { source: "/mujeres/", destination: "/personas/mujeres", permanent: true },
      // WordPress demo/template posts indexados (descubierto en Search Console
      // 2026-06-04). Contenido genérico de plantilla en inglés que Google sigue
      // sirviendo como 404 — 571 impresiones/3meses perdidas. Redirect a destino
      // temático o home. /aka-si-trais omitido: patrón de spam, no vale redirect.
      { source: "/hello-world", destination: "/", permanent: true },
      { source: "/hello-world/", destination: "/", permanent: true },
      { source: "/how-to-become-a-better-leader-in-new-workplace", destination: "/", permanent: true },
      { source: "/how-to-become-a-better-leader-in-new-workplace/", destination: "/", permanent: true },
      { source: "/how-to-go-freelance-your-step-by-step-guide", destination: "/", permanent: true },
      { source: "/how-to-go-freelance-your-step-by-step-guide/", destination: "/", permanent: true },
      { source: "/what-consumers-want-from-businesses", destination: "/empresas", permanent: true },
      { source: "/what-consumers-want-from-businesses/", destination: "/empresas", permanent: true },
      { source: "/giving-buyers-more-options-with-financing", destination: "/", permanent: true },
      { source: "/giving-buyers-more-options-with-financing/", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
