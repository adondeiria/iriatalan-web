import Link from "next/link";

/**
 * Custom PortableText block renderers — usados por src/components/portable-text.tsx
 * cuando el body de un artículo contiene tipos custom definidos en
 * sanity/schemas/article.ts (keyTakeaways, comparisonTable, disclaimer,
 * dataCallout, glossaryReference).
 *
 * Diseño: estilo coherente con /blog/[slug]/page.tsx luxury palette
 * (burgundy, ink, cream, warm-brown). Sin gradientes / sin chips SaaS.
 *
 * Citabilidad LLM:
 *  - keyTakeaways → bullets en `<ul>` semántico citable literal
 *  - comparisonTable → `<table>` HTML real (no imagen) → Perplexity la extrae
 *  - disclaimer → señaliza responsabilidad YMYL
 *  - dataCallout → atribución visible publisher + fecha + URL → LLMs validan fuente
 *  - glossaryReference → internal link cluster a /glosario
 */

// =========================================================
// Helper: slugify para anchor links de headings (compartido con TOC)
// =========================================================
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// =========================================================
// KeyTakeaways
// =========================================================
export type KeyTakeawaysValue = {
  items?: string[];
};

export function KeyTakeaways({ value }: { value: KeyTakeawaysValue }) {
  const items = Array.isArray(value?.items) ? value.items : [];
  if (items.length === 0) return null;

  return (
    <aside
      className="mt-10 mb-10 rounded-2xl border border-burgundy/15 bg-cream/40 dark:bg-coffee/30 dark:border-burgundy/30 p-7"
      aria-label="Puntos clave"
    >
      <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
        Puntos clave
      </p>
      <ul className="mt-4 space-y-3 list-none">
        {items.map((item, i) => (
          <li
            key={i}
            className="pl-6 relative text-warm-brown dark:text-cream-light/85 leading-relaxed"
          >
            <span
              aria-hidden
              className="absolute left-0 top-[0.55em] w-2.5 h-2.5 rounded-full bg-burgundy"
            />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}

// =========================================================
// ComparisonTable
// =========================================================
export type ComparisonTableValue = {
  caption?: string;
  headers?: string[];
  rows?: Array<{ cells?: string[] }>;
};

export function ComparisonTable({ value }: { value: ComparisonTableValue }) {
  const headers = value?.headers ?? [];
  const rows = value?.rows ?? [];
  if (headers.length === 0 || rows.length === 0) return null;

  return (
    <figure className="mt-10 mb-10 -mx-2 sm:mx-0">
      {value.caption && (
        <figcaption className="mb-3 text-sm text-warm-brown/85 dark:text-cream-light/65 italic px-2">
          {value.caption}
        </figcaption>
      )}
      <div className="overflow-x-auto rounded-2xl border border-warm-brown/15 dark:border-warm-brown/30">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-cream/40 dark:bg-coffee/30">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="text-left font-medium text-ink dark:text-cream-light px-4 py-3 border-b border-warm-brown/15 dark:border-warm-brown/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="border-b last:border-b-0 border-warm-brown/10 dark:border-warm-brown/20"
              >
                {(row.cells ?? []).map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-4 py-3 text-warm-brown dark:text-cream-light/85 align-top leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

// =========================================================
// DisclaimerBox
// =========================================================
export type DisclaimerValue = {
  variant?: "financiero" | "medico" | "legal" | "generico";
  text?: string;
};

const DISCLAIMER_LABELS: Record<string, string> = {
  financiero: "Aviso educativo",
  medico: "Aviso médico",
  legal: "Aviso legal",
  generico: "Aviso",
};

export function DisclaimerBox({ value }: { value: DisclaimerValue }) {
  if (!value?.text) return null;
  const label = DISCLAIMER_LABELS[value.variant ?? "generico"] ?? "Aviso";

  return (
    <aside
      role="note"
      className="mt-8 mb-8 rounded-xl border-l-4 border-warm-brown/40 bg-warm-brown/5 dark:bg-warm-brown/10 px-5 py-4"
    >
      <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-warm-brown/70 dark:text-cream-light/55">
        {label}
      </p>
      <p className="mt-2 text-sm text-warm-brown dark:text-cream-light/80 leading-relaxed">
        {value.text}
      </p>
    </aside>
  );
}

// =========================================================
// DataCallout — cita inline con publisher visible
// =========================================================
export type DataCalloutValue = {
  claim?: string;
  sourceName?: string;
  publisher?: string;
  sourceUrl?: string;
  publishedAt?: string;
};

export function DataCallout({ value }: { value: DataCalloutValue }) {
  if (!value?.claim || !value?.sourceUrl) return null;

  let yearLabel = "";
  if (value.publishedAt) {
    try {
      yearLabel = new Date(value.publishedAt).getFullYear().toString();
    } catch {
      yearLabel = "";
    }
  }

  return (
    <aside className="mt-8 mb-8 rounded-2xl border border-warm-brown/20 dark:border-warm-brown/30 p-6 bg-white/40 dark:bg-coffee/20">
      <blockquote className="text-base text-ink dark:text-cream-light leading-relaxed">
        “{value.claim}”
      </blockquote>
      <p className="mt-3 text-xs text-warm-brown/85 dark:text-cream-light/65">
        <a
          href={value.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-ink dark:text-cream-light underline underline-offset-4 decoration-warm-brown/40 hover:decoration-burgundy"
        >
          {value.sourceName ?? "Fuente"}
        </a>
        {value.publisher && (
          <span className="text-warm-brown/60 dark:text-cream-light/55">
            {" "}— {value.publisher}
          </span>
        )}
        {yearLabel && (
          <span className="text-warm-brown/60 dark:text-cream-light/55">
            {" "}({yearLabel})
          </span>
        )}
      </p>
    </aside>
  );
}

// =========================================================
// GlossaryReferenceLink — link inline a /glosario/[slug]
// =========================================================
export type GlossaryReferenceValue = {
  term?: {
    _id?: string;
    term?: string;
    slug?: string;
    shortDefinition?: string;
    draft?: boolean;
  };
  display?: string;
};

export function GlossaryReferenceLink({
  value,
}: {
  value: GlossaryReferenceValue;
}) {
  const term = value?.term;
  // Si el término está en draft, renderiza solo el texto (no link a 404).
  if (!term?.slug || term.draft) {
    return <span>{value?.display ?? term?.term ?? ""}</span>;
  }
  return (
    <Link
      href={`/glosario/${term.slug}`}
      title={term.shortDefinition}
      className="underline underline-offset-4 decoration-dotted decoration-burgundy/50 hover:decoration-burgundy text-ink dark:text-cream-light"
    >
      {value.display ?? term.term ?? ""}
    </Link>
  );
}
