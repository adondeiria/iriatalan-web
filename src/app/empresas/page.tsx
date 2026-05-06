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
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Seguros para Empresas · Persona Clave / Hombre Clave — Iria Talan / RIF",
  description:
    "Seguros empresariales: Persona Clave (Hombre Clave), Vida grupo, GMM colectivo y beneficios para empleados. Protege tu negocio cuando depende de personas insustituibles. MDRT TOT · CNSF.",
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

  const ctaUrl = author?.socialLinks?.calendly ?? "https://calendly.com/iriatalan";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildServiceSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Seguros para empresas", path: "/empresas" },
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
              src="/img/servicios/empresas-hero.png"
              alt="Director ejecutivo mexicano de 52 años en su oficina firmando documentos con su equipo trabajando al fondo"
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
            {" / "}Seguros para empresas
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            Tu negocio depende de personas insustituibles. Asegurarlas es asegurar la empresa.
          </h1>
          <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Persona Clave (también conocida como <em>Hombre Clave</em>), Vida grupo, GMM colectivo
            y beneficios para empleados. Soluciones aseguradoras pensadas para empresarios y
            dueños de negocio que entienden el doble dolor: protegerte tú + proteger lo que construiste.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda diagnóstico gratis 30 min
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
              El doble dolor del empresario
            </h2>
            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                Cuando construyes una empresa, asumes <strong className="text-zinc-900 dark:text-zinc-50">dos
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
                <strong className="text-zinc-900 dark:text-zinc-50">La planeación financiera personal y
                empresarial no pueden ir por separado.</strong> Quien te diga que sí, no entiende cómo
                funciona realmente un patrimonio empresarial.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Producto pillar B2B
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Persona Clave (Hombre Clave) — qué es, por qué importa
            </h2>
            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Persona Clave</strong> es un seguro
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
                <strong className="text-zinc-900 dark:text-zinc-50">¿Por qué se llama también Hombre Clave?</strong>{" "}
                Es el nombre coloquial histórico del producto en México. Yo uso ambos términos
                porque ambos se buscan — y porque muchos empresarios encuentran el producto buscando
                &ldquo;seguro hombre clave&rdquo; sin saber el nombre técnico.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              ¿Quién en tu empresa es Persona Clave?
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              No es solo el dueño. Estos son los perfiles más comunes que asegurar:
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Tú, fundador/a o socio/a</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Si tu nombre está en los contratos, en las relaciones bancarias, en las decisiones
                  estratégicas — eres persona clave por definición.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Director técnico u operativo</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Quien sostiene la operación día a día. Sin esa persona, el cliente no recibe el
                  servicio. Reemplazarla toma 6-12 meses mínimo.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Comercial estrella</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Quien trae las cuentas grandes. Su salida arrastra clientes — y a veces a otros
                  comerciales. Asegurarla protege tu pipeline.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Especialista único</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Ingeniero senior, científica de datos, médico/a especialista, abogada experta —
                  cualquier perfil cuya rotación genera riesgo operativo serio.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cobertura empresarial completa — no solo Persona Clave
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              Persona Clave es el corazón. Pero un programa empresarial completo suele incluir
              estos componentes complementarios.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">B2B core</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Vida grupo / colectivo</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Seguro de vida para todos tus empleados con suma asegurada en múltiplos de salario
                  (12, 24, 36 meses). Beneficio laboral deducible para la empresa.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Salud B2B</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">GMM colectivo</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Cobertura médica privada para empleados con red hospitalaria y deducibles
                  estructurados al perfil de tu nómina. Atrae y retiene talento.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Sucesión</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Buy-sell agreement asegurado</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Si tienes socios y uno falta, la empresa recibe la suma para comprar su participación
                  accionaria. Evita conflictos con herederos y mantiene control empresarial.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Beneficios extra</div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Plan de retiro empresarial</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  PPR colectivo o vehículos de ahorro para retiro como prestación. Combinable con
                  Modalidad 40 IMSS individual. Ver{" "}
                  <Link href="/retiro" className="underline">/retiro</Link>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cómo trabajamos contigo
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  1. Diagnóstico de riesgos críticos del negocio
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Identificamos juntos: ¿quién es persona clave en tu empresa? ¿Qué pasaría operativa
                  y financieramente si esa persona falta? Es una conversación honesta, sin formularios.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  2. Cuantificación de la suma asegurada
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Para cada persona clave: cuánto necesita la empresa para absorber su ausencia.
                  Cálculo basado en utilidades, deudas, costos de reemplazo y participación accionaria.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  3. Recomendación de aseguradora(s) para tu caso
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Trabajo con BUPA, MetLife, Allianz, Seguros Monterrey New York Life, AXA y
                  GNP — todas autorizadas CNSF para pólizas empresariales. Según la situación
                  específica de tu empresa, te recomiendo la(s) más adecuada(s) para ti.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  4. Estructura legal y fiscal correcta
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Coordinación con tu contador y abogado para que la prima sea deducible para la
                  empresa, los beneficiarios estén bien designados, y la suma sea recibida sin
                  complicaciones fiscales el día que se requiera.
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
                  ¿La prima de Persona Clave es deducible para la empresa?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Sí, generalmente, si la estructura cumple los requisitos del SAT (la empresa es
                  beneficiaria, el asegurado es persona clave verificable, etc.). Lo coordinamos
                  con tu contador para asegurar la deducibilidad.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿Cuánto debe ser la suma asegurada por persona clave?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Depende de su rol. Como referencia: 5-10x la utilidad anual atribuible a esa
                  persona, o el costo total de reemplazo (búsqueda + entrenamiento + bache operativo)
                  multiplicado por 2-3. Lo cuantificamos juntos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿Mi socio se entera si lo aseguro?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Sí — la persona asegurada debe firmar consentimiento y pasar exámenes médicos.
                  No se puede asegurar a alguien sin que sepa. La buena noticia: a la mayoría de
                  socios les parece bien (es señal de que la empresa los valora).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿Sirve para empresas pequeñas (menos de 10 empleados)?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Sí — y es donde más se necesita. En empresas chicas, una sola persona faltante
                  puede colapsar la operación. En corporativos grandes hay redundancia natural; en
                  empresas pequeñas, no.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Ya tengo Vida grupo y GMM colectivo. ¿Necesito Persona Clave también?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Son productos distintos con beneficiarios distintos. Vida grupo paga a la familia
                  del empleado. Persona Clave paga a la empresa. Ambos son necesarios — protegen
                  cosas distintas. Hablamos de la diferencia con detalle en consulta.
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
              Identificar persona clave en tu empresa toma una conversación de 30 minutos.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Mensaje rápido</div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">WhatsApp</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">{whatsapp}</div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Email reflexivo</div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Cuéntame por correo</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">{email}</div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Diagnóstico</div>
                <div className="text-lg font-medium">Agenda 30 min gratis</div>
                <div className="mt-2 text-sm opacity-80">Calendly · sin costo</div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
