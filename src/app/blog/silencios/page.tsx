import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buildBreadcrumbSchema, buildGraph, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Los 7 temas que la industria financiera no te explica",
  description:
    "Modalidad 40, PPR, beneficiarios, persona clave, hijos neurodivergentes, sucesión patrimonial — los temas que rara vez te explican y que pueden cambiar tu patrimonio.",
  alternates: { canonical: `${SITE_URL}/blog/silencios` },
  openGraph: {
    title: "Los 7 temas que la industria financiera no te explica",
    description:
      "Modalidad 40, PPR, beneficiarios, persona clave, neurodivergentes, sucesión — lo que tu asesor convencional no aborda.",
    url: `${SITE_URL}/blog/silencios`,
    type: "article",
  },
};

const SILENCIOS = [
  {
    slug: "modalidad-40-pension-dorada",
    title: "Modalidad 40 — pensión dorada, si no abandonas el plan a la mitad",
    body:
      "Mucha gente sabe que Modalidad 40 IMSS puede multiplicar tu pensión — pero casi nadie planea cómo va a pagar la mensualidad durante los 5 años que dura. Sin un esquema de ahorro que lo garantice (Seguro de Ahorro / Retiro o Fondo de Inversión a edad 55-60), la cuota se vuelve insostenible y se pierde la pensión máxima. Lo correcto: emparejar Modalidad 40 con un plan de retiro que la financie y garantice.",
    image: "/img/silencios/silencio-01-pension.png",
  },
  {
    slug: "universidades-privadas-sin-plan",
    title: "Universidades privadas más caras cada año, sin plan dedicado",
    body:
      "Una colegiatura privada en México puede superar los $45,000 MXN al mes. Una internacional, mucho más. Y el costo educativo incrementa anualmente por encima de la inflación. La mayoría de papás ahorra “lo que pueda” — sin plan dedicado, sin un seguro que complete las cuotas si tú llegas a faltar, sin cobertura específica para universidad nacional o internacional. Cuando llega el momento, el dinero no alcanza.",
    image: "/img/silencios/silencio-02-universidades.png",
  },
  {
    slug: "ppr-retiro-deducible",
    title: "Retiro deducible de impuestos — el instrumento perfecto",
    body:
      "Construye tu retiro con la ayuda de PPR (Plan Personal de Retiro): puede regresarte hasta el 35% en tu declaración anual, dependiendo de tu tasa marginal de ISR (Art. 151 fracc V LISR vigente, hasta el tope deducible — alrededor de $213,973 MXN en 2026, cifras vigentes a verificar al momento de contratar). A partir de los 65 años puedes recibir tu dinero en pago único o pensión vitalicia (y puede ser heredable), bajo el régimen fiscal aplicable a planes personales de retiro conforme a la normativa vigente.",
    image: "/img/silencios/silencio-03-ppr.png",
  },
  {
    slug: "beneficiarios-desactualizados",
    title: "Beneficiarios desactualizados",
    body:
      "Divorcios, hijos nuevos, segundas parejas, socios que entran y salen. La mayoría de los seguros de vida tienen beneficiarios que ya no reflejan la realidad del cliente. Cuando llega el siniestro, el dinero llega a la persona equivocada — y no hay vuelta atrás. Revisar designación cada vez que tu vida cambia no es paranoia — es disciplina patrimonial básica.",
    image: "/img/silencios/silencio-04-beneficiarios.png",
  },
  {
    slug: "empresas-sin-persona-clave",
    title: "Empresas sin Persona Clave",
    body:
      "El dueño generalmente no se asegura para la empresa que construyó. Muchos socios mexicanos lo descubren tarde — el día que pasa algo, la operación se queda sin liquidez para resolver problemas inmediatos, no tienen estructura de ahorro para retiro, transición de mando o búsqueda de reemplazos. La estructura correcta: un seguro de Persona Clave donde la empresa es beneficiaria sobre el dueño, socios o cualquier persona insustituible. El ahorro al término del plazo también lo recibe la empresa, así cuando llega el momento, hay capital para sobrevivir el bache — no para liquidarse.",
    image: "/img/silencios/silencio-05-empresas.png",
  },
  {
    slug: "hijos-neurodivergentes-estructura",
    title: "Hijos neurodivergentes sin estructura financiera",
    body:
      "Padres y madres piensan en seguros generales, pero pocos en estructuras específicas que protejan financieramente a su hijo de por vida. La estructura que recomiendo: un seguro de vida cuya suma asegurada va, vía designación irrevocable, a un fideicomiso que invierte el capital y le genera una pensión mensual al hijo — junto con un seguro de retiro con pensión vitalicia adicional. Dos fuentes de ingreso garantizadas para cuando tú ya no estás, sin sucesiones lentas ni tutores no idóneos.",
    image: "/img/silencios/silencio-06-neurodivergentes.png",
  },
  {
    slug: "sucesion-fideicomiso-aseguradora",
    title: "Sucesión patrimonial sin fideicomiso vía aseguradora",
    body:
      "Para patrimonios complejos, un testamento solo no basta. La estructura más limpia que existe: un seguro de vida con designación irrevocable de beneficiario hacia un fideicomiso. Eso permite que el capital llegue al heredero correcto en semanas (no en años de juicio sucesorio), con eficiencia fiscal y sin quedar atrapado en disputas familiares. No estructuro fideicomisos notariales puros — los armo a través del vehículo aseguradora porque ahí vive la liquidez inmediata, no en patrimonio inmovilizado que tarda años en disolverse.",
    image: "/img/silencios/silencio-07-sucesion.png",
  },
];

export default function SilenciosPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Inicio", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Los 7 temas", path: "/blog/silencios" },
  ]);
  const schema = buildGraph(breadcrumbSchema);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="flex flex-col bg-cream-light">
        {/* HEADER */}
        <section className="relative bg-espresso text-cream-light texture-grain overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 size-[560px] rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(circle, rgba(158,27,30,0.18) 0%, rgba(158,27,30,0.06) 35%, transparent 65%)",
            }}
          />
          <div className="relative px-6 py-24 sm:py-32 max-w-4xl mx-auto w-full">
            <nav className="text-[11px] uppercase tracking-[0.22em] text-cream-light/55 mb-8">
              <Link href="/" className="hover:text-cream-light transition-colors duration-300">
                Inicio
              </Link>
              <span className="mx-2 text-champagne" aria-hidden>·</span>
              <Link href="/blog" className="hover:text-cream-light transition-colors duration-300">
                Blog
              </Link>
              <span className="mx-2 text-champagne" aria-hidden>·</span>
              <span className="text-cream-light/85">Los 7 temas</span>
            </nav>
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.24em] text-burgundy">
              Diferenciación
            </p>
            <h1 className="mt-6 font-serif font-light text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.01em] text-cream-light">
              Lo que normalmente NO te explica la industria financiera
            </h1>
            <p className="mt-7 text-base sm:text-lg text-cream-light/80 italic max-w-2xl">
              No vendo seguros. Te ayudo a que tomes las decisiones correctas.
            </p>
          </div>
        </section>

        {/* 7 SILENCIOS GRID */}
        <section className="px-6 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto w-full">
            <div className="space-y-20 sm:space-y-28">
              {SILENCIOS.map((s, i) => (
                <article key={s.slug} id={s.slug} className="grid gap-8 lg:gap-14 lg:grid-cols-[5fr_7fr] lg:items-start scroll-mt-24">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-warm-brown/10 shadow-[0_20px_48px_-20px_rgba(20,17,15,0.28)]">
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-4 font-serif font-light text-2xl sm:text-3xl lg:text-4xl leading-[1.15] tracking-[-0.01em] text-ink">
                      {s.title}
                    </h2>
                    <p className="mt-6 text-base text-warm-brown/85 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-burgundy text-cream-light px-6 py-20 sm:py-24">
          <div className="max-w-3xl mx-auto w-full text-center">
            <h2 className="font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-cream-light">
              ¿Reconoces alguno de estos en tu situación?
            </h2>
            <p className="mt-6 text-base sm:text-lg text-cream-light/85 italic max-w-xl mx-auto">
              Hagamos diagnóstico antes de que sea decisión.
            </p>
            <div className="mt-10">
              <Link
                href="/contacto#agendar"
                className="group inline-flex items-center gap-3 rounded-full bg-cream-light text-burgundy px-9 py-4 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:bg-cream-light/90 transition-all duration-500 hover:-translate-y-0.5"
              >
                Reserva tu sesión inicial · 30 min
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>

        {/* BACK TO BLOG */}
        <section className="bg-cream-light px-6 py-16 border-t border-warm-brown/10">
          <div className="max-w-3xl mx-auto w-full text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-burgundy hover:text-burgundy-deep transition-colors duration-300"
            >
              ← Volver al blog
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
