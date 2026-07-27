import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { type PortableTextBlock } from "@portabletext/react";

import { PortableTextRenderer } from "@/components/portable-text";
import { YouTubeFacade } from "@/components/youtube-embed";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildFAQPageSchema,
  buildGraph,
  buildVideoSchema,
  type ArticleVideoData,
  type FAQItem,
} from "@/lib/seo";
import { FALLBACK_AUTHOR } from "@/lib/author";
import { WA_MESSAGES, waHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: { absolute: "Sobre Iria Talan — Asesora Patrimonial y de Seguros" },
  description:
    "Conoce a Iria Talan, Asesora Patrimonial y de seguros con +18 años ayudando a familias a proteger su patrimonio, su salud y su retiro. Formación en Yale School of Management (Executive Education). Autorizada CNSF.",
  alternates: { canonical: "/sobre-iria" },
  openGraph: {
    title: "Sobre Iria Talan — Asesora Financiera RIF",
    // Sin LSE (decisión de Iria, Día 6): el MBA Essentials es un curso ejecutivo
    // corto y no va junto a Yale. Además el "·" hacía que "Wealth Management"
    // colgara de las dos escuelas, y eso es falso — LSE fue MBA Essentials.
    description:
      "Wealth Management por Yale School of Management (Exec. Ed.) · MDRT Top of the Table · AMASFAC · CNSF. Especialista en seguros de vida, GMM y planeación patrimonial.",
    url: "/sobre-iria",
  },
};

// FALLBACK_AUTHOR vive en `@/lib/author`: el layout también lo necesita para
// emitir los nodos Person / FinancialService del grafo global.

/**
 * FAQs de entidad — la superficie que responden los motores de IA cuando
 * alguien pregunta "¿quién es Iria Talan?" o "¿me recomiendas un asesor de
 * seguros en México?". Respuestas autocontenidas de 40-60 palabras: cada una
 * debe funcionar como cita aislada, sin el resto de la página.
 *
 * Toda afirmación aquí es verificable contra credentials/carriers de arriba.
 * Precisión importante: son 6 aseguradoras en total, 5 de ellas con GMM
 * (Allianz no comercializa gastos médicos mayores).
 *
 * Es una función y no una constante porque la respuesta de la oficina toma la
 * dirección de `author` (Sanity). Cuando estaba escrita a mano, la página se
 * contradecía sola: la FAQ decía una dirección y la tarjeta de contacto —que sí
 * lee de Sanity— mostraba otra. En la página cuyo trabajo es dar datos
 * verificables, eso es justo lo que no puede pasar.
 */
function buildSobreIriaFaqs(author: AuthorData): FAQItem[] {
  const oficina = author.officeAddress ?? "Ciudad de México";
  return [
    {
      question: "¿Quién es Iria Talan?",
      answerText:
        "Iria Talan es asesora patrimonial y agente de seguros independiente en México, con más de 18 años de experiencia. Está autorizada por la Comisión Nacional de Seguros y Fianzas (CNSF) con cédula V388618 desde 2008. Se especializa en seguros de vida, gastos médicos mayores, retiro y planeación patrimonial. Atiende desde Ciudad de México, en español e inglés.",
    },
    {
      question: "¿Iria Talan es independiente o trabaja para una aseguradora?",
      answerText:
        "Es independiente. No trabaja para una sola aseguradora: está autorizada con seis y compara sus condiciones generales para recomendar la que conviene a cada cliente. Esa es la diferencia frente a un agente cautivo, que solo puede ofrecer los productos de la compañía que representa.",
    },
    {
      question: "¿Con qué aseguradoras trabaja Iria Talan?",
      answerText:
        "Con seis aseguradoras autorizadas en México: GNP, AXA, MetLife, Seguros Monterrey New York Life, BUPA y Allianz. Cinco de ellas ofrecen gastos médicos mayores —Allianz no comercializa GMM—. Es Asesora Diamante en GNP Seguros y en Seguros Monterrey New York Life.",
    },
    {
      question: "¿Cómo verifico la cédula de Iria Talan ante la CNSF?",
      answerText:
        "Su cédula es V388618, vigente desde 2008. Puedes verificarla en el registro público de agentes y ajustadores de la Comisión Nacional de Seguros y Fianzas, en agentesajustadores.cnsf.gob.mx. En México, todo agente de seguros debe estar autorizado por la CNSF para poder asesorarte y emitir pólizas.",
    },
    {
      question: "¿Qué es MDRT Top of the Table y por qué importa?",
      answerText:
        "Million Dollar Round Table (MDRT) es la asociación internacional que reconoce al segmento de mayor desempeño de la industria de seguros, y Top of the Table es su nivel más alto. Iria Talan es miembro desde 2008 y Top of the Table en MDRT. Para un cliente significa que trabaja con una asesora del grupo más alto del sector, no que pague más por ello.",
    },
    {
      question: "¿Qué es el 8° lugar nacional de AMASFAC?",
      answerText:
        "AMASFAC es la Asociación Mexicana de Agentes de Seguros y Fianzas, la red de agentes más grande del país, fundada en 1958. Su Trofeo AMASFAC reconoce a los mejores agentes de Vida y Gastos Médicos Mayores de México, y en 2024 Iria Talan ocupó el 8° lugar nacional. Es una evaluación de sus pares del gremio, no de la aseguradora que le paga comisión.",
    },
    {
      question: "¿Qué significa que Iria Talan sea Asesora Diamante?",
      answerText:
        "Diamante es el nivel más alto que una aseguradora otorga a sus agentes. Iria Talan lo tiene en dos a la vez: en Seguros Monterrey New York Life desde 2008 y en GNP Seguros desde 2016 — casi dos décadas sosteniéndolo en ambas. A diferencia del reconocimiento de AMASFAC, que viene del gremio, este lo concede cada aseguradora sobre su propia cartera.",
    },
    {
      question: "¿En qué se especializa Iria Talan?",
      answerText:
        "En seguros de vida, gastos médicos mayores, planeación de retiro (PPR y Modalidad 40 del IMSS), planes educacionales, fideicomisos y planeación patrimonial. Atiende además casos que la mayoría de los asesores no cubre: familias con hijos neurodivergentes, familias diversas, mexicanos viviendo en el extranjero y extranjeros residentes en México.",
    },
    {
      question: "¿Qué formación académica tiene Iria Talan?",
      answerText:
        "Es Ingeniera Mecánica Administradora por el Tecnológico de Monterrey. Cursó Wealth Management Theory & Practice en Yale School of Management (2019) y MBA Essentials en London School of Economics, ambos en educación ejecutiva. Tiene también un Diplomado en Análisis Financiero por la Bolsa Mexicana de Valores.",
    },
    {
      question: "¿Cuánto cuesta una asesoría con Iria Talan?",
      answerText:
        "La sesión inicial de 30 minutos no tiene costo ni compromiso. Como agente de seguros, su ingreso proviene de la comisión que paga la aseguradora sobre la póliza contratada, no de un honorario que cobre al cliente. El precio de tu póliza es el mismo que si la contrataras directamente.",
    },
    {
      question: "¿Atiende clientes fuera de la Ciudad de México?",
      answerText: `Sí. Su oficina está en ${oficina}, pero atiende en todo México de forma remota, por videollamada o WhatsApp. También asesora a mexicanos que viven en el extranjero y a extranjeros con residencia en México, en español o en inglés.`,
    },
  ];
}

export default async function SobreIriaPage() {
  const author =
    (await sanityFetch<AuthorData | null>({
      query: SOBRE_IRIA_QUERY,
      tags: ["author"],
    }).catch(() => null)) ?? FALLBACK_AUTHOR;

  const ctaUrl = "/contacto#agendar";

  // Video de presentación del canal. Va cableado aquí (no en Sanity) porque
  // /sobre-iria no es un artículo: su contenido vive entre el documento `author`
  // y esta página.
  //
  // Es el par más valioso de los tres que quedaron identificados: /sobre-iria es
  // la página que decide si un motor de IA la recomienda POR NOMBRE, y un video
  // donde ella se presenta a cámara es la clase de señal de entidad que no se
  // puede fabricar con texto. Datos tomados del canal, no de memoria:
  // publicado 2026-06-03, 224 s = PT3M44S.
  const videoPresentacion: ArticleVideoData = {
    videoId: "Dpo_No0sBuk",
    name: "Iria Talan, Asesora Patrimonial y de Seguros — mi historia",
    description:
      "Iria Talan se presenta: cómo llegó a la asesoría patrimonial, con qué aseguradoras trabaja y qué tipo de acompañamiento da a las familias que asesora.",
    uploadDate: "2026-06-03",
    duration: "PT3M44S",
  };

  // Una sola fuente para las FAQs: el mismo array alimenta el FAQPage del
  // JSON-LD y lo que se ve en pantalla, así que no pueden divergir.
  const faqs = buildSobreIriaFaqs(author);

  // Person y FinancialService ya vienen del grafo global del layout — emitirlos
  // otra vez aquí duplicaba los mismos @id en la página.
  const pageSchema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Sobre Iria", path: "/sobre-iria" },
    ]),
    buildFAQPageSchema(faqs),
    buildVideoSchema(videoPresentacion, "/sobre-iria")
  );

  const credentialsByCategory = (author.credentials ?? []).reduce(
    (acc, c) => {
      const key = c.category ?? "otro";
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    },
    {} as Record<string, NonNullable<typeof author.credentials>>
  );

  const categoryLabels: Record<string, string> = {
    industria: "Industria de Seguros",
    academica: "Educación",
    regulatoria: "Regulatorio",
    carrier: "Aseguradoras",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <main className="flex flex-col">
        <section className="px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 max-w-5xl mx-auto w-full">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.18em] text-rif-rojo">
            <Link href="/" className="hover:opacity-80 transition">
              Inicio
            </Link>
            {" / "}Sobre Iria
          </p>
          <div className="mt-10 grid gap-10 sm:grid-cols-[280px_1fr] sm:items-start">
            {author.photo?.asset?.url && (
              <div className="relative w-full max-w-[240px] mx-auto sm:max-w-none aspect-[4/5] rounded-3xl overflow-hidden bg-warm-brown/15 dark:bg-warm-brown/30">
                <Image
                  src={author.photo.asset.url}
                  alt={author.photo.alt ?? author.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  className="object-cover"
                  priority
                />
              </div>
            )}
            <div>
              <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
                Cédula CNSF V388618 · Autorizada desde 2008
              </p>
              <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
                {author.name}
              </h1>
              <p className="mt-4 text-lg sm:text-xl italic text-warm-brown/85 dark:text-cream-light/65 max-w-xl">
                {author.title}
              </p>
              {author.bio && (
                <p className="mt-8 text-base sm:text-lg leading-relaxed text-warm-brown dark:text-cream-light/85 max-w-2xl">
                  {author.bio}
                </p>
              )}

              {author.longBio && Array.isArray(author.longBio) && author.longBio.length > 0 && (
                <div className="mt-10 max-w-3xl">
                  <PortableTextRenderer value={author.longBio as PortableTextBlock[]} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-6 pb-12 sm:pb-16 max-w-3xl mx-auto w-full">
          <YouTubeFacade
            video={videoPresentacion}
            eyebrow="Conóceme en video"
            fallbackTitle={author.name}
          />
        </section>

        {author.credentials && author.credentials.length > 0 && (
          <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight leading-tight text-ink dark:text-cream-light">
                Credenciales y autoridad
              </h2>
              <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65">
                Cada credencial es verificable. Puedes pedirme la prueba de cualquiera.
              </p>

              <div className="mt-10 space-y-12">
                {Object.entries(credentialsByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <h3 className="text-xs uppercase tracking-wider text-rif-gris mb-4">
                      {categoryLabels[cat] ?? cat}
                    </h3>
                    <ul className="space-y-3">
                      {items.map((c, i) => (
                        <li
                          key={`${cat}-${i}`}
                          className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4"
                        >
                          <span className="font-medium text-ink dark:text-cream-light">
                            {c.title}
                          </span>
                          {c.issuer && (
                            <span className="text-warm-brown/85 dark:text-cream-light/65">
                              {c.issuer}
                              {c.year ? ` · ${c.year}` : ""}
                            </span>
                          )}
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline text-warm-brown dark:text-cream-light/85"
                            >
                              Verificar
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {author.carriers && author.carriers.length > 0 && (
          <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight leading-tight text-ink dark:text-cream-light">
                Aseguradoras autorizadas
              </h2>
              <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65">
                Trabajo con estas aseguradoras. Según tu situación específica, te recomiendo la(s) más adecuada(s) para ti.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {author.carriers.map((c) => (
                  <span
                    key={c}
                    className="px-4 py-2 rounded-full border border-warm-brown/20 dark:border-warm-brown/40 text-warm-brown dark:text-cream-light/85 font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {author.specialties && author.specialties.length > 0 && (
          <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight leading-tight text-ink dark:text-cream-light">
                Especialidades
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {author.specialties.map((s) => (
                  <li
                    key={s}
                    className="text-warm-brown dark:text-cream-light/85 flex items-baseline gap-2"
                  >
                    <span className="text-cream-light/65">·</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Preguntas frecuentes
            </h2>
            <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65">
              Lo que suelen preguntarme antes de la primera sesión.
            </p>
            <div className="mt-10 space-y-8">
              {faqs.map((f) => (
                <div
                  key={f.question}
                  className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6"
                >
                  <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                    {f.question}
                  </h3>
                  <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                    {f.answerText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Contacto
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {author.socialLinks?.whatsapp && (
                <a
                  href={waHref(author.socialLinks.whatsapp, WA_MESSAGES.sobreIria)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                    WhatsApp
                  </div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light">
                    {author.socialLinks.whatsapp}
                  </div>
                  <div className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                    Atención a clientes de RIF
                  </div>
                </a>
              )}
              {author.socialLinks?.email && (
                <a
                  href={`mailto:${author.socialLinks.email}`}
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                    Email
                  </div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light break-all">
                    {author.socialLinks.email}
                  </div>
                </a>
              )}
              <a
                href="/contacto#agendar"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Agenda tu sesión
                </div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">
                  Sesión inicial · 30 min
                </div>
              </a>
              {author.officeAddress && (
                <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                    Oficina
                  </div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light leading-snug">
                    {author.officeAddress}
                  </div>
                </div>
              )}
            </div>
            {author.socialLinks && (
              <div className="mt-8 flex gap-4 flex-wrap">
                {author.socialLinks.linkedin && (
                  <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-warm-brown dark:text-cream-light/85 hover:underline">LinkedIn →</a>
                )}
                {author.socialLinks.instagram && (
                  <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-warm-brown dark:text-cream-light/85 hover:underline">Instagram →</a>
                )}
                {author.socialLinks.facebook && (
                  <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-warm-brown dark:text-cream-light/85 hover:underline">Facebook →</a>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-14 sm:py-20 max-w-4xl mx-auto w-full">
          <div className="rounded-3xl bg-coffee dark:bg-cream text-cream-light dark:text-ink p-10 sm:p-14 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿Hablamos?
            </h2>
            <p className="mt-3 opacity-80 max-w-md mx-auto">
              Sesión inicial de 30 min. Te escucho primero, recomiendo después.
              {author.officeAddress
                ? ` Oficina en ${author.officeAddress}.`
                : ""}
            </p>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-cream dark:bg-coffee text-ink dark:text-cream-light px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda sesión inicial
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
