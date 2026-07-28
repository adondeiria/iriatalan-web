import { type PortableTextBlock } from "@portabletext/react";

import { slugifyHeading } from "@/components/blog/portable-blocks";

/**
 * TableOfContents — server component que parsea el body PortableText
 * extrayendo H2 y H3 con sus anchor IDs.
 *
 * V1 server-rendered (sin scroll-spy). Iteración futura: hacer client component
 * con IntersectionObserver para resaltar sección activa.
 */

type TocItem = {
  text: string;
  id: string;
  level: 2 | 3;
};

type BlockWithStyle = {
  _type?: string;
  style?: string;
  children?: Array<{ text?: string }>;
};

function extractHeadings(body: unknown[] | null | undefined): TocItem[] {
  if (!Array.isArray(body)) return [];
  const items: TocItem[] = [];
  for (const block of body as BlockWithStyle[]) {
    if (block._type !== "block") continue;
    if (block.style !== "h2" && block.style !== "h3") continue;
    const text = (block.children ?? [])
      .map((c) => c.text ?? "")
      .join("")
      .trim();
    if (!text) continue;
    const id = slugifyHeading(text);
    items.push({ text, id, level: block.style === "h2" ? 2 : 3 });
  }
  return items;
}

/**
 * `card` — tarjeta en el flujo del artículo (móvil y tablet).
 * `rail` — lista sin marco para el riel lateral fijo en escritorio, con
 *          filete vertical a la izquierda a modo de guía de lectura.
 */
export function TableOfContents({
  body,
  variant = "card",
}: {
  body: PortableTextBlock[] | unknown[] | null | undefined;
  variant?: "card" | "rail";
}) {
  const items = extractHeadings(body as unknown[] | null | undefined);
  if (items.length < 3) return null; // <3 headings = no aporta

  if (variant === "rail") {
    return (
      <nav aria-label="Tabla de contenido">
        <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
          En esta guía
        </p>
        <ol className="mt-4 list-none border-l border-warm-brown/20 dark:border-cream-light/15">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block border-l-2 border-transparent py-1.5 text-[13px] leading-snug text-warm-brown/85 dark:text-cream-light/70 transition-colors duration-300 hover:border-burgundy hover:text-burgundy dark:hover:text-burgundy ${
                  item.level === 3 ? "pl-7" : "pl-4"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Tabla de contenido"
      className="mt-8 mb-10 rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30 p-5 sm:p-6 bg-cream/30 dark:bg-coffee/20"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-warm-brown/85 dark:text-cream-light/65">
        En este artículo
      </p>
      <ol className="mt-3 space-y-1.5 list-none">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-5" : ""}>
            <a
              href={`#${item.id}`}
              className="text-sm leading-snug text-warm-brown dark:text-cream-light/85 hover:text-burgundy dark:hover:text-burgundy underline-offset-4 hover:underline decoration-burgundy/40"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
