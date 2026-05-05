import type { Metadata } from "next";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildGraph,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Asesoría financiera para familias con hijos neurodivergentes — Iria Talan / RIF",
  description:
    "Planeación financiera de por vida para familias con hijos con autismo, TDAH, síndrome de Down u otra condición neurodivergente. Fideicomisos, seguros de vida, planeación legal de tutela y patrimonio. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/hijos-neurodivergentes` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/hijos-neurodivergentes`,
    title: "Asesoría financiera para familias con hijos neurodivergentes — Iria Talan",
    description:
      "Fideicomisos, seguros de vida y planeación legal para asegurar el futuro de tu hijo más allá de tu propia vida.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/hijos-neurodivergentes#audience`,
    audienceType: "Familias con hijos neurodivergentes en México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

export default async function HijosNeurodivergentesPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = author?.socialLinks?.calendly ?? "https://calendly.com/iriatalan";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Hijos neurodivergentes", path: "/hijos-neurodivergentes" },
    ])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-20 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}Hijos neurodivergentes
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            Cuando tu hijo necesita más, la planeación financiera no puede improvisarse.
          </h1>
          <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Asesoría especializada para familias con hijos con autismo, TDAH,
            síndrome de Down u otra condición neurodivergente.
            Estructura financiera y legal de por vida — no solo hasta la universidad.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda consulta gratis 30 min
            </a>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              La pregunta que nadie quiere hacer en voz alta
            </h2>
            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                <em>"¿Quién va a cuidar a mi hijo cuando yo no esté?"</em>
              </p>
              <p>
                Es la pregunta que mantiene despiertas a las familias con hijos
                neurodivergentes. No tiene una respuesta simple — pero sí tiene
                respuestas técnicas concretas que reducen la ansiedad y aseguran
                que tu hijo tenga la calidad de vida que tú le estás dando hoy,
                incluso cuando tú ya no puedas dársela personalmente.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">La planeación financiera convencional no aplica aquí.</strong>{" "}
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

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Lo que típicamente estructuramos juntos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Fideicomiso de soporte vitalicio
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Patrimonio que se administra para tu hijo de por vida. Tú defines
                  reglas: cuánto recibe mensualmente, para qué (terapias, vivienda,
                  cuidador, recreación), quién supervisa. Sobrevive a tu fallecimiento
                  y al de tu pareja.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Seguro de vida con suma asegurada amplia
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Calculada no para "10 años de gastos familiares" sino para "60+ años
                  de cuidado de tu hijo". El monto correcto cambia todo.
                </p>
                <Link href="/seguros-vida" className="mt-3 inline-block text-sm font-medium underline">
                  Más sobre seguros de vida →
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Tutela legal documentada
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Quién toma decisiones por tu hijo cuando tú no puedas. Quién maneja
                  el fideicomiso. Quién supervisa al cuidador. Documentado legalmente
                  con anticipación, no improvisado en crisis.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  GMM con cobertura específica
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  No todos los planes cubren las terapias y especialistas que tu hijo
                  necesita. Te muestro qué carriers manejan mejor neurología, psiquiatría
                  pediátrica, terapias conductuales, y seguimiento integral.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cómo trabajamos
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  1. Diagnóstico de necesidades de por vida
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Calculamos juntos el costo de cuidado proyectado: terapias actuales,
                  educación, vivienda asistida si aplica, cuidador a largo plazo,
                  consideraciones médicas crónicas. Es una conversación honesta — no
                  un formulario.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  2. Estructura combinada (no producto único)
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Combinación de seguro de vida + fideicomiso + GMM correcto +
                  documentos legales de tutela. Cada pieza cubre algo que las otras
                  no, y juntas forman la red de protección.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  3. Coordinación con notario y abogado especializado
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Trabajo con notarías y despachos legales con experiencia en
                  fideicomisos para personas con condiciones permanentes. No quedas
                  solo coordinando entre el seguro, el banco, el notario y el abogado.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  4. Revisión continua mientras tu hijo crece
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Las necesidades cambian. La estructura debe acompañar a tu hijo
                  desde infancia hasta la adultez. Revisamos cada año.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Mi hijo es muy pequeño aún. ¿No es prematuro pensar en esto?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Es lo opuesto. Mientras más temprano estructures, menos cuesta y más
                  tiempo tiene el patrimonio para crecer. Y los seguros de vida son
                  más baratos cuanto más joven los contrates. Empezar a los 35 con un
                  hijo de 5 es muy distinto a empezar a los 50 con uno de 20.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿Necesito tener un patrimonio enorme para que un fideicomiso tenga sentido?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  No. La función del seguro de vida es justamente "crear" el patrimonio
                  base que va al fideicomiso si tú llegas a faltar. Tu prima mensual
                  hoy puede convertirse en varios millones para tu hijo el día que
                  pase algo. Lo importante es estructurar correctamente.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Mi hijo tiene un diagnóstico reciente. ¿Aplica algún seguro?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  El seguro de vida es sobre TI (los padres), no sobre tu hijo — eso
                  es importante entenderlo. La condición de tu hijo no afecta tu
                  capacidad de asegurarte tú. Y el GMM tiene reglas específicas que
                  varían por carrier; te muestro cuáles aplican y cuáles no.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Pertenezco a una asociación de padres. ¿Trabajas con asociaciones?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Sí. Si tu asociación quiere organizar una sesión informativa para
                  varias familias a la vez, podemos coordinar — sin compromiso individual
                  de contratar, solo educativa. Escríbeme.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              Sin presión. Solo cuando estés lista. Tres formas: la que te acomode.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Mensaje rápido
                </div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  WhatsApp
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">
                  {whatsapp}
                </div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Email reflexivo
                </div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  Cuéntame por correo
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">
                  {email}
                </div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Consulta directa
                </div>
                <div className="text-lg font-medium">
                  Agenda 30 min gratis
                </div>
                <div className="mt-2 text-sm opacity-80">
                  Calendly · sin costo, sin compromiso
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
