/**
 * Aviso por correo de un prospecto que llegó por WhatsApp.
 *
 * Los leads del formulario avisan por su cuenta (Zoho Forms manda el correo),
 * pero los de WhatsApp no pasan por ahí: sin esto, el prospecto quedaba en
 * Pipedrive sin que nadie se enterara por correo. Pasó con el primer lead real
 * el 19-ago.
 *
 * Reutiliza el mismo Resend y el mismo destino del digest de la cabina para no
 * agregar credenciales ni configuración nueva.
 */

/**
 * Remitente propio y no el del digest: el aviso de un lead es urgente y el
 * digest es un resumen diario. Separarlos permite filtrarlos distinto en el
 * correo, y evita que este módulo dependa de la cabina.
 */
const REMITENTE = "LEADS RIF";

export type AvisoLead = {
  nombre: string;
  telefono: string;
  origen?: string;
  dealId?: number;
  /** true si el prospecto ya tenía trato abierto; cambia el tono del aviso. */
  tratoReutilizado?: boolean;
};

/** Escapa para HTML: el nombre viene de WhatsApp, no es texto de confianza. */
function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function construirAviso(a: AvisoLead): { asunto: string; html: string } {
  const nombre = a.nombre.trim() || "Sin nombre";
  const nuevo = !a.tratoReutilizado;

  const asunto = nuevo
    ? `Nuevo prospecto por WhatsApp: ${nombre}`
    : `Mensaje de WhatsApp de ${nombre} (ya en seguimiento)`;

  // Sin CSS externo ni imágenes: los clientes de correo los bloquean y el
  // aviso debe leerse completo desde la notificación del celular.
  const filas = [
    ["Nombre", esc(nombre)],
    ["WhatsApp", esc(a.telefono)],
    a.origen ? ["Entró por", esc(a.origen)] : null,
    a.dealId
      ? [
          "Trato",
          `<a href="https://reingenieriafinanciera.pipedrive.com/deal/${a.dealId}">Abrir en Pipedrive</a>`,
        ]
      : null,
  ].filter(Boolean) as Array<[string, string]>;

  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#111">
<p><b>${nuevo ? "Llegó un prospecto nuevo por WhatsApp." : "Escribió por WhatsApp alguien que ya está en seguimiento."}</b></p>
<table cellpadding="6" style="border-collapse:collapse">
${filas.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${v}</b></td></tr>`).join("\n")}
</table>
<p style="color:#666;font-size:13px">${nuevo ? "Ya quedó registrado en Pipedrive, en la etapa Lead RS / Webpage." : "No se creó un trato nuevo: se reutilizó el que ya tenía abierto."}</p>
</div>`;

  return { asunto, html };
}

/**
 * Manda el aviso. Devuelve true si salió.
 *
 * NUNCA lanza: el correo es notificación, no registro. Que falle no puede
 * tumbar la respuesta al llamador ni provocar un reintento que duplique el
 * trato en Pipedrive — el lead ya quedó guardado, que es lo que importa.
 */
export async function avisarPorCorreo(a: AvisoLead): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const destino = process.env.CABINA_EMAIL_DESTINO;
  if (!key || !destino) {
    console.error("[lead-whatsapp] Falta RESEND_API_KEY o CABINA_EMAIL_DESTINO; no se avisa.");
    return false;
  }

  const { asunto, html } = construirAviso(a);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from: `${REMITENTE} <onboarding@resend.dev>`,
        to: [destino],
        subject: asunto,
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error("[lead-whatsapp] Resend contestó", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[lead-whatsapp] No se pudo avisar por correo:", err);
    return false;
  }
}
