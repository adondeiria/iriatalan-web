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
  buildHreflangAlternates,
  SITE_URL,
  type FAQItem,
} from "@/lib/seo";
import { WA_MESSAGES, waHref } from "@/lib/whatsapp";
import { RelatedArticles } from "@/components/blog/related-articles";

const FAQS: FAQItem[] = [
  {
    question: "¿Qué GMM es mejor: GNP, BUPA, AXA, MetLife o SMNYL?",
    answerText:
      "Ninguna es \"mejor\" en absoluto — la mejor para ti depende de tu perfil (edad, hospitales donde quieres atenderte, necesidad internacional, presupuesto, preexistencias declaradas) y del plan específico que contrates. Dos precisiones que cambian la comparación: la red hospitalaria no es un atributo fijo de cada aseguradora, porque las cinco manejan varios niveles de red y el nivel lo decide el plan que pagas; y de GMM internacional solo dos tienen oferta, BUPA y GNP. La elección correcta requiere comparar cuadros médicos, deducibles, coaseguros, plazos de espera para preexistencias y costos referenciales para tu edad y suma asegurada — eso es exactamente lo que hacemos en la sesión inicial.",
  },
  {
    question: "¿Cubre el GMM enfermedades preexistentes?",
    answerText:
      "Las pólizas individuales y familiares de GMM en México generalmente NO cubren preexistencias declaradas al momento de contratar — esto aplica a la mayoría de las aseguradoras AAA del mercado. Algunas pólizas colectivas (GMM grupo de empresa) sí pueden cubrir preexistencias tras periodos de espera (24-48 meses son típicos, varían por aseguradora y diagnóstico), pero no es el estándar individual. Lo crítico: declarar TODO al contratar — diagnósticos, tratamientos, medicamentos — porque si la aseguradora descubre después que omitiste algo, puede negar el siniestro relacionado o cancelar por omisión dolosa. Mejor declarar y saber qué queda excluido desde el día 1, que tener falsa cobertura. Si tienes una preexistencia importante, hay aseguradoras y planes específicos que aceptan condiciones que otros rechazan — la sesión inicial identifica tus mejores opciones.",
  },
  {
    question: "¿A qué edad conviene contratar GMM y hasta qué edad se renueva?",
    answerText:
      "Lo más pronto posible — antes de cualquier diagnóstico que después se convierta en preexistencia y antes de cumplir edades donde el costo sube significativamente. Los costos suben con la edad de contratación de forma no lineal: contratar a los 30 vs a los 50 puede significar diferencias importantes en el costo total del plan a lo largo de la vida. Muchos planes del mercado contemplan renovación vitalicia, sujeta a las condiciones de la póliza, el pago oportuno y la no omisión en la declaración. Las edades máximas de alta varían por aseguradora — conviene revisar antes de cumplir la edad límite de tu aseguradora preferida.",
  },
  {
    question: "¿Cubre el GMM maternidad y parto?",
    answerText:
      "Sí, pero con periodo de espera — típicamente 10-12 meses desde la contratación o ampliación, según la aseguradora y plan. Esto significa que si quieres que tu GMM cubra el parto, debes contratar antes de embarazarte (o estar dentro del periodo de carencia que permita el plan). La cobertura del recién nacido (alta médica + primeros días de hospitalización) generalmente es un módulo aparte que conviene contratar al avisar el embarazo, dentro del plazo que marque la póliza. Las condiciones finales se rigen por la póliza emitida por la aseguradora.",
  },
  {
    question: "¿Cuánto cuesta un GMM individual o familiar en 2026?",
    answerText:
      "El costo depende de edad de cada asegurado, deducible, coaseguro, red hospitalaria, suma asegurada, preexistencias declaradas, y si incluye cobertura internacional. Como referencia general 2026, una familia mexicana típica con plan de red top y cobertura internacional puede tener costos anuales en el rango de $80,000 a $180,000 MXN (rangos referenciales según fuentes del sector); planes con red restringida y deducibles más altos pueden bajar considerablemente el costo. La cifra exacta requiere cotización individual con cada aseguradora — eso lo hacemos en la sesión inicial.",
  },
  {
    question: "¿Puedo mantener mi GMM si cambio de trabajo o me independizo?",
    answerText:
      "Sí — si tu GMM es póliza individual a tu nombre (no GMM colectivo de tu empleador), es totalmente portátil. Tú eres el contratante, tú pagas, tú decides cuándo renovar y con qué aseguradora. Esta es una de las razones por las que conviene NO depender solo del GMM colectivo del trabajo: si te despiden, renuncias o tu empresa cambia aseguradoras o condiciones, te quedas sin cobertura justo cuando puede ser difícil contratar uno individual (por edad o preexistencias adquiridas mientras estabas en el grupo). Estrategia recomendada: GMM individual base + grupo del empleador como complemento.",
  },
  {
    question: "Mi GMM subió 18% este año, ya no me alcanza.",
    answerText:
      "Es la queja #1 que escucho hoy. Antes de cancelar, evaluemos las 3 vías defensivas (deducible · optimizar tu plan actual · red ajustada). Cancelar tu cobertura sería el peor escenario.",
  },
  {
    question: "Es muy caro.",
    answerText:
      "Para una familia de 4 con red top y cobertura internacional, rangos típicos en México 2025 van de $80,000 a $180,000 anuales (Aseguratemexico 2025). Un solo evento médico mayor sin cobertura supera fácilmente esa cifra anual entera.",
  },
  {
    question: "El IMSS / mi prestación me cubre.",
    answerText:
      "Son una capa importante — pero rara vez son suficiente capa única. Tiempos de respuesta variables y portabilidad limitada al cambiar de empleo. Para familias afluentes y con patrimonio funcionan mejor como complemento.",
  },
  {
    question: "Tengo dudas con el deducible.",
    answerText:
      "Es la decisión más importante. Bajo = costo alto, cobertura desde el primer peso. Alto = costo bajo, asumes los primeros gastos tú. Depende de tu liquidez de emergencia y aversión al riesgo. Lo cuantificamos juntos.",
  },
  {
    question: "¿Qué hospitales cubre?",
    answerText:
      "Depende de la aseguradora y plan. ABC + Médica Sur + Ángeles está en planes premium de varios. Christus Muguerza en otros. Te muestro la red exacta antes de decidir.",
  },
  {
    question: "¿Y si me niegan un siniestro?",
    answerText:
      "La CNSF regula y arbitra disputas. Muchas controversias se originan en documentación incompleta, exclusiones o la declaración inicial — por eso la revisión previa es crítica. Varias se corrigen acompañando bien el proceso, y te acompaño personalmente.",
  },
  {
    question: "¿Y la cobertura internacional?",
    answerText:
      "Hay que separar dos cosas. Emergencia en el extranjero: las cinco aseguradoras la contemplan hasta por USD $100,000 por evento, con deducible de USD $100, aunque en la mayoría tiene costo extra sobre la prima y no viene incluida por defecto. Importante: hay que avisar a la aseguradora en el momento del siniestro, no al regresar a México — ese aviso es lo que activa la cobertura. Plan internacional: de las cinco, solo dos lo manejan —BUPA y GNP— y te dan una red de hospitales en el extranjero más, dentro de México, todos los hospitales y clínicas autorizados por COFEPRIS. La emergencia responde a lo imprevisto durante un viaje; el plan internacional te deja elegir tratarte fuera para algo programado, como una cirugía compleja o un protocolo oncológico.",
  },
];

export const metadata: Metadata = {
  title: "¿Qué cubre un Seguro de Gastos Médicos Mayores?",
  description:
    "Qué cubre, cómo funciona y cuánto cuesta al año un GMM en México. Trabajo con 5 aseguradoras AAA para encontrar tu mejor plan, nacional e internacional.",
  alternates: buildHreflangAlternates(
    "/gmm",
    "/gmm",
    "/international-health-insurance",
  ),
  openGraph: {
    type: "website",
    url: `${SITE_URL}/gmm`,
    title: "Gastos Médicos Mayores — Iria Talan",
    description:
      "Si tu GMM subió este año, hay 3 vías para bajar el costo sin perder cobertura crítica.",
  },
};

function buildServiceSchema() {
  return {
    "@type": "FinancialProduct" as const,
    "@id": `${SITE_URL}/gmm#service`,
    name: "Gastos Médicos Mayores",
    description:
      "Cobertura médica privada estructurada: red hospitalaria, deducible, coaseguro y cobertura internacional adaptados al perfil del cliente. Comparación entre 5 aseguradoras AAA en México.",
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

  const ctaUrl = "/contacto#agendar";
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
              src="/img/servicios/gmm-hero.jpg"
              alt="Hombre mexicano recuperándose en hospital de Londres tras un accidente de viaje — cobertura GMM internacional"
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
            {" / "}Gastos Médicos Mayores
          </p>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
            Gastos Médicos Mayores en México, estructurados para proteger tu patrimonio.
          </h1>
          <h2 className="mt-6 font-serif text-2xl sm:text-3xl tracking-tight leading-snug text-warm-brown dark:text-cream-light/90 max-w-2xl">
            La diferencia entre un GMM bien y uno mal estructurado no es el costo: es si
            tu familia recibe la red hospitalaria, el deducible y la cobertura
            internacional correctas para tu caso real.
          </h2>
          <p className="mt-6 text-lg text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Soy corredora independiente de 6 aseguradoras AAA en México, y{" "}
            <strong className="font-semibold text-ink dark:text-cream-light">5 de ellas venden gastos médicos mayores</strong>:
            BUPA, MetLife, Seguros Monterrey New York Life, AXA y GNP. La sexta es
            Allianz, que en México no ofrece GMM — solo vida y ahorro. Según tu
            situación específica, te recomiendo la(s) más adecuada(s) para ti.
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

          <p className="mt-5 text-sm text-warm-brown/85 dark:text-cream-light/65 max-w-2xl leading-relaxed">
            Sesión inicial de 60 min, sin costo. Sales con una comparación de 2–3
            estructuras posibles según red, deducible y cobertura internacional para tu perfil.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-xs text-warm-brown/80 dark:text-cream-light/60">
            <span className="flex items-center gap-3">
              <Image src="/img/logos/mdrt-official.svg" alt="MDRT — Million Dollar Round Table" width={28} height={27} className="h-7 w-auto opacity-90" />
              <Image src="/img/logos/amasfac.svg" alt="AMASFAC" width={75} height={28} className="h-7 w-auto opacity-90" />
            </span>
            <span className="leading-snug">
              Wealth Management — Yale School of Management (Exec. Ed.) · MDRT Top of the Table · 8vo Lugar Nacional AMASFAC · Asesora Diamante GNP y Seguros Monterrey New York Life · Cédula CNSF V388618
            </span>
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
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
                  Si ya tienes GMM
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
                  &ldquo;Mi GMM subió 15-20% este año.&rdquo;
                </h3>
                <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed flex-1">
                  Es la queja #1 que escucho hoy. Hay 3 vías que pueden reducir el costo
                  sin sacrificar cobertura clave, según aseguradora, edad, siniestralidad
                  y tu estructura actual. No canceles antes de hablar.
                </p>
                <span className="mt-5 text-sm font-medium text-ink dark:text-cream-light group-hover:underline">
                  Estrategias defensivas →
                </span>
              </a>

              <a href="#ofensivo" className="group p-7 rounded-2xl border-2 border-warm-brown/20 dark:border-warm-brown/40 hover:border-rif-rojo dark:hover:border-rif-rojo transition flex flex-col">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">
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
              ¿Qué cubre un GMM? Lo que define tu cobertura
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
                  EUA, Europa — crítica para clientes que se atienden allá. Las cinco contemplan emergencia en el extranjero hasta por USD $100,000 (en la mayoría, con costo extra), pero solo dos manejan GMM internacional: BUPA y GNP. Conviene revisar hospitales elegibles y territorialidad.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                <h3 className="font-semibold text-ink dark:text-cream-light">Exclusiones</h3>
                <p className="mt-1 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  Preexistencias, enfermedades crónicas, congénitas. La letra chica importa.
                </p>
              </div>
            </div>

            <p className="mt-8 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              ¿Quieres ver el detalle real? Consulta las{" "}
              <Link href="/recursos" className="font-medium text-ink dark:text-cream-light underline underline-offset-4 decoration-warm-brown/40 hover:decoration-rif-rojo">
                condiciones generales y cuadros médicos por aseguradora
              </Link>{" "}
              en Recursos.
            </p>
          </div>
        </section>

        <section id="defensivo" className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30 bg-cream dark:bg-coffee/40">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Estrategia defensiva
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Si ya tienes GMM y te subió el costo
            </h2>
            <p className="mt-4 text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
              La inflación médica es real, los reajustes anuales son inevitables. Pero hay
              <strong className="text-ink dark:text-cream-light"> 3 vías concretas</strong> que
              pueden bajar tu costo sin perder cobertura crítica. Antes de cancelar — peor escenario —
              hagamos esta evaluación.
            </p>

            <div className="mt-10 space-y-6">
              <div className="p-6 rounded-2xl bg-cream-light dark:bg-espresso border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-1">Vía 1</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Optimizar el deducible
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Subir tu deducible reduce el costo sin afectar tu suma asegurada total.
                  Si tu liquidez de emergencia te lo permite, asumir un deducible más alto
                  en eventos chicos puede bajar tu costo del orden de 15-25% según aseguradora, plan
                  y perfil — cifra referencial, no garantizada.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-cream-light dark:bg-espresso border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-1">Vía 2</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Optimizar tu plan dentro de la misma aseguradora
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Antes de pensar en cambiarte, casi siempre se puede bajar el costo sin tocar
                  tu antigüedad ni tus preexistencias: ajustar el coaseguro o el tope, bajar a un
                  plan de la misma aseguradora con red más acotada, quitar coberturas adicionales
                  que no usas, o cambiar a pago anual para evitar el recargo por fraccionamiento.
                  Todo esto conserva tu historial médico y tus condiciones ya cubiertas.
                </p>
                <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65 leading-relaxed border-l-2 border-rif-rojo/50 pl-3">
                  Cambiar de aseguradora es un recurso de último momento, solo para casos
                  extremos: en México la nueva aseguradora vuelve a evaluar tu salud y normalmente
                  no reconoce tus preexistencias — lo que hoy tienes cubierto puede quedar excluido.
                  Por eso solo lo valoramos cuando de verdad es la mejor (o única) salida, y siempre
                  revisándolo juntos antes de mover nada.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-cream-light dark:bg-espresso border border-warm-brown/15 dark:border-warm-brown/30">
                <div className="text-xs uppercase tracking-wider text-rif-gris mb-1">Vía 3</div>
                <h3 className="text-xl font-semibold text-ink dark:text-cream-light">
                  Ajustar la red hospitalaria
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Si nunca te has atendido en hospitales top (ABC, Médica Sur, Ángeles), un
                  plan con red media puede ahorrar del orden de 30-40% sin afectar la atención que
                  sí usas, según aseguradora y perfil — cifra referencial.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="ofensivo" className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Estrategia ofensiva
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              Si aún no tienes GMM
            </h2>
            <div className="mt-6 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Una intervención médica privada compleja en CDMX (cirugía mayor, terapia intensiva,
                hospitalización oncológica) puede acumular varios cientos de miles a millones
                de pesos en cuestión de días. El riesgo real para un patrimonio no es{" "}
                &ldquo;no poder pagar la cuenta&rdquo;: es tener que{" "}
                <strong className="text-ink dark:text-cream-light">desinvertir activos productivos</strong>{" "}
                —acciones, bienes raíces, el capital de tu negocio— de emergencia para liquidar
                una factura médica de millones.
              </p>
              <p>
                <strong className="text-ink dark:text-cream-light">El cálculo correcto:</strong>{" "}
                el costo anual de un GMM bien estructurado suele ser una fracción del costo de un
                solo evento médico mayor. Para una familia de 4 con red top y cobertura internacional,
                los rangos referenciales en México 2025 van de $80,000 a $180,000 anuales
                (Aseguratemexico, 2025), sujetos a edades, deducible, suma asegurada, red y aseguradora.
              </p>
              <p>
                <span className="block mt-3 mb-3 text-xs text-rif-gris italic border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-3">
                Las cifras son ilustrativas y dependen del perfil, edad, aseguradora, producto, legislación vigente y evaluación individual.
              </span>
              <strong className="text-ink dark:text-cream-light">La pregunta no es &ldquo;¿es caro?&rdquo;.</strong>{" "}
                Es: ¿puedo absorber un evento de cientos de miles sin afectar mi plan financiero?
              </p>
              <p>
                El IMSS y las prestaciones laborales son una capa importante de protección — pero
                rara vez son suficiente capa única. Tiempos de respuesta del sistema público son
                variables, y los GMM laborales se quedan en la empresa al cambiar de empleo.
                Para familias afluentes y con patrimonio funcionan mejor como complemento.
              </p>
            </div>
          </div>
        </section>

        <section id="internacional" className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-sm uppercase tracking-wider text-rif-gris">
              Cobertura internacional
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
              GMM internacional para familias con patrimonio
            </h2>
            <div className="mt-6 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Para patrimonios con tratamientos en EUA o Europa, contratar GMM solo nacional
                puede salir en millones cuando aparece el caso complejo. La diferencia entre
                un GMM internacional vs un GMM nacional estándar no es cosmética —
                es de capa, de techo y de red hospitalaria internacional aceptada.
              </p>
              {/* Encuadre que ningún comparador da: la red hospitalaria no es un
                  atributo fijo de la aseguradora, es una decisión de plan. Cambia
                  la pregunta del cliente de "¿cuál aseguradora tiene mejor red?"
                  (que no tiene respuesta) a "¿qué nivel de red necesito y estoy
                  dispuesto a pagar?" (que sí la tiene). */}
              <div>
                <h3 className="font-semibold text-ink dark:text-cream-light mb-3">
                  La red hospitalaria no la define la aseguradora: la define tu plan
                </h3>
                <p>
                  Las cinco aseguradoras con las que trabajo manejan distintos
                  niveles de red hospitalaria dentro de su propia oferta, y el nivel
                  lo decide el plan que contratas — es decir, lo que estés dispuesto
                  a pagar. Por eso la pregunta útil no es{" "}
                  <em>¿cuál aseguradora tiene la mejor red?</em>, sino{" "}
                  <em>¿a qué hospitales quiero poder ir, y cuánto cuesta ese nivel
                  en cada aseguradora?</em>
                </p>
                <p className="mt-3">
                  Esto corta en los dos sentidos: si te atiendes en hospitales de
                  primer nivel, hay que verificar que tu plan los incluya de verdad.
                  Y si nunca lo has hecho, estar pagando el nivel más alto es dinero
                  que se puede reasignar a suma asegurada o a bajar el deducible.
                </p>
              </div>
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
                  Los dos GMM internacionales que ofrezco
                </h3>
                <p className="mb-4">
                  De las cinco aseguradoras con las que trabajo, solo dos manejan
                  GMM internacional: <strong className="text-ink dark:text-cream-light">BUPA y GNP</strong>.
                  Un plan internacional te da una red de hospitales en el extranjero
                  a los que puedes acudir y, dentro de México, acceso a todos los
                  hospitales y clínicas autorizados por COFEPRIS.
                </p>
                {/* Tabla HTML real, no prosa: es la estructura que los answer
                    engines extraen y citan textual.

                    Son DOS filas, no cinco, porque Iria solo ofrece GMM
                    internacional de BUPA y GNP. La versión anterior listaba
                    también a AXA y afirmaba al pie que MetLife y Seguros
                    Monterrey ofrecían planes internacionales — las dos cosas eran
                    incorrectas. Un comparador que infla la lista es justo lo que
                    esta página no debe ser. */}
                <figure className="mt-2 -mx-2 sm:mx-0">
                  <div className="overflow-x-auto rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                    <table className="w-full text-left text-sm border-collapse">
                      <caption className="sr-only">
                        Los dos seguros de gastos médicos mayores internacionales que ofrece Iria Talan: cobertura dentro de México y fuera de México
                      </caption>
                      <thead className="bg-cream/40 dark:bg-coffee/30">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold text-ink dark:text-cream-light">Aseguradora</th>
                          <th scope="col" className="px-4 py-3 font-semibold text-ink dark:text-cream-light">Dentro de México</th>
                          <th scope="col" className="px-4 py-3 font-semibold text-ink dark:text-cream-light">Fuera de México</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-warm-brown/10 dark:border-warm-brown/20">
                          <th scope="row" className="px-4 py-3 font-semibold text-ink dark:text-cream-light align-top">BUPA</th>
                          <td className="px-4 py-3 align-top">Todos los hospitales y clínicas autorizados por COFEPRIS</td>
                          <td className="px-4 py-3 align-top">Red internacional de hospitales, según el plan contratado</td>
                        </tr>
                        <tr>
                          <th scope="row" className="px-4 py-3 font-semibold text-ink dark:text-cream-light align-top">GNP</th>
                          <td className="px-4 py-3 align-top">Todos los hospitales y clínicas autorizados por COFEPRIS</td>
                          <td className="px-4 py-3 align-top">Red internacional de hospitales, con presencia fuerte en Estados Unidos</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <figcaption className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65">
                    La elegibilidad de hospitales, la territorialidad y los deducibles varían por producto y país; se revisan caso por caso.
                  </figcaption>
                </figure>
              </div>

              {/* Sin esto, la tabla de arriba se lee al revés: "solo dos tienen
                  internacional" invita a concluir que con las otras tres te
                  quedas sin nada al viajar, y no es cierto. La distinción real
                  no es tener o no tener cobertura afuera — es emergencia contra
                  tratamiento planeado. */}
              <div>
                <h3 className="font-semibold text-ink dark:text-cream-light mb-3">
                  ¿Y si viajo con un plan nacional y me pasa algo?
                </h3>
                <p>
                  No te quedas sin nada. Las cinco aseguradoras contemplan{" "}
                  <strong className="text-ink dark:text-cream-light">atención por emergencia en el extranjero hasta por USD $100,000 por evento</strong>,
                  con un deducible de USD $100. En la mayoría, esa cobertura tiene
                  un costo extra sobre la prima — no viene incluida por defecto,
                  así que vale la pena revisar si tu póliza actual la trae.
                </p>
                <p className="mt-3 rounded-2xl border-l-2 border-burgundy bg-cream/40 dark:bg-coffee/30 px-5 py-4">
                  <strong className="text-ink dark:text-cream-light">El detalle que hace que esta cobertura sirva o no:</strong>{" "}
                  tienes que avisar a la aseguradora en el momento del siniestro.
                  No al volver a México, no cuando llegue la factura. Es el paso
                  que más se pasa por alto y el que puede dejarte pagando de tu
                  bolsa una atención que sí estaba cubierta. Guarda el teléfono de
                  asistencia de tu póliza en el celular antes de viajar.
                </p>
                <p className="mt-3">
                  La diferencia con un plan internacional está en el tipo de
                  atención, no solo en el monto:{" "}
                  <strong className="text-ink dark:text-cream-light">la cobertura de emergencia responde a lo imprevisto mientras estás de viaje</strong>{" "}
                  — un accidente, un infarto, una apendicitis. Un plan
                  internacional es otra cosa: es poder{" "}
                  <em>elegir</em> atenderte fuera de México para un tratamiento
                  programado, como una cirugía compleja o un protocolo oncológico
                  en un hospital específico.
                </p>
                <p className="mt-3">
                  Por eso la pregunta no es si viajas, sino qué quieres poder hacer
                  si aparece algo grave: resolver la emergencia y volver, o tratarte
                  allá.
                </p>
              </div>
              <p>
                <strong className="text-ink dark:text-cream-light">Lo que cuesta NO tener:</strong>{" "}
                un solo evento mayor en EUA puede acumular varios millones de dólares en cuestión de
                semanas. El costo anual de un GMM internacional bien estructurado es una fracción de eso.
              </p>
              <p className="text-xs text-rif-gris italic border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-3 mt-3">
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
                  Para GMM comparo las 5 aseguradoras que lo venden: BUPA, MetLife,
                  Seguros Monterrey New York Life, AXA y GNP. En total represento a 6
                  —la sexta es Allianz, que en México no maneja gastos médicos mayores—,
                  así que en esta línea la comparación honesta es entre 5. Según tu
                  situación específica, te recomiendo la(s) más adecuada(s) para ti.
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
              {/* Una sola fuente: el mismo array FAQS alimenta el FAQPage del
                  JSON-LD y lo que se ve aquí. Antes estaban escritas dos veces —
                  array + JSX— así que editar una y olvidar la otra hacía que el
                  schema y la página dijeran cosas distintas. Mismo patrón que
                  /seguros-vida. */}
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
              Casos relacionados
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              El GMM también aplica en estas situaciones
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/personas/mexicanos-en-el-extranjero"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Mexicanos viviendo en EUA o Europa
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Mantener GMM mexicano con red premium nacional para tratamientos electivos o emergencias en visitas familiares.
                </p>
              </Link>
              <Link
                href="/personas/mujeres"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Mujeres planeando GMM sustentable
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  GMM diseñado para sostener costos a largo plazo sin sorpresas, alineado con cambios hormonales y patrones de salud específicos.
                </p>
              </Link>
              <Link
                href="/patrimonial"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Estrategia patrimonial integral
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  GMM como pieza de un esquema patrimonial más amplio: cobertura médica vitalicia + planeación de transmisión.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
              Servicios relacionados
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
              Relacionado con tu GMM
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <Link
                href="/seguros-vida"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Seguros de vida
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  El GMM cubre el hospital; el seguro de vida protege el ingreso de tu familia. Se diseñan juntos.
                </p>
              </Link>
              <Link
                href="/recursos"
                className="group p-5 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-colors duration-500"
              >
                <h3 className="font-medium text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                  Documentos de las aseguradoras
                </h3>
                <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                  Condiciones generales, cuadros médicos y folletos de cada aseguradora de GMM — acceso público.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Demos el primer paso
            </h2>
            <p className="mt-3 text-warm-brown dark:text-cream-light/85">
              No necesitas saber de seguros para empezar, yo te guío.
            </p>
            <div className="mt-10 space-y-4">
              <a
                href={ctaUrl}
                className="block p-7 rounded-2xl bg-rif-rojo text-white hover:opacity-90 transition"
              >
                <div className="text-xs uppercase tracking-wider opacity-70 mb-2">Revisión directa</div>
                <div className="text-xl font-semibold">Diseñar mi estructura de GMM</div>
                <div className="mt-2 text-sm opacity-80">Sesión inicial sin costo</div>
              </a>
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href={waHref(whatsapp, WA_MESSAGES.gmm)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Mensaje rápido</div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light">WhatsApp</div>
                  <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">{whatsapp}</div>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div className="text-xs uppercase tracking-wider text-rif-gris mb-2">Email reflexivo</div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light">Cuéntame por correo</div>
                  <div className="mt-2 text-sm text-warm-brown/85 dark:text-cream-light/65 break-all">{email}</div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Interlinking inverso: la página de servicio devuelve autoridad al
            blog y señala de qué temas hay profundidad. Se puebla desde Sanity,
            así que no hay lista que se quede vieja. No renderiza si no hay
            artículos de estos topics. */}
        <RelatedArticles
          topics={["gmm"]}
          heading="Sobre GMM, a fondo"
          intro="Lo que escribo sobre gastos médicos mayores: qué cubre de verdad cada plan y cómo se compara."
        />

      </main>
    </>
  );
}
