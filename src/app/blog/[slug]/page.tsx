import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { type PortableTextBlock } from "@portabletext/react";

import {
  AuthorCard,
  LastUpdated,
  TLDRBox,
} from "@/components/blog/article-meta";
import { PortableTextRenderer } from "@/components/portable-text";
import { YouTubeFacade } from "@/components/youtube-embed";
import { GlossaryMentions } from "@/components/blog/glossary-mentions";
import { ArticleCtaCard } from "@/components/blog/article-rails";
import { RelatedPosts } from "@/components/blog/related-posts";
import { RelatedServices } from "@/components/blog/related-services";
import { TableOfContents } from "@/components/blog/table-of-contents";

import { sanityFetch } from "../../../../sanity/lib/fetch";
import {
  ALL_ARTICLES_SLUGS_QUERY,
  ARTICLE_QUERY,
} from "../../../../sanity/lib/queries";
import { TOPIC_LABELS, topicHref } from "@/lib/blog";
import { WA_NUMBER_FALLBACK, waBlogMessage, waHref } from "@/lib/whatsapp";
import {
  AuthorData,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  buildVideoSchema,
  SITE_NAME,
  SITE_URL,
  type ArticleVideoData,
  type FAQItem,
} from "@/lib/seo";

// ISR: regenerar cada 30 seg para que nuevos artículos publicados desde Sanity
// (vía /draft-push o cambio del toggle draft=false) aparezcan rápido sin
// necesidad de redeploy manual. dynamicParams explícito = slugs no pre-generados
// caen a SSR + cache (default true en App Router, lo dejamos explícito).
export const revalidate = 30;
export const dynamicParams = true;

/**
 * Copy del CTA lateral por tema del artículo. Las claves son los valores de
 * `topic` en Sanity; cualquier tema sin entrada cae en el genérico.
 */
const CTA_GENERICO = {
  heading: "¿Quieres revisar cómo aplica esto a tu caso?",
  body: "Agendemos una conversación. Te escucho primero y recomiendo después, sin compromiso.",
  cta: "Agendar ahora",
};

// Las claves son los valores de `topic` en Sanity — los mismos de
// TOPIC_LABELS en lib/blog, no los slugs de las URLs de categoría.
const CTA_POR_TEMA: Record<
  string,
  { heading: string; body: string; cta: string }
> = {
  retiro: {
    heading: "¿Quieres saber si esta estrategia tiene sentido para tu retiro?",
    body: "Revisamos tus semanas cotizadas y tu situación real antes de mover nada.",
    cta: "Revisar mi retiro",
  },
  gmm: {
    heading: "¿Tu cobertura te protege de verdad?",
    body: "Comparamos tu póliza actual contra las opciones del mercado, sin costo.",
    cta: "Revisar mi seguro",
  },
  vida: {
    heading: "¿Tu seguro de vida cubre lo que tu familia necesitaría?",
    body: "Calculamos la suma asegurada que corresponde a tu situación, sin costo.",
    cta: "Revisar mi cobertura",
  },
  patrimonial: {
    heading: "¿Tu patrimonio está ordenado para tu familia?",
    body: "Beneficiarios, sucesión y estructura: lo revisamos en una conversación confidencial.",
    cta: "Agendar conversación",
  },
  educacionales: {
    heading: "¿Cuánto necesitas para la universidad de tus hijos?",
    body: "Calculamos el monto real según la carrera y el año en que entra.",
    cta: "Calcular mi caso",
  },
  fideicomisos: {
    heading: "¿Un fideicomiso es lo que tu caso necesita?",
    body: "No siempre lo es. Lo revisamos con calma antes de que gastes en constituir uno.",
    cta: "Agendar conversación",
  },
  empresas: {
    heading: "¿Tu empresa está protegida si falta una persona clave?",
    body: "Diagnóstico de continuidad y beneficios para tu equipo, sin compromiso.",
    cta: "Agendar diagnóstico",
  },
  casos: {
    heading: "¿Tu caso no encaja en lo estándar?",
    body: "Es justo lo que más trabajo. Cuéntame tu situación y vemos qué aplica.",
    cta: "Agendar conversación",
  },
};

type ArticleAuthor = AuthorData & {
  credentials?: Array<{ title?: string; issuer?: string; category?: string }>;
};

type ArticleData = {
  _id: string;
  title: string;
  slug: string;
  author?: ArticleAuthor | null;
  reviewedBy?: { name?: string; slug?: string; title?: string } | null;
  publishedAt: string;
  updatedAt?: string;
  lastReviewed?: string;
  topic?: string;
  format?: string;
  tldr?: string;
  questionsAnswered?: string[];
  excerpt?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
  video?: ArticleVideoData | null;
  body?: unknown[] | null;
  faqs?: Array<{
    _id?: string;
    question?: string;
    answerText?: string | null;
    answer?: unknown[] | null;
    topic?: string;
  }> | null;
  sources?: Array<{ title?: string; url?: string; publisher?: string }> | null;
  relatedArticles?: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    topic?: string;
    publishedAt?: string;
    heroImage?: { asset?: { url?: string }; alt?: string } | null;
  }> | null;
  wordCount?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export async function generateStaticParams() {
  const slugs =
    (await sanityFetch<Array<{ slug: string }>>({
      query: ALL_ARTICLES_SLUGS_QUERY,
    }).catch(() => null)) ?? [];
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await sanityFetch<ArticleData | null>({
    query: ARTICLE_QUERY,
    params: { slug },
    tags: [`article:${slug}`],
  }).catch(() => null);

  if (!article) {
    return {
      title: "Artículo no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = article.seoTitle || `${article.title} | ${SITE_NAME}`;
  const description =
    article.seoDescription ||
    article.excerpt ||
    article.tldr ||
    `Artículo de Iria Talan sobre ${
      TOPIC_LABELS[article.topic ?? ""] ?? article.topic ?? "planeación patrimonial"
    }.`;

  return {
    // `absolute` evita que el template del root (`%s | ${SITE_NAME}`) vuelva a
    // pegar la marca: `title` ya la incluye, y sin esto salía duplicada
    // ("… | Iria Talan / RIF | Iria Talan / RIF") en todo artículo.
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/blog/${slug}`,
      title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime:
        article.lastReviewed ?? article.updatedAt ?? article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      images: article.heroImage?.asset?.url
        ? [
            {
              url: article.heroImage.asset.url,
              alt: article.heroImage.alt ?? article.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await sanityFetch<ArticleData | null>({
    query: ARTICLE_QUERY,
    params: { slug },
    tags: [`article:${slug}`],
  }).catch(() => null);

  if (!article) {
    notFound();
  }

  const faqItems: FAQItem[] =
    article.faqs
      ?.filter((f) => f.question && f.answerText)
      .map((f) => ({ question: f.question!, answerText: f.answerText })) ?? [];

  const categoryHref = topicHref(article.topic);
  const topicLabel = article.topic
    ? TOPIC_LABELS[article.topic] ?? article.topic
    : null;

  // Tiempo de lectura: se usa el wordCount de Sanity si viene; si no, se
  // cuenta el texto de los bloques. 200 ppm es el promedio de lectura en
  // español para prosa divulgativa.
  const palabras =
    article.wordCount && article.wordCount > 0
      ? article.wordCount
      : (article.body ?? []).reduce((total: number, bloque) => {
          const b = bloque as { _type?: string; children?: Array<{ text?: string }> };
          if (b._type !== "block") return total;
          const texto = (b.children ?? []).map((c) => c.text ?? "").join(" ");
          return total + texto.split(/\s+/).filter(Boolean).length;
        }, 0);
  const readingMinutes = palabras > 0 ? Math.max(1, Math.round(palabras / 200)) : 0;

  // CTA del riel: la oferta se nombra en los términos del artículo que el
  // lector tiene enfrente. Un genérico ("agenda una sesión") convierte peor
  // que uno que retoma el tema que lo trajo.
  const articleCta = {
    href: "/contacto#agendar",
    ...(CTA_POR_TEMA[article.topic ?? ""] ?? CTA_GENERICO),
  };

  const pageSchema = buildGraph(
    buildArticleSchema({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      tldr: article.tldr,
      questionsAnswered: article.questionsAnswered,
      format: article.format,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      lastReviewed: article.lastReviewed,
      heroImage: article.heroImage ?? undefined,
      author: article.author ?? undefined,
      reviewedBy: article.reviewedBy ?? undefined,
      sources: article.sources ?? undefined,
      topic: article.topic,
      wordCount: article.wordCount,
      video: article.video ?? undefined,
    }),
    buildVideoSchema(article.video, `/blog/${article.slug}`),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
      ...(categoryHref && topicLabel
        ? [{ name: topicLabel, path: categoryHref }]
        : []),
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
    buildFAQPageSchema(faqItems)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <article>
          {/* HERO — banda oscura con el titular, y la foto a todo lo ancho
              justo debajo.
              Antes era un split (texto izq / foto der). Se cambió porque el
              split forzaba a la foto a estirarse hasta la altura del texto y
              la recortaba sin control: dependía de que cada imagen se hubiera
              compuesto para ese hueco exacto, cosa que no se sostiene artículo
              tras artículo. Así el texto tiene su aire, la foto tiene el suyo,
              y no hay costura vertical ni velo encima de la imagen.
              El retrato de la firma es la foto real de Iria desde Sanity. */}
          <section className="relative bg-espresso text-cream-light overflow-hidden">
            {/* Fondo difuminado para el vacío de la derecha. Es la MISMA foto
                del artículo, muy desenfocada y atenuada: llena el hueco con
                textura propia del contenido en vez de con un color plano, sin
                competir con el titular.
                Coste cero de red: `quality={10}` + `sizes="40vw"` hacen que
                Next sirva una miniatura de pocos KB — al desenfocarla tanto,
                la resolución da igual. La máscara la desvanece hacia la
                izquierda para que el texto siempre caiga sobre espresso sólido
                y el contraste no dependa de la imagen. */}
            {article.heroImage?.asset?.url && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
                style={{
                  maskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 28%, rgba(0,0,0,0.9) 60%, #000 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 28%, rgba(0,0,0,0.9) 60%, #000 100%)",
                }}
              >
                <Image
                  src={article.heroImage.asset.url}
                  alt=""
                  fill
                  sizes="40vw"
                  quality={15}
                  className="scale-125 object-cover opacity-[0.42] blur-xl"
                />
              </div>
            )}
            <div className="relative mx-auto w-full max-w-[86rem]">
              <div className="px-6 py-14 sm:py-16 lg:py-20 max-w-3xl">
                <p className="text-[13px] text-cream-light/55">
                  <Link href="/" className="hover:text-cream-light transition-colors">
                    Inicio
                  </Link>
                  {" / "}
                  <Link href="/blog" className="hover:text-cream-light transition-colors">
                    Blog
                  </Link>
                </p>

                {topicLabel && (
                  <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-champagne">
                    {categoryHref ? (
                      <Link href={categoryHref} className="hover:text-cream-light transition-colors">
                        {topicLabel}
                      </Link>
                    ) : (
                      topicLabel
                    )}
                  </p>
                )}

                <h1
                  data-speakable="title"
                  className="mt-4 font-serif font-light text-4xl sm:text-5xl lg:text-[3.3rem] leading-[1.06] tracking-[-0.015em] text-cream-light"
                >
                  {article.title}
                </h1>

                {article.excerpt && (
                  <p className="mt-6 text-lg text-cream-light/80 leading-relaxed max-w-xl">
                    {article.excerpt}
                  </p>
                )}

                <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-4">
                  {article.author?.photo?.asset?.url && (
                    <Image
                      src={article.author.photo.asset.url}
                      alt={article.author.photo.alt ?? article.author.name ?? "Iria Talan"}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover ring-1 ring-champagne/40"
                    />
                  )}
                  <div className="text-[13px] leading-snug">
                    {article.author?.name && (
                      <Link
                        href="/sobre-iria"
                        className="block font-medium text-cream-light hover:underline"
                      >
                        {article.author.name}
                      </Link>
                    )}
                    {article.author?.title && (
                      <span className="text-cream-light/60">{article.author.title}</span>
                    )}
                  </div>
                  {readingMinutes > 0 && (
                    <span className="flex items-center gap-2 border-l border-cream-light/15 pl-5 text-[13px] text-cream-light/60">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        className="size-4"
                        aria-hidden
                      >
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15.5 14" />
                      </svg>
                      {readingMinutes} min de lectura
                    </span>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-cream-light/55">
                  <LastUpdated
                    publishedAt={article.publishedAt}
                    updatedAt={article.updatedAt}
                    lastReviewed={article.lastReviewed}
                  />
                  {article.reviewedBy?.name && (
                    <>
                      <span aria-hidden>·</span>
                      <span>Revisado por {article.reviewedBy.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* La foto va DEBAJO de la banda de texto, como figura contenida
              que monta ligeramente sobre la banda oscura (-mt).
              Historia de este bloque, para que nadie lo "arregle" de vuelta:
              1) Era un split (texto izq / foto der). La foto se estiraba hasta
                 igualar la altura del texto y `object-cover` la recortaba sin
                 control — en este artículo decapitaba el letrero de EMERGENCY,
                 que era el punto de la imagen.
              2) Se probó a todo lo ancho en 16:7 y 16:9: cualquier banda
                 panorámica recorta demasiado una fuente 3:2 y vuelve a comerse
                 la señalización.
              Se simularon los recortes con la imagen real antes de decidir:
              16:10 es la única proporción donde caben el letrero completo Y la
              pareja. Contenida a max-w-5xl para que 16:10 no se traduzca en
              900px de alto en escritorio. */}
          {article.heroImage?.asset?.url && (
            <figure className="mx-auto w-full max-w-5xl px-6 -mt-10 sm:-mt-14">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-espresso shadow-[0_24px_60px_-24px_rgba(20,17,15,0.45)]">
                <Image
                  src={article.heroImage.asset.url}
                  alt={article.heroImage.alt ?? article.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 64rem"
                  className="object-cover"
                  priority
                />
              </div>
            </figure>
          )}

          {article.tldr && (
            <section className="px-6 pt-12 max-w-3xl mx-auto w-full">
              <TLDRBox>{article.tldr}</TLDRBox>
            </section>
          )}

          {/* El video va después del hero y antes del cuerpo: el lector que
              prefiere ver a leer lo encuentra sin scrollear, y el que viene a
              leer solo pasa una tarjeta. */}
          {article.video?.videoId && (
            <section className="px-6 mt-10 max-w-3xl mx-auto w-full">
              <YouTubeFacade
                video={article.video}
                fallbackTitle={article.title}
              />
            </section>
          )}

          {article.body &&
            Array.isArray(article.body) &&
            article.body.length > 0 && (
              <section className="px-6 py-10 sm:py-12">
                {/* Tres columnas en escritorio: índice + CTA a la izquierda,
                    cuerpo al centro, autora a la derecha. Los rieles se van
                    cayendo al flujo conforme se angosta la pantalla, para que
                    en móvil el lector no tenga que pasar sobre ellos antes de
                    llegar al texto. */}
                <div className="mx-auto grid w-full max-w-[86rem] justify-center gap-x-10 gap-y-10 lg:grid-cols-[15rem_minmax(0,44rem)] xl:grid-cols-[15rem_minmax(0,44rem)_17rem]">
                  <div className="hidden lg:block">
                    <div className="sticky top-24 flex flex-col gap-8">
                      <TableOfContents
                        body={article.body as unknown[]}
                        variant="rail"
                      />
                      <ArticleCtaCard {...articleCta} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="lg:hidden">
                      <TableOfContents body={article.body as unknown[]} />
                    </div>
                    <PortableTextRenderer
                      value={article.body as PortableTextBlock[]}
                    />
                  </div>

                  <div className="hidden xl:block">
                    <div className="sticky top-24">
                      <AuthorCard author={article.author} />
                    </div>
                  </div>
                </div>

                {/* Debajo del cuerpo cuando no hay riel donde ponerlos. */}
                <div className="mx-auto mt-12 w-full max-w-3xl lg:hidden">
                  <ArticleCtaCard {...articleCta} />
                </div>
              </section>
            )}

          {faqItems.length > 0 && (
            <section className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
              {/* Dos columnas de acordeones, como la maqueta: con 8-13 FAQs
                  por artículo, la lista abierta a una columna obligaba a un
                  scroll larguísimo justo antes del cierre. Se usa <details>
                  para que abra sin JS y siga siendo texto indexable. */}
              <div className="max-w-5xl mx-auto w-full">
                <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
                  Preguntas relacionadas
                </h2>
                <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-x-5">
                  {faqItems.map((f, i) => (
                    <details
                      key={i}
                      className="group h-fit rounded-xl border border-warm-brown/15 dark:border-warm-brown/30 bg-cream/30 dark:bg-coffee/20 px-5 py-4 transition-colors duration-300 hover:border-warm-brown/30 open:border-warm-brown/30"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                        <h3 className="text-[15px] font-medium leading-snug text-ink dark:text-cream-light">
                          {f.question}
                        </h3>
                        <span
                          aria-hidden
                          className="mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full border border-burgundy/30 text-burgundy transition-transform duration-300 group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-[15px] leading-relaxed text-warm-brown dark:text-cream-light/85">
                        {f.answerText}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {article.sources && article.sources.length > 0 && (
            <section className="px-6 py-12 border-t border-warm-brown/15 dark:border-warm-brown/30">
              <div className="max-w-3xl mx-auto w-full">
                <h2 className="text-sm uppercase tracking-wider text-rif-gris">
                  Fuentes
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  {article.sources
                    .filter((s) => s.title && s.url)
                    .map((s, i) => (
                      <li key={i} className="leading-relaxed">
                        <a
                          href={s.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink dark:text-cream-light underline hover:text-burgundy dark:hover:text-burgundy"
                        >
                          {s.title}
                        </a>
                        {s.publisher && (
                          <span className="text-warm-brown/60 dark:text-cream-light/55">
                            {" "}— {s.publisher}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </section>
          )}

          {/* En xl la autora ya vive en el riel derecho, junto al texto: aquí
              solo se emite cuando ese riel no cabe. */}
          <section className="px-6 pt-8 max-w-3xl mx-auto w-full xl:hidden">
            <AuthorCard
              author={
                article.author
                  ? {
                      name: article.author.name,
                      title: article.author.title,
                      bio: article.author.bio,
                      photo: article.author.photo ?? null,
                      credentials: article.author.credentials,
                    }
                  : null
              }
              reviewedBy={article.reviewedBy ?? null}
            />
          </section>

          <GlossaryMentions body={article.body ?? undefined} />

          <RelatedPosts
            topic={article.topic}
            currentSlug={article.slug}
            manual={article.relatedArticles ?? undefined}
          />

          <RelatedServices topic={article.topic} />

          <section className="px-6 py-16 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream/40 dark:bg-coffee/30">
            <div className="max-w-3xl mx-auto w-full text-center">
              <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
                ¿Tienes una situación específica?
              </h2>
              <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-xl mx-auto">
                Cada caso es distinto. Escríbeme y lo vemos con calma — te
                escucho primero, recomiendo después.
              </p>
              {/* WhatsApp como acción principal: el lector que llegó hasta aquí
                  es el lead más caliente del artículo, y el mensaje ya llega
                  con el título del artículo precargado. "Agenda sesión" queda
                  como secundaria para quien prefiere el formulario. */}
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={waHref(
                    WA_NUMBER_FALLBACK,
                    waBlogMessage(article.title)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-burgundy text-cream-light px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition"
                >
                  Escríbeme por WhatsApp
                </a>
                <Link
                  href="/contacto#agendar"
                  className="inline-flex items-center justify-center rounded-full border border-warm-brown/30 dark:border-warm-brown/50 px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase text-ink dark:text-cream-light hover:border-burgundy transition"
                >
                  Agenda sesión inicial
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
