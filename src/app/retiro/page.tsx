import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
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
    question: "Estoy joven, falta mucho para mi retiro.",
    answerText:
      "El interés compuesto premia exponencialmente al que empieza joven. Aportar $50,000 anuales desde los 30 puede equivaler a aportar $200,000 anuales empezando a los 50. Y la deducción fiscal del PPR te puede dar 30-35% de regreso vía SAT cada año, según tu nivel de ingreso.",
  },
  {
    question: "El IMSS me va a alcanzar.",
    answerText:
      "Tu pensión IMSS se calcula sobre el promedio de tus últimos años cotizados. Si los últimos años tuviste un SBC menor al máximo (25 UMAs), tu pensión queda muy por debajo de tu nivel de vida actual. Lo cuantificamos juntos antes de decidir.",
  },
  {
    question: "PPR vs AFORE: ¿cuál es mejor?",
    answerText:
      "No compiten — se complementan. La AFORE es obligatoria, el PPR es voluntario. La AFORE no te da deducción anual, el PPR sí. Para afluentes, el PPR es estructuralmente más rentable cuando se aprovecha la deducción fiscal.",
  },
  {
    question: "Modalidad 40 IMSS suena complicada.",
    answerText:
      "Tiene reglas específicas pero no es complicada — es metodológica. Lo crítico es entender el cálculo: si entras con SBC tope durante años suficientes, tu pensión puede multiplicarse 5-8x vs no usarla. Lo modelamos con tus datos antes de decidir.",
  },
  {
    question: "¿Y si las leyes cambian?",
    answerText:
      "Pueden cambiar — y por eso revisamos anualmente. Las reformas previsionales en México (1997, 2020) tienden a ser progresivas, raramente regresivas para quienes ya están cotizando. Y los PPRs ya contratados se respetan en términos generales.",
  },
  {
    question: "¿La aseguradora dónde invierte mi dinero?",
    answerText:
      "El PPR funciona como cuenta individualizada. Cada carrier tiene su política de inversión auditada por la CNSF y la CONSAR. Te muestro el rendimiento histórico y la composición del portafolio antes de elegir.",
  },
];

export const metadata: Metadata = {
  title: "Planeación de Retiro · PPR + Modalidad 40 IMSS — Iria Talan / RIF",
  description:
    "PPR con beneficio fiscal art. 151 fracc V y art. 185 LISR (hasta $213,973 MXN deducibles en 2026), Modalidad 40 IMSS y estructura combinada. MDRT Top of the Table · Asesora autorizada CNSF.",
  alternates: { canonical: `${SITE_URL}/retiro` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/retiro`,
    title: "Planeación de Retiro · PPR + Modalidad 40 — Iria Talan",
    description:
      "Multiplica tu pensión y deduce impuestos hoy. PPR + Modalidad 40 IMSS estructurados.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "FinancialProduct" as const,
    "@id": `${SITE_URL}/retiro#service`,
    name: "Planeación de Retiro · PPR + Modalidad 40 IMSS",
    description:
      "Plan Personal de Retiro con beneficio fiscal (art. 151 fracc V y art. 185 LISR) y Modalidad 40 IMSS para multiplicar pensión vitalicia.",
    url: `${SITE_URL}/retiro`,
    provider: { "@id": `${SITE_URL}#financialservice` },
    category: "Planeación de retiro y pensiones",
    areaServed: { "@type": "Country", name: "México" },
  };
}

export default async function RetiroPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = author?.socialLinks?.calendly ?? "https://calendly.com/iriatalan";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildServiceSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Planeación de Retiro", path: "/retiro" },
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
              src="/img/servicios/retiro-hero.png"
              alt="Pareja mexicana disfrutando una cena en un bistró parisino con la Torre Eiffel al fondo"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="px-6 pt-12 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}Planeación de Retiro
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            El retiro en México: la matemática que pocos hacen a tiempo.
          </h1>
          <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Si dependes 100% de la pensión IMSS, recibirás una fracción de tu último salario — y por menos
            años de los que probablemente vivirás. Hay dos herramientas legales que cambian esa matemática:
            <strong className="text-zinc-900 dark:text-zinc-50"> Plan Personal de Retiro (PPR)</strong> y{" "}
            <strong className="text-zinc-900 dark:text-zinc-50">Modalidad 40 IMSS</strong>.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Calcula tu pensión proyectada gratis
            </a>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              El gap del retiro mexicano
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              ¿Cuánto vas a recibir cuando dejes de trabajar?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">~30%</div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tasa de reemplazo típica de pensión IMSS Ley 97 (vs 100% de tu último salario)
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">+25 años</div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Esperanza de vida después del retiro a los 65 (México 2026)
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">5-8x</div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Multiplicador típico de pensión IMSS al usar Modalidad 40 estructurada
                </p>
              </div>
            </div>
            <p className="mt-6 text-xs text-zinc-500 italic border-l-2 border-zinc-300 dark:border-zinc-700 pl-3">
              Las cifras son ilustrativas y dependen del perfil, edad, aseguradora, producto, legislación vigente y evaluación individual.
            </p>
            <p className="mt-6 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              La pensión IMSS por sí sola rara vez sostiene el nivel de vida de una familia
              afluente o un patrimonio HNWI. Por eso las dos herramientas siguientes
              son las más vendidas hoy en mi consultoría.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Herramienta 1
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Plan Personal de Retiro (PPR) — beneficio fiscal real
            </h2>
            <p className="mt-4 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              El PPR es uno de los pocos instrumentos en México con doble beneficio:
              ahorro de retiro + deducción de impuestos hoy. Hay dos vías legales — cada una
              con su lógica y conviene a perfiles distintos.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Vía A
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Art. 151 fracc V LISR
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Deducción personal anual junto con tus otras deducciones (médicos, donativos, etc.)
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>· Hasta <strong>10% de tus ingresos acumulables</strong></li>
                  <li>· Sin exceder <strong>5 UMAs anuales</strong></li>
                  <li>· En 2026: ~<strong>$213,973 MXN</strong> deducibles</li>
                  <li>· Recuperas 30-35% vía SAT según ISR</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Vía B
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Art. 185 LISR
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Estímulo fiscal alternativo — resta a la base del impuesto antes de aplicar tarifa
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <li>· Régimen distinto al 151-V</li>
                  <li>· Conveniente para perfiles de ingreso alto específicos</li>
                  <li>· Compatible con permanencia y plan de retiro</li>
                  <li>· Evaluamos juntos cuál te conviene</li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-sm text-zinc-500 leading-relaxed max-w-2xl">
              Nota: el monto total de deducciones personales del art. 151 no puede exceder
              el menor de 5 UMAs anuales o 15% de los ingresos totales. Lo cuantificamos
              juntos antes de decidir.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Herramienta 2
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Modalidad 40 IMSS — el secreto mal entendido
            </h2>
            <p className="mt-4 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              Si cotizaste IMSS y dejaste un trabajo asalariado, puedes contratar
              Modalidad 40 (Continuación Voluntaria al Régimen Obligatorio) para seguir
              cotizando con un Salario Base de Cotización (SBC) hasta el tope de 25 UMAs.
            </p>

            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">El cálculo que cambia tu retiro:</strong>{" "}
                tu pensión IMSS se calcula sobre el promedio de tus últimos años cotizados.
                Si entras a Modalidad 40 con SBC tope durante varios años antes del retiro,
                tu pensión vitalicia puede multiplicarse 5-8 veces vs no usarla.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">El costo:</strong>{" "}
                en escenarios típicos, contratar Modalidad 40 con SBC tope durante 5 años
                puede sumar inversiones del orden de <strong>$1.5 millones de pesos</strong>.
                Pero el retorno en pensión vitalicia (que recibes hasta tu fallecimiento +
                viudez si aplica) supera por mucho esa cifra.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Requisitos básicos:</strong>{" "}
                no tener un aseguramiento vigente como trabajador subordinado, tener
                52 semanas de cotización en los últimos 5 años, y pagar el aseguramiento
                con base en el último SBC o superior (sin exceder el tope de 25 UMAs).
              </p>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">
                Cuándo conviene Modalidad 40
              </p>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li>· Cotizaste muchos años con SBC bajo y quieres “subir” el promedio antes del retiro</li>
                <li>· Dejaste de trabajar como subordinado pero quieres mantener historial IMSS</li>
                <li>· Quieres maximizar la pensión vitalicia (vs lump-sum AFORE)</li>
                <li>· Buscas garantía estatal (IMSS) y atención médica post-retiro</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cómo trabajamos contigo
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  1. Diagnóstico de tu pensión proyectada actual
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Ley 73 o 97, semanas cotizadas, último SBC. Te muestro qué pensión
                  recibirías hoy y qué tan lejos está de tu nivel de vida deseado.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  2. Análisis fiscal de PPR
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Qué deducción te conviene — art. 151-V o art. 185. Cuánto puedes recuperar
                  vía SAT este año y los siguientes.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  3. Evaluación de Modalidad 40
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Si calificas, te modelo el costo proyectado y la pensión que obtendrías.
                  Tú decides si la matemática te convence.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  4. Estructura combinada
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  PPR + Modalidad 40 + (si aplica) ahorro patrimonial adicional. Trabajo con
                  6 aseguradoras autorizadas para el PPR; según tu situación específica, te
                  recomiendo la(s) más adecuada(s) para ti. Aportaciones desde $2,000 MXN/mes.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  5. Acompañamiento anual
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  La fiscalidad cambia, las UMAs suben, las reformas IMSS pasan.
                  Revisamos cada año para ajustar tu estrategia.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Estoy joven, falta mucho para mi retiro.
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  El interés compuesto premia exponencialmente al que empieza joven. Aportar
                  $50,000 anuales desde los 30 puede equivaler a aportar $200,000 anuales empezando
                  a los 50. Y la deducción fiscal del PPR te puede dar 30-35% de regreso vía SAT
                  cada año, según tu nivel de ingreso.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  El IMSS me va a alcanzar.
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Tu pensión IMSS se calcula sobre el promedio de tus últimos años cotizados.
                  Si los últimos años tuviste un SBC menor al máximo (25 UMAs), tu pensión queda
                  muy por debajo de tu nivel de vida actual. Lo cuantificamos juntos antes de decidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  PPR vs AFORE: ¿cuál es mejor?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  No compiten — se complementan. La AFORE es obligatoria, el PPR es voluntario.
                  La AFORE no te da deducción anual, el PPR sí. Para afluentes, el PPR es
                  estructuralmente más rentable cuando se aprovecha la deducción fiscal.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Modalidad 40 IMSS suena complicada.
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Tiene reglas específicas pero no es complicada — es metodológica. Lo crítico es
                  entender el cálculo: si entras con SBC tope durante años suficientes, tu pensión
                  puede multiplicarse 5-8x vs no usarla. Lo modelamos con tus datos antes de decidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿Y si las leyes cambian?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Pueden cambiar — y por eso revisamos anualmente. Las reformas previsionales en
                  México (1997, 2020) tienden a ser progresivas, raramente regresivas para quienes
                  ya están cotizando. Y los PPRs ya contratados se respetan en términos generales.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿La aseguradora dónde invierte mi dinero?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  El PPR funciona como cuenta individualizada. Cada carrier tiene su política de
                  inversión auditada por la CNSF y la CONSAR. Te muestro el rendimiento histórico
                  y la composición del portafolio antes de elegir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              Lo único que pido: que vengas con tus dudas, no con respuestas.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
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
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
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
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Cálculo directo
                </div>
                <div className="text-lg font-medium">
                  Calcula tu pensión gratis
                </div>
                <div className="mt-2 text-sm opacity-80">
                  Calendly · 30 min
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
