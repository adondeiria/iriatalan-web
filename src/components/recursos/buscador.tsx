"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import { TOPIC_LABELS } from "@/lib/blog";
import { buscar, prepararIndice, type DocBusqueda } from "@/lib/busqueda";
import { WA_MESSAGES, waHref } from "@/lib/whatsapp";

/**
 * Buscador del centro de recursos.
 *
 * Filtra en cliente sobre un índice que llega por props desde el server
 * component — cero llamadas de red al teclear.
 *
 * Decisiones que parecen detalles y no lo son:
 *
 *  - Los resultados van EN EL FLUJO del documento, no en un dropdown flotante.
 *    Un dropdown obliga al patrón combobox de ARIA completo (aria-expanded,
 *    aria-activedescendant, gestión manual del foco) y casi siempre sale mal.
 *    Aquí Tab funciona nativo porque son <a> normales dentro de una lista.
 *
 *  - `type="text"` y no `type="search"`: la X nativa de WebKit se pinta oscura
 *    y sobre el hero espresso queda invisible. El botón de limpiar es propio.
 *
 *  - El <label> es visible. Un placeholder no es una etiqueta: desaparece al
 *    escribir y los lectores de pantalla no lo tratan como nombre accesible.
 *
 *  - Sin JS el <form> lleva al índice completo del final de la página, que
 *    lista todo el contenido. Por eso el `action` apunta a #indice.
 */

const LIMITE = 8;

export function BuscadorRecursos({ docs }: { docs: DocBusqueda[] }) {
  const [consulta, setConsulta] = useState("");
  const [anuncio, setAnuncio] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const inputId = useId();
  const pistaId = useId();

  // Normalizar 33 documentos en cada tecla sería trabajo tirado a la basura.
  const indice = useMemo(() => prepararIndice(docs), [docs]);

  const resultados = useMemo(
    () => buscar(indice, consulta, LIMITE),
    [indice, consulta]
  );

  const activa = consulta.trim().length >= 2;
  const sinResultados = activa && resultados.length === 0;

  // El conteo se anuncia con retraso para no interrumpir al lector de pantalla
  // en cada pulsación. El filtrado en pantalla sí es inmediato.
  //
  // Todo el setState va dentro del timeout, incluido el de limpiar: hacerlo
  // síncrono en el cuerpo del efecto encadena renders sin necesidad.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!activa) {
        setAnuncio("");
        return;
      }
      setAnuncio(
        resultados.length === 0
          ? "Sin resultados."
          : `${resultados.length} resultado${resultados.length === 1 ? "" : "s"}.`
      );
    }, 300);
    return () => clearTimeout(t);
  }, [activa, resultados.length]);

  // Analítica: qué busca la gente, y sobre todo qué busca y no encuentra —
  // eso es lo que dice qué contenido falta por escribir.
  useEffect(() => {
    const q = consulta.trim();
    if (q.length < 3) return;
    const t = setTimeout(() => {
      trackEvent("search", { search_term: q });
      if (resultados.length === 0) {
        trackEvent("search_no_results", { search_term: q });
      }
    }, 800);
    return () => clearTimeout(t);
  }, [consulta, resultados.length]);

  function alTeclear(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setConsulta("");
      return;
    }
    if (e.key === "ArrowDown" && resultados.length > 0) {
      e.preventDefault();
      listaRef.current?.querySelector("a")?.focus();
    }
  }

  const articulos = resultados.filter((r) => r.doc.tipo === "articulo");
  const terminos = resultados.filter((r) => r.doc.tipo === "termino");

  return (
    <div className="w-full max-w-xl">
      <form
        role="search"
        // Sin JS, el submit aterriza en el índice completo del final de la
        // página. En un GET el navegador reemplaza el query pero conserva el
        // fragmento, así que el destino real es /recursos?q=…#indice.
        action="/recursos#indice"
        method="get"
        onSubmit={(e) => e.preventDefault()}
      >
        <label
          htmlFor={inputId}
          className="block text-[11px] font-medium uppercase tracking-[0.18em] text-cream-light/70"
        >
          Buscar en el centro de recursos
        </label>
        <div className="mt-3 relative">
          <input
            ref={inputRef}
            id={inputId}
            name="q"
            type="text"
            inputMode="search"
            autoComplete="off"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={alTeclear}
            aria-describedby={pistaId}
            placeholder="deducible, Modalidad 40, beneficiarios…"
            className="w-full rounded-full border border-cream-light/25 bg-cream-light/[0.06] px-6 py-4 pr-14 text-cream-light placeholder:text-cream-light/40 outline-none transition-colors duration-500 focus:border-champagne focus-visible:ring-2 focus-visible:ring-champagne/40"
          />
          {consulta && (
            <button
              type="button"
              onClick={() => {
                setConsulta("");
                inputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-cream-light/60 transition-colors duration-500 hover:text-cream-light focus-visible:ring-2 focus-visible:ring-champagne/40 focus-visible:outline-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="size-4"
                aria-hidden
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <p id={pistaId} className="mt-2.5 text-[12.5px] text-cream-light/50">
          Busca por tema, producto o término.{" "}
          <noscript>
            Sin JavaScript: consulta el{" "}
            <a href="#indice" className="underline">
              índice completo
            </a>{" "}
            al final de la página.
          </noscript>
        </p>
      </form>

      <p role="status" aria-live="polite" className="sr-only">
        {anuncio}
      </p>

      {activa && (
        <div className="mt-5 rounded-2xl border border-cream-light/15 bg-espresso/80 p-2 backdrop-blur-sm">
          {sinResultados ? (
            <div className="px-4 py-5">
              <p className="text-[14.5px] text-cream-light/85">
                No encontré nada para «{consulta.trim()}».
              </p>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px]">
                <Link
                  href="/blog"
                  className="text-champagne underline underline-offset-4 hover:text-cream-light"
                >
                  Ver todos los artículos
                </Link>
                <Link
                  href="/glosario"
                  className="text-champagne underline underline-offset-4 hover:text-cream-light"
                >
                  Ver el glosario
                </Link>
                <a
                  href={waHref(null, WA_MESSAGES.default)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-champagne underline underline-offset-4 hover:text-cream-light"
                >
                  Preguntarme por WhatsApp
                </a>
              </p>
            </div>
          ) : (
            <ul ref={listaRef} className="flex flex-col">
              {[
                { etiqueta: "Artículos", items: articulos },
                { etiqueta: "Glosario", items: terminos },
              ]
                .filter((g) => g.items.length > 0)
                .map((grupo) => (
                  <li key={grupo.etiqueta}>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-cream-light/45">
                      {grupo.etiqueta}
                    </p>
                    <ul>
                      {grupo.items.map(({ doc }) => (
                        <li key={doc.id}>
                          <Link
                            href={doc.href}
                            className="block rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-cream-light/[0.07] focus-visible:bg-cream-light/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/40"
                          >
                            <span className="block text-[15px] leading-snug text-cream-light">
                              {doc.titulo}
                            </span>
                            <span className="mt-1 block text-[12.5px] leading-relaxed text-cream-light/55">
                              {doc.tema && TOPIC_LABELS[doc.tema] && (
                                <span className="text-champagne/80">
                                  {TOPIC_LABELS[doc.tema]} ·{" "}
                                </span>
                              )}
                              {doc.resumen}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
