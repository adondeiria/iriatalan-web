import Link from "next/link";

import { sanityFetch } from "../../../sanity/lib/fetch";
import { GLOSSARY_INDEX_QUERY } from "../../../sanity/lib/queries";

/**
 * "Términos de este artículo" — enlaza el artículo con las entradas del
 * glosario que realmente menciona.
 *
 * Existe porque el glosario nacía huérfano: 14 páginas publicadas a las que
 * ningún contenido apuntaba. Sin enlaces internos, Google las rastrea pero no
 * les da autoridad, y los motores de IA no tienen señal de que esas
 * definiciones sean parte del cuerpo editorial del sitio.
 *
 * La detección es automática (se escanea el cuerpo del artículo) en vez de
 * manual con el bloque `glossaryReference`: así cubre los artículos que ya
 * están publicados y los que vengan, sin tener que editarlos uno por uno en
 * Studio. El bloque manual sigue disponible para enlaces en medio del texto.
 */

type GlossaryTermItem = {
  _id: string;
  term: string;
  slug: string;
  shortDefinition?: string;
  topic?: string;
  synonyms?: string[];
};

/** Máximo de términos a mostrar: más que esto deja de ser útil y se vuelve ruido. */
const MAX_TERMINOS = 8;

/**
 * Minúsculas y sin acentos: el cuerpo escribe "Pensión" y el término puede
 * estar como "pension" (o al revés), y no queremos fallar por una tilde.
 * `\p{Diacritic}` cubre las marcas que deja NFD sin tener que escribir el
 * rango de combinables literal, que es ilegible y se corrompe al copiar.
 */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Texto plano del cuerpo Portable Text, para buscar menciones. */
function textoPlano(body: unknown[]): string {
  const partes: string[] = [];
  for (const bloque of body) {
    if (!bloque || typeof bloque !== "object") continue;
    const b = bloque as Record<string, unknown>;
    if (b._type === "block" && Array.isArray(b.children)) {
      partes.push(
        (b.children as Array<{ text?: string }>)
          .map((c) => c.text ?? "")
          .join("")
      );
    } else if (b._type === "keyTakeaways" && Array.isArray(b.items)) {
      partes.push((b.items as string[]).join(" "));
    }
  }
  return normalizar(partes.join("\n"));
}

/**
 * Coincidencia por palabra completa: "prima" no debe activarse dentro de
 * "primavera". Se ignoran frases de menos de 4 caracteres para no disparar
 * falsos positivos con siglas cortas.
 */
function mencionado(texto: string, frase: string): boolean {
  const f = normalizar(frase).trim();
  if (f.length < 4) return false;
  const escapado = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escapado}([^a-z0-9]|$)`).test(texto);
}

export async function GlossaryMentions({ body }: { body?: unknown[] | null }) {
  if (!Array.isArray(body) || body.length === 0) return null;

  const terminos =
    (await sanityFetch<GlossaryTermItem[]>({
      query: GLOSSARY_INDEX_QUERY,
      tags: ["glossaryTerm"],
    }).catch(() => null)) ?? [];

  if (terminos.length === 0) return null;

  const texto = textoPlano(body);

  // Un término entra si lo menciona el artículo por su nombre o por alguno de
  // sus sinónimos ("Coparticipación" → Coaseguro).
  const mencionados = terminos
    .filter(
      (t) =>
        mencionado(texto, t.term) ||
        (t.synonyms ?? []).some((s) => mencionado(texto, s))
    )
    .slice(0, MAX_TERMINOS);

  if (mencionados.length === 0) return null;

  return (
    <section className="px-6 py-12 sm:py-16 border-t border-warm-brown/15 dark:border-warm-brown/30">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="font-serif text-2xl sm:text-3xl tracking-tight leading-tight text-ink dark:text-cream-light">
          Términos de este artículo
        </h2>
        <p className="mt-2 text-warm-brown/85 dark:text-cream-light/65">
          Definiciones breves, por si alguna palabra te quedó a medias.
        </p>
        <dl className="mt-8 space-y-5">
          {mencionados.map((t) => (
            <div
              key={t._id}
              className="border-l-2 border-warm-brown/20 dark:border-warm-brown/40 pl-6"
            >
              <dt>
                <Link
                  href={`/glosario/${t.slug}`}
                  className="font-semibold text-ink dark:text-cream-light hover:text-burgundy dark:hover:text-burgundy hover:underline transition"
                >
                  {t.term}
                </Link>
              </dt>
              {t.shortDefinition && (
                <dd className="mt-1 text-warm-brown dark:text-cream-light/85 leading-relaxed">
                  {t.shortDefinition}
                </dd>
              )}
            </div>
          ))}
        </dl>
        <Link
          href="/glosario"
          className="mt-8 inline-block text-sm font-medium text-warm-brown dark:text-cream-light/85 hover:text-burgundy dark:hover:text-burgundy hover:underline transition"
        >
          Ver el glosario completo →
        </Link>
      </div>
    </section>
  );
}
