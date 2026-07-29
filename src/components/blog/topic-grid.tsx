import Link from "next/link";

import {
  TOPIC_LABELS,
  TOPIC_TO_URL_SLUG,
  type ArticleTopic,
} from "@/lib/blog";

/**
 * "Explora por tema" — rejilla de categorías del blog.
 *
 * DECISIÓN IMPORTANTE, no cambiar sin pensarlo: solo se renderizan los temas
 * que TIENEN artículos publicados, y se muestra el conteo.
 *
 * La maqueta original proponía 6 tarjetas fijas. Con el contenido real de hoy
 * (patrimonial 4, gmm 2, retiro 2, educacionales 1; y vida/fideicomisos/
 * empresas/casos en cero) tres de esas tarjetas habrían llevado a hubs vacíos
 * —soft-404 a ojos de Google— y encima la maqueta omitía `patrimonial`, que es
 * justo el cluster más fuerte del sitio.
 *
 * Así la rejilla se arma sola: cada artículo nuevo la hace crecer, y nunca
 * enseña un cuarto vacío.
 */

type Props = {
  /** Conteo de artículos publicados por topic. */
  conteoPorTema: Record<string, number>;
};

/** Descripción corta por tema, orientada a la duda del lector, no al producto. */
const DESCRIPCION_TARJETA: Record<string, string> = {
  retiro:
    "Modalidad 40, PPR, AFORE, rentas vitalicias y cuánto necesitas para dejar de trabajar.",
  gmm: "Deducible, coaseguro, maternidad, hospitales y cobertura en el extranjero.",
  vida: "Cuánta suma asegurada te corresponde, qué tipo conviene y para qué más sirve.",
  patrimonial:
    "Beneficiarios, testamento, sucesión y cómo proteger a quien depende de ti.",
  educacionales:
    "Cuánto cuesta la universidad, cómo empezar a ahorrar y qué pasa si tú faltas.",
  fideicomisos:
    "Cuándo un fideicomiso resuelve de verdad y cuándo es un gasto innecesario.",
  empresas:
    "Persona clave, continuidad del negocio y beneficios para tu equipo.",
  casos:
    "Situaciones que no encajan en lo estándar y requieren diseño a la medida.",
};

/** Iconos de línea, uno por tema. Sin dependencias, coherentes entre sí. */
function IconoTema({ tema }: { tema: string }) {
  const comun = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-7 text-burgundy",
    "aria-hidden": true,
  };
  switch (tema) {
    case "retiro":
      return (
        <svg {...comun}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15.5 14" />
        </svg>
      );
    case "gmm":
      return (
        <svg {...comun}>
          <path d="M20.8 8.6a5.4 5.4 0 0 0-9.3-3A5.4 5.4 0 0 0 3.2 8.6c0 5.2 8.3 10.4 8.3 10.4s8.3-5.2 8.3-10.4z" />
          <polyline points="8.5 11 10.5 11 11.7 9.2 13 13 14.2 11 16 11" />
        </svg>
      );
    case "vida":
      return (
        <svg {...comun}>
          <path d="M12 21s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 3.5C20 16.4 12 21 12 21z" />
        </svg>
      );
    case "patrimonial":
      return (
        <svg {...comun}>
          <path d="M12 3l8 4v5c0 4.6-3.4 8.3-8 9-4.6-.7-8-4.4-8-9V7z" />
          <polyline points="9 12 11.2 14.2 15.5 10" />
        </svg>
      );
    case "educacionales":
      return (
        <svg {...comun}>
          <path d="M3 8.5 12 4l9 4.5-9 4.5z" />
          <path d="M7 11v5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5" />
        </svg>
      );
    case "fideicomisos":
      return (
        <svg {...comun}>
          <rect x="4" y="9" width="16" height="11" rx="2" />
          <path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2" />
          <circle cx="12" cy="14.5" r="1.4" />
        </svg>
      );
    case "empresas":
      return (
        <svg {...comun}>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M9 8V6.5A2.5 2.5 0 0 1 11.5 4h1A2.5 2.5 0 0 1 15 6.5V8" />
          <line x1="3" y1="13" x2="21" y2="13" />
        </svg>
      );
    default:
      return (
        <svg {...comun}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="8.01" />
          <path d="M12 11.5v4.5" />
        </svg>
      );
  }
}

export function TopicGrid({ conteoPorTema }: Props) {
  // Orden: primero los temas con más artículos. El lector ve antes lo que
  // tiene más profundidad, que es también lo que mejor te posiciona.
  const temas = Object.entries(conteoPorTema)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  if (temas.length === 0) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {temas.map(([tema, n]) => (
        <li key={tema}>
          <Link
            href={`/blog/categoria/${
              TOPIC_TO_URL_SLUG[tema as ArticleTopic] ?? tema
            }`}
            className="group flex h-full flex-col rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-coffee/20 p-6 transition-all duration-500 hover:border-burgundy/35 hover:shadow-[0_18px_40px_-22px_rgba(20,17,15,0.28)]"
          >
            <IconoTema tema={tema} />
            <h3 className="mt-4 font-serif text-xl leading-snug text-ink dark:text-cream-light transition-colors duration-500 group-hover:text-burgundy">
              {TOPIC_LABELS[tema] ?? tema}
            </h3>
            <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-warm-brown/85 dark:text-cream-light/65">
              {DESCRIPCION_TARJETA[tema] ?? ""}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-burgundy">
              {n === 1 ? "1 artículo" : `${n} artículos`}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                aria-hidden
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
