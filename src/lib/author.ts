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
  bio: "Asesora financiera con 18 años acompañando a familias afluentes y patrimonios complejos en México. Formada en Wealth Management Theory & Practice por Yale School of Management (Executive Education) y en MBA Essentials por London School of Economics. Reconocida por la calidad del cuidado, no por volumen: Top of the Table en MDRT y 8vo Lugar Nacional AMASFAC. Asesora Diamante GNP y Seguros Monterrey NYL.",
  /**
   * ORDEN DELIBERADO: la formación va primero.
   *
   * Decisión de Iria — un cliente reconoce "Yale" al instante y "Top of the
   * Table" solo dentro del gremio, así que abrir con la credencial que nadie
   * identifica desperdicia el primer renglón, que es el que más se lee y el que
   * los motores de IA suelen citar recortado.
   *
   * Yale y LSE se nombran SIEMPRE con "Executive Education": son programas
   * ejecutivos, no títulos de posgrado, y presentarlos sin el calificador
   * insinuaría un grado que no existe. Es la misma cautela que ya se aplicaba al
   * LSE ("curso ejecutivo, no MBA").
   *
   * MDRT no desaparece, baja a segundo: es la señal de autoridad específica del
   * sector, que es lo que la evaluación YMYL pondera.
   */
  awards: [
    "Wealth Management Theory & Practice — Yale School of Management (Executive Education), 2019",
    "MBA Essentials — London School of Economics (Executive Education), 2023",
    // Con año: `awards` es registro para máquinas (Person.award del JSON-LD),
    // donde la precisión pesa más que la óptica de frescura. En prosa el año se
    // omite a propósito, para que la frase no envejezca.
    "MDRT Top of the Table (TOT) 2024 — Million Dollar Round Table",
    "Million Dollar Round Table (MDRT) — Miembro desde 2008",
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
  // El orden de este arreglo decide el orden de los grupos en /sobre-iria: la
  // página agrupa por `category` respetando la primera aparición. Educación va
  // primero a propósito (ver la nota de `awards`).
  credentials: [
    { title: "Wealth Management Theory & Practice", issuer: "Yale School of Management — Executive Education", year: "2019", category: "academica" },
    { title: "MBA Essentials", issuer: "London School of Economics — Executive Education (curso ejecutivo, no MBA)", year: "2023", category: "academica" },
    { title: "Ingeniera Mecánica Administradora", issuer: "Tecnológico de Monterrey", year: "2004", category: "academica" },
    { title: "Miembro MDRT desde 2008 · Top of the Table 2024", issuer: "Million Dollar Round Table — nivel más alto de la élite mundial de la industria de seguros", category: "industria" },
    // 2024, no 2025: el Trofeo del 2025 aún no se entrega. Ponerlo antes sería
    // afirmar un reconocimiento no recibido. Cuando se confirme, se agrega.
    { title: "8vo Lugar Nacional — Trofeo AMASFAC", issuer: "AMASFAC (Asociación Mexicana de Agentes de Seguros y Fianzas)", year: "2024", category: "industria" },
    { title: "Asesora Diamante", issuer: "GNP Seguros", year: "Desde 2016", category: "carrier" },
    { title: "Asesora Diamante", issuer: "Seguros Monterrey New York Life", year: "Desde 2008", category: "carrier" },
    // Regulatorio al final, como estaba: la cédula es el cierre que respalda todo
    // lo anterior. El diplomado BMV vive en esta categoría desde antes; si se
    // moviera arriba arrastraría a la cédula con él, porque la página agrupa por
    // la primera aparición de cada categoría.
    { title: "Diplomado en Análisis Financiero", issuer: "Bolsa Mexicana de Valores", year: "2015", category: "regulatoria" },
    { title: "Asesora Autorizada · Cédula V388618", issuer: "Comisión Nacional de Seguros y Fianzas (CNSF)", year: "Desde 2008", url: "https://agentesajustadores.cnsf.gob.mx/", category: "regulatoria" },
  ],
  // Tiene que coincidir con `officeAddress` del autor en Sanity: este fallback
  // solo entra si el fetch falla, y si dijera otra cosa la dirección cambiaría
  // sola en el JSON-LD (LocalBusiness.streetAddress) durante una caída.
  //
  // SIN número interior, en ninguna superficie: sitio, JSON-LD, llms.txt, aviso de
  // privacidad y ficha de Google Business dicen exactamente lo mismo. El NAP
  // (nombre, dirección, teléfono) es como Google confirma que la ficha y el sitio
  // son el mismo negocio, así que una sola forma de la dirección, sin variantes.
  officeAddress: "Homero 205, Col. Polanco V Secc, Miguel Hidalgo, CDMX 11560",
  // Los dos números son distintos a propósito: `whatsapp` es el WABA conectado a
  // respond.io (solo chat, no recibe llamadas) y `phone` es la línea de voz del
  // `tel:` del footer. Antes esto estaba vacío, así que durante una caída de
  // Sanity el `telephone` del JSON-LD se emitía sin valor — justo el dato que
  // Google cruza con la ficha de Google Business.
  socialLinks: {
    whatsapp: "+525526786325",
    phone: "+525512683401",
    email: "soporte@talan.com.mx",
  },
};
