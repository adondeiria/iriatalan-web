/**
 * Layout de /cabina: herramienta interna de Iria, no página del sitio.
 *
 * Nota honesta: en App Router un layout anidado NO escapa del layout raíz —
 * la página hereda header, footer y banner de cookies del sitio. Se aceptó a
 * propósito: extraer el marketing a un route group solo para esta pantalla
 * sería un refactor del sitio completo por una URL que solo ve Iria.
 *
 * Lo que SÍ aporta este layout: el noindex de metadata (que se suma al
 * X-Robots-Tag de next.config.ts, mismo patrón defense-in-depth que /studio)
 * y un título propio fuera del template SEO del sitio.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabina RIF",
  robots: { index: false, follow: false },
};

export default function CabinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
