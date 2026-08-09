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
    question: "¿Cuánto seguro de vida necesito?",
    answerText:
      "Punto de partida: 10 veces tu ingreso anual neto. Si tienes deudas grandes (hipoteca, crédito empresarial), súmalas. Si tienes hijos menores o dependientes con necesidades especiales, multiplica por más años de dependencia. Si tu patrimonio incluye inmuebles con derechos notariales pendientes (≈ 8% del valor), agrega eso. El número exacto lo calculamos con tus datos — lo que parece mucho en primas suele ser poco frente al costo real que cargarían tus herederos.",
  },
  {
    question: "¿Qué diferencia hay entre seguro temporal y seguro de vida vitalicio?",
    answerText:
      "El seguro temporal funciona como el seguro de auto: pagas una prima anual por un periodo (10, 15, 20 años), y si falleces en ese periodo tu familia cobra. Si no pasa nada y se vence el plazo, las primas no se recuperan — igual que el auto. Es la opción más económica para proteger a familia mientras los hijos son chicos o la hipoteca está activa. El seguro vitalicio te cubre hasta los 99 años e incluye un componente de ahorro o inversión: parte de tu prima se acumula como valor de rescate. No caduca aunque vivas muchos años. Es más caro, pero acumula valor y puede usarse como herramienta patrimonial.",
  },
  {
    question: "¿Cuánto cuesta un seguro de vida?",
    answerText:
      "El costo depende de tu edad, sexo biológico, si eres fumador, la suma asegurada y los riders adicionales. Como referencia: un hombre de 35 años, no fumador, con $1,000,000 MXN de suma asegurada en un seguro temporal a 20 años puede pagar desde $200-$400 MXN al mes — menos que un plan de streaming familiar. A los 50 años el mismo perfil puede costar 2-3 veces más. Por eso la regla es: contratar joven y sano. Cotizamos sin costo y sin compromiso con las 6 aseguradoras con las que trabajo.",
  },
  {
    question: "¿El suicidio está cubierto?",
    answerText:
      "Sí, a partir del 3er año de vigencia de la póliza. La mayoría de las aseguradoras en México exigen un periodo de carencia de 2 años antes de cubrir muerte por suicidio. Pasado ese periodo, el beneficiario cobra igual que en cualquier otro fallecimiento. Es importante leer las condiciones generales de tu póliza específica para confirmar el plazo exacto que aplica.",
  },
  {
    question: "¿El dinero que recibe mi familia paga ISR?",
    answerText:
      "No, conforme al Art. 93 fracc XXI LISR vigente, la indemnización por muerte que reciben los beneficiarios en línea directa de sangre (cónyuge, hijos, padres) está exenta de ISR. El dinero llega íntegro. Para beneficiarios fuera de línea directa, la aplicabilidad puede variar — consulta con tu asesor fiscal el caso específico antes de firmar la póliza.",
  },
  {
    question: "¿En cuánto tiempo cobra mi familia?",
    answerText:
      "Con documentación completa — acta de defunción, identificación del beneficiario y póliza — el pago ocurre típicamente en 15-30 días hábiles. Designar beneficiarios con datos actualizados es lo que hace que ese proceso sea rápido. Si los beneficiarios no están actualizados o hay conflicto entre herederos, el trámite puede tardarse meses. Por eso la revisión anual de beneficiarios no es opcional.",
  },
  {
    question: "¿Qué es la doble indemnización por accidente?",
    answerText:
      "Es un rider (cobertura adicional) que duplica la suma asegurada si el fallecimiento ocurre por accidente. Si tu suma asegurada es $2,000,000 MXN y mueres en un accidente vehicular, tu familia cobra $4,000,000 MXN. El costo adicional de este rider suele ser muy bajo — puede añadirse a casi cualquier póliza. Lo recomiendo especialmente para personas que viajan frecuentemente o trabajan con maquinaria.",
  },
  {
    question: "¿Qué enfermedades cubre el seguro de enfermedades graves?",
    answerText:
      "Depende del carrier, pero la cobertura estándar de enfermedades graves incluye: cáncer invasivo, infarto al miocardio, evento cerebrovascular (AVC / derrame), trasplante de órganos mayores, insuficiencia renal crónica en diálisis, cirugía de bypass coronario, coma, parálisis permanente, pérdida de extremidades. El pago es en vida — al diagnóstico confirmado — y se usa para tratamiento, pérdida de ingreso durante el tratamiento o cubrir gastos que el GMM no cubre. No es lo mismo que GMM (que paga hospitales): el seguro de enfermedades graves te paga a ti directamente.",
  },
  {
    question: "¿Puedo contratar aunque tenga condición de salud preexistente?",
    answerText:
      "Depende de la condición. Algunas preexistencias se excluyen, otras se aceptan con sobreprecio, y algunas se cubren normalmente si están controladas. El proceso correcto: llenar el cuestionario médico con total honestidad, la aseguradora emite la oferta con las condiciones exactas, y decides si aceptas. Nunca omitas una preexistencia — si al momento del siniestro la aseguradora detecta que no fue declarada, puede rechazar el pago legítimamente. Trabajar con un agente que conozca los criterios de suscripción de cada carrier es clave para encontrar la mejor opción.",
  },
];

export const metadata: Metadata = {
  title: "Seguros de Vida y Protección Familiar en México",
  description:
    "Seguro de vida en México: cuánto necesitas, qué tipo conviene (temporal, vitalicio, enfermedades graves) y para qué más sirve. Agenda tu consulta sin costo.",
  alternates: { canonical: `${SITE_URL}/seguros-vida` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/seguros-vida`,
    title: "Seguros de vida · Protección y herramienta patrimonial — Iria Talan",
    description:
      "Seguro de vida temporal o vitalicio, coberturas de enfermedades graves y usos estratégicos para proteger a tu familia y ordenar tu herencia.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "Service" as const,
    "@id": `${SITE_URL}/seguros-vida#service`,
    name: "Seguros de Vida y Protección Familiar",
    description:
      "Seguros de vida en México —temporal, vitalicio y por enfermedades graves— con enfoque patrimonial: cuánto necesitas, qué tipo conviene y designación de beneficiarios hacia fideicomiso.",
    serviceType: "Seguro de Vida",
    category: "Protección Patrimonial",
    provider: { "@id": `${SITE_URL}/sobre-iria#person` },
    areaServed: { "@type": "Country", name: "México" },
  };
}

export default async function SegurosVidaPage() {
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
      { name: "Seguros de vida", path: "/seguros-vida" },
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
              src="/img/servicios/seguros-vida-hero.jpg"
              alt="Mamá fotografiando a papá jugando con sus hijos en el mar al atardecer — seguro de vida"
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
            {" / "}Seguros de vida
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Tu familia protegida. Tu herencia lista.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            El seguro de vida no es solo "si me pasa algo". Es la herramienta más eficiente
            para evitar que tus herederos vendan la casa de prisa, se peleen por el reparto
            o paguen derechos notariales de su propio bolsillo.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/contacto#agendar"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Cotizar sin costo — 30 min
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
              Temporal vs vitalicio — cuál te conviene
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Seguro temporal</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Como el seguro de auto
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Pagas prima anual por un periodo (10, 15 o 20 años). Si falleces en ese
                  periodo, tu familia cobra. Si no pasa nada y se vence, las primas no se
                  recuperan — igual que el auto o el médico. La opción más económica para
                  proteger mientras los hijos son chicos o la hipoteca está activa.
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Seguro vitalicio</div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Te cubre hasta los 99 años
                </h3>
                <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                  Incluye un componente de ahorro o inversión: parte de tu prima se acumula
                  como valor de rescate disponible en vida. No caduca aunque vivas muchos años.
                  Más caro que el temporal, pero acumula valor y funciona como herramienta
                  patrimonial de largo plazo.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-warm-brown/70 dark:text-cream-light/50 leading-relaxed">
              Ambos tipos pueden combinarse con <strong>riders</strong> adicionales: enfermedades graves,
              invalidez total y permanente, doble indemnización por accidente, exención de primas.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Más allá de la protección básica
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              5 usos estratégicos del seguro de vida
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Pagar impuestos hereditarios
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Cuando falleces y tienes inmuebles, el ISR por enajenación puede ser
                  significativo. Tus herederos necesitan liquidez inmediata para cubrirlo
                  — o se ven forzados a vender parte del patrimonio a precio de urgencia.
                  El seguro de vida llega antes que el notario.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Dividir la herencia y pagar a las otras partes
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Tienes un departamento que heredarás a un hijo, pero tienes tres. El seguro
                  es el instrumento que le paga a los otros dos sin que nadie tenga que
                  vender la propiedad. Cada heredero recibe lo que le toca — sin forcejeos
                  ni subasta.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Cubrir derechos notariales y gastos de sucesión
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El proceso notarial de una herencia cuesta aproximadamente 8% del valor
                  total del patrimonio — más honorarios, impuestos y gastos administrativos.
                  Para una herencia de $5M, estás hablando de $400,000 MXN que tus herederos
                  deben pagar antes de recibir un solo peso. El seguro cubre ese hueco.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  4. Cascada patrimonial — continuidad del negocio
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Si tienes un negocio o empresa, el seguro de vida puede financiar la
                  compra de tu participación a tus herederos sin que los socios tengan que
                  liquidar activos ni pedir crédito de urgencia. La empresa sigue operando,
                  tus herederos reciben el valor de tu participación en efectivo.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  5. Para que los familiares no se peleen
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  La principal causa de conflicto familiar en herencias no es el dinero —
                  es la falta de liquidez para repartir equitativamente. Cuando cada quien
                  recibe lo que le corresponde sin depender de vender activos compartidos,
                  la familia no tiene motivo para pelear. El seguro es el mecanismo
                  que hace posible ese reparto limpio.
                </p>
              </div>
            </div>
            <p className="mt-8 text-sm text-warm-brown/70 dark:text-cream-light/50 leading-relaxed">
              Para estructuras más complejas — fideicomisos, buy-sell agreements entre socios,
              blindaje patrimonial — ver{" "}
              <Link href="/patrimonial" className="underline hover:text-rif-rojo">
                /patrimonial
              </Link>.
            </p>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Coberturas disponibles
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { tag: "Básica", titulo: "Muerte por cualquier causa", desc: "La cobertura principal: tu familia cobra la suma asegurada sin importar la causa del fallecimiento." },
                { tag: "Rider", titulo: "Muerte accidental", desc: "Duplica o triplica la suma asegurada si el fallecimiento ocurre por accidente. Doble indemnización al costo más bajo." },
                { tag: "Rider", titulo: "Enfermedades graves", desc: "Pago en vida al diagnóstico de cáncer, infarto, AVC, trasplante, insuficiencia renal, bypass y otras. Cubre lo que el GMM no cubre." },
                { tag: "Rider", titulo: "Invalidez total y permanente", desc: "Si quedas imposibilitado para trabajar permanentemente, la póliza exime el pago de primas y/o paga la suma asegurada en vida." },
                { tag: "Rider", titulo: "Exención de primas", desc: "Si sufres una incapacidad temporal, la aseguradora paga las primas por ti. Tu cobertura no se cancela." },
                { tag: "Rider", titulo: "Gastos funerarios", desc: "Pago anticipado y directo para cubrir gastos funerarios sin que tu familia tenga que adelantar dinero." },
              ].map((item) => (
                <div
                  key={item.titulo}
                  className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">{item.tag}</div>
                  <h3 className="font-semibold text-ink dark:text-cream-light text-sm">{item.titulo}</h3>
                  <p className="mt-2 text-xs text-warm-brown/75 dark:text-cream-light/55 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿Cuánto cuesta?
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Referencia orientativa. Las primas reales dependen de tu edad, sexo, historial
              médico, suma asegurada y riders seleccionados.
            </p>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-warm-brown/20">
                    <th className="text-left py-3 pr-4 font-medium text-ink dark:text-cream-light">Perfil</th>
                    <th className="text-left py-3 pr-4 font-medium text-ink dark:text-cream-light">Suma asegurada</th>
                    <th className="text-left py-3 font-medium text-ink dark:text-cream-light">Prima aprox / mes</th>
                  </tr>
                </thead>
                <tbody className="text-warm-brown dark:text-cream-light/75">
                  <tr className="border-b border-warm-brown/10">
                    <td className="py-3 pr-4">Hombre 30 años, no fumador</td>
                    <td className="py-3 pr-4">$1,000,000 MXN</td>
                    <td className="py-3">desde $180 MXN</td>
                  </tr>
                  <tr className="border-b border-warm-brown/10">
                    <td className="py-3 pr-4">Hombre 40 años, no fumador</td>
                    <td className="py-3 pr-4">$1,000,000 MXN</td>
                    <td className="py-3">desde $350 MXN</td>
                  </tr>
                  <tr className="border-b border-warm-brown/10">
                    <td className="py-3 pr-4">Mujer 35 años, no fumadora</td>
                    <td className="py-3 pr-4">$1,000,000 MXN</td>
                    <td className="py-3">desde $200 MXN</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Hombre 45 años, no fumador</td>
                    <td className="py-3 pr-4">$5,000,000 MXN</td>
                    <td className="py-3">desde $1,200 MXN</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-warm-brown/60 dark:text-cream-light/40">
              Cifras referenciales para seguro temporal a 20 años. Precios vigentes a 2026; sujetos a emisión y cuestionario médico. Fuente: cotizaciones de las 6 aseguradoras con las que trabajo.
            </p>
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
              Cotizar sin costo y sin compromiso
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Trabajo con 6 aseguradoras AAA en México:{" "}
              <strong className="font-semibold text-ink dark:text-cream-light">GNP, AXA, MetLife, Seguros Monterrey New York Life, BUPA y Allianz</strong>.
              Las 6 ofrecen seguro de vida, así que aquí la comparativa es entre todas.
              (En gastos médicos mayores son 5, porque Allianz no vende GMM en México.)
              En 30 minutos tienes la comparativa de opciones para tu perfil específico
              — no una presentación genérica.
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
                href={waHref(whatsapp, WA_MESSAGES.segurosVida)}
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
          topics={["vida","patrimonial"]}
          heading="Sobre seguros de vida, a fondo"
          intro="Cómo se estructura un seguro de vida para que el dinero llegue a quien tiene que llegar, y sin pasar por juicio."
        />

      </main>
    </>
  );
}
