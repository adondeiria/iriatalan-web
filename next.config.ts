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
  // 301 redirects from legacy WordPress URLs.
  // Google sitelinks still point to /quienes-somos and /servicios (404 on new site).
  async redirects() {
    return [
      { source: "/quienes-somos", destination: "/sobre-iria", permanent: true },
      { source: "/quienes-somos/", destination: "/sobre-iria", permanent: true },
      { source: "/servicios", destination: "/", permanent: true },
      { source: "/servicios/", destination: "/", permanent: true },
      { source: "/contacto", destination: "/", permanent: true },
      { source: "/contacto/", destination: "/", permanent: true },
      // Legacy service pages — best-effort mapping
      { source: "/seguros-gastos-medicos", destination: "/gmm", permanent: true },
      { source: "/seguros-gastos-medicos/", destination: "/gmm", permanent: true },
      { source: "/retiro-y-pensiones", destination: "/retiro", permanent: true },
      { source: "/retiro-y-pensiones/", destination: "/retiro", permanent: true },
    ];
  },
};

export default nextConfig;
