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

export const metadata: Metadata = {
  title: "Asesoría financiera para mexicanos en el extranjero — Iria Talan / RIF",
  description:
    "Si vives en EUA, Europa o Canadá, México tiene productos financieros que tu país de residencia no: PPR deducible Art. 151 LISR, GMM con red premium nacional, planes educacionales y vida Art. 185 LISR. Asesoría a distancia, MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/mexicanos-en-el-extranjero` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/mexicanos-en-el-extranjero`,
    title: "Mexicanos en el extranjero — Iria Talan",
    description:
      "Vivir afuera no significa renunciar a productos financieros mexicanos. Para muchas familias, mantenerlos es la decisión más rentable.",
  },
};

const FAQS: FAQItem[] = [
  {
    question: "Vivo en EUA. ¿Puedo seguir teniendo PPR en México?",
    answerText:
      "Depende de tu situación fiscal. Si sigues tributando en México (residencia fiscal mexicana, ingresos de fuente mexicana, propiedades, empresa), el PPR sigue dándote deducción anual vía SAT. Si tu residencia fiscal cambió por completo a EUA, evaluamos juntos si conviene mantener el PPR existente o reestructurar. No es respuesta única — depende del caso.",
  },
  {
    question: "¿Cómo funciona la asesoría si no estoy en México?",
    answerText:
      "Por videollamada (Zoom, Teams, Google Meet). Documentos vía firma digital. Pólizas se envían a la dirección que indiques o se mantienen en la oficina hasta que vengas. Atiendo en español o inglés. Para temas que requieren firma física, coordinamos con tu próxima visita o uso poder notarial cuando aplica.",
  },
  {
    question: "Tengo hijos que estudiarán universidad en México o EUA. ¿Qué plan educacional sirve?",
    answerText:
      "Hay planes educacionales en peso o en dólar, dependiendo del destino y tu situación de ingreso. Para universidad nacional, suelen ser en peso. Para internacional (EUA, Europa), evaluamos opciones en dólar para no exponerte al riesgo cambiario. Te modelamos los dos escenarios antes de decidir.",
  },
  {
    question: "Mi GMM en EUA o Europa, ¿reemplaza el GMM mexicano?",
    answerText:
      "Casi nunca. El GMM mexicano (especialmente con BUPA o MetLife internacional) suele tener mejor red en CDMX, Monterrey y Guadalajara, y costo menor para tratamientos en México. Muchos de mis clientes residentes en EUA mantienen GMM mexicano para cuando vienen a tratamientos electivos o emergencias durante visitas familiares.",
  },
  {
    question: "Tengo patrimonio en México y herederos también en México. ¿Cómo planeo sucesión viviendo afuera?",
    answerText:
      "Es uno de los casos más comunes que veo. La estructura: un seguro de vida con designación irrevocable de beneficiario hacia un fideicomiso mexicano. Eso permite que tu patrimonio en México llegue a tus herederos sin atraparse en juicio sucesorio internacional ni en disputas de leyes cruzadas. Mucho más limpio que un testamento bi-jurisdiccional.",
  },
  {
    question: "¿Y si estoy en proceso de regresar a México?",
    answerText:
      "Es buen momento para revisar tu cobertura. Hay productos que conviene contratar antes de regresar (mientras todavía calificas en parámetros internacionales) y otros que conviene contratar al regresar (red mexicana, deducciones fiscales). Lo planeamos juntos.",
  },
];

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/mexicanos-en-el-extranjero#audience`,
    audienceType: "Mexicanos residentes en el extranjero (EUA, Europa, Canadá)",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

const PRODUCTOS = [
  {
    title: "PPR deducible — Art. 151 fracc V LISR",
    desc:
      "Si todavía tributas en México (residencia fiscal mexicana, ingresos de fuente mexicana, empresa propia, propiedades), el PPR sigue dándote deducción anual hasta ~$213,973 MXN (2026). Es una de las herramientas fiscales más rentables que tu país de residencia probablemente no replica.",
  },
  {
    title: "GMM con red premium nacional",
    desc:
      "Para cuando vienes a tratamientos electivos o emergencias en visitas familiares. BUPA, MetLife o Allianz con red ABC, Médica Sur, Ángeles, Christus Muguerza — costo menor que la equivalente en EUA o Europa para procedimientos planificados. Muchos clientes residentes en EUA lo mantienen como capa complementaria.",
  },
  {
    title: "Planes educacionales — peso o dólar",
    desc:
      "Para universidad nacional o internacional. Vehículo asegurador con suma asegurada: si tú llegas a faltar, el plan se completa solo. Modelable en peso (universidad MX) o en dólar (universidad en EUA/Europa) para no exponerte al riesgo cambiario.",
  },
  {
    title: "Vida con beneficio fiscal — Art. 185 LISR",
    desc:
      "Si tienes patrimonio o herederos en México, una póliza de vida con designación irrevocable hacia fideicomiso es la estructura más limpia para sucesión transfronteriza. Evita juicio sucesorio internacional y disputas entre jurisdicciones.",
  },
];

const PERFILES = [
  {
    label: "Mexicanos residentes en EUA",
    desc:
      "H-1B, Green Card, ciudadanos. Con ingresos en dólar pero familia, propiedades o empresa todavía en México.",
  },
  {
    label: "Mexicanos residentes en Europa",
    desc:
      "España, Reino Unido, Alemania, Francia. Donde los productos de planeación patrimonial son más rígidos o caros.",
  },
  {
    label: "Familias dual-resident",
    desc:
      "Padres en EUA, hijos estudiando en México (o viceversa). Necesitan estructura coherente entre las dos jurisdicciones.",
  },
  {
    label: "Mexicanos preparando regreso",
    desc:
      "Próximos a regresar a México por jubilación, oportunidad laboral o calidad de vida. Hay productos que conviene contratar antes de regresar.",
  },
];

export default async function MexicanosEnElExtranjeroPage() {
  const author = await sanityFetch<AuthorData | null>({
    query: SOBRE_IRIA_QUERY,
    tags: ["author"],
  }).catch(() => null);

  const ctaUrl = author?.socialLinks?.calendly ?? "https://calendly.com/iriatalan";
  const whatsapp = author?.socialLinks?.whatsapp ?? "+525512683401";
  const email = author?.socialLinks?.email ?? "soporte@talan.com.mx";

  const pageSchema = buildGraph(
    buildAudienceSchema(),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Mexicanos en el extranjero", path: "/mexicanos-en-el-extranjero" },
    ]),
    buildFAQPageSchema(FAQS)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-16 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}Mexicanos en el extranjero
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            Vivir afuera no significa renunciar a productos financieros mexicanos.
          </h1>
          <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Para muchas familias mexicanas residentes en EUA, Europa o Canadá, mantener (o
            contratar) ciertos productos en México es la decisión más rentable. México tiene
            herramientas fiscales y de planeación patrimonial que tu país de residencia
            probablemente no replica.
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
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Por qué importa
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Lo que México ofrece y tu país de residencia probablemente no
            </h2>
            <div className="mt-6 space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                EUA tiene 401(k), Roth IRA, HSA. Europa tiene fondos de pensión privados con
                tope variable. México tiene <strong className="text-zinc-900 dark:text-zinc-50">PPR
                con deducción del Art. 151 LISR</strong>, modalidades del IMSS, planes educacionales con
                vehículo asegurador, fideicomisos vía aseguradora con liquidez inmediata. Son
                herramientas distintas, no reemplazables.
              </p>
              <p>
                Si tu residencia fiscal sigue siendo mexicana — total o parcialmente — esas
                herramientas siguen aplicándote. Y aunque tu residencia fiscal haya cambiado
                por completo, mantener pólizas mexicanas para herencia, GMM en visitas, o cobertura
                de hijos que estudian en México suele ser financieramente más sano que duplicar
                esos productos en tu país de residencia.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Productos clave
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Cuatro herramientas que vale la pena evaluar viviendo afuera
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {PRODUCTOS.map((p, i) => (
                <div
                  key={p.title}
                  className="border-l-2 border-rif-rojo pl-5"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-rojo font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Para quién es
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Cuatro perfiles típicos
            </h2>
            <div className="mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2">
              {PERFILES.map((p) => (
                <div
                  key={p.label}
                  className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800"
                >
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {p.label}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Cómo funcionamos a distancia
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              No necesitas estar en México para trabajar conmigo
            </h2>
            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Sesiones por videollamada</strong> —
                Zoom, Teams o Google Meet. Atiendo en español o inglés según tu preferencia, en
                horario que se acomode a tu zona (CDMX / EUA / Europa).
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Documentos por firma digital</strong>{" "}
                cuando aplica. Las pólizas se envían a la dirección que indiques o se mantienen en
                la oficina hasta tu próxima visita.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Trámites que requieren firma física</strong>{" "}
                se coordinan con tu próxima visita a México, o se gestionan vía poder notarial cuando
                aplica. Acompañamiento real, no formularios sueltos.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Acompañamiento en siniestros</strong>{" "}
                — si pasa algo y tú estás afuera, soy yo quien va al hospital, al centro de
                atención o a la aseguradora. No te dejo sola con un call center.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Preguntas frecuentes
            </h2>
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

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              La sesión inicial es por videollamada, sin compromiso.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Mensaje rápido</div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">WhatsApp</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">{whatsapp}</div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Email reflexivo</div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Cuéntame por correo</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">{email}</div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Videollamada</div>
                <div className="text-lg font-medium">Agenda sesión inicial</div>
                <div className="mt-2 text-sm opacity-80">Calendly · sin compromiso</div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
