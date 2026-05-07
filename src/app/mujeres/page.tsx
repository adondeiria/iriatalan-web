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
  title: "Asesoría financiera para mujeres en México — Iria Talan / RIF",
  description:
    "Asesoría financiera diseñada por una mujer, para mujeres que toman decisiones: profesionistas, divorciadas, viudas y empresarias. Planes educacionales, PPR, fideicomisos, vida y GMM. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/mujeres` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/mujeres`,
    title: "Asesoría financiera para mujeres en México — Iria Talan",
    description:
      "Diseñada por una mujer, para mujeres que deciden. Profesionistas, divorciadas, viudas, empresarias.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/mujeres#audience`,
    audienceType: "Mujeres afluentes y HNWI México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

export default async function MujeresPage() {
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
      { name: "Asesoría para mujeres", path: "/mujeres" },
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
          <div className="relative aspect-[4/3] sm:aspect-[21/9] w-full">
            <Image
              src="/img/nichos/mujeres-hero.png"
              alt="Mujer mexicana CEO de 40 años en su oficina ejecutiva con vista a Paseo de la Reforma en Ciudad de México"
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
            {" / "}Asesoría para mujeres
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            Diseñada por una mujer, para mujeres que toman decisiones.
          </h1>
          <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            La industria de los seguros y la planeación patrimonial fue diseñada por hombres,
            para hombres. Y a veces se nota — en el lenguaje, en las suposiciones,
            en quién toma las decisiones por ti. Aquí no.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda consulta gratis 30 min
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
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Para quién es esta página
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
              Trabajo con mujeres en cuatro momentos vitales distintos. Cada uno
              con productos y prioridades específicas — no fórmulas de catálogo.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Perfil 1
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Profesionistas de alto ingreso
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  CXO, abogadas, doctoras, contadoras, consultoras 35-55. Decides sola, ganas tú,
                  quieres optimizar fiscalmente y proteger lo construido.
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Productos: PPR · Vida · GMM premium · Modalidad 40 IMSS
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Perfil 2
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Divorciadas con hijos
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  Pivote vital. Tu protección financiera y la de tus hijos ya no depende
                  de nadie más — depende de la estructura que armes ahora.
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Productos: Vida · Fideicomiso · Plan educacional · GMM
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Perfil 3
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Viudas con patrimonio heredado
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  Pasaste de “mi pareja sabía” a “yo decido”. Trabajamos a tu ritmo, sin presión,
                  para que entiendas y conserves lo que tienes.
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Productos: Inversión · Sucesión · Fideicomiso · GMM en retiro
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Perfil 4
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Empresarias y dueñas de negocio
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                  Doble dolor: protegerte tú + proteger el negocio que construiste.
                  La planeación financiera personal y empresarial no pueden ir por separado.
                </p>
                <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Productos: PPR · Key Person · GMM grupo · Sucesión empresarial
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Por qué trabajar con una asesora mujer
            </h2>
            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">No es una preferencia estética — es una realidad práctica.</strong>{" "}
                Hay temas que se hablan distinto entre mujeres: divorcio, custodia, viudez,
                herencia familiar, embarazo y maternidad, brechas salariales, presiones de cuidado
                no remunerado. Cuando esos temas son parte del cálculo financiero,
                el espacio importa.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">Lo que escucho seguido:</strong>{" "}
                “Es la primera vez que un asesor me deja preguntar lo que realmente quería preguntar.”
                “No me hablaste como si yo no entendiera.” “Me explicaste sin asumir que mi marido
                debe estar en la conversación.”
              </p>
              <p>
                Ese es el espacio. La metodología es la misma que usan los asesores top mundiales —
                MDRT Top of the Table, Yale Wealth Management, LSE — pero el espacio es diferente.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cómo trabajamos
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  1. Diagnóstico real (60 min, sin costo)
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Te escucho primero. Tu vida actual, tus dependientes económicos, tu horizonte,
                  lo que ya tienes y lo que te preocupa. Sin formularios genéricos.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  2. Recomendación de aseguradora(s) para tu perfil
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Trabajo con BUPA, MetLife, Allianz, Seguros Monterrey New York Life, AXA y GNP.
                  Según tu situación específica, te recomiendo la(s) más adecuada(s) para ti
                  — con pros, contras y costos a la vista. Decides tú.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  3. Acompañamiento personal continuo
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Tu asesora soy yo, no un call center. Renovaciones, cambios de carrier,
                  siniestros — hablas conmigo. Y revisamos anualmente sin costo para ajustar
                  a los cambios en tu vida.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  ¿Trabajas solo con mujeres?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  No. Trabajo con familias, parejas, hombres y mujeres. Esta página existe porque
                  muchas clientas mujeres buscan específicamente una asesora mujer y quería darles
                  un espacio donde se reconozcan.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Vengo recomendada por una amiga / clienta tuya. ¿Es muy distinto el proceso?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  No. Misma metodología, misma transparencia. Trabajo con las mismas
                  6 aseguradoras y la recomendación se ajusta a tu situación específica.
                  La única diferencia es que ya tenemos contexto compartido — eso ahorra tiempo en la primera sesión.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Estoy en proceso de divorcio. ¿Es buen momento para hablar contigo?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Es uno de los mejores. Las decisiones financieras que se toman durante y
                  después del divorcio impactan décadas. Hablar antes — incluso antes de firmar el
                  convenio — te da claridad sobre lo que estás negociando.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Mi pareja siempre llevó las finanzas. Yo no sé mucho. ¿Eso es problema?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Para nada. Es el caso más común — y es justo donde mi metodología te sirve más.
                  Vamos a tu ritmo, sin asumir conocimiento previo, sin condescendencia.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">
              Elige la que te acomode. No tienes que llegar con todas las respuestas — solo con las dudas.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Mensaje rápido
                </div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  WhatsApp
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">
                  {whatsapp}
                </div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                  Email reflexivo
                </div>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  Cuéntame por correo
                </div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">
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
                  Agenda 30 min gratis
                </div>
                <div className="mt-2 text-sm opacity-80">
                  Calendly · sin costo, sin compromiso
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
