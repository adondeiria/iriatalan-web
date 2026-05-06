import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextBlock } from "@portabletext/react";

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
  title: "Asesora Financiera RIF · Especialista en Seguros de Vida y GMM",
  bio: "Asesora financiera con 15+ años acompañando a familias mass-affluent y patrimonios HNWI en México. Miembro MDRT Top of the Table — distinción reservada al top mundial de la industria de seguros. AMASFAC 8vo Lugar Nacional. Asesora Diamante GNP y Seguros Monterrey NYL.",
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
    { title: "MDRT Top of the Table", issuer: "Million Dollar Round Table", category: "industria" },
    { title: "8vo Lugar Nacional", issuer: "AMASFAC (Asoc. Mexicana de Asesores en Seguros y Fianzas)", category: "industria" },
    { title: "Asesora Diamante", issuer: "GNP Seguros", category: "carrier" },
    { title: "Asesora Diamante", issuer: "Seguros Monterrey New York Life", category: "carrier" },
    { title: "Wealth Management Certificate", issuer: "Yale University", category: "academica" },
    { title: "MBA Essentials", issuer: "London School of Economics", category: "academica" },
    { title: "Certificación BMV", issuer: "Bolsa Mexicana de Valores", category: "regulatoria" },
    { title: "Miembro IMEF", issuer: "Instituto Mexicano de Ejecutivos de Finanzas", category: "industria" },
    { title: "Egresada Tec de Monterrey", issuer: "Tecnológico de Monterrey", category: "academica" },
    { title: "Asesora Autorizada", issuer: "Comisión Nacional de Seguros y Fianzas (CNSF)", category: "regulatoria" },
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
        <section className="px-6 py-20 sm:py-28 max-w-5xl mx-auto w-full">
          <p className="text-sm uppercase tracking-wider text-zinc-500">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            {" / "}Sobre Iria
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-[280px,1fr] sm:items-start">
            {author.photo?.asset?.url && (
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
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
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
                {author.name}
              </h1>
              <p className="mt-3 text-xl text-zinc-700 dark:text-zinc-300">
                {author.title}
              </p>
              {author.bio && (
                <p className="mt-8 text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {author.bio}
                </p>
              )}

              {author.longBio && Array.isArray(author.longBio) && author.longBio.length > 0 && (
                <div className="mt-10 prose prose-zinc dark:prose-invert prose-lg prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50">
                  <PortableText value={author.longBio as PortableTextBlock[]} />
                </div>
              )}
            </div>
          </div>
        </section>

        {author.credentials && author.credentials.length > 0 && (
          <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Credenciales y autoridad
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Cada credencial es verificable. Puedes pedirme la prueba de cualquiera.
              </p>

              <div className="mt-10 space-y-12">
                {Object.entries(credentialsByCategory).map(([cat, items]) => (
                  <div key={cat}>
                    <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-4">
                      {categoryLabels[cat] ?? cat}
                    </h3>
                    <ul className="space-y-3">
                      {items.map((c, i) => (
                        <li
                          key={`${cat}-${i}`}
                          className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4"
                        >
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {c.title}
                          </span>
                          {c.issuer && (
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {c.issuer}
                              {c.year ? ` · ${c.year}` : ""}
                            </span>
                          )}
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline text-zinc-700 dark:text-zinc-300"
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
          <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Aseguradoras autorizadas
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Trabajo con estas aseguradoras. Según tu situación específica, te recomiendo la(s) más adecuada(s) para ti.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {author.carriers.map((c) => (
                  <span
                    key={c}
                    className="px-4 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {author.specialties && author.specialties.length > 0 && (
          <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Especialidades
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {author.specialties.map((s) => (
                  <li
                    key={s}
                    className="text-zinc-700 dark:text-zinc-300 flex items-baseline gap-2"
                  >
                    <span className="text-zinc-400">·</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Contacto
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {author.socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${author.socialLinks.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                    WhatsApp
                  </div>
                  <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    {author.socialLinks.whatsapp}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Atención a clientes de RIF
                  </div>
                </a>
              )}
              {author.socialLinks?.email && (
                <a
                  href={`mailto:${author.socialLinks.email}`}
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                    Email
                  </div>
                  <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50 break-all">
                    {author.socialLinks.email}
                  </div>
                </a>
              )}
              {author.socialLinks?.calendly && (
                <a
                  href={author.socialLinks.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-50 transition"
                >
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                    Agenda en Calendly
                  </div>
                  <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                    Consulta gratuita 30 min
                  </div>
                </a>
              )}
              {author.officeAddress && (
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
                    Oficina
                  </div>
                  <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50 leading-snug">
                    {author.officeAddress}
                  </div>
                </div>
              )}
            </div>
            {author.socialLinks && (
              <div className="mt-8 flex gap-4 flex-wrap">
                {author.socialLinks.linkedin && (
                  <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:underline">LinkedIn →</a>
                )}
                {author.socialLinks.instagram && (
                  <a href={author.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:underline">Instagram →</a>
                )}
                {author.socialLinks.facebook && (
                  <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:underline">Facebook →</a>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="px-6 py-20 max-w-4xl mx-auto w-full">
          <div className="rounded-3xl bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 p-10 sm:p-14 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              ¿Hablamos?
            </h2>
            <p className="mt-3 opacity-80 max-w-md mx-auto">
              Consulta gratuita de 30 min. Te escucho primero, recomiendo después.
              {author.officeAddress
                ? ` Oficina en ${author.officeAddress}.`
                : ""}
            </p>
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-7 py-3.5 font-medium hover:opacity-90 transition"
            >
              Agenda consulta gratis 30 min
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
