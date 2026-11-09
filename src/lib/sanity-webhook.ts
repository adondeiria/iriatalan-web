// Decide qué refrescar y de qué avisar a IndexNow cuando Sanity manda un
// webhook porque se publicó o cambió un documento en el Studio.
//
// Lógica pura (sin Next ni fetch) para poder probarla con `node --test`.
// La usa src/app/api/sanity-webhook/route.ts.

/** Lo que manda el webhook de Sanity (la "projection" configurada en sanity.io/manage). */
export type SanityWebhookBody = {
  _id?: string;
  _type?: string;
  slug?: string | null;
  draft?: boolean | null;
};

export type PlanWebhook = {
  /** Paths a pasar a revalidatePath(path, "layout"): refresca la página y todo lo que cuelga de ella. */
  revalidar: string[];
  /** Paths públicos de los que se avisa a IndexNow (solo la página del documento). */
  avisar: string[];
};

const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Devuelve qué hacer con un webhook, o `null` si hay que ignorarlo:
 * borradores de Sanity (`drafts.*`), documentos con el toggle "Draft" encendido
 * (no son públicos), tipos que no manejamos o slugs raros.
 */
export function planDesdeWebhook(body: SanityWebhookBody | null | undefined): PlanWebhook | null {
  if (!body?._type || !body.slug) return null;
  if (body._id?.startsWith("drafts.")) return null;
  if (body.draft === true) return null;
  if (!SLUG_VALIDO.test(body.slug)) return null;

  switch (body._type) {
    case "article":
      // "/blog" con "layout" cubre el índice, las categorías y el artículo.
      // El sitemap no hace falta: se regenera solo cada 60 s (sitemap.ts).
      return { revalidar: ["/blog"], avisar: [`/blog/${body.slug}`] };
    case "glossaryTerm":
      return { revalidar: ["/glosario"], avisar: [`/glosario/${body.slug}`] };
    default:
      return null;
  }
}
