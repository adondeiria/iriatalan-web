/**
 * Helper cliente para eventos GA4. No-op si gtag no está cargado
 * (p.ej. el usuario NO aceptó cookies → no medimos, correcto en privacidad).
 *
 * Los eventos se disparan vía window.gtag, definido por <Analytics /> tras
 * el consentimiento. Para que cuenten como conversión en GA4, marcar el
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
