import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import Link from "next/link";

import {
  CalculadoraEducacionalBlock,
  ChecklistDiscapacidadBlock,
  CheckupDownloadBlock,
  ComparisonTable,
  CtaWhatsApp,
  DataCallout,
  DisclaimerBox,
  ExternalToolLink,
  GlossaryReferenceLink,
  InlineImage,
  KeyTakeaways,
  slugifyHeading,
} from "@/components/blog/portable-blocks";

/**
 * PortableText renderer — usado por /blog/[slug] y cualquier campo Sanity de tipo body.
 *
 * Cambios para citabilidad LLM:
 *  - h2 / h3 reciben `id` derivado de slugifyHeading(text) → anchor links + TOC
 *  - Tipos custom (`keyTakeaways`, `comparisonTable`, `disclaimer`, `dataCallout`,
 *    `glossaryReference`) renderean componentes dedicados en src/components/blog/portable-blocks.tsx
 */

function getBlockText(children: unknown): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children
      .map((c) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object" && "props" in c) {
          const props = (c as { props?: { children?: unknown } }).props;
          return props ? getBlockText(props.children) : "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="mt-10 mb-4 text-3xl sm:text-4xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const text = getBlockText(children);
      const id = slugifyHeading(text);
      return (
        <h2
          id={id}
          className="mt-10 mb-4 text-2xl sm:text-3xl font-semibold tracking-tight text-ink dark:text-cream-light scroll-mt-24"
        >
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = getBlockText(children);
      const id = slugifyHeading(text);
      return (
        <h3
          id={id}
          className="mt-8 mb-3 text-xl sm:text-2xl font-semibold tracking-tight text-ink dark:text-cream-light scroll-mt-24"
        >
          {children}
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="mt-6 mb-2 text-lg sm:text-xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="mt-4 leading-relaxed text-warm-brown dark:text-cream-light/85">
        {children}
      </p>
    ),
    // OJO antes de "mejorar" esto: en estos artículos el blockquote NO se usa
    // como cita destacada, sino como nota de referencia — artículos de ley,
    // fichas técnicas del IMSS, precisiones de trámite (el de ST-6 tiene 11).
    // Un tratamiento de pull quote (serif grande, comillas decorativas) le
    // daría a una referencia legal un peso retórico que no le toca, y en
    // contenido YMYL eso desinforma. Se queda como nota: legible, acotada y
    // visualmente subordinada a la prosa.
    // Si algún día se quieren citas destacadas de verdad, va como tipo de
    // bloque aparte en Sanity, no reinterpretando este.
    blockquote: ({ children }) => (
      <blockquote className="my-7 rounded-r-xl border-l-[3px] border-burgundy/40 bg-cream/40 dark:bg-coffee/20 py-4 pl-5 pr-5 text-[15px] leading-relaxed text-warm-brown dark:text-cream-light/85 [&>p]:mt-0 [&>p+p]:mt-3">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-ink dark:text-cream-light">
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = /^https?:\/\//i.test(href);
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 decoration-warm-brown/40 hover:decoration-burgundy transition-colors duration-500"
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className="underline underline-offset-4 decoration-warm-brown/40 hover:decoration-burgundy transition-colors duration-500"
        >
          {children}
        </Link>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc pl-6 space-y-2 text-warm-brown dark:text-cream-light/85">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal pl-6 space-y-2 text-warm-brown dark:text-cream-light/85">
        {children}
      </ol>
    ),
    // Listas de "conviene / no conviene". El icono va acompañado de color,
    // nunca solo de color: quien no distingue verde de rojo tiene que poder
    // leer igual cuál es cuál.
    check: ({ children }) => (
      <ul className="mt-5 space-y-2.5 text-warm-brown dark:text-cream-light/85">
        {children}
      </ul>
    ),
    cross: ({ children }) => (
      <ul className="mt-5 space-y-2.5 text-warm-brown dark:text-cream-light/85">
        {children}
      </ul>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
    check: ({ children }) => (
      <li className="flex items-start gap-3 leading-relaxed">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-1 size-[18px] flex-shrink-0 text-[#2F6B4F] dark:text-[#7FBE9C]"
          role="img"
          aria-label="Sí"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12.5 11 15.5 16 9.5" />
        </svg>
        <span>{children}</span>
      </li>
    ),
    cross: ({ children }) => (
      <li className="flex items-start gap-3 leading-relaxed">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-1 size-[18px] flex-shrink-0 text-burgundy"
          role="img"
          aria-label="No"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
        <span>{children}</span>
      </li>
    ),
  },
  types: {
    image: ({ value }) => <InlineImage value={value} />,
    keyTakeaways: ({ value }) => <KeyTakeaways value={value} />,
    comparisonTable: ({ value }) => <ComparisonTable value={value} />,
    disclaimer: ({ value }) => <DisclaimerBox value={value} />,
    dataCallout: ({ value }) => <DataCallout value={value} />,
    glossaryReference: ({ value }) => <GlossaryReferenceLink value={value} />,
    ctaWhatsApp: ({ value }) => <CtaWhatsApp value={value} />,
    externalToolLink: ({ value }) => <ExternalToolLink value={value} />,
    checkupDownload: () => <CheckupDownloadBlock />,
    calculadoraEducacional: () => <CalculadoraEducacionalBlock />,
    checklistDiscapacidad: () => <ChecklistDiscapacidadBlock />,
  },
};

export function PortableTextRenderer({
  value,
}: {
  value: PortableTextBlock[];
}) {
  return <PortableText value={value} components={components} />;
}
