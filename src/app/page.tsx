import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Compass,
  FileText,
  Heart,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { sanityFetch } from "../../sanity/lib/fetch";
import { HOME_PAGE_QUERY, SOBRE_IRIA_QUERY } from "../../sanity/lib/queries";
import {
  AuthorData,
  buildFinancialAdvisorSchema,
  buildGraph,
  buildLocalBusinessSchema,
  buildPersonSchema,
} from "@/lib/seo";

type HomeData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaUrl?: string;
} | null;

const FALLBACK_HERO_TITLE = "Protegemos hoy lo que te importa mañana.";
const FALLBACK_HERO_SUBTITLE =
  "Estrategias personalizadas para personas, familias y empresas que buscan seguridad, crecimiento y legado.";
const FALLBACK_CTA_TEXT = "Agenda sesión inicial";
const FALLBACK_CTA_URL = "https://calendly.com/iriatalan";

const CREDENCIALES = [
  "Desde 2008",
  "MDRT Top of the Table",
  "Yale Wealth Management",
  "LSE MBA Essentials",
  "Cédula CNSF V388618",
];

const SERVICIOS = [
  {
    icon: Shield,
    title: "Protección Patrimonial",
    desc: "Estrategias para blindar lo que ya construiste.",
    href: "/patrimonial",
  },
  {
    icon: Heart,
    title: "Seguros Personales",
    desc: "Vida, GMM y planes educacionales con vehículo asegurador.",
    href: "/gmm",
  },
  {
    icon: BarChart3,
    title: "Retiro e Inversiones",
    desc: "PPR deducible, Modalidad 40 y fondos a edad 55-60.",
    href: "/retiro",
  },
  {
    icon: Users,
    title: "Planeación Familiar",
    desc: "Hijos neurodivergentes, familias diversas y sucesión.",
    href: "/hijos-neurodivergentes",
  },
  {
    icon: Briefcase,
    title: "Empresas y Persona Clave",
    desc: "Continuidad operativa con vida grupal y persona clave.",
    href: "/empresas",
  },
];

const PARA_QUIEN = [
  "Profesionistas independientes con ISR alto",
  "Empresarios que protegen continuidad y patrimonio",
  "Familias afluentes con estrategia patrimonial coherente",
  "Mujeres con agenda financiera propia",
  "Familias con hijos neurodivergentes",
  "Empresas que blindan talento clave",
  "Quien planea retiro con estrategia fiscal",
];

const METODOLOGIA = [
  { icon: Search, label: "Analizamos" },
  { icon: Compass, label: "Diseñamos" },
  { icon: FileText, label: "Implementamos" },
  { icon: Sparkles, label: "Acompañamos" },
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

const INSIGHTS = [
  {
    category: "Retiro e Inversiones",
    title: "Modalidad 40 IMSS: cuándo sí y cuándo no conviene",
    href: "/retiro",
    image: "/img/servicios/retiro-hero.png",
  },
  {
    category: "Seguros Personales",
    title: "Errores comunes en seguros de gastos médicos mayores",
    href: "/gmm",
    image: "/img/servicios/gmm-hero.png",
  },
  {
    category: "Planeación Familiar",
    title: "Cómo proteger financieramente a un hijo neurodivergente",
    href: "/hijos-neurodivergentes",
    image: "/img/nichos/hijos-neurodivergentes-hero.png",
  },
  {
    category: "Patrimonial",
    title: "Mexicanos en el extranjero: productos mexicanos que tu país no tiene",
    href: "/mexicanos-en-el-extranjero",
    image: "/img/servicios/patrimonial-hero.png",
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
        {/* HERO — dark editorial split */}
        <section className="relative bg-zinc-950 text-zinc-50 overflow-hidden">
          <div className="px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24 max-w-6xl mx-auto w-full">
            <div className="grid gap-10 lg:gap-20 lg:grid-cols-[6fr_5fr] lg:items-center">
              <div>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-rif-rojo">
                  Planeación patrimonial estratégica
                </p>
                <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-zinc-50">
                  {heroTitle}
                </h1>
                <p className="mt-5 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                  {heroSubtitle}
                </p>
                <div className="mt-7">
                  <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full bg-rif-rojo text-white px-8 py-4 text-sm font-medium tracking-wide hover:opacity-90 transition"
                  >
                    {ctaText}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={2.2} />
                  </a>
                </div>
                <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                  {CREDENCIALES.map((c, i) => (
                    <li key={c} className="flex items-center gap-3 sm:gap-6">
                      {i > 0 && <span className="hidden lg:inline text-zinc-700">·</span>}
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-[3/4] rounded-3xl overflow-hidden">
                <Image
                  src="/img/iria/iria-hero-01.jpg"
                  alt="Iria Talan, asesora financiera RIF — MDRT Top of the Table, Cédula CNSF V388618"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICIOS — 5 cards iconográficas */}
        <section className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
          <div className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-0 lg:divide-x lg:divide-zinc-200 lg:dark:divide-zinc-800">
            {SERVICIOS.map(({ icon: Icon, title, desc, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center text-center px-6 lg:px-5"
              >
                <Icon
                  className="size-9 text-rif-rojo"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-6 font-serif text-lg leading-snug text-zinc-900 dark:text-zinc-50">
                  {title}
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {desc}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-rif-rojo group-hover:gap-2 transition-all">
                  Ver más
                  <ArrowRight className="size-3" strokeWidth={2.2} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* PARA QUIÉN — bullets cortos */}
        <section className="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
          <div className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
            <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
              <div>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-rif-rojo">
                  Para quién
                </p>
                <h2 className="mt-6 font-serif text-3xl sm:text-4xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
                  La asesoría genérica no alcanza para ciertos perfiles.
                </h2>
              </div>
              <ul className="space-y-3">
                {PARA_QUIEN.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 text-base sm:text-lg text-zinc-800 dark:text-zinc-200"
                  >
                    <span className="mt-2 inline-block size-1.5 rounded-full bg-rif-rojo flex-shrink-0" aria-hidden />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* PLANEACIÓN CON PROPÓSITO — dark editorial split */}
        <section className="bg-zinc-950 text-zinc-50">
          <div className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
            <div className="grid gap-12 lg:gap-16 lg:grid-cols-[5fr_6fr] lg:items-center">
              <div>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-rif-rojo">
                  Planeación con propósito
                </p>
                <h2 className="mt-6 font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-zinc-50">
                  No se trata solo de tener un plan, sino de tener el correcto.
                </h2>
                <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl">
                  Mi enfoque es integral, independiente y 100% personalizado. Trabajo contigo para entender tu historia, tus objetivos y lo que realmente te importa, para diseñar estrategias que generen tranquilidad hoy y legado mañana.
                </p>
                <div className="mt-8">
                  <Link
                    href="/sobre-iria"
                    className="group inline-flex items-center gap-2 text-rif-rojo text-xs sm:text-sm font-medium uppercase tracking-[0.18em] hover:gap-3 transition-all"
                  >
                    Conoce más sobre mí
                    <ArrowRight className="size-4" strokeWidth={2.2} />
                  </Link>
                </div>
              </div>
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-900">
                <Image
                  src="/img/proposito-cuaderno.jpg"
                  alt="Cuaderno de trabajo con pluma fountain — planeación patrimonial"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ASESORÍA / METODOLOGÍA / RESULTADOS — 3-col with dark center */}
        <section className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Col 1 — Asesoría en la que puedes confiar */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-rif-rojo">
                Asesoría en la que puedes confiar
              </p>
              <p className="mt-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Más de 17 años acompañando a personas, familias y empresas en decisiones financieras y patrimoniales clave.
              </p>
              <div className="mt-10">
                <p className="font-serif text-5xl text-rif-rojo tabular-nums">+17</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Años de experiencia
                </p>
              </div>
            </div>

            {/* Col 2 — Metodología integral (dark) */}
            <div className="bg-zinc-950 text-zinc-50 rounded-3xl p-8 sm:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-rif-rojo">
                Metodología integral
              </p>
              <p className="mt-6 text-zinc-300 leading-relaxed">
                Analizamos tu situación actual, definimos objetivos claros y diseñamos un plan personalizado para alcanzarlos.
              </p>
              <div className="mt-10 grid grid-cols-4 items-start gap-2">
                {METODOLOGIA.map(({ icon: Icon, label }, i) => (
                  <div key={label} className="flex flex-col items-center text-center relative">
                    {i > 0 && (
                      <span
                        aria-hidden
                        className="absolute -left-1/2 top-5 w-full border-t border-dashed border-zinc-700"
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-center size-10 rounded-full bg-zinc-950 ring-1 ring-rif-rojo/40">
                      <Icon className="size-5 text-rif-rojo" strokeWidth={1.6} aria-hidden />
                    </div>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-zinc-400 leading-snug">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3 — Resultados que trascienden */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-rif-rojo">
                Resultados que trascienden
              </p>
              <p className="mt-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Estrategias que protegen tu patrimonio, optimizan tus recursos y construyen un legado para futuras generaciones.
              </p>
              <div className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-xs uppercase tracking-[0.18em] text-zinc-700 dark:text-zinc-300">
                <span>Legado</span>
                <span className="text-rif-rojo">·</span>
                <span>Tranquilidad</span>
                <span className="text-rif-rojo">·</span>
                <span>Futuro</span>
              </div>
            </div>
          </div>
        </section>

        {/* LO QUE NO TE EXPLICAN — sección diferenciador */}
        <section className="bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
          <div className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-rif-rojo">
              Diferenciación
            </p>
            <h2 className="mt-6 font-serif text-3xl sm:text-4xl leading-tight tracking-tight max-w-3xl text-zinc-900 dark:text-zinc-50">
              Lo que normalmente NO te explica la industria financiera
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed italic max-w-2xl">
              No vendo seguros. Diagnostico decisiones que la industria suele dejar sin nombrar.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {INDUSTRIA_SILENCIOS.map((item, i) => (
                <div key={item.title} className="border-l-2 border-rif-rojo pl-5">
                  <div className="text-xs uppercase tracking-wider text-rif-rojo font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 font-serif text-lg text-zinc-900 dark:text-zinc-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-800 dark:text-zinc-200 italic leading-relaxed max-w-2xl">
                ¿Reconoces alguno de estos en tu situación? Hagamos diagnóstico antes de que sea decisión.
              </p>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-full bg-rif-rojo text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
              >
                Agenda sesión inicial
                <ArrowRight className="size-4" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </section>

        {/* INSIGHTS DESTACADOS */}
        <section className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-rif-rojo">
                Insights destacados
              </p>
              <h2 className="mt-6 font-serif text-3xl sm:text-4xl leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
                Lectura recomendada
              </h2>
            </div>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {INSIGHTS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-rif-rojo font-medium">
                  {item.category}
                </p>
                <h3 className="mt-3 font-serif text-lg leading-snug text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 group-hover:gap-2 transition-all">
                  Leer más
                  <ArrowRight className="size-3" strokeWidth={2.2} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-rif-rojo text-white">
          <div className="px-6 py-20 sm:py-24 max-w-4xl mx-auto w-full text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
              Hablemos de tu patrimonio y tu futuro.
            </h2>
            <p className="mt-5 text-base sm:text-lg opacity-90 max-w-xl mx-auto leading-relaxed">
              Sesión inicial sin compromiso. Te escucho primero, recomiendo después.
            </p>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white text-rif-rojo px-8 py-4 text-sm font-medium tracking-wide hover:opacity-90 transition"
            >
              {ctaText}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" strokeWidth={2.2} />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
