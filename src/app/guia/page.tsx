import type { Metadata } from "next";
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
import { GuiaLeadForm } from "./guia-form";
import { CheckupGate } from "@/components/checkup-gate";

const PDF_PATH = "/descargas/guia-8-tramites-fallecimiento.pdf";

// Las 8 áreas reales que cubre la guía (espejo del PDF).
const AREAS: Array<{ n: string; titulo: string; detalle: string }> = [
  {
    n: "01",
    titulo: "Testamento",
    detalle:
      "Cómo revisar si existe, qué hacer si el Notario debe consultar el RENAT y cuándo se necesita un juicio de sucesión.",
  },
  {
    n: "02",
    titulo: "Deudas",
    detalle:
      "Tarjetas de crédito, créditos y arrendamientos de auto, hipotecas, INFONAVIT y FONACOT: qué se cancela y qué se notifica.",
  },
  {
    n: "03",
    titulo: "Pagos pendientes",
    detalle:
      "Qué NO cancelar todavía (cuentas de débito, baja fiscal) hasta concluir la recepción de pagos a favor.",
  },
  {
    n: "04",
    titulo: "Impuestos",
    detalle:
      "Última declaración, pago de impuestos correspondientes y baja ante el SAT.",
  },
  {
    n: "05",
    titulo: "Activos",
    detalle:
      "Traslado de dominio de propiedades ante Notario y cobro de cuentas de cheques, inversiones y ahorro.",
  },
  {
    n: "06",
    titulo: "Seguros y pensiones",
    detalle:
      "IMSS / ISSSTE, AFORE, INFONAVIT y seguros de vida. Cómo localizarlos en la CONDUSEF si no sabes si existen.",
  },
  {
    n: "07",
    titulo: "Servicios",
    detalle:
      "Cancelación de celular, membresías y suscripciones que siguen cobrando.",
  },
  {
    n: "08",
    titulo: "Escuelas",
    detalle:
      "Verificar seguros de orfandad y becas educativas a las que los hijos pueden tener derecho.",
  },
];

const FAQS: FAQItem[] = [
  {
    question: "¿Qué hago primero cuando fallece un familiar?",
    answerText:
      "Lo primero es obtener varias copias certificadas del acta de defunción — las vas a necesitar para casi cada trámite (instituciones financieras, aseguradoras, IMSS, Notario). Después conviene revisar si existe testamento y NO cancelar de inmediato cuentas de débito ni dar de baja fiscal, porque puede haber pagos pendientes a favor del fallecido. La guía ordena los 8 frentes en una checklist para que no se te pase ninguno.",
  },
  {
    question: "¿Cómo sé si mi familiar tenía un seguro de vida?",
    answerText:
      "Si no estás seguro de que exista una póliza, en México puedes consultarlo ante la CONDUSEF, que opera el SIAB-Vida (Sistema de Información sobre Asegurados y Beneficiarios). También conviene revisar estados de cuenta, correos y documentos del fallecido por si había seguros contratados a través del banco o del empleo. La guía explica dónde buscar.",
  },
  {
    question: "¿Qué pasa con las tarjetas de crédito y las deudas al fallecer?",
    answerText:
      "Las tarjetas de crédito se cancelan notificando el fallecimiento; muchas incluyen un seguro que liquida el saldo en automático, por eso conviene revisarlo antes de pagar. Para créditos hipotecarios, INFONAVIT y FONACOT hay que notificar y llevar acta de defunción por institución. La guía detalla qué se cancela, qué se notifica y en qué orden.",
  },
  {
    question: "¿Se puede cobrar la AFORE y la pensión del IMSS al mismo tiempo?",
    answerText:
      "Es uno de los puntos donde más gente se equivoca: según el caso, cobrar la pensión del IMSS puede impedir cobrar el saldo de la cuenta AFORE (o viceversa), así que conviene asesorarse ANTES de iniciar cualquiera de los dos trámites para no perder dinero. Las reglas dependen de la situación específica de cada persona — por eso la guía lo marca como punto de alerta y recomienda revisarlo con un asesor.",
  },
  {
    question: "¿Necesito un testamento para poder heredar?",
    answerText:
      "Si existe testamento, el proceso de sucesión es más rápido y económico. Si no existe, hay que tramitar un juicio de sucesión (intestamentaria), que toma más tiempo y costo. Por eso la prevención —tener testamento vigente y beneficiarios bien designados en seguros y AFORE— le ahorra meses de trámites y conflictos a tu familia.",
  },
];

export const metadata: Metadata = {
  title: "Guía gratis: 8 trámites cuando fallece un familiar",
  description:
    "Descarga gratis la checklist de qué hacer cuando fallece un familiar en México: testamento, deudas, seguros, AFORE, pensiones, SAT y más. Por Iria Talan, asesora autorizada CNSF.",
  alternates: { canonical: `${SITE_URL}/guia` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/guia`,
    title: "Los 8 trámites que nadie te avisa cuando alguien fallece",
    description:
      "Checklist gratuita y descargable para no perderte en los trámites tras un fallecimiento en México.",
  },
};

// Schema HowTo — bueno para answer engines (ChatGPT, Perplexity, Google AI).
function buildGuiaSchema() {
  return {
    "@type": "HowTo" as const,
    "@id": `${SITE_URL}/guia#howto`,
    name: "Qué hacer cuando fallece un familiar en México: 8 trámites",
    description:
      "Checklist de los trámites esenciales tras el fallecimiento de un familiar: testamento, deudas, pagos pendientes, impuestos, activos, seguros y pensiones, servicios y escuelas.",
    url: `${SITE_URL}/guia`,
    inLanguage: "es-MX",
    step: AREAS.map((a, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: a.titulo,
      text: a.detalle,
    })),
  };
}

export default async function GuiaPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const waDigits = whatsapp.replace(/\D/g, "");
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    "Hola Iria, descargué tu guía de trámites por fallecimiento y me gustaría asesoría sobre mi caso.",
  )}`;

  const pageSchema = buildGraph(
    buildGuiaSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Guía: trámites por fallecimiento", path: "/guia" },
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
        {/* Hero */}
        <section className="px-6 pt-12 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-rif-gris">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            {" / "}Guía gratuita
          </p>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.24em] text-rif-rojo">
            Guía gratuita · PDF descargable
          </p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Los 8 trámites que nadie te avisa cuando alguien fallece.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Qué hacer cuando fallece un familiar en México: una checklist paso a
            paso —testamento, deudas, seguros, AFORE, pensiones, SAT y más— para
            que en el peor momento no se te pase nada importante.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={PDF_PATH}
              download
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-cream-light px-7 py-4 font-medium tracking-[0.04em] hover:bg-burgundy-deep transition shadow-[0_12px_32px_-12px_rgba(158,27,30,0.55)] hover:-translate-y-0.5"
            >
              Descargar guía gratis (PDF)
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-4 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition text-ink dark:text-cream-light"
            >
              Hablar con Iria por WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm text-warm-brown/70 dark:text-cream-light/60">
            Descarga inmediata. Sin registro. Gratis.
          </p>
        </section>

        {/* Qué incluye */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Los 8 frentes que tienes que cubrir
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Perder a alguien ya es bastante. La parte de los trámites no
              debería sumar caos. La guía los ordena así:
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {AREAS.map((a) => (
                <div
                  key={a.n}
                  className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-2xl text-rif-rojo tabular-nums">
                      {a.n}
                    </span>
                    <h3 className="font-semibold text-ink dark:text-cream-light">
                      {a.titulo}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed">
                    {a.detalle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué importa / contexto */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Dos errores que le cuestan dinero a las familias
            </h2>
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl bg-cream dark:bg-coffee/40 p-6">
                <h3 className="font-semibold text-ink dark:text-cream-light">
                  Cobrar la pensión del IMSS sin asesorarse antes.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Según el caso, cobrar la pensión puede impedir recuperar el
                  saldo de la AFORE. Es de los puntos donde más dinero se pierde
                  por hacer el trámite en el orden equivocado.
                </p>
              </div>
              <div className="rounded-2xl bg-cream dark:bg-coffee/40 p-6">
                <h3 className="font-semibold text-ink dark:text-cream-light">
                  No saber si existía un seguro de vida.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Muchas familias dejan de cobrar pólizas porque no sabían que
                  existían. En México puedes consultarlo ante la{" "}
                  <strong>CONDUSEF</strong>. La guía te dice cómo.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <a
                href={PDF_PATH}
                download
                className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-cream-light px-7 py-4 font-medium tracking-[0.04em] hover:bg-burgundy-deep transition"
              >
                Descargar la guía completa (PDF)
              </a>
            </div>
          </div>
        </section>

        {/* Autoridad */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Quién hizo esta guía
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Soy <strong>Iria Talan</strong>, asesora patrimonial y de seguros
              con 16 años de experiencia, reconocimiento MDRT Top 1% a nivel
              mundial y cédula CNSF <strong>V388618</strong>. Acompaño a familias
              a proteger su patrimonio antes —y también después— de los momentos
              difíciles.
            </p>
            <div className="mt-6">
              <Link
                href="/sobre-iria"
                className="inline-flex items-center text-rif-rojo font-medium hover:underline"
              >
                Conoce más sobre Iria →
              </Link>
            </div>
          </div>
        </section>

        {/* Lead magnet gateado: Check-up de Beneficiarios */}
        <section className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-2xl mx-auto w-full text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-rif-rojo font-medium">
              Descarga gratuita
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-ink dark:text-cream-light">
              Check-up de Beneficiarios
            </h2>
            <p className="mt-5 text-lg text-warm-brown dark:text-cream-light/90 leading-relaxed">
              Tener testamento no basta: tus seguros, cuentas, AFORE y créditos
              se rigen por sus propios beneficiarios. Revisa en 16 puntos si los
              tuyos están actualizados y alineados — antes de que tu familia lo
              descubra en el peor momento.
            </p>
            <ul className="mt-6 text-left text-warm-brown dark:text-cream-light/85 leading-relaxed space-y-2 max-w-md mx-auto">
              <li>✓ Seguros, cuentas, inversiones, AFORE y PPR</li>
              <li>✓ Créditos con seguro de saldo deudor, fideicomisos y empresa</li>
              <li>✓ Activos en el extranjero, digitales y tutela de menores</li>
              <li>✓ En PDF para imprimir y en Excel para llenar</li>
            </ul>
            <p className="mt-6 text-sm text-warm-brown/80 dark:text-cream-light/70">
              Déjame tus datos y te lo envío al instante.
            </p>
            <div className="mt-6">
              <CheckupGate />
            </div>
          </div>
        </section>

        {/* Conversión a asesoría/plan con formulario */}
        <section className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream/40 dark:bg-coffee/20">
          <div className="max-w-2xl mx-auto w-full text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-ink dark:text-cream-light">
              ¿Te interesa una asesoría?
            </h2>
            <p className="mt-5 font-serif text-xl sm:text-2xl text-warm-brown dark:text-cream-light/90 leading-snug">
              La mejor versión de esta guía es la que tu familia nunca tiene que
              usar de emergencia.
            </p>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              Si quieres asesoría para armar o alinear tu plan patrimonial
              —protección, sucesión y planeación—, déjame tus datos y te contacto. Sin compromiso.
            </p>

            <div className="mt-8">
              <GuiaLeadForm />
            </div>

            <p className="mt-6 text-sm text-warm-brown dark:text-cream-light/70">
              ¿Prefieres escribirme directo?{" "}
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rif-rojo font-medium hover:underline"
              >
                Hablemos por WhatsApp →
              </a>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Preguntas frecuentes
            </h2>
            <div className="mt-8 divide-y divide-warm-brown/15 dark:divide-warm-brown/30">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 font-semibold text-ink dark:text-cream-light list-none">
                    <span>{faq.question}</span>
                    <span className="text-rif-rojo transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-warm-brown dark:text-cream-light/80 leading-relaxed">
                    {faq.answerText}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
