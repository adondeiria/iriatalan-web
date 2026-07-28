import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { sanityFetch } from "../../sanity/lib/fetch";
import { SOBRE_IRIA_QUERY } from "../../sanity/lib/queries";
import {
  AuthorData,
  buildFinancialAdvisorSchema,
  buildGraph,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildWebSiteSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { FALLBACK_AUTHOR } from "@/lib/author";
import { GOOGLE_REVIEWS_URL, GOOGLE_WRITE_REVIEW_URL } from "@/lib/google-business";
import { WA_MESSAGES, WA_NUMBER_FALLBACK, waHref } from "@/lib/whatsapp";

import { Analytics } from "@/components/analytics";
import { CookieBanner } from "@/components/cookie-banner";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";

import "./globals.css";

// Inter (body) — solo los pesos usados: 400 base, 500 font-medium, 600 font-semibold.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

// Cormorant (headings h1-h4) — 300 (font-light), 400 base, 700 (font-bold),
// en normal + italic. Se quitaron 500/600 (sin uso). De 10 archivos a 6.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Iria Talan | Asesoría Patrimonial y Seguros en México",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Diseño de estrategias técnicas de protección, retiro e inversión. Asegura tu patrimonio y optimiza tus impuestos con soluciones de alto nivel.",
  applicationName: SITE_NAME,
  authors: [{ name: "Iria Talan", url: `${SITE_URL}/sobre-iria` }],
  keywords: [
    "seguros de vida México",
    "GMM gastos médicos mayores",
    "asesor financiero CDMX",
    "planeación patrimonial",
    "fideicomisos",
    "retiro AFORE",
    "Iria Talan",
    "RIF Reingeniería Financiera",
    "MDRT Top of the Table",
    "seguros empresas México",
  ],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Planeación Patrimonial, Seguros y Retiro`,
    description:
      "Asesoría financiera personalizada en México. Seguros de vida, GMM, planeación patrimonial y retiro. MDRT Top of the Table.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Planeación Patrimonial, Seguros y Retiro`,
    description:
      "Asesoría financiera independiente en México. MDRT Top of the Table · Cédula CNSF V388618.",
    creator: "@iriatalan",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "es-MX": SITE_URL,
      "en-US": `${SITE_URL}/foreigners-in-mexico`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
      "XUEIAvGGqpxaqnUM9tpg7azDYtXfjlmnPruMHdBRwgs",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ?? "",
    },
  },
  category: "Finanzas",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // El autor se resuelve aquí, en el layout, porque los nodos `Person` y
  // `FinancialService` tienen que existir en TODAS las páginas: las 14 páginas
  // de servicio apuntan a esos `@id` desde su campo `provider`, y los crawlers
  // no resuelven un `@id` que vive en otra URL. Antes solo se emitían en `/` y
  // `/sobre-iria`, así que en /gmm, /seguros-vida, /personas/* y las páginas EN
  // la referencia quedaba colgando y se perdía la atribución a Iria — justo en
  // las páginas que convierten.
  const author =
    (await sanityFetch<AuthorData | null>({
      query: SOBRE_IRIA_QUERY,
      tags: ["author"],
    }).catch(() => null)) ?? FALLBACK_AUTHOR;

  const globalSchema = buildGraph(
    buildOrganizationSchema(author),
    buildWebSiteSchema(),
    buildLocalBusinessSchema(author),
    buildPersonSchema(author),
    buildFinancialAdvisorSchema(author)
  );

  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
        <SiteHeader siteName={SITE_NAME} />

        <div className="flex-1">{children}</div>

        <footer className="bg-espresso text-cream-light relative overflow-hidden mt-20">
          <div aria-hidden className="absolute inset-0 texture-grain pointer-events-none" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(158,27,30,0.16) 0%, transparent 55%)",
            }}
          />

          {/* Bloque superior: CTA grande */}
          <div className="relative max-w-4xl mx-auto px-6 pt-12 sm:pt-14 pb-10">
            <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-end lg:gap-10">
              <div>
                <h2 className="font-serif font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-[-0.01em] text-cream-light">
                  Hablemos de tu patrimonio<br className="hidden sm:inline" /> y tu futuro.
                </h2>
              </div>
              <div className="flex flex-col lg:items-end gap-5">
                <p className="text-sm sm:text-base text-cream-light/75 leading-relaxed lg:text-right max-w-xs">
                  Estoy para ayudarte a tomar decisiones con claridad y confianza.
                </p>
                <Link
                  href="/contacto#agendar"
                  className="group inline-flex items-center gap-3 rounded-full bg-burgundy text-cream-light px-7 py-3.5 text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase hover:bg-burgundy-deep transition-all duration-500 shadow-[0_12px_32px_-12px_rgba(158,27,30,0.6)] hover:shadow-[0_20px_48px_-12px_rgba(158,27,30,0.8)] hover:-translate-y-0.5"
                >
                  Reserva tu sesión inicial · 30 min
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 transition-transform duration-500 group-hover:translate-x-1.5" aria-hidden>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="hairline-x-light relative" />

          {/* Bloque medio: 5 columnas (logo+sociales / Servicios / Recursos / Información / Contacto) */}
          <div className="relative max-w-4xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.3fr]">
            <div>
              <Image
                src="/logo-rif.svg"
                alt={`${SITE_NAME} — Reingeniería Financiera`}
                width={740}
                height={258}
                className="h-14 w-auto brightness-0 invert opacity-95"
              />
              <p className="mt-6 text-sm text-cream-light/75 leading-relaxed max-w-xs">
                Asesoría Financiera y Patrimonial.
              </p>
              <div className="mt-7 flex items-center gap-5">
                <a
                  href="https://mx.linkedin.com/in/iriatalan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-cream-light/65 hover:text-cream-light transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/iriatalan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-cream-light/65 hover:text-cream-light transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63 3.36.94 2.69 1.34 2.03 2 1.36 2.66.96 3.33.65 4.11.35 4.87.15 5.75.09 7.02.03 8.3.02 8.71.02 11.97s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.78.71 1.45 1.37 2.11.66.66 1.33 1.06 2.11 1.37.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.85 5.85 0 0 0 2.11-1.37 5.85 5.85 0 0 0 1.37-2.11c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.85 5.85 0 0 0-1.37-2.11A5.85 5.85 0 0 0 19.86.65c-.76-.3-1.64-.5-2.91-.56C15.67.03 15.26.02 12 .02zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@iriatips"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-cream-light/65 hover:text-cream-light transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.86a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z" />
                  </svg>
                </a>
                {/* YouTube existía en el `sameAs` del schema pero no como enlace
                    visible: el canal tiene contenido y ayuda a consolidar la entidad. */}
                <a
                  href="https://www.youtube.com/@iriatalan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-cream-light/65 hover:text-cream-light transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                  </svg>
                </a>
              </div>

              {/* Reseñas de Google. Dos intenciones distintas y deliberadas:
                  leerlas (prospecto) y dejarla (cliente actual). */}
              <div className="mt-7 flex flex-col items-start gap-2">
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-cream-light/80 hover:text-cream-light transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" className="size-4 flex-shrink-0" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.3l-5.8 3.06 1.11-6.46-4.7-4.58 6.49-.94z"
                    />
                  </svg>
                  Reseñas en Google
                </a>
                <a
                  href={GOOGLE_WRITE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-cream-light/55 hover:text-cream-light/85 underline underline-offset-4 transition-colors duration-500"
                >
                  ¿Ya trabajamos juntas? Deja tu reseña
                </a>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium mb-5">Servicios</p>
              <ul className="space-y-3 text-sm text-cream-light/80">
                <li><Link href="/patrimonial" className="hover:text-cream-light transition-colors duration-500">Protección Patrimonial</Link></li>
                <li><Link href="/retiro" className="hover:text-cream-light transition-colors duration-500">Retiro y Pensiones</Link></li>
                <li><Link href="/gmm" className="hover:text-cream-light transition-colors duration-500">Seguros Personales</Link></li>
                <li><Link href="/personas" className="hover:text-cream-light transition-colors duration-500">Planeación Patrimonial</Link></li>
                <li><Link href="/empresas" className="hover:text-cream-light transition-colors duration-500">Empresarios y Socios</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium mb-5">Recursos</p>
              <ul className="space-y-3 text-sm text-cream-light/80">
                <li><Link href="/blog" className="hover:text-cream-light transition-colors duration-500">Blog</Link></li>
                {/* Se llamaba "Guías Gratuitas" pero /recursos son condiciones
                    generales y documentos de aseguradoras. La guía real ya está
                    listada abajo (/guia); la etiqueta ahora dice lo que hay. */}
                <li><Link href="/recursos" className="hover:text-cream-light transition-colors duration-500">Documentos de aseguradoras</Link></li>
                {/* Apuntaba a /recursos#faqs, un ancla inexistente: /recursos no
                    tiene sección de FAQs. Las FAQs del home sí existen y emiten
                    FAQPage, así que el enlace del footer va ahí. */}
                <li><Link href="/#faqs" className="hover:text-cream-light transition-colors duration-500">Preguntas Frecuentes</Link></li>
                <li><Link href="/glosario" className="hover:text-cream-light transition-colors duration-500">Glosario</Link></li>
                <li><Link href="/guia" className="hover:text-cream-light transition-colors duration-500">Guía: trámites por fallecimiento</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-burgundy font-medium mb-5">Información</p>
              <ul className="space-y-3 text-sm text-cream-light/80">
                <li><Link href="/sobre-iria" className="hover:text-cream-light transition-colors duration-500">Sobre Mí</Link></li>
                <li><Link href="/contacto" className="hover:text-cream-light transition-colors duration-500">Contacto</Link></li>
                <li><Link href="/aviso-privacidad" className="hover:text-cream-light transition-colors duration-500">Aviso de Privacidad</Link></li>
                <li><Link href="/aviso-privacidad#terminos" className="hover:text-cream-light transition-colors duration-500">Términos y condiciones</Link></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-3 text-sm text-cream-light/85">
                <li className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-burgundy mt-0.5 flex-shrink-0" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <a href="tel:+525512683401" className="hover:text-cream-light transition-colors duration-500 tabular-nums">
                    +52 55 1268 3401
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-burgundy mt-0.5 flex-shrink-0" aria-hidden>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22 6 12 13 2 6" />
                  </svg>
                  <a href="mailto:soporte@talan.com.mx" className="hover:text-cream-light transition-colors duration-500 break-all">
                    soporte@talan.com.mx
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-burgundy mt-0.5 flex-shrink-0" aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Ciudad de México, México</span>
                </li>
              </ul>
              <a
                href={waHref(WA_NUMBER_FALLBACK, WA_MESSAGES.default)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex items-center gap-3 rounded-full bg-cream-light text-ink px-7 py-3.5 text-[11px] font-medium tracking-[0.18em] uppercase hover:bg-cream transition-all duration-500 hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 text-[#25D366]" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.464 3.488" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          <div className="hairline-x-light relative" />

          {/* Bloque inferior: copyright + disclaimer */}
          <div className="relative max-w-4xl mx-auto px-6 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] tracking-wide text-cream-light/55">
            <p>
              © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados. · Cédula CNSF{" "}
              <strong className="font-medium tabular-nums">V388618</strong> ·{" "}
              <a
                href="https://agentesajustadores.cnsf.gob.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline hover:text-cream-light transition-colors duration-500"
              >
                Verificar
              </a>
            </p>
            <Link
              href="/aviso-privacidad"
              className="link-underline hover:text-cream-light transition-colors duration-500"
            >
              Aviso de Privacidad
            </Link>
          </div>
          <div className="relative border-t border-cream-light/10">
            <p className="max-w-4xl mx-auto px-6 py-5 text-[11px] text-cream-light/45 leading-relaxed">
              La información de este sitio tiene fines informativos. Iria Talan, Cédula CNSF V388618, actúa como Agente de Seguros autorizado. Las condiciones finales se rigen por la póliza emitida por la aseguradora y la normativa fiscal vigente al momento de la contratación o pago. Consulta con tu asesor fiscal la aplicabilidad a tu caso particular. Las cifras de costos mencionadas son ilustrativas y sujetas a evaluación individual por aseguradora.
            </p>
          </div>
        </footer>
        <WhatsAppFloat />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
