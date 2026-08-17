/**
 * Fechas de la cabina, en el calendario que vive Iria.
 *
 * Viven fuera de la ruta del digest para poder probarse: enterradas en el
 * `route.ts` no se podían importar desde `node --test` (arrastran
 * `next/server`), y son justo la clase de código —husos horarios y formatos
 * ajenos— donde los errores no se ven hasta que ya rompieron algo.
 */

const ZONA = "America/Mexico_City";

/** YYYY-MM-DD del calendario CDMX, no el del servidor (que corre en UTC). */
export function fechaCdmx(ahora: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

/**
 * Días completos desde una fecha de Pipedrive hasta `ahora`.
 *
 * Pipedrive mezcla formatos según endpoint y versión: `"2026-08-10 14:23:45"`
 * (v1, con espacio), `"...T14:23:45Z"` y `"...T14:23:45+00:00"`. La "Z" se
 * añade SOLO cuando no hay zona declarada: antes se añadía siempre que
 * faltara la Z, y un offset numérico producía una fecha inválida que dejaba
 * `diasEsperando` en null para todos los tratos **en silencio** — el correo
 * perdía la antigüedad y el orden por más-viejo-primero dejaba de funcionar
 * sin que nada avisara.
 */
export function diasDesde(iso: string | null, ahora: Date): number | null {
  if (!iso) return null;
  const normalizado = iso.trim().replace(" ", "T");
  const traeZona = /(Z|[+-]\d{2}:?\d{2})$/.test(normalizado);
  const t = Date.parse(traeZona ? normalizado : `${normalizado}Z`);
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((ahora.getTime() - t) / 86_400_000));
}
