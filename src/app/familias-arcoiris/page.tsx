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
  title: "Asesoría financiera para familias arcoíris en México — Iria Talan / RIF",
  description:
    "Planeación financiera y patrimonial para familias diversas con hijos: seguros de vida, fideicomisos, planes educacionales y estructuras de tutela diseñadas para que la ley reconozca a tu familia tal como es. MDRT Top of the Table.",
  alternates: { canonical: `${SITE_URL}/familias-arcoiris` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/familias-arcoiris`,
    title: "Asesoría financiera para familias arcoíris — Iria Talan",
    description:
      "Estructura legal y patrimonial diseñada para familias diversas con hijos en México.",
  },
};

function buildAudienceSchema() {
  return {
    "@type": "Audience" as const,
    "@id": `${SITE_URL}/familias-arcoiris#audience`,
    audienceType: "Familias LGBTQ+ con hijos en México",
    geographicArea: { "@type": "Country", name: "México" },
  };
}

export default async function FamiliasArcoirisPage() {
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
      { name: "Familias arcoíris", path: "/familias-arcoiris" },
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
              src="/img/nichos/familias-arcoiris-hero.png"
              alt="Familia mexicana con dos papás del mismo sexo y sus hijos en un momento cotidiano en casa"
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
            {" / "}Familias arcoíris
          </p>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
            Tu familia construida con amor merece estructura legal y financiera igual de sólida.
          </h1>
          <p className="mt-6 text-xl text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
            Planeación patrimonial, seguros y fideicomisos diseñados específicamente
            para familias diversas con hijos en México. Para que el día que tú no estés,
            la ley reconozca a tu familia tal como tú la construiste.
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
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              El problema que pocos asesores entienden
            </h2>
            <div className="mt-8 space-y-6 text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p>
                Las leyes mexicanas de sucesión, herencia, tutela y beneficiarios
                fueron escritas asumiendo una familia: papá, mamá, hijos biológicos.
                Cuando tu familia no encaja en ese molde —porque tienes una pareja
                del mismo sexo, hijos adoptados, hijos biológicos de uno de los dos,
                co-parentalidad— las estructuras legales por default no protegen lo
                que tú llamarías familia.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">El riesgo concreto:</strong>{" "}
                si pasa algo y no estructuraste correctamente, tu pareja puede no ser
                reconocida como beneficiaria principal. Tu hijo puede ser reclamado
                por familiares biológicos lejanos. Tu testamento puede ser disputado
                si no está blindado.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-50">La buena noticia:</strong>{" "}
                todo esto se resuelve con planeación adecuada. Combinación correcta de
                seguro de vida con beneficiario designado, fideicomiso testamentario,
                tutela legal documentada, plan educacional con titularidad correcta.
                No es complicado — solo requiere asesoría que entienda tu realidad.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Lo que típicamente estructuramos juntos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Seguros de vida con beneficiario blindado
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Designación irrevocable de pareja e hijos. Imposible disputar por
                  familiares biológicos no deseados.
                </p>
                <Link href="/seguros-vida" className="mt-3 inline-block text-sm font-medium underline">
                  Más sobre seguros de vida →
                </Link>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Fideicomiso testamentario para hijos
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Instrumento legal que trasciende disputas familiares. Si pasa algo,
                  el patrimonio queda protegido específicamente para tus hijos —
                  con reglas que tú diseñas.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Plan educacional con titularidad clara
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Ahorro para universidad de tus hijos con estructura que sobrevive a
                  cualquier evento adverso. SEGUBECA y otros instrumentos.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  GMM familiar correcto
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  Cobertura médica de pareja + hijos en planes que reconocen
                  estructura familiar diversa. No todas las aseguradoras lo manejan
                  igual — yo te muestro cuáles sí.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Cómo trabajamos
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  1. Conversación honesta sobre tu estructura familiar
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Quiénes son tu pareja, tus hijos, las personas que dependen
                  económicamente de ti. Sin juicios, sin que tengas que explicar
                  o justificar nada. Solo claridad sobre a quién quieres proteger.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  2. Diseño de estructura blindada
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Combinamos los instrumentos correctos (vida + fideicomiso + educacional + GMM)
                  para que el resultado total proteja exactamente a quien quieres proteger,
                  sin importar lo que diga el código civil por default.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  3. Coordinación con notario y/o abogado
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Si la estructura requiere instrumentos legales (testamento, fideicomiso,
                  poderes), trabajo con notarías y despachos especializados en familias
                  diversas. No quedas solo coordinando todo.
                </p>
              </div>
              <div className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  4. Revisión periódica
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  La ley mexicana ha avanzado mucho en reconocimiento de familias diversas
                  en los últimos años. Revisamos anualmente para aprovechar nuevas figuras
                  legales que te protejan mejor.
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
                  ¿Por qué necesito asesoría especializada y no cualquier asesor?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Porque las estructuras legales y de beneficiarios para familias diversas
                  con hijos requieren combinaciones específicas que muchos asesores generales
                  no conocen o no priorizan. La diferencia se nota el día que algo pasa.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Mi pareja y yo no estamos casados legalmente. ¿Eso es problema?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  No con la estructura correcta. Hay instrumentos legales (designación
                  irrevocable de beneficiario en seguros de vida, fideicomisos, testamento
                  específico) que te permiten proteger a tu pareja independientemente del
                  estatus civil. Lo armamos con eso en cuenta.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Adoptamos a nuestros hijos hace pocos años. ¿La estructura cambia?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Si la adopción es legal, los hijos adoptados tienen los mismos derechos
                  hereditarios que los biológicos. Aún así, recomiendo blindar con seguro
                  de vida y fideicomiso para evitar cualquier disputa de familiares biológicos
                  de cualquiera de los dos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Soy madre/padre soltero/a por elección. ¿También aplica?
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  Sí — y es un perfil que cada vez veo más. La estructura cambia ligeramente
                  (no hay segunda figura paterna/materna) pero los principios son los mismos:
                  proteger a tu hijo financiera y legalmente sin importar quién quede después.
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
              No tienes que llegar con todas las respuestas — solo con tus dudas.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
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
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
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
