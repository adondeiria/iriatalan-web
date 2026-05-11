"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SCROLL_THRESHOLD = 80;

type Props = {
  siteName: string;
};

/**
 * Dark-aware sticky header. Transparent over the dark hero (scrollY < threshold),
 * cream solid over content. Logo + nav text switch color with scroll position.
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
        "sticky top-0 z-50 transition-colors duration-500 " +
        (overHero
          ? "bg-transparent border-b border-transparent"
          : "bg-cream-light/85 backdrop-blur-md border-b border-warm-brown/15")
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
            "hidden md:flex items-center gap-6 text-sm transition-colors duration-500 " +
            (overHero ? "text-cream-light/85" : "text-warm-brown")
          }
        >
          {/* Servicios */}
          <details className="relative group">
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-cream-light" : "hover:text-ink")
              }
            >
              Servicios <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-warm-brown/15 bg-cream-light shadow-[0_24px_48px_-16px_rgba(20,17,15,0.18)] p-3 z-50 text-warm-brown">
              <Link
                href="/gmm"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Gastos Médicos Mayores</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">6 aseguradoras · comparativo personalizado</div>
              </Link>
              <Link
                href="/retiro"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Seguro de Vida</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Protección patrimonial y familiar</div>
              </Link>
              <Link
                href="/retiro"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Retiro · PPR · Modalidad 40</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Beneficio fiscal + pensión multiplicada</div>
              </Link>
            </div>
          </details>

          {/* Personas */}
          <details className="relative group">
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-cream-light" : "hover:text-ink")
              }
            >
              Personas <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-warm-brown/15 bg-cream-light shadow-[0_24px_48px_-16px_rgba(20,17,15,0.18)] p-3 z-50 text-warm-brown">
              <Link
                href="/personas"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Ver todos los perfiles</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Hub de personas que asesoro</div>
              </Link>
              <Link
                href="/personas/mujeres"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Asesoría para mujeres</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Profesionistas, divorciadas, viudas, empresarias</div>
              </Link>
              <Link
                href="/personas/hijos-neurodivergentes"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Hijos neurodivergentes</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Planeación de por vida, más allá de ti</div>
              </Link>
              <Link
                href="/personas/familias-arcoiris"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Familias diversas</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Estructura legal para tu familia tal como es</div>
              </Link>
              <Link
                href="/personas/mexicanos-en-el-extranjero"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Mexicanos en el extranjero</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Asesoría a distancia para residentes en EUA, Europa o Canadá</div>
              </Link>
            </div>
          </details>

          {/* Empresas */}
          <details className="relative group">
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-cream-light" : "hover:text-ink")
              }
            >
              Empresas <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-warm-brown/15 bg-cream-light shadow-[0_24px_48px_-16px_rgba(20,17,15,0.18)] p-3 z-50 text-warm-brown">
              <Link
                href="/empresas"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Persona clave</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Continuidad si falta un socio o talento clave</div>
              </Link>
              <Link
                href="/empresas"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Vida grupo</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Prestación deducible para tu equipo</div>
              </Link>
              <Link
                href="/empresas"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">GMM colectivo</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Cobertura médica para empleados clave</div>
              </Link>
              <Link
                href="/empresas"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Retiro empresarial</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Plan de retiro deducible para socios</div>
              </Link>
            </div>
          </details>

          {/* Patrimonios */}
          <details className="relative group">
            <summary
              className={
                "list-none cursor-pointer transition flex items-center gap-1 select-none " +
                (overHero ? "hover:text-cream-light" : "hover:text-ink")
              }
            >
              Patrimonios <span className="text-xs">▾</span>
            </summary>
            <div className="absolute left-0 mt-3 w-72 rounded-2xl border border-warm-brown/15 bg-cream-light shadow-[0_24px_48px_-16px_rgba(20,17,15,0.18)] p-3 z-50 text-warm-brown">
              <Link
                href="/patrimonial"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Fideicomisos</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Protección y transmisión patrimonial</div>
              </Link>
              <Link
                href="/patrimonial"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">Sucesión patrimonial</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Que tu voluntad se cumpla</div>
              </Link>
              <Link
                href="/patrimonial"
                className="block px-4 py-2.5 rounded-xl hover:bg-cream transition-colors duration-300"
              >
                <div className="font-medium text-ink">HNWI</div>
                <div className="text-xs text-warm-brown/60 mt-0.5">Asesoría discreta para patrimonios complejos</div>
              </Link>
            </div>
          </details>

          <Link
            href="/recursos"
            className={
              "transition " +
              (overHero ? "hover:text-cream-light" : "hover:text-ink")
            }
          >
            Recursos
          </Link>
          <Link
            href="/sobre-iria"
            className={
              "transition " +
              (overHero ? "hover:text-cream-light" : "hover:text-ink")
            }
          >
            Sobre Iria
          </Link>
          <Link
            href="/foreigners-in-mexico"
            className={
              "transition " +
              (overHero ? "hover:text-cream-light" : "hover:text-ink")
            }
            lang="en"
          >
            Foreigners Living in Mexico
          </Link>
        </nav>

        <Link
          href="/contacto"
          className={
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-500 whitespace-nowrap hover:-translate-y-0.5 " +
            (overHero
              ? "border border-cream-light/40 text-cream-light hover:bg-cream-light hover:text-burgundy hover:border-cream-light"
              : "bg-burgundy text-cream-light hover:bg-burgundy-deep shadow-[0_8px_24px_-8px_rgba(158,27,30,0.45)]")
          }
        >
          Agenda sesión inicial
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Mobile nav */}
      <nav
        className={
          "md:hidden border-t px-6 py-3 flex flex-wrap gap-x-4 gap-y-2 text-xs transition-colors duration-500 " +
          (overHero
            ? "border-warm-brown/30 bg-espresso/95 text-cream-light/85"
            : "border-warm-brown/15 bg-cream-light/95 text-warm-brown")
        }
      >
        <Link href="/sobre-iria" className="hover:underline">Sobre Iria</Link>
        <Link href="/gmm" className="hover:underline">GMM</Link>
        <Link href="/retiro" className="hover:underline">Retiro</Link>
        <Link href="/empresas" className="hover:underline">Empresas</Link>
        <Link href="/patrimonial" className="hover:underline">Patrimonial</Link>
        <Link href="/personas/mujeres" className="hover:underline">Mujeres</Link>
        <Link href="/personas/familias-arcoiris" className="hover:underline">Arcoíris</Link>
        <Link href="/personas/hijos-neurodivergentes" className="hover:underline">Neurodivergentes</Link>
        <Link href="/personas/mexicanos-en-el-extranjero" className="hover:underline">Mex. en el extranjero</Link>
        <Link href="/foreigners-in-mexico" className="hover:underline" lang="en">Foreigners Living in Mexico</Link>
        <Link href="/recursos" className="hover:underline">Recursos</Link>
        <Link href="/contacto" className="hover:underline font-medium text-burgundy">Agenda</Link>
      </nav>
    </header>
  );
}
