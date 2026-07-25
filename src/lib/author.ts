import type { AuthorData } from "@/lib/seo";

/**
 * Autor de respaldo cuando Sanity no responde.
 *
 * Vive aquí (y no dentro de una página) porque el grafo JSON-LD global del
 * layout emite los nodos `Person` y `FinancialService` en TODAS las páginas:
 * las páginas de servicio referencian esos `@id` desde su campo `provider`, y
 * un `@id` que no existe en el mismo documento no lo resuelven los crawlers.
 * Si el fetch de autor fallara y no hubiera respaldo, esas referencias
 * quedarían colgando y se perdería la atribución E-E-A-T justo en las páginas
 * que venden.
 *
 * Datos confirmados 2026-05-09. Si cambian, la fuente de verdad es el
 * documento `author` en Sanity — esto solo entra cuando la query falla.
 */
export const FALLBACK_AUTHOR: AuthorData = {
  name: "Iria Talan",
  alternateName: "Iria Talán",
  title: "Asesora Financiera RIF · Especialista en Seguros de Vida y GMM",
  bio: "Asesora financiera con 18 años acompañando a familias afluentes y patrimonios complejos en México. Reconocida por la calidad del cuidado, no por volumen. Miembro MDRT desde 2008 — Court of the Table 2023 · Top of the Table 2024 · Court of the Table 2025 — élite mundial de la industria de seguros. AMASFAC 8vo Lugar Nacional. Asesora Diamante GNP y Seguros Monterrey NYL.",
  awards: [
    "Million Dollar Round Table (MDRT) — Miembro desde 2008",
    "MDRT Court of the Table (COT) 2023",
    "MDRT Top of the Table (TOT) 2024",
    "MDRT Court of the Table (COT) 2025",
    "AMASFAC — 8vo Lugar Nacional",
    "GNP Seguros — Asesora Diamante",
    "Seguros Monterrey New York Life — Asesora Diamante",
  ],
  carriers: ["BUPA", "MetLife", "Allianz", "Seguros Monterrey NYL", "AXA", "GNP"],
  specialties: [
    "Seguros de Vida",
    "Gastos Médicos Mayores",
    "Planeación Patrimonial",
    "Fideicomisos",
    "Planes Educacionales",
    "Retiro y Pensiones",
  ],
  languages: ["Español", "English"],
  credentials: [
    { title: "Miembro MDRT desde 2008 · Court of the Table 2023 · Top of the Table 2024 · Court of the Table 2025", issuer: "Million Dollar Round Table — élite mundial de la industria de seguros", category: "industria" },
    { title: "8vo Lugar Nacional", issuer: "AMASFAC (Asoc. Mexicana de Asesores en Seguros y Fianzas)", category: "industria" },
    { title: "Asesora Diamante", issuer: "GNP Seguros", category: "carrier" },
    { title: "Asesora Diamante", issuer: "Seguros Monterrey New York Life", category: "carrier" },
    { title: "Wealth Management Theory & Practice", issuer: "Yale School of Management — Executive Education", year: "2019", category: "academica" },
    { title: "MBA Essentials", issuer: "London School of Economics — Executive Education", category: "academica" },
    { title: "Ingeniera Mecánica Administradora", issuer: "Tecnológico de Monterrey", category: "academica" },
    { title: "Diplomado en Análisis Financiero", issuer: "Bolsa Mexicana de Valores", category: "regulatoria" },
    { title: "Asesora Autorizada · Cédula V388618", issuer: "Comisión Nacional de Seguros y Fianzas (CNSF)", year: "2008", url: "https://agentesajustadores.cnsf.gob.mx/", category: "regulatoria" },
  ],
  officeAddress: "Bosque de Chapultepec, Ciudad de México",
  socialLinks: {},
};
