import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CategoryBadge } from "@/components/blog/article-meta";
import { BlogSearch } from "@/components/blog/blog-search";
import { TopicGrid } from "@/components/blog/topic-grid";
import { sanityFetch } from "../../../sanity/lib/fetch";
import { BLOG_INDEX_QUERY } from "../../../sanity/lib/queries";
import { formatDateMx, TOPIC_LABELS } from "@/lib/blog";
import {
  buildBreadcrumbSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

// ISR: regenerar índice cada 60 seg para que nuevos artículos publicados
// en Sanity aparezcan en /blog sin necesidad de redeploy.
export const revalidate = 60;

type ArticleListItem = {
  _id: string;
  title: string;
  slug: string;
  destacado?: boolean;
  excerpt?: string;
  tldr?: string;
  publishedAt: string;
  updatedAt?: string;
  topic?: string;
  format?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
  author?: {
    name: string;
    slug?: string;
    photo?: { asset?: { url?: string } } | null;
  } | null;
};

export async function generateMetadata(): Promise<Metadata> {
  const articles =
    (await sanityFetch<ArticleListItem[]>({
      query: BLOG_INDEX_QUERY,
      tags: ["article"],
    }).catch(() => null)) ?? [];

  const isEmpty = articles.length === 0;

  return {
    title: "Blog — Planeación patrimonial y seguros en México",
    description:
      "Artículos firmados sobre planeación patrimonial, seguros, retiro, PPR, GMM y casos especiales. Por Iria Talan — Wealth Management por Yale School of Management (Exec. Ed.), MDRT Top of the Table.",
    alternates: { canonical: `${SITE_URL}/blog` },
    robots: isEmpty
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/blog`,
      title: `Blog | ${SITE_NAME}`,
      description:
        "Artículos sobre planeación patrimonial, seguros y retiro en México.",
    },
  };
}

export default async function BlogIndexPage() {
  const articles =
    (await sanityFetch<ArticleListItem[]>({
      query: BLOG_INDEX_QUERY,
      tags: ["article"],
    }).catch(() => null)) ?? [];

  // El índice emitía SOLO BreadcrumbList, mientras sus propias páginas hijas de
  // categoría ya declaraban CollectionPage + ItemList. El hub principal quedaba
  // peor marcado que sus ramas: un crawler no tenía forma de saber que esta URL
  // es una colección ni qué artículos la componen.
  //
  // El ItemList va en orden de publicación (el mismo que se ve en pantalla) y
  // lleva `datePublished`, que es la señal que usan los answer engines para
  // decidir qué tan fresco es el contenido de una colección.
  //
  // Si no hay artículos no se emite nada: un CollectionPage vacío es soft-404, y
  // por eso la página ya se marca `noindex` en ese caso.
  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
    ]),
    articles.length > 0
      ? {
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/blog#collection`,
          name: `Blog — ${SITE_NAME}`,
          description:
            "Artículos firmados sobre planeación patrimonial, seguros, retiro, PPR, GMM y casos especiales.",
          url: `${SITE_URL}/blog`,
          inLanguage: "es-MX",
          isPartOf: { "@id": `${SITE_URL}#website` },
          about: { "@id": `${SITE_URL}/sobre-iria#person` },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: articles.length,
            itemListElement: articles.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/blog/${a.slug}`,
              name: a.title,
              ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
            })),
          },
        }
      : null
  );

  // Conteo por tema. Solo se muestran los que existen — evita exponer hubs
  // vacíos como soft-404 implícito. La rejilla de temas y el listado se arman
  // solos con esto, así que publicar un artículo nuevo actualiza la página sin
  // tocar código.
  const conteoPorTema = articles.reduce<Record<string, number>>((acc, a) => {
    if (a.topic) acc[a.topic] = (acc[a.topic] ?? 0) + 1;
    return acc;
  }, {});

  // Artículo destacado: lo elige Iria con el toggle "⭐ Destacado" en Studio.
  // Si no marca ninguno, cae al más reciente — así la página nunca se queda sin
  // tarjeta grande. Se excluye del listado de abajo para no repetirlo.
  //
  // El campo existe para que ella no dependa de un cambio de código cada vez
  // que quiera cambiar qué artículo recibe al lector: el más reciente no
  // siempre es el que conviene poner al frente (Modalidad 40, por ejemplo,
  // tiene mucha más intención de compra que un artículo recién publicado).
  const destacado = articles.find((a) => a.destacado) ?? articles[0];
  const resto = articles.filter((a) => a._id !== destacado?._id);

  // Lo que se puede buscar en el cliente: título, entradilla y etiqueta de tema.
  const buscables = articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt ?? a.tldr,
    topic: a.topic,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        {/* HERO — "Centro de conocimiento". Antes era un H1 "Blog" sobre fondo
            claro; ahora la banda oscura del sitio, con buscador. El H1 dejó de
            ser la palabra "Blog" (cero valor para búsqueda) y pasó a decir lo
            que el lector viene a hacer. */}
        <section className="relative bg-espresso text-cream-light overflow-hidden">
          {/* La tarjeta corporativa "Con todo mi amor" llena el vacío de la
              derecha. Se reutiliza el asset que ya vive en la home
              (tarjeta-marble-pen.png) en vez de subir un duplicado.
              Mismo tratamiento aprobado en el hero de los artículos: foto
              NÍTIDA, sin blur ni opacidad reducida, y un degradado real en
              capa aparte que oscurece hacia el texto. `object-center` porque
              al simular el recorte es la única posición donde caben completos
              el logo dorado y el "Con todo mi amor". */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] overflow-hidden lg:block"
          >
            <Image
              src="/img/iria/tarjeta-marble-pen.png"
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
                Centro de conocimiento
              </p>
              <h1 className="mt-5 font-serif font-light text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-[-0.015em] text-cream-light">
                {/* `champagne`, no `burgundy`: sobre la banda espresso el
                    burdeos casi no contrasta. Y `burgundy-light` no existe en
                    la paleta — se habría renderizado sin color. */}
                Aprende antes de{" "}
                <span className="italic text-champagne">decidir.</span>
              </h1>
              <p className="mt-6 text-lg text-cream-light/80 leading-relaxed max-w-xl">
                Guías sobre seguros, retiro y patrimonio, escritas leyendo
                condiciones generales reales — no folletos. Para que tomes
                decisiones con la información completa.
              </p>

              {articles.length > 0 && (
                <div className="mt-9">
                  <BlogSearch articles={buscables} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ARTÍCULO DESTACADO — el más reciente, en tarjeta horizontal. Le da
            al índice una entrada obvia en vez de nueve tarjetas equivalentes. */}
        {destacado && (
          <section className="px-6 -mt-8 sm:-mt-12 max-w-6xl mx-auto w-full">
            <Link
              href={`/blog/${destacado.slug}`}
              className="group grid overflow-hidden rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-coffee/20 shadow-[0_24px_60px_-28px_rgba(20,17,15,0.4)] sm:grid-cols-[42%_1fr]"
            >
              {destacado.heroImage?.asset?.url && (
                <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[15rem]">
                  <Image
                    src={destacado.heroImage.asset.url}
                    alt={destacado.heroImage.alt ?? destacado.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 42vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    priority
                  />
                </div>
              )}
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-burgundy">
                  Artículo destacado
                </p>
                <h2 className="mt-3 font-serif text-2xl sm:text-3xl leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                  {destacado.title}
                </h2>
                {(destacado.excerpt || destacado.tldr) && (
                  <p className="mt-3 text-[15px] leading-relaxed text-warm-brown/85 dark:text-cream-light/65 line-clamp-3">
                    {destacado.excerpt ?? destacado.tldr}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-brown/65 dark:text-cream-light/55">
                  {destacado.topic && (
                    <span className="uppercase tracking-[0.18em] text-burgundy">
                      {TOPIC_LABELS[destacado.topic] ?? destacado.topic}
                    </span>
                  )}
                  <span>{formatDateMx(destacado.publishedAt)}</span>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-burgundy px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 group-hover:bg-burgundy-deep">
                  Leer el artículo
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="size-3.5"
                    aria-hidden
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* EXPLORA POR TEMA — la arquitectura de clusters, visible. */}
        {Object.keys(conteoPorTema).length > 0 && (
          <section className="px-6 pt-20 max-w-6xl mx-auto w-full">
            <div className="max-w-2xl">
              <h2 className="font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                Explora por tema
              </h2>
              <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65">
                Elige lo que necesitas entender. Cada tema agrupa las guías que
                se complementan entre sí.
              </p>
            </div>
            <div className="mt-10">
              <TopicGrid conteoPorTema={conteoPorTema} />
            </div>
          </section>
        )}

        {/* RECURSOS GRATUITOS — los TRES descargables que existen de verdad en
            /public/descargas. La maqueta proponía una "Calculadora de retiro"
            que no existe; en su lugar va el checklist de protección para hijo
            con discapacidad, que sí existe y además alimenta el cluster más
            fuerte del blog. Si algún día se construye la calculadora, se
            agrega aquí como cuarta tarjeta. */}
        <section className="px-6 pt-20 max-w-6xl mx-auto w-full">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-12 lg:items-start">
            <div>
              <h2 className="font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                Recursos gratuitos
              </h2>
              <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65">
                Guías y listas de verificación para ordenar tus decisiones. Sin
                costo y sin compromiso.
              </p>
              <Link
                href="/recursos"
                className="group mt-6 inline-flex items-center gap-2 rounded-full border border-burgundy/30 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-burgundy transition-colors duration-500 hover:border-burgundy hover:bg-burgundy/[0.04]"
              >
                Ver todos los recursos
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
              </Link>
            </div>

            <ul className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  etiqueta: "Guía gratuita",
                  titulo: "8 trámites después de un fallecimiento",
                  desc: "Qué hacer y en qué orden: testamento, deudas, seguros, AFORE y SAT.",
                  href: "/guia",
                },
                {
                  etiqueta: "Check-up",
                  titulo: "Revisión de beneficiarios y patrimonio",
                  desc: "Detecta en minutos si tu patrimonio llegaría a quien tú quieres.",
                  href: "/recursos",
                },
                {
                  etiqueta: "Checklist",
                  titulo: "Protección para un hijo con discapacidad",
                  desc: "Los puntos que hay que cerrar para que su cuidado no dependa de ti.",
                  href: "/blog/proteger-hijo-con-discapacidad-cuando-yo-falte",
                },
              ].map((r) => (
                <li key={r.titulo}>
                  <Link
                    href={r.href}
                    className="group flex h-full flex-col rounded-2xl bg-espresso p-6 text-cream-light transition-transform duration-500 hover:-translate-y-1"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-champagne">
                      {r.etiqueta}
                    </p>
                    <h3 className="mt-3 font-serif text-lg leading-snug">
                      {r.titulo}
                    </h3>
                    <p className="mt-2 flex-1 text-[13px] leading-relaxed text-cream-light/70">
                      {r.desc}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light">
                      Ver
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
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 pt-20 pb-24 max-w-6xl mx-auto w-full">
          {articles.length > 1 && (
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream-light">
                Más artículos
              </h2>
              {/* El glosario es contenido editorial hermano del blog pero no
                  vive en el nav (ahí competiría con páginas de venta). Este
                  enlace le da entrada desde una página fuerte y cierra el
                  circuito con GlossaryMentions, que enlaza de vuelta desde
                  cada artículo. */}
              <Link
                href="/glosario"
                className="text-sm text-warm-brown/85 dark:text-cream-light/65 underline underline-offset-4 transition-colors hover:text-burgundy"
              >
                ¿Una palabra que no conoces? Consulta el glosario
              </Link>
            </div>
          )}
          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-warm-brown/20 dark:border-warm-brown/40 p-12 text-center">
              <h2 className="text-xl font-semibold text-ink dark:text-cream-light">
                Próximamente
              </h2>
              <p className="mt-3 text-warm-brown/85 dark:text-cream-light/65 max-w-md mx-auto">
                Estoy preparando los primeros artículos. Mientras tanto, agenda
                una sesión inicial si quieres conversar sobre tu situación
                patrimonial específica.
              </p>
              <Link
                href="/contacto"
                className="mt-6 inline-block text-sm font-medium underline"
              >
                Agenda sesión inicial →
              </Link>
            </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* `resto`, no `articles`: el más reciente ya se muestra arriba
                  como destacado y repetirlo se lee como error. */}
              {resto.map((a) => (
                <Link
                  key={a._id}
                  href={`/blog/${a.slug}`}
                  className="group flex flex-col"
                >
                  {a.heroImage?.asset?.url && (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-warm-brown/10">
                      <Image
                        src={a.heroImage.asset.url}
                        alt={a.heroImage.alt ?? a.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  {a.topic && (
                    <div className="mt-5">
                      <CategoryBadge topic={a.topic} size="sm" />
                    </div>
                  )}
                  <h2 className="mt-3 font-serif text-xl leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                    {a.title}
                  </h2>
                  {(a.excerpt || a.tldr) && (
                    <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed line-clamp-3">
                      {a.excerpt ?? a.tldr}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-warm-brown/60 dark:text-cream-light/55">
                    {formatDateMx(a.publishedAt)}
                    {a.author?.name && ` · ${a.author.name}`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
