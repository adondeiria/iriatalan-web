"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const SCROLL_THRESHOLD = 80;
const MEGA_CLOSE_DELAY_MS = 180;

type MenuItem = {
  label: string;
  href?: string;
  comingSoon?: boolean;
  langEn?: boolean;
};

type MenuCategory = {
  title: string;
  langEn?: boolean;
  items: MenuItem[];
};

// Mega-menu architecture — premium editorial structure.
// Items sin href (comingSoon: true) renderizan no-clickable con badge "Próximamente".
// langEn: true => agrega lang="en" para a11y/SEO cuando el label está en inglés.
const HELP_CATEGORIES: MenuCategory[] = [
  {
    title: "Ahorro e Inversión",
    items: [
      { label: "Seguros de Ahorro y Educacionales", comingSoon: true },
      { label: "Planes para Mujeres con patrimonio", href: "/personas/mujeres" },
      { label: "Gastos Médicos Mayores", href: "/gmm" },
      { label: "Seguros de Vida y Protección Familiar", href: "/patrimonial" },
      { label: "Fondos de Inversión", comingSoon: true },
      { label: "Mexicanos en el Extranjero", href: "/personas/mexicanos-en-el-extranjero" },
    ],
  },
  {
    title: "Retiro & Patrimonio",
    items: [
      { label: "PPR y Planes de retiro deducibles", href: "/retiro" },
      { label: "Planeación de Retiro", href: "/retiro" },
      { label: "Ahorro para Modalidad 40", href: "/retiro" },
    ],
  },
  {
    title: "Empresas & Socios",
    items: [
      { label: "Persona Clave (Hombre / Mujer Clave)", href: "/empresas" },
      { label: "Retiro Empresarial", href: "/empresas" },
      { label: "Vida Grupo", href: "/empresas" },
      { label: "GMM Colectivo", href: "/empresas" },
    ],
  },
  {
    title: "International Families",
    langEn: true,
    items: [
      { label: "Foreigners living in Mexico", href: "/foreigners-in-mexico", langEn: true },
      { label: "International Health Insurance", comingSoon: true, langEn: true },
      { label: "Retirement Planning", comingSoon: true, langEn: true },
    ],
  },
  {
    title: "Situaciones Especiales",
    items: [
      { label: "Familias neurodivergentes", href: "/personas/hijos-neurodivergentes" },
      { label: "Familias diversas", href: "/personas/familias-arcoiris" },
      { label: "Fideicomisos", href: "/patrimonial" },
      { label: "Protección Patrimonial", href: "/patrimonial" },
      { label: "Patrimonios complejos", href: "/patrimonial" },
    ],
  },
];

type Props = {
  siteName: string;
};

/**
 * Premium luxury editorial header.
 * - Top-level nav curated to 5 items (sitemap hidden behind "Cómo te ayudo" mega-menu)
 * - Mega-menu opens on hover (desktop) with grace delay
 * - Mobile uses fullscreen overlay with burger toggle
 * - Scroll-aware color transitions preserved from previous version
 */
export function SiteHeader({ siteName }: Props) {
  const [overHero, setOverHero] = useState(true);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll-aware color transitions.
  useEffect(() => {
    const handler = () => {
      setOverHero(window.scrollY < SCROLL_THRESHOLD);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when mobile menu is open.
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu when viewport upgrades to desktop.
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Escape key closes both menus.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const openMega = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMegaOpen(true);
  };

  const closeMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), MEGA_CLOSE_DELAY_MS);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-espresso/92 backdrop-blur-md border-b border-cream-light/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap"
            aria-label={`${siteName} — Inicio`}
            onClick={() => {
              setMegaOpen(false);
              setMobileOpen(false);
            }}
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

          {/* Desktop nav — curated 5 items */}
          <nav
            className={
              "hidden md:flex items-center gap-9 text-[13px] tracking-wide transition-colors duration-500 " +
              (overHero ? "text-cream-light/85" : "text-cream-light/85")
            }
          >
            <Link
              href="/"
              className={
                "transition-colors duration-300 " +
                (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
              }
            >
              Inicio
            </Link>

            {/* Cómo te ayudo — mega-menu trigger */}
            <div
              onMouseEnter={openMega}
              onMouseLeave={closeMega}
              className="relative"
            >
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-haspopup="true"
                onClick={() => setMegaOpen((v) => !v)}
                className={
                  "flex items-center gap-1.5 select-none transition-colors duration-300 " +
                  (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
                }
              >
                Cómo te ayudo
                <span
                  className={
                    "text-[10px] transition-transform duration-300 " +
                    (megaOpen ? "rotate-180" : "")
                  }
                >
                  ▾
                </span>
              </button>
            </div>

            <Link
              href="/blog"
              className={
                "transition-colors duration-300 " +
                (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
              }
            >
              Blog
            </Link>
            <Link
              href="/recursos"
              className={
                "transition-colors duration-300 " +
                (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
              }
            >
              Recursos
            </Link>
            <Link
              href="/sobre-iria"
              className={
                "transition-colors duration-300 " +
                (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
              }
            >
              Sobre Iria
            </Link>
            <Link
              href="/contacto"
              className={
                "transition-colors duration-300 " +
                (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
              }
            >
              Contacto
            </Link>
            <Link
              href="/foreigners-in-mexico"
              lang="en"
              aria-label="Foreigners in Mexico — English"
              className={
                "text-[11px] tracking-[0.18em] uppercase opacity-70 hover:opacity-100 transition-all duration-300 " +
                (overHero ? "hover:text-cream-light" : "hover:text-cream-light")
              }
            >
              EN
            </Link>
          </nav>

          {/* CTA + Mobile burger */}
          <div className="flex items-center gap-3">
            <Link
              href="/contacto"
              className="hidden md:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.18em] uppercase transition-all duration-500 whitespace-nowrap hover:-translate-y-0.5 bg-burgundy text-cream-light hover:bg-burgundy-deep shadow-[0_8px_24px_-8px_rgba(158,27,30,0.65)]"
            >
              Agenda una sesión
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>

            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
              className={
                "md:hidden flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-500 " +
                (overHero
                  ? "text-cream-light hover:bg-cream-light/10"
                  : "text-cream-light hover:bg-cream-light/10")
              }
            >
              <Menu className="size-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mega menu dropdown — full-width premium editorial */}
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          className={
            "absolute left-0 right-0 top-full hidden md:block bg-espresso/95 backdrop-blur-xl border-b border-cream-light/10 shadow-[0_24px_64px_-16px_rgba(20,17,15,0.55)] transition-all duration-300 origin-top " +
            (megaOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-2 pointer-events-none")
          }
          aria-hidden={!megaOpen}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid gap-x-10 gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {HELP_CATEGORIES.map((cat) => (
                <div key={cat.title} {...(cat.langEn ? { lang: "en" } : {})}>
                  <h3 className="text-[10px] uppercase tracking-[0.22em] text-burgundy font-medium mb-5">
                    {cat.title}
                  </h3>
                  <ul className="space-y-3.5">
                    {cat.items.map((item) => (
                      <li key={item.label}>
                        {item.comingSoon ? (
                          <span
                            className="block text-[13px] text-cream-light/40 cursor-not-allowed leading-snug"
                            {...(item.langEn ? { lang: "en" } : {})}
                          >
                            {item.label}
                            <span className="ml-1.5 inline-block text-[9px] uppercase tracking-wider align-middle text-burgundy/75 border border-burgundy/45 rounded-full px-1.5 py-px">
                              Próximamente
                            </span>
                          </span>
                        ) : (
                          <Link
                            href={item.href ?? "/"}
                            onClick={() => setMegaOpen(false)}
                            className="block text-[13px] text-cream-light/80 hover:text-cream-light transition-colors duration-300 leading-snug"
                            {...(item.langEn ? { lang: "en" } : {})}
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        className={
          "md:hidden fixed inset-0 z-[60] transition-opacity duration-500 " +
          (mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none")
        }
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-cream-light/98 backdrop-blur-xl" />
        <div className="relative h-full flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-warm-brown/10">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2"
              aria-label={`${siteName} — Inicio`}
            >
              <Image
                src="/LOGOVECTORRIF.svg"
                alt={`${siteName} — Reingeniería Financiera`}
                width={48}
                height={48}
                className="h-10 w-auto"
              />
              <span className="sr-only">{siteName}</span>
            </Link>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-warm-brown hover:bg-warm-brown/10 transition-colors duration-300"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-10">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block font-serif text-2xl text-ink"
            >
              Inicio
            </Link>

            {HELP_CATEGORIES.map((cat) => (
              <div key={cat.title} {...(cat.langEn ? { lang: "en" } : {})}>
                <h3 className="text-[10px] uppercase tracking-[0.22em] text-burgundy font-medium mb-4">
                  {cat.title}
                </h3>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li key={item.label}>
                      {item.comingSoon ? (
                        <span
                          className="block text-base text-warm-brown/45 cursor-not-allowed leading-snug"
                          {...(item.langEn ? { lang: "en" } : {})}
                        >
                          {item.label}
                          <span className="ml-1.5 inline-block text-[9px] uppercase tracking-wider align-middle text-burgundy/55 border border-burgundy/25 rounded-full px-1.5 py-px">
                            Próximamente
                          </span>
                        </span>
                      ) : (
                        <Link
                          href={item.href ?? "/"}
                          onClick={() => setMobileOpen(false)}
                          className="block text-base text-warm-brown hover:text-cream-light transition-colors duration-300 leading-snug"
                          {...(item.langEn ? { lang: "en" } : {})}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="pt-6 border-t border-warm-brown/10 space-y-4">
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="block text-lg font-medium text-ink"
              >
                Blog
              </Link>
              <Link
                href="/recursos"
                onClick={() => setMobileOpen(false)}
                className="block text-lg font-medium text-ink"
              >
                Recursos
              </Link>
              <Link
                href="/sobre-iria"
                onClick={() => setMobileOpen(false)}
                className="block text-lg font-medium text-ink"
              >
                Sobre Iria
              </Link>
              <Link
                href="/contacto"
                onClick={() => setMobileOpen(false)}
                className="block text-lg font-medium text-ink"
              >
                Contacto
              </Link>
              <Link
                href="/foreigners-in-mexico"
                onClick={() => setMobileOpen(false)}
                lang="en"
                className="block text-lg font-medium text-ink"
              >
                EN · Foreigners in Mexico
              </Link>
            </div>
          </nav>

          <div className="px-6 py-6 border-t border-warm-brown/10">
            <Link
              href="/contacto"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-burgundy text-cream-light px-5 py-3.5 text-xs font-medium tracking-[0.18em] uppercase shadow-[0_8px_24px_-8px_rgba(158,27,30,0.45)]"
            >
              Agenda una sesión
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
