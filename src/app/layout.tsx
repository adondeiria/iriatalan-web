import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist_Mono, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import {
  buildGraph,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

import { CookieBanner } from "@/components/cookie-banner";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Asesoría Financiera y Seguros`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Planeación patrimonial, seguros y retiro para personas, familias y empresas en México. Asesora MDRT Top of the Table · Cédula CNSF V388618 · Yale Wealth Management · 6 aseguradoras autorizadas.",
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
  },
  alternates: {
    canonical: SITE_URL,
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globalSchema = buildGraph(
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildLocalBusinessSchema()
  );

  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader siteName={SITE_NAME} />

        <div className="flex-1">{children}</div>

        <footer className="bg-cream-light border-t border-warm-brown/15 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-20 grid gap-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <Image
                src="/LOGOVECTORRIF.svg"
                alt={`${SITE_NAME} — Reingeniería Financiera`}
                width={56}
                height={56}
                className="h-14 w-auto"
              />
              <p className="mt-6 text-sm text-warm-brown/85 leading-relaxed max-w-xs">
                Asesoría Financiera y Patrimonial.
              </p>
              <div className="mt-7 flex items-center gap-5">
                <a
                  href="https://mx.linkedin.com/in/iriatalan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-warm-brown/60 hover:text-burgundy transition-colors duration-500"
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
                  className="text-warm-brown/60 hover:text-burgundy transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63 3.36.94 2.69 1.34 2.03 2 1.36 2.66.96 3.33.65 4.11.35 4.87.15 5.75.09 7.02.03 8.3.02 8.71.02 11.97s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.78.71 1.45 1.37 2.11.66.66 1.33 1.06 2.11 1.37.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.85 5.85 0 0 0 2.11-1.37 5.85 5.85 0 0 0 1.37-2.11c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.85 5.85 0 0 0-1.37-2.11A5.85 5.85 0 0 0 19.86.65c-.76-.3-1.64-.5-2.91-.56C15.67.03 15.26.02 12 .02zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.84a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/IriaTalan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-warm-brown/60 hover:text-burgundy transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M22.67 0H1.33C.6 0 0 .6 0 1.33v21.34C0 23.4.6 24 1.33 24h11.5v-9.29H9.69v-3.62h3.13V8.41c0-3.1 1.9-4.79 4.66-4.79 1.32 0 2.46.1 2.79.14v3.24h-1.92c-1.5 0-1.79.71-1.79 1.76v2.31h3.59l-.47 3.62h-3.12V24h6.11c.74 0 1.33-.6 1.33-1.33V1.33C24 .6 23.4 0 22.67 0z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@iriatips"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="text-warm-brown/60 hover:text-burgundy transition-colors duration-500"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden>
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.86a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-5">Servicios</p>
              <ul className="space-y-3 text-sm text-warm-brown">
                <li><Link href="/patrimonial" className="hover:text-burgundy transition-colors duration-500">Protección Patrimonial</Link></li>
                <li><Link href="/gmm" className="hover:text-burgundy transition-colors duration-500">Seguros Personales</Link></li>
                <li><Link href="/retiro" className="hover:text-burgundy transition-colors duration-500">Retiro e Inversiones</Link></li>
                <li><Link href="/hijos-neurodivergentes" className="hover:text-burgundy transition-colors duration-500">Planeación Familiar</Link></li>
                <li><Link href="/empresas" className="hover:text-burgundy transition-colors duration-500">Empresas y Persona Clave</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-5">Recursos</p>
              <ul className="space-y-3 text-sm text-warm-brown">
                <li><Link href="/recursos" className="hover:text-burgundy transition-colors duration-500">Recursos para clientes</Link></li>
                <li><Link href="/sobre-iria" className="hover:text-burgundy transition-colors duration-500">Sobre Iria</Link></li>
                <li><Link href="/mexicanos-en-el-extranjero" className="hover:text-burgundy transition-colors duration-500">Mexicanos en el extranjero</Link></li>
                <li><Link href="/aviso-privacidad" className="hover:text-burgundy transition-colors duration-500">Aviso de Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-burgundy font-medium mb-5">Contáctame</p>
              <ul className="space-y-3 text-sm text-warm-brown">
                <li>
                  <a
                    href="https://calendly.com/iriatalan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-burgundy transition-colors duration-500"
                  >
                    Agenda sesión inicial
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/525512683401"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-burgundy transition-colors duration-500"
                  >
                    WhatsApp +52 55 1268 3401
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:soporte@talan.com.mx"
                    className="hover:text-burgundy transition-colors duration-500 break-all"
                  >
                    soporte@talan.com.mx
                  </a>
                </li>
                <li className="text-warm-brown/70">
                  Bosque de Chapultepec, CDMX
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warm-brown/10">
            <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px] tracking-wide text-warm-brown/65">
              <p>
                © {new Date().getFullYear()} {SITE_NAME} · Cédula CNSF{" "}
                <strong className="font-medium tabular-nums">V388618</strong> ·{" "}
                <a
                  href="https://agentesajustadores.cnsf.gob.mx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline hover:text-burgundy transition-colors duration-500"
                >
                  Verificar
                </a>
              </p>
              <Link
                href="/aviso-privacidad"
                className="link-underline hover:text-burgundy transition-colors duration-500"
              >
                Aviso de Privacidad
              </Link>
            </div>
          </div>
          <div className="border-t border-warm-brown/10">
            <p className="max-w-6xl mx-auto px-6 py-5 text-[11px] text-warm-brown/55 leading-relaxed">
              Esta página tiene fines informativos; las condiciones específicas de cada producto se rigen por la póliza emitida por la aseguradora correspondiente. Las cifras de costos mencionadas son ilustrativas y sujetas a evaluación individual por aseguradora.
            </p>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
