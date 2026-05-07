import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../sanity/lib/fetch";
import { HOME_PAGE_QUERY, SOBRE_IRIA_QUERY } from "../../sanity/lib/queries";
import {
  AuthorData,
  buildFinancialAdvisorSchema,
  buildGraph,
  buildLocalBusinessSchema,
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
  "Planeación patrimonial, seguros y retiro para personas, familias y empresas en México";
const FALLBACK_HERO_SUBTITLE =
  "Asesoría especializada para proteger tu salud, tu patrimonio, tu retiro y la continuidad financiera de tu familia o empresa.";
const FALLBACK_CTA_TEXT = "Agenda consulta gratis 30 min";
const FALLBACK_CTA_URL = "https://calendly.com/iriatalan";

const AUTHORITY_BADGES = [
  "Asesora desde 2008",
  "MDRT Top of the Table",
  "Cédula CNSF V388618",
  "Yale Wealth Management",
  "LSE MBA Essentials",
  "6 aseguradoras autorizadas",
];

const PARA_QUIEN = [
  {
    label: "Profesionistas independientes",
    desc: "Médicos, abogados, arquitectos — ingresos variables, ISR alto, sin prestaciones.",
  },
  {
    label: "Empresarios",
    desc: "Dueños de empresa que necesitan proteger continuidad operativa y patrimonio personal.",
  },
  {
    label: "Familias con patrimonio",
    desc: "Quien tiene qué proteger y quiere hacerlo con una estrategia coherente, no producto a producto.",
  },
  {
    label: "Mujeres que toman decisiones",
    desc: "Divorciadas, viudas, profesionistas, empresarias con agenda financiera propia.",
  },
  {
    label: "Familias con hijos neurodivergentes",
    desc: "Planeación patrimonial que trasciende la vida de los padres — fideicomiso + seguros coordinados.",
  },
  {
    label: "Empresas que protegen talento clave",
    desc: "Persona Clave, Vida grupo, GMM colectivo, retiro empresarial deducible.",
  },
  {
    label: "Retiro con estrategia fiscal",
    desc: "PPR + Modalidad 40 coordinados con tu declaración anual SAT para maximizar deducción.",
  },
];

const INDUSTRIA_SILENCIOS = [
  {
    title: "Pensión multiplicada 5-8x — si no abandonas el plan a la mitad",
    body: "Mucha gente sabe que Modalidad 40 IMSS puede multiplicar tu pensión 5-8x — pero casi nadie planea cómo va a pagar la cotización mensual durante los años que dura. Sin un vehículo de ahorro alimentándola (Seguro de Ahorro / Retiro o Fondo de Inversión a edad 55-60 años), la cuota se vuelve insostenible y la estrategia se cancela a medio camino. Lo correcto: emparejar Modalidad 40 con un plan de retiro que la financie y garantice.",
  },
  {
    title: "Universidades privadas más caras cada año, sin plan dedicado",
    body: "Una colegiatura privada en México puede superar los $45,000 MXN al mes. Una universidad nacional privada buena, varios cientos de miles al año. Una internacional, mucho más. Y el costo educativo sube por encima de la inflación general, año tras año. La mayoría de papás ahorra \"lo que pueda\" — sin plan dedicado, sin un vehículo asegurador que complete las cuotas si tú llegas a faltar, sin cobertura específica para universidad nacional o internacional. Cuando llega el momento, la cuenta no alcanza.",
  },
  {
    title: "Retiro deducible — la gente lo contrata por la deducción, no por el retiro",
    body: "Hoy la mayoría que contrata un PPR (Plan Personal de Retiro) lo hace por la deducción fiscal, no por la pensión a futuro. Y tiene lógica: te devuelve hasta 30-35% vía SAT cada año (Art. 151 fracc V LISR, hasta el tope deducible — alrededor de $213,973 MXN en 2026). Si además te construye fondo para retiro, son dos beneficios en uno. El error es no usarlo cuando estás dentro del rango de ingreso donde la deducción te aplica.",
  },
  {
    title: "Beneficiarios desactualizados",
    body: "Divorcios, hijos nuevos, segundas parejas, socios que entran y salen. La mayoría de pólizas tienen beneficiarios que ya no reflejan la realidad del cliente. Cuando llega el siniestro, el dinero llega a la persona equivocada — y no hay vuelta atrás. Revisar designación cada vez que tu vida cambia no es paranoia — es disciplina patrimonial básica.",
  },
  {
    title: "Empresas sin Persona Clave",
    body: "El dueño generalmente no se asegura para la empresa que construyó. Muchos socios mexicanos lo descubren tarde — el día que pasa algo y la operación se queda sin liquidez para resolver lo inmediato: pagos a proveedores, nómina, transición de mando, búsqueda de reemplazo. La estructura correcta: un seguro de Persona Clave donde la empresa es beneficiaria de la suma asegurada sobre el dueño (o sobre cualquier persona insustituible). Cuando llega el momento, la empresa tiene capital para sobrevivir el bache — no para liquidarse.",
  },
  {
    title: "Hijos neurodivergentes sin estructura financiera",
    body: "Padres y madres piensan en seguros generales, pero pocos en estructuras específicas que protejan financieramente a su hijo de por vida. La estructura que recomiendo: un seguro de vida cuya suma asegurada va, vía designación irrevocable, a un fideicomiso que invierte el capital y le genera una pensión mensual al hijo — junto con un seguro de retiro con pensión vitalicia adicional. Dos fuentes de ingreso garantizadas para cuando tú ya no estás, sin sucesiones lentas ni tutores no idóneos.",
  },
  {
    title: "Sucesión patrimonial sin fideicomiso vía aseguradora",
    body: "Para patrimonios complejos, un testamento solo no basta. La estructura más limpia que existe: un seguro de vida con designación irrevocable de beneficiario hacia un fideicomiso. Eso permite que el capital llegue al heredero correcto en semanas (no en años de juicio sucesorio), con eficiencia fiscal y sin quedarse atrapado en disputas familiares. No estructuro fideicomisos notariales puros — los armo a través del vehículo aseguradora porque ahí vive la liquidez inmediata, no en patrimonio inmovilizado que tarda años en disolverse.",
  },
];

const METODOLOGIA = [
  {
    n: "01",
    title: "Diagnóstico",
    desc: "Entiendo tu situación: ingresos, familia, patrimonio, cobertura existente y objetivos.",
  },
  {
    n: "02",
    title: "Comparativo entre aseguradoras",
    desc: "Analizo las 6 aseguradoras autorizadas y te presento las que mejor se adaptan a tu perfil.",
  },
  {
    n: "03",
    title: "Diseño de estrategia",
    desc: "Una propuesta coherente que cubre salud, retiro, patrimonio y continuidad — no productos sueltos.",
  },
  {
    n: "04",
    title: "Implementación",
    desc: "Coordino la contratación y verifico cada detalle de las pólizas antes de firmar.",
  },
  {
    n: "05",
    title: "Acompañamiento anual",
    desc: "Revisamos cada año: cambian las UMAs, la legislación fiscal, tu situación familiar.",
  },
  {
    n: "06",
    title: "Acompañamiento en siniestros",
    desc: "No te dejo sola con el call center de la aseguradora. Estoy contigo en el proceso.",
  },
];

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
      "Persona Clave, Vida grupo, GMM colectivo, buy-sell agreement asegurado y plan de retiro empresarial.",
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
        buildFinancialAdvisorSchema(author),
        buildLocalBusinessSchema(author)
      )
    : buildGraph(buildLocalBusinessSchema());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      <main className="flex flex-col">
        {/* Hero image */}
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

        {/* Hero text + authority badges + CTAs */}
        <section className="px-6 py-10 sm:py-20 max-w-5xl mx-auto w-full">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50 max-w-3xl">
            {heroTitle}
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-zinc-700 dark:text-zinc-300 max-w-2xl leading-relaxed">
            {heroSubtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {AUTHORITY_BADGES.map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
              >
                {badge}
              </span>
            ))}
          </div>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
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

        {/* Carriers */}
        <section className="px-6 py-8 sm:py-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Aseguradoras autorizadas
            </p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-rif-gris dark:text-zinc-300">
              {carriers.map((c) => (
                <span key={c} className="font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Lo que la industria NO te explica */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Diferenciación
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight max-w-3xl">
              Lo que normalmente NO te explica la industria financiera
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl italic">
              No vendo seguros. Diagnostico decisiones que la industria suele dejar sin nombrar.
            </p>
            <div className="mt-10 sm:mt-12 grid gap-6 sm:gap-8 sm:grid-cols-2">
              {INDUSTRIA_SILENCIOS.map((item, i) => (
                <div
                  key={item.title}
                  className="border-l-2 border-rif-rojo pl-5"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-rojo font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-800 dark:text-zinc-200 italic leading-relaxed max-w-2xl">
                ¿Reconoces alguno de estos en tu situación? Hagamos diagnóstico antes de que sea decisión.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition"
              >
                Agenda diagnóstico gratuito
              </Link>
            </div>
          </div>
        </section>

        {/* Para quién */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Para quién es esta asesoría
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">
              La asesoría genérica no alcanza para estos perfiles.
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
              Trabajo con personas que tienen necesidades financieras complejas o que la
              industria de seguros ha ignorado históricamente.
            </p>
            <div className="mt-8 sm:mt-10 grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PARA_QUIEN.map((item) => (
                <div
                  key={item.label}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                >
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Servicios prioritarios */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Servicios prioritarios
          </h2>
          <div className="mt-6 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <Link
                key={s._id}
                href={`/${s.slug}`}
                className="group p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
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

        {/* Por qué confían en RIF */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Por qué clientes afluentes y HNWI confían en RIF
            </h2>
            <div className="mt-6 sm:mt-10 grid gap-5 sm:gap-8 sm:grid-cols-3">
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

        {/* Metodología */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Metodología
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Cómo trabajamos juntos.
            </h2>
            <div className="mt-8 sm:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {METODOLOGIA.map((step) => (
                <div
                  key={step.n}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="text-2xl font-semibold text-rif-rojo tabular-nums">
                    {step.n}
                  </div>
                  <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por situación de vida */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800">
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
            <div className="mt-6 sm:mt-10 grid gap-4 sm:gap-6 sm:grid-cols-3">
              <Link
                href="/mujeres"
                className="group p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition flex flex-col"
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
                className="group p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition flex flex-col"
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
                className="group p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition flex flex-col"
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

        {/* Patrimonios complejos */}
        <section className="px-6 py-12 sm:py-20 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <Link
              href="/patrimonial"
              className="group block p-8 sm:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
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

        {/* Final CTA */}
        <section className="px-6 py-12 sm:py-24 max-w-5xl mx-auto w-full">
          <div className="rounded-3xl bg-rif-rojo text-white p-10 sm:p-16 text-center">
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
