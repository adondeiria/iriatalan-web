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
  revalidate = 60,
}: SanityFetchOptions): Promise<TResponse> {
  return client.fetch<TResponse>(query, params, {
    next: {
      revalidate: tags.length > 0 ? false : revalidate,
      tags,
    },
  });
}
