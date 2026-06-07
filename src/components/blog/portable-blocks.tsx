import Image from "next/image";
import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";

import { CheckupGate } from "@/components/checkup-gate";
import { CalculadoraEducacionalGate } from "@/components/calculadora-educacional-gate";
import { ChecklistDiscapacidadGate } from "@/components/checklist-discapacidad-gate";

// =========================================================
// InlineImage — bloque image dentro del body Portable Text
// =========================================================
// Construye URL CDN desde el _ref del asset (ej. "image-c41561f5...-1376x768-png").
// Sin dependencia del cliente Sanity — solo necesita projectId + dataset (públicos).
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "0xa0dciq";
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const builder = imageUrlBuilder({ projectId: SANITY_PROJECT_ID, dataset: SANITY_DATASET });

export type InlineImageValue = {
  asset?: { _ref?: string; url?: string };
  alt?: string;
  caption?: string;
};

export function InlineImage({ value }: { value: InlineImageValue }) {
  const ref = value?.asset?._ref;
  const directUrl = value?.asset?.url;
  if (!ref && !directUrl) return null;

  // Extraer dimensiones del _ref: "image-<hash>-<width>x<height>-<ext>"
  let width = 1600;
  let height = 900;
  if (ref) {
    const dimMatch = ref.match(/-(\d+)x(\d+)-/);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
    }
  }

  const src = directUrl || builder.image(ref!).width(1600).fit("max").url();
  const alt = value?.alt || "Imagen ilustrativa";

  return (
    <figure className="my-10">
      <div className="relative w-full overflow-hidden rounded-2xl border border-warm-brown/10 dark:border-warm-brown/20">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 768px, 100vw"
          className="w-full h-auto"
        />
      </div>
      {value?.caption ? (
        <figcaption className="mt-3 text-sm text-warm-brown/70 dark:text-cream-light/65 italic text-center">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

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
// CtaWhatsApp — tarjeta CTA con botón a WhatsApp pre-llenado
// =========================================================
// Convención del sitio: número WhatsApp inline (525512683401), mismo que
// whatsapp-float.tsx y las 13 páginas que lo usan. Refactor a constante
// compartida es out-of-scope.
const WA_NUMBER = "525512683401";

export type CtaWhatsAppValue = {
  heading?: string;
  text?: string;
  buttonLabel?: string;
  preFilledMessage?: string;
};

export function CtaWhatsApp({ value }: { value: CtaWhatsAppValue }) {
  if (!value?.heading || !value?.preFilledMessage) return null;
  const href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    value.preFilledMessage,
  )}`;
  const label = value.buttonLabel || "Escríbeme por WhatsApp";

  return (
    <aside className="my-12 rounded-2xl border border-burgundy/20 bg-cream/40 dark:bg-coffee/30 dark:border-burgundy/40 p-7 sm:p-9">
      <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-burgundy">
        Habla conmigo
      </p>
      <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {value.heading}
      </h3>
      {value.text && (
        <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
          {value.text}
        </p>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.5)] hover:bg-[#1FB658] hover:shadow-[0_12px_32px_-6px_rgba(37,211,102,0.7)] hover:-translate-y-0.5 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        {label}
      </a>
    </aside>
  );
}

// =========================================================
// ExternalToolLink — tarjeta link a herramienta oficial externa
// =========================================================
export type ExternalToolLinkValue = {
  badge?: string;
  title?: string;
  description?: string;
  url?: string;
  buttonLabel?: string;
  publisher?: string;
};

export function ExternalToolLink({ value }: { value: ExternalToolLinkValue }) {
  if (!value?.title || !value?.url) return null;
  const label = value.buttonLabel || "Abrir herramienta →";

  return (
    <aside className="my-10 rounded-2xl border border-warm-brown/20 dark:border-warm-brown/35 bg-white/50 dark:bg-coffee/20 p-7">
      {value.badge && (
        <p className="text-[11px] uppercase tracking-[0.22em] font-medium text-warm-brown/75 dark:text-cream-light/60">
          {value.badge}
          {value.publisher && (
            <span className="text-warm-brown/55 dark:text-cream-light/45 normal-case tracking-normal">
              {" · "}
              {value.publisher}
            </span>
          )}
        </p>
      )}
      <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {value.title}
      </h3>
      {value.description && (
        <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
          {value.description}
        </p>
      )}
      <a
        href={value.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/80 dark:border-cream-light/80 px-5 py-2.5 text-sm font-medium text-ink dark:text-cream-light hover:bg-ink hover:text-cream-light dark:hover:bg-cream-light dark:hover:text-ink transition-colors duration-300"
      >
        {label}
      </a>
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

// CheckupDownloadBlock — lead magnet gateado embebido en el artículo.
// Bloque `checkupDownload`: muestra un gancho + el form de captura que, al
// enviarse, registra el lead en Zoho y revela la descarga (PDF + Excel).
export function CheckupDownloadBlock() {
  return (
    <div className="my-10 rounded-2xl border-2 border-rif-rojo/30 bg-cream/40 dark:bg-coffee/20 p-6 sm:p-8 not-prose">
      <p className="text-xs uppercase tracking-[0.2em] text-rif-rojo font-medium">
        Descarga gratuita
      </p>
      <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-cream-light leading-tight">
        Check-up de Beneficiarios
      </h3>
      <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
        Revisa en 16 puntos si los beneficiarios de tus seguros, cuentas, AFORE,
        créditos y demás están actualizados y alineados con tu testamento. Déjame
        tus datos y te lo envío al instante (PDF para imprimir y Excel para llenar).
      </p>
      <div className="mt-6">
        <CheckupGate />
      </div>
    </div>
  );
}

// CalculadoraEducacionalBlock — lead magnet gateado para el artículo de costos
// universitarios. Capta edad del hijo + universidad objetivo + contacto, y
// promete una estimación personalizada (Iria la envía tras recibir el lead).
export function CalculadoraEducacionalBlock() {
  return (
    <div className="my-10 rounded-2xl border-2 border-rif-rojo/30 bg-cream/40 dark:bg-coffee/20 p-6 sm:p-8 not-prose">
      <p className="text-xs uppercase tracking-[0.2em] text-rif-rojo font-medium">
        Calculadora gratuita
      </p>
      <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-cream-light leading-tight">
        Descubre si tu ahorro actual alcanzará para la universidad de tu hijo o hija
      </h3>
      <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
        Te ayudo a estimar cuánto podría costar la universidad de tu hijo o hija y a
        comparar esa cifra contra tu plan de ahorro actual. Déjame tus datos y te
        envío una estimación personalizada.
      </p>
      <div className="mt-6">
        <CalculadoraEducacionalGate />
      </div>
    </div>
  );
}

// ChecklistDiscapacidadBlock — lead magnet gateado para el artículo de protección
// patrimonial de familias con un hijo con discapacidad. Capta contacto y entrega
// el checklist (PDF + Excel).
export function ChecklistDiscapacidadBlock() {
  return (
    <div className="my-10 rounded-2xl border-2 border-rif-rojo/30 bg-cream/40 dark:bg-coffee/20 p-6 sm:p-8 not-prose">
      <p className="text-xs uppercase tracking-[0.2em] text-rif-rojo font-medium">
        Checklist gratuito
      </p>
      <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-cream-light leading-tight">
        Protección patrimonial para familias neurodivergentes
      </h3>
      <p className="mt-3 text-warm-brown dark:text-cream-light/85 leading-relaxed">
        Detecta en pocos minutos qué ya tienes resuelto y qué necesitas ordenar
        para proteger el cuidado y el futuro de tu hijo o hija: testamento, beneficiarios,
        seguros, fideicomiso, red de apoyo, carta de intención y documentación de
        cuidados. Déjame tus datos y te lo envío al instante (PDF y Excel).
      </p>
      <div className="mt-6">
        <ChecklistDiscapacidadGate />
      </div>
    </div>
  );
}
