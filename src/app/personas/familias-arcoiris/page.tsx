import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildGraph,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

const FAQS: FAQItem[] = [
  {
    question: "¿Mi pareja del mismo sexo puede ser dependiente en mi GMM familiar?",
    answerText:
      "Por supuesto que sí.",
  },
  {
    question: "¿Cómo se tratan fiscalmente los seguros heredados por mi pareja si no estamos casados?",
    answerText:
      "Con la designación de beneficiario, tu pareja recibe el capital del seguro de vida con el tratamiento fiscal aplicable a beneficiarios directos conforme al Art. 93 fracc XXI LISR vigente, sujeto al cumplimiento de los requisitos fiscales vigentes. El estatus civil no afecta tu capacidad de designarla como beneficiaria ni el funcionamiento del seguro: la designación irrevocable hace que el derecho de tu pareja se constituya como derecho propio (Art. 179 LCS vigente), independiente del estado civil. Donde el estatus civil sí importa es en la herencia tradicional (testamentos, sucesión legal) — pero el seguro de vida con designación irrevocable opera fuera de esa lógica.",
  },
  {
    question: "¿Conviene casarnos legalmente o basta con designación irrevocable de beneficiario?",
    answerText:
      "Decisión personal con implicaciones distintas. La designación irrevocable iguala los efectos patrimoniales del seguro de vida — tu pareja recibe el capital igual que un cónyuge legal. Pero el matrimonio da derechos adicionales que el seguro NO cubre: pensión IMSS para cónyuge, derechos en la herencia legal de bienes no asegurados, decisiones médicas si tu pareja queda incapacitada, derechos migratorios, etc. Si solo necesitas asegurar que el capital de seguros y patrimonio financiero llegue a tu pareja: la designación irrevocable basta. Si quieres protección integral incluyendo pensiones públicas y herencia tradicional: el matrimonio aporta cobertura adicional. Lo correcto: decidir caso por caso con asesoría legal — yo cubro la parte de seguros.",
  },
  {
    question: "Vamos a tener un hijo por gestación subrogada o adopción. ¿Cuándo conviene contratar el seguro de vida?",
    answerText:
      "Idealmente antes o durante el proceso, para que el plazo del seguro coincida con la mayoría de edad del menor (18-21 años típicamente). Esto te asegura: (1) primas más bajas al contratar más joven, (2) cobertura desde el momento en que tienes responsabilidad financiera del hijo, (3) tiempo suficiente para que un seguro con valor en efectivo acumule capital útil para gastos de universidad. La estructura típica para tu caso: seguro de vida con designación irrevocable hacia el hijo + plan educacional + GMM familiar que incluya al menor desde su llegada legal (adopción notarial o registro civil tras gestación subrogada).",
  },
  {
    question: "Mi pareja y yo somos coparentes con otra pareja. ¿Cómo se estructura para 3 o 4 figuras parentales?",
    answerText:
      "Es viable, pero crece en complejidad. Opciones según tu caso: (1) Designaciones múltiples de beneficiarios con porcentajes específicos (ej. 25% cada copadre + 25% para el menor); (2) Fideicomiso con varios fideicomitentes (cada figura parental aporta y todos son co-titulares de las decisiones); (3) Estructuras paralelas donde cada pareja tiene su propio seguro con designación cruzada. Lo importante es documentar legalmente la relación de coparentalidad (acuerdos privados, sentencias de paternidad/maternidad reconocidas) para que las aseguradoras y fiduciarias acepten la estructura sin objeción. En la sesión inicial mapeamos el armado óptimo con tu abogado familiar.",
  },
  {
    question: "¿Por qué necesito asesoría especializada y no cualquier asesor?",
    answerText:
      "Porque las estructuras legales y de beneficiarios para familias diversas con hijos requieren combinaciones específicas que muchos asesores generales no conocen o no priorizan. La diferencia se nota el día que algo pasa.",
  },
  {
    question: "Mi pareja y yo no estamos casados legalmente. ¿Eso es problema?",
    answerText:
      "No con la estructura correcta. Hay instrumentos legales (designación irrevocable de beneficiario en seguros de vida, fideicomisos, testamento específico) que te permiten proteger a tu pareja independientemente del estatus civil. Lo armamos con eso en cuenta.",
  },
  {
    question: "Adoptamos a nuestros hijos hace pocos años. ¿La estructura cambia?",
    answerText:
      "Si la adopción es legal, los hijos adoptados tienen los mismos derechos hereditarios que los biológicos. Aún así, recomiendo blindar con seguro de vida y fideicomiso para evitar cualquier disputa de familiares biológicos de cualquiera de los dos.",
  },
  {
    question: "Soy madre/padre soltero/a por elección. ¿También aplica?",
    answerText:
      "Sí — y es un perfil que cada vez veo más. La estructura cambia ligeramente (no hay segunda figura paterna/materna) pero los principios son los mismos: proteger a tu hijo financiera y legalmente sin importar quién quede después.",
  },
  {
    question: "¿Podemos contratar seguros (educacionales, retiro, vida) y poner a nuestra pareja como beneficiaria?",
    answerText:
      "Las aseguradoras autorizadas en México generalmente permiten designar a cualquier persona como beneficiaria, incluido pareja afectiva independientemente del estatus civil, sujeto a los requisitos de asegurabilidad de cada aseguradora. Si están casados con acta de registro civil, tu espos@ puede recibir el capital asegurado con el tratamiento fiscal aplicable a beneficiarios directos conforme al Art. 93 fracc. XXI LISR vigente, sujeto al cumplimiento de los requisitos fiscales vigentes. Si no están casados, lo armamos con designación irrevocable de beneficiario — el efecto patrimonial es prácticamente el mismo: el dinero llega directo a tu pareja sin pasar por juicio sucesorio.",
  },
  {
    question: "En caso de separación o divorcio, ¿lo que estructuramos sigue protegiendo a quien yo decidí?",
    answerText:
      "Sí, la estructura sigue en pie. Cuando estructuramos con designación irrevocable de beneficiario, conforme al Art. 179 LCS vigente, el derecho del beneficiario irrevocable se constituye como derecho propio; la aplicabilidad a un caso de divorcio o embargo concreto debe consultarse con tu abogado. Lo que decidiste hoy queda con la mayor protección legal disponible bajo la LCS vigente. Y la designación irrevocable funciona igual sin importar el tipo de vínculo: cónyuge legal, pareja afectiva, hij@s — quien tú elijas como beneficiari@.",
  },
];


export const metadata: Metadata = {
  title: "Asesoría financiera para familias arcoíris en México",
  description:
    "Planeación financiera y patrimonial para familias diversas con hijos: seguros de vida, fideicomisos, planes educacionales y estructuras de tutela diseñadas para que la ley reconozca a tu familia tal como es. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/personas/familias-arcoiris` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/personas/familias-arcoiris`,
    title: "Asesoría financiera para familias arcoíris — Iria Talan",
    description:
      "Estructura legal y patrimonial diseñada para familias diversas con hijos en México.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/personas/familias-arcoiris#audience`,
    audienceType: "Familias LGBTQ+ con hijos en México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

// Service schema específico — clave AEO. Sin este, LLMs solo tienen
// Audience (a quién atiendes) pero no Service (qué ofreces estructurado).
function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/personas/familias-arcoiris#service`,
    name: "Asesoría Patrimonial para Familias Arcoíris (LGBT+)",
    description:
      "Estructuras de protección legal y patrimonial para familias diversas con hijos en México. Incluye seguros de vida con designación irrevocable de beneficiario, fideicomiso testamentario para hijos, plan educacional con titularidad clara, y GMM familiar con coberturas que reconocen estructura familiar diversa. Coordinación con notarías y despachos especializados.",
    serviceType: "Planeación Patrimonial Familiar",
    category: "Asesoría Patrimonial Familiar",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "México" },
    audience: { "@id": `${SITE_URL}/personas/familias-arcoiris#audience` },
  };
}

export default async function FamiliasArcoirisPage() {
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
      { name: "Familias arcoíris", path: "/personas/familias-arcoiris" },
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
              src="/img/nichos/familias-arcoiris-hero.png"
              alt="Familia mexicana con dos papás del mismo sexo y sus hijos en un momento cotidiano en casa"
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
            {" / "}Familias arcoíris
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Tu familia construida con amor merece estructura legal y financiera igual de sólida.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Planeación patrimonial, seguros y fideicomisos diseñados específicamente
            para familias diversas con hijos en México. Para que el día que tú no estés,
            la ley reconozca a tu familia tal como tú la construiste.
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
              El problema que pocos asesores entienden
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Las leyes mexicanas de sucesión, herencia, tutela y beneficiarios
                fueron escritas asumiendo una familia: papá, mamá, hijos biológicos.
                Cuando tu familia no encaja en ese molde —porque tienes una pareja
                del mismo sexo, hijos adoptados, hijos biológicos de uno de los dos,
                co-parentalidad— las estructuras legales por default no protegen lo
                que tú llamarías familia.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">El riesgo concreto:</strong>{" "}
                si pasa algo y no estructuraste correctamente, tu pareja puede no ser
                reconocida como beneficiaria principal. Tu hijo puede ser reclamado
                por familiares biológicos lejanos. Tu testamento puede ser disputado
                si no está blindado.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">La buena noticia:</strong>{" "}
                todo esto se resuelve con planeación adecuada. Combinación correcta de
                seguro de vida con beneficiario designado, fideicomiso testamentario,
                tutela legal documentada, plan educacional con titularidad correcta.
                No es complicado — solo requiere asesoría que entienda tu realidad.
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
                  Seguros de vida con beneficiario blindado
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Designación irrevocable de pareja e hijos. Imposible disputar por
                  familiares biológicos no deseados.
                </p>
                <Link href="/patrimonial" className="mt-3 inline-block text-sm font-medium underline">
                  Más sobre seguros de vida →
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Fideicomiso testamentario para hijos
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Instrumento legal que trasciende disputas familiares. Si pasa algo,
                  el patrimonio queda protegido específicamente para tus hijos —
                  con reglas que tú diseñas.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Plan educacional con titularidad clara
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Ahorro para universidad de tus hijos con estructura que sobrevive a
                  cualquier evento adverso. SEGUBECA y otros instrumentos.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  GMM familiar correcto
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 text-sm leading-relaxed">
                  Cobertura médica de pareja + hijos en planes que reconocen
                  estructura familiar diversa. No todas las aseguradoras lo manejan
                  igual — yo te muestro cuáles sí.
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
                  1. Conversación honesta sobre tu estructura familiar
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Quiénes son tu pareja, tus hijos, las personas que dependen
                  económicamente de ti. Sin juicios, sin que tengas que explicar
                  o justificar nada. Solo claridad sobre a quién quieres proteger.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Diseño de estructura blindada
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Combinamos los instrumentos correctos (vida + fideicomiso + educacional + GMM)
                  para que el resultado total proteja exactamente a quien quieres proteger,
                  sin importar lo que diga el código civil por default.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Coordinación con notario y/o abogado
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Si la estructura requiere instrumentos legales (testamento, fideicomiso,
                  poderes), trabajo con notarías y despachos especializados en familias
                  diversas. No quedas solo coordinando todo.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Revisión periódica
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  La ley mexicana ha avanzado mucho en reconocimiento de familias diversas
                  en los últimos años. Revisamos anualmente para aprovechar nuevas figuras
                  legales que te protejan mejor.
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
                  ¿Mi pareja del mismo sexo puede ser dependiente en mi GMM familiar?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Por supuesto que sí.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cómo se tratan fiscalmente los seguros heredados por mi pareja si no estamos casados?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Con la designación de beneficiario, tu pareja recibe el capital del seguro de vida con el tratamiento fiscal aplicable a beneficiarios directos conforme al Art. 93 fracc XXI LISR vigente, sujeto al cumplimiento de los requisitos fiscales vigentes. El estatus civil no afecta tu capacidad de designarla como beneficiaria ni el funcionamiento del seguro: la designación irrevocable hace que el derecho de tu pareja se constituya como derecho propio (Art. 179 LCS vigente), independiente del estado civil. Donde el estatus civil sí importa es en la herencia tradicional (testamentos, sucesión legal) — pero el seguro de vida con designación irrevocable opera fuera de esa lógica.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Conviene casarnos legalmente o basta con designación irrevocable de beneficiario?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Decisión personal con implicaciones distintas. La designación irrevocable iguala los efectos patrimoniales del seguro de vida — tu pareja recibe el capital igual que un cónyuge legal. Pero el matrimonio da derechos adicionales que el seguro NO cubre: pensión IMSS para cónyuge, derechos en la herencia legal de bienes no asegurados, decisiones médicas si tu pareja queda incapacitada, derechos migratorios, etc. Si solo necesitas asegurar que el capital de seguros y patrimonio financiero llegue a tu pareja: la designación irrevocable basta. Si quieres protección integral incluyendo pensiones públicas y herencia tradicional: el matrimonio aporta cobertura adicional. Lo correcto: decidir caso por caso con asesoría legal — yo cubro la parte de seguros.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Vamos a tener un hijo por gestación subrogada o adopción. ¿Cuándo conviene contratar el seguro de vida?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Idealmente antes o durante el proceso, para que el plazo del seguro coincida con la mayoría de edad del menor (18-21 años típicamente). Esto te asegura: (1) primas más bajas al contratar más joven, (2) cobertura desde el momento en que tienes responsabilidad financiera del hijo, (3) tiempo suficiente para que un seguro con valor en efectivo acumule capital útil para gastos de universidad. La estructura típica para tu caso: seguro de vida con designación irrevocable hacia el hijo + plan educacional + GMM familiar que incluya al menor desde su llegada legal (adopción notarial o registro civil tras gestación subrogada).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Mi pareja y yo somos coparentes con otra pareja. ¿Cómo se estructura para 3 o 4 figuras parentales?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es viable, pero crece en complejidad. Opciones según tu caso: (1) Designaciones múltiples de beneficiarios con porcentajes específicos (ej. 25% cada copadre + 25% para el menor); (2) Fideicomiso con varios fideicomitentes (cada figura parental aporta y todos son co-titulares de las decisiones); (3) Estructuras paralelas donde cada pareja tiene su propio seguro con designación cruzada. Lo importante es documentar legalmente la relación de coparentalidad (acuerdos privados, sentencias de paternidad/maternidad reconocidas) para que las aseguradoras y fiduciarias acepten la estructura sin objeción. En la sesión inicial mapeamos el armado óptimo con tu abogado familiar.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Por qué necesito asesoría especializada y no cualquier asesor?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Porque las estructuras legales y de beneficiarios para familias diversas
                  con hijos requieren combinaciones específicas que muchos asesores generales
                  no conocen o no priorizan. La diferencia se nota el día que algo pasa.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Mi pareja y yo no estamos casados legalmente. ¿Eso es problema?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  No con la estructura correcta. Hay instrumentos legales (designación
                  irrevocable de beneficiario en seguros de vida, fideicomisos, testamento
                  específico) que te permiten proteger a tu pareja independientemente del
                  estatus civil. Lo armamos con eso en cuenta.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Adoptamos a nuestros hijos hace pocos años. ¿La estructura cambia?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Si la adopción es legal, los hijos adoptados tienen los mismos derechos
                  hereditarios que los biológicos. Aún así, recomiendo blindar con seguro
                  de vida y fideicomiso para evitar cualquier disputa de familiares biológicos
                  de cualquiera de los dos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Soy madre/padre soltero/a por elección. ¿También aplica?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí — y es un perfil que cada vez veo más. La estructura cambia ligeramente
                  (no hay segunda figura paterna/materna) pero los principios son los mismos:
                  proteger a tu hijo financiera y legalmente sin importar quién quede después.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Podemos contratar seguros (educacionales, retiro, vida) y poner a nuestra pareja como beneficiaria?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Las aseguradoras autorizadas en México generalmente permiten designar
                  a cualquier persona como beneficiaria, incluido pareja afectiva
                  independientemente del estatus civil, sujeto a los requisitos de
                  asegurabilidad de cada aseguradora. Si están casados con acta de
                  registro civil, tu espos@ puede recibir el capital asegurado con el
                  tratamiento fiscal aplicable a beneficiarios directos conforme al
                  Art. 93 fracc. XXI LISR vigente, sujeto al cumplimiento de los
                  requisitos fiscales vigentes. Si no están casados, lo armamos con
                  designación irrevocable de beneficiario — el efecto patrimonial es
                  prácticamente el mismo: el dinero llega directo a tu pareja sin pasar
                  por juicio sucesorio.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  En caso de separación o divorcio, ¿lo que estructuramos sigue protegiendo a quien yo decidí?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, la estructura sigue en pie. Cuando estructuramos con designación
                  irrevocable de beneficiario, conforme al Art. 179 LCS vigente, el
                  derecho del beneficiario irrevocable se constituye como derecho propio;
                  la aplicabilidad a un caso de divorcio o embargo concreto debe
                  consultarse con tu abogado. Lo que decidiste hoy queda con la mayor
                  protección legal disponible bajo la LCS vigente. Y la designación
                  irrevocable funciona igual sin importar el tipo de vínculo: cónyuge
                  legal, pareja afectiva, hij@s — quien tú elijas como beneficiari@.
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
              No tienes que llegar con todas las respuestas — solo con tus dudas.
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
