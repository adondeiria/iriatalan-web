import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Calendar,
  Globe2,
  Heart,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
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

const FALLBACK_HERO_TITLE = "La tranquilidad financiera se construye.";
const FALLBACK_HERO_SUBTITLE =
  "Diseño la estrategia que conecta tu protección, tu retiro y tu patrimonio — para que cada decisión financiera tenga propósito.";
const FALLBACK_CTA_TEXT = "Reserva tu sesión inicial · 30 min";
const FALLBACK_CTA_URL = "/contacto#agendar";

const PROPOSITOS_HERO = [
  { icon: "/img/icons/hero-medal.svg", label: "+18 años de experiencia" },
  { icon: "/img/icons/hero-users.svg", label: "Asesoría personalizada y cercana" },
  { icon: "/img/icons/hero-globe.svg", label: "México y clientes en el extranjero" },
  { icon: "/img/icons/hero-shield.svg", label: "Sin presión comercial" },
  { icon: "/img/icons/hero-chat.svg", label: "Te explico claro, sin complicaciones" },
];

const SERVICIOS = [
  {
    icon: Shield,
    title: "Proteger a tu familia",
    desc: "Seguros de vida y protección para lo que más te importa.",
    href: "/personas",
    image: "/img/nichos/familias-arcoiris-hero.png",
  },
  {
    icon: BarChart3,
    title: "Planear tu retiro",
    desc: "Estrategias para que disfrutes hoy y mañana con tranquilidad.",
    href: "/retiro",
    image: "/img/servicios/retiro-hero.png",
  },
  {
    icon: Heart,
    title: "Cuidar tu salud",
    desc: "Gastos médicos mayores y seguros de salud a tu medida.",
    href: "/gmm",
    image: "/img/servicios/gmm-hero.png",
  },
  {
    icon: Sparkles,
    title: "Ordenar tu patrimonio",
    desc: "Planeación patrimonial e inversiones alineadas a tus objetivos.",
    href: "/patrimonial",
    image: "/img/servicios/patrimonial-hero.png",
  },
  {
    icon: Briefcase,
    title: "Proteger tu empresa",
    desc: "Soluciones para empresarios, socios y colaboradores clave.",
    href: "/empresas",
    image: "/img/servicios/empresas-hero.png",
  },
];

const PREOCUPACIONES = [
  { icon: Calendar, text: "¿Voy tarde para planear mi retiro?" },
  { icon: Users, text: "¿Cómo protejo a mi familia correctamente?" },
  { icon: Heart, text: "¿Qué pasa si me enfermo fuera de México?" },
  { icon: BarChart3, text: "¿Estoy pagando impuestos de más?" },
  { icon: Sparkles, text: "¿Cómo protejo a un hijo neurodivergente?" },
  { icon: Shield, text: "¿Qué pasa con mi patrimonio si falto mañana?" },
];

const DIFERENCIA_PUNTOS = [
  {
    icon: Target,
    title: "Estrategias independientes",
    body: "100% enfocadas en ti.",
  },
  {
    icon: UserCheck,
    title: "Acompañamiento",
    body: "personalizado a largo plazo.",
  },
  {
    icon: ShieldCheck,
    title: "Transparencia",
    body: "y claridad en cada decisión.",
  },
  {
    icon: Globe2,
    title: "Experiencia con clientes",
    body: "en México y el extranjero.",
  },
];

const EXPERIENCIA_RESPALDO = [
  { logo: "/img/logos/tec.svg", alt: "Tec de Monterrey — Ing. Mecánica Administradora" },
  { logo: "/img/logos/yale.svg", alt: "Yale School of Management — Wealth Management Program" },
  { logo: "/img/logos/lse.svg", alt: "LSE — The London School of Economics, MBA Essentials" },
  { logo: "/img/logos/mdrt-official.svg", alt: "MDRT — Million Dollar Round Table (logo oficial)" },
  { logo: "/img/logos/amasfac.svg", alt: "AMASFAC — Top 8 Nacional México" },
  { logo: "/img/logos/years.svg", alt: "+18 años asesorando personas, familias y empresas" },
];

const PROCESO_PASOS = [
  {
    numero: "01",
    titulo: "Diagnóstico",
    descripcion: "Conversación inicial sin compromiso. Entiendo tu situación, prioridades y lo que te quita el sueño financieramente.",
  },
  {
    numero: "02",
    titulo: "Estrategia",
    descripcion: "Diseño una estrategia patrimonial conectando protección, retiro, fiscal y sucesión — ajustada a tu realidad, no al producto del mes.",
  },
  {
    numero: "03",
    titulo: "Acompañamiento",
    descripcion: "Implementación y revisiones periódicas. Tu vida cambia, tu estrategia se ajusta. Sin presión comercial.",
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
      "La primera sesión de diagnóstico (30 min) es sin costo y sin compromiso de contratar. A partir de ahí, la mayoría de los productos que recomiendo (seguros, GMM, PPR, inversiones) se pagan a través de una comisión pagada por la aseguradora — tú no me pagas honorarios separados por ellos. Para casos patrimoniales complejos que requieren diseño extensivo (estructuras corporativas, fideicomisos multi-vehículo, coordinación con tu equipo legal/fiscal) trabajamos honorarios separados, acordados con transparencia antes de empezar. Sin sorpresas, sin presión de venta — la conversación inicial sirve precisamente para entender qué necesitas y cómo se cobra.",
  },
  {
    question: "¿Con qué aseguradoras trabajas y por qué solo 6?",
    answerText:
      "Trabajo con las mejores aseguradoras AAA en México: GNP, BUPA, AXA, MetLife, Seguros Monterrey New York Life y Allianz. Las seleccioné por calificación financiera (todas AAA), historial de pago de siniestros, calidad de red hospitalaria/médica, y solvencia económica. Esto me permite recomendar el producto óptimo dentro de mi catálogo y darte servicio post-venta consistente.",
  },
  {
    question: "¿Cómo es la primera sesión y cuánto tarda?",
    answerText:
      "Dura entre 30 y 60 minutos, vía videollamada (zoom, meet o teams) o presencial si estás en CDMX. La estructura típica: (1) tu contexto — situación familiar, profesional, patrimonial actual; (2) tus prioridades y preocupaciones — qué te quita el sueño financieramente; (3) primera lectura de oportunidades concretas (no propuestas de venta, sino áreas a explorar); (4) siguientes pasos sugeridos sin compromiso. Sales con un mapa de prioridades. La decisión de avanzar es siempre tuya y a tu ritmo.",
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
        {/* HERO — banner full-width con foto background + texto izq overlay */}
        <section className="relative bg-espresso text-cream-light overflow-hidden">
          {/* Foto background full-bleed */}
          <div className="absolute inset-0">
            <Image
              src="/img/iria/IRIA_HERO_FINAL2.jpeg"
              alt="Iria Talan, asesora financiera RIF — MDRT Top of the Table, Cédula CNSF V388618"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            {/* Gradient overlay — oscuro izq para legibilidad → transparente der */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(31,22,18,0.92) 0%, rgba(31,22,18,0.78) 28%, rgba(31,22,18,0.35) 55%, rgba(31,22,18,0.05) 78%, transparent 95%)",
              }}
            />
            {/* Gradient inferior sutil para banda de propósitos */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-56"
              style={{
                background:
                  "linear-gradient(to top, rgba(31,22,18,0.88) 0%, rgba(31,22,18,0.45) 60%, transparent 100%)",
              }}
            />
          </div>

          {/* Burgundy ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 size-[640px] rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(158,27,30,0.20) 0%, rgba(158,27,30,0.05) 35%, transparent 65%)",
            }}
          />

          {/* Contenido overlay */}
          <div className="relative px-6 sm:px-10 lg:px-16 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 max-w-[1440px] mx-auto w-full min-h-[680px] lg:min-h-[760px] flex flex-col justify-between">
            <div className="max-w-2xl">
              <p className="animate-fade-up text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Planeación patrimonial</span>
                <span className="text-champagne" aria-hidden>·</span>
                <span>Seguros</span>
                <span className="text-champagne" aria-hidden>·</span>
                <span>Retiro</span>
              </p>
              <h1 className="animate-fade-up stagger-1 mt-7 font-serif font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-[-0.02em] text-cream-light">
                {heroTitle}
              </h1>
              <p className="animate-fade-up stagger-2 mt-7 text-base sm:text-lg text-cream-light/85 leading-relaxed max-w-xl">
                {heroSubtitle}
              </p>
              <div className="animate-fade-up stagger-3 mt-9 flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href={ctaUrl}
                  className="group inline-flex items-center gap-3 rounded-full bg-burgundy text-cream-light px-8 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition-all duration-500 shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] hover:shadow-[0_20px_48px_-12px_rgba(158,27,30,0.75)] hover:-translate-y-0.5"
                >
                  Reserva tu sesión inicial · 30 min
                  <ArrowRight
                    className="size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                    strokeWidth={2}
                  />
                </a>
                <a
                  href="#servicios"
                  className="group inline-flex items-center gap-3 rounded-full border border-cream-light/40 text-cream-light px-8 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:border-cream-light hover:bg-cream-light/[0.06] transition-all duration-500 backdrop-blur-sm"
                >
                  Explorar estrategias
                  <ArrowRight
                    className="size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                    strokeWidth={2}
                  />
                </a>
              </div>
            </div>

            {/* Banda de propósitos abajo */}
            <ul className="animate-fade-up stagger-4 mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-7 max-w-4xl">
              {PROPOSITOS_HERO.map(({ icon, label }) => (
                <li
                  key={label}
                  className="flex flex-col items-start gap-3 text-cream-light/85"
                >
                  <span className="flex items-center justify-center size-10 rounded-full ring-1 ring-champagne/40 bg-espresso/40 backdrop-blur-sm">
                    <Image
                      src={icon}
                      alt=""
                      width={22}
                      height={22}
                      className="size-[22px]"
                      aria-hidden
                    />
                  </span>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] leading-[1.4] max-w-[130px]">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SERVICIOS — texto izq + cards der */}
        <section id="servicios" className="bg-cream-light px-6 sm:px-8 lg:px-12 py-20 sm:py-28 scroll-mt-24">
          <div className="max-w-[1440px] mx-auto w-full">
            <div className="grid gap-12 lg:gap-20 xl:gap-24 lg:grid-cols-[5fr_8fr] lg:items-start">
              {/* IZQ — texto + botón */}
              <div className="lg:max-w-md lg:sticky lg:top-24">
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                  Cómo puedo ayudarte
                </p>
                <h2 className="mt-5 font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.01em] text-ink">
                  Soluciones integrales<br className="hidden sm:inline" /> para cada etapa de <span className="italic text-burgundy">tu vida</span>.
                </h2>
                <p className="mt-6 text-base text-warm-brown/80 leading-relaxed">
                  Diseñamos estrategias personalizadas para proteger lo que más importa, crear bienestar y dejar un legado.
                </p>
                <Link
                  href="/sobre-iria#servicios"
                  className="group mt-8 inline-flex items-center gap-3 rounded-full border border-burgundy/30 text-burgundy px-7 py-3.5 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:border-burgundy hover:bg-burgundy/[0.04] transition-all duration-500 whitespace-nowrap"
                >
                  Conoce todos mis servicios
                  <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2} />
                </Link>
              </div>
              {/* DER — grid de cards en una sola fila lg */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3 xl:gap-4">
                {SERVICIOS.map(({ icon: Icon, title, desc, href, image }) => (
                <Link
                  key={title + href}
                  href={href}
                  className="group card-lift flex flex-col bg-cream rounded-xl border border-warm-brown/10 overflow-hidden focus-visible:outline-burgundy focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <div className="img-zoom relative aspect-square overflow-hidden bg-warm-brown/10">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 size-9 rounded-full bg-cream-light/95 backdrop-blur-sm flex items-center justify-center ring-1 ring-burgundy/15">
                      <Icon
                        className="size-4 text-burgundy"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 px-4 py-5">
                    <h3 className="font-serif text-base sm:text-lg leading-[1.2] text-ink group-hover:text-burgundy transition-colors duration-500">
                      {title}
                    </h3>
                    <p className="mt-2 text-[12.5px] text-warm-brown/70 leading-relaxed flex-1">
                      {desc}
                    </p>
                  </div>
                </Link>
              ))}
              </div>
            </div>
          </div>
        </section>

        {/* PREOCUPACIONES — sección negra editorial, voz del cliente */}
        <section className="relative bg-espresso text-cream-light texture-grain overflow-hidden">
          <div className="hairline-x-light absolute inset-x-0 top-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at center top, rgba(184,149,106,0.06) 0%, transparent 60%)",
            }}
          />
          <div className="relative px-6 py-20 sm:py-24 max-w-6xl mx-auto w-full">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                Problemas que resolvemos
              </p>
              <h2 className="mt-6 font-serif font-light text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] tracking-[-0.01em] text-cream-light">
                ¿Qué suele preocupar a nuestros clientes?
              </h2>
            </div>
            <ul className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-cream-light/10">
              {PREOCUPACIONES.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex flex-col items-center text-center gap-4 px-3 sm:px-4 py-6 lg:py-2"
                >
                  <span className="flex items-center justify-center size-11 rounded-full ring-1 ring-champagne/40">
                    <Icon className="size-5 text-champagne" strokeWidth={1.4} aria-hidden />
                  </span>
                  <p className="text-[13px] sm:text-sm text-cream-light/85 leading-snug max-w-[160px]">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-14 flex justify-center">
              <a
                href={ctaUrl}
                className="group inline-flex items-center gap-3 rounded-full bg-burgundy text-cream-light px-9 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition-all duration-500 hover:-translate-y-0.5"
              >
                Reserva tu sesión inicial · 30 min
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" strokeWidth={2} />
              </a>
            </div>
          </div>
          <div className="hairline-x-light absolute inset-x-0 bottom-0" />
        </section>

        {/* PLANEACIÓN CON PROPÓSITO — light editorial split */}
        <section className="relative bg-cream-light text-ink overflow-hidden border-y border-warm-brown/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at center, rgba(184,149,106,0.06) 0%, transparent 60%)",
            }}
          />
          <div className="relative grid lg:grid-cols-[6fr_7fr] lg:items-stretch">
            {/* IZQ — foto full-bleed sin marco */}
            <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:min-h-[640px]">
              <Image
                src="/img/iria/notebook-C3-marble-closeup.png"
                alt="Cuaderno Iria Talan / RIF Reingeniería Financiera sobre mármol con pluma — planeación patrimonial"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* DER — texto con padding interior */}
            <div className="relative px-6 sm:px-10 lg:px-16 xl:px-20 py-16 lg:py-24 flex flex-col justify-center">
              <div className="max-w-xl">
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.26em] text-burgundy">
                  Nuestro enfoque
                </p>
                <h2 className="mt-7 font-serif font-light text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.05] tracking-[-0.01em] text-ink">
                  La diferencia no es el producto.<br />
                  <span className="italic font-extralight text-warm-brown/75">Es la estrategia.</span>
                </h2>
                <p className="mt-7 text-base text-warm-brown/80 leading-relaxed">
                  No vendemos pólizas aisladas. Diseñamos estrategias alineadas con tus objetivos, tu patrimonio y tu estilo de vida.
                </p>
                <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-7">
                  {DIFERENCIA_PUNTOS.map(({ icon: Icon, title, body }) => (
                    <li key={title} className="flex flex-col items-start gap-3">
                      <span className="flex items-center justify-center size-10 rounded-full ring-1 ring-burgundy/45 bg-burgundy/[0.06]">
                        <Icon className="size-[18px] text-burgundy" strokeWidth={1.5} aria-hidden />
                      </span>
                      <p className="text-[12px] leading-snug">
                        <span className="text-ink block font-medium">{title}</span>
                        <span className="text-warm-brown/75">{body}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* EXPERIENCIA QUE TE RESPALDA — franja burgundy con wordmarks tipográficos */}
        <section className="bg-burgundy text-cream-light relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 texture-grain pointer-events-none"
          />
          <div className="relative px-6 py-10 sm:py-12 max-w-6xl mx-auto w-full">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-cream-light/75 lg:max-w-[160px] lg:flex-shrink-0 lg:border-r lg:border-cream-light/15 lg:pr-8">
                Experiencia<br className="hidden lg:inline" /> que te respalda
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-10 lg:gap-x-6 flex-1 items-center">
                {EXPERIENCIA_RESPALDO.map(({ logo, alt }) => (
                  <li
                    key={logo}
                    className="flex items-center justify-center h-[64px] sm:h-[72px]"
                  >
                    <Image
                      src={logo}
                      alt={alt}
                      width={240}
                      height={90}
                      className="max-h-full max-w-[180px] w-auto opacity-95 hover:opacity-100 transition-opacity duration-500"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CÓMO TRABAJAMOS JUNTAS — 3 pasos */}
        <section className="bg-cream-light px-6 py-20 sm:py-28 border-t border-warm-brown/10">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                Cómo trabajamos juntas
              </p>
              <h2 className="mt-6 font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-[-0.01em] text-ink">
                Un proceso claro, sin sorpresas.
              </h2>
              <p className="mt-5 text-warm-brown/75 leading-relaxed max-w-xl mx-auto">
                Tres etapas para diseñar una estrategia patrimonial que se ajuste a tu vida — no al revés.
              </p>
            </div>
            <div className="mt-16 grid gap-10 sm:gap-12 lg:grid-cols-3 lg:gap-16">
              {PROCESO_PASOS.map(({ numero, titulo, descripcion }) => (
                <div key={numero} className="relative">
                  <span className="font-serif text-6xl sm:text-7xl font-light text-burgundy/20 leading-none tabular-nums">
                    {numero}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl sm:text-3xl leading-tight text-ink">
                    {titulo}
                  </h3>
                  <p className="mt-4 text-base text-warm-brown/80 leading-relaxed max-w-sm">
                    {descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DIFERENCIACIÓN — banda compacta link a /blog/silencios */}
        <section className="bg-cream border-y border-warm-brown/10 px-6 py-20 sm:py-24">
          <div className="max-w-5xl mx-auto w-full">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-14">
              <div>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                  Diferenciación
                </p>
                <h2 className="mt-5 font-serif font-light text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.1] tracking-[-0.01em] text-ink">
                  Lo que normalmente NO te explica la industria financiera
                </h2>
                <p className="mt-5 text-warm-brown/80 leading-relaxed italic max-w-xl">
                  No vendo seguros. Te ayudo a que tomes las decisiones correctas.
                </p>
              </div>
              <Link
                href="/blog/silencios"
                className="group inline-flex items-center gap-3 rounded-full bg-burgundy text-cream-light px-8 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition-all duration-500 whitespace-nowrap hover:-translate-y-0.5 shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] self-start lg:self-auto"
              >
                Conoce los 7 temas
                <ArrowRight
                  className="size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
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
            <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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

      </main>
    </>
  );
}
