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
      "Agenda consulta gratuita de 30 min con Iria Talan, asesora financiera autorizada CNSF.",
    inLanguage: "es-MX",
    isPartOf: { "@id": `${SITE_URL}#website` },
    mainEntity: { "@id": `${SITE_URL}#localbusiness` },
  };
}

export const metadata: Metadata = {
  title: "Contacto — Agenda tu Consulta Gratuita",
  description:
    "Agenda una consulta de 30 min, escríbeme por WhatsApp o correo. Cuéntame qué quieres proteger: salud, retiro, patrimonio, empresa o familia.",
  alternates: { canonical: `${SITE_URL}/contacto` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/contacto`,
    title: "Contacto — Iria Talan / RIF",
    description:
      "Agenda consulta gratuita de 30 min. Asesoría financiera personalizada en México.",
  },
};

export default function ContactoPage() {
  const pageSchema = buildGraph(
    buildContactPageSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Contacto", path: "/contacto" },
    ]),
    buildFAQPageSchema(FAQS)
  );

  return (
    <main className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      {/* Hero */}
      <section className="px-6 pt-16 pb-10 max-w-4xl mx-auto w-full">
        <p className="text-sm uppercase tracking-wider text-zinc-500">
          <Link href="/" className="hover:underline">Inicio</Link>
          {" / "}Contacto
        </p>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-2xl leading-tight">
          Cuéntame qué quieres proteger.
        </h1>
        <p className="mt-4 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-xl">
          Salud, retiro, patrimonio, empresa o familia. La consulta inicial es sin costo y sin compromiso.
        </p>
      </section>

      {/* 3 contact options */}
      <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href="https://calendly.com/iriatalan"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-7 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
          >
            <div className="text-xs uppercase tracking-wider opacity-70 mb-3">Preferido</div>
            <div className="text-xl font-semibold">Agenda en Calendly</div>
            <div className="mt-2 text-sm opacity-80 leading-relaxed">
              Reserva tu consulta gratuita de 30 min. Yo te confirmo.
            </div>
            <div className="mt-5 text-sm font-medium">Agendar ahora →</div>
          </a>

          <a
            href="https://wa.me/525512683401?text=Hola%20Iria%2C%20me%20gustar%C3%ADa%20agendar%20una%20consulta."
            target="_blank"
            rel="noopener noreferrer"
            className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Respuesta rápida</div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">WhatsApp</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              +52 55 1268 3401 · Horas hábiles.
            </div>
            <div className="mt-5 text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline">Escribir →</div>
          </a>

          <a
            href="mailto:soporte@talan.com.mx?subject=Consulta%20de%20asesor%C3%ADa%20financiera"
            className="group p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
          >
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Reflexivo</div>
            <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Correo</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              soporte@talan.com.mx
            </div>
            <div className="mt-5 text-sm font-medium text-zinc-900 dark:text-zinc-50 group-hover:underline">Escribir →</div>
          </a>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            O escríbeme directamente aquí.
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Cuéntame brevemente qué quieres proteger: salud, retiro, patrimonio, empresa o familia.
          </p>

          <form
            action="mailto:soporte@talan.com.mx"
            method="get"
            encType="text/plain"
            className="mt-8 space-y-5"
          >
            <input type="hidden" name="subject" value="Consulta desde iriatalan.com.mx" />
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rif-rojo"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label
                htmlFor="contacto"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                WhatsApp o correo
              </label>
              <input
                type="text"
                id="contacto"
                name="contacto"
                required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rif-rojo"
                placeholder="+52 55 XXXX XXXX o correo"
              />
            </div>
            <div>
              <label
                htmlFor="mensaje"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                ¿Qué quieres proteger o resolver?
              </label>
              <textarea
                id="mensaje"
                name="body"
                rows={4}
                required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rif-rojo resize-none"
                placeholder="Ej. Quiero revisar mi GMM porque subió mucho. Tengo 42 años, dos hijos, y busco cobertura con red hospitalaria en CDMX."
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Enviar mensaje
            </button>
          </form>

          <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
            Tu información es estrictamente confidencial. No comparto datos con terceros ni listas
            de correo. Cédula CNSF <strong>V388618</strong> ·{" "}
            <a
              href="https://agentesajustadores.cnsf.gob.mx/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-700"
            >
              Verificar autorización
            </a>
            . Respondo en un plazo máximo de 24 horas hábiles.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Antes de agendar
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Lo que normalmente preguntan mis clientes antes de la primera consulta.
          </p>
          <div className="mt-10 space-y-8">
            {FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {faq.question}
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {faq.answerText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Iria link */}
      <section className="px-6 py-12 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto w-full text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            ¿Quieres conocer mi trayectoria antes de agendar?{" "}
            <Link
              href="/sobre-iria"
              className="font-medium text-zinc-900 dark:text-zinc-50 underline hover:no-underline"
            >
              Lee sobre Iria →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
