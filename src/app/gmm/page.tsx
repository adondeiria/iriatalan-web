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
    question: "¿Qué GMM es mejor: GNP, BUPA, AXA, MetLife o SMNYL?",
    answerText:
      "Ninguna es \"mejor\" en absoluto — la mejor para ti depende de tu perfil (edad, red preferida, necesidad internacional, presupuesto, preexistencias declaradas) y del producto específico de cada aseguradora. Como referencia general: GNP tiene red amplia en México; BUPA y MetLife destacan en cobertura internacional; AXA y Seguros Monterrey New York Life tienen líneas competitivas para perfiles afluentes. La elección correcta requiere comparar cuadros médicos, deducibles, coaseguros, plazos de espera para preexistencias y costos referenciales para tu edad y suma asegurada — eso es exactamente lo que hacemos en la sesión inicial.",
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
      "Crítica para clientes con tratamientos en EUA o Europa. No todos los planes la incluyen. BUPA, MetLife y otros planes internacionales pueden ofrecer redes amplias; conviene revisar hospitales elegibles, territorialidad y deducibles por país.",
  },
];

export const metadata: Metadata = {
  title: "¿Qué cubre un Seguro de Gastos Médicos Mayores?",
  description:
    "Qué cubre, cómo funciona y cuánto cuesta al año un GMM en México. Trabajo con 5 aseguradoras AAA para encontrar tu mejor plan, nacional e internacional.",
  alternates: { canonical: `${SITE_URL}/gmm` },
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
            Gastos Médicos Mayores en México, estructurados para proteger tu patrimonio.
          </h1>
          <h2 className="mt-6 font-serif text-2xl sm:text-3xl tracking-tight leading-snug text-warm-brown dark:text-cream-light/90 max-w-2xl">
            La diferencia entre un GMM bien y uno mal estructurado no es el costo: es si
            tu familia recibe la red hospitalaria, el deducible y la cobertura
            internacional correctas para tu caso real.
          </h2>
          <p className="mt-6 text-lg text-warm-brown dark:text-cream-light/85 leading-relaxed max-w-2xl">
            Trabajo con BUPA, MetLife, Seguros Monterrey New York Life, AXA y GNP.
            Según tu situación específica, te recomiendo la(s) más adecuada(s) para ti.
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
              MDRT Top of the Table 2024 · 8vo Lugar Nacional AMASFAC · Asesora Diamante GNP y Seguros Monterrey New York Life · Cédula CNSF V388618
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
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
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
                  EUA, Europa — crítica para clientes que se atienden allá. BUPA, MetLife y otros planes internacionales pueden ofrecer redes amplias; conviene revisar hospitales elegibles y territorialidad.
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
            <p className="text-sm uppercase tracking-wider text-cream-light0">
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
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-1">Vía 1</div>
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
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-1">Vía 2</div>
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
                <div className="text-xs uppercase tracking-wider text-cream-light0 mb-1">Vía 3</div>
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
                Para familias afluentes y con patrimonio funcionan mejor como complemento.
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
              GMM internacional para familias con patrimonio
            </h2>
            <div className="mt-6 space-y-6 text-warm-brown dark:text-cream-light/85 leading-relaxed">
              <p>
                Para patrimonios con tratamientos en EUA o Europa, contratar GMM solo nacional
                puede salir en millones cuando aparece el caso complejo. La diferencia entre
                un GMM internacional vs un GMM nacional estándar no es cosmética —
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
                  Aseguradoras que suelen destacar en cobertura internacional
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-ink dark:text-cream-light">BUPA</strong> — depende del plan internacional que tengas contratado, puedes tener acceso a los mejores hospitales de México y el mundo.</li>
                  <li><strong className="text-ink dark:text-cream-light">GNP VIP</strong> — red fuerte en EUA, cobertura con hospitales en convenio internacionales y acceso a todos los hospitales en México.</li>
                  <li><strong className="text-ink dark:text-cream-light">AXA</strong> — cobertura con hospitales internacionales en convenio.</li>
                </ul>
                <p className="mt-3 text-sm text-warm-brown/85 dark:text-cream-light/65">
                  La elegibilidad de hospitales, la territorialidad y los deducibles varían por producto y país; se revisan caso por caso.
                </p>
              </div>
              <p>
                <strong className="text-ink dark:text-cream-light">Lo que cuesta NO tener:</strong>{" "}
                un solo evento mayor en EUA puede acumular varios millones de dólares en cuestión de
                semanas. El costo anual de un GMM internacional bien estructurado es una fracción de eso.
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
                  Trabajo con BUPA, MetLife, Seguros Monterrey New York Life,
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
                  ¿Qué GMM es mejor: GNP, BUPA, AXA, MetLife o SMNYL?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Ninguna es &ldquo;mejor&rdquo; en absoluto — la mejor para ti depende de tu perfil (edad, red preferida, necesidad internacional, presupuesto, preexistencias declaradas) y del producto específico de cada aseguradora. Como referencia general: GNP tiene red amplia en México; BUPA y MetLife destacan en cobertura internacional; AXA y Seguros Monterrey New York Life tienen líneas competitivas para perfiles afluentes. La elección correcta requiere comparar cuadros médicos, deducibles, coaseguros, plazos de espera para preexistencias y costos referenciales para tu edad y suma asegurada — eso es exactamente lo que hacemos en la sesión inicial.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cubre el GMM enfermedades preexistentes?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Las pólizas individuales y familiares de GMM en México generalmente NO cubren preexistencias declaradas al momento de contratar — esto aplica a la mayoría de las aseguradoras AAA del mercado. Algunas pólizas colectivas (GMM grupo de empresa) sí pueden cubrir preexistencias tras periodos de espera (24-48 meses son típicos, varían por aseguradora y diagnóstico), pero no es el estándar individual. Lo crítico: declarar TODO al contratar — diagnósticos, tratamientos, medicamentos — porque si la aseguradora descubre después que omitiste algo, puede negar el siniestro relacionado o cancelar por omisión dolosa. Mejor declarar y saber qué queda excluido desde el día 1, que tener falsa cobertura. Si tienes una preexistencia importante, hay aseguradoras y planes específicos que aceptan condiciones que otros rechazan — la sesión inicial identifica tus mejores opciones.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿A qué edad conviene contratar GMM y hasta qué edad se renueva?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Lo más pronto posible — antes de cualquier diagnóstico que después se convierta en preexistencia y antes de cumplir edades donde el costo sube significativamente. Los costos suben con la edad de contratación de forma no lineal: contratar a los 30 vs a los 50 puede significar diferencias importantes en el costo total del plan a lo largo de la vida. Muchos planes del mercado contemplan renovación vitalicia, sujeta a las condiciones de la póliza, el pago oportuno y la no omisión en la declaración. Las edades máximas de alta varían por aseguradora — conviene revisar antes de cumplir la edad límite de tu aseguradora preferida.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cubre el GMM maternidad y parto?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí, pero con periodo de espera — típicamente 10-12 meses desde la contratación o ampliación, según la aseguradora y plan. Esto significa que si quieres que tu GMM cubra el parto, debes contratar antes de embarazarte (o estar dentro del periodo de carencia que permita el plan). La cobertura del recién nacido (alta médica + primeros días de hospitalización) generalmente es un módulo aparte que conviene contratar al avisar el embarazo, dentro del plazo que marque la póliza. Las condiciones finales se rigen por la póliza emitida por la aseguradora.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Cuánto cuesta un GMM individual o familiar en 2026?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  El costo depende de edad de cada asegurado, deducible, coaseguro, red hospitalaria, suma asegurada, preexistencias declaradas, y si incluye cobertura internacional. Como referencia general 2026, una familia mexicana típica con plan de red top y cobertura internacional puede tener costos anuales en el rango de $80,000 a $180,000 MXN (rangos referenciales según fuentes del sector); planes con red restringida y deducibles más altos pueden bajar considerablemente el costo. La cifra exacta requiere cotización individual con cada aseguradora — eso lo hacemos en la sesión inicial.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Puedo mantener mi GMM si cambio de trabajo o me independizo?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Sí — si tu GMM es póliza individual a tu nombre (no GMM colectivo de tu empleador), es totalmente portátil. Tú eres el contratante, tú pagas, tú decides cuándo renovar y con qué aseguradora. Esta es una de las razones por las que conviene NO depender solo del GMM colectivo del trabajo: si te despiden, renuncias o tu empresa cambia aseguradoras o condiciones, te quedas sin cobertura justo cuando puede ser difícil contratar uno individual (por edad o preexistencias adquiridas mientras estabas en el grupo). Estrategia recomendada: GMM individual base + grupo del empleador como complemento.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Mi GMM subió 18% este año, ya no me alcanza.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es la queja #1 que escucho hoy. Antes de cancelar, evaluemos las 3 vías
                  defensivas (deducible · optimizar tu plan actual · red ajustada). Cancelar tu cobertura
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
                  familias afluentes y con patrimonio funcionan mejor como complemento.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  Tengo dudas con el deducible.
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Es la decisión más importante. Bajo = costo alto, cobertura desde el primer peso.
                  Alto = costo bajo, asumes los primeros gastos tú. Depende de tu liquidez de
                  emergencia y aversión al riesgo. Lo cuantificamos juntos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Qué hospitales cubre?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Depende de la aseguradora y plan. ABC + Médica Sur + Ángeles está en planes premium
                  de varios. Christus Muguerza en otros. Te muestro la red exacta antes de decidir.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Y si me niegan un siniestro?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  La CNSF regula y arbitra disputas. Muchas controversias se originan en
                  documentación incompleta, exclusiones o la declaración inicial — por eso la
                  revisión previa es crítica. Varias se corrigen acompañando bien el proceso, y
                  te acompaño personalmente.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink dark:text-cream-light">
                  ¿Y la cobertura internacional?
                </h3>
                <p className="mt-2 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  Crítica para clientes con tratamientos en EUA o Europa. No todos los planes la
                  incluyen. BUPA, MetLife y otros planes internacionales pueden ofrecer redes amplias; conviene revisar hospitales elegibles, territorialidad y deducibles por país.
                </p>
              </div>
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
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
