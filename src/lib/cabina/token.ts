/**
 * Tokens de acción para la cabina de prospectos.
 *
 * El correo diario trae botones que MUTAN Pipedrive ("✅ Propuesta enviada",
 * "📋 Me pidió cotización"). Un link así no puede ser adivinable ni
 * transferible: cada link lleva un HMAC del par (acción, dealId) firmado con
 * un secreto del servidor. Quien tenga el link puede ejecutar ESA acción
 * sobre ESE trato y nada más — no hay sesión, no hay cookie que robar.
 *
 * LA ACCIÓN VA DENTRO DE LA FIRMA a propósito: si solo se firmara el dealId,
 * el token de "ya la mandé" serviría para "me pidió cotización" cambiando un
 * parámetro de la URL, y un clic acabaría haciendo lo contrario de lo que
 * dice el botón.
 *
 * No caducan: el correo se atiende a veces días después, y un token vencido
 * convertiría el botón en un error frustrante. El riesgo es bajo — las
 * acciones son idempotentes y el correo vive en la bandeja de Iria.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/** Acciones que la cabina sabe ejecutar. */
export type AccionCabina = "propuesta-enviada" | "pidio-cotizacion";

export const ACCIONES: readonly AccionCabina[] = [
  "propuesta-enviada",
  "pidio-cotizacion",
];

export function esAccionValida(v: string): v is AccionCabina {
  return (ACCIONES as readonly string[]).includes(v);
}

export function firmarAccion(
  accion: AccionCabina,
  dealId: number,
  secreto: string,
): string {
  return createHmac("sha256", secreto)
    .update(`${accion}:${dealId}`)
    .digest("hex");
}

/**
 * Comparación en tiempo constante. La longitud se verifica antes porque
 * `timingSafeEqual` lanza con buffers de tamaños distintos — y quien manda
 * "a" no merece un 500, merece un false.
 */
/**
 * Llave de acceso a la página de captura rápida.
 *
 * No es por trato sino por página: Iria la guarda una vez en la pantalla de
 * inicio del celular y la usa siempre. Deriva del mismo secreto, así que no
 * hay una credencial más que administrar, y no es adivinable.
 */
export function llaveCaptura(secreto: string): string {
  return createHmac("sha256", secreto).update("cabina-captura").digest("hex");
}

export function verificarLlaveCaptura(
  llave: string,
  secreto: string,
): boolean {
  if (!llave || !secreto) return false;
  const esperado = Buffer.from(llaveCaptura(secreto), "hex");
  let recibido: Buffer;
  try {
    recibido = Buffer.from(llave, "hex");
  } catch {
    return false;
  }
  if (recibido.length !== esperado.length) return false;
  return timingSafeEqual(recibido, esperado);
}

export function verificarAccion(
  accion: string,
  dealId: number,
  token: string,
  secreto: string,
): boolean {
  if (!esAccionValida(accion)) return false;
  if (!Number.isInteger(dealId) || dealId <= 0 || !token || !secreto) {
    return false;
  }

  const esperado = Buffer.from(firmarAccion(accion, dealId, secreto), "hex");
  let recibido: Buffer;
  try {
    recibido = Buffer.from(token, "hex");
  } catch {
    return false;
  }
  if (recibido.length !== esperado.length) return false;
  return timingSafeEqual(recibido, esperado);
}
