/**
 * Helper cliente para eventos GA4. No-op si gtag no está cargado.
 *
 * Los eventos se disparan vía window.gtag, definido por <Analytics />. Con
 * Consent Mode v2, si el usuario no aceptó cookies el evento sale como señal
 * anónima sin cookies ni identificadores; si aceptó, sale normal. Para que cuenten como conversión en GA4, marcar el
 * evento como "Evento clave" en Admin → Eventos.
 */

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
