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
import { RelatedArticles } from "@/components/blog/related-articles";

const FAQS: FAQItem[] = [
  {
    question: "¿Los rendimientos están garantizados?",
    answerText:
      "No. Estos planes están ligados a fondos de inversión del mercado financiero, por lo que los rendimientos dependen del desempeño de los fondos elegidos. No son planes de ahorro garantizado.",
  },
  {
    question: "¿Puedo retirar mi dinero antes de que termine el plazo?",
    answerText:
      "Sí, hay liquidez durante la vigencia del plan. Los términos específicos — tiempos y montos mínimos — dependen del plan contratado.",
  },
  {
    question: "¿Qué pasa si dejo de aportar?",
    answerText:
      "Depende del plan. En planes con aportaciones comprometidas hay un periodo de gracia. En planes de aportación única no aplica este punto.",
  },
  {
    question: "¿El seguro de vida que incluye es significativo?",
    answerText:
      "El componente de seguro es el vehículo legal que da acceso a los beneficios de inembargabilidad y tratamiento fiscal. La suma asegurada es referencial — el valor real del plan está en el fondo de inversión acumulado.",
  },
  {
    question: "¿Puedo designar beneficiarios?",
    answerText:
      "Sí. La designación de beneficiarios es uno de los pilares del plan — garantiza que el dinero llegue a quien tú decidas, sin trámites sucesorios.",
  },
  {
    question: "¿En qué moneda puedo invertir?",
    answerText:
      "Pesos mexicanos, dólares o euros, según el fondo elegido. Puedes diversificar entre monedas dentro del mismo plan.",
  },
  {
    question: "¿Qué diferencia hay entre un plan deducible y uno no deducible?",
    answerText:
      "Los planes deducibles (PPR) te permiten restar las aportaciones de tu declaración anual de ISR — ideal si eres asalariado o persona física con actividad empresarial. Los no deducibles ofrecen exención de impuestos sobre rendimientos al cumplir ciertos requisitos de edad y antigüedad (Art. 93 fracc. XXI LISR).",
  },
  {
    question: "¿Puedo tener más de un plan?",
    answerText:
      "Sí. Muchos clientes combinan un plan deducible para el beneficio fiscal anual con un plan no deducible para inversión patrimonial a largo plazo.",
  },
];

export const metadata: Metadata = {
  title: "Fondos de Inversión con Protección Patrimonial en México",
  description:
    "Fondos de inversión en México con la protección de un seguro: S&P 500, Nasdaq y mercados globales, inembargables y sin juicio sucesorio. Agenda tu consulta.",
  alternates: { canonical: `${SITE_URL}/fondos-de-inversion` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/fondos-de-inversion`,
    title: "Fondos de inversión con protección patrimonial — Iria Talan",
    description:
      "Tu dinero en los mercados globales — S&P 500, Nasdaq, PIMCO — con inembargabilidad, herencia sin trámites y beneficio fiscal en planes seleccionados.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/fondos-de-inversion#service`,
    name: "Fondos de Inversión con Protección Patrimonial",
    description:
      "Inversión en mercados globales (S&P 500, Nasdaq, PIMCO) dentro de una estructura de seguro: inembargable, sin juicio sucesorio y con beneficio fiscal en planes seleccionados.",
    serviceType: "Fondo de Inversión",
    category: "Inversión Patrimonial",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "México" },
  };
}

export default async function FondosDeInversionPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const whatsapp = author?.socialLinks?.whatsapp ?? "+525526786325";

  const faqSchema = buildFAQPageSchema(FAQS);
  const pageSchema = buildGraph(
    buildServiceSchema(),
    faqSchema,
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Fondos de inversión", path: "/fondos-de-inversion" },
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
              src="/img/servicios/fondos-de-inversion-hero.jpg"
              alt="Pareja revisando su plan de inversión en terraza con vista a la ciudad al atardecer — fondos de inversión"
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
            {" / "}Fondos de inversión
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Tu dinero en los mercados globales. Con blindaje patrimonial.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            No es una cuenta de inversión tradicional. Es un plan que combina acceso
            a mercados financieros internacionales con protección patrimonial real:
            inembargable, sin juicio sucesorio, y con beneficio fiscal en planes seleccionados.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/contacto#agendar"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Consulta sin costo — 30 min
            </Link>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        {/* Comparativa vs cuenta de inversión */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿Qué lo hace diferente a una cuenta de inversión normal?
            </h2>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-warm-brown/20">
                    <th className="text-left py-3 pr-4 font-medium text-ink dark:text-cream-light w-1/2"></th>
                    <th className="text-center py-3 pr-4 font-medium text-ink dark:text-cream-light">
                      Cuenta de inversión tradicional
                    </th>
                    <th className="text-center py-3 font-medium text-rif-rojo">
                      Plan de inversión con seguro
                    </th>
                  </tr>
                </thead>
                <tbody className="text-warm-brown dark:text-cream-light/75">
                  {[
                    ["Embargable por acreedores", "Sí", "No"],
                    ["Herencia con juicio sucesorio", "Sí", "No — pago directo a beneficiarios"],
                    ["Confidencialidad patrimonial", "No", "Sí"],
                    ["Beneficio fiscal disponible", "No", "En planes seleccionados"],
                    ["Bonos por permanencia", "No", "En algunos planes"],
                    ["Fondos globales (S&P 500, Nasdaq)", "Sí", "Sí"],
                  ].map(([label, tradicional, seguro]) => (
                    <tr key={label} className="border-b border-warm-brown/10">
                      <td className="py-3 pr-4 font-medium text-ink dark:text-cream-light">{label}</td>
                      <td className="py-3 pr-4 text-center text-warm-brown/70 dark:text-cream-light/50">{tradicional}</td>
                      <td className="py-3 text-center text-rif-rojo font-medium">{seguro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Alternativas de inversión */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Dónde va tu dinero
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Alternativas de inversión disponibles
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Tú decides en qué fondos va tu dinero y puedes cambiar de alternativa durante la vigencia del plan.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                {
                  moneda: "En pesos mexicanos",
                  opciones: ["Renta fija (deuda gubernamental y corporativa)", "Renta variable (mercado accionario mexicano)"],
                },
                {
                  moneda: "En dólares",
                  opciones: ["S&P 500", "Nasdaq 100", "Renta fija corporativa (PIMCO)", "Renta fija especial", "Renta variable global"],
                },
                {
                  moneda: "En euros",
                  opciones: ["Renta fija especial", "Renta variable europea"],
                },
              ].map((grupo) => (
                <div
                  key={grupo.moneda}
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-3">{grupo.moneda}</div>
                  <ul className="space-y-2">
                    {grupo.opciones.map((op) => (
                      <li key={op} className="text-sm text-warm-brown dark:text-cream-light/75 leading-snug flex gap-2">
                        <span className="text-rif-rojo mt-0.5">·</span>
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Beneficios patrimoniales */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Protección real
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Beneficios patrimoniales
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Inembargabilidad
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El dinero invertido en un plan con seguro no puede ser embargado por acreedores.
                  Es una protección legal reconocida en México bajo la Ley sobre el Contrato de
                  Seguro (Art. 179 LCS). Tu inversión permanece protegida independientemente de
                  las contingencias económicas que puedas enfrentar.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Herencia sin trámites
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  En caso de fallecimiento, tus beneficiarios reciben los recursos directamente
                  y libres de gravamen — sin juicio sucesorio, sin esperar meses, sin notarios.
                  La designación de beneficiarios en la póliza es lo que hace posible esa
                  transferencia directa e inmediata.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Confidencialidad
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  A diferencia de una inversión en persona física o moral, el plan no es
                  de conocimiento público. Tu patrimonio financiero es privado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Plazos y bonos */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Plazos y bonos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Plazos flexibles</div>
                <h3 className="text-base font-semibold text-ink dark:text-cream-light">
                  Desde 10 años hasta los 100
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Cada plan se adapta a tu horizonte: 10, 15 o 20 años, hasta edad 65
                  o hasta edad 100. Algunos planes pueden concluir antes del plazo
                  si el valor del fondo alcanza la meta establecida.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Bonos por permanencia</div>
                <h3 className="text-base font-semibold text-ink dark:text-cream-light">
                  Recompensa a la constancia
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Algunos planes otorgan bonos adicionales por permanencia o sobre
                  las aportaciones acumuladas — ventajas que no existen en ningún
                  fondo de inversión convencional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficio fiscal */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Optimización fiscal
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Algunos planes tienen beneficio fiscal
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Ciertos planes califican como Plan Personal de Retiro (PPR) bajo los artículos
              93, 151 y 185 de la LISR, lo que te permite:
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Deducir tus aportaciones anuales de tu declaración de impuestos",
                "Diferir el pago de ISR sobre los rendimientos",
                "Recibir los recursos con tratamiento fiscal preferente al vencimiento",
              ].map((punto) => (
                <li key={punto} className="flex gap-3 text-warm-brown dark:text-cream-light/85">
                  <span className="text-rif-rojo mt-1 shrink-0">·</span>
                  {punto}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Si ya tienes un PPR o AFORE, estos planes pueden complementarlos. Los planes
              no deducibles, por su parte, ofrecen exención de impuestos sobre rendimientos
              al cumplir ciertos requisitos de antigüedad y edad (Art. 93 fracc. XXI LISR).
            </p>
            <p className="mt-4 text-sm text-warm-brown/60 dark:text-cream-light/40">
              El tratamiento fiscal aplicable depende de tu situación particular. Consulta
              con tu contador el impacto específico para tu perfil fiscal.
            </p>
          </div>
        </section>

        {/* Para quién es */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿Para quién es?
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                {
                  titulo: "Capital disponible que quieres proteger",
                  desc: "Tienes ahorros y quieres que crezcan en mercados globales sin que queden expuestos a embargos o reclamos.",
                },
                {
                  titulo: "Empresarios con patrimonio que separar",
                  desc: "El riesgo empresarial no debería tocar tu patrimonio personal. Estos planes blindan tu inversión del negocio.",
                },
                {
                  titulo: "Planeación de retiro más allá del AFORE",
                  desc: "El AFORE raramente alcanza. Complementarlo con un PPR en mercados globales cambia la matemática del retiro.",
                },
                {
                  titulo: "Herencia que quieres que llegue fácil",
                  desc: "Sin juicio sucesorio, sin notario, sin esperar. El dinero llega directo a quien designes.",
                },
                {
                  titulo: "Contribuyentes que quieren bajar ISR",
                  desc: "Si declaras impuestos como persona física, las aportaciones a un PPR son deducibles cada año.",
                },
                {
                  titulo: "Diversificación en dólares o euros",
                  desc: "Para quien quiere exposición cambiaria y acceso a mercados internacionales con estructura legal mexicana.",
                },
              ].map((item) => (
                <div
                  key={item.titulo}
                  className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30"
                >
                  <h3 className="font-semibold text-ink dark:text-cream-light text-sm">{item.titulo}</h3>
                  <p className="mt-2 text-xs text-warm-brown/75 dark:text-cream-light/55 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
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
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Servicios relacionados
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Para qué metas suele usarse
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/planes-educacionales"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Planes educacionales
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Si el objetivo es la universidad de tus hijos, compara el plan educativo dedicado.
                </p>
              </Link>
              <Link
                href="/retiro"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Planeación de retiro
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  PPR y estrategias de largo plazo con beneficio fiscal para tu retiro.
                </p>
              </Link>
              <Link
                href="/patrimonial"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Planeación patrimonial
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Ordena e invierte tu capital dentro de una estrategia patrimonial integral.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Conoce las opciones para tu perfil
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Trabajo con Allianz y GNP — dos de las aseguradoras con mayor solidez en México.
              En 30 minutos revisamos tu situación, tus objetivos y qué plan se adapta mejor.
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
                href={waHref(whatsapp, WA_MESSAGES.fondosInversion)}
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

        {/* Interlinking inverso: la página de servicio devuelve autoridad al
            blog y señala de qué temas hay profundidad. Se puebla desde Sanity,
            así que no hay lista que se quede vieja. No renderiza si no hay
            artículos de estos topics. */}
        <RelatedArticles
          topics={["retiro","patrimonial"]}
          heading="Sobre inversión y patrimonio, a fondo"
          intro="Vehículos de largo plazo, retiro y estructura patrimonial explicados con números."
        />

      </main>
    </>
  );
}
