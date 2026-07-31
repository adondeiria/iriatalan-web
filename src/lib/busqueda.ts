/**
 * Buscador del centro de recursos — lógica pura, sin JSX.
 *
 * Vive en lib y no dentro del componente porque lo consumen los dos lados: el
 * server component de /recursos construye el índice, y el client component lo
 * filtra. Sin dependencias externas a propósito — un motor de búsqueda difuso
 * (fuse.js y compañía) pesa más que el índice completo de este sitio.
 *
 * El índice viaja en el payload RSC, no en un JSON generado en build: el
 * proyecto no tiene pipeline de build-assets y un archivo estático se
 * desincronizaría del ISR de Sanity.
 *
 * Escala: con ~33 documentos el índice pesa ~2 KB gzip. A partir de ~150
 * conviene moverlo a un endpoint /api/buscar y dejar de mandarlo en el HTML.
 */

/** Un elemento buscable: un artículo del blog o un término del glosario. */
export type DocBusqueda = {
  id: string;
  tipo: "articulo" | "termino";
  titulo: string;
  /** Ruta interna: /blog/{slug} o /glosario/{slug}. */
  href: string;
  /** Resumen corto para el resultado. Truncado; nunca el cuerpo completo. */
  resumen: string;
  /** Valor de topic ("gmm"), no la etiqueta: el label ya está en el bundle. */
  tema?: string;
  /** Sinónimos del glosario, unidos. Amplía el match sin ensuciar el título. */
  alias?: string;
  /** ISO. Solo desempata; no se muestra. */
  fecha?: string;
};

/** Doc con sus campos ya normalizados, para no re-normalizar en cada tecla. */
export type DocPreparado = {
  doc: DocBusqueda;
  titulo: string;
  alias: string;
  resumen: string;
  tema: string;
};

export type Resultado = {
  doc: DocBusqueda;
  score: number;
};

/**
 * Minúsculas y sin acentos: quien busca escribe "pension" y el término está
 * como "Pensión" (o al revés), y no queremos fallar por una tilde.
 * `\p{Diacritic}` cubre las marcas que deja NFD sin escribir el rango de
 * combinables literal, que es ilegible y se corrompe al copiar.
 */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Palabras que no aportan señal en español. Sin esto, buscar "seguro de vida"
 * exige que "de" aparezca en el documento y el AND entre tokens se vuelve
 * inútil.
 */
const STOPWORDS = new Set([
  "de", "del", "la", "las", "el", "los", "un", "una", "unos", "unas",
  "y", "o", "u", "e", "que", "para", "por", "en", "con", "sin", "su",
  "sus", "mi", "mis", "al", "a", "lo", "es", "son", "como", "mas", "más",
]);

function tokenizar(consulta: string): string[] {
  return normalizar(consulta)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/** Escapa lo que en una regex significaría otra cosa. */
function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Match por INICIO de palabra, no por substring. Resuelve gratis dos cosas:
 *  - type-ahead incremental: "dedu" ya encuentra "deducible";
 *  - plurales del español: "pension" encuentra "pensiones".
 * Un substring suelto haría que "ida" encuentre "vida", que es ruido.
 */
function creaMatcher(token: string): RegExp {
  return new RegExp(`(^|[^a-z0-9])${escaparRegex(token)}`);
}

/**
 * Variantes de un token para cubrir el plural inverso: quien escribe
 * "pensiones" debe encontrar "pensión". Dos formas, sin stemmer.
 */
function variantes(token: string): string[] {
  const v = [token];
  if (token.length >= 5 && token.endsWith("es")) v.push(token.slice(0, -2));
  if (token.length >= 5 && token.endsWith("s")) v.push(token.slice(0, -1));
  return v;
}

export function prepararIndice(docs: DocBusqueda[]): DocPreparado[] {
  return docs.map((doc) => ({
    doc,
    titulo: normalizar(doc.titulo),
    alias: normalizar(doc.alias ?? ""),
    resumen: normalizar(doc.resumen),
    tema: normalizar(doc.tema ?? ""),
  }));
}

const PESO_TITULO = 100;
const PESO_ALIAS = 55;
const PESO_RESUMEN = 20;
const PESO_TEMA = 10;

/**
 * Todos los tokens deben aparecer en algún campo (AND). Devuelve los mejores
 * `limite` resultados ordenados por score y, en empate, por fecha desc.
 *
 * Consulta de menos de 2 caracteres → array vacío: evita el parpadeo de "sin
 * resultados" en la primera tecla.
 */
export function buscar(
  indice: DocPreparado[],
  consulta: string,
  limite = 8
): Resultado[] {
  if (consulta.trim().length < 2) return [];
  const tokens = tokenizar(consulta);
  if (!tokens.length) return [];

  // Quien teclea un solo término corto ("coaseguro") quiere la definición, no
  // un artículo de dos mil palabras que lo menciona de pasada.
  const favorecerGlosario = tokens.length === 1 && tokens[0].length <= 12;

  const resultados: Resultado[] = [];

  for (const p of indice) {
    let score = 0;
    let todos = true;

    for (const token of tokens) {
      const matchers = variantes(token).map(creaMatcher);
      let mejor = 0;
      for (const m of matchers) {
        if (m.test(p.titulo)) mejor = Math.max(mejor, PESO_TITULO);
        else if (m.test(p.alias)) mejor = Math.max(mejor, PESO_ALIAS);
        else if (m.test(p.resumen)) mejor = Math.max(mejor, PESO_RESUMEN);
        else if (m.test(p.tema)) mejor = Math.max(mejor, PESO_TEMA);
      }
      if (mejor === 0) {
        todos = false;
        break;
      }
      score += mejor;
    }

    if (!todos) continue;
    if (favorecerGlosario && p.doc.tipo === "termino") score += 25;
    resultados.push({ doc: p.doc, score });
  }

  resultados.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const fa = a.doc.fecha ?? "";
    const fb = b.doc.fecha ?? "";
    if (fa !== fb) return fb.localeCompare(fa);
    return a.doc.titulo.localeCompare(b.doc.titulo, "es");
  });

  return resultados.slice(0, limite);
}

/** Recorta sin partir una palabra a la mitad. */
export function recortar(texto: string, max = 140): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const ultimo = corte.lastIndexOf(" ");
  return `${corte.slice(0, ultimo > 40 ? ultimo : max)}…`;
}
