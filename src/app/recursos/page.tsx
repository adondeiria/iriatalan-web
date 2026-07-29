import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { RESOURCES_LIST_QUERY } from "../../../sanity/lib/queries";
import { buildBreadcrumbSchema, buildGraph, SITE_URL } from "@/lib/seo";

type ResourceItem = {
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

type SearchParams = Promise<{
  carrier?: string;
  category?: string;
  productLine?: string;
}>;

const CATEGORY_LABELS: Record<string, string> = {
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

const PRODUCT_LINE_LABELS: Record<string, string> = {
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

type WhatsAppChannel = {
  carrier: string;
  ramo: string;
  url: string;
};

const WHATSAPP_CHANNELS: WhatsAppChannel[] = [
  { carrier: "BUPA",                              ramo: "Médico",                  url: "https://whatsapp.com/channel/0029VaGVom8GehELQJ7iCA2v" },
  { carrier: "GNP",                               ramo: "Médico + Seguros Autos",  url: "https://whatsapp.com/channel/0029VaBhwM6Dp2Q4uSPaB92l" },
  { carrier: "Seguros Monterrey New York Life",   ramo: "Médico",                  url: "https://whatsapp.com/channel/0029VaGvIyNAYlUPmGEDFQ2p" },
  { carrier: "AXA",                               ramo: "Médico + Seguros Autos",  url: "https://whatsapp.com/channel/0029VaBbyzT0LKZCIHeDxz1p" },
  { carrier: "MetLife",                           ramo: "Vida + GMM",              url: "https://whatsapp.com/channel/0029VaCLFhMAe5Vps0msnG3D" },
  { carrier: "Allianz",                           ramo: "Seguros Autos",           url: "https://whatsapp.com/channel/0029VaQkrFJLNSZyWtUvKq41" },
];

type ResourceFolderRamo = "gmm" | "autos";

type ResourceFolder = {
  carrier: string;
  ramo: ResourceFolderRamo;
  linea: string;
  folderUrl: string | null;
};

const RAMO_LABELS: Record<ResourceFolderRamo, string> = {
  gmm: "Gastos Médicos Mayores",
  autos: "Seguros Autos",
};

const RAMO_ORDER: ResourceFolderRamo[] = ["gmm", "autos"];

// Orden custom para mostrar aseguradoras en la página /recursos. Cualquier
// carrier no listado aquí (ej. nuevo) cae al final del bloque.
const CARRIER_ORDER: string[] = [
  "GNP",
  "Seguros Monterrey New York Life",
  "BUPA",
  "AXA",
  "MetLife",
  "Allianz",
  "Red Enlace",
];

// Cada entrada apunta a un folder de OneDrive compartido como
// "Cualquier persona con el vínculo · Puede ver". Si folderUrl es null,
// la card se muestra como "Próximamente". Para agregar/actualizar:
// generar link en OneDrive (Compartir → ⚙ → Cualquier persona → Puede
// ver → Aplicar → Copiar) y pegar el URL aquí.
const RESOURCE_FOLDERS: ResourceFolder[] = [
  // GMM · AXA
  { carrier: "AXA",        ramo: "gmm",   linea: "Internacional",           folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgDuzvDNJdNtS7aoz1f3bM37ATWhoRwcexii6NbnmZOihns?e=laZo1o" },
  { carrier: "AXA",        ramo: "gmm",   linea: "Nacional",                folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgAr9H8A8RElR7E0v6YH4tDuARFbGPEoZ5Ei4XsVgCBqb6s?e=MkhqeD" },
  { carrier: "AXA",        ramo: "gmm",   linea: "Planmed Keralty",         folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgBG0AOOENTaIIDFAQIAAAAAATQh3abCpqc7ZDmyV_HyFRI?e=yJPdM8" },
  // GMM · BUPA
  { carrier: "BUPA",       ramo: "gmm",   linea: "Internacional",           folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgBG0AOOENTaIIDFzgEAAAAAAQPRu0tjwFpJdkMhyrcoIW0?e=OQmvK4" },
  { carrier: "BUPA",       ramo: "gmm",   linea: "Nacional",                folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgBG0AOOENTaIIDFzwEAAAAAAYFY8eOzCCTNjbElMhC_Kp4?e=t2V2AL" },
  // GMM · GNP
  { carrier: "GNP",        ramo: "gmm",   linea: "Internacional",           folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgArcdqbYL-hSYe79V5zO0u7AXF8nNF5YMFcVlnsquaUqcE?e=vjhX3n" },
  { carrier: "GNP",        ramo: "gmm",   linea: "Nacional",                folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgDuNQ_prE8eRbFLBeTHUlVuAc_b3tRyJT-aD9SQG3pUuww?e=1I578h" },
  // GMM · MetLife
  { carrier: "MetLife",    ramo: "gmm",   linea: "Planes Nacionales",       folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgBG0AOOENTaIIDFqwEAAAAAAbVrwl-oOjWZDZJt-8TBKgo?e=8WpDx2" },
  // GMM · Red Enlace
  { carrier: "Red Enlace", ramo: "gmm",   linea: "Contrato y siniestros",   folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgCii_lE-gCcRrW-ey338tncAeyGCuYsUn1utAiirnhPEtQ?e=URHnwo" },
  // GMM · Seguros Monterrey New York Life
  { carrier: "Seguros Monterrey New York Life", ramo: "gmm",   linea: "Alfa Medical",            folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgBG0AOOENTaIIDFIgMAAAAAARJLL2TixXjBsXEAC9M-ig8?e=pJ8yhB" },
  // Autos · Allianz
  { carrier: "Allianz",    ramo: "autos", linea: "Condiciones y folletos",  folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgCZtxbwUopBRZZFJDxL4K63AWTpy3XrxNR1eEP6gKhJwNs?e=4UFdj7" },
  // Autos · AXA
  { carrier: "AXA",        ramo: "autos", linea: "Condiciones y folletos",  folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgCyqHai2b7GRbxOQkLM69GvAY_HzsFMIV43V_qxuJgstk4?e=IepI6B" },
  // Autos · GNP
  { carrier: "GNP",        ramo: "autos", linea: "Condiciones y folletos",  folderUrl: "https://1drv.ms/f/c/c5dad4108e03d046/IgA6_3y9j0dlR5wAhH6wFNV_AVLY4JOhNkqXtm7Umt-z26o?e=zltjbC" },
];

type CarrierWebLink = {
  carrier: string;
  label: string;
  url: string;
};

// Enlaces a sitios web oficiales de las aseguradoras (buscadores de médicos
// y hospitales, info sobre médicos sin convenio / sin pago directo).
// Se renderizan dentro del bloque de cada carrier, después de los folders.
const CARRIER_WEB_LINKS: CarrierWebLink[] = [
  { carrier: "AXA",     label: "Buscador de médicos y hospitales", url: "https://axa.mx/servicios/buscador-de-servicios" },
  { carrier: "AXA",     label: "Médicos sin convenio",             url: "https://axa.mx/documents/51602/1266886/MedicoSinConvenio.pdf" },
  // Va bajo AXA, no como carrier propio: AXA Keralty es la red de clínicas de
  // AXA, no una séptima aseguradora. Como "Keralty" no está en CARRIER_ORDER
  // pero sí entraba al `carrierSet` de más abajo, esta línea abría un bloque
  // suelto al final de la página — /recursos era otra superficie del negocio
  // diciendo siete aseguradoras en vez de seis.
  { carrier: "AXA",     label: "Clínicas AXA Keralty — ubicaciones", url: "https://axakeralty.mx/ubicaciones" },
  { carrier: "BUPA",    label: "Buscador de médicos y hospitales", url: "https://www.bupasalud.com.mx/red-de-salud" },
  { carrier: "GNP",     label: "Buscador de médicos y hospitales", url: "https://www.gnp.com.mx/directorio-proveedores-medicos" },
  { carrier: "GNP",     label: "Médicos sin pago directo",         url: "https://www.gnp.com.mx/content/pp/mx/es/footer/touch-navigation/listado-de-medicos-sin-pago-directo.html" },
  { carrier: "MetLife", label: "Buscador de médicos y hospitales", url: "https://www.metlife.com.mx/tramites-y-servicios/directorio-medico/" },
  { carrier: "Seguros Monterrey New York Life", label: "Buscador de médicos y hospitales", url: "https://www.mnyl.com.mx/" },
];

// La página SIEMPRE es indexable: aunque la biblioteca de recursos de Sanity
// esté vacía, la página sirve contenido estático valioso y estable — canales
// de WhatsApp por aseguradora, folders de OneDrive con condiciones generales y
// folletos, y buscadores oficiales de médicos/hospitales. Por eso ya no depende
// del conteo de documentos en Sanity para decidir index/noindex.
export async function generateMetadata(): Promise<Metadata> {
  return {
    // El title describía solo la mitad de la página. Ahora que /recursos
    // también aloja guías descargables y herramientas, la metadata cubre las
    // dos audiencias — el cliente que busca su documentación y el prospecto
    // que llega buscando entender antes de contratar.
    title: "Recursos: guías, herramientas y documentos de aseguradoras",
    description:
      "Guías descargables gratuitas, herramientas de cálculo y la documentación oficial de las 6 aseguradoras con las que trabajo: condiciones generales, formatos y cuadros médicos.",
    alternates: { canonical: `${SITE_URL}/recursos` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/recursos`,
      title: "Recursos — Guías, herramientas y documentos | Iria Talan / RIF",
      description:
        "Guías gratuitas, herramientas de cálculo y documentación oficial de aseguradoras.",
    },
  };
}

function formatFileSize(bytes?: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function getDownloadUrl(r: ResourceItem): string | null {
  return r.fileUrl ?? r.externalUrl ?? null;
}

function buildItemListSchema(resources: ResourceItem[]) {
  if (!resources.length) return null;
  return {
    "@type": "ItemList" as const,
    "@id": `${SITE_URL}/recursos#itemlist`,
    name: "Recursos de aseguradoras",
    numberOfItems: resources.length,
    itemListElement: resources.map((r, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "DigitalDocument",
        name: r.title,
        url: getDownloadUrl(r) ?? `${SITE_URL}/recursos`,
        about: r.seoDescription ?? CATEGORY_LABELS[r.category],
        provider: { "@type": "Organization", name: r.carrier },
        datePublished: r.year ? `${r.year.slice(0, 4)}-01-01` : undefined,
        publisher: { "@id": `${SITE_URL}#organization` },
      },
    })),
  };
}

export default async function RecursosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const carrierFilter = params.carrier?.trim() || null;
  const categoryFilter = params.category?.trim() || null;
  const productFilter = params.productLine?.trim() || null;

  const allResources =
    (await sanityFetch<ResourceItem[]>({
      query: RESOURCES_LIST_QUERY,
      tags: ["resource"],
    }).catch(() => null)) ?? [];

  const resources = allResources.filter((r) => {
    if (carrierFilter && r.carrier !== carrierFilter) return false;
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (productFilter && r.productLine !== productFilter) return false;
    return true;
  });

  const grouped = resources.reduce<Record<string, ResourceItem[]>>((acc, r) => {
    if (!acc[r.carrier]) acc[r.carrier] = [];
    acc[r.carrier].push(r);
    return acc;
  }, {});
  const carriers = Object.keys(grouped).sort();

  const carriersAvailable = Array.from(
    new Set(allResources.map((r) => r.carrier))
  ).sort();
  const categoriesAvailable = Array.from(
    new Set(allResources.map((r) => r.category))
  ).sort();

  const hasFilter = Boolean(carrierFilter || categoryFilter || productFilter);
  const isEmpty = allResources.length === 0;

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Recursos", path: "/recursos" },
    ]),
    buildItemListSchema(resources)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        {/* HERO — banda oscura, mismo patrón aprobado en /blog y en los
            artículos: foto nítida a la derecha + degradado real en capa
            aparte. La imagen es un bodegón de marca (libreta, pluma, folders
            sobre mármol) generado para esta página; no se reutiliza la tarjeta
            roja porque ya está en el hero de /blog y repetirla se nota.
            El H1 dejó de ser "Documentos oficiales de las aseguradoras" (que
            describía solo la mitad de la página) y ahora abarca las dos
            audiencias: cliente que busca su documentación y prospecto que
            viene a entender antes de decidir. */}
        <section className="relative bg-espresso text-cream-light overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden lg:block"
          >
            <Image
              src="/img/iria/recursos-escritorio.jpg"
              alt=""
              fill
              sizes="60vw"
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #1F1612 0%, rgba(31,22,18,0.94) 15%, rgba(31,22,18,0.6) 38%, rgba(31,22,18,0.18) 65%, transparent 88%)",
              }}
            />
          </div>
          <div className="relative mx-auto w-full max-w-[86rem] px-6 py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-champagne">
                Recursos
              </p>
              <h1 className="mt-5 font-serif font-light text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-[-0.015em] text-cream-light">
                Información clara para tomar{" "}
                <span className="italic text-champagne">mejores</span>{" "}
                decisiones.
              </h1>
              <p className="mt-6 text-lg text-cream-light/80 leading-relaxed max-w-xl">
                Documentos oficiales de las aseguradoras, guías descargables y
                herramientas para entender tus coberturas, planear tu retiro y
                proteger tu patrimonio.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#para-ti"
                  className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 hover:bg-burgundy-deep"
                >
                  Guías y herramientas
                </a>
                <a
                  href="#para-clientes"
                  className="inline-flex items-center gap-2 rounded-full border border-cream-light/30 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 hover:border-cream-light/70"
                >
                  Documentos de aseguradoras
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PARA TI — la mitad para prospectos. Antes esta página servía SOLO a
            clientes existentes (documentación de aseguradoras); sus tres lead
            magnets vivían enterrados dentro de artículos del blog y no tenían
            ninguna entrada desde aquí. */}
        <section
          id="para-ti"
          className="scroll-mt-24 px-6 pt-20 max-w-6xl mx-auto w-full"
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
              Para ti
            </p>
            <h2 className="mt-4 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
              Guías gratuitas
            </h2>
            <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65">
              Descargables para ordenar decisiones concretas. Sin costo.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                etiqueta: "Guía · PDF",
                titulo: "8 trámites después de un fallecimiento",
                desc: "Testamento, deudas, seguros, AFORE y SAT: qué hacer y en qué orden.",
                href: "/guia",
              },
              {
                etiqueta: "Check-up · PDF + Excel",
                titulo: "Revisión de beneficiarios y patrimonio",
                desc: "Detecta si tu patrimonio llegaría a quien tú quieres, y en cuánto tiempo.",
                href: "/blog/testamento-no-protege-seguros-vida-cuentas",
              },
              {
                etiqueta: "Checklist · PDF + Excel",
                titulo: "Protección para un hijo con discapacidad",
                desc: "Los puntos que hay que cerrar para que su cuidado no dependa de ti.",
                href: "/blog/proteger-hijo-con-discapacidad-cuando-yo-falte",
              },
            ].map((g) => (
              <li key={g.titulo}>
                <Link
                  href={g.href}
                  className="group flex h-full flex-col rounded-2xl bg-espresso p-6 text-cream-light transition-transform duration-500 hover:-translate-y-1"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne">
                    {g.etiqueta}
                  </p>
                  <h3 className="mt-3 font-serif text-lg leading-snug">
                    {g.titulo}
                  </h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-cream-light/70">
                    {g.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em]">
                    Descargar
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="size-3.5 transition-transform duration-500 group-hover:translate-y-0.5"
                      aria-hidden
                    >
                      <line x1="12" y1="5" x2="12" y2="17" />
                      <polyline points="6 12 12 18 18 12" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* HERRAMIENTAS — solo las DOS que existen de verdad. La maqueta
              proponía además una "Calculadora de retiro" que no está
              construida; poner la tarjeta habría dejado un enlace muerto. */}
          <h2 className="mt-16 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
            Herramientas
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                titulo: "¿Tu ahorro alcanza para la universidad?",
                desc: "Proyecta el costo real de la carrera de tu hijo y el ahorro mensual que hace falta.",
                cta: "Usar calculadora",
                href: "/blog/incremento-costos-universitarios-mexico",
              },
              {
                titulo: "Diagnóstico de protección patrimonial",
                desc: "Revisa si tus beneficiarios están bien designados y qué huecos tiene tu estructura hoy.",
                cta: "Iniciar diagnóstico",
                href: "/guia",
              },
            ].map((h) => (
              <li key={h.titulo}>
                <Link
                  href={h.href}
                  className="group flex h-full items-start gap-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-coffee/20 p-6 transition-all duration-500 hover:border-burgundy/35 hover:shadow-[0_18px_40px_-22px_rgba(20,17,15,0.28)]"
                >
                  <span
                    aria-hidden
                    className="flex size-12 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-burgundy/25 bg-burgundy/[0.06]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="size-6 text-burgundy"
                    >
                      <rect x="5" y="3" width="14" height="18" rx="2" />
                      <line x1="8.5" y1="7" x2="15.5" y2="7" />
                      <line x1="8.5" y1="11" x2="10" y2="11" />
                      <line x1="13" y1="11" x2="15.5" y2="11" />
                      <line x1="8.5" y1="15" x2="10" y2="15" />
                      <line x1="13" y1="15" x2="15.5" y2="15" />
                    </svg>
                  </span>
                  <span className="flex-1">
                    <span className="block font-serif text-lg leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                      {h.titulo}
                    </span>
                    <span className="mt-2 block text-[13.5px] leading-relaxed text-warm-brown/85 dark:text-cream-light/65">
                      {h.desc}
                    </span>
                    <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy">
                      {h.cta}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                        aria-hidden
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* /glosario solo estaba enlazado desde el footer: quedaba casi
              huérfano pese a emitir DefinedTermSet. Recursos es su hub natural
              — quien viene a leer condiciones generales es justo quien necesita
              saber qué significa "coaseguro". */}
          <Link
            href="/glosario"
            className="group mt-6 flex items-start gap-4 rounded-2xl border border-warm-brown/20 dark:border-warm-brown/40 p-5 transition-colors duration-500 hover:border-burgundy/50 hover:bg-cream dark:hover:bg-coffee/40"
          >
            <span
              aria-hidden
              className="flex size-12 flex-shrink-0 items-center justify-center rounded-full ring-1 ring-burgundy/25 bg-burgundy/[0.06]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="size-6 text-burgundy"
              >
                <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H11v16H5.5A2.5 2.5 0 0 1 3 17.5z" />
                <path d="M21 6.5A2.5 2.5 0 0 0 18.5 4H13v16h5.5A2.5 2.5 0 0 0 21 17.5z" />
              </svg>
            </span>
            <span>
              <span className="block font-serif text-lg text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                Glosario de seguros
              </span>
              <span className="mt-1 block text-[13.5px] text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                Deducible, coaseguro, suma asegurada, periodo de espera — los
                términos que aparecen en cada condición general, explicados en
                español claro.
              </span>
            </span>
          </Link>
        </section>

        {/* PARA CLIENTES — dos columnas como la maqueta: a la izquierda el
            texto con su CTA, a la derecha las 4 tarjetas con icono.
            Las 4 describen los TIPOS de material que hay y todas bajan a la
            misma sección (#por-aseguradora), porque ahí es donde vive todo
            organizado por compañía. No se inventaron cuatro destinos
            separados: sería prometer una estructura que no existe. */}
        <section
          id="para-clientes"
          className="scroll-mt-24 px-6 pt-20 max-w-6xl mx-auto w-full"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12 lg:items-start">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
                Para clientes
              </p>
              <h2 className="mt-4 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                Documentos oficiales de tus planes
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-warm-brown/85 dark:text-cream-light/65">
                Consulta condiciones generales, formatos, directorios médicos,
                tabuladores y canales de atención de las aseguradoras.
              </p>
              <a
                href="#por-aseguradora"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 hover:bg-burgundy-deep"
              >
                Ir a documentos de aseguradoras
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                  aria-hidden
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  titulo: "Documentos y formatos",
                  desc: "Condiciones generales, formatos y material oficial de cada aseguradora.",
                  icono: (
                    <>
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 3 14 8 19 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="13" y2="17" />
                    </>
                  ),
                },
                {
                  titulo: "Directorios médicos",
                  desc: "Cuadros médicos, hospitales y tabuladores actualizados.",
                  icono: (
                    <>
                      <path d="M6 3v6a4 4 0 0 0 8 0V3" />
                      <line x1="6" y1="3" x2="6" y2="3.01" />
                      <line x1="14" y1="3" x2="14" y2="3.01" />
                      <path d="M10 13v3a3.5 3.5 0 0 0 7 0v-1.5" />
                      <circle cx="17.5" cy="13" r="1.6" />
                    </>
                  ),
                },
                {
                  titulo: "Canales oficiales",
                  desc: "WhatsApp y medios de atención de cada aseguradora.",
                  icono: (
                    <>
                      <path d="M4 13a8 8 0 0 1 16 0" />
                      <rect x="3" y="13" width="4" height="7" rx="1.6" />
                      <rect x="17" y="13" width="4" height="7" rx="1.6" />
                    </>
                  ),
                },
                {
                  titulo: "Avisos importantes",
                  desc: "Actualizaciones relevantes sobre tus coberturas y servicios.",
                  icono: (
                    <>
                      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
                      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
                    </>
                  ),
                },
              ].map((c) => (
                <li key={c.titulo}>
                  <a
                    href="#por-aseguradora"
                    className="group flex h-full flex-col items-center rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-coffee/20 p-6 text-center transition-all duration-500 hover:border-burgundy/35 hover:shadow-[0_18px_40px_-22px_rgba(20,17,15,0.28)]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-9 text-burgundy"
                      aria-hidden
                    >
                      {c.icono}
                    </svg>
                    <h3 className="mt-4 font-serif text-[17px] leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                      {c.titulo}
                    </h3>
                    <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-warm-brown/80 dark:text-cream-light/60">
                      {c.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy">
                      Consultar
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                        aria-hidden
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Destino de las 4 tarjetas y del CTA de "Para clientes". */}
        <section
          id="por-aseguradora"
          className="scroll-mt-24 px-6 py-8 sm:py-12 mt-12 border-t border-warm-brown/15 dark:border-warm-brown/30"
        >
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Recursos por aseguradora
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-ink dark:text-cream-light">
              Folletos, condiciones generales y canal de avisos
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Por cada aseguradora con la que trabajo: el canal de WhatsApp
              donde publico avisos para mis clientes y los folders con la
              documentación vigente (folletos, condiciones generales,
              formatos). Los documentos se actualizan continuamente; el link
              siempre lleva a la versión más reciente.
            </p>

            <div className="mt-8 space-y-12">
              {(() => {
                const carrierSet = new Set<string>();
                WHATSAPP_CHANNELS.forEach((c) => carrierSet.add(c.carrier));
                RESOURCE_FOLDERS.forEach((f) => carrierSet.add(f.carrier));
                CARRIER_WEB_LINKS.forEach((l) => carrierSet.add(l.carrier));
                const allCarriers = Array.from(carrierSet).sort((a, b) => {
                  const ai = CARRIER_ORDER.indexOf(a);
                  const bi = CARRIER_ORDER.indexOf(b);
                  if (ai === -1 && bi === -1) return a.localeCompare(b, "es");
                  if (ai === -1) return 1;
                  if (bi === -1) return -1;
                  return ai - bi;
                });
                return allCarriers.map((carrier) => {
                  const whatsapp = WHATSAPP_CHANNELS.find(
                    (c) => c.carrier === carrier
                  );
                  const carrierFolders = RESOURCE_FOLDERS.filter(
                    (f) => f.carrier === carrier
                  );
                  return (
                    <div key={carrier}>
                      <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                        {carrier}
                      </h3>

                      {whatsapp && (
                        <a
                          href={whatsapp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group mt-4 flex items-center justify-between gap-4 p-4 rounded-xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                        >
                          <div>
                            <div className="text-xs uppercase tracking-wider text-rif-gris">
                              Canal WhatsApp
                            </div>
                            <div className="mt-0.5 font-medium text-ink dark:text-cream-light">
                              Avisos de {carrier} — {whatsapp.ramo}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-rif-rojo group-hover:underline whitespace-nowrap">
                            Únete →
                          </span>
                        </a>
                      )}

                      {RAMO_ORDER.map((ramo) => {
                        const lineas = carrierFolders.filter(
                          (f) => f.ramo === ramo
                        );
                        if (!lineas.length) return null;
                        return (
                          <div key={ramo} className="mt-6">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-brown dark:text-cream-light/80">
                              {RAMO_LABELS[ramo]}
                            </h4>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {lineas.map((f) => {
                                const isPending = !f.folderUrl;
                                const card = (
                                  <>
                                    <div className="font-medium text-ink dark:text-cream-light leading-snug">
                                      {f.linea}
                                    </div>
                                    <span
                                      className={`mt-3 inline-block text-sm font-medium whitespace-nowrap ${
                                        isPending
                                          ? "text-rif-gris"
                                          : "text-rif-rojo group-hover:underline"
                                      }`}
                                    >
                                      {isPending
                                        ? "Próximamente"
                                        : "Ver documentos →"}
                                    </span>
                                  </>
                                );
                                const baseClass =
                                  "block p-4 rounded-xl border border-warm-brown/15 dark:border-warm-brown/30 transition";
                                if (isPending) {
                                  return (
                                    <div
                                      key={`${f.carrier}-${f.ramo}-${f.linea}`}
                                      className={`${baseClass} opacity-60`}
                                      aria-disabled="true"
                                    >
                                      {card}
                                    </div>
                                  );
                                }
                                return (
                                  <a
                                    key={`${f.carrier}-${f.ramo}-${f.linea}`}
                                    href={f.folderUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`group ${baseClass} hover:border-rif-rojo dark:hover:border-rif-rojo`}
                                  >
                                    {card}
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {(() => {
                        const webLinks = CARRIER_WEB_LINKS.filter(
                          (l) => l.carrier === carrier
                        );
                        if (!webLinks.length) return null;
                        return (
                          <div className="mt-6">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-brown dark:text-cream-light/80">
                              Sitios oficiales {carrier}
                            </h4>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {webLinks.map((l) => (
                                <a
                                  key={`${l.carrier}-${l.label}`}
                                  href={l.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group block p-4 rounded-xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                                >
                                  <div className="font-medium text-ink dark:text-cream-light leading-snug">
                                    {l.label}
                                  </div>
                                  <span className="mt-3 inline-block text-sm font-medium text-rif-rojo group-hover:underline whitespace-nowrap">
                                    Ir al sitio →
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {!whatsapp &&
                        !carrierFolders.length &&
                        !CARRIER_WEB_LINKS.some(
                          (l) => l.carrier === carrier
                        ) && (
                          <p className="mt-3 text-sm text-rif-gris">
                            Documentación próximamente.
                          </p>
                        )}
                    </div>
                  );
                });
              })()}
            </div>

            <p className="mt-8 text-xs text-rif-gris leading-relaxed">
              Los canales de WhatsApp son administrados por mí (Iria Talan /
              RIF) e incluyen información práctica para mis clientes — no son
              canales oficiales de los carriers; para comunicaciones formales
              contacta directo a la aseguradora. Los folders enlazan a mi
              OneDrive con la versión vigente de los documentos; si algún
              enlace no carga o necesitas un documento específico, escríbeme.
            </p>
          </div>
        </section>

        {!isEmpty && (
          <section className="px-6 pb-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-rif-gris mr-2">Filtrar:</span>
              <Link
                href="/recursos"
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  !hasFilter
                    ? "bg-coffee text-cream-light dark:bg-cream dark:text-ink border-warm-brown/25 dark:border-warm-brown/10"
                    : "border-warm-brown/20 dark:border-warm-brown/40 hover:bg-cream dark:hover:bg-coffee/40"
                }`}
              >
                Todos
              </Link>
              {carriersAvailable.map((c) => (
                <Link
                  key={c}
                  href={`/recursos?carrier=${encodeURIComponent(c)}`}
                  className={`text-sm px-3 py-1.5 rounded-full border ${
                    carrierFilter === c
                      ? "bg-coffee text-cream-light dark:bg-cream dark:text-ink border-warm-brown/25 dark:border-warm-brown/10"
                      : "border-warm-brown/20 dark:border-warm-brown/40 hover:bg-cream dark:hover:bg-coffee/40"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
            {categoriesAvailable.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-rif-gris mr-2">Categoría:</span>
                {categoriesAvailable.map((cat) => (
                  <Link
                    key={cat}
                    href={`/recursos?category=${encodeURIComponent(cat)}`}
                    className={`text-sm px-3 py-1.5 rounded-full border ${
                      categoryFilter === cat
                        ? "bg-coffee text-cream-light dark:bg-cream dark:text-ink border-warm-brown/25 dark:border-warm-brown/10"
                        : "border-warm-brown/20 dark:border-warm-brown/40 hover:bg-cream dark:hover:bg-coffee/40"
                    }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
          {isEmpty ? (
            <div className="rounded-2xl border border-dashed border-warm-brown/20 dark:border-warm-brown/40 p-12 text-center">
              <h2 className="text-xl font-semibold text-ink dark:text-cream-light">
                Aún no hay documentos publicados
              </h2>
              <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65 max-w-md mx-auto">
                Estoy organizando la biblioteca de Condiciones Generales y
                formatos de cada aseguradora. Si necesitas un documento
                específico, escríbeme.
              </p>
              <Link
                href="/sobre-iria"
                className="mt-6 inline-block text-sm font-medium underline"
              >
                Contactar a Iria →
              </Link>
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-warm-brown/20 dark:border-warm-brown/40 p-12 text-center">
              <p className="text-warm-brown dark:text-cream-light/85">
                Ningún documento coincide con el filtro seleccionado.
              </p>
              <Link
                href="/recursos"
                className="mt-4 inline-block text-sm font-medium underline"
              >
                Ver todos los recursos
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {carriers.map((carrier) => (
                <div key={carrier}>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
                    {carrier}
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {grouped[carrier].map((r) => {
                      const url = getDownloadUrl(r);
                      const size = formatFileSize(r.fileSize);
                      const card = (
                        <>
                          <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                            {CATEGORY_LABELS[r.category] ?? r.category}
                            {r.productLine &&
                              r.productLine !== "otro" &&
                              ` · ${PRODUCT_LINE_LABELS[r.productLine] ?? r.productLine}`}
                            {r.year && ` · ${r.year}`}
                          </div>
                          <h3 className="text-base font-semibold text-ink dark:text-cream-light leading-snug">
                            {r.title}
                          </h3>
                          {r.seoDescription && (
                            <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                              {r.seoDescription}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-3 text-sm">
                            <span className="font-medium text-ink dark:text-cream-light">
                              {r.fileUrl ? "Descargar PDF" : "Ver documento"}
                            </span>
                            {size && (
                              <span className="text-rif-gris">({size})</span>
                            )}
                            {!r.fileUrl && r.externalUrl && (
                              <span className="text-rif-gris text-xs">
                                → sitio de {r.carrier}
                              </span>
                            )}
                          </div>
                        </>
                      );
                      const className =
                        "block p-5 rounded-xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition";
                      if (!url) {
                        return (
                          <div key={r._id} className={`${className} opacity-60`}>
                            {card}
                          </div>
                        );
                      }
                      return (
                        <a
                          key={r._id}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {card}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="px-6 py-10 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-xs text-rif-gris leading-relaxed">
              Los documentos aquí publicados son provistos por las aseguradoras
              con fines informativos. La versión vigente de cada póliza
              prevalece sobre cualquier copia descargada. Para confirmar
              vigencia o resolver dudas, agenda una sesión inicial.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
