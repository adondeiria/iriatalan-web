import type { Metadata } from "next";
import Link from "next/link";

import {
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  SITE_NAME,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";

import { ContactForm } from "./contact-form";

const FAQS: FAQItem[] = [
  {
    question: "¿La primera consulta tiene costo?",
    answerText:
      "No. La consulta inicial de 30 minutos es gratuita y sin compromiso. La uso para escucharte: qué quieres proteger, en qué momento estás. Después recomiendo, con argumentos.",
  },
  {
    question: "¿Qué llevo a la primera reunión?",
    answerText:
      "Nada en particular. Si ya tienes pólizas vigentes (vida, GMM, retiro, AFORE), tenerlas a mano ayuda — pero no es obligatorio. La primera conversación es para entender tu situación, no para revisar papeles.",
  },
  {
    question: "¿Hay compromiso de contratar después de la consulta?",
    answerText:
      "Cero. La consulta es informativa. Si lo que recomiendo te hace sentido, seguimos. Si no, te entregué información que ya es tuya.",
  },
  {
    question: "¿Atiendes en español o inglés?",
    answerText:
      "Ambos. Mi oficina está en Bosque de Chapultepec, CDMX. Atiendo presencial o por videollamada según prefieras.",
  },
  {
    question: "¿En cuánto tiempo respondes WhatsApp o correo?",
    answerText:
      "Máximo 24 horas hábiles. Si es urgente (siniestro en curso, renovación con fecha límite), márcalo así y respondo más rápido.",
  },
];

function buildContactPageSchema() {
  return {
    "@type": "ContactPage" as const,
    "@id": `${SITE_URL}/contacto#contactpage`,
    name: `Contacto — ${SITE_NAME}`,
    url: `${SITE_URL}/contacto`,
    description:
      "Agenda sesión inicial con Iria Talan, asesora financiera autorizada CNSF.",
    inLanguage: "es-MX",
    isPartOf: { "@id": `${SITE_URL}#website` },
    mainEntity: { "@id": `${SITE_URL}#localbusiness` },
  };
}

export const metadata: Metadata = {
  title: "Contacto — Agenda tu Consulta Gratuita",
  description:
    "Agenda una sesión inicial sin compromiso. Cuéntame qué quieres proteger: salud, retiro, patrimonio, empresa o familia. Respuesta en 24 horas hábiles.",
  alternates: { canonical: `${SITE_URL}/contacto` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contacto`,
    title: "Contacto — Iria Talan / RIF",
    description:
      "Agenda sesión inicial. Asesoría financiera personalizada en México.",
  },
};

export default function ContactoPage() {
  const pageSchema = buildGraph(
    buildContactPageSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Contacto", path: "/contacto" },
    ]),
    buildFAQPageSchema(FAQS),
  );

  // Web3Forms access key — set en Vercel env como NEXT_PUBLIC_WEB3FORMS_KEY.
  // Hasta que Iria provea key real, el form devuelve error gracioso si se intenta enviar.
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "PENDIENTE";

  return (
    <main className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 max-w-4xl mx-auto w-full">
        <p className="text-sm uppercase tracking-wider text-warm-brown/60">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>
          {" / "}Contacto
        </p>
        <h1 className="mt-6 font-serif font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight text-ink max-w-2xl leading-[1.05]">
          Cuéntame qué quieres proteger.
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-warm-brown leading-relaxed max-w-xl">
          Salud, retiro, patrimonio, empresa o familia. La sesión inicial es sin
          compromiso.
        </p>
      </section>

      {/* Form de pre-cualificación — anchor #agendar */}
      <section
        id="agendar"
        className="scroll-mt-24 px-6 py-12 sm:py-16 border-t border-warm-brown/15 bg-cream-light"
      >
        <div className="max-w-2xl mx-auto w-full">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
            Agenda
          </p>
          <h2 className="mt-5 font-serif font-light text-3xl sm:text-4xl text-ink leading-[1.1]">
            Pre-cualificación · 1 minuto
          </h2>
          <p className="mt-4 text-warm-brown leading-relaxed">
            Cuéntame brevemente qué buscas para preparar la primera conversación con
            contexto. Te respondo en máximo 24 horas hábiles.
          </p>

          <div className="mt-10">
            <ContactForm accessKey={accessKey} />
          </div>
        </div>
      </section>

      {/* 2 alternativas rápidas — WhatsApp + Email */}
      <section className="px-6 py-16 border-t border-warm-brown/15">
        <div className="max-w-3xl mx-auto w-full">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy text-center">
            ¿Prefieres conversación directa?
          </p>
          <h2 className="mt-4 font-serif font-light text-2xl sm:text-3xl text-ink text-center leading-tight">
            Escríbeme por WhatsApp o correo.
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <a
              href="https://wa.me/525512683401?text=Hola%20Iria%2C%20vi%20tu%20sitio%20y%20me%20gustar%C3%ADa%20agendar%20una%20primera%20pl%C3%A1tica."
              target="_blank"
              rel="noopener noreferrer"
              className="group p-7 rounded-2xl bg-[#25D366] text-white hover:bg-[#1FB658] transition-all duration-500 hover:-translate-y-0.5"
            >
              <div className="text-xs uppercase tracking-wider opacity-80 mb-3">
                Respuesta rápida
              </div>
              <div className="text-xl font-semibold">WhatsApp</div>
              <div className="mt-2 text-sm opacity-90 leading-relaxed">
                +52 55 1268 3401 · Horas hábiles
              </div>
              <div className="mt-5 text-sm font-medium">Escribir →</div>
            </a>

            <a
              href="mailto:soporte@talan.com.mx?subject=Consulta%20de%20asesor%C3%ADa%20financiera"
              className="group p-7 rounded-2xl border border-warm-brown/15 hover:border-burgundy transition-all duration-500 hover:-translate-y-0.5"
            >
              <div className="text-xs uppercase tracking-wider text-warm-brown/60 mb-3">
                Reflexivo
              </div>
              <div className="text-xl font-semibold text-ink">Correo</div>
              <div className="mt-2 text-sm text-warm-brown/85 leading-relaxed">
                soporte@talan.com.mx
              </div>
              <div className="mt-5 text-sm font-medium text-ink group-hover:text-burgundy">
                Escribir →
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 border-t border-warm-brown/15">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="font-serif font-light text-3xl sm:text-4xl tracking-tight text-ink leading-tight">
            Antes de agendar
          </h2>
          <p className="mt-3 text-warm-brown/85">
            Lo que normalmente preguntan mis clientes antes de la primera consulta.
          </p>
          <div className="mt-10 space-y-8">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
                <p className="mt-2 text-warm-brown leading-relaxed">
                  {faq.answerText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Iria link */}
      <section className="px-6 py-12 border-t border-warm-brown/15">
        <div className="max-w-4xl mx-auto w-full text-center">
          <p className="text-warm-brown/85">
            ¿Quieres conocer mi trayectoria antes de agendar?{" "}
            <Link
              href="/sobre-iria"
              className="font-medium text-ink underline hover:no-underline"
            >
              Lee sobre Iria →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
