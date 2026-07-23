/**
 * Cliente mínimo de Pipedrive para los leads entrantes del sitio.
 *
 * Un lead del sitio se materializa así:
 *   1. Persona (POST /api/v2/persons) — el contacto con email y WhatsApp.
 *   2. Trato   (POST /api/v2/deals)   — en el embudo dedicado "Leads RS / Webpage",
 *                                       primera etapa. NUNCA en los embudos de
 *                                       prospectos propios de Iria.
 *   3. Nota    (POST /v1/notes)       — el detalle del formulario: página de
 *                                       origen, campaña/red social (UTM), mensaje.
 *
 * SI EL EMBUDO NO EXISTE (nombre cambiado, typo en la variable), NO se mete el
 * trato en un embudo cualquiera: cae a un Lead en la Leads Inbox, que está
 * fuera de todos los embudos. Así el lead nunca se pierde ni contamina el
 * pipeline de ventas reales. El fallo queda en los logs de Vercel.
 *
 * Auth por header `x-api-token` (no query param): el token no termina en logs
 * de acceso ni en el Referer. Vive solo en variables de entorno, nunca en el repo.
 */

export type PipedriveLeadInput = {
  nombre: string;
  email: string;
  /** WhatsApp normalizado a 10 dígitos MX, o cadena vacía si no se capturó. */
  whatsapp: string;
  ciudad: string;
  servicio: string;
  condicionMedica: string;
  aportacion: string;
  mensaje: string;
  /** Página de origen, ya saneada (ej. "/gmm"). */
  origen: string;
  /** Red social / campaña de procedencia, si el visitante llegó con UTM. */
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  /** Sitio desde el que llegó, cuando no hay UTM (ej. "google.com"). */
  referrer: string;
};

export type PipedriveResult = {
  personId: number;
  /** Id del trato creado, o null si hubo que caer a la Leads Inbox. */
  dealId: number | null;
  /** Id del lead en la Inbox, solo cuando no se pudo usar el embudo. */
  leadId: string | null;
  noteCreated: boolean;
};

const API_BASE = process.env.PIPEDRIVE_API_BASE ?? "https://api.pipedrive.com";

/** Nombre (o id numérico) del embudo destino. Configurable sin tocar código. */
const PIPELINE = process.env.PIPEDRIVE_PIPELINE ?? "Leads RS / Webpage";

/** Pipedrive tarda ~200-600ms; 8s es techo generoso antes de caer a Zoho. */
const TIMEOUT_MS = 8000;

export function isPipedriveConfigured(): boolean {
  return Boolean(process.env.PIPEDRIVE_API_TOKEN);
}

/** Escapa texto de usuario antes de meterlo en el HTML de la nota. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type PdResponse<T> = { success?: boolean; data?: T; error?: string };

async function request<T>(
  method: "GET" | "POST",
  path: string,
  token: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-token": token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const json = (await res.json().catch(() => null)) as PdResponse<T> | null;

  if (!res.ok || !json?.success) {
    throw new Error(`Pipedrive ${path}: ${json?.error ?? `HTTP ${res.status}`}`);
  }

  return json.data as T;
}

type Target = { pipelineId: number; stageId: number };

/**
 * Resuelve el embudo destino y su primera etapa. Se memoiza solo en éxito: un
 * fallo transitorio no debe dejar la instancia envenenada para siempre.
 */
let targetCache: Target | null = null;

async function resolveTarget(token: string): Promise<Target> {
  if (targetCache) return targetCache;

  let pipelineId: number;

  if (/^\d+$/.test(PIPELINE.trim())) {
    pipelineId = Number(PIPELINE.trim());
  } else {
    const pipelines = await request<Array<{ id: number; name: string }>>(
      "GET",
      "/api/v2/pipelines?limit=500",
      token,
    );
    const buscado = PIPELINE.trim().toLowerCase();
    const match = (pipelines ?? []).find(
      (p) => (p.name ?? "").trim().toLowerCase() === buscado,
    );
    if (!match) {
      const existentes = (pipelines ?? []).map((p) => p.name).join(" | ");
      throw new Error(
        `No existe el embudo "${PIPELINE}". Embudos disponibles: ${existentes}`,
      );
    }
    pipelineId = match.id;
  }

  const stages = await request<Array<{ id: number; order_nr: number }>>(
    "GET",
    `/api/v2/stages?pipeline_id=${pipelineId}&limit=500`,
    token,
  );
  const primera = [...(stages ?? [])].sort(
    (a, b) => (a.order_nr ?? 0) - (b.order_nr ?? 0),
  )[0];
  if (!primera) {
    throw new Error(`El embudo ${pipelineId} no tiene etapas configuradas.`);
  }

  targetCache = { pipelineId, stageId: primera.id };
  return targetCache;
}

/** De dónde vino: la red social si hay UTM, si no el sitio. */
function etiquetaDeOrigen(input: PipedriveLeadInput): string {
  if (input.utmSource) return input.utmSource;
  return "sitio web";
}

/** Cuerpo HTML de la nota: todo lo que el form capturó, en orden de lectura. */
function buildNote(input: PipedriveLeadInput): string {
  const filas: Array<[string, string]> = [
    ["Página de origen", input.origen],
    ["Vino de", etiquetaDeOrigen(input)],
    ["Campaña", input.utmCampaign],
    ["Medio", input.utmMedium],
    ["Referido por", input.referrer],
    ["Servicio", input.servicio],
    ["Ciudad", input.ciudad],
    ["Condición médica declarada", input.condicionMedica],
    ["Aportación estimada", input.aportacion],
  ];

  const detalle = filas
    .filter(([, valor]) => valor.trim() !== "")
    .map(([etiqueta, valor]) => `<li><b>${etiqueta}:</b> ${escapeHtml(valor)}</li>`)
    .join("");

  const mensaje = input.mensaje.trim()
    ? `<p><b>Mensaje:</b><br>${escapeHtml(input.mensaje).replace(/\n/g, "<br>")}</p>`
    : "";

  return `<p><b>Lead del sitio iriatalan.com.mx</b></p><ul>${detalle}</ul>${mensaje}`;
}

/**
 * Crea Persona + Trato (o Lead de respaldo) + Nota en Pipedrive.
 * Lanza solo si ni siquiera se pudo crear la persona o el destino.
 */
export async function createPipedriveLead(
  input: PipedriveLeadInput,
): Promise<PipedriveResult> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) throw new Error("PIPEDRIVE_API_TOKEN no está configurado.");

  // Los móviles MX se guardan con lada país para que marcar y WhatsApp
  // funcionen directo desde Pipedrive.
  const phones =
    input.whatsapp.length === 10
      ? [{ value: `+52${input.whatsapp}`, primary: true, label: "mobile" }]
      : input.whatsapp
        ? [{ value: input.whatsapp, primary: true, label: "mobile" }]
        : [];

  const person = await request<{ id: number }>("POST", "/api/v2/persons", token, {
    name: input.nombre,
    emails: [{ value: input.email, primary: true, label: "work" }],
    ...(phones.length ? { phones } : {}),
  });

  const titulo = `${input.nombre} — ${input.servicio || "Consulta"} (${etiquetaDeOrigen(input)})`;

  let dealId: number | null = null;
  let leadId: string | null = null;

  try {
    const target = await resolveTarget(token);
    const deal = await request<{ id: number }>("POST", "/api/v2/deals", token, {
      title: titulo,
      person_id: person.id,
      pipeline_id: target.pipelineId,
      stage_id: target.stageId,
    });
    dealId = deal.id;
  } catch (err) {
    // No se pudo usar el embudo dedicado. Antes de arriesgarse a ensuciar otro
    // embudo, se deja en la Leads Inbox, que está fuera de todos.
    console.error("[pipedrive] Embudo no disponible, uso Leads Inbox:", err);
    const lead = await request<{ id: string }>("POST", "/v1/leads", token, {
      title: titulo,
      person_id: person.id,
    });
    leadId = lead.id;
  }

  // La nota es complemento: si falla, el trato ya está creado con nombre,
  // correo y teléfono. No tiramos todo por perder el detalle.
  let noteCreated = true;
  try {
    await request("POST", "/v1/notes", token, {
      content: buildNote(input),
      ...(dealId ? { deal_id: dealId } : { lead_id: leadId }),
    });
  } catch {
    noteCreated = false;
  }

  return { personId: person.id, dealId, leadId, noteCreated };
}
