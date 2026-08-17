/**
 * Constructor del correo diario de la cabina de prospectos.
 *
 * Función pura: entra la foto del embudo (ya cruzada con personas, etiquetas
 * y actividades), sale `{asunto, html}`. No toca red ni entorno — así se
 * prueba con fixtures sin Pipedrive de por medio.
 *
 * El HTML es de CORREO, no de web: tablas y estilos inline porque Gmail
 * ignora <style> y las clases. Colores de marca RIF (globals.css): burgundy
 * #9E1B1E, espresso #1F1612, crema #ECE7E2, champagne #B8956A.
 */

// Extensiones explícitas: el runner nativo (`node --test`) resuelve sin
// bundler. `moduleResolution: bundler` del tsconfig las acepta igual.
import { waHref } from "../whatsapp.ts";
import { clasificarEtapa, mensajeParaEtapa } from "./mensajes.ts";
import { firmarAccion } from "./token.ts";

/**
 * Tope por sección. Iria tiene 144 tratos abiertos y muchos sin actividad:
 * un correo sin tope sería una avalancha el primer día y se volvería ruido
 * que se aprende a ignorar. Con tope, el rezago se drena a ~10 decisiones
 * diarias de cinco segundos, y en dos semanas queda limpio.
 */
export const TOPE_POR_SECCION = 10;

/**
 * Cómo se identifica el correo: remitente, asunto y encabezado.
 *
 * Vive en una sola constante porque Iria lo busca por este nombre en su
 * bandeja: si el remitente dijera una cosa y el asunto otra, dejaría de ser
 * reconocible de un vistazo entre los correos de la mañana.
 */
export const NOMBRE = "LEADS RIF";

export type ProspectoDigest = {
  dealId: number;
  titulo: string;
  nombrePersona: string | null;
  telefono: string | null;
  nombreEtapa: string;
  /** Qué actividad lo trae al correo, si alguna. */
  actividad: string | null;
  /** YYYY-MM-DD de la actividad; null en las secciones sin actividad. */
  vence: string | null;
  /** Días que lleva esperando (desde el último cambio de etapa o el alta). */
  diasEsperando: number | null;
  /** Trae la etiqueta "⏳ Debe cotización". */
  debeCotizacion: boolean;
  /** Trae "⏸ Esperando al cliente" — la pelota no es de Iria. */
  esperandoCliente: boolean;
  /** Trae "⭐ Prioridad" — sube dentro de su sección. */
  prioridad: boolean;
};

export type DatosDigest = {
  /** Con etiqueta "⏳ Debe cotización": el corazón del correo. */
  debenCotizacion: ProspectoDigest[];
  /** Actividades con fecha pasada. */
  vencidos: ProspectoDigest[];
  /** Actividades con fecha de hoy. */
  hoy: ProspectoDigest[];
  /** Tratos abiertos SIN ninguna actividad pendiente: el detector de fugas. */
  fugas: ProspectoDigest[];
};

export type ConfigDigest = {
  /** Origen absoluto del sitio, para los links de acción (SITE_URL). */
  siteUrl: string;
  /** Secreto HMAC de los botones de acción (CABINA_SECRET). */
  secreto: string;
  /** Dominio de la cuenta Pipedrive, para "Abrir en Pipedrive". */
  pipedriveBase?: string;
  ahora: Date;
};

const PIPEDRIVE_BASE = "https://reingenieriafinanciera.pipedrive.com";

const esc = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Orden dentro de cada sección: primero ⭐ Prioridad, después los que llevan
 * más días esperando. Al fondo los "⏸ Esperando al cliente" — no es culpa de
 * Iria que no contesten, así que no tienen por qué gritarle cada mañana.
 */
function ordenar(items: ProspectoDigest[]): ProspectoDigest[] {
  return [...items].sort((a, b) => {
    if (a.esperandoCliente !== b.esperandoCliente) {
      return a.esperandoCliente ? 1 : -1;
    }
    if (a.prioridad !== b.prioridad) return a.prioridad ? -1 : 1;
    return (b.diasEsperando ?? 0) - (a.diasEsperando ?? 0);
  });
}

/** Botón de correo: un <a> con fondo; los <button> no viajan bien. */
function boton(url: string, etiqueta: string, color: string): string {
  return `<a href="${esc(url)}" style="display:inline-block;padding:8px 14px;margin:2px 6px 2px 0;background:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">${esc(etiqueta)}</a>`;
}

function accionUrl(
  cfg: ConfigDigest,
  accion: "propuesta-enviada" | "pidio-cotizacion",
  dealId: number,
): string {
  const t = firmarAccion(accion, dealId, cfg.secreto);
  return `${cfg.siteUrl}/cabina/hecho?a=${accion}&deal=${dealId}&t=${t}`;
}

function tarjeta(p: ProspectoDigest, cfg: ConfigDigest, seccion: string): string {
  const quien = p.nombrePersona?.trim() || p.titulo || `Trato #${p.dealId}`;
  const etapa = clasificarEtapa(p.nombreEtapa);

  const botones: string[] = [];
  if (p.telefono) {
    const mensaje = mensajeParaEtapa(etapa, p.nombrePersona, cfg.ahora);
    botones.push(boton(waHref(p.telefono, mensaje), "WhatsApp listo", "#1F8A4C"));
  }

  // "Ya la mandé" solo tiene sentido si Iria le debe algo.
  if (p.debeCotizacion || etapa === "preparacion") {
    botones.push(
      boton(accionUrl(cfg, "propuesta-enviada", p.dealId), "✅ Propuesta enviada", "#9E1B1E"),
    );
  }
  // "Me pidió cotización" solo en las fugas: es la corrección de lo olvidado.
  if (seccion === "fugas" && !p.debeCotizacion) {
    botones.push(
      boton(accionUrl(cfg, "pidio-cotizacion", p.dealId), "📋 Me pidió cotización", "#B8956A"),
    );
  }

  botones.push(
    boton(
      `${cfg.pipedriveBase ?? PIPEDRIVE_BASE}/deal/${p.dealId}`,
      "Abrir en Pipedrive",
      "#857874",
    ),
  );

  const espera =
    p.diasEsperando !== null && p.diasEsperando > 0
      ? `${p.diasEsperando} ${p.diasEsperando === 1 ? "día" : "días"} esperando`
      : null;

  const detalle = [
    espera,
    p.actividad ? esc(p.actividad) : null,
    p.vence ? `vence ${esc(p.vence)}` : null,
    p.esperandoCliente ? "⏸ esperando al cliente" : null,
    esc(p.nombreEtapa),
  ]
    .filter(Boolean)
    .join(" · ");

  const estrella = p.prioridad ? "⭐ " : "";

  return `<tr><td style="padding:12px 16px;border-bottom:1px solid #ECE7E2;">
    <div style="font-size:15px;font-weight:700;color:#1F1612;">${estrella}${esc(quien)}</div>
    <div style="font-size:12px;color:#857874;margin:2px 0 8px;">${detalle}</div>
    <div>${botones.join("")}</div>
  </td></tr>`;
}

function seccionHtml(
  titulo: string,
  color: string,
  items: ProspectoDigest[],
  cfg: ConfigDigest,
  clave: string,
): string {
  if (items.length === 0) return "";

  const ordenados = ordenar(items);
  const visibles = ordenados.slice(0, TOPE_POR_SECCION);
  const ocultos = ordenados.length - visibles.length;

  const pie =
    ocultos > 0
      ? `<tr><td style="padding:4px 16px 12px;font-size:12px;color:#857874;">y otros ${ocultos} — mañana te muestro los siguientes</td></tr>`
      : "";

  return `<tr><td style="padding:18px 16px 6px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${color};">${esc(titulo)} (${ordenados.length})</div>
    </td></tr>
    ${visibles.map((p) => tarjeta(p, cfg, clave)).join("")}
    ${pie}`;
}

/**
 * `null` cuando no hay nada que hacer: ese día NO se manda correo. El
 * silencio también informa — bandeja limpia = embudo al día.
 */
export function construirDigest(
  datos: DatosDigest,
  cfg: ConfigDigest,
): { asunto: string; html: string } | null {
  const total =
    datos.debenCotizacion.length +
    datos.vencidos.length +
    datos.hoy.length +
    datos.fugas.length;
  if (total === 0) return null;

  const partes: string[] = [];
  if (datos.debenCotizacion.length) {
    partes.push(`${datos.debenCotizacion.length} esperan cotización`);
  }
  if (datos.vencidos.length) partes.push(`${datos.vencidos.length} vencidos`);
  if (datos.hoy.length) partes.push(`${datos.hoy.length} para hoy`);
  if (datos.fugas.length) partes.push(`${datos.fugas.length} sin siguiente paso`);
  const asunto = `${NOMBRE}: ${partes.join(", ")}`;

  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#ECE7E2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ECE7E2;padding:24px 8px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <tr><td style="background:#9E1B1E;padding:18px 16px;">
          <div style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:.04em;">${esc(NOMBRE)}</div>
          <div style="color:#ECE7E2;font-size:12px;margin-top:2px;">Tu seguimiento del día — un toque por prospecto</div>
        </td></tr>
        ${seccionHtml("Te deben cotización", "#9E1B1E", datos.debenCotizacion, cfg, "debe")}
        ${seccionHtml("Vencidos", "#9E1B1E", datos.vencidos, cfg, "vencidos")}
        ${seccionHtml("Para hoy", "#1F1612", datos.hoy, cfg, "hoy")}
        ${seccionHtml("Sin siguiente paso", "#B8956A", datos.fugas, cfg, "fugas")}
        <tr><td style="padding:16px;background:#FBFAF9;">
          <div style="font-size:11px;color:#857874;line-height:1.5;">
            «WhatsApp listo» abre tu chat con el mensaje ya escrito — revísalo y envía.<br>
            «✅ Propuesta enviada» mueve la etapa, sella la fecha, quita la etiqueta y agenda tu seguimiento.<br>
            «📋 Me pidió cotización» le pone la etiqueta y te agenda la tarea a 2 días.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { asunto, html };
}
