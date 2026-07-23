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
    question: "¿Qué seguros necesita una empresa para proteger a sus socios?",
    answerText:
      "Tres estructuras clave: (1) Seguro de Persona Clave sobre cada socio o dueño, con la empresa como contratante y beneficiaria irrevocable — generalmente deducible conforme al Art. 27 fracc XII LISR + Art. 51 RLISR vigentes, sujeto al cumplimiento de los requisitos del SAT; (2) Acuerdo de compraventa (buy-sell) financiado con vida cruzada entre socios — al fallecer uno, la indemnización compra sus acciones a los herederos, evitando que entre familia política a la operación; (3) Vida grupo + GMM colectivo para empleados clave. La combinación específica depende del tamaño, estructura accionaria y giro de la empresa.",
  },
  {
    question: "¿Conviene Vida Grupo o seguro individual para mis empleados clave?",
    answerText:
      "Depende del rol. Para la base general de empleados, Vida Grupo es la herramienta correcta: prestación masiva, prima per cápita baja, cubre a todos con un solo contrato. Para empleados clave (CFO, líderes técnicos, comerciales top), conviene complementar con seguro individual a su nombre, deducible para el empleado si es PPR o vida con valor en efectivo, y portátil si se va de la empresa. Estrategia común para retener talento: Vida Grupo como piso + seguro individual + Persona Clave (esta última pagada por la empresa, con la empresa como beneficiaria, cubriendo el riesgo operativo). Las tres se complementan, no compiten.",
  },
  {
    question: "¿Cómo se contabiliza la prima de Persona Clave en mi estado de resultados?",
    answerText:
      "Como gasto deducible en el período en que se paga la prima, generalmente clasificado en cuenta de gastos operativos o prestaciones, conforme al Art. 27 fracc XII LISR + Art. 51 RLISR vigentes. Es importante coordinar con tu contador para que: (a) la prima se contabilice correctamente y soporte ante una eventual revisión del SAT, (b) la empresa figure como contratante Y beneficiaria irrevocable (requisito esencial), (c) la persona clave sea verificable como técnico o dirigente cuya pérdida afecte la productividad. Si la estructura no cumple los requisitos del SAT, se pierde la deducción — por eso recomendamos diseñar la póliza coordinados con tu contador desde el inicio.",
  },
  {
    question: "¿Qué pasa si una persona clave se va de la empresa, puedo cancelar la póliza?",
    answerText:
      "Sí — la empresa es contratante y puede cancelar la póliza si lo decide. Algunas pólizas con valor en efectivo (típicas en planes de ahorro a 10-15-20 años) permiten rescatar el valor acumulado al cancelar, sujeto a los términos específicos de la póliza. También es común negociar que el exempleado pueda quedarse con la póliza individual transferida a su nombre (pagando él la prima desde entonces) — esto puede ser parte del paquete de salida o de retención previo. La estructura óptima depende del plan, antigüedad de la póliza y relación con el ex-empleado.",
  },
  {
    question: "¿La prima de Persona Clave es deducible para la empresa?",
    answerText:
      "Sí, generalmente, si la estructura cumple los requisitos del SAT (la empresa es beneficiaria, el asegurado es persona clave verificable, etc.). Lo coordinamos con tu contador para asegurar la deducibilidad. Marco legal: Art. 27 fracc XII LISR + Art. 51 RLISR vigentes.",
  },
  {
    question: "¿Cuánto debe ser la suma asegurada por persona clave?",
    answerText:
      "Depende de su rol. Como referencia: 5-10x la utilidad anual atribuible a esa persona, o el costo total de reemplazo (búsqueda + entrenamiento + bache operativo) multiplicado por 2-3. Lo cuantificamos juntos.",
  },
  {
    question: "¿Mi socio se entera si lo aseguro?",
    answerText:
      "Sí — la persona asegurada debe firmar consentimiento y pasar exámenes médicos. No se puede asegurar a alguien sin que sepa. La buena noticia: a la mayoría de socios les parece bien (es señal de que la empresa los valora).",
  },
  {
    question: "¿Sirve para empresas pequeñas (menos de 10 empleados)?",
    answerText:
      "Sí — y es donde más se necesita. En empresas chicas, una sola persona faltante puede colapsar la operación. En corporativos grandes hay redundancia natural; en empresas pequeñas, no.",
  },
  {
    question: "Ya tengo Vida grupo y GMM colectivo. ¿Necesito Persona Clave también?",
    answerText:
      "Son productos distintos con beneficiarios distintos. Vida grupo paga a la familia del empleado. Persona Clave paga a la empresa. Ambos son necesarios — protegen cosas distintas. Hablamos de la diferencia con detalle en consulta.",
  },
];


export const metadata: Metadata = {
  title: "Seguros para Empresas · Persona Clave / Hombre Clave",
  description:
    "Seguros para empresas: Persona Clave, Vida grupo y GMM colectivo. Protege tu negocio cuando depende de personas insustituibles. Agenda una consulta.",
  alternates: { canonical: `${SITE_URL}/empresas` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/empresas`,
    title: "Seguros para Empresas · Persona Clave — Iria Talan",
    description:
      "Si tu negocio depende de personas insustituibles, necesitas Persona Clave estructurado.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "FinancialProduct" as const,
    "@id": `${SITE_URL}/empresas#service`,
    name: "Seguros para Empresas · Persona Clave",
    description:
      "Soluciones aseguradoras para empresas: Persona Clave (Hombre Clave), seguro de vida grupal, GMM colectivo y beneficios para empleados.",
    url: `${SITE_URL}/empresas`,
    provider: { "@id": `${SITE_URL}#financialservice` },
    category: "Seguros empresariales B2B",
    areaServed: { "@type": "Country", name: "México" },
    audience: { "@type": "BusinessAudience", audienceType: "Empresarios y dueños de negocio" },
  };
}

export default async function EmpresasPage() {
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
      { name: "Seguros para empresas", path: "/empresas" },
    ]),
    buildFAQPageSchema(FAQS),
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
              src="/img/servicios/empresas-hero.jpg"
              alt="Director ejecutivo mexicano de 52 años en su oficina firmando documentos con su equipo trabajando al fondo"
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
            {" / "}Seguros para empresas
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Tu negocio depende de personas insustituibles. Asegurarlas es asegurar la empresa.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Persona Clave (también conocida como <em>Hombre Clave</em>), Vida grupo, GMM colectivo
            y beneficios para empleados. Soluciones aseguradoras pensadas para empresarios y
            dueños de negocio que entienden el doble dolor: protegerte tú + proteger lo que construiste.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda diagnóstico empresarial
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
              El doble dolor del empresario
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Cuando construyes una empresa, asumes <strong className="text-ink dark:text-cream-light">dos
                riesgos en paralelo</strong>: lo que pasa contigo (tu familia depende de tu ingreso) y
                lo que pasa con tu negocio (tu empresa depende de personas específicas — tú, tu socio,
                un director técnico, un comercial estrella).
              </p>
              <p>
                Si pasa algo con cualquiera de esas personas, los efectos en cascada son brutales:
                pérdida de clientes clave, quiebre de la cadena de mando, fuga de talento secundario,
                y a veces — el cierre del negocio en menos de 12 meses.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">La planeación financiera personal y
                empresarial no pueden ir por separado.</strong> Quien te diga que sí, no entiende cómo
                funciona realmente un patrimonio empresarial.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Producto pillar B2B
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Persona Clave (Hombre Clave) — qué es, por qué importa
            </h2>
            <div className="mt-8 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                <strong className="text-ink dark:text-cream-light">Persona Clave</strong> es un seguro
                de vida (y opcionalmente de invalidez) cuya prima paga la empresa, donde la
                empresa misma es la beneficiaria. Si la persona asegurada falta — fallecimiento o
                invalidez total y permanente — la empresa recibe una suma que le permite:
              </p>
              <ul className="space-y-3 ml-6 list-disc">
                <li>Cubrir el bache operativo mientras se busca y entrena un reemplazo</li>
                <li>Pagar deudas o líneas de crédito que dependían de esa persona</li>
                <li>Compensar la pérdida de utilidades por contratos perdidos o pausados</li>
                <li>Comprar la participación accionaria de la persona faltante (buy-sell agreement)</li>
                <li>Evitar fugas de talento secundario al estabilizar el barco</li>
              </ul>
              <p>
                <strong className="text-ink dark:text-cream-light">¿Por qué se llama también Hombre Clave?</strong>{" "}
                Es el nombre coloquial histórico del producto en México. Yo uso ambos términos
                porque ambos se buscan — y porque muchos empresarios encuentran el producto buscando
                &ldquo;seguro hombre clave&rdquo; sin saber el nombre técnico.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿Quién en tu empresa es Persona Clave?
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              No es solo el dueño. Estos son los perfiles más comunes que asegurar:
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">Tú, fundador/a o socio/a</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Si tu nombre está en los contratos, en las relaciones bancarias, en las decisiones
                  estratégicas — eres persona clave por definición.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">Director técnico u operativo</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Quien sostiene la operación día a día. Sin esa persona, el cliente no recibe el
                  servicio. Reemplazarla toma 6-12 meses mínimo.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">Comercial estrella</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Quien trae las cuentas grandes. Su salida arrastra clientes — y a veces a otros
                  comerciales. Asegurarla protege tu pipeline.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">Especialista único</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Ingeniero senior, científica de datos, médico/a especialista, abogada experta —
                  cualquier perfil cuya rotación genera riesgo operativo serio.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Cobertura empresarial completa — no solo Persona Clave
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Persona Clave es el corazón. Pero un programa empresarial completo suele incluir
              estos componentes complementarios.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">B2B core</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">Vida grupo / colectivo</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Seguro de vida para todos tus empleados con suma asegurada en múltiplos de salario
                  (12, 24, 36 meses). Beneficio laboral generalmente deducible para la empresa,
                  sujeto al cumplimiento de requisitos fiscales vigentes.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Salud B2B</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">GMM colectivo</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Cobertura médica privada para empleados con red hospitalaria y deducibles
                  estructurados al perfil de tu nómina. Atrae y retiene talento.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Sucesión</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">Buy-sell agreement asegurado</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Si tienes socios y uno falta, la empresa recibe la suma para comprar su participación
                  accionaria. Evita conflictos con herederos y mantiene control empresarial.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Beneficios extra</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">Plan de retiro empresarial</h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  PPR colectivo o vehículos de ahorro para retiro como prestación. Combinable con
                  Modalidad 40 IMSS individual. Ver{" "}
                  <Link href="/retiro" className="underline">/retiro</Link>.
                </p>
              </div>
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
                  1. Diagnóstico de riesgos críticos del negocio
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Identificamos juntos: ¿quién es persona clave en tu empresa? ¿Qué pasaría operativa
                  y financieramente si esa persona falta? Es una conversación honesta, sin formularios.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Cuantificación de la suma asegurada
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Para cada persona clave: cuánto necesita la empresa para absorber su ausencia.
                  Cálculo basado en utilidades, deudas, costos de reemplazo y participación accionaria.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Recomendación de aseguradora(s) para tu caso
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Trabajo con BUPA, MetLife, Allianz, Seguros Monterrey New York Life, AXA y
                  GNP — todas autorizadas CNSF para pólizas empresariales. Según la situación
                  específica de tu empresa, te recomiendo la(s) más adecuada(s) para ti.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Estructura legal y fiscal correcta
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Coordinación con tu contador y abogado para que la prima sea deducible para la
                  empresa, los beneficiarios estén bien designados, y la suma sea recibida sin
                  complicaciones fiscales el día que se requiera.
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
                  ¿Qué seguros necesita una empresa para proteger a sus socios?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Tres estructuras clave: (1) Seguro de Persona Clave sobre cada socio o dueño, con la empresa como contratante y beneficiaria irrevocable — generalmente deducible conforme al Art. 27 fracc XII LISR + Art. 51 RLISR vigentes, sujeto al cumplimiento de los requisitos del SAT; (2) Acuerdo de compraventa (buy-sell) financiado con vida cruzada entre socios — al fallecer uno, la indemnización compra sus acciones a los herederos, evitando que entre familia política a la operación; (3) Vida grupo + GMM colectivo para empleados clave. La combinación específica depende del tamaño, estructura accionaria y giro de la empresa.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Conviene Vida Grupo o seguro individual para mis empleados clave?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Depende del rol. Para la base general de empleados, Vida Grupo es la herramienta correcta: prestación masiva, prima per cápita baja, cubre a todos con un solo contrato. Para empleados clave (CFO, líderes técnicos, comerciales top), conviene complementar con seguro individual a su nombre, deducible para el empleado si es PPR o vida con valor en efectivo, y portátil si se va de la empresa. Estrategia común para retener talento: Vida Grupo como piso + seguro individual + Persona Clave (esta última pagada por la empresa, con la empresa como beneficiaria, cubriendo el riesgo operativo). Las tres se complementan, no compiten.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cómo se contabiliza la prima de Persona Clave en mi estado de resultados?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Como gasto deducible en el período en que se paga la prima, generalmente clasificado en cuenta de gastos operativos o prestaciones, conforme al Art. 27 fracc XII LISR + Art. 51 RLISR vigentes. Es importante coordinar con tu contador para que: (a) la prima se contabilice correctamente y soporte ante una eventual revisión del SAT, (b) la empresa figure como contratante Y beneficiaria irrevocable (requisito esencial), (c) la persona clave sea verificable como técnico o dirigente cuya pérdida afecte la productividad. Si la estructura no cumple los requisitos del SAT, se pierde la deducción — por eso recomendamos diseñar la póliza coordinados con tu contador desde el inicio.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Qué pasa si una persona clave se va de la empresa, puedo cancelar la póliza?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí — la empresa es contratante y puede cancelar la póliza si lo decide. Algunas pólizas con valor en efectivo (típicas en planes de ahorro a 10-15-20 años) permiten rescatar el valor acumulado al cancelar, sujeto a los términos específicos de la póliza. También es común negociar que el exempleado pueda quedarse con la póliza individual transferida a su nombre (pagando él la prima desde entonces) — esto puede ser parte del paquete de salida o de retención previo. La estructura óptima depende del plan, antigüedad de la póliza y relación con el ex-empleado.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿La prima de Persona Clave es deducible para la empresa?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, generalmente, si la estructura cumple los requisitos del SAT (la empresa es
                  beneficiaria, el asegurado es persona clave verificable, etc.). Lo coordinamos
                  con tu contador para asegurar la deducibilidad. Marco legal: Art. 27 fracc XII
                  LISR + Art. 51 RLISR vigentes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cuánto debe ser la suma asegurada por persona clave?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Depende de su rol. Como referencia: 5-10x la utilidad anual atribuible a esa
                  persona, o el costo total de reemplazo (búsqueda + entrenamiento + bache operativo)
                  multiplicado por 2-3. Lo cuantificamos juntos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Mi socio se entera si lo aseguro?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí — la persona asegurada debe firmar consentimiento y pasar exámenes médicos.
                  No se puede asegurar a alguien sin que sepa. La buena noticia: a la mayoría de
                  socios les parece bien (es señal de que la empresa los valora).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Sirve para empresas pequeñas (menos de 10 empleados)?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí — y es donde más se necesita. En empresas chicas, una sola persona faltante
                  puede colapsar la operación. En corporativos grandes hay redundancia natural; en
                  empresas pequeñas, no.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Ya tengo Vida grupo y GMM colectivo. ¿Necesito Persona Clave también?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Son productos distintos con beneficiarios distintos. Vida grupo paga a la familia
                  del empleado. Persona Clave paga a la empresa. Ambos son necesarios — protegen
                  cosas distintas. Hablamos de la diferencia con detalle en consulta.
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
              Estos perfiles también nos consultan
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/personas/mujeres"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Mujeres dueñas o socias de empresa
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Estructura patrimonial coordinada entre seguro de Mujer Clave para la empresa y planeación personal.
                </p>
              </Link>
              <Link
                href="/gmm"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  GMM corporativo para directivos
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Cobertura médica para empleados clave como beneficio competitivo + retención de talento estratégico.
                </p>
              </Link>
              <Link
                href="/retiro"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  PPR para dueños y socios
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Retiro propio del dueño con deducción Art. 151 fracc V LISR vigente, independiente de la estrategia patrimonial de la empresa.
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
              Identificar persona clave en tu empresa toma una conversación de 30 minutos.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={waHref(whatsapp, WA_MESSAGES.empresas)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Mensaje rápido</div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">WhatsApp</div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">{whatsapp}</div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Email reflexivo</div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">Cuéntame por correo</div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">{email}</div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Diagnóstico</div>
                <div className="text-lg font-medium">Agenda sesión inicial</div>
                <div className="mt-2 text-sm opacity-80">Agenda · sin costo</div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
