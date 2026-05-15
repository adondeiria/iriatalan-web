import type { QueryParams } from "next-sanity";

import { client } from "./client";

interface SanityFetchOptions {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}

export async function sanityFetch<TResponse = unknown>({
  query,
  params = {},
  tags = [],
  revalidate = 30,
}: SanityFetchOptions): Promise<TResponse> {
  // IMPORTANTE: revalidate se aplica SIEMPRE, aún con tags presentes.
  // El conditional previo `tags.length > 0 ? false : revalidate` causaba que
  // queries con tags se cachearan perpetuamente hasta una llamada explícita
  // a revalidateTag(), lo cual nunca ocurría → contenido nuevo de Sanity
  // nunca llegaba a producción aunque draft=false estuviera puesto.
  //
  // Ahora: tags se mantienen para invalidación on-demand futura, PERO también
  // hay revalidación automática cada `revalidate` segundos (default 30s).
  return client.fetch<TResponse>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}
