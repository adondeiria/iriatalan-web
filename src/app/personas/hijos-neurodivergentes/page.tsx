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
    question: "Mi hijo es muy pequeño aún. ¿No es prematuro pensar en esto?",
    answerText:
      "Es lo opuesto. Mientras más temprano estructures, menos cuesta y más tiempo tiene el patrimonio para crecer. Y los seguros de vida son más baratos cuanto más joven los contrates. Empezar a los 35 con un hijo de 5 es muy distinto a empezar a los 50 con uno de 20.",
  },
  {
    question: "¿Necesito tener un patrimonio enorme para que un fideicomiso tenga sentido?",
    answerText:
      "No. La función del seguro de vida es justamente \"crear\" el patrimonio base que va al fideicomiso si tú llegas a faltar. Tu prima mensual hoy puede convertirse en varios millones para tu hijo el día que pase algo. Lo importante es estructurar correctamente.",
  },
  {
    question: "Mi hijo tiene un diagnóstico reciente. ¿Aplica algún seguro?",
    answerText:
      "El seguro de vida es sobre TI (los padres), no sobre tu hijo — eso es importante entenderlo. La condición de tu hijo no afecta tu capacidad de asegurarte tú. Y el GMM tiene reglas específicas que varían por carrier; te muestro cuáles aplican y cuáles no.",
  },
  {
    question: "Pertenezco a una asociación de padres. ¿Trabajas con asociaciones?",
    answerText:
      "Sí. Si tu asociación quiere organizar una sesión informativa para varias familias a la vez, podemos coordinar — sin compromiso individual de contratar, solo educativa. Escríbeme.",
  },
  {
    question: "¿Cómo dejarle una pensión vitalicia a mi hij@?",
    answerText:
      "Lo que estructuro contigo es un seguro de vida combinado con un ahorro de rentas vitalicias. La aseguradora paga a tu hij@ una renta mensual o anual — actualizada por inflación, o pagada al TC del dólar, de acuerdo con la moneda del plan. La pensión se dispara en caso de fallecimiento o el vencimiento del plazo del seguro de ahorro. Tú decides cuánto recibe mensualmente; eso determina la suma asegurada que necesitamos. Es un contrato directo entre la aseguradora y tu hij@ como beneficiario — no entra en juicio de sucesión, ni depende del testamento.",
  },
  {
    question: "¿El dinero está blindado contra embargos y problemas legales?",
    answerText:
      "Sí. Cuando estructuramos la póliza con designación irrevocable de beneficiario, el derecho que adquiere tu hij@ es un derecho propio que nace del contrato de seguro — no es herencia. Por eso no forma parte de la masa hereditaria, no pasa por juicio sucesorio, y queda inembargable frente a acreedores tuyos, incluso en concurso o quiebra (Art. 179 de la Ley sobre el Contrato de Seguro). Y si tu hij@ es descendiente directo, las cantidades que reciba están exentas de ISR (Art. 93 fracc. XXI de la LISR). En la práctica te mando el contrato de la fiduciaria para que veas exactamente cómo opera.",
  },
  {
    question: "¿Qué pasa con el dinero si mi hij@ llegara a fallecer?",
    answerText:
      "En la estructura nombramos beneficiarios sustitutos desde el inicio. Generalmente designamos a sus hermanos — no solo por afecto, sino porque son quienes conocieron a tu hij@ de cerca y van a entender el sentido del patrimonio que construiste. Si no hay hermanos, podemos definir otros familiares, tu pareja, o incluso una fundación dedicada a neurodivergencia. La cascada queda definida por escrito antes de firmar la póliza — no hay improvisación.",
  },
  {
    question: "¿Mis otros hijos también necesitan estar incluidos en la planeación?",
    answerText:
      "Solamente como beneficiarios contingentes y de hecho una de las razones por las que estructuramos así es justamente para que el cuidado de tu hij@ no recaiga económicamente en sus hermanos ni en otros familiares. La idea de generar una pensión vitalicia a través del fideicomiso es poder cubrir los gastos de su cuidado de por vida: terapias, vivienda asistida, cuidador, costo de seguro de gastos médicos. Tus otros hijos pueden estar cerca afectivamente, o supervisar — pero sin la presión de sostenerlo con sus propios ingresos ni sacrificar sus propios proyectos de vida.",
  },
  {
    question: "¿Cuándo conviene actualizar a mis beneficiarios?",
    answerText:
      "Cualquier momento en que algo importante cambia en tu vida: un matrimonio, un divorcio, el nacimiento de un hij@, el fallecimiento de un beneficiario actual, o una mejora patrimonial significativa. Yo te recuerdo revisarlo cada año, pero tú puedes pedirlo cuando quieras — es un trámite simple con la aseguradora. Lo importante es que tu designación refleje a quién quieres proteger HOY, no a quién querías hace cinco años cuando firmaste la póliza.",
  },
];


export const metadata: Metadata = {
  title: "Asesoría financiera para familias con hijos neurodivergentes",
  description:
    "Planeación financiera de por vida para familias con hijos con autismo, TDAH, síndrome de Down u otra condición neurodivergente. Fideicomisos, seguros de vida, planeación legal de tutela y patrimonio. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/personas/hijos-neurodivergentes` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/personas/hijos-neurodivergentes`,
    title: "Asesoría financiera para familias con hijos neurodivergentes — Iria Talan",
    description:
      "Fideicomisos, seguros de vida y planeación legal para asegurar el futuro de tu hijo más allá de tu propia vida.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/personas/hijos-neurodivergentes#audience`,
    audienceType: "Familias con hijos neurodivergentes en México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

// Service schema específico — clave AEO. Sin este, LLMs solo tienen
// Audience (a quién atiendes) pero no Service (qué ofreces estructurado).
function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/personas/hijos-neurodivergentes#service`,
    name: "Planeación Financiera de por Vida para Hijos Neurodivergentes",
    description:
      "Estructura financiera vitalicia para familias con hijos con autismo, TDAH, síndrome de Down u otra condición neurodivergente. Incluye fideicomiso de soporte vitalicio (vía aseguradora), seguro de vida con suma asegurada calculada para 60+ años de cuidado, tutela legal documentada con anticipación, y GMM con cobertura específica para condiciones del espectro.",
    serviceType: "Planeación Patrimonial Familiar",
    category: "Asesoría Patrimonial Familiar",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "México" },
    audience: { "@id": `${SITE_URL}/personas/hijos-neurodivergentes#audience` },
  };
}

export default async function HijosNeurodivergentesPage() {
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
      { name: "Hijos neurodivergentes", path: "/personas/hijos-neurodivergentes" },
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
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="/img/nichos/hijos-neurodivergentes-hero.png"
              alt="Madre mexicana acompañando a su hijo neurodivergente en un momento cotidiano de juego en casa"
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
            {" / "}Hijos neurodivergentes
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Cuando tu hijo necesita más, la planeación financiera no puede improvisarse.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Asesoría especializada para familias con hijos con autismo, TDAH,
            síndrome de Down u otra condición neurodivergente.
            Estructura financiera y legal de por vida — no solo hasta la universidad.
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
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              La pregunta que nadie quiere hacer en voz alta
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                <em>“¿Quién va a cuidar a mi hijo cuando yo no esté?”</em>
              </p>
              <p>
                Es la pregunta que mantiene despiertas a las familias con hijos
                neurodivergentes. No tiene una respuesta simple — pero sí tiene
                respuestas técnicas concretas que reducen la ansiedad y aseguran
                que tu hijo tenga la calidad de vida que tú le estás dando hoy,
                incluso cuando tú ya no puedas dársela personalmente.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">La planeación financiera convencional no aplica aquí.</strong>{" "}
                Un seguro de vida estándar y una cuenta de ahorro educacional están
                pensados para hijos que eventualmente serán adultos económicamente
                independientes. Tu situación puede ser distinta — tu hijo puede
                necesitar apoyo financiero, cuidado, terapias y supervisión durante
                toda su vida adulta.
              </p>
              <p>
                Por eso la estructura debe ser distinta. Y el asesor financiero debe
                entender esa diferencia.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Lo que típicamente estructuramos juntos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Fideicomiso de soporte vitalicio
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Patrimonio que se administra para tu hijo de por vida. Tú defines
                  reglas: cuánto recibe mensualmente, para qué (terapias, vivienda,
                  cuidador, recreación), quién supervisa. Sobrevive a tu fallecimiento
                  y al de tu pareja.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Seguro de vida con suma asegurada amplia
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Calculada no para “10 años de gastos familiares” sino para “60+ años
                  de cuidado de tu hijo”. El monto correcto cambia todo.
                </p>
                <Link href="/patrimonial" className="mt-3 inline-block text-sm font-medium underline">
                  Más sobre seguros de vida →
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Tutela legal documentada
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Quién toma decisiones por tu hijo cuando tú no puedas. Quién maneja
                  el fideicomiso. Quién supervisa al cuidador. Documentado legalmente
                  con anticipación, no improvisado en crisis.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  GMM con cobertura específica
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  No todos los planes cubren las terapias y especialistas que tu hijo
                  necesita. Te muestro qué carriers manejan mejor neurología, psiquiatría
                  pediátrica, terapias conductuales, y seguimiento integral.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Cómo trabajamos
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Diagnóstico de necesidades de por vida
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Calculamos juntos el costo de cuidado proyectado: terapias actuales,
                  educación, vivienda asistida si aplica, cuidador a largo plazo,
                  consideraciones médicas crónicas. Es una conversación honesta — no
                  un formulario.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Estructura combinada (no producto único)
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Combinación de seguro de vida + fideicomiso + GMM correcto +
                  documentos legales de tutela. Cada pieza cubre algo que las otras
                  no, y juntas forman la red de protección.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Coordinación con notario y abogado especializado
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Trabajo con notarías y despachos legales con experiencia en
                  fideicomisos para personas con condiciones permanentes. No quedas
                  solo coordinando entre el seguro, el banco, el notario y el abogado.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Revisión continua mientras tu hijo crece
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Las necesidades cambian. La estructura debe acompañar a tu hijo
                  desde infancia hasta la adultez. Revisamos cada año.
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
                  Mi hijo es muy pequeño aún. ¿No es prematuro pensar en esto?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es lo opuesto. Mientras más temprano estructures, menos cuesta y más
                  tiempo tiene el patrimonio para crecer. Y los seguros de vida son
                  más baratos cuanto más joven los contrates. Empezar a los 35 con un
                  hijo de 5 es muy distinto a empezar a los 50 con uno de 20.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Necesito tener un patrimonio enorme para que un fideicomiso tenga sentido?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No. La función del seguro de vida es justamente “crear” el patrimonio
                  base que va al fideicomiso si tú llegas a faltar. Tu prima mensual
                  hoy puede convertirse en varios millones para tu hijo el día que
                  pase algo. Lo importante es estructurar correctamente.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Mi hijo tiene un diagnóstico reciente. ¿Aplica algún seguro?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El seguro de vida es sobre TI (los padres), no sobre tu hijo — eso
                  es importante entenderlo. La condición de tu hijo no afecta tu
                  capacidad de asegurarte tú. Y el GMM tiene reglas específicas que
                  varían por carrier; te muestro cuáles aplican y cuáles no.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Pertenezco a una asociación de padres. ¿Trabajas con asociaciones?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí. Si tu asociación quiere organizar una sesión informativa para
                  varias familias a la vez, podemos coordinar — sin compromiso individual
                  de contratar, solo educativa. Escríbeme.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cómo dejarle una pensión vitalicia a mi hij@?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Lo que estructuro contigo es un seguro de vida combinado con un ahorro
                  de rentas vitalicias. La aseguradora paga a tu hij@ una renta mensual o
                  anual — actualizada por inflación, o pagada al TC del dólar, de acuerdo
                  con la moneda del plan. La pensión se dispara en caso de fallecimiento
                  o el vencimiento del plazo del seguro de ahorro. Tú decides cuánto
                  recibe mensualmente; eso determina la suma asegurada que necesitamos.
                  Es un contrato directo entre la aseguradora y tu hij@ como beneficiario
                  — no entra en juicio de sucesión, ni depende del testamento.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿El dinero está blindado contra embargos y problemas legales?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí. Cuando estructuramos la póliza con designación irrevocable de
                  beneficiario, el derecho que adquiere tu hij@ es un derecho propio que
                  nace del contrato de seguro — no es herencia. Por eso no forma parte
                  de la masa hereditaria, no pasa por juicio sucesorio, y queda
                  inembargable frente a acreedores tuyos, incluso en concurso o quiebra
                  (Art. 179 de la Ley sobre el Contrato de Seguro). Y si tu hij@ es
                  descendiente directo, las cantidades que reciba están exentas de ISR
                  (Art. 93 fracc. XXI de la LISR). En la práctica te mando el contrato
                  de la fiduciaria para que veas exactamente cómo opera.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Qué pasa con el dinero si mi hij@ llegara a fallecer?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  En la estructura nombramos beneficiarios sustitutos desde el inicio.
                  Generalmente designamos a sus hermanos — no solo por afecto, sino
                  porque son quienes conocieron a tu hij@ de cerca y van a entender el
                  sentido del patrimonio que construiste. Si no hay hermanos, podemos
                  definir otros familiares, tu pareja, o incluso una fundación dedicada
                  a neurodivergencia. La cascada queda definida por escrito antes de
                  firmar la póliza — no hay improvisación.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Mis otros hijos también necesitan estar incluidos en la planeación?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Solamente como beneficiarios contingentes y de hecho una de las
                  razones por las que estructuramos así es justamente para que el
                  cuidado de tu hij@ no recaiga económicamente en sus hermanos ni en
                  otros familiares. La idea de generar una pensión vitalicia a través
                  del fideicomiso es poder cubrir los gastos de su cuidado de por vida:
                  terapias, vivienda asistida, cuidador, costo de seguro de gastos
                  médicos. Tus otros hijos pueden estar cerca afectivamente, o
                  supervisar — pero sin la presión de sostenerlo con sus propios
                  ingresos ni sacrificar sus propios proyectos de vida.
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
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85">
              Sin presión. Solo cuando estés lista. Tres formas: la que te acomode.
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
