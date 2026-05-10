import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { type PortableTextBlock } from "@portabletext/react";

import { PortableTextRenderer } from "@/components/portable-text";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../../sanity/lib/queries";
import {
  AuthorData,
  buildBreadcrumbSchema,
  buildFinancialAdvisorSchema,
  buildGraph,
  buildPersonSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sobre Iria Talan — Asesora Financiera RIF",
  description:
    "Iria Talan: MDRT Top of the Table, AMASFAC 8vo Lugar Nacional, Yale Wealth Management, LSE MBA Essentials. Asesora financiera autorizada CNSF en CDMX.",
  alternates: { canonical: "/sobre-iria" },
  openGraph: {
    title: "Sobre Iria Talan — Asesora Financiera RIF",
    description:
      "MDRT TOT · AMASFAC · Yale · LSE · CNSF. Especialista en seguros de vida, GMM y planeación patrimonial.",
    url: "/sobre-iria",
  },
};

const FALLBACK_AUTHOR: AuthorData = {
  name: "Iria Talan",
  alternateName: "Iria Talán",
  title: "Asesora Financiera RIF · Especialista en Seguros de Vida y GMM",
  bio: "Asesora financiera con 18 años acompañando a familias afluentes y patrimonios HNWI en México. Reconocida por la calidad del cuidado, no por volumen. Miembro MDRT desde 2008 — Court of the Table 2023 · Top of the Table 2024 · Court of the Table 2025 — élite mundial de la industria de seguros. AMASFAC 8vo Lugar Nacional. Asesora Diamante GNP y Seguros Monterrey NYL.",
  awards: [
    "Million Dollar Round Table (MDRT) — Miembro desde 2008",
    "MDRT Court of the Table (COT) 2023",
    "MDRT Top of the Table (TOT) 2024",
    "MDRT Court of the Table (COT) 2025",
    "AMASFAC — 8vo Lugar Nacional",
    "GNP Seguros — Asesora Diamante",
    "Seguros Monterrey New York Life — Asesora Diamante",
  ],
  carriers: ["BUPA", "MetLife", "Allianz", "Seguros Monterrey NYL", "AXA", "GNP"],
  specialties: [
    "Seguros de Vida",
    "Gastos Médicos Mayores",
    "Planeación Patrimonial",
    "Fideicomisos",
    "Planes Educacionales",
    "Retiro y Pensiones",
  ],
  languages: ["Español", "English"],
  credentials: [
    { title: "Miembro MDRT desde 2008 · Court of the Table 2023 · Top of the Table 2024 · Court of the Table 2025", issuer: "Million Dollar Round Table — élite mundial de la industria de seguros", category: "industria" },
    { title: "8vo Lugar Nacional", issuer: "AMASFAC (Asoc. Mexicana de Asesores en Seguros y Fianzas)", category: "industria" },
    { title: "Asesora Diamante", issuer: "GNP Seguros", category: "carrier" },
    { title: "Asesora Diamante", issuer: "Seguros Monterrey New York Life", category: "carrier" },
    { title: "Wealth Management Theory & Practice", issuer: "Yale School of Management — Executive Education", year: "2019", category: "academica" },
    { title: "MBA Essentials", issuer: "London School of Economics — Executive Education (curso ejecutivo, no MBA)", category: "academica" },
    { title: "Ingeniera Mecánica Administradora", issuer: "Tecnológico de Monterrey", category: "academica" },
    { title: "Diplomado en Análisis Financiero", issuer: "Bolsa Mexicana de Valores", category: "regulatoria" },
    { title: "Asesora Autorizada · Cédula V388618", issuer: "Comisión Nacional de Seguros y Fianzas (CNSF)", year: "2008", url: "https://agentesajustadores.cnsf.gob.mx/", category: "regulatoria" },
  ],
  officeAddress: "Bosque de Chapultepec, Ciudad de México",
  socialLinks: {
    calendly: "https://calendly.com/iriatalan",
  },
};

export default async function SobreIriaPage() {
  const author =
    (await sanityFetch<AuthorData | null>({
      query: SOBRE_IRIA_QUERY,
      tags: ["author"],
    }).catch(() => null)) ?? FALLBACK_AUTHOR;

  const ctaUrl = author.socialLinks?.calendly ?? "https://calendly.com/iriatalan";

  const pageSchema = buildGraph(
    buildPersonSchema(author),
    buildFinancialAdvisorSchema(author),
    buildBreadcrumbSchema([
      { name: "Inicio", path: "/" },
      { name: "Sobre Iria", path: "/sobre-iria" },
    ])
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
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-ink dark:text-cream-light">
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
                    <h3 className="text-xs uppercase tracking-wider text-cream-light0 mb-4">
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
            <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight">
              Contacto
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {author.socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${author.socialLinks.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
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
                  <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                    Email
                  </div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light break-all">
                    {author.socialLinks.email}
                  </div>
                </a>
              )}
              {author.socialLinks?.calendly && (
                <a
                  href={author.socialLinks.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 hover:border-rif-rojo dark:hover:border-rif-rojo transition"
                >
                  <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
                    Agenda en Calendly
                  </div>
                  <div className="text-lg font-medium text-ink dark:text-cream-light">
                    Sesión inicial · 30 min
                  </div>
                </a>
              )}
              {author.officeAddress && (
                <div className="p-6 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
                  <div className="text-xs uppercase tracking-wider text-cream-light0 mb-2">
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
