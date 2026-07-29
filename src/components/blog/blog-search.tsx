"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TOPIC_LABELS } from "@/lib/blog";

/**
 * Buscador del índice del blog.
 *
 * Filtra en el cliente sobre la lista que ya viene renderizada del servidor.
 * Con menos de ~100 artículos esto es lo correcto: cero peticiones, cero
 * latencia, funciona sin JS para quien no lo tenga (el input simplemente no
 * filtra, pero la lista completa sigue abajo, visible e indexable).
 *
 * NO se usa un endpoint de búsqueda ni el índice de Sanity: sería agregar
 * infraestructura y una petición por tecla para resolver algo que cabe en
 * memoria. Cuando el blog pase de ~100 artículos conviene reevaluarlo.
 */

export type SearchableArticle = {
  slug: string;
  title: string;
  excerpt?: string;
  topic?: string;
};

export function BlogSearch({ articles }: { articles: SearchableArticle[] }) {
  const [q, setQ] = useState("");
  const termino = q.trim().toLowerCase();

  const resultados = useMemo(() => {
    if (termino.length < 2) return [];
    return articles
      .filter((a) => {
        const heno = [
          a.title,
          a.excerpt ?? "",
          TOPIC_LABELS[a.topic ?? ""] ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return heno.includes(termino);
      })
      .slice(0, 6);
  }, [articles, termino]);

  const buscando = termino.length >= 2;

  return (
    <div className="relative max-w-md">
      <label htmlFor="blog-search" className="sr-only">
        Buscar en el blog
      </label>
      <div className="relative">
        <input
          id="blog-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué quieres entender? Ej. Modalidad 40, testamento…"
          className="w-full rounded-full border border-warm-brown/25 dark:border-warm-brown/40 bg-cream-light dark:bg-coffee/30 py-3.5 pl-5 pr-12 text-[15px] text-ink dark:text-cream-light placeholder:text-warm-brown/55 dark:placeholder:text-cream-light/45 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/25 transition"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-warm-brown/55 dark:text-cream-light/45"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="size-5"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </span>
      </div>

      {buscando && (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-warm-brown/15 dark:border-warm-brown/35 bg-cream-light dark:bg-espresso shadow-[0_18px_44px_-18px_rgba(20,17,15,0.35)]"
        >
          {resultados.length === 0 ? (
            <p className="px-5 py-4 text-sm text-warm-brown/80 dark:text-cream-light/65">
              No encontré nada con “{q.trim()}”. Prueba con otra palabra, o{" "}
              <Link
                href="/contacto"
                className="font-medium text-burgundy underline underline-offset-4"
              >
                pregúntame directo
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-warm-brown/10 dark:divide-cream-light/10">
              {resultados.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="block px-5 py-3.5 transition-colors hover:bg-cream dark:hover:bg-coffee/40"
                  >
                    {a.topic && (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-burgundy">
                        {TOPIC_LABELS[a.topic] ?? a.topic}
                      </span>
                    )}
                    <span className="mt-1 block font-serif text-[15px] leading-snug text-ink dark:text-cream-light">
                      {a.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
