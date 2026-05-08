import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
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

        <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Image
                src="/LOGOVECTORRIF.svg"
                alt={`${SITE_NAME} — Reingeniería Financiera`}
                width={56}
                height={56}
                className="h-14 w-auto"
              />
              <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
                Asesoría patrimonial discreta para familias afluentes y HNWI en México.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Servicios</p>
              <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <li><Link href="/retiro" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">Planeación de Retiro</Link></li>
                <li><Link href="/gmm" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">Gastos Médicos Mayores</Link></li>
                <li><Link href="/empresas" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">Empresas</Link></li>
                <li><Link href="/patrimonial" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">Patrimonios complejos</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-4">Contacto</p>
              <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                <li>
                  <a href="https://calendly.com/iriatalan" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">
                    Agenda sesión inicial
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/525512683401" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:soporte@talan.com.mx" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition break-all">
                    soporte@talan.com.mx
                  </a>
                </li>
                <li>
                  <Link href="/sobre-iria" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">
                    Sobre Iria
                  </Link>
                </li>
                <li>
                  <Link href="/recursos" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition">
                    Recursos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
              <p>
                © {new Date().getFullYear()} {SITE_NAME} · Cédula CNSF{" "}
                <strong className="font-medium">V388618</strong> ·{" "}
                <a
                  href="https://agentesajustadores.cnsf.gob.mx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Verificar
                </a>
              </p>
              <Link
                href="/aviso-privacidad"
                className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Aviso de Privacidad
              </Link>
            </div>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-900">
            <p className="max-w-6xl mx-auto px-6 py-4 text-[11px] text-zinc-400 leading-relaxed">
              Esta página tiene fines informativos; las condiciones específicas de cada producto se rigen por la póliza emitida por la aseguradora correspondiente. Las cifras de costos mencionadas son ilustrativas y sujetas a evaluación individual por aseguradora.
            </p>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
