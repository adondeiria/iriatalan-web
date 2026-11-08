// IndexNow — avisa a Bing (y a los demás buscadores del protocolo) que una URL
// cambió, para que la rastreen al momento en vez de esperar al sitemap.
// ChatGPT search se apoya mucho en el índice de Bing, así que esto acorta el
// tiempo entre publicar y ser citable.
//
// La clave NO es un secreto: el protocolo exige publicarla en
// `public/<clave>.txt` para que el buscador verifique que el aviso viene del
// dueño del dominio. Si se cambia aquí, se cambia también el nombre y contenido
// de ese archivo.
//
// Protocolo: https://www.indexnow.org/documentation

export const INDEXNOW_KEY = "bbff919a3256fcbc60a26f15f3e2a97b";
export const INDEXNOW_HOST = "iriatalan.com.mx";
const SITE_ORIGIN = `https://${INDEXNOW_HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult = {
  ok: boolean;
  status: number | null;
  submitted: number;
  message?: string;
};

/**
 * Envía URLs absolutas del sitio a IndexNow. Nunca lanza: un aviso fallido no
 * debe romper una publicación. Descarta URLs de otros dominios.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const urlList = [...new Set(urls)].filter((u) => u.startsWith(`${SITE_ORIGIN}/`) || u === SITE_ORIGIN);
  if (urlList.length === 0) {
    return { ok: false, status: null, submitted: 0, message: "Sin URLs válidas del dominio." };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: INDEXNOW_HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(8000),
    });
    // 200 = recibido; 202 = recibido, verificación de clave pendiente.
    return { ok: res.status === 200 || res.status === 202, status: res.status, submitted: urlList.length };
  } catch (err) {
    return {
      ok: false,
      status: null,
      submitted: 0,
      message: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

/** Convierte un path del sitio ("/blog/x") en URL absoluta para IndexNow. */
export function siteUrl(path: string): string {
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}
