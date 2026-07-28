import Link from "next/link";

/**
 * Piezas de los rieles laterales del artículo.
 *
 * Resuelven dos huecos medidos en la auditoría de conversión:
 *  - el lector llegaba al final del artículo sin ningún punto de conversión
 *    intermedio (el CTA vivía solo en el cierre);
 *  - no había señal de autoría junto al texto, que es lo que sostiene E-E-A-T
 *    en un vertical YMYL.
 *
 * En escritorio viven en rieles fijos; en móvil caen en el flujo, después del
 * cuerpo, para no empujar el contenido hacia abajo.
 */

/**
 * CTA contextual. El texto se adapta al tema del artículo: no es lo mismo
 * ofrecer "revisar tu estrategia de retiro" que "revisar tu cobertura".
 */
export function ArticleCtaCard({
  href,
  heading,
  body,
  cta = "Agendar ahora",
}: {
  href: string;
  heading: string;
  body: string;
  cta?: string;
}) {
  return (
    <aside className="rounded-2xl border border-burgundy/20 dark:border-burgundy/35 bg-cream/50 dark:bg-coffee/25 p-5">
      <span
        aria-hidden
        className="flex items-center justify-center size-9 rounded-full ring-1 ring-burgundy/30 bg-burgundy/[0.06]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[18px] text-burgundy"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </span>
      <p className="mt-4 font-serif text-lg leading-snug text-ink dark:text-cream-light">
        {heading}
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-warm-brown/80 dark:text-cream-light/70">
        {body}
      </p>
      <Link
        href={href}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-burgundy px-5 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-cream-light transition-colors duration-500 hover:bg-burgundy-deep"
      >
        {cta}
      </Link>
    </aside>
  );
}
