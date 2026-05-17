import type { Metadata } from "next";
import Link from "next/link";

import {
  buildBreadcrumbSchema,
  buildGraph,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Personas que asesoro — Iria Talan / RIF",
  description:
    "Asesoría patrimonial boutique para 5 perfiles específicos: mexicanos viviendo en el extranjero, familias con hijos neurodivergentes, familias arcoíris, mujeres en construcción patrimonial, y extranjeros residentes en México (asesoría bilingüe). Cada plan se diseña desde tu situación real.",
  alternates: { canonical: `${SITE_URL}/personas` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/personas`,
    title: "Personas que asesoro — Iria Talan",
    description:
      "5 perfiles que requieren asesoría patrimonial específica, no genérica.",
  },
};

const PERSONAS = [
  {
    href: "/personas/mexicanos-en-el-extranjero",
    title: "Mexicanos viviendo en el extranjero",
    description:
      "Si vives en EUA, Europa o Canadá pero mantienes vínculos fiscales o patrimoniales en México: PPR deducible, GMM con red premium nacional, planes educacionales en peso o dólar, fideicomisos de sucesión transfronteriza.",
  },
  {
    href: "/personas/hijos-neurodivergentes",
    title: "Familias con hijos neurodivergentes",
    description:
      "Planeación financiera de por vida para hijos con autismo, TDAH, síndrome de Down u otra condición. Fideicomiso de soporte vitalicio, seguro de vida con suma calculada para 60+ años de cuidado, tutela legal documentada.",
  },
  {
    href: "/personas/familias-arcoiris",
    title: "Familias arcoíris (LGBT+)",
    description:
      "Estructuras de protección legal documentadas: seguros de vida con beneficiario blindado, fideicomiso testamentario, plan educacional con titularidad clara, GMM familiar con coberturas que reconocen estructura familiar diversa.",
  },
  {
    href: "/personas/mujeres",
    title: "Mujeres en construcción patrimonial",
    description:
      "Asesoría diseñada por una mujer asesora: profesionistas con ISR alto, divorciadas con hijos, viudas con patrimonio heredado, empresarias. Optimización fiscal vía PPR Art. 151 LISR vigente + estrategia de retiro propia (sujeto a los requisitos fiscales aplicables).",
  },
  {
    href: "/foreigners-in-mexico",
    title: "Foreigners living in Mexico (English)",
    description:
      "Para extranjeros con residencia temporal o permanente en México. Asesoría bilingüe (español/inglés) sobre GMM con red premium nacional, seguros de vida con sucesión transfronteriza, planes de retiro Art. 93 LISR vigente (régimen fiscal aplicable al pago) y planes educacionales en MXN o USD. Página de destino en inglés.",
  },
];

export default function PersonasHubPage() {
  const pageSchema = buildGraph(
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Personas", path: "/personas" },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/personas#page`,
      name: "Personas que asesoro",
      description:
        "5 perfiles que requieren asesoría patrimonial específica, no genérica.",
      url: `${SITE_URL}/personas`,
      isPartOf: { "@id": `${SITE_URL}#website` },
      hasPart: PERSONAS.map((p) => ({
        "@type": "WebPage",
        url: `${SITE_URL}${p.href}`,
        name: p.title,
        description: p.description,
      })),
    }
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <header className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
            Asesoría especializada
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight leading-tight text-ink dark:text-cream-light">
            Personas que asesoro
          </h1>
          <p className="mt-6 text-lg text-warm-brown dark:text-cream-light/85 leading-relaxed">
            La asesoría patrimonial premium no es un producto único. Son cinco
            perfiles que necesitan estructura financiera específica, no
            genérica. Cada plan se diseña desde tu situación real — fiscal,
            familiar, geográfica — para que la estrategia tenga sentido cinco,
            diez, treinta años después.
          </p>
        </header>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group p-8 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-burgundy/40 transition-all duration-500"
            >
              <h2 className="font-serif text-xl sm:text-2xl tracking-tight text-ink dark:text-cream-light group-hover:text-burgundy transition-colors duration-500">
                {p.title}
              </h2>
              <p className="mt-4 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
                {p.description}
              </p>
              <span className="mt-6 inline-block text-sm font-medium text-burgundy underline">
                Conocer detalles →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-20 max-w-3xl">
          <p className="text-sm text-warm-brown dark:text-cream-light/70 italic">
            ¿Tu perfil no aparece aquí? La asesoría sigue siendo personalizada —
            agenda una conversación inicial sin compromiso.
          </p>
          <Link
            href="/contacto#agendar"
            className="mt-4 inline-block text-sm font-medium underline text-burgundy"
          >
            Agendar conversación →
          </Link>
        </div>
      </main>
    </>
  );
}
