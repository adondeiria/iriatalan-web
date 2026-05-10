import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
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
    ];
  },
};

export default nextConfig;
