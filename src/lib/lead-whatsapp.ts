/**
 * Compuertas del registro de prospectos que llegan por WhatsApp.
 *
 * Viven aquí y no en la ruta porque son la parte que decide SI se escribe en
 * el CRM: es lógica de seguridad y merece pruebas. Un fallo silencioso aquí
 * es de los caros — o no registra a nadie, o le escribe a todo el mundo.
 */

import { timingSafeEqual } from "node:crypto";

/**
 * Compara el secreto en tiempo constante.
 *
 * Longitudes distintas se rechazan antes de comparar: `timingSafeEqual` lanza
 * si difieren, y un throw aquí sería un 500 en vez de un 401 limpio.
 */
export function secretoValido(recibido: string, esperado: string): boolean {
  if (!esperado) return false;
  const a = Buffer.from(recibido, "utf8");
  const b = Buffer.from(esperado, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** El interruptor global. Apagado mientras no diga exactamente "true". */
export function estaEncendido(env: Record<string, string | undefined> = process.env): boolean {
  return env.LEAD_WHATSAPP_ENABLED === "true";
}

/**
 * Compuerta canary: mientras exista el número de pruebas, solo ese registra.
 *
 * FALLA CERRADA. Si la variable existe pero no son 10 dígitos, no pasa nadie.
 * El modo peligroso —escribirle a toda la cartera— nunca puede ser el
 * resultado de una variable mal escrita.
 */
export function pasaCanary(
  telefonoE164: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const solo = (env.LEAD_WHATSAPP_SOLO_TELEFONO ?? "").trim();
  if (!solo) return true;
  if (!/^\d{10}$/.test(solo)) {
    console.error(
      `[lead-whatsapp] LEAD_WHATSAPP_SOLO_TELEFONO debe ser 10 dígitos, no "${solo}". No se registra nada.`,
    );
    return false;
  }
  return telefonoE164.endsWith(solo);
}
