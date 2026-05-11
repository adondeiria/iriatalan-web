import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

const FAQS: FAQItem[] = [
  {
    question: "¿Trabajas solo con mujeres?",
    answerText:
      "No. Trabajo con familias, parejas, hombres y mujeres. Esta página existe porque muchas clientas mujeres buscan específicamente una asesora mujer y quería darles un espacio donde se reconozcan.",
  },
  {
    question: "Vengo recomendada por una amiga / clienta tuya. ¿Es muy distinto el proceso?",
    answerText:
      "No. Misma metodología, misma transparencia. Trabajo con las mismas 6 aseguradoras y la recomendación se ajusta a tu situación específica. La única diferencia es que ya tenemos contexto compartido — eso ahorra tiempo en la primera sesión.",
  },
  {
    question: "Estoy en proceso de divorcio. ¿Es buen momento para hablar contigo?",
    answerText:
      "Es uno de los mejores. Las decisiones financieras que se toman durante y después del divorcio impactan décadas. Hablar antes — incluso antes de firmar el convenio — te da claridad sobre lo que estás negociando.",
  },
  {
    question: "Mi pareja siempre llevó las finanzas. Yo no sé mucho. ¿Eso es problema?",
    answerText:
      "Para nada. Es el caso más común — y es justo donde mi metodología te sirve más. Vamos a tu ritmo, sin asumir conocimiento previo, sin condescendencia.",
  },
  {
    question: "¿Cuándo conviene actualizar a mis beneficiarios?",
    answerText:
      "Cualquier momento en que algo importante cambia en tu vida: un matrimonio, un divorcio, el nacimiento de un hij@, el fallecimiento de un beneficiario actual, o una mejora patrimonial significativa. Yo te recuerdo revisarlo cada año, pero tú puedes pedirlo cuando quieras — es un trámite simple con la aseguradora. Lo importante es que tu designación refleje a quién quieres proteger HOY, no a quién querías hace cinco años cuando firmaste la póliza.",
  },
  {
    question: "Ya tengo mis deducciones personales topadas. ¿El PPR sí me ayuda a deducir más impuestos?",
    answerText:
      "Sí, porque la deducción del PPR es independiente del tope global del Art. 151 de la LISR. El SAT te permite deducir aportaciones a un Plan Personal de Retiro hasta el menor de: el 10% de tus ingresos acumulables del ejercicio, o el equivalente a 5 UMAs anuales (≈ $213,973 MXN en 2026). Ese tope es propio del PPR — no se suma al de tus deducciones personales clásicas (honorarios médicos, intereses hipotecarios, colegiaturas, etc.). En la práctica: aunque ya hayas usado todo el tope de deducciones personales, puedes seguir bajando tu base gravable aportando al PPR.",
  },
];


export const metadata: Metadata = {
  title: "Asesoría financiera para mujeres en México",
  description:
    "Asesoría financiera diseñada por una mujer, para mujeres que toman decisiones: profesionistas, divorciadas, viudas y empresarias. Planes educacionales, PPR, fideicomisos, vida y GMM. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/personas/mujeres` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/personas/mujeres`,
    title: "Asesoría financiera para mujeres en México — Iria Talan",
    description:
      "Diseñada por una mujer, para mujeres que deciden. Profesionistas, divorciadas, viudas, empresarias.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/personas/mujeres#audience`,
    audienceType: "Mujeres afluentes y HNWI México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

// Service schema específico — clave AEO. Sin este, LLMs solo tienen
// Audience (a quién atiendes) pero no Service (qué ofreces estructurado).
function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/personas/mujeres#service`,
    name: "Asesoría Patrimonial para Mujeres",
    description:
      "Planeación financiera y patrimonial diseñada por una mujer asesora para mujeres profesionistas con ISR alto, divorciadas con hijos, viudas con patrimonio heredado y empresarias. Incluye optimización fiscal vía PPR (Art. 151 fracc V LISR), estrategia de retiro propia, protección patrimonial y planeación sucesoria.",
    serviceType: "Asesoría Patrimonial",
    category: "Planeación Patrimonial",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "México" },
    audience: { "@id": `${SITE_URL}/personas/mujeres#audience` },
  };
}

export default async function MujeresPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = author?.socialLinks?.calendly ?? "/contacto#agendar";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildServiceSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Personas", path: "/personas" },
      { name: "Asesoría para mujeres", path: "/personas/mujeres" },
    ]),
    buildFAQPageSchema(FAQS)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <section className="relative w-full overflow-hidden">
          <div className="relative aspect-[4/3] sm:aspect-[21/9] w-full">
            <Image
              src="/img/nichos/mujeres-hero.png"
              alt="Mujer mexicana CEO de 40 años en su oficina ejecutiva con vista a Paseo de la Reforma en Ciudad de México"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="px-6 pt-12 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-cream-light0">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}Asesoría para mujeres
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Diseñada por una mujer, para mujeres que toman decisiones.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            La industria de los seguros y la planeación patrimonial fue diseñada por hombres,
            para hombres. Y a veces se nota — en el lenguaje, en las suposiciones,
            en quién toma las decisiones por ti. Aquí no.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda sesión inicial
            </a>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Para quién es esta página
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Trabajo con mujeres en cuatro momentos vitales distintos. Cada uno
              con productos y prioridades específicas — no fórmulas de catálogo.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Perfil 1
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Profesionistas de alto ingreso
                </h3>
                <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65 text-sm leading-relaxed">
                  CXO, abogadas, doctoras, contadoras, consultoras 35-55. Decides sola, ganas tú,
                  quieres optimizar fiscalmente y proteger lo construido.
                </p>
                <p className="mt-3 text-xs text-warm-brown/70 dark:text-cream-light/60 leading-relaxed">
                  PPR deducible Art. 151 fracc V LISR — hasta 5 UMAs anuales (~$213,973 MXN en 2026).
                </p>
                <p className="mt-4 text-sm font-medium text-ink dark:text-cream-light">
                  Productos: PPR · Vida · GMM premium · Modalidad 40 IMSS
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Perfil 2
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Divorciadas con hijos
                </h3>
                <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65 text-sm leading-relaxed">
                  Pivote vital. Tu protección financiera y la de tus hijos ya no depende
                  de nadie más — depende de la estructura que armes ahora.
                </p>
                <p className="mt-4 text-sm font-medium text-ink dark:text-cream-light">
                  Productos: Vida · Fideicomiso · Plan educacional · GMM
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Perfil 3
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Viudas con patrimonio heredado
                </h3>
                <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65 text-sm leading-relaxed">
                  Pasaste de “mi pareja sabía” a “yo decido”. Trabajamos a tu ritmo, sin presión,
                  para que entiendas y conserves lo que tienes.
                </p>
                <p className="mt-4 text-sm font-medium text-ink dark:text-cream-light">
                  Productos: Inversión · Sucesión · Fideicomiso · GMM en retiro
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Perfil 4
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Empresarias y dueñas de negocio
                </h3>
                <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65 text-sm leading-relaxed">
                  Doble dolor: protegerte tú + proteger el negocio que construiste.
                  La planeación financiera personal y empresarial no pueden ir por separado.
                </p>
                <p className="mt-4 text-sm font-medium text-ink dark:text-cream-light">
                  Productos: PPR · Key Person · GMM grupo · Sucesión empresarial
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Por qué trabajar con una asesora mujer
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                <strong className="text-ink dark:text-cream-light">No es una preferencia estética — es una realidad práctica.</strong>{" "}
                Hay temas que se hablan distinto entre mujeres: divorcio, custodia, viudez,
                herencia familiar, embarazo y maternidad, brechas salariales, presiones de cuidado
                no remunerado. Cuando esos temas son parte del cálculo financiero,
                el espacio importa.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">Lo que escucho seguido:</strong>{" "}
                “Es la primera vez que un asesor me deja preguntar lo que realmente quería preguntar.”
                “No me hablaste como si yo no entendiera.” “Me explicaste sin asumir que mi marido
                debe estar en la conversación.”
              </p>
              <p>
                Ese es el espacio. La metodología es la misma que usan los asesores top mundiales —
                MDRT Top of the Table, Yale Wealth Management, LSE — pero el espacio es diferente.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Cómo trabajamos
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Diagnóstico real (60 min, sin costo)
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Te escucho primero. Tu vida actual, tus dependientes económicos, tu horizonte,
                  lo que ya tienes y lo que te preocupa. Sin formularios genéricos.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Recomendación de aseguradora(s) para tu perfil
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Trabajo con BUPA, MetLife, Allianz, Seguros Monterrey New York Life, AXA y GNP.
                  Según tu situación específica, te recomiendo la(s) más adecuada(s) para ti
                  — con pros, contras y costos a la vista. Decides tú.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Acompañamiento personal continuo
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Tu asesora soy yo, no un call center. Renovaciones, cambios de carrier,
                  siniestros — hablas conmigo. Y revisamos anualmente sin costo para ajustar
                  a los cambios en tu vida.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Trabajas solo con mujeres?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No. Trabajo con familias, parejas, hombres y mujeres. Esta página existe porque
                  muchas clientas mujeres buscan específicamente una asesora mujer y quería darles
                  un espacio donde se reconozcan.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Vengo recomendada por una amiga / clienta tuya. ¿Es muy distinto el proceso?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No. Misma metodología, misma transparencia. Trabajo con las mismas
                  6 aseguradoras y la recomendación se ajusta a tu situación específica.
                  La única diferencia es que ya tenemos contexto compartido — eso ahorra tiempo en la primera sesión.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Estoy en proceso de divorcio. ¿Es buen momento para hablar contigo?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es uno de los mejores. Las decisiones financieras que se toman durante y
                  después del divorcio impactan décadas. Hablar antes — incluso antes de firmar el
                  convenio — te da claridad sobre lo que estás negociando.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Mi pareja siempre llevó las finanzas. Yo no sé mucho. ¿Eso es problema?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Para nada. Es el caso más común — y es justo donde mi metodología te sirve más.
                  Vamos a tu ritmo, sin asumir conocimiento previo, sin condescendencia.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cuándo conviene actualizar a mis beneficiarios?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Cualquier momento en que algo importante cambia en tu vida: un
                  matrimonio, un divorcio, el nacimiento de un hij@, el fallecimiento
                  de un beneficiario actual, o una mejora patrimonial significativa.
                  Yo te recuerdo revisarlo cada año, pero tú puedes pedirlo cuando
                  quieras — es un trámite simple con la aseguradora. Lo importante es
                  que tu designación refleje a quién quieres proteger HOY, no a quién
                  querías hace cinco años cuando firmaste la póliza.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Ya tengo mis deducciones personales topadas. ¿El PPR sí me ayuda a deducir más impuestos?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, porque la deducción del PPR es independiente del tope global del
                  Art. 151 de la LISR. El SAT te permite deducir aportaciones a un Plan
                  Personal de Retiro hasta el menor de: el 10% de tus ingresos
                  acumulables del ejercicio, o el equivalente a 5 UMAs anuales
                  (≈ $213,973 MXN en 2026). Ese tope es propio del PPR — no se suma al
                  de tus deducciones personales clásicas (honorarios médicos, intereses
                  hipotecarios, colegiaturas, etc.). En la práctica: aunque ya hayas
                  usado todo el tope de deducciones personales, puedes seguir bajando
                  tu base gravable aportando al PPR.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85">
              Elige la que te acomode. No tienes que llegar con todas las respuestas — solo con las dudas.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Mensaje rápido
                </div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">
                  WhatsApp
                </div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">
                  {whatsapp}
                </div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Email reflexivo
                </div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">
                  Cuéntame por correo
                </div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">
                  {email}
                </div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Consulta directa
                </div>
                <div className="text-lg font-medium">
                  Agenda sesión inicial
                </div>
                <div className="mt-2 text-sm opacity-80">
                  Calendly · sin compromiso
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
