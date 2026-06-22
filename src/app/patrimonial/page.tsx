import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildGraph,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

const FAQS: FAQItem[] = [
  {
    question: "¿Qué seguro de vida conviene para proteger a mi familia?",
    answerText:
      "No hay una respuesta única — el seguro correcto depende de tu patrimonio actual, edad de tus dependientes, gastos fijos del hogar y moneda funcional de tus herederos. Como referencia general, una familia con patrimonio en construcción suele requerir un seguro vitalicio con suma asegurada de 5-10 veces tu ingreso anual + designación irrevocable hacia los beneficiarios. Si hay patrimonio significativo o herederos en distintas jurisdicciones, conviene estructurar designación irrevocable hacia un fideicomiso para evitar juicio sucesorio. Trabajamos con 6 aseguradoras AAA en México y diseñamos la combinación según tu caso particular.",
  },
  {
    question: "¿Qué pasa si mis beneficiarios no están actualizados?",
    answerText:
      "La aseguradora paga al último beneficiario designado en el contrato, aunque ya no refleje tu voluntad real. Divorcios, hijos nuevos, segundas parejas, socios que entran y salen — todos cambian quién debería recibir el capital. Cuando llega el siniestro, el dinero llega a la persona equivocada y no hay vuelta atrás. Por eso revisar designación de beneficiarios cada vez que tu vida cambia no es paranoia — es disciplina patrimonial básica. Recomendamos revisión anual + revisión inmediata tras matrimonio, divorcio, nacimiento, fallecimiento de un beneficiario, o cambio significativo de patrimonio.",
  },
  {
    question: "¿Cómo se evita el juicio sucesorio con un seguro de vida?",
    answerText:
      "Con la designación de tus beneficiarios. Conforme al Art. 179 LCS vigente, cuando designas a un beneficiario de forma irrevocable, el derecho de ese beneficiario se constituye como derecho propio — el capital asegurado NO forma parte de la masa hereditaria del fallecido y NO requiere juicio sucesorio para llegar al beneficiario. Esto permite que el dinero llegue en máximo 30 días directo a quien designaste, sin esperar protocolización notarial ni resolución judicial. Si además estructuras la designación irrevocable hacia un fideicomiso, ganas control sobre cómo y cuándo recibe el capital tu beneficiario.",
  },
  {
    question: "¿Es cierto que un seguro de vida es inembargable?",
    answerText:
      "El crédito que un seguro de vida concede al asegurado o a sus beneficiarios goza de protección frente a embargos conforme al Art. 188 de la Ley sobre el Contrato de Seguro vigente: como regla general, los acreedores no pueden embargarlo ni ejecutarlo. Importante: la protección NO es absoluta — la ley prevé excepciones, principalmente cuando las primas se pagaron en fraude de acreedores o en montos desproporcionados respecto a tu capacidad económica. Por eso el blindaje real depende de cómo se estructura la póliza desde el inicio: lo revisamos en la sesión inicial para que tu protección sea efectiva y no impugnable.",
  },
  {
    question: "¿Conviene contratar mi seguro de vida en pesos o en dólares?",
    answerText:
      "Depende de la moneda funcional de tus herederos y tu propio patrimonio. Si tus herederos viven o estudiarán en EUA, Europa, o tienen gastos dolarizados, un seguro en USD elimina el riesgo cambiario al momento del pago. Si todo tu patrimonio y los gastos de tus herederos están en pesos, contratar en MXN es más simple. Para patrimonios mixtos, lo común es estructurar parte en cada moneda según el destino esperado del capital. Varias de las 6 aseguradoras AAA con las que trabajo ofrecen productos en ambas monedas — la elección óptima la mapeamos en la sesión inicial.",
  },
  {
    question: "¿Cómo se compara un fideicomiso testamentario vs un fideicomiso financiado por seguro de vida?",
    answerText:
      "Diferencia clave: liquidez al momento del fallecimiento. El fideicomiso testamentario hereda lo que el caudal hereditario contenga al fallecer — y ese caudal puede tardar meses o años en liberarse mientras se resuelve el juicio sucesorio. El fideicomiso financiado por seguro de vida recibe el capital asegurado en semanas, vía designación irrevocable, sin pasar por sucesión. En la práctica, ambos pueden coexistir: el testamentario administra activos heredados (inmuebles, negocios), y el financiado por seguro genera la liquidez inmediata para impuestos, deudas, sostenimiento de herederos durante el juicio sucesorio, y arranque del fideicomiso patrimonial.",
  },
  {
    question: "¿Pueden mis seguros formar parte de mi planeación fiscal patrimonial?",
    answerText:
      "Sí — los seguros son una herramienta dentro de la planeación fiscal patrimonial. Tres palancas principales: (1) PPR para deducción anual conforme al Art. 151 fracc V LISR vigente; (2) Seguros de vida con designación irrevocable, con tratamiento fiscal del Art. 93 fracc XXI LISR vigente para beneficiarios directos, sujeto al cumplimiento de los requisitos fiscales aplicables; (3) Seguros de Persona Clave en estructura corporativa para socios y dueños, conforme al Art. 27 fracc XII LISR + Art. 51 RLISR vigentes. La estrategia óptima requiere coordinación con tu fiscalista y abogado patrimonial — yo aporto la pieza de seguros y diseño en conjunto con tu equipo legal/fiscal.",
  },
  {
    question: "¿A partir de qué patrimonio aplica?",
    answerText:
      "No hay umbral fijo — depende de la complejidad, no del monto absoluto. Una empresa familiar de mediano tamaño con socios y herederos múltiples puede beneficiarse tanto como un patrimonio complejo tradicional.",
  },
  {
    question: "¿Trabajas con bancas privadas?",
    answerText:
      "Sí, coordinamos con tu banca privada actual. Mi rol no compite con la banca — soy capa aseguradora y de planeación patrimonial. Trabajamos juntos para que tu estrategia bancaria y aseguradora estén alineadas.",
  },
  {
    question: "¿Cobras honorarios o solo comisiones?",
    answerText:
      "Lo platicamos en la primera conversación. Para casos patrimoniales complejos hay opciones de honorarios fijos o comisiones por carrier según el producto. Total transparencia sobre cómo me pagan.",
  },
  {
    question: "¿Mi información es confidencial?",
    answerText:
      "Absolutamente. Mi obligación profesional bajo CNSF + ética AMASFAC. Nunca compartas datos sensibles por canales abiertos — usa el email o agenda llamada.",
  },
  {
    question: "¿Trabajas con family office?",
    answerText:
      "Sí, coordinamos con tu family office. Mi asesoría no compite con la banca — hago estrategias con seguros. Trabajamos juntos para que tu estrategia patrimonial integral incluya los seguros adecuados para ti y tu familia.",
  },
];


export const metadata: Metadata = {
  title: "Asesoría Patrimonial para Familias en México y el Extranjero",
  description:
    "Asesoría patrimonial para personas y familias en México y mexicanos en el extranjero: fideicomisos, sucesión, inversiones y seguros en dólares. Blinda y ordena tu patrimonio.",
  alternates: { canonical: `${SITE_URL}/patrimonial` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/patrimonial`,
    title: "Patrimonios complejos · Asesoría discreta — Iria Talan",
    description:
      "Para familias con patrimonio que requieren fideicomisos, sucesión, inversiones complejas y estructuras internacionales.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/patrimonial#audience`,
    audienceType: "Familias con patrimonio · HNWI México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

export default async function PatrimonialPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Patrimonios complejos", path: "/patrimonial" },
    ])
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
              src="/img/servicios/patrimonial-hero.png"
              alt="Manos firmando un documento de fideicomiso con pluma fountain en escritorio de notaría — planeación patrimonial discreta"
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
            {" / "}Patrimonios complejos
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Asesoría patrimonial discreta para patrimonios complejos.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Cuando tu patrimonio cruza ciertos umbrales, los productos estándar
            dejan de ser suficientes. Aquí trabajamos fideicomisos, sucesión patrimonial,
            inversiones complejas y estructuras internacionales — con la discreción
            y profundidad técnica que el caso exige.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={`mailto:${email}?subject=Consulta%20patrimonios%20complejos`}
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Conversación confidencial por email
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
              Cuándo este espacio es para ti
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Si tu patrimonio personal o familiar incluye empresas en operación,
                inmuebles de inversión, instrumentos financieros internacionales,
                herederos múltiples, o exposición fiscal compleja — los productos
                aseguradores estándar no resuelven tu realidad.
              </p>
              <p>
                Lo que sí funciona: <strong className="text-ink dark:text-cream-light">combinaciones
                estructuradas</strong> de seguro de vida con suma asegurada amplia,
                fideicomisos con reglas a tu medida, planes de inversión integrados
                con tu estrategia fiscal, y coberturas internacionales que reconocen
                el carácter transfronterizo de tu patrimonio.
              </p>
              <p>
                Cada caso requiere coordinación con tu notario, abogado fiscalista,
                contador y banca privada. Yo trabajo con las 6 aseguradoras AAA en México y
                conozco las estructuras que sobreviven a auditoría, sucesión y disputa familiar
                cuando se estructuran correctamente con asesoría legal.
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
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Sucesión</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Fideicomisos patrimoniales
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Vehículos legales que protegen el patrimonio durante tu vida y trasladan reglas
                  específicas a herederos. Útil para evitar disputas, proteger menores,
                  asegurar continuidad de negocios.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Vida Patrimonial</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Seguros de vida con suma asegurada amplia
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Sumas aseguradas calibradas a tu patrimonio (no a múltiplos de salario).
                  Beneficiario blindado, posible interaction con fideicomiso testamentario.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Inversión</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Inversiones aseguradas
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Vehículos de inversión con componente asegurador (Allianz y otros). Combinan
                  rendimiento con protección, optimización fiscal y portabilidad internacional.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Internacional</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Coberturas y estructuras transfronterizas
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  GMM internacional (BUPA, MetLife) para tratamientos en EUA o Europa.
                  Estructuras que reconocen residencia fiscal múltiple y herederos en distintas
                  jurisdicciones.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Empresarial</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Buy-sell agreement asegurado
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Si tienes socios, instrumento que asegura compra-venta de participación
                  accionaria si uno falta. Evita disputas con herederos y protege control empresarial.
                  Ver{" "}
                  <Link href="/empresas" className="underline">/empresas</Link>.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Fiscal</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Optimización fiscal vía PPR + estímulos
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Aprovechamiento estructurado de art. 151 fracc V y art. 185 LISR vigentes
                  (sujeto al cumplimiento de los requisitos fiscales aplicables). Combinable con
                  Modalidad 40 IMSS para perfiles que cotizaron antes. Ver{" "}
                  <Link href="/retiro" className="underline">/retiro</Link>.
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
                  1. Conversación confidencial
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Una sesión inicial — preferentemente por email reflexivo o videollamada
                  privada — donde expones tu patrimonio en términos generales y los retos
                  específicos que enfrentas. Sin formularios, sin banco de datos, sin presión.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Diagnóstico técnico
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Identificamos juntos los huecos: ¿qué pasa con tu patrimonio si tú o
                  un socio faltan? ¿Cómo se distribuirá entre herederos sin conflicto?
                  ¿Qué exposición fiscal puede optimizarse?
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Propuesta combinada
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Estructura que combina seguros, fideicomisos, vehículos de inversión y
                  coberturas internacionales según tu caso. Coordinamos con tu equipo legal
                  y fiscal para que cada pieza funcione con las otras.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Acompañamiento permanente
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Tu situación cambia. Las leyes cambian. Las aseguradoras lanzan nuevos
                  productos. Revisamos al menos anualmente para ajustar estructura.
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
                  ¿Qué seguro de vida conviene para proteger a mi familia?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No hay una respuesta única — el seguro correcto depende de tu patrimonio actual, edad de tus dependientes, gastos fijos del hogar y moneda funcional de tus herederos. Como referencia general, una familia con patrimonio en construcción suele requerir un seguro vitalicio con suma asegurada de 5-10 veces tu ingreso anual + designación irrevocable hacia los beneficiarios. Si hay patrimonio significativo o herederos en distintas jurisdicciones, conviene estructurar designación irrevocable hacia un fideicomiso para evitar juicio sucesorio. Trabajamos con 6 aseguradoras AAA en México y diseñamos la combinación según tu caso particular.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Qué pasa si mis beneficiarios no están actualizados?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  La aseguradora paga al último beneficiario designado en el contrato, aunque ya no refleje tu voluntad real. Divorcios, hijos nuevos, segundas parejas, socios que entran y salen — todos cambian quién debería recibir el capital. Cuando llega el siniestro, el dinero llega a la persona equivocada y no hay vuelta atrás. Por eso revisar designación de beneficiarios cada vez que tu vida cambia no es paranoia — es disciplina patrimonial básica. Recomendamos revisión anual + revisión inmediata tras matrimonio, divorcio, nacimiento, fallecimiento de un beneficiario, o cambio significativo de patrimonio.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cómo se evita el juicio sucesorio con un seguro de vida?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Con la designación de tus beneficiarios. Conforme al Art. 179 LCS vigente, cuando designas a un beneficiario de forma irrevocable, el derecho de ese beneficiario se constituye como derecho propio — el capital asegurado NO forma parte de la masa hereditaria del fallecido y NO requiere juicio sucesorio para llegar al beneficiario. Esto permite que el dinero llegue en máximo 30 días directo a quien designaste, sin esperar protocolización notarial ni resolución judicial. Si además estructuras la designación irrevocable hacia un fideicomiso, ganas control sobre cómo y cuándo recibe el capital tu beneficiario.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Conviene contratar mi seguro de vida en pesos o en dólares?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Depende de la moneda funcional de tus herederos y tu propio patrimonio. Si tus herederos viven o estudiarán en EUA, Europa, o tienen gastos dolarizados, un seguro en USD elimina el riesgo cambiario al momento del pago. Si todo tu patrimonio y los gastos de tus herederos están en pesos, contratar en MXN es más simple. Para patrimonios mixtos, lo común es estructurar parte en cada moneda según el destino esperado del capital. Varias de las 6 aseguradoras AAA con las que trabajo ofrecen productos en ambas monedas — la elección óptima la mapeamos en la sesión inicial.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cómo se compara un fideicomiso testamentario vs un fideicomiso financiado por seguro de vida?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Diferencia clave: liquidez al momento del fallecimiento. El fideicomiso testamentario hereda lo que el caudal hereditario contenga al fallecer — y ese caudal puede tardar meses o años en liberarse mientras se resuelve el juicio sucesorio. El fideicomiso financiado por seguro de vida recibe el capital asegurado en semanas, vía designación irrevocable, sin pasar por sucesión. En la práctica, ambos pueden coexistir: el testamentario administra activos heredados (inmuebles, negocios), y el financiado por seguro genera la liquidez inmediata para impuestos, deudas, sostenimiento de herederos durante el juicio sucesorio, y arranque del fideicomiso patrimonial.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Pueden mis seguros formar parte de mi planeación fiscal patrimonial?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí — los seguros son una herramienta dentro de la planeación fiscal patrimonial. Tres palancas principales: (1) PPR para deducción anual conforme al Art. 151 fracc V LISR vigente; (2) Seguros de vida con designación irrevocable, con tratamiento fiscal del Art. 93 fracc XXI LISR vigente para beneficiarios directos, sujeto al cumplimiento de los requisitos fiscales aplicables; (3) Seguros de Persona Clave en estructura corporativa para socios y dueños, conforme al Art. 27 fracc XII LISR + Art. 51 RLISR vigentes. La estrategia óptima requiere coordinación con tu fiscalista y abogado patrimonial — yo aporto la pieza de seguros y diseño en conjunto con tu equipo legal/fiscal.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿A partir de qué patrimonio aplica?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No hay umbral fijo — depende de la complejidad, no del monto absoluto.
                  Una empresa familiar de mediano tamaño con socios y herederos múltiples
                  puede beneficiarse tanto como un patrimonio complejo tradicional.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Trabajas con bancas privadas?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, coordinamos con tu banca privada actual. Mi rol no compite con la
                  banca — soy capa aseguradora y de planeación patrimonial. Trabajamos juntos
                  para que tu estrategia bancaria y aseguradora estén alineadas.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cobras honorarios o solo comisiones?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Lo platicamos en la primera conversación. Para casos patrimoniales complejos
                  hay opciones de honorarios fijos o comisiones por carrier según el producto.
                  Total transparencia sobre cómo me pagan.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Mi información es confidencial?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Absolutamente. Mi obligación profesional bajo CNSF + ética AMASFAC.
                  Nunca compartas datos sensibles por canales abiertos — usa el email
                  o agenda llamada.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Trabajas con family office?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, coordinamos con tu family office. Mi asesoría no compite con la
                  banca — hago estrategias con seguros. Trabajamos juntos para que tu
                  estrategia patrimonial integral incluya los seguros adecuados para
                  ti y tu familia.
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
              Estas situaciones también requieren planeación patrimonial
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/personas/hijos-neurodivergentes"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Familias con hijos neurodivergentes
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Fideicomiso de soporte vitalicio + pensión vitalicia + tutela documentada. Estructura de por vida, no solo hasta la universidad.
                </p>
              </Link>
              <Link
                href="/personas/mexicanos-en-el-extranjero"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Patrimonio y herederos transfronterizos
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Sucesión sin juicio internacional cuando vives fuera pero tu patrimonio o tus herederos están en México.
                </p>
              </Link>
              <Link
                href="/personas/familias-arcoiris"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Familias LGBT+ con protección patrimonial
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Designación irrevocable de beneficiario para pareja afectiva o cónyuge legal — la estructura funciona igual sin importar el vínculo.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Iniciar conversación
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Por la naturaleza confidencial de los temas, prefiero que el primer contacto
              sea por email o WhatsApp directo. Después coordinamos sesión privada según
              tu agenda.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <a
                href={`mailto:${email}?subject=Consulta%20patrimonios%20complejos`}
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  Recomendado
                </div>
                <div className="text-lg font-medium">Email reflexivo</div>
                <div className="mt-2 text-sm opacity-80 break-all">{email}</div>
              </a>
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Mensaje directo
                </div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">
                  WhatsApp
                </div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">
                  {whatsapp}
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
