import Link from "next/link";

import { sanityFetch } from "../../sanity/lib/fetch";
import { HOME_PAGE_QUERY, SOBRE_IRIA_QUERY } from "../../sanity/lib/queries";
import {
  AuthorData,
  buildFinancialAdvisorSchema,
  buildGraph,
  buildPersonSchema,
} from "@/lib/seo";

type FeaturedService = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  priority?: number;
  shortDescription?: string;
};

type HomeData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaUrl?: string;
  featuredServices?: FeaturedService[];
  valueProps?: Array<{ title?: string; description?: string; icon?: string }>;
  trustSignals?: { carriersShown?: string[] };
} | null;

const FALLBACK_HERO_TITLE =
  "Decisiones financieras que protegen lo que más importa.";
const FALLBACK_HERO_SUBTITLE =
  "Asesoría especializada en seguros de vida, gastos médicos mayores y planeación patrimonial. MDRT Top of the Table · AMASFAC · Yale Wealth Management.";
const FALLBACK_CTA_TEXT = "Agenda consulta gratis 30 min";
const FALLBACK_CTA_URL = "https://calendly.com/iriatalan";

const FALLBACK_VALUE_PROPS = [
  {
    title: "Élite global en seguros",
    description:
      "MDRT Top of the Table — distinción reservada al top mundial de la industria.",
  },
  {
    title: "6 aseguradoras, una asesora",
    description:
      "Sura, MetLife, Allianz, Seguros Monterrey NYL, AXA, GNP. Comparamos para ti.",
  },
  {
    title: "Educación de élite",
    description:
      "Yale Wealth Management · LSE MBA Essentials · Tec de Monterrey · BMV · IMEF.",
  },
];

const FALLBACK_FEATURED_SERVICES: FeaturedService[] = [
  {
    _id: "fallback-vida",
    title: "Seguros de Vida",
    slug: "seguros-vida",
    category: "vida_pillar",
    shortDescription:
      "Protección financiera para tu familia con productos de las mejores aseguradoras de México.",
  },
  {
    _id: "fallback-gmm",
    title: "Gastos Médicos Mayores",
    slug: "gmm",
    category: "gmm_pillar",
    shortDescription:
      "Cobertura médica privada con red de hospitales y deducibles a tu medida.",
  },
];

export default async function HomePage() {
  const [data, author] = await Promise.all([
    sanityFetch<HomeData>({
      query: HOME_PAGE_QUERY,
      tags: ["homePage"],
    }).catch(() => null),
    sanityFetch<AuthorData | null>({
      query: SOBRE_IRIA_QUERY,
      tags: ["author"],
    }).catch(() => null),
  ]);

  const heroTitle = data?.heroTitle ?? FALLBACK_HERO_TITLE;
  const heroSubtitle = data?.heroSubtitle ?? FALLBACK_HERO_SUBTITLE;
  const ctaText = data?.heroCtaText ?? FALLBACK_CTA_TEXT;
  const ctaUrl = data?.heroCtaUrl ?? FALLBACK_CTA_URL;
  const valueProps =
    data?.valueProps && data.valueProps.length > 0
      ? data.valueProps
      : FALLBACK_VALUE_PROPS;
  const services =
    data?.featuredServices && data.featuredServices.length > 0
      ? data.featuredServices
      : FALLBACK_FEATURED_SERVICES;
  const carriers =
    data?.trustSignals?.carriersShown ??
    ["BUPA", "MetLife", "Allianz", "Seguros Monterrey NYL", "AXA", "GNP"];

  const homeSchema = author
    ? buildGraph(
        buildPersonSchema(author),
        buildFinancialAdvisorSchema(author)
      )
    : null;

  return (
    <>
      {homeSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
        />
      )}

      <main className="flex flex-col">
        <section className="px-6 py-24 sm:py-32 max-w-5xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50 max-w-3xl">
            {heroTitle}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              {ctaText}
            </a>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Aseguradoras autorizadas
            </p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-zinc-700 dark:text-zinc-300">
              {carriers.map((c) => (
                <span key={c} className="font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Servicios prioritarios
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <Link
                key={s._id}
                href={`/${s.slug}`}
                className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                  {s.category === "vida_pillar" || s.category === "gmm_pillar"
                    ? "⭐ Pillar"
                    : s.category}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {s.title}
                </h3>
                {s.shortDescription && (
                  <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {s.shortDescription}
                  </p>
                )}
                <span className="mt-5 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline">
                  Conocer →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Por qué clientes mass-affluent y HNWI confían en RIF
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {valueProps.map((vp, i) => (
                <div key={i}>
                  <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {vp.title}
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {vp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 max-w-5xl mx-auto w-full">
          <div className="rounded-3xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 p-12 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl mx-auto">
              30 minutos pueden cambiar la trayectoria financiera de tu familia.
            </h2>
            <p className="mt-4 text-lg opacity-80 max-w-xl mx-auto">
              Consulta gratuita, sin compromiso. Te escucho primero.
            </p>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              {ctaText}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
