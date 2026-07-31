/**
 * Helpers compartidos de /recursos — taxonomía de documentos de aseguradoras,
 * rutas reservadas del hub y definición de las tarjetas temáticas.
 *
 * Importado por:
 *  - /recursos/page.tsx                     (hub — centro de recursos)
 *  - /recursos/documentos/page.tsx          (biblioteca de aseguradoras)
 *  - /recursos/documentos/[slug]/page.tsx   (detalle de un documento)
 *  - /sitemap.ts
 *
 * CATEGORY_LABELS y PRODUCT_LINE_LABELS deben mantenerse sincronizados con los
 * enums `category` y `productLine` de sanity/schemas/resource.ts. Están tipados
 * como Record exhaustivo a propósito: si Sanity gana un valor nuevo y aquí falta
 * la etiqueta, el compilador avisa.
 */

import type { ArticleTopic } from "@/lib/blog";

// =========================================================
// TAXONOMÍA DE DOCUMENTOS
// =========================================================

export type ResourceCategory =
  | "condiciones_generales"
  | "formato_reclamacion"
  | "formato_alta_baja"
  | "cuadro_medico"
  | "tabulador"
  | "folleto_producto"
  | "guia_usuario"
  | "aviso_privacidad"
  | "otro";

export type ResourceProductLine =
  | "vida"
  | "gmm"
  | "vida_grupo"
  | "gmm_empresarial"
  | "autos"
  | "dano_hogar"
  | "retiro"
  | "educacional"
  | "otro";

export const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  condiciones_generales: "Condiciones Generales",
  formato_reclamacion: "Formato de Reclamación",
  formato_alta_baja: "Formato Alta / Baja",
  cuadro_medico: "Cuadro Médico / Red Hospitalaria",
  tabulador: "Tabulador / Tarifas",
  folleto_producto: "Folleto Producto",
  guia_usuario: "Guía de Usuario",
  aviso_privacidad: "Aviso de Privacidad",
  otro: "Otro",
};

export const PRODUCT_LINE_LABELS: Record<ResourceProductLine, string> = {
  vida: "Vida individual",
  gmm: "GMM individual",
  vida_grupo: "Vida grupo",
  gmm_empresarial: "GMM empresarial",
  autos: "Autos",
  dano_hogar: "Daños / Hogar",
  retiro: "Retiro / AFORE",
  educacional: "Educacional",
  otro: "—",
};

/**
 * Los valores llegan de GROQ como `string`, no como el union tipado. Estos
 * accesores absorben ese borde en un solo lugar y replican el `?? value` que
 * antes estaba repetido en cuatro sitios entre las dos páginas.
 */
export function categoryLabel(value?: string | null): string {
  if (!value) return "";
  return CATEGORY_LABELS[value as ResourceCategory] ?? value;
}

export function productLineLabel(value?: string | null): string {
  if (!value) return "";
  return PRODUCT_LINE_LABELS[value as ResourceProductLine] ?? value;
}

/** Campos comunes al listado y al detalle de un `resource` de Sanity. */
export type ResourceBase = {
  _id: string;
  title: string;
  slug: string;
  carrier: string;
  category: string;
  productLine: string;
  year?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  externalUrl?: string | null;
  seoDescription?: string | null;
};

export function formatFileSize(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

/** Archivo propio si existe; si no, el enlace externo del carrier. */
export function getDownloadUrl(r: {
  fileUrl?: string | null;
  externalUrl?: string | null;
}): string | null {
  return r.fileUrl ?? r.externalUrl ?? null;
}

// =========================================================
// RUTAS RESERVADAS
// =========================================================

/**
 * Slugs de primer nivel bajo /recursos que son rutas fijas del hub y por tanto
 * NO pueden usarse como slug de un documento de Sanity.
 *
 * Hoy el detalle vive en /recursos/documentos/[slug], así que no hay ruta
 * dinámica hermana de estas secciones y la colisión es imposible por
 * construcción. Se conserva la lista como red de seguridad para el día en que
 * alguien reintroduzca un `[slug]` directo bajo /recursos: en Next la ruta
 * estática gana siempre sobre la dinámica, así que el documento quedaría
 * inalcanzable *y* aparecería en el sitemap — un fallo completamente silencioso.
 */
export const RESERVED_RECURSOS_SLUGS: readonly string[] = [
  "documentos",
  "herramientas",
  "guias",
];

export function isReservedRecursoSlug(slug: string): boolean {
  return RESERVED_RECURSOS_SLUGS.includes(slug);
}

// =========================================================
// TARJETAS TEMÁTICAS DEL HUB
// =========================================================

/**
 * Una tarjeta de "¿Qué quieres resolver?".
 *
 * `topic` decide el destino primario: si ese topic tiene artículos publicados,
 * la tarjeta lleva al hub de categoría del blog; si no, cae a `pillar`. Así
 * ninguna tarjeta manda a una categoría vacía —  esas páginas se marcan
 * noindex y no se emiten al sitemap (ver sitemap.ts), o sea que enlazarlas
 * desde aquí sería mandar tráfico a un callejón sin salida.
 *
 * Este array es la fuente única de las tarjetas Y del ItemList del JSON-LD del
 * hub, para que lo declarado no pueda divergir de lo visible.
 */
export type RecursoHubItem = {
  /** Clave estable para React y para depurar; no se muestra. */
  key: string;
  title: string;
  description: string;
  /** Topic del blog. Si tiene artículos, manda a /blog/categoria/{slug}. */
  topic?: ArticleTopic;
  /** Página comercial pilar. Destino de respaldo y enlace secundario. */
  pillar: { label: string; href: string };
};

export const RECURSOS_HUB_ITEMS: readonly RecursoHubItem[] = [
  {
    key: "retiro",
    title: "Planeación de retiro",
    description:
      "PPR, Modalidad 40, AFORE, deducciones y rentas vitalicias.",
    topic: "retiro",
    pillar: { label: "Ver planeación de retiro", href: "/retiro" },
  },
  {
    key: "gmm",
    title: "Gastos médicos mayores",
    description:
      "Deducible, coaseguro, maternidad, hospitales y cobertura en el extranjero.",
    topic: "gmm",
    pillar: { label: "Ver gastos médicos mayores", href: "/gmm" },
  },
  {
    key: "vida",
    title: "Vida y sucesión",
    description:
      "Beneficiarios, testamento, fideicomisos y liquidez para tu familia.",
    // El cuerpo editorial de este tema vive bajo `patrimonial` (testamento,
    // ST-6, hijo con discapacidad), no bajo `vida`, que hoy no tiene artículos.
    topic: "patrimonial",
    pillar: { label: "Ver seguros de vida", href: "/seguros-vida" },
  },
  {
    key: "familia",
    title: "Hijos y familia",
    description:
      "Universidad, neurodivergencia, discapacidad y planeación de largo plazo.",
    topic: "educacionales",
    pillar: {
      label: "Ver hijos neurodivergentes",
      href: "/personas/hijos-neurodivergentes",
    },
  },
  {
    key: "empresas",
    title: "Empresas y socios",
    description:
      "Persona clave, acuerdos entre socios, vida grupo y continuidad.",
    topic: "empresas",
    pillar: { label: "Ver soluciones para empresas", href: "/empresas" },
  },
  {
    key: "internacional",
    title: "Mexicanos en el extranjero",
    description:
      "Pólizas mexicanas, protección en dólares y cobertura entre países.",
    // Sin topic propio: el material de este tema está repartido entre `gmm` y
    // `patrimonial`. La página de audiencia es el mejor destino único.
    pillar: {
      label: "Ver mexicanos en el extranjero",
      href: "/personas/mexicanos-en-el-extranjero",
    },
  },
];

export const RECURSOS_HUB_DESCRIPTION =
  "Guías, artículos, herramientas y documentos oficiales para entender tus " +
  "seguros, planear tu retiro y proteger tu patrimonio con mayor claridad.";
