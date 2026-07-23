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
import { WA_MESSAGES, waHref } from "@/lib/whatsapp";

const FAQS: FAQItem[] = [
  {
    question: "¿Cuánto necesito ahorrar para la universidad de mi hijo?",
    answerText:
      "Depende de la universidad, la carrera y si tu hijo estudiará en México o en el extranjero. Como referencia 2026: una licenciatura privada en México puede costar entre $400,000 y $2,500,000 MXN (4 años, sin incluir maestría). Una universidad en EUA o Canadá puede costar fácilmente $250,000 – $400,000 USD (incluyendo costo de vida). El punto de partida es calcular cuánto necesitas al inicio del primer semestre y descontar ese número a hoy con una tasa de rendimiento realista. Lo calculamos con los datos de tu hijo y el nivel universitario que tienes en mente.",
  },
  {
    question: "¿Es mejor un Plan Educacional o una cuenta de inversión tradicional?",
    answerText:
      "Las cuentas de inversión tradicionales (CETES, fondos de renta variable) ofrecen flexibilidad total pero cero protección si falleces antes de que tu hijo llegue a la universidad. Un Seguro Educacional garantiza que el monto objetivo llegará aunque tú faltes — la aseguradora completa el fondo. También incluye estructura fiscal y un horizonte forzoso que evita retirar el dinero para otra cosa.",
  },
  {
    question: "¿Qué pasa si mi hijo o hija decide no estudiar o cambia de carrera?",
    answerText:
      "Tu cobras el dinero y lo destinas a lo que quieras, no tienes que demostrar que tu hijo o hija estudie.",
  },
  {
    question: "¿A qué edad conviene contratar un Seguro Educacional?",
    answerText:
      "Cuanto antes, mejor — el interés compuesto premia exponencialmente a quien empieza temprano. Si tu hijo tiene 2 años, tienes 16 años para acumular: el esfuerzo mensual es pequeño. Si tiene 12 años, tienes 6 años: el esfuerzo mensual se multiplica para llegar al mismo monto. La regla práctica: el mejor momento para contratar fue el día que nació; el segundo mejor momento es hoy.",
  },
  {
    question: "¿El Plan Educacional protege si yo fallezco antes de que mi hijo estudie?",
    answerText:
      "Sí — esa es la diferencia fundamental frente a una cuenta de inversión ordinaria. Si falleces mientras el plan está activo, la aseguradora continúa aportando las primas y entrega el monto completo cuando tu hijo llegue a la universidad. Algunos planes también incluyen una suma asegurada adicional al fallecimiento para cubrir gastos inmediatos de la familia. Es la garantía de que tu hijo o hija estudien sí o sí.",
  },
  {
    question: "¿El plan genera rendimientos o solo acumula lo que aporto?",
    answerText:
      "Genera rendimientos, pero el nivel depende del tipo de plan. Hay tres modalidades principales: (1) Plan con tasa garantizada — sabes exactamente cuánto tendrás, sin sorpresas, pero el rendimiento es más conservador; (2) Plan ligado a fondos de inversión — potencial de mayor rendimiento pero son planes NO GARANTIZADOS; (3) Plan mixto — parte garantizada + parte variable. El mejor plan para ti depende de tu aversión al riesgo.",
  },
  {
    question: "¿Puedo deducir el Plan Educacional de impuestos?",
    answerText:
      "En México no existe deducción fiscal específica para Planes Educacionales como sí existe para los planes de retiro PPR.",
  },
  {
    question: "¿Puedo hacer aportaciones adicionales además de la aportación mensual / anual?",
    answerText:
      "La mayoría de los Planes Educacionales modernos permiten aportaciones extraordinarias. Son útiles cuando recibes un bono, una herencia o simplemente quieres adelantar el ahorro. Cada aportación adicional acorta el plazo y aumenta el monto final disponible. Algunas aseguradoras también ofrecen la opción de pagar el plan completo en un solo pago inicial (prima única) si cuentas con el capital desde el inicio — estos planes tienen un mayor rendimiento.",
  },
];

export const metadata: Metadata = {
  title: "Planes Educacionales — Ahorro para la Universidad de tus Hijos",
  description:
    "Plan de ahorro para la universidad de tus hijos, en México o el extranjero, con garantía de continuidad si tú faltas. Calcula cuánto necesitas.",
  alternates: { canonical: `${SITE_URL}/planes-educacionales` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/planes-educacionales`,
    title: "Planes educacionales · Ahorro garantizado para la universidad — Iria Talan",
    description:
      "Ahorro estructurado para la universidad con protección de vida incluida. Si algo te pasa, la aseguradora completa el fondo. Tu hijo estudia sin importar lo que pase.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/planes-educacionales#service`,
    name: "Planes Educacionales",
    description:
      "Planes de ahorro para la universidad de tus hijos, en México o el extranjero, con garantía de continuidad: si el padre o madre fallece, la aseguradora completa el fondo.",
    serviceType: "Plan Educacional",
    category: "Ahorro e Inversión",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "México" },
  };
}

export default async function PlanesEducacionalesPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";

  const faqSchema = buildFAQPageSchema(FAQS);
  const pageSchema = buildGraph(
    buildServiceSchema(),
    faqSchema,
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Planes educacionales", path: "/planes-educacionales" },
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
              src="/img/servicios/planes-educacionales-hero.jpg"
              alt="Padre e hija revisando papeles de ahorro para la universidad — plan educacional"
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
            {" / "}Planes educacionales
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            La universidad de tus hijos, garantizada.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            No es una cuenta de ahorro. Es un plan que llega aunque tú no llegues.
            Si algo te pasa antes de que tu hijo entre a la universidad, la aseguradora
            completa el fondo y tu hijo estudia exactamente como planeaste.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/contacto#agendar"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Calcular cuánto necesito
            </Link>
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
              La diferencia que importa
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-3">Cuenta de inversión</div>
                <ul className="space-y-2 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  <li>· Acumulas solo lo que aportas + rendimientos</li>
                  <li>· En caso de fallecimiento, solo heredas el fondo</li>
                  <li>· Es fácil disponer el dinero para otra cosa</li>
                  <li>· Sin protección por fallecimiento</li>
                  <li>· Sin garantía de llegar al monto objetivo</li>
                </ul>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/20 dark:border-warm-brown/40 bg-cream/30 dark:bg-coffee/20">
                <div className="text-xs uppercase tracking-wider text-burgundy mb-3">Plan Educacional</div>
                <ul className="space-y-2 text-sm text-ink dark:text-cream-light/85">
                  <li>· Si falleces, la aseguradora completa el fondo</li>
                  <li>· Tu hijo recibe el monto completo al entrar a la universidad</li>
                  <li>· Protección de vida incluida en la prima</li>
                  <li>· Estructura que evita retirar el fondo para otra cosa</li>
                  <li>· Puede ligarse a fondos para mayor rendimiento</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Referencia 2026
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿Cuánto cuesta la universidad?
            </h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-warm-brown/20">
                    <th className="text-left py-3 pr-4 font-medium text-ink dark:text-cream-light">Destino</th>
                    <th className="text-left py-3 pr-4 font-medium text-ink dark:text-cream-light">Costo estimado</th>
                    <th className="text-left py-3 font-medium text-ink dark:text-cream-light">Incluye</th>
                  </tr>
                </thead>
                <tbody className="text-warm-brown dark:text-cream-light/75">
                  <tr className="border-b border-warm-brown/10">
                    <td className="py-3 pr-4">Universidad privada nivel intermedio México</td>
                    <td className="py-3 pr-4">$400,000 – $1,000,000 MXN</td>
                    <td className="py-3">Colegiaturas 4 años</td>
                  </tr>
                  <tr className="border-b border-warm-brown/10 font-medium">
                    <td className="py-3 pr-4 text-ink dark:text-cream-light">Universidad elite México (Tec, Ibero, Anáhuac, UDEM)</td>
                    <td className="py-3 pr-4 text-ink dark:text-cream-light">$1,500,000 – $2,500,000 MXN</td>
                    <td className="py-3 text-ink dark:text-cream-light">Colegiaturas 4 años</td>
                  </tr>
                  <tr className="border-b border-warm-brown/10">
                    <td className="py-3 pr-4">EUA o Canadá</td>
                    <td className="py-3 pr-4">$250,000 – $400,000 USD</td>
                    <td className="py-3">Colegiatura + vida</td>
                  </tr>
                  <tr className="border-b border-warm-brown/10">
                    <td className="py-3 pr-4">Europa (España, Alemania)</td>
                    <td className="py-3 pr-4">€50,000 – €400,000 EUR</td>
                    <td className="py-3">Colegiatura + vida</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Maestría en el extranjero</td>
                    <td className="py-3 pr-4">$80,000 – $300,000 USD</td>
                    <td className="py-3">2 años + vida</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-5 rounded-2xl border border-warm-brown/20 dark:border-warm-brown/35 bg-cream/20 dark:bg-coffee/10">
              <p className="text-sm font-medium text-ink dark:text-cream-light mb-2">
                El caso de las universidades elite en México
              </p>
              <p className="text-sm text-warm-brown dark:text-cream-light/75 leading-relaxed">
                Una licenciatura en el Tec de Monterrey Campus Santa Fe, la Iberoamericana
                o la Anáhuac puede superar $600,000 – $700,000 MXN solo en colegiaturas
                anuales — sin contar materiales, intercambios, certificaciones adicionales
                ni costo de vida si tu hijo estudia fuera de su ciudad. Con inflación
                educativa histórica del 8–10% anual, lo que hoy cuesta $2M MXN puede
                costar más de $3.5M para quien hoy tiene 5 años. Dimensionar el plan con
                ese número, no con el costo actual, es la diferencia entre llegar o quedarse corto.
              </p>
            </div>
            <p className="mt-4 text-xs text-warm-brown/60 dark:text-cream-light/40">
              Cifras orientativas 2026. Los costos reales dependen de la universidad específica,
              la carrera y el costo de vida en el destino. La inflación educativa histórica
              supera la inflación general — proyectar a valor futuro es clave para dimensionar correctamente el plan.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Cómo calculamos tu plan
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Definir el monto objetivo
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  ¿Cuánto necesitas al inicio del primer semestre? Partimos del costo actual
                  de la universidad de destino y lo proyectamos con inflación educativa
                  al año en que tu hijo entra.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Calcular la aportación mensual
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Con el monto objetivo, la edad actual de tu hijo y la tasa de rendimiento
                  esperada, calculamos la prima mensual exacta que necesitas para llegar.
                  También modelamos el impacto de aportaciones adicionales.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Elegir el plan correcto
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Comparamos entre las 6 aseguradoras con las que trabajo: tasa garantizada
                  vs ligado a fondos, coberturas adicionales (vida, invalidez), flexibilidad de
                  rescate, y condiciones de continuidad en caso de fallecimiento.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Revisión anual
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Las universidades cambian de costo, el tipo de cambio fluctúa, los planes
                  de tu hijo pueden cambiar. Revisamos cada año para ajustar el plan si
                  el destino o las circunstancias cambian.
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
              {FAQS.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                    {faq.answerText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Calcular el plan de tu hijo
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              En 30 minutos tienes la proyección con el monto objetivo, la aportación mensual
              y la comparativa de planes. Sin costo, sin compromiso.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                href="/contacto#agendar"
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">
                  30 min · sin costo
                </div>
                <div className="text-lg font-medium">Agenda consulta</div>
                <div className="mt-2 text-sm opacity-80">
                  Cuéntame tu caso y te contacto
                </div>
              </Link>
              <a
                href={waHref(whatsapp, WA_MESSAGES.planesEducacionales)}
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
