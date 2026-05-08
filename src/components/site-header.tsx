"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SCROLL_THRESHOLD = 80; // px scrolled before header switches to light mode

type Props = {
  siteName: string;
};

/**
 * Dark-aware sticky header. Transparent over the dark hero (scrollY < threshold),
 * solid white over content (scrollY >= threshold). Logo + nav text switch color
 * with scroll position to maintain contrast.
 */
export function SiteHeader({ siteName }: Props) {
  const [overHero, setOverHero] = useState(true);

  useEffect(() => {
    const handler = () => {
      setOverHero(window.scrollY < SCROLL_THRESHOLD);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 transition-colors duration-300 " +
        (overHero
          ? "bg-transparent border-b border-transparent"
          : "bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800")
      }
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 whitespace-nowrap"
          aria-label={`${siteName} — Inicio`}
        >
          <Image
            src="/LOGOVECTORRIF.svg"
            alt={`${siteName} — Reingeniería Financiera`}
            width={48}
            height={48}
            priority
            className="h-10 w-auto sm:h-12"
          />
          <span className="sr-only">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <nav
          className={
            "hidden md:flex items-center gap-5 text-sm transition-colors duration-300 " +
            (overHero
              ? "text-zinc-200"
              : "text-zinc-700 dark:text-zinc-300")
          }
        >
          {/* Personas */}
          <details className="relative group">
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-white" : "hover:text-zinc-900 dark:hover:text-zinc-50")
              }
            >
              Personas <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50 text-zinc-700 dark:text-zinc-300">
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
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-white" : "hover:text-zinc-900 dark:hover:text-zinc-50")
              }
            >
              Empresas <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50 text-zinc-700 dark:text-zinc-300">
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
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-white" : "hover:text-zinc-900 dark:hover:text-zinc-50")
              }
            >
              Patrimonios <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-3 z-50 text-zinc-700 dark:text-zinc-300">
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
              <Link
                href="/mexicanos-en-el-extranjero"
                className="block px-4 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-50">Mexicanos en el extranjero</div>
                <div className="text-xs text-zinc-500 mt-0.5">Asesoría a distancia para residentes en EUA, Europa o Canadá</div>
              </Link>
            </div>
          </details>

          <Link
            href="/recursos"
            className={
              "transition " +
              (overHero ? "hover:text-white" : "hover:text-zinc-900 dark:hover:text-zinc-50")
            }
          >
            Recursos
          </Link>
          <Link
            href="/sobre-iria"
            className={
              "transition " +
              (overHero ? "hover:text-white" : "hover:text-zinc-900 dark:hover:text-zinc-50")
            }
          >
            Sobre Iria
          </Link>
        </nav>

        <Link
          href="/contacto"
          className="inline-flex items-center gap-2 rounded-full bg-rif-rojo text-white px-5 py-2 text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
        >
          Agenda
          <ArrowRight className="size-3.5" strokeWidth={2.2} />
        </Link>
      </div>

      {/* Mobile nav */}
      <nav
        className={
          "md:hidden border-t px-6 py-3 flex flex-wrap gap-x-4 gap-y-2 text-xs transition-colors duration-300 " +
          (overHero
            ? "border-zinc-800 bg-zinc-950/95 text-zinc-200"
            : "border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 text-zinc-700 dark:text-zinc-300")
        }
      >
        <Link href="/sobre-iria" className="hover:underline">Sobre Iria</Link>
        <Link href="/gmm" className="hover:underline">GMM</Link>
        <Link href="/retiro" className="hover:underline">Retiro</Link>
        <Link href="/empresas" className="hover:underline">Empresas</Link>
        <Link href="/patrimonial" className="hover:underline">Patrimonial</Link>
        <Link href="/mujeres" className="hover:underline">Mujeres</Link>
        <Link href="/familias-arcoiris" className="hover:underline">Arcoíris</Link>
        <Link href="/hijos-neurodivergentes" className="hover:underline">Neurodivergentes</Link>
        <Link href="/mexicanos-en-el-extranjero" className="hover:underline">Mex. en el extranjero</Link>
        <Link href="/recursos" className="hover:underline">Recursos</Link>
        <Link href="/contacto" className="hover:underline font-medium text-rif-rojo">Agenda</Link>
      </nav>
    </header>
  );
}
