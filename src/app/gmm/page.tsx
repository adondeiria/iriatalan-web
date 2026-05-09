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

const FAQS: FAQItem[] = [
  {
    question: "Mi GMM subió 18% este año, ya no me alcanza.",
    answerText:
      "Es la queja #1 que escucho hoy. Antes de cancelar, evaluemos las 3 vías defensivas (deducible · cambio carrier · red ajustada). Cancelar tu cobertura sería el peor escenario.",
  },
  {
    question: "Es muy caro.",
    answerText:
      "Para una familia de 4 con red top y cobertura internacional, rangos típicos en México 2025 van de $80,000 a $180,000 anuales (Aseguratemexico 2025). Un solo evento médico mayor sin cobertura supera fácilmente esa cifra anual entera.",
  },
  {
    question: "El IMSS / mi prestación me cubre.",
    answerText:
      "Son una capa importante — pero rara vez son suficiente capa única. Tiempos de respuesta variables y portabilidad limitada al cambiar de empleo. Para familias afluentes y HNWI funcionan mejor como complemento.",
  },
  {
    question: "Tengo dudas con el deducible.",
    answerText:
      "Es la decisión más importante. Bajo = prima alta, cobertura desde el primer peso. Alto = prima baja, asumes los primeros gastos tú. Depende de tu liquidez de emergencia y aversión al riesgo. Lo cuantificamos juntos.",
  },
  {
    question: "¿Qué hospitales cubre?",
    answerText:
      "Depende del carrier y plan. ABC + Médica Sur + Ángeles está en planes premium de varios. Christus Muguerza en otros. Te muestro la red exacta antes de decidir.",
  },
  {
    question: "¿Y si me niegan un siniestro?",
    answerText:
      "La CNSF regula y arbitra disputas. La mayoría de \"negativas\" son por documentación incompleta o por aplicar plan equivocado para el caso — cosas que se corrigen. Te acompaño personalmente en el proceso.",
  },
  {
    question: "¿Y la cobertura internacional?",
    answerText:
      "Crítica para HNWI con tratamientos en EUA o Europa. No todos los planes la incluyen. BUPA y MetLife tienen las redes internacionales más amplias.",
  },
];

export const metadata: Metadata = {
  title: "Gastos Médicos Mayores en México — Iria Talan / RIF",
  description:
    "GMM correcto: red hospitalaria, deducible y cobertura internacional adaptados. 6 aseguradoras AAA. Estrategia para renovaciones que subieron 15-20%. MDRT TOT · Asesora autorizada CNSF.",
  alternates: { canonical: `${SITE_URL}/gmm` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/gmm`,
    title: "Gastos Médicos Mayores — Iria Talan",
    description:
      "Si tu GMM subió este año, hay 3 vías para bajar prima sin perder cobertura crítica.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "FinancialProduct" as const,
    "@id": `${SITE_URL}/gmm#service`,
    name: "Gastos Médicos Mayores",
    description:
      "Cobertura médica privada estructurada: red hospitalaria, deducible, coaseguro y cobertura internacional adaptados al perfil del cliente. Comparación entre 6 aseguradoras AAA en México.",
    url: `${SITE_URL}/gmm`,
    provider: { "@id": `${SITE_URL}#financialservice` },
    category: "Seguros de salud privada",
    areaServed: { "@type": "Country", name: "México" },
  };
}

export default async function GmmPage() {
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
      { name: "Gastos Médicos Mayores", path: "/gmm" },
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
        <section className="relative w-full overflow-hidden">
          <div className="relative aspect-[21/9] w-full">
            <Image
              src="/img/servicios/gmm-hero.png"
              alt="Hombre mexicano recuperándose en hospital de Londres tras un accidente de viaje — cobertura GMM internacional"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="px-6 pt-12 pb-12 max-w-4xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-cream-light0">
            <Link href="/" className="hover:underline">Inicio</Link>
            {" / "}Gastos Médicos Mayores
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            La diferencia entre un GMM bien y uno mal estructurado no es la prima.
          </h1>
          <p className="mt-6 text-xl text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Es si tu familia recibe la red hospitalaria, el deducible y la cobertura
            internacional correctas para tu caso real. Trabajo con BUPA, MetLife,
            Allianz, Seguros Monterrey New York Life, AXA y GNP. Según tu situación
            específica, te recomiendo la(s) más adecuada(s) para ti.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda revisión de tu seguro
            </a>
            <Link
              href="/sobre-iria"
              className="inline-flex items-center justify-center rounded-full border border-warm-brown/20 dark:border-warm-brown/40 px-7 py-3.5 font-medium hover:bg-cream dark:hover:bg-coffee/40 transition"
            >
              Conoce a Iria
            </Link>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              ¿En cuál de estos dos momentos estás?
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Cada uno requiere una conversación distinta. Elige el que aplique a tu caso.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <a href="#defensivo" className="group p-7 rounded-2xl border-2 border-warm-brown/20 dark:border-warm-brown/40 hover:border-rif-rojo dark:hover:border-rif-rojo transition flex flex-col">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Si ya tienes GMM
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
                  &ldquo;Mi GMM subió 15-20% este año.&rdquo;
                </h3>
                <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed flex-1">
                  Es la queja #1 que escucho hoy. Hay 3 vías para bajar prima sin
                  perder cobertura crítica. No canceles antes de hablar.
                </p>
                <span className="mt-5 text-sm font-medium text-ink dark:text-cream-light group-hover:underline">
                  Estrategias defensivas →
                </span>
              </a>

              <a href="#ofensivo" className="group p-7 rounded-2xl border-2 border-warm-brown/20 dark:border-warm-brown/40 hover:border-rif-rojo dark:hover:border-rif-rojo transition flex flex-col">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                  Si aún no tienes GMM
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
                  &ldquo;¿Cuánto cuesta NO tenerlo?&rdquo;
                </h3>
                <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed flex-1">
                  Una intervención compleja en CDMX puede acumular cientos de miles
                  a millones de pesos sin previo aviso. Hagamos la cuenta correcta.
                </p>
                <span className="mt-5 text-sm font-medium text-ink dark:text-cream-light group-hover:underline">
                  Cómo elegir bien →
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Lo que mucha gente no sabe del GMM
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              Un GMM mal contratado cuesta lo mismo que uno bien contratado — pero el
              primero te deja sin cobertura cuando más lo necesitas. Estas son las
              6 variables que realmente importan.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Red hospitalaria</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  ¿Incluye ABC, Médica Sur, Ángeles, Christus Muguerza? La diferencia entre planes top y básicos.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Deducible</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  Impacto directo en tu liquidez al momento del siniestro. Decisión más importante.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Coaseguro y tope</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  Sin tope máximo, puede triplicar tu desembolso real en eventos largos.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Suma asegurada</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  Por enfermedad/accidente. No es lo mismo $5M que $30M.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Cobertura internacional</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  EUA, Europa — crítica para HNWI. BUPA y MetLife tienen las redes más amplias.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Exclusiones</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  Preexistencias, enfermedades crónicas, congénitas. La letra chica importa.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="defensivo" className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream dark:bg-coffee/40">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-cream-light0">
              Estrategia defensiva
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Si ya tienes GMM y te subió la prima
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              La inflación médica es real, los reajustes anuales son inevitables. Pero hay
              <strong className="text-ink dark:text-cream-light"> 3 vías concretas</strong> que
              pueden bajar tu prima sin perder cobertura crítica. Antes de cancelar — peor escenario —
              hagamos esta evaluación.
            </p>

            <div className="mt-10 space-y-6">
              <div className="p-6 rounded-2xl bg-cream-light dark:bg-espresso border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-1">Vía 1</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Optimizar el deducible
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Subir tu deducible reduce la prima sin afectar tu suma asegurada total.
                  Si tu liquidez de emergencia te lo permite, asumir un deducible más alto
                  en eventos chicos puede bajar tu prima 15-25%.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-cream-light dark:bg-espresso border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-1">Vía 2</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Cambio estratégico de carrier (sin perder antigüedad)
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Algunas aseguradoras te aceptan con conservación de antigüedad si vienes
                  de otro carrier reconocido. Esto puede ahorrarte el período de espera por
                  preexistencias y darte mejor prima por perfil.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-cream-light dark:bg-espresso border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-1">Vía 3</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Ajustar la red hospitalaria
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Si nunca te has atendido en hospitales top (ABC, Médica Sur, Ángeles), un
                  plan con red media puede ahorrarte 30-40% sin afectar la atención que sí usas.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="ofensivo" className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-cream-light0">
              Estrategia ofensiva
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Si aún no tienes GMM
            </h2>
            <div className="mt-6 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Una intervención médica privada compleja en CDMX (cirugía mayor, terapia intensiva,
                hospitalización oncológica) puede acumular varios cientos de miles a millones
                de pesos en cuestión de días. Una familia afluente puede ver borrado años
                de ahorro patrimonial sin previo aviso.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">El cálculo correcto:</strong>{" "}
                la prima anual de un GMM correcto rara vez supera el 5% del costo de un solo
                evento médico mayor. Para una familia de 4 con red top y cobertura internacional,
                rangos típicos en México 2025 van de $80,000 a $180,000 anuales según edades,
                deducible y carrier.
              </p>
              <p>
                <span className="block mt-3 mb-3 text-xs text-cream-light0 italic border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-3">
                Las cifras son ilustrativas y dependen del perfil, edad, aseguradora, producto, legislación vigente y evaluación individual.
              </span>
              <strong className="text-ink dark:text-cream-light">La pregunta no es &ldquo;¿es caro?&rdquo;.</strong>{" "}
                Es: ¿puedo absorber un evento de cientos de miles sin afectar mi plan financiero?
              </p>
              <p>
                El IMSS y las prestaciones laborales son una capa importante de protección — pero
                rara vez son suficiente capa única. Tiempos de respuesta del sistema público son
                variables, y los GMM laborales se quedan en la empresa al cambiar de empleo.
                Para familias afluentes y HNWI funcionan mejor como complemento.
              </p>
            </div>
          </div>
        </section>

        <section id="internacional" className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-cream-light0">
              Cobertura internacional
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              GMM internacional para HNWI
            </h2>
            <div className="mt-6 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Para patrimonios con tratamientos en EUA o Europa, contratar GMM solo nacional
                puede salir en millones cuando aparece el caso complejo. La diferencia entre
                BUPA o MetLife internacional vs un GMM nacional estándar no es cosmética —
                es de capa, de techo y de red hospitalaria internacional aceptada.
              </p>
              <div>
                <h3 className="font-semibold text-ink dark:text-cream-light mb-3">
                  Cuándo importa la cobertura internacional
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tratamientos oncológicos en MD Anderson, Mayo Clinic, Johns Hopkins</li>
                  <li>Cirugías cardiovasculares con surgeon ranking top global</li>
                  <li>Trasplantes complejos donde el tiempo de espera fuera de EUA es prohibitivo</li>
                  <li>Maternidad en hospitales de élite internacional</li>
                  <li>Vidas con residencia parcial en EUA, Europa o Canadá</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-ink dark:text-cream-light mb-3">
                  Carriers con redes internacionales más amplias
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-ink dark:text-cream-light">BUPA</strong> — red global muy amplia, especialmente Reino Unido, Europa y Asia</li>
                  <li><strong className="text-ink dark:text-cream-light">MetLife</strong> — red EUA muy fuerte, opciones flexibles de deducible</li>
                  <li><strong className="text-ink dark:text-cream-light">Allianz</strong> — cobertura europea premium</li>
                </ul>
              </div>
              <p>
                <strong className="text-ink dark:text-cream-light">Lo que cuesta NO tener:</strong>{" "}
                un solo evento mayor en EUA puede acumular varios millones de dólares en cuestión de
                semanas. La prima anual de un GMM internacional bien estructurado es una fracción de eso.
              </p>
              <p className="text-xs text-cream-light0 italic border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-3 mt-3">
                Las cifras de costos médicos son ilustrativas y dependen del país, hospital, tipo de evento, aseguradora, plan contratado y evaluación individual.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Cómo lo hacemos correcto contigo
            </h2>
            <div className="mt-10 space-y-8">
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  1. Análisis de tu perfil de riesgo médico (60 min)
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Edad, antecedentes familiares, condiciones preexistentes, hospitales donde
                  quieres ser atendida. Sin formularios genéricos.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  2. Recomendación de la(s) aseguradora(s) adecuada(s) para ti
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Trabajo con BUPA, MetLife, Allianz, Seguros Monterrey New York Life,
                  AXA y GNP. Según tu situación específica, te recomiendo la(s) más
                  adecuada(s) para ti.
                </p>
              </div>
              <div className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6">
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  3. Estructura final que tú apruebas
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Decides tú entre las opciones, con toda la información a la vista. Y cuando
                  llegue un siniestro, te acompaño personalmente — no te dejo sola con el call center.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Preguntas frecuentes
            </h2>
            <div className="mt-10 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Mi GMM subió 18% este año, ya no me alcanza.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es la queja #1 que escucho hoy. Antes de cancelar, evaluemos las 3 vías
                  defensivas (deducible · cambio carrier · red ajustada). Cancelar tu cobertura
                  sería el peor escenario.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Es muy caro.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Para una familia de 4 con red top y cobertura internacional, rangos típicos
                  en México 2025 van de $80,000 a $180,000 anuales (Aseguratemexico 2025).
                  Un solo evento médico mayor sin cobertura supera fácilmente esa cifra anual entera.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  El IMSS / mi prestación me cubre.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Son una capa importante — pero rara vez son suficiente capa única. Tiempos
                  de respuesta variables y portabilidad limitada al cambiar de empleo. Para
                  familias afluentes y HNWI funcionan mejor como complemento.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Tengo dudas con el deducible.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es la decisión más importante. Bajo = prima alta, cobertura desde el primer peso.
                  Alto = prima baja, asumes los primeros gastos tú. Depende de tu liquidez de
                  emergencia y aversión al riesgo. Lo cuantificamos juntos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Qué hospitales cubre?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Depende del carrier y plan. ABC + Médica Sur + Ángeles está en planes premium
                  de varios. Christus Muguerza en otros. Te muestro la red exacta antes de decidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Y si me niegan un siniestro?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  La CNSF regula y arbitra disputas. La mayoría de &ldquo;negativas&rdquo; son por documentación
                  incompleta o por aplicar plan equivocado para el caso — cosas que se corrigen.
                  Te acompaño personalmente en el proceso.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Y la cobertura internacional?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Crítica para HNWI con tratamientos en EUA o Europa. No todos los planes la
                  incluyen. BUPA y MetLife tienen las redes internacionales más amplias.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Tres formas de empezar
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85">
              Lo único que pido: que vengas con tus dudas, no con respuestas.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <a
                href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">Mensaje rápido</div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">WhatsApp</div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">{whatsapp}</div>
              </a>
              <a
                href={`mailto:${email}`}
                className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
              >
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">Email reflexivo</div>
                <div className="text-lg font-medium text-ink dark:text-cream-light">Cuéntame por correo</div>
                <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">{email}</div>
              </a>
              <a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Revisión directa</div>
                <div className="text-lg font-medium">Agenda sesión inicial</div>
                <div className="mt-2 text-sm opacity-80">Calendly · sin costo</div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
