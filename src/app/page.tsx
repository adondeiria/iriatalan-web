import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  Compass,
  FileText,
  GraduationCap,
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
  buildFAQPageSchema,
  buildFinancialAdvisorSchema,
  buildGraph,
  buildLocalBusinessSchema,
  buildPersonSchema,
  type FAQItem,
} from "@/lib/seo";

type HomeData = {
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaUrl?: string;
} | null;

const FALLBACK_HERO_TITLE =
  "Estrategias de seguros, retiro y patrimonio para pagar mejor tu futuro, optimizar impuestos y proteger lo que ya construiste.";
const FALLBACK_HERO_SUBTITLE =
  "Te acompaño a tomar decisiones inteligentes en seguros, ahorro y retiro — sin complicaciones, sin promesas irreales y pensando en tu mayor beneficio.";
const FALLBACK_CTA_TEXT = "Agenda tu sesión inicial";
const FALLBACK_CTA_URL = "/contacto#agendar";

const CREDENCIALES = [
  { icon: Calendar, label: "Desde 2008" },
  { icon: Award, label: "MDRT Top of the Table" },
  { icon: GraduationCap, label: "Yale Wealth Management" },
  { icon: BookOpen, label: "LSE MBA Essentials" },
  { icon: BadgeCheck, label: "Cédula CNSF V388618" },
];

const SERVICIOS = [
  {
    icon: Shield,
    title: "Protección Patrimonial y Fideicomisos",
    desc: "Estrategias para blindar lo que ya construiste.",
    href: "/patrimonial",
  },
  {
    icon: Heart,
    title: "Seguros de Vida, Ahorro, y Gastos Médicos Mayores",
    desc: "Educacionales, ahorro, mujeres, retiro deducible, GMM, vida vitalicios y con fideicomiso.",
    href: "/gmm",
  },
  {
    icon: BarChart3,
    title: "Retiro: PPR, seguros de retiro y ahorro para garantizar Modalidad 40",
    desc: "PPR, Seguro de Ahorro para Modalidad 40 y fondos a edad 55-60.",
    href: "/retiro",
  },
  {
    icon: Users,
    title: "Planeación Familiar",
    desc: "Hijos neurodivergentes, familias diversas, sucesiones y herencias.",
    href: "/personas/hijos-neurodivergentes",
  },
  {
    icon: Briefcase,
    title: "Empresas y Persona Clave",
    desc: "Si el dueño falta, la empresa no termina.",
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
    title: "Modalidad 40 — pensión dorada, si no abandonas el plan a la mitad",
    body: "Mucha gente sabe que Modalidad 40 IMSS puede multiplicar tu pensión — pero casi nadie planea cómo va a pagar la mensualidad durante los 5 años que dura. Sin un esquema de ahorro que lo garantice (Seguro de Ahorro / Retiro o Fondo de Inversión a edad 55-60), la cuota se vuelve insostenible y se pierde la pensión máxima. Lo correcto: emparejar Modalidad 40 con un plan de retiro que la financie y garantice.",
    image: "/img/silencios/silencio-01-pension.png",
  },
  {
    title: "Universidades privadas más caras cada año, sin plan dedicado",
    body: "Una colegiatura privada en México puede superar los $45,000 MXN al mes. Una internacional, mucho más. Y el costo educativo incrementa anualmente por encima de la inflación. La mayoría de papás ahorra “lo que pueda” — sin plan dedicado, sin un seguro que complete las cuotas si tú llegas a faltar, sin cobertura específica para universidad nacional o internacional. Cuando llega el momento, el dinero no alcanza.",
    image: "/img/silencios/silencio-02-universidades.png",
  },
  {
    title: "Retiro deducible de impuestos — el instrumento perfecto",
    body: "Construye tu retiro con la ayuda de PPR (Plan Personal de Retiro): puede regresarte hasta el 35% en tu declaración anual, dependiendo de tu tasa marginal de ISR (Art. 151 fracc V LISR vigente, hasta el tope deducible — alrededor de $213,973 MXN en 2026, cifras vigentes a verificar al momento de contratar). A partir de los 65 años puedes recibir tu dinero en pago único o pensión vitalicia (y puede ser heredable), bajo el régimen fiscal aplicable a planes personales de retiro conforme a la normativa vigente.",
    image: "/img/silencios/silencio-03-ppr.png",
  },
  {
    title: "Beneficiarios desactualizados",
    body: "Divorcios, hijos nuevos, segundas parejas, socios que entran y salen. La mayoría de los seguros de vida tienen beneficiarios que ya no reflejan la realidad del cliente. Cuando llega el siniestro, el dinero llega a la persona equivocada — y no hay vuelta atrás. Revisar designación cada vez que tu vida cambia no es paranoia — es disciplina patrimonial básica.",
    image: "/img/silencios/silencio-04-beneficiarios.png",
  },
  {
    title: "Empresas sin Persona Clave",
    body: "El dueño generalmente no se asegura para la empresa que construyó. Muchos socios mexicanos lo descubren tarde — el día que pasa algo, la operación se queda sin liquidez para resolver problemas inmediatos, no tienen estructura de ahorro para retiro, transición de mando o búsqueda de reemplazos. La estructura correcta: un seguro de Persona Clave donde la empresa es beneficiaria sobre el dueño, socios o cualquier persona insustituible. El ahorro al término del plazo también lo recibe la empresa, así cuando llega el momento, hay capital para sobrevivir el bache — no para liquidarse.",
    image: "/img/silencios/silencio-05-empresas.png",
  },
  {
    title: "Hijos neurodivergentes sin estructura financiera",
    body: "Padres y madres piensan en seguros generales, pero pocos en estructuras específicas que protejan financieramente a su hijo de por vida. La estructura que recomiendo: un seguro de vida cuya suma asegurada va, vía designación irrevocable, a un fideicomiso que invierte el capital y le genera una pensión mensual al hijo — junto con un seguro de retiro con pensión vitalicia adicional. Dos fuentes de ingreso garantizadas para cuando tú ya no estás, sin sucesiones lentas ni tutores no idóneos.",
    image: "/img/silencios/silencio-06-neurodivergentes.png",
  },
  {
    title: "Sucesión patrimonial sin fideicomiso vía aseguradora",
    body: "Para patrimonios complejos, un testamento solo no basta. La estructura más limpia que existe: un seguro de vida con designación irrevocable de beneficiario hacia un fideicomiso. Eso permite que el capital llegue al heredero correcto en semanas (no en años de juicio sucesorio), con eficiencia fiscal y sin quedar atrapado en disputas familiares. No estructuro fideicomisos notariales puros — los armo a través del vehículo aseguradora porque ahí vive la liquidez inmediata, no en patrimonio inmovilizado que tarda años en disolverse.",
    image: "/img/silencios/silencio-07-sucesion.png",
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
    href: "/personas/hijos-neurodivergentes",
    image: "/img/nichos/hijos-neurodivergentes-hero.png",
  },
  {
    category: "Patrimonial",
    title: "Mexicanos en el extranjero: productos mexicanos que tu país no tiene",
    href: "/personas/mexicanos-en-el-extranjero",
    image: "/img/servicios/patrimonial-hero.png",
  },
];

const FAQS: FAQItem[] = [
  {
    question: "¿Qué hace una asesora patrimonial certificada y en qué se diferencia de un agente de seguros?",
    answerText:
      "Un agente de seguros coloca un producto puntual a tu necesidad inmediata. Una asesora patrimonial diseña una estrategia integral que conecta tu protección personal, retiro, optimización fiscal y planeación sucesoria — los seguros son una herramienta dentro de ese mapa, no el fin. En mi caso, además de la cédula CNSF V388618 como Agente de Seguros autorizada, tengo formación en Wealth Management por Yale University y MBA Essentials por la London School of Economics, soy MDRT Top of the Table (top global del sector), y trabajo con 6 aseguradoras AAA — sin cuota de ventas por ninguna. Eso me permite diseñar la solución alrededor de ti, no del producto del mes.",
  },
  {
    question: "¿Cuánto cuesta trabajar con Iria Talan?",
    answerText:
      "La primera sesión de diagnóstico (30-45 min) es sin costo y sin compromiso de contratar. A partir de ahí, la mayoría de los productos que recomiendo (seguros, GMM, PPR, inversiones) se pagan a través de una comisión pagada por la aseguradora — tú no me pagas honorarios separados por ellos. Para casos patrimoniales complejos que requieren diseño extensivo (estructuras corporativas, fideicomisos multi-vehículo, coordinación con tu equipo legal/fiscal) trabajamos honorarios separados, acordados con transparencia antes de empezar. Sin sorpresas, sin presión de venta — la conversación inicial sirve precisamente para entender qué necesitas y cómo se cobra.",
  },
  {
    question: "¿Con qué aseguradoras trabajas y por qué solo 6?",
    answerText:
      "Trabajo con las mejores aseguradoras AAA en México: GNP, BUPA, AXA, MetLife, Seguros Monterrey New York Life y Allianz. Las seleccioné por calificación financiera (todas AAA), historial de pago de siniestros, calidad de red hospitalaria/médica, y solvencia económica. Esto me permite recomendar el producto óptimo dentro de mi catálogo y darte servicio post-venta consistente.",
  },
  {
    question: "¿Cómo es la primera sesión y cuánto tarda?",
    answerText:
      "Dura entre 45 y 60 minutos, vía videollamada (zoom, meet o teams) o presencial si estás en CDMX. La estructura típica: (1) tu contexto — situación familiar, profesional, patrimonial actual; (2) tus prioridades y preocupaciones — qué te quita el sueño financieramente; (3) primera lectura de oportunidades concretas (no propuestas de venta, sino áreas a explorar); (4) siguientes pasos sugeridos sin compromiso. Sales con un mapa de prioridades. La decisión de avanzar es siempre tuya y a tu ritmo.",
  },
  {
    question: "¿Atiendes en toda la República o solo CDMX?",
    answerText:
      "Todo el mundo por videollamada — la mayoría de mis clientes está fuera de CDMX. Presencial me muevo principalmente en CDMX, con visitas ocasionales a otros estados según agenda y volumen de casos. Para mexicanos en el extranjero también atiendo vía videollamada y herramientas digitales firmadas — ver landing específica /personas/mexicanos-en-el-extranjero para detalles del flujo cross-border.",
  },
  {
    question: "¿En qué se diferencia una asesora MDRT Top of the Table de una asesora regular?",
    answerText:
      "MDRT (Million Dollar Round Table) es la asociación global del sector seguros que reconoce desempeño y estándares éticos. Top of the Table (TOT) es el nivel más alto — alrededor del 1% global de los asesores certificados MDRT alcanza este nivel cada año, generalmente por trabajar casos de mayor complejidad y volumen. En la práctica significa que el día a día son perfiles patrimoniales y casos transfronterizos, no colocación de seguros básicos. Para ti como cliente importa porque significa experiencia repetida con estructuras patrimoniales complejas, fideicomisos, sucesiones multi-jurisdicción y planeación fiscal compleja.",
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
        buildLocalBusinessSchema(author),
        buildFAQPageSchema(FAQS)
      )
    : buildGraph(buildLocalBusinessSchema(), buildFAQPageSchema(FAQS));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />

      <main className="flex flex-col">
        {/* HERO — cinematic dark editorial split */}
        <section className="relative bg-espresso text-cream-light texture-grain overflow-hidden">
          {/* burgundy ambient glow upper-right */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 size-[640px] rounded-full opacity-90"
            style={{
              background:
                "radial-gradient(circle, rgba(158,27,30,0.18) 0%, rgba(158,27,30,0.06) 35%, transparent 65%)",
            }}
          />
          {/* champagne ambient glow lower-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 size-[560px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,149,106,0.1) 0%, transparent 60%)",
            }}
          />

          <div className="relative px-6 pt-12 pb-14 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28 max-w-6xl mx-auto w-full">
            <div className="grid gap-12 lg:gap-20 lg:grid-cols-[6fr_5fr] lg:items-center">
              <div>
                <p className="animate-fade-up text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                  Planeación patrimonial estratégica
                </p>
                <h1 className="animate-fade-up stagger-1 mt-7 font-serif font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] text-cream-light">
                  {heroTitle}
                </h1>
                <p className="animate-fade-up stagger-2 mt-7 text-base sm:text-lg text-cream-light/75 leading-relaxed max-w-xl">
                  {heroSubtitle}
                </p>
                <div className="animate-fade-up stagger-3 mt-9">
                  <a
                    href={ctaUrl}
                    className="group inline-flex items-center gap-3 rounded-full bg-burgundy text-cream-light px-8 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition-all duration-500 shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] hover:shadow-[0_20px_48px_-12px_rgba(158,27,30,0.75)] hover:-translate-y-0.5"
                  >
                    {ctaText}
                    <ArrowRight
                      className="size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                      strokeWidth={2}
                    />
                  </a>
                </div>
                <ul className="animate-fade-up stagger-4 mt-12 grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-7">
                  {CREDENCIALES.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex flex-col items-start gap-2 text-cream-light/65"
                    >
                      <Icon
                        className="size-5 text-burgundy"
                        strokeWidth={1.6}
                        aria-hidden
                      />
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] leading-[1.35] max-w-[120px]">
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="animate-scale-in stagger-2 relative w-full max-w-md mx-auto lg:max-w-none aspect-[3/4] rounded-2xl overflow-hidden hero-frame vignette">
                <Image
                  src="/img/iria/iria-sitting-hero-dark.jpg"
                  alt="Iria Talan, asesora financiera RIF — MDRT Top of the Table, Cédula CNSF V388618"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICIOS — 5 cards iconográficas, más aire */}
        <section className="bg-cream-light px-6 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto w-full">
            <h2 className="sr-only">Servicios</h2>
            <div className="grid gap-y-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-0 lg:divide-x lg:divide-warm-brown/15">
              {SERVICIOS.map(({ icon: Icon, title, desc, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col items-center text-center px-6 lg:px-7"
                >
                  <Icon
                    className="size-10 text-burgundy transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-1"
                    strokeWidth={1.4}
                    aria-hidden
                  />
                  <h3 className="mt-7 font-serif text-2xl leading-[1.15] text-ink">
                    {title}
                  </h3>
                  <p className="mt-4 text-sm text-warm-brown/80 leading-relaxed max-w-[200px]">
                    {desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PARA QUIÉN — perfiles que sirvo (restaurada con paleta luxury) */}
        <section className="bg-cream-light border-y border-warm-brown/15">
          <div className="px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
            <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
              <div>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                  Para quién
                </p>
                <h2 className="mt-6 font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.01em] text-ink">
                  La asesoría genérica no alcanza para ciertos perfiles.
                </h2>
              </div>
              <ul className="space-y-4">
                {PARA_QUIEN.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 text-base sm:text-lg text-warm-brown leading-relaxed"
                  >
                    <span
                      className="mt-2.5 inline-block size-1.5 rounded-full bg-burgundy flex-shrink-0"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* PLANEACIÓN CON PROPÓSITO — dark cinematic editorial split */}
        <section className="relative bg-espresso text-cream-light texture-grain overflow-hidden">
          <div className="hairline-x-light absolute inset-x-0 top-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at center, rgba(184,149,106,0.08) 0%, transparent 60%)",
            }}
          />
          <div className="relative px-6 py-24 sm:py-32 max-w-6xl mx-auto w-full">
            <div className="grid gap-14 lg:gap-20 lg:grid-cols-[5fr_6fr] lg:items-center">
              <div>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.26em] text-burgundy">
                  Planeación con propósito
                </p>
                <h2 className="mt-9 font-serif font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em] text-cream-light">
                  <span className="italic font-extralight text-cream-light/55">
                    No se trata solo de tener un plan,
                  </span>
                  <br />
                  <span>sino de tener el correcto.</span>
                </h2>
                <p className="mt-9 text-base sm:text-lg text-cream-light/75 leading-relaxed max-w-xl">
                  Mi enfoque es integral, independiente y personalizado. Trabajo contigo para entender tu historia, tus objetivos y lo que realmente te importa — para diseñar estrategias que generen tranquilidad hoy y legado mañana.
                </p>
                <div className="mt-12">
                  <Link
                    href="/sobre-iria"
                    className="group link-underline inline-flex items-center gap-2 text-burgundy text-xs sm:text-sm font-medium uppercase tracking-[0.26em]"
                  >
                    Conoce más sobre mí
                    <ArrowRight
                      className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </Link>
                </div>
              </div>
              <div className="relative w-full max-w-lg lg:max-w-none mx-auto aspect-[4/3] rounded-2xl overflow-hidden hero-frame">
                <Image
                  src="/img/iria/notebook-editorial.png"
                  alt="Cuaderno editorial Iria Talan — planeación patrimonial"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          <div className="hairline-x-light absolute inset-x-0 bottom-0" />
        </section>

        {/* ASESORÍA / METODOLOGÍA / RESULTADOS */}
        <section className="bg-cream-light px-6 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="card-lift bg-cream border border-warm-brown/15 rounded-3xl p-8 sm:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-burgundy">
                  Asesoría en la que puedes confiar
                </p>
                <p className="mt-7 text-warm-brown/85 leading-relaxed">
                  Más de 18 años acompañando a personas, familias y empresas en decisiones financieras y patrimoniales clave.
                </p>
                <div className="mt-12">
                  <p className="font-serif text-6xl font-light text-burgundy tabular-nums leading-none">
                    +18
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.24em] text-warm-brown/60">
                    Años de experiencia
                  </p>
                </div>
              </div>

              <div className="card-lift bg-espresso text-cream-light rounded-3xl p-8 sm:p-10 texture-grain relative overflow-hidden">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-burgundy">
                  Metodología integral
                </p>
                <p className="mt-7 text-cream-light/80 leading-relaxed">
                  Analizamos tu situación actual, definimos objetivos claros y diseñamos un plan personalizado para alcanzarlos.
                </p>
                <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-7">
                  {METODOLOGIA.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 group">
                      <div className="flex items-center justify-center size-11 rounded-full ring-1 ring-burgundy/35 flex-shrink-0 transition-all duration-500 group-hover:ring-burgundy group-hover:bg-burgundy/10">
                        <Icon
                          className="size-5 text-burgundy transition-transform duration-500 group-hover:scale-110"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-cream-light/75">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-lift bg-cream border border-warm-brown/15 rounded-3xl p-8 sm:p-10">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-burgundy">
                  Resultados que trascienden
                </p>
                <p className="mt-7 text-warm-brown/85 leading-relaxed">
                  Estrategias que protegen tu patrimonio, optimizan tus recursos y construyen un legado para futuras generaciones.
                </p>
                <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.24em] text-warm-brown/85 font-medium">
                  <span>Legado</span>
                  <span className="text-burgundy">•</span>
                  <span>Tranquilidad</span>
                  <span className="text-burgundy">•</span>
                  <span>Futuro</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LO QUE NO TE EXPLICAN — horizontal scroll editorial */}
        <section className="bg-cream border-y border-warm-brown/10 overflow-hidden">
          <div className="px-6 py-20 sm:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                Diferenciación
              </p>
              <h2 className="mt-6 font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.01em] text-ink">
                Lo que normalmente NO te explica la industria financiera
              </h2>
              <p className="mt-5 text-warm-brown/75 leading-relaxed italic">
                No vendo seguros. Te ayudo a que tomes las decisiones correctas.
              </p>
            </div>
          </div>

          <div
            className="scrollbar-hide flex gap-6 sm:gap-8 overflow-x-auto pb-12 px-6 sm:px-12 lg:px-[max(3rem,calc((100vw-72rem)/2+3rem))] snap-x snap-mandatory scroll-smooth"
            style={{ scrollPaddingLeft: "1.5rem" }}
          >
            {INDUSTRIA_SILENCIOS.map((item, i) => (
              <article
                key={item.title}
                className="group flex-shrink-0 w-[300px] sm:w-[340px] snap-start"
              >
                <div className="img-zoom relative aspect-[4/3] rounded-2xl overflow-hidden bg-warm-brown/10 shadow-[0_16px_40px_-16px_rgba(20,17,15,0.25)] transition-shadow duration-500 group-hover:shadow-[0_24px_56px_-16px_rgba(20,17,15,0.35)]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 300px, 340px"
                    className="object-cover"
                  />
                </div>
                <div className="mt-6">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")} · Silencio
                  </p>
                  <h3 className="mt-3 font-serif text-xl leading-snug text-ink min-h-[3.5rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-warm-brown/85 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="px-6 max-w-6xl mx-auto w-full">
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 p-6 sm:p-8 rounded-2xl bg-cream-light border border-warm-brown/15">
              <p className="text-ink/85 italic leading-relaxed max-w-xl">
                ¿Reconoces alguno de estos en tu situación? Hagamos diagnóstico antes de que sea decisión.
              </p>
              <Link
                href="/contacto"
                className="group inline-flex items-center gap-2 rounded-full bg-burgundy text-cream-light px-7 py-4 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition-all duration-500 whitespace-nowrap hover:-translate-y-0.5"
              >
                Agenda sesión inicial
                <ArrowRight
                  className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
            </div>
            <p className="mt-6 text-center text-xs text-warm-brown/55 italic">
              Desliza horizontalmente para ver los 7 silencios →
            </p>
          </div>
        </section>

        {/* RECURSOS / INSIGHTS */}
        <section className="bg-cream-light px-6 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                Temas frecuentes
              </p>
              <h2 className="mt-5 font-serif font-light italic text-2xl sm:text-3xl leading-[1.3] text-ink/75">
                Explora un tema patrimonial
              </h2>
            </div>
            <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {INSIGHTS.map((item) => (
                <Link
                  key={item.href + item.title}
                  href={item.href}
                  className="group flex flex-col"
                >
                  <div className="img-zoom relative aspect-[4/3] rounded-2xl overflow-hidden bg-warm-brown/10 shadow-[0_12px_32px_-16px_rgba(20,17,15,0.18)] transition-shadow duration-500 group-hover:shadow-[0_24px_48px_-16px_rgba(20,17,15,0.28)]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium">
                    {item.category}
                  </p>
                  <h3 className="mt-3 font-serif text-xl leading-[1.2] text-ink transition-colors duration-500 group-hover:text-burgundy">
                    {item.title}
                  </h3>
                  <span className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-warm-brown group-hover:gap-2 transition-all duration-500">
                    Leer más
                    <ArrowRight className="size-3" strokeWidth={2} />
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-16 text-center">
              <Link
                href="/recursos"
                className="link-underline inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-burgundy"
              >
                Ver todos los artículos
                <ArrowRight className="size-3" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-cream-light border-t border-warm-brown/15 px-6 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto w-full">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                Preguntas frecuentes
              </p>
              <h2 className="mt-5 font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.01em] text-ink">
                Lo que más nos preguntan
              </h2>
            </div>
            <div className="mt-14 space-y-3">
              {FAQS.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-warm-brown/15 bg-cream px-6 py-5 sm:px-7 sm:py-6 transition-colors duration-300 hover:border-warm-brown/30 open:border-warm-brown/30"
                >
                  <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-serif text-lg sm:text-xl leading-snug text-ink">
                      {faq.question}
                    </h3>
                    <span
                      aria-hidden
                      className="mt-1 flex-shrink-0 size-6 rounded-full border border-burgundy/30 text-burgundy flex items-center justify-center text-base transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-5 text-warm-brown leading-relaxed">
                    {faq.answerText}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL — burgundy block */}
        <section className="bg-burgundy text-cream-light relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 texture-grain pointer-events-none"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at center, rgba(20,17,15,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative px-6 py-24 sm:py-32 max-w-4xl mx-auto w-full text-center">
            <h2 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em]">
              Hablemos de tu patrimonio y tu futuro.
            </h2>
            <p className="mt-6 text-base sm:text-lg opacity-85 max-w-xl mx-auto leading-relaxed">
              Sesión inicial sin compromiso. Te escucho primero, recomiendo después.
            </p>
            <a
              href={ctaUrl}
              className="group mt-12 inline-flex items-center gap-3 rounded-full bg-cream-light text-burgundy px-9 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:shadow-[0_20px_48px_-12px_rgba(245,239,230,0.45)] transition-all duration-500 hover:-translate-y-0.5"
            >
              {ctaText}
              <ArrowRight
                className="size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                strokeWidth={2}
              />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
