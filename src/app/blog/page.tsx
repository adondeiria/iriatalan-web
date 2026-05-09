import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { BLOG_INDEX_QUERY } from "../../../sanity/lib/queries";
import { buildBreadcrumbSchema, buildGraph, SITE_NAME, SITE_URL } from "@/lib/seo";

type ArticleListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  topic?: string;
  heroImage?: { asset?: { url?: string }; alt?: string } | null;
  author?: { name: string; slug?: string; photo?: { asset?: { url?: string } } | null } | null;
};

const TOPIC_LABELS: Record<string, string> = {
  vida: "Seguros de Vida",
  gmm: "GMM",
  retiro: "Retiro / AFORE",
  patrimonial: "Planeación Patrimonial",
  educacionales: "Planes Educacionales",
  fideicomisos: "Fideicomisos",
  empresas: "Empresas",
  casos: "Casos especiales",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

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
      "Artículos firmados sobre planeación patrimonial, seguros, retiro, PPR, GMM y casos especiales. Por Iria Talan, MDRT Top of the Table.",
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

  const schema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-20 pb-10 max-w-5xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-cream-light0">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / Blog"}
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Blog
          </h1>
          <p className="mt-5 text-lg text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Artículos firmados sobre planeación patrimonial, retiro, seguros y
            casos especiales — escritos por Iria Talan, MDRT Top of the Table,
            con citas a CNSF, AMIS y Banxico.
          </p>
        </section>

        <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
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
              {articles.map((a) => (
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
                    <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium">
                      {TOPIC_LABELS[a.topic] ?? a.topic}
                    </p>
                  )}
                  <h2 className="mt-3 font-serif text-xl leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
                    {a.title}
                  </h2>
                  {a.excerpt && (
                    <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                      {a.excerpt}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-warm-brown/60 dark:text-cream-light/55">
                    {formatDate(a.publishedAt)}
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
