import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 whitespace-nowrap"
              aria-label={`${SITE_NAME} — Inicio`}
            >
              <Image
                src="/LOGOVECTORRIF.svg"
                alt={`${SITE_NAME} — Reingeniería Financiera`}
                width={48}
                height={48}
                priority
                className="h-10 w-auto sm:h-12"
              />
              <span className="sr-only">{SITE_NAME}</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-5 text-sm">

              {/* Personas */}
              <details className="relative group">
                <summary className="list-none cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition flex items-center gap-1 select-none">
                  Personas <span className="text-xs">▾</span>
                </summary>
                <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50">
                  <Link
                    href="/gmm"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Gastos Médicos Mayores</div>
                    <div className="text-xs text-zinc-500 mt-0.5">6 aseguradoras · comparativo personalizado</div>
                  </Link>
                  <Link
                    href="/retiro"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Seguro de Vida</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Protección patrimonial y familiar</div>
                  </Link>
                  <Link
                    href="/retiro"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Retiro · PPR · Modalidad 40</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Beneficio fiscal + pensión multiplicada</div>
                  </Link>
                  <Link
                    href="/mujeres"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Protección familiar</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Estrategias para mujeres, parejas y familias</div>
                  </Link>
                </div>
              </details>

              {/* Empresas */}
              <details className="relative group">
                <summary className="list-none cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition flex items-center gap-1 select-none">
                  Empresas <span className="text-xs">▾</span>
                </summary>
                <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50">
                  <Link
                    href="/empresas"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Persona clave</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Continuidad si falta un socio o talento clave</div>
                  </Link>
                  <Link
                    href="/empresas"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Vida grupo</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Prestación deducible para tu equipo</div>
                  </Link>
                  <Link
                    href="/empresas"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">GMM colectivo</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Cobertura médica para empleados clave</div>
                  </Link>
                  <Link
                    href="/empresas"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Retiro empresarial</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Plan de retiro deducible para socios</div>
                  </Link>
                </div>
              </details>

              {/* Patrimonios */}
              <details className="relative group">
                <summary className="list-none cursor-pointer text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition flex items-center gap-1 select-none">
                  Patrimonios <span className="text-xs">▾</span>
                </summary>
                <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50">
                  <Link
                    href="/patrimonial"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Fideicomisos</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Protección y transmisión patrimonial</div>
                  </Link>
                  <Link
                    href="/patrimonial"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Sucesión patrimonial</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Que tu voluntad se cumpla</div>
                  </Link>
                  <Link
                    href="/hijos-neurodivergentes"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Hijos neurodivergentes</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Planeación de por vida, más allá de ti</div>
                  </Link>
                  <Link
                    href="/familias-arcoiris"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">Familias diversas</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Estructura legal para tu familia tal como es</div>
                  </Link>
                  <Link
                    href="/patrimonial"
                    className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-50">HNWI</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Asesoría discreta para patrimonios complejos</div>
                  </Link>
                </div>
              </details>

              <Link
                href="/recursos"
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition"
              >
                Recursos
              </Link>
              <Link
                href="/sobre-iria"
                className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition"
              >
                Sobre Iria
              </Link>
            </nav>

            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-full bg-rif-rojo text-white px-5 py-2 text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
            >
              Agenda
            </Link>
          </div>

          {/* Mobile nav */}
          <nav className="md:hidden border-t border-zinc-200 dark:border-zinc-800 px-6 py-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <Link href="/sobre-iria" className="hover:underline">Sobre Iria</Link>
            <Link href="/gmm" className="hover:underline">GMM</Link>
            <Link href="/retiro" className="hover:underline">Retiro</Link>
            <Link href="/empresas" className="hover:underline">Empresas</Link>
            <Link href="/patrimonial" className="hover:underline">Patrimonial</Link>
            <Link href="/mujeres" className="hover:underline">Mujeres</Link>
            <Link href="/familias-arcoiris" className="hover:underline">Arcoíris</Link>
            <Link href="/hijos-neurodivergentes" className="hover:underline">Neurodivergentes</Link>
            <Link href="/recursos" className="hover:underline">Recursos</Link>
            <Link href="/contacto" className="hover:underline font-medium text-rif-rojo">Agenda</Link>
          </nav>
        </header>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-12">
          <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{SITE_NAME}</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Asesoría financiera personalizada en México para familias afluentes y patrimonios HNWI.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Servicios</p>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li><Link href="/retiro" className="hover:underline">Planeación de Retiro</Link></li>
                <li><Link href="/gmm" className="hover:underline">Gastos Médicos Mayores</Link></li>
                <li><Link href="/empresas" className="hover:underline">Seguros para Empresas</Link></li>
                <li><Link href="/patrimonial" className="hover:underline">Patrimonios complejos</Link></li>
                <li><Link href="/mujeres" className="hover:underline">Mujeres</Link></li>
                <li><Link href="/familias-arcoiris" className="hover:underline">Familias arcoíris</Link></li>
                <li><Link href="/hijos-neurodivergentes" className="hover:underline">Hijos neurodivergentes</Link></li>
                <li><Link href="/sobre-iria" className="hover:underline">Sobre Iria</Link></li>
                <li><Link href="/recursos" className="hover:underline">Recursos</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Contacto</p>
              <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <li>
                  <a href="https://wa.me/525512683401" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    WhatsApp +52 55 1268 3401
                  </a>
                </li>
                <li>
                  <a href="mailto:soporte@talan.com.mx" className="hover:underline break-all">
                    soporte@talan.com.mx
                  </a>
                </li>
                <li>
                  <a href="https://calendly.com/iriatalan" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Agenda en Calendly
                  </a>
                </li>
                <li>
                  <Link href="/contacto" className="hover:underline">
                    Página de contacto
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-zinc-500 leading-relaxed">
              <p>
                Iria Talan — Asesora Autorizada por la Comisión Nacional de Seguros y Fianzas (CNSF).
                Cédula <strong>V388618</strong> ·{" "}
                <a
                  href="https://agentesajustadores.cnsf.gob.mx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Verificar en CNSF
                </a>
                . Esta página tiene fines informativos; las condiciones específicas
                de cada producto se rigen por la póliza emitida por la aseguradora correspondiente.
                Las cifras de costos mencionadas son ilustrativas y sujetas a evaluación individual por aseguradora.
              </p>
              <p className="mt-3">
                © {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados.{" "}
                <Link
                  href="/aviso-privacidad"
                  className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Aviso de Privacidad
                </Link>
                .
              </p>
            </div>
          </div>
        </footer>
        <CookieBanner />
      </body>
    </html>
  );
}
