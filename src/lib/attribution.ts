/**
 * Atribución de origen del lead (de qué red social o campaña llegó).
 *
 * El problema: alguien entra desde Instagram a /gmm, navega a /contacto y ahí
 * llena el formulario. Para cuando envía, los parámetros `?utm_source=instagram`
 * ya desaparecieron de la URL. Sin esto, ese lead se registra como "sitio web"
 * y nunca sabes qué red te trae clientes.
 *
 * La solución: al primer aterrizaje se guarda la procedencia en `sessionStorage`
 * y se lee al enviar el formulario. Se queda con la PRIMERA (first-touch): si
 * llegó por Instagram, eso vale aunque después pase por Google.
 *
 * Solo dura la sesión de la pestaña y solo se usa para etiquetar el lead que la
 * propia persona decide enviar — no rastrea navegación ni sale del navegador
 * hasta que hay un envío.
 */

const KEY = "rif-attribution";
const MAX = 60; // cota por campo: lo que llega en la URL es texto de terceros.

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
};

const VACIA: Attribution = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  referrer: "",
};

/** Solo letras, números y separadores simples: nada de HTML ni URLs raras. */
function limpiar(valor: string | null): string {
  if (!valor) return "";
  return valor.replace(/[^\w\s.\-/]/g, "").trim().slice(0, MAX);
}

/** Dominio del sitio que nos mandó al visitante, si es externo. */
function dominioReferido(): string {
  try {
    if (!document.referrer) return "";
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return "";
    return url.hostname.replace(/^www\./, "").slice(0, MAX);
  } catch {
    return "";
  }
}

/**
 * Guarda la procedencia si es el primer aterrizaje de la sesión.
 * Se llama una vez, al montar la app.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first-touch: no se pisa.

    const params = new URLSearchParams(window.location.search);
    const datos: Attribution = {
      utm_source: limpiar(params.get("utm_source")),
      utm_medium: limpiar(params.get("utm_medium")),
      utm_campaign: limpiar(params.get("utm_campaign")),
      referrer: dominioReferido(),
    };

    // Si no hay nada que atribuir, no se escribe: así una visita directa
    // posterior con UTM sí queda registrada.
    if (!Object.values(datos).some(Boolean)) return;

    sessionStorage.setItem(KEY, JSON.stringify(datos));
  } catch {
    // Modo privado o storage bloqueado: se sigue sin atribución.
  }
}

/** Procedencia guardada, para adjuntar al enviar un formulario. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return VACIA;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return VACIA;
    return { ...VACIA, ...(JSON.parse(raw) as Partial<Attribution>) };
  } catch {
    return VACIA;
  }
}
