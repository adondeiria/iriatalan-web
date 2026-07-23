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
  buildHreflangAlternates,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";
import { WA_MESSAGES, waHref } from "@/lib/whatsapp";

const FAQS: FAQItem[] = [
  {
    question: "¿Cuánto puedo deducir con un PPR en México en 2026?",
    answerText:
      "Conforme al Art. 151 fracc V LISR vigente, puedes deducir aportaciones a un Plan Personal de Retiro hasta el menor de: el 10% de tus ingresos acumulables del ejercicio, o el equivalente a 5 UMAs anuales (≈ $213,973 MXN en 2026 — cifra vigente a 2026; la UMA se actualiza anualmente por INPC). El beneficio real que recibes vía SAT depende de tu tasa marginal de ISR: puede regresarte 30-35% si estás en el tope. La mecánica del PPR se analiza de forma separada al tope global de deducciones personales clásicas — consulta la aplicabilidad a tu caso con tu asesor fiscal antes de aportar.",
  },
  {
    question: "¿Conviene Modalidad 40 si no tengo ahorrado para pagarla?",
    answerText:
      "Modalidad 40 IMSS puede multiplicar tu pensión 5-8 veces, pero requiere pagar la cuota equivalente al SBC topado durante 5 años. El error frecuente es empezarla sin un plan para sostenerla — la cuota se vuelve insostenible y se pierde la pensión máxima. Lo correcto: emparejarla con un Seguro de Ahorro / Retiro o un fondo de inversión que financie esos 5 años. Antes de inscribirte, calculamos cuánto necesitarías ahorrar mes a mes para que la estrategia sea sostenible — depende de tu SBC objetivo, semanas cotizadas y horizonte de inicio.",
  },
  {
    question: "¿Cuánto cuesta Modalidad 40 al mes en 2026?",
    answerText:
      "El costo mensual de Modalidad 40 IMSS depende del Salario Base de Cotización (SBC) que declares, topado a 25 UMAs diarias conforme a la Ley del Seguro Social vigente. Como referencia estimada 2026, el rango va aproximadamente desde $2,000 MXN al mes (SBC bajo) hasta alrededor de $13,000 MXN al mes (SBC topado al máximo) — cifras referenciales sujetas a la UMA vigente y la cuota IMSS aplicable. El SBC se elige estratégicamente: más alto cotizas, más cuesta, pero también sube tu pensión vitalicia. El cálculo exacto se hace con tus datos antes de inscribirte, y de ahí decidimos si conviene financiarlo con un Seguro de Ahorro o un fondo de inversión.",
  },
  {
    question: "¿A qué edad conviene empezar a aportar a un PPR / Plan de Retiro?",
    answerText:
      "En cuanto comiences a trabajar — entre más temprano, más aprovechas el interés compuesto. Cada peso que aportes hoy genera rendimientos durante décadas, y esos rendimientos a su vez generan más rendimientos: un aporte hecho a los 25 años puede multiplicarse muchas veces para cuando llegues a los 65, mientras que el mismo aporte hecho a los 50 tendría apenas 15 años para crecer. Aportar $50,000 anuales desde los 30 puede equivaler a aportar varias veces esa cantidad empezando a los 50 (ejemplo ilustrativo, depende de tasa de rendimiento y régimen vigente). A esto se suma una ventaja fiscal: más años aportando = más años de deducción acumulada vía SAT cada abril. Si ya pasaste los 40 o 50, no es tarde — solo significa que el monto sugerido es mayor para alcanzar el mismo objetivo. Lo correcto: arrancar ahora con lo que puedas y aumentar aportes según se estabilice tu ingreso.",
  },
  {
    question: "¿Puedo sacar mi dinero del PPR antes de los 65?",
    answerText:
      "Sí, pero perderías el beneficio fiscal. El PPR está diseñado para retiro (edad 65 conforme al Art. 151 fracc V LISR vigente) o casos de invalidez/incapacidad. Si lo retiras antes por otro motivo, las cantidades retiradas son consideradas ingreso acumulable y la aseguradora retiene impuestos. Por eso es importante NO aportar al PPR dinero que sabes que vas a necesitar antes de los 65 — para liquidez de corto-mediano plazo conviene un instrumento distinto. Consulta la aplicabilidad fiscal a tu caso con tu asesor fiscal antes de decidir un retiro anticipado.",
  },
  {
    question: "¿El PPR sustituye o complementa mi AFORE?",
    answerText:
      "Complementa. La AFORE es obligatoria (te la asigna el sistema cuando empiezas a trabajar formalmente) y administra tus aportes patronales y voluntarios — no te da deducción fiscal directa en tu declaración anual. El PPR es voluntario, lo contratas con una aseguradora autorizada, y sus aportaciones son deducibles conforme al Art. 151 fracc V LISR vigente. Para la mayoría de profesionistas con ISR alto, el PPR puede ser estructuralmente más rentable cuando se aprovecha la deducción fiscal, sujeto al perfil fiscal individual — pero NO sustituye a la AFORE: ambos coexisten y se suman al monto disponible al retiro.",
  },
  {
    question: "Estoy joven, falta mucho para mi retiro.",
    answerText:
      "El interés compuesto premia exponencialmente al que empieza joven. Aportar $50,000 anuales desde los 30 puede equivaler a aportar $200,000 anuales empezando a los 50 (ejemplo ilustrativo, depende de tasa de rendimiento y régimen vigente). La deducción del PPR puede regresarte 30-35% dependiendo de tu tasa marginal de ISR.",
  },
  {
    question: "El IMSS me va a alcanzar.",
    answerText:
      "Tu pensión IMSS se calcula sobre el promedio de tus últimos años cotizados. Si los últimos años tuviste un SBC menor al máximo (25 UMAs), tu pensión queda muy por debajo de tu nivel de vida actual. Lo cuantificamos juntos antes de decidir.",
  },
  {
    question: "PPR vs AFORE: ¿cuál es mejor?",
    answerText:
      "No compiten — se complementan. La AFORE es obligatoria, el PPR es voluntario. La AFORE no te da deducción anual, el PPR sí. Para afluentes, el PPR puede ser estructuralmente más rentable cuando se aprovecha la deducción fiscal, sujeto al perfil fiscal individual.",
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
  title: "Planeación de Retiro · PPR + Modalidad 40 IMSS",
  description:
    "Multiplica tu pensión con un PPR y Modalidad 40 IMSS. Deduce impuestos hoy y asegura tu retiro con una estrategia diseñada para ti.",
  alternates: buildHreflangAlternates(
    "/retiro",
    "/retiro",
    "/retirement-planning",
  ),
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

  const ctaUrl = "/contacto#agendar";
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
              src="/img/servicios/retiro-hero.jpg"
              alt="Pareja mexicana disfrutando una cena en un bistró parisino con la Torre Eiffel al fondo"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="px-6 pt-12 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-rif-gris">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}Planeación de Retiro
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            El retiro en México: la matemática que pocos hacen a tiempo.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Si dependes 100% de la pensión IMSS, recibirás una fracción de tu último salario — y por menos
            años de los que probablemente vivirás. Hay dos herramientas legales que cambian esa matemática:
            <strong className="text-ink dark:text-cream-light"> Plan Personal de Retiro (PPR)</strong> y{" "}
            <strong className="text-ink dark:text-cream-light">Modalidad 40 IMSS</strong>.
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
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              El gap del retiro mexicano
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              ¿Cuánto vas a recibir cuando dejes de trabajar?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-3xl font-semibold text-ink dark:text-cream-light">~30%</div>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Tasa de reemplazo típica de pensión IMSS Ley 97 (vs 100% de tu último salario)
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-3xl font-semibold text-ink dark:text-cream-light">+25 años</div>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Esperanza de vida después del retiro a los 65 (México 2026)
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-3xl font-semibold text-ink dark:text-cream-light">5-8x</div>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Multiplicador típico de pensión IMSS al usar Modalidad 40 estructurada
                </p>
              </div>
            </div>
            <p className="mt-6 text-xs text-rif-gris italic border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-3">
              Las cifras son ilustrativas y dependen del perfil, edad, aseguradora, producto, legislación vigente y evaluación individual.
            </p>
            <p className="mt-6 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              La pensión IMSS por sí sola rara vez sostiene el nivel de vida de una familia
              afluente o un patrimonio complejo. Por eso las dos herramientas siguientes
              son las más vendidas hoy en mi consultoría.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Herramienta 1
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Plan Personal de Retiro (PPR) — beneficio fiscal real
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              El PPR es uno de los pocos instrumentos en México con doble beneficio:
              ahorro de retiro + deducción de impuestos hoy. Hay dos vías legales — cada una
              con su lógica y conviene a perfiles distintos.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Vía A
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Art. 151 fracc V LISR
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Deducción personal anual junto con tus otras deducciones (médicos, donativos, etc.)
                </p>
                <ul className="mt-4 space-y-2 text-sm text-warm-brown dark:text-cream-light/85">
                  <li>· Hasta <strong>10% de tus ingresos acumulables</strong></li>
                  <li>· Sin exceder <strong>5 UMAs anuales</strong></li>
                  <li>· En 2026: ~<strong>$213,973 MXN</strong> deducibles (cifra vigente a 2026; la UMA se actualiza anualmente por INPC)</li>
                  <li>· Puedes recuperar hasta 30-35% vía SAT dependiendo de tu tasa marginal de ISR</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Vía B
                </div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Art. 185 LISR
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Estímulo fiscal alternativo — resta a la base del impuesto antes de aplicar tarifa
                </p>
                <ul className="mt-4 space-y-2 text-sm text-warm-brown dark:text-cream-light/85">
                  <li>· Régimen distinto al 151-V</li>
                  <li>· Conveniente para perfiles de ingreso alto específicos</li>
                  <li>· Compatible con permanencia y plan de retiro</li>
                  <li>· Evaluamos juntos cuál te conviene</li>
                </ul>
              </div>
            </div>

            <p className="mt-8 text-sm text-rif-gris leading-relaxed max-w-2xl">
              Nota: el monto total de deducciones personales del art. 151 no puede exceder
              el menor de 5 UMAs anuales o 15% de los ingresos totales. Lo cuantificamos
              juntos antes de decidir.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Herramienta 2
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Modalidad 40 IMSS — el secreto mal entendido
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Si cotizaste IMSS y dejaste un trabajo asalariado, puedes contratar
              Modalidad 40 (Continuación Voluntaria al Régimen Obligatorio) para seguir
              cotizando con un Salario Base de Cotización (SBC) hasta el tope de 25 UMAs.
            </p>

            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                <strong className="text-ink dark:text-cream-light">El cálculo que cambia tu retiro:</strong>{" "}
                tu pensión IMSS se calcula sobre el promedio de tus últimos años cotizados.
                Si entras a Modalidad 40 con SBC tope durante varios años antes del retiro,
                tu pensión vitalicia puede multiplicarse 5-8 veces vs no usarla.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">El costo:</strong>{" "}
                en escenarios típicos, contratar Modalidad 40 con SBC tope durante 5 años
                puede sumar inversiones del orden de <strong>$1.5 millones de pesos</strong>
                (ejemplo ilustrativo; el monto exacto depende del SBC, semanas cotizadas y normativa
                IMSS vigente). Pero el retorno en pensión vitalicia (que recibes hasta tu fallecimiento +
                viudez si aplica) supera por mucho esa cifra.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">Requisitos básicos:</strong>{" "}
                no tener un aseguramiento vigente como trabajador subordinado, tener
                52 semanas de cotización en los últimos 5 años, y pagar el aseguramiento
                con base en el último SBC o superior (sin exceder el tope de 25 UMAs).
              </p>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-cream dark:bg-coffee border border-warm-brown/15 dark:border-warm-brown/30">
              <p className="text-sm font-medium text-ink dark:text-cream-light mb-3">
                Cuándo conviene Modalidad 40
              </p>
              <ul className="space-y-2 text-sm text-warm-brown dark:text-cream-light/85">
                <li>· Cotizaste muchos años con SBC bajo y quieres “subir” el promedio antes del retiro</li>
                <li>· Dejaste de trabajar como subordinado pero quieres mantener historial IMSS</li>
                <li>· Quieres maximizar la pensión vitalicia (vs lump-sum AFORE)</li>
                <li>· Buscas garantía estatal (IMSS) y atención médica post-retiro</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Cómo trabajamos contigo
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Diagnóstico de tu pensión proyectada actual
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Ley 73 o 97, semanas cotizadas, último SBC. Te muestro qué pensión
                  recibirías hoy y qué tan lejos está de tu nivel de vida deseado.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Análisis fiscal de PPR
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Qué deducción te conviene — art. 151-V o art. 185. Cuánto puedes recuperar
                  vía SAT este año y los siguientes.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Evaluación de Modalidad 40
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Si calificas, te modelo el costo proyectado y la pensión que obtendrías.
                  Tú decides si la matemática te convence.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Estructura combinada
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  PPR + Modalidad 40 + (si aplica) ahorro patrimonial adicional. Trabajo con
                  6 aseguradoras autorizadas para el PPR; según tu situación específica, te
                  recomiendo la(s) más adecuada(s) para ti. Aportaciones desde $2,000 MXN/mes.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  5. Acompañamiento anual
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  La fiscalidad cambia, las UMAs suben, las reformas IMSS pasan.
                  Revisamos cada año para ajustar tu estrategia.
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
                  ¿Cuánto puedo deducir con un PPR en México en 2026?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Conforme al Art. 151 fracc V LISR vigente, puedes deducir aportaciones a un Plan Personal de Retiro hasta el menor de: el 10% de tus ingresos acumulables del ejercicio, o el equivalente a 5 UMAs anuales (≈ $213,973 MXN en 2026 — cifra vigente a 2026; la UMA se actualiza anualmente por INPC). El beneficio real que recibes vía SAT depende de tu tasa marginal de ISR: puede regresarte 30-35% si estás en el tope. La mecánica del PPR se analiza de forma separada al tope global de deducciones personales clásicas — consulta la aplicabilidad a tu caso con tu asesor fiscal antes de aportar.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Conviene Modalidad 40 si no tengo ahorrado para pagarla?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Modalidad 40 IMSS puede multiplicar tu pensión 5-8 veces, pero requiere pagar la cuota equivalente al SBC topado durante 5 años. El error frecuente es empezarla sin un plan para sostenerla — la cuota se vuelve insostenible y se pierde la pensión máxima. Lo correcto: emparejarla con un Seguro de Ahorro / Retiro o un fondo de inversión que financie esos 5 años. Antes de inscribirte, calculamos cuánto necesitarías ahorrar mes a mes para que la estrategia sea sostenible — depende de tu SBC objetivo, semanas cotizadas y horizonte de inicio.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cuánto cuesta Modalidad 40 al mes en 2026?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El costo mensual de Modalidad 40 IMSS depende del Salario Base de Cotización (SBC) que declares, topado a 25 UMAs diarias conforme a la Ley del Seguro Social vigente. Como referencia estimada 2026, el rango va aproximadamente desde $2,000 MXN al mes (SBC bajo) hasta alrededor de $13,000 MXN al mes (SBC topado al máximo) — cifras referenciales sujetas a la UMA vigente y la cuota IMSS aplicable. El SBC se elige estratégicamente: más alto cotizas, más cuesta, pero también sube tu pensión vitalicia. El cálculo exacto se hace con tus datos antes de inscribirte, y de ahí decidimos si conviene financiarlo con un Seguro de Ahorro o un fondo de inversión.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿A qué edad conviene empezar a aportar a un PPR / Plan de Retiro?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  En cuanto comiences a trabajar — entre más temprano, más aprovechas el interés compuesto. Cada peso que aportes hoy genera rendimientos durante décadas, y esos rendimientos a su vez generan más rendimientos: un aporte hecho a los 25 años puede multiplicarse muchas veces para cuando llegues a los 65, mientras que el mismo aporte hecho a los 50 tendría apenas 15 años para crecer. Aportar $50,000 anuales desde los 30 puede equivaler a aportar varias veces esa cantidad empezando a los 50 (ejemplo ilustrativo, depende de tasa de rendimiento y régimen vigente). A esto se suma una ventaja fiscal: más años aportando = más años de deducción acumulada vía SAT cada abril. Si ya pasaste los 40 o 50, no es tarde — solo significa que el monto sugerido es mayor para alcanzar el mismo objetivo. Lo correcto: arrancar ahora con lo que puedas y aumentar aportes según se estabilice tu ingreso.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Puedo sacar mi dinero del PPR antes de los 65?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, pero perderías el beneficio fiscal. El PPR está diseñado para retiro (edad 65 conforme al Art. 151 fracc V LISR vigente) o casos de invalidez/incapacidad. Si lo retiras antes por otro motivo, las cantidades retiradas son consideradas ingreso acumulable y la aseguradora retiene impuestos. Por eso es importante NO aportar al PPR dinero que sabes que vas a necesitar antes de los 65 — para liquidez de corto-mediano plazo conviene un instrumento distinto. Consulta la aplicabilidad fiscal a tu caso con tu asesor fiscal antes de decidir un retiro anticipado.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿El PPR sustituye o complementa mi AFORE?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Complementa. La AFORE es obligatoria (te la asigna el sistema cuando empiezas a trabajar formalmente) y administra tus aportes patronales y voluntarios — no te da deducción fiscal directa en tu declaración anual. El PPR es voluntario, lo contratas con una aseguradora autorizada, y sus aportaciones son deducibles conforme al Art. 151 fracc V LISR vigente. Para la mayoría de profesionistas con ISR alto, el PPR puede ser estructuralmente más rentable cuando se aprovecha la deducción fiscal, sujeto al perfil fiscal individual — pero NO sustituye a la AFORE: ambos coexisten y se suman al monto disponible al retiro.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Estoy joven, falta mucho para mi retiro.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El interés compuesto premia exponencialmente al que empieza joven. Aportar
                  $50,000 anuales desde los 30 puede equivaler a aportar $200,000 anuales empezando
                  a los 50 (ejemplo ilustrativo, depende de tasa de rendimiento y régimen vigente).
                  La deducción del PPR puede regresarte hasta 30-35% vía SAT cada año, dependiendo
                  de tu tasa marginal de ISR y del tope deducible vigente.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  El IMSS me va a alcanzar.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Tu pensión IMSS se calcula sobre el promedio de tus últimos años cotizados.
                  Si los últimos años tuviste un SBC menor al máximo (25 UMAs), tu pensión queda
                  muy por debajo de tu nivel de vida actual. Lo cuantificamos juntos antes de decidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  PPR vs AFORE: ¿cuál es mejor?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No compiten — se complementan. La AFORE es obligatoria, el PPR es voluntario.
                  La AFORE no te da deducción anual, el PPR sí. Para afluentes, el PPR puede ser
                  estructuralmente más rentable cuando se aprovecha la deducción fiscal, sujeto al
                  perfil fiscal individual.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Modalidad 40 IMSS suena complicada.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Tiene reglas específicas pero no es complicada — es metodológica. Lo crítico es
                  entender el cálculo: si entras con SBC tope durante años suficientes, tu pensión
                  puede multiplicarse 5-8x vs no usarla. Lo modelamos con tus datos antes de decidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Y si las leyes cambian?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Pueden cambiar — y por eso revisamos anualmente. Las reformas previsionales en
                  México (1997, 2020) tienden a ser progresivas, raramente regresivas para quienes
                  ya están cotizando. Y los PPRs ya contratados se respetan en términos generales.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿La aseguradora dónde invierte mi dinero?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El PPR funciona como cuenta individualizada. Cada carrier tiene su política de
                  inversión auditada por la CNSF y la CONSAR. Te muestro el rendimiento histórico
                  y la composición del portafolio antes de elegir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Casos relacionados
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              El PPR también aplica en estas situaciones
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/personas/mujeres"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Mujeres profesionistas con ISR alto
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  PPR como herramienta fiscal específica para optimización de ingresos profesionales.
                </p>
              </Link>
              <Link
                href="/empresas"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Empresarios y dueños de negocio
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  PPR personal + estrategia patrimonial de la empresa, coordinados.
                </p>
              </Link>
              <Link
                href="/personas/mexicanos-en-el-extranjero"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Mexicanos viviendo fuera del país
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  El beneficio aplica si sigues tributando en México (residencia fiscal, ingresos de fuente mexicana, propiedades, empresa).
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85">
              Lo único que pido: que vengas con tus dudas, no con respuestas.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={waHref(whatsapp, WA_MESSAGES.retiro)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
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
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
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
                  Cálculo directo
                </div>
                <div className="text-lg font-medium">
                  Calcula tu pensión gratis
                </div>
                <div className="mt-2 text-sm opacity-80">
                  Agenda · 30 min
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
