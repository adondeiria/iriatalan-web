import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Download,
  FileText,
  GraduationCap,
  Headphones,
  HeartPulse,
  Globe,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { BuscadorRecursos } from "@/components/recursos/buscador";
import { CategoryBadge } from "@/components/blog/article-meta";
import { recortar, type DocBusqueda } from "@/lib/busqueda";
import {
  formatDateMx,
  TOPIC_LABELS,
  TOPIC_TO_URL_SLUG,
  topicHref,
  type ArticleTopic,
} from "@/lib/blog";
import {
  RECURSOS_HUB_DESCRIPTION,
  RECURSOS_HUB_ITEMS,
  type RecursoHubItem,
} from "@/lib/recursos";
import { buildBreadcrumbSchema, buildGraph, SITE_NAME, SITE_URL } from "@/lib/seo";

import { sanityFetch } from "../../../sanity/lib/fetch";
import {
  BLOG_INDEX_QUERY,
  GLOSSARY_INDEX_QUERY,
} from "../../../sanity/lib/queries";

/**
 * /recursos — centro de recursos.
 *
 * Antes esta URL era la biblioteca de documentos de aseguradoras, o sea que
 * servía solo a clientes con póliza: quien llegaba investigando no encontraba
 * nada que le ayudara a decidir. Esa biblioteca se mudó íntegra a
 * /recursos/documentos y esta página pasó a ser la puerta de entrada al
 * material editorial — artículos, glosario, guías y herramientas — que hasta
 * ahora estaba disperso y sin un solo lugar que lo reuniera.
 *
 * Es un server component estático (no lee searchParams): el índice del
 * buscador viaja en el payload RSC y el filtrado ocurre en el cliente.
 */

type ArticuloItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tldr?: string | null;
  publishedAt?: string | null;
  topic?: string | null;
  format?: string | null;
  heroImage?: { asset?: { url?: string } | null; alt?: string | null } | null;
};

type TerminoItem = {
  _id: string;
  term: string;
  slug: string;
  shortDefinition?: string | null;
  topic?: string | null;
  synonyms?: string[] | null;
};

/**
 * Términos que se muestran en la sección de glosario. Es una lista curada, no
 * "los más populares": `glossaryTerm` no tiene campo de popularidad ni hay
 * analítica por término, así que llamarlos populares sería inventar un dato.
 * Se filtra contra los que existen de verdad, o sea que borrar uno en Studio
 * no rompe nada.
 */
const TERMINOS_DESTACADOS = [
  "deducible",
  "coaseguro",
  "suma-asegurada",
  "periodo-de-espera",
  "beneficiario",
  "modalidad-40",
  "renta-vitalicia",
  "testamento",
  "fideicomiso",
  "prima",
  "exclusiones",
  "plan-personal-de-retiro",
];

/** Icono por tarjeta temática. Se resuelve por `key` para no meter JSX en la lib. */
const ICONO_TEMA: Record<string, typeof ShieldCheck> = {
  retiro: Sparkles,
  gmm: HeartPulse,
  vida: ShieldCheck,
  familia: GraduationCap,
  empresas: Briefcase,
  internacional: Globe,
};

/** Chips del hero. Son enlaces de navegación, no filtros — ver nota abajo. */
const CHIPS: Array<{ label: string; href: string }> = [
  { label: "Retiro", href: `/blog/categoria/${TOPIC_TO_URL_SLUG.retiro}` },
  { label: "Gastos médicos", href: `/blog/categoria/${TOPIC_TO_URL_SLUG.gmm}` },
  {
    label: "Vida y patrimonio",
    href: `/blog/categoria/${TOPIC_TO_URL_SLUG.patrimonial}`,
  },
  {
    label: "Universidad",
    href: `/blog/categoria/${TOPIC_TO_URL_SLUG.educacionales}`,
  },
  { label: "Glosario", href: "/glosario" },
  { label: "Documentos", href: "/recursos/documentos" },
];

/**
 * Descargables gratuitos: guías, check-ups y checklists.
 *
 * Van todos en UNA sección, no en dos. Antes la guía de fallecimiento tenía
 * bloque destacado propio y además aparecía como tarjeta en "Herramientas", o
 * sea que la misma pieza salía dos veces en la página. La distinción entre
 * "guía" y "herramienta" existía en el código, no en la cabeza de quien lee:
 * los tres son un archivo que te llevas.
 *
 * `acceso` dice el costo de entrada ANTES del clic — descarga directa o dejar
 * el correo. En un vertical donde todo el mundo esconde el formulario hasta el
 * último paso, decirlo por adelantado es la diferencia.
 *
 * Agregar las calculadoras cuando existan = un objeto más aquí.
 */
type Descargable = {
  slug: string;
  /** Etiqueta del badge sobre la portada. */
  tipo: string;
  titulo: string;
  gancho: string;
  /** Descarga directa, o la página/ancla donde vive el formulario. */
  href: string;
  /** true = <a download> de un archivo; false = navegación interna. */
  descargaDirecta: boolean;
  imagen: string;
  acceso: string;
  meta: string[];
};

const DESCARGABLES: Descargable[] = [
  {
    slug: "tramites-fallecimiento",
    tipo: "Guía",
    titulo: "Qué hacer cuando fallece un familiar",
    gancho:
      "Los 8 trámites que no conviene posponer: seguros, AFORE, pensión, testamento y deudas, en el orden correcto.",
    href: "/descargas/guia-8-tramites-fallecimiento.pdf",
    descargaDirecta: true,
    imagen: "/img/guias/tramites-fallecimiento.jpg",
    acceso: "Descarga directa · sin formulario",
    meta: ["PDF", "10 min de lectura"],
  },
  {
    slug: "checkup-beneficiarios",
    tipo: "Check-up",
    titulo: "Revisión de beneficiarios y patrimonio",
    gancho:
      "16 puntos para detectar si tu patrimonio llegaría a quien tú quieres, y en cuánto tiempo.",
    href: "/guia#checkup",
    descargaDirecta: false,
    imagen: "/img/guias/checkup-beneficiarios.jpg",
    acceso: "Te lo mando por correo",
    meta: ["PDF + Excel"],
  },
  {
    slug: "checklist-discapacidad",
    tipo: "Checklist",
    titulo: "Proteger a un hijo con discapacidad",
    gancho:
      "Los puntos que hay que cerrar —testamento, beneficiarios, fideicomiso, red de apoyo— para que su cuidado no dependa de ti.",
    href: "/blog/proteger-hijo-con-discapacidad-cuando-yo-falte#checklist-discapacidad",
    descargaDirecta: false,
    imagen: "/img/guias/proteger-hijo-discapacidad.jpg",
    acceso: "Te lo mando por correo",
    meta: ["PDF + Excel"],
  },
];

export const metadata: Metadata = {
  title: "Recursos — Centro de conocimiento",
  description: RECURSOS_HUB_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/recursos` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/recursos`,
    title: `Recursos — Centro de conocimiento | ${SITE_NAME}`,
    description: RECURSOS_HUB_DESCRIPTION,
  },
};

/**
 * Tarjeta de descargable. Una sola pieza para guías, check-ups y checklists:
 * son el mismo objeto para quien lee, así que comparten markup.
 *
 * El elemento raíz cambia según el destino — <a download> cuando el archivo se
 * baja directo, <Link> cuando primero hay un formulario. Forzar un <a download>
 * a una ruta interna rompería la navegación del cliente.
 */
function TarjetaDescargable({ item }: { item: Descargable }) {
  const contenido = (
    <>
      <div className="img-zoom relative aspect-[3/2] overflow-hidden">
        <Image
          src={item.imagen}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-burgundy px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-cream-light">
          {item.tipo}
        </span>
        <span
          aria-hidden
          className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full bg-burgundy text-cream-light shadow-[0_8px_20px_-6px_rgba(20,17,15,0.5)] transition-transform duration-500 group-hover:translate-y-0.5"
        >
          {item.descargaDirecta ? (
            <Download className="size-4" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-lg leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
          {item.titulo}
        </h3>
        <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-warm-brown/80 dark:text-cream-light/55">
          {item.gancho}
        </p>
        <div className="mt-5 border-t border-warm-brown/12 dark:border-cream-light/10 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-burgundy">
            {item.acceso}
          </p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 text-[12px] text-warm-brown/60 dark:text-cream-light/45">
            {item.meta.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </p>
        </div>
      </div>
    </>
  );

  const clase =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-coffee/25 transition-all duration-500 hover:border-burgundy/35 hover:shadow-[0_22px_50px_-24px_rgba(20,17,15,0.35)]";

  return item.descargaDirecta ? (
    <a href={item.href} download className={clase}>
      {contenido}
    </a>
  ) : (
    <Link href={item.href} className={clase}>
      {contenido}
    </Link>
  );
}

/**
 * Destino de una tarjeta temática. Si el topic no tiene artículos publicados,
 * el enlace primario cae a la página comercial: las categorías vacías se
 * marcan noindex y no entran al sitemap, así que mandarles tráfico desde aquí
 * sería un callejón sin salida.
 */
function destinoTarjeta(
  item: RecursoHubItem,
  topicsConContenido: Set<string>
): { href: string; label: string; esCategoria: boolean } {
  if (item.topic && topicsConContenido.has(item.topic)) {
    const href = topicHref(item.topic);
    if (href) return { href, label: "Explorar artículos", esCategoria: true };
  }
  return { href: item.pillar.href, label: item.pillar.label, esCategoria: false };
}

export default async function RecursosPage() {
  const [articulos, terminos] = await Promise.all([
    sanityFetch<ArticuloItem[]>({
      query: BLOG_INDEX_QUERY,
      tags: ["article"],
    }).catch(() => null),
    sanityFetch<TerminoItem[]>({
      query: GLOSSARY_INDEX_QUERY,
      tags: ["glossaryTerm"],
    }).catch(() => null),
  ]);

  const arts = articulos ?? [];
  const terms = terminos ?? [];

  const topicsConContenido = new Set(
    arts.map((a) => a.topic).filter((t): t is string => Boolean(t))
  );

  // Índice del buscador. Se arma con los datos que las secciones de abajo ya
  // necesitaban: el buscador no agrega ni una query.
  const docsBusqueda: DocBusqueda[] = [
    ...arts.map((a) => ({
      id: a._id,
      tipo: "articulo" as const,
      titulo: a.title,
      href: `/blog/${a.slug}`,
      resumen: recortar(a.excerpt ?? a.tldr ?? ""),
      tema: a.topic ?? undefined,
      fecha: a.publishedAt ?? undefined,
    })),
    ...terms.map((t) => ({
      id: t._id,
      tipo: "termino" as const,
      titulo: t.term,
      href: `/glosario/${t.slug}`,
      resumen: recortar(t.shortDefinition ?? ""),
      tema: t.topic ?? undefined,
      alias: t.synonyms?.length ? t.synonyms.join(" · ") : undefined,
    })),
  ];

  const recientes = arts.slice(0, 3);

  const glosarioDestacado = TERMINOS_DESTACADOS.map((slug) =>
    terms.find((t) => t.slug === slug)
  ).filter((t): t is TerminoItem => Boolean(t));

  // El ItemList se deriva de los mismos arrays que se renderizan: así lo que
  // se declara en el JSON-LD no puede divergir de lo que se ve en pantalla.
  const itemsSchema = [
    {
      name: "Documentos oficiales de las aseguradoras",
      url: `${SITE_URL}/recursos/documentos`,
    },
    { name: "Glosario de seguros", url: `${SITE_URL}/glosario` },
    {
      name: "Guía: 8 trámites después de un fallecimiento",
      url: `${SITE_URL}/guia`,
    },
    { name: "Artículos", url: `${SITE_URL}/blog` },
    ...RECURSOS_HUB_ITEMS.filter(
      (i) => i.topic && topicsConContenido.has(i.topic)
    ).map((i) => ({
      name: i.title,
      url: `${SITE_URL}${topicHref(i.topic as ArticleTopic)}`,
    })),
  ];

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Recursos", path: "/recursos" },
    ]),
    {
      "@type": "CollectionPage" as const,
      "@id": `${SITE_URL}/recursos#collection`,
      name: `Recursos — ${SITE_NAME}`,
      description: RECURSOS_HUB_DESCRIPTION,
      url: `${SITE_URL}/recursos`,
      inLanguage: "es-MX",
      isPartOf: { "@id": `${SITE_URL}#website` },
      publisher: { "@id": `${SITE_URL}#organization` },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: itemsSchema.length,
        itemListElement: itemsSchema.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: it.url,
        })),
      },
    }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        {/* ============================================================
            1 · HERO
            Banda oscura con bodegón a la derecha y degradado en capa
            aparte, igual que /blog y los artículos. Todo lo que va dentro
            es claro-sobre-oscuro INCONDICIONAL (nada de pares dark:):
            el hero es espresso en los dos modos.
            ============================================================ */}
        <section className="relative bg-espresso text-cream-light overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] overflow-hidden lg:block"
          >
            {/* El grabado NO lo dibujó un generador de imagen: la foto se creó
                con la tapa en blanco y encima se compuso el SVG real de la
                marca, deformado al plano de la tapa (scripts/grabar-logo.mjs).
                La versión anterior tenía el logo inclinado respecto al libro y
                la tipografía aproximada. */}
            <Image
              src="/img/iria/recursos-cuaderno-rif.jpg"
              alt=""
              fill
              sizes="55vw"
              className="object-cover object-center"
              priority
              quality={85}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #1F1612 0%, rgba(31,22,18,0.96) 20%, rgba(31,22,18,0.7) 45%, rgba(31,22,18,0.24) 72%, transparent 92%)",
              }}
            />
          </div>

          <div className="relative mx-auto w-full max-w-[86rem] px-6 py-16 sm:py-20">
            <div className="max-w-2xl">
              <p className="animate-fade-up text-[11px] font-medium uppercase tracking-[0.22em] text-champagne">
                Centro de recursos
              </p>
              <h1 className="animate-fade-up stagger-1 mt-5 font-serif font-light text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-[-0.015em] text-cream-light">
                Información clara para tomar mejores{" "}
                <span className="italic text-champagne">decisiones</span>{" "}
                financieras.
              </h1>
              <p className="animate-fade-up stagger-2 mt-6 max-w-xl text-lg leading-relaxed text-cream-light/80">
                Guías, artículos, herramientas y documentos oficiales para
                entender tus seguros, planear tu retiro y proteger tu
                patrimonio con mayor claridad.
              </p>

              <div className="mt-10">
                <BuscadorRecursos docs={docsBusqueda} />
              </div>

              {/* Los chips son ENLACES, no filtros del buscador. Con este
                  volumen de contenido, filtrar en sitio devolvería dos o tres
                  tarjetas sueltas, mientras que /blog/categoria/… ya es una
                  página con su propio H1, metadata y schema. Además son <a>
                  rastreables: enlace interno real, y funcionan sin JS. */}
              <nav aria-label="Temas frecuentes" className="mt-7">
                <p className="text-[12.5px] text-cream-light/50">
                  O empieza por un tema:
                </p>
                <ul className="mt-3 flex flex-wrap gap-2.5">
                  {CHIPS.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className="inline-flex min-h-11 items-center rounded-full border border-cream-light/25 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light/80 transition-colors duration-500 hover:border-champagne hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/40"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </section>

        {/* ============================================================
            2 · DOCUMENTOS DE ASEGURADORAS — "para clientes"
            Va primero, justo bajo el hero, por decisión de Iria: quien
            llega a /recursos con una tarea concreta ("necesito la condición
            general de mi póliza") es el visitante impaciente, y las tres
            URLs legacy que redirigen aquí (/soy-cliente, /clientes,
            /clientes-resp) traen exactamente esa intención. El material
            editorial queda abajo, para quien viene a explorar.
            ============================================================ */}
        <section className="bg-cream-light dark:bg-transparent border-b border-warm-brown/15 dark:border-warm-brown/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,21rem)_1fr] lg:gap-14 lg:items-start">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
                  Para clientes
                </p>
                <h2 className="mt-4 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                  Documentos oficiales de tus{" "}
                  <span className="italic text-burgundy">planes</span>.
                </h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-warm-brown/85 dark:text-cream-light/60">
                  Consulta condiciones generales, formatos, directorios
                  médicos, tabuladores y canales de atención de las
                  aseguradoras.
                </p>
                <Link
                  href="/recursos/documentos"
                  className="group mt-7 inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 hover:bg-burgundy-deep"
                >
                  Ir a documentos de aseguradoras
                  <ArrowRight
                    className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>

              {/* Las cuatro describen los TIPOS de material y todas llevan al
                  mismo sitio, que es donde vive todo organizado por compañía.
                  Inventarles cuatro destinos separados sería prometer una
                  estructura que no existe. */}
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    titulo: "Documentos y formatos",
                    desc: "Condiciones generales, formatos y material oficial de cada aseguradora.",
                    Icono: FileText,
                  },
                  {
                    titulo: "Directorios médicos",
                    desc: "Cuadros médicos, hospitales y tabuladores actualizados.",
                    Icono: Stethoscope,
                  },
                  {
                    titulo: "Canales oficiales",
                    desc: "WhatsApp y medios de atención de cada aseguradora.",
                    Icono: Headphones,
                  },
                  {
                    titulo: "Avisos importantes",
                    desc: "Actualizaciones relevantes sobre tus coberturas y servicios.",
                    Icono: Bell,
                  },
                ].map((c) => (
                  <li key={c.titulo}>
                    <Link
                      href="/recursos/documentos#por-aseguradora"
                      className="group flex h-full flex-col items-center rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream dark:bg-coffee/25 p-6 text-center transition-all duration-500 hover:border-burgundy/35 hover:shadow-[0_18px_40px_-22px_rgba(20,17,15,0.28)]"
                    >
                      <c.Icono
                        className="size-8 text-burgundy"
                        strokeWidth={1.4}
                        aria-hidden
                      />
                      <h3 className="mt-4 font-serif text-[17px] leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                        {c.titulo}
                      </h3>
                      <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-warm-brown/80 dark:text-cream-light/55">
                        {c.desc}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy">
                        Consultar
                        <ArrowRight
                          className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ============================================================
            3 · DESCARGABLES GRATUITOS
            Guías, check-ups y checklists juntos. Antes estaban en dos
            secciones —una "guía destacada" y otra de "herramientas"— y la
            guía de fallecimiento salía en las dos. Para quien lee son la
            misma cosa: un archivo que se lleva.
            Ninguno se esconde detrás de un formulario sorpresa: cada tarjeta
            dice el costo de acceso antes del clic.
            ============================================================ */}
        {DESCARGABLES.length > 0 && (
          <section className="bg-cream dark:bg-coffee/20 border-y border-warm-brown/15 dark:border-warm-brown/30">
            <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
              <div className="max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
                  Para ti · sin costo
                </p>
                <h2 className="mt-4 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                  Guías y herramientas para{" "}
                  <span className="italic text-burgundy">guardar</span>.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-warm-brown/85 dark:text-cream-light/60">
                  Material para ordenar decisiones concretas. Cada uno dice por
                  adelantado si se descarga directo o si te lo mando por correo.
                </p>
              </div>

              <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {DESCARGABLES.map((d) => (
                  <li key={d.slug}>
                    <TarjetaDescargable item={d} />
                  </li>
                ))}
              </ul>

              {/* Lo que falta se declara en una franja, no en una cuarta
                  tarjeta al 60% de opacidad: eso se lee como sitio a medio
                  construir. Cuando existan, las calculadoras entran como
                  tarjetas y esta franja se borra. */}
              <div className="mt-8 rounded-2xl border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
                <p className="max-w-2xl text-[14px] leading-relaxed text-warm-brown/85 dark:text-cream-light/60">
                  Estoy preparando dos calculadoras —aportación al retiro y
                  costo universitario— para que puedas correr tus propios
                  números antes de hablar conmigo. Mientras tanto, si quieres el
                  cálculo con tus datos reales, lo hacemos juntos en la sesión
                  inicial.
                </p>
                <Link
                  href="/contacto"
                  className="group mt-5 inline-flex shrink-0 items-center gap-2 rounded-full border border-burgundy/35 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy transition-colors duration-500 hover:border-burgundy hover:bg-burgundy/[0.04] sm:mt-0"
                >
                  Agendar 30 minutos
                  <ArrowRight
                    className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            4 · ¿QUÉ QUIERES RESOLVER?
            ============================================================ */}
        <section className="bg-cream dark:bg-coffee/20 border-y border-warm-brown/15 dark:border-warm-brown/30">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
              Por dónde empezar
            </p>
            <h2 className="mt-4 max-w-2xl font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
              ¿Qué quieres{" "}
              <span className="italic text-burgundy">resolver</span>?
            </h2>

            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {RECURSOS_HUB_ITEMS.map((item) => {
                const Icono = ICONO_TEMA[item.key] ?? ShieldCheck;
                const destino = destinoTarjeta(item, topicsConContenido);
                return (
                  <li key={item.key}>
                    {/* El enlace primario envuelve el título y se estira sobre
                        toda la tarjeta (after:inset-0); el secundario va por
                        encima con z-10. Un solo nombre accesible por enlace y
                        un área de clic grande, sin anidar <a> dentro de <a>. */}
                    <div className="relative flex h-full flex-col rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-coffee/25 p-7 transition-all duration-500 hover:border-burgundy/35 hover:shadow-[0_18px_40px_-22px_rgba(20,17,15,0.28)]">
                      <span
                        aria-hidden
                        className="flex size-12 items-center justify-center rounded-full ring-1 ring-champagne/40"
                      >
                        <Icono
                          className="size-5 text-burgundy"
                          strokeWidth={1.5}
                        />
                      </span>
                      <h3 className="mt-6 font-serif text-xl leading-snug text-ink dark:text-cream-light">
                        <Link
                          href={destino.href}
                          className="after:absolute after:inset-0 after:rounded-2xl transition-colors duration-500 hover:text-burgundy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 focus-visible:ring-offset-4 focus-visible:ring-offset-cream-light dark:focus-visible:ring-offset-coffee"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-warm-brown/85 dark:text-cream-light/60">
                        {item.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy">
                        {destino.label}
                        <ArrowRight className="size-3" aria-hidden />
                      </span>
                      {destino.esCategoria && (
                        <Link
                          href={item.pillar.href}
                          className="link-underline relative z-10 mt-3 self-start text-[12.5px] text-warm-brown/70 dark:text-cream-light/50"
                        >
                          {item.pillar.label}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>


        {/* ============================================================
            5 · ARTÍCULOS RECOMENDADOS
            Los tres más recientes, de los datos que ya tenemos. Se copia
            el patrón de tarjeta de /blog a propósito: es el mismo objeto
            en dos superficies y debe verse igual.
            ============================================================ */}
        {recientes.length > 0 && (
          <section className="bg-cream-light dark:bg-transparent">
            <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
                    Del blog
                  </p>
                  <h2 className="mt-4 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                    Lo último que{" "}
                    <span className="italic text-burgundy">escribí</span>.
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy"
                >
                  Ver todos los artículos
                  <ArrowRight
                    className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </div>

              <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {recientes.map((a) => (
                  <li key={a._id} className="group">
                    {a.heroImage?.asset?.url && (
                      <Link
                        href={`/blog/${a.slug}`}
                        tabIndex={-1}
                        aria-hidden
                        className="img-zoom relative block aspect-[4/3] overflow-hidden rounded-2xl"
                      >
                        <Image
                          src={a.heroImage.asset.url}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </Link>
                    )}
                    <div className="mt-5">
                      <CategoryBadge topic={a.topic} size="sm" />
                      <h3 className="mt-2 font-serif text-xl leading-snug text-ink dark:text-cream-light">
                        <Link
                          href={`/blog/${a.slug}`}
                          className="transition-colors duration-500 group-hover:text-burgundy"
                        >
                          {a.title}
                        </Link>
                      </h3>
                      {(a.excerpt || a.tldr) && (
                        <p className="mt-2.5 text-[14px] leading-relaxed text-warm-brown/85 dark:text-cream-light/60 line-clamp-3">
                          {a.excerpt ?? a.tldr}
                        </p>
                      )}
                      {a.publishedAt && (
                        <p className="mt-3 text-xs text-warm-brown/60 dark:text-cream-light/45">
                          {formatDateMx(a.publishedAt)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ============================================================
            6 · GLOSARIO
            ============================================================ */}
        {glosarioDestacado.length > 0 && (
          <section className="bg-cream-light dark:bg-transparent">
            <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
                    Glosario
                  </p>
                  <h2 className="mt-4 font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                    Las palabras que aparecen en toda{" "}
                    <span className="italic text-burgundy">póliza</span>.
                  </h2>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-warm-brown/85 dark:text-cream-light/60">
                    Deducible, coaseguro, periodo de espera, beneficiario
                    irrevocable, suma asegurada. Explicados en español claro,
                    con lo que significan en la práctica.
                  </p>
                  <Link
                    href="/glosario"
                    className="group mt-7 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy"
                  >
                    Consultar el glosario completo
                    <ArrowRight
                      className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </div>

                <ul className="grid grid-cols-1 gap-x-8 gap-y-0 self-start sm:grid-cols-2">
                  {glosarioDestacado.map((t) => (
                    <li
                      key={t._id}
                      className="border-b border-warm-brown/12 dark:border-cream-light/10"
                    >
                      <Link
                        href={`/glosario/${t.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-3.5 transition-colors duration-500 hover:text-burgundy"
                      >
                        <span className="text-[15px] text-ink dark:text-cream-light group-hover:text-burgundy">
                          {t.term}
                        </span>
                        <ArrowRight
                          className="size-3 shrink-0 text-warm-brown/40 dark:text-cream-light/30 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-burgundy"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================
            7 · ÍNDICE DE CONTENIDOS
            Doble función: es el destino del formulario de búsqueda cuando
            no hay JavaScript, y es lo que hace que el hub enlace de verdad
            a cada pieza de contenido en vez de solo a las tres recientes.
            ============================================================ */}
        <section
          id="indice"
          className="scroll-mt-24 bg-cream dark:bg-coffee/20 border-t border-warm-brown/15 dark:border-warm-brown/30"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
            <h2 className="font-serif font-light text-2xl text-ink dark:text-cream-light">
              Índice de contenidos
            </h2>
            <p className="mt-2 text-[13.5px] text-warm-brown/70 dark:text-cream-light/50">
              Todo lo publicado, en una sola lista.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-burgundy">
                  Artículos
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {arts.map((a) => (
                    <li key={a._id} className="text-[14px] leading-snug">
                      <Link
                        href={`/blog/${a.slug}`}
                        className="link-underline text-warm-brown dark:text-cream-light/70"
                      >
                        {a.title}
                      </Link>
                      {a.topic && TOPIC_LABELS[a.topic] && (
                        <span className="ml-2 text-[11px] uppercase tracking-[0.14em] text-warm-brown/45 dark:text-cream-light/35">
                          {TOPIC_LABELS[a.topic]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-burgundy">
                  Glosario
                </h3>
                <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {terms.map((t) => (
                    <li key={t._id} className="text-[14px] leading-snug">
                      <Link
                        href={`/glosario/${t.slug}`}
                        className="link-underline text-warm-brown dark:text-cream-light/70"
                      >
                        {t.term}
                      </Link>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-9 text-[11px] font-medium uppercase tracking-[0.2em] text-burgundy">
                  Otros recursos
                </h3>
                <ul className="mt-4 space-y-2.5 text-[14px]">
                  <li>
                    <Link
                      href="/recursos/documentos"
                      className="link-underline text-warm-brown dark:text-cream-light/70"
                    >
                      Documentos oficiales de las aseguradoras
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/guia"
                      className="link-underline text-warm-brown dark:text-cream-light/70"
                    >
                      Guía: 8 trámites después de un fallecimiento
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/glosario"
                      className="link-underline text-warm-brown dark:text-cream-light/70"
                    >
                      Glosario completo de seguros
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            8 · CTA FINAL — único bloque burgundy de la página.
            ============================================================ */}
        <section className="bg-burgundy text-cream-light">
          <div className="mx-auto w-full max-w-4xl px-6 py-20 text-center sm:py-24">
            <h2 className="font-serif font-light text-3xl sm:text-4xl leading-tight">
              La información ayuda. Una estrategia personalizada{" "}
              <span className="italic">decide</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15.5px] leading-relaxed text-cream-light/80">
              Todo lo de esta página es informativo. Para ver cómo aplica a tu
              situación —tus pólizas, tus prioridades y tus objetivos— lo
              revisamos juntos.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contacto"
                className="inline-flex items-center rounded-full bg-cream-light px-8 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-espresso transition-colors duration-500 hover:bg-cream"
              >
                Agenda una conversación inicial
              </Link>
              <Link
                href="/sobre-iria"
                className="inline-flex items-center rounded-full border border-cream-light/40 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 hover:border-cream-light"
              >
                Conocer a Iria
              </Link>
            </div>
            <p className="mt-6 text-[12.5px] text-cream-light/60">
              Sin compromiso. Sin presión comercial. 30 minutos.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
