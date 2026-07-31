"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { TOPIC_LABELS } from "@/lib/blog";
import { buscar, prepararIndice, recortar, type DocBusqueda } from "@/lib/busqueda";

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
 *
 * El matching lo pone `@/lib/busqueda`, el mismo motor que usa el buscador del
 * centro de recursos. Antes era un `includes()` sobre minúsculas, que fallaba
 * en dos casos cotidianos: "pension" no encontraba "Pensión" (acento) y
 * "seguro de vida" exigía que apareciera el "de" literal.
 */

export type SearchableArticle = {
  slug: string;
  title: string;
  excerpt?: string;
  topic?: string;
};

export function BlogSearch({ articles }: { articles: SearchableArticle[] }) {
  const [q, setQ] = useState("");
  const termino = q.trim();

  const indice = useMemo(
    () =>
      prepararIndice(
        articles.map(
          (a): DocBusqueda => ({
            id: a.slug,
            tipo: "articulo",
            titulo: a.title,
            href: `/blog/${a.slug}`,
            resumen: recortar(a.excerpt ?? ""),
            tema: a.topic,
          })
        )
      ),
    [articles]
  );

  const resultados = useMemo(
    () => buscar(indice, termino, 6).map((r) => r.doc),
    [indice, termino]
  );

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
                <li key={a.id}>
                  <Link
                    href={a.href}
                    className="block px-5 py-3.5 transition-colors hover:bg-cream dark:hover:bg-coffee/40"
                  >
                    {a.tema && (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-burgundy">
                        {TOPIC_LABELS[a.tema] ?? a.tema}
                      </span>
                    )}
                    <span className="mt-1 block font-serif text-[15px] leading-snug text-ink dark:text-cream-light">
                      {a.titulo}
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
