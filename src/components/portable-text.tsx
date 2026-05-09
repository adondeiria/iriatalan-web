import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import Link from "next/link";

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="mt-10 mb-4 text-3xl sm:text-4xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 text-2xl sm:text-3xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl sm:text-2xl font-semibold tracking-tight text-ink dark:text-cream-light">
        {children}
      </h3>
    ),
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
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-warm-brown/20 dark:border-warm-brown/40 pl-4 italic text-warm-brown dark:text-cream-light/85">
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
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
};

export function PortableTextRenderer({
  value,
}: {
  value: PortableTextBlock[];
}) {
  return <PortableText value={value} components={components} />;
}
