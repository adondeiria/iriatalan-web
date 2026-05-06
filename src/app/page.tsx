import Image from "next/image";
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
  "Universidad, retiro, GMM, patrimonio: las decisiones que hoy nadie te enseña a planear.";
const FALLBACK_HERO_SUBTITLE =
  "Asesoría financiera personalizada en México. Desde tus primeros $2,000 MXN al mes hasta estructuras patrimoniales complejas. MDRT Top of the Table · AMASFAC · Yale Wealth Management.";
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
      "BUPA, MetLife, Allianz, Seguros Monterrey NYL, AXA, GNP. Según tu situación, te recomiendo la(s) más adecuada(s).",
  },
  {
    title: "Educación de élite",
    description:
      "Yale Wealth Management · LSE MBA Essentials · Tec de Monterrey · BMV · IMEF.",
  },
];

const FALLBACK_FEATURED_SERVICES: FeaturedService[] = [
  {
    _id: "fallback-retiro",
    title: "Planeación de Retiro",
    slug: "retiro",
    category: "vida_pillar",
    shortDescription:
      "PPR con beneficio fiscal (art. 151 fracc V y art. 185 LISR) + Modalidad 40 IMSS para multiplicar tu pensión vitalicia.",
  },
  {
    _id: "fallback-gmm",
    title: "Gastos Médicos Mayores",
    slug: "gmm",
    category: "gmm_pillar",
    shortDescription:
      "Cobertura médica privada con red, deducible y cobertura internacional adaptados. Trabajo con 6 aseguradoras AAA y te recomiendo la(s) adecuada(s).",
  },
  {
    _id: "fallback-empresas",
    title: "Seguros para Empresas",
    slug: "empresas",
    category: "empresas",
    shortDescription:
      "Persona Clave (Hombre Clave), Vida grupo, GMM colectivo, buy-sell agreement asegurado y plan de retiro empresarial.",
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
        <section className="relative w-full overflow-hidden">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="/img/nichos/hero-homepage.png"
              alt="Familia mexicana animando a sus hijos en un partido de fútbol escolar"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20 max-w-5xl mx-auto w-full">
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

        <section className="px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Asesoría especializada
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Por situación de vida — territorios donde la asesoría genérica falla.
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Hay tres perfiles que la industria de seguros y planeación patrimonial no cubre bien.
              Por eso construí espacios específicos para cada uno.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <Link
                href="/mujeres"
                className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition flex flex-col"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                  Para mujeres
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Mujeres que toman decisiones
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                  Profesionistas, divorciadas, viudas y empresarias.
                  Cuatro perfiles, cuatro estrategias específicas.
                </p>
                <span className="mt-5 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline">
                  Conocer →
                </span>
              </Link>

              <Link
                href="/familias-arcoiris"
                className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition flex flex-col"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                  Familias diversas
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Familias arcoíris con hijos
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                  Estructuras legales para que la ley reconozca a tu familia
                  tal como tú la construiste.
                </p>
                <span className="mt-5 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline">
                  Conocer →
                </span>
              </Link>

              <Link
                href="/hijos-neurodivergentes"
                className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition flex flex-col"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                  Cuidado vitalicio
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Hijos neurodivergentes
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                  Planeación financiera de por vida — más allá de la
                  universidad, más allá de tu propia vida.
                </p>
                <span className="mt-5 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline">
                  Conocer →
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <Link
              href="/patrimonial"
              className="group block p-10 sm:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Servicio diferenciado
                  </p>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Patrimonios complejos · Asesoría discreta para HNWI
                  </h2>
                  <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Fideicomisos, sucesión, inversiones complejas y estructuras
                    internacionales. Para patrimonios donde los productos estándar dejan
                    de ser suficientes.
                  </p>
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline whitespace-nowrap">
                  Conocer →
                </span>
              </div>
            </Link>
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
