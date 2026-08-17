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

/**
 * Exportado porque la cabina (digest diario) reusa el mismo transporte:
 * auth por header, timeout y unwrap de `{success, data, error}` en un lugar.
 */
export async function request<T>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  token: string,
  body?: unknown,
  /**
   * Devuelve la respuesta COMPLETA en vez de solo `data`. Lo necesita la
   * paginación: el cursor de la siguiente página viaja en `additional_data`,
   * fuera de `data`, y desenvolver la respuesta lo tiraría.
   */
  crudo = false,
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

  return (crudo ? json : json.data) as T;
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

/**
 * Deja una tarea pendiente sobre el lead. Se usa cuando el WhatsApp de
 * bienvenida NO salió: el lead sí quedó registrado, pero nadie lo saludó, y
 * ese hueco tiene que ser visible donde Iria trabaja, no solo en los logs.
 *
 * Acepta trato O lead de la Inbox porque `createPipedriveLead` cae al segundo
 * cuando el embudo no se resuelve — y mientras `PIPEDRIVE_PIPELINE` no traiga
 * el id numérico, ESE es el camino que siguen todos los leads. Anclar solo a
 * `deal_id` dejaría la tarea sin crear justo cuando más falta hace.
 *
 * Devuelve false en vez de lanzar: es un complemento, nunca la razón por la
 * que el visitante vea un error.
 */
export async function createPipedriveActivity(
  ancla: { dealId: number | null; leadId: string | null },
  subject: string,
  note?: string,
): Promise<boolean> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) return false;
  if (!ancla.dealId && !ancla.leadId) return false;

  try {
    await request("POST", "/v1/activities", token, {
      ...(ancla.dealId ? { deal_id: ancla.dealId } : { lead_id: ancla.leadId }),
      subject,
      type: "task",
      due_date: new Date().toISOString().slice(0, 10),
      ...(note ? { note } : {}),
    });
    return true;
  } catch (err) {
    console.error("[pipedrive] No se pudo crear la actividad:", err);
    return false;
  }
}

/* ------------------------------------------------------------------------- *
 * Cabina de prospectos — lado de LECTURA y acción "propuesta enviada".
 *
 * Todo lo de arriba escribe (leads del sitio). Lo de abajo lo consume el
 * digest diario: lista qué tratos exigen acción hoy y ejecuta el "✅ ya la
 * mandé" de un clic. Vive en este archivo para compartir `request` y las
 * mismas reglas (timeout, header, unwrap).
 * ------------------------------------------------------------------------- */

/**
 * Nombres de las etiquetas de trato, tal como existen en Pipedrive.
 *
 * SIN EMOJI Y EN MAYÚSCULAS a propósito: es el estilo de las que ya usa la
 * cuenta (ASPA, VIDA, GMM), y un emoji dentro de la cadena vuelve frágil el
 * cotejo por nombre — basta que Pipedrive normalice el carácter distinto para
 * que la etiqueta "no exista" y la cabina deje de marcarlas en silencio.
 * El cotejo pasa por `normalizar()`, así que acentos y mayúsculas dan igual;
 * el emoji no.
 */
export const ETIQUETA_DEBE_COTIZACION = "DEBE COTIZACION";
export const ETIQUETA_ESPERANDO_CLIENTE = "ESPERANDO CLIENTE";
export const ETIQUETA_PRIORIDAD = "PRIORIDAD";
export const ETIQUETA_PAGINA_WEB = "PAGINA WEB";

export type TratoAbierto = {
  id: number;
  title: string;
  stageId: number;
  pipelineId: number;
  personId: number | null;
  /** Última vez que cambió de etapa; para "lleva N días parado". */
  stageChangeTime: string | null;
  addTime: string | null;
  /** Ids de etiquetas puestas en el trato. */
  labelIds: number[];
};

export type ActividadPendiente = {
  id: number;
  subject: string;
  /** YYYY-MM-DD, o null si la actividad quedó sin fecha. */
  dueDate: string | null;
  dealId: number | null;
};

export type PersonaMini = {
  id: number;
  name: string;
  /** Primer teléfono (primario si hay), tal como está capturado. */
  telefono: string | null;
};

type DealV2 = {
  id: number;
  title?: string;
  stage_id?: number;
  pipeline_id?: number;
  person_id?: number | null;
  stage_change_time?: string | null;
  add_time?: string | null;
  /**
   * Pipedrive volvió las etiquetas multi-selección: la v2 devuelve
   * `label_ids` (array). Se acepta también el `label` viejo (id suelto o
   * lista separada por comas) porque el corte entre versiones no es limpio
   * y la cuenta podría contestar cualquiera de las dos formas.
   */
  label_ids?: number[] | null;
  label?: number | string | null;
};

/** Normaliza las dos formas posibles de etiquetas a una lista de ids. */
function leerLabelIds(d: DealV2): number[] {
  if (Array.isArray(d.label_ids)) return d.label_ids.filter(Number.isInteger);
  if (typeof d.label === "number") return [d.label];
  if (typeof d.label === "string" && d.label.trim()) {
    return d.label
      .split(",")
      .map((x) => Number(x.trim()))
      .filter(Number.isInteger);
  }
  return [];
}

type ActivityV2 = {
  id: number;
  subject?: string;
  due_date?: string | null;
  deal_id?: number | null;
  done?: boolean;
};

type PersonV2 = {
  id: number;
  name?: string;
  phones?: Array<{ value?: string; primary?: boolean }>;
};

/**
 * Id del embudo del que lee la cabina, o null para "todos".
 *
 * VARIABLE PROPIA, A PROPÓSITO: `PIPEDRIVE_PIPELINE` decide dónde ATERRIZAN
 * los leads del sitio, y este archivo documenta desde su cabecera que ese
 * destino se mantiene aparte de los embudos de trabajo de Iria. Reusarla aquí
 * ataba dos decisiones opuestas a un solo valor: apuntara a donde apuntara,
 * una de las dos quedaba mal (o el digest lee el embudo de intake, o los
 * leads nuevos caen en el embudo de venta real).
 *
 * Si `PIPEDRIVE_PIPELINE_VENTA` no está configurada, se devuelve null y la
 * cabina lee TODOS los embudos: hoy solo existe uno ("Financial and
 * insurance", id 2), así que el default correcto es no filtrar. Un digest de
 * más no pierde prospectos; un digest que no llega, sí.
 */
export function resolverEmbudoVenta(): number | null {
  const crudo = (process.env.PIPEDRIVE_PIPELINE_VENTA ?? "").trim();
  if (!crudo) return null;
  if (!/^\d+$/.test(crudo)) {
    console.error(
      `[cabina] PIPEDRIVE_PIPELINE_VENTA debe ser un id numérico, no "${crudo}". Leo todos los embudos.`,
    );
    return null;
  }
  return Number(crudo);
}

/**
 * Recorre TODAS las páginas de un listado v2.
 *
 * Sin esto la cabina miente en silencio: la cuenta tiene ~910 actividades
 * pendientes y un `limit=500` a secas dejaba ~410 fuera, así que tratos que
 * SÍ tenían tarea agendada aparecían en "Sin siguiente paso" como si nadie
 * los estuviera atendiendo. Verificado contra los datos reales: la sección
 * pasaba de 64 tratos a 121 inventados.
 *
 * El tope de 40 vueltas es una red contra un cursor que no avance; a 500 por
 * página son 20 000 registros, muy por encima de cualquier escenario real.
 */
async function listarTodo<T>(
  token: string,
  ruta: string,
  extra = "",
): Promise<T[]> {
  type Pagina = {
    data?: T[];
    additional_data?: { next_cursor?: string | null };
  };

  const todo: T[] = [];
  let cursor: string | null = null;
  const sep = ruta.includes("?") ? "&" : "?";

  for (let vuelta = 0; vuelta < 40; vuelta += 1) {
    const url: string = `${ruta}${sep}limit=500${extra}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res: Pagina = await request<Pagina>(
      "GET",
      url,
      token,
      undefined,
      true,
    );

    todo.push(...(res?.data ?? []));
    cursor = res?.additional_data?.next_cursor ?? null;
    if (!cursor) return todo;
  }

  console.error(`[cabina] ${ruta}: se cortó la paginación en 40 vueltas.`);
  return todo;
}

/** Tratos abiertos (de un embudo, o de todos si no se pasa). */
export async function listarTratosAbiertos(
  token: string,
  pipelineId?: number | null,
): Promise<TratoAbierto[]> {
  const filtro = pipelineId ? `&pipeline_id=${pipelineId}` : "";
  const data = await listarTodo<DealV2>(
    token,
    "/api/v2/deals?status=open",
    filtro,
  );
  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title ?? "",
    stageId: d.stage_id ?? 0,
    pipelineId: d.pipeline_id ?? 0,
    personId: d.person_id ?? null,
    stageChangeTime: d.stage_change_time ?? null,
    addTime: d.add_time ?? null,
    labelIds: leerLabelIds(d),
  }));
}

/**
 * Actividades NO hechas. El filtro `done=false` viaja en la URL y además se
 * re-filtra aquí: si la API cambiara la semántica del parámetro, colar
 * actividades cerradas convertiría el digest en una lista de falsos pendientes.
 */
export async function listarActividadesPendientes(
  token: string,
): Promise<ActividadPendiente[]> {
  const data = await listarTodo<ActivityV2>(
    token,
    "/api/v2/activities?done=false",
  );
  return (data ?? [])
    .filter((a) => a.done !== true)
    .map((a) => ({
      id: a.id,
      subject: a.subject ?? "",
      dueDate: a.due_date ?? null,
      dealId: a.deal_id ?? null,
    }));
}

/** Personas por id, en lotes de 100 (tope del parámetro `ids` de la API v2). */
export async function obtenerPersonas(
  token: string,
  ids: number[],
): Promise<Map<number, PersonaMini>> {
  const resultado = new Map<number, PersonaMini>();
  const unicos = [...new Set(ids)].filter((n) => Number.isInteger(n) && n > 0);

  for (let i = 0; i < unicos.length; i += 100) {
    const lote = unicos.slice(i, i + 100);
    try {
      const data = await request<PersonV2[]>(
        "GET",
        `/api/v2/persons?ids=${lote.join(",")}&limit=100`,
        token,
      );
      for (const p of data ?? []) {
        const primario =
          p.phones?.find((t) => t.primary)?.value ?? p.phones?.[0]?.value;
        resultado.set(p.id, {
          id: p.id,
          name: p.name ?? "",
          telefono: primario ?? null,
        });
      }
    } catch (err) {
      // Un lote caído no tumba el digest: esos tratos salen sin teléfono
      // (con link a Pipedrive, donde sí se puede actuar).
      console.error("[cabina] Falló un lote de personas:", err);
    }
  }
  return resultado;
}

/** Para la página de confirmación: mostrar QUÉ trato se va a marcar. */
export async function obtenerTrato(
  dealId: number,
): Promise<{ id: number; title: string; stageId: number } | null> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) return null;
  try {
    const d = await request<DealV2>("GET", `/api/v2/deals/${dealId}`, token);
    if (!d) return null;
    return { id: d.id, title: d.title ?? "", stageId: d.stage_id ?? 0 };
  } catch {
    return null;
  }
}

type StageV2 = { id: number; name?: string; pipeline_id?: number };

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/**
 * Etapa "Propuesta enviada" del embudo de venta, buscada POR NOMBRE y no por
 * id: la migración de embudos regenera ids, y este código no debe requerir
 * redeploy cada vez que se reordena una columna. Memoizada en éxito.
 */
let etapaEnviadaCache: number | null = null;

async function resolverEtapaPropuestaEnviada(
  token: string,
): Promise<number | null> {
  if (etapaEnviadaCache) return etapaEnviadaCache;

  const pipelineId = resolverEmbudoVenta();
  const filtro = pipelineId ? `?pipeline_id=${pipelineId}&limit=500` : "?limit=500";
  const stages = await request<StageV2[]>("GET", `/api/v2/stages${filtro}`, token);

  const match = (stages ?? []).find((s) => {
    const nombre = normalizar(s.name ?? "");
    return nombre.includes("propuesta") && (nombre.includes("enviada") || nombre.includes("presentada"));
  });

  if (!match) {
    console.error(
      "[cabina] No existe etapa 'Propuesta enviada' en el embudo",
      pipelineId,
    );
    return null;
  }
  etapaEnviadaCache = match.id;
  return etapaEnviadaCache;
}

/**
 * Ids de las etiquetas de trato, resueltos POR NOMBRE desde `dealFields`.
 *
 * En Pipedrive las etiquetas no son una entidad aparte: son las `options` del
 * campo `label`. Se resuelven por nombre y no por id porque los ids se
 * asignan al crearlas y este código no debe requerir redeploy cuando Iria
 * renombre o reordene etiquetas en la UI.
 *
 * Se memoiza el mapa completo en éxito; un fallo NO se memoiza (se reintenta).
 */
let etiquetasCache: Map<string, number> | null = null;

type OpcionCampo = { id?: number; label?: string };
type DealFieldConOpciones = {
  key?: string;
  name?: string;
  options?: OpcionCampo[];
};

async function mapaEtiquetas(token: string): Promise<Map<string, number>> {
  if (etiquetasCache) return etiquetasCache;

  const fields = await request<DealFieldConOpciones[]>(
    "GET",
    "/v1/dealFields?limit=500",
    token,
  );
  const campoLabel = (fields ?? []).find((f) => f.key === "label");

  const mapa = new Map<string, number>();
  for (const opt of campoLabel?.options ?? []) {
    if (typeof opt.id === "number" && opt.label) {
      mapa.set(normalizar(opt.label), opt.id);
    }
  }

  if (mapa.size > 0) etiquetasCache = mapa;
  return mapa;
}

/** Id de una etiqueta por su nombre, o null si aún no existe en la cuenta. */
export async function idDeEtiqueta(
  token: string,
  nombre: string,
): Promise<number | null> {
  try {
    return (await mapaEtiquetas(token)).get(normalizar(nombre)) ?? null;
  } catch (err) {
    console.error("[cabina] No se pudieron leer las etiquetas:", err);
    return null;
  }
}

/**
 * Escribe la lista de etiquetas de un trato.
 *
 * SOLO `label_ids`. Mandar además el `label` viejo "por compatibilidad" NO
 * funciona: la v2 valida el esquema y responde
 * `400 Parameter 'label' is not allowed for this request`, tumbando la
 * escritura entera. Verificado contra la cuenta real con un canary.
 */
async function escribirEtiquetas(
  token: string,
  dealId: number,
  ids: number[],
): Promise<void> {
  await request("PATCH", `/api/v2/deals/${dealId}`, token, {
    label_ids: ids,
  });
}

/**
 * Key interna del campo "Fecha propuesta enviada". Los campos personalizados
 * de Pipedrive viajan con una key hash de 40 caracteres, no con su nombre;
 * se resuelve una vez por nombre y se memoiza. `undefined` = aún no buscado,
 * `null` = buscado y no existe (se degrada sin sellar fecha).
 */
let fechaEnviadaKeyCache: string | null | undefined;

type DealFieldV1 = { key?: string; name?: string };

async function resolverCampoFechaEnviada(
  token: string,
): Promise<string | null> {
  if (fechaEnviadaKeyCache !== undefined) return fechaEnviadaKeyCache;
  try {
    const fields = await request<DealFieldV1[]>(
      "GET",
      "/v1/dealFields?limit=500",
      token,
    );
    const match = (fields ?? []).find(
      (f) => normalizar(f.name ?? "") === "fecha propuesta enviada",
    );
    fechaEnviadaKeyCache = match?.key ?? null;
  } catch (err) {
    console.error("[cabina] No se pudieron leer los dealFields:", err);
    // No se memoiza el fallo: a la siguiente se reintenta.
    return null;
  }
  return fechaEnviadaKeyCache;
}

export type ResultadoPropuestaEnviada = {
  etapaMovida: boolean;
  fechaSellada: boolean;
  seguimientoCreado: boolean;
  etiquetaRetirada: boolean;
};

/**
 * El "✅ ya la mandé" de la cabina, en una llamada:
 *   1. Mueve el trato a "Propuesta enviada", sella la fecha y **quita la
 *      etiqueta "⏳ Debe cotización"** — todo en el mismo PATCH.
 *   2. La tarea "Seguimiento de propuesta" la agenda sola la automatización
 *      nativa al ver el cambio de etapa (ver NOTA DE DISEÑO más arriba).
 *
 * Quitar la etiqueta no es cosmético: si se queda pegada, el trato aparece
 * para siempre en la sección "Debes cotización" del correo y la cabina se
 * vuelve ruido que Iria aprende a ignorar.
 *
 * Cada paso reporta por separado: si el campo fecha aún no existe en
 * Pipedrive, la etapa se mueve igual y el resultado lo dice con la verdad.
 */
export async function marcarPropuestaEnviada(
  dealId: number,
  fechas: { hoyISO: string },
): Promise<ResultadoPropuestaEnviada> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) throw new Error("PIPEDRIVE_API_TOKEN no está configurado.");

  const resultado: ResultadoPropuestaEnviada = {
    etapaMovida: false,
    fechaSellada: false,
    seguimientoCreado: false,
    etiquetaRetirada: false,
  };

  const [stageId, fechaKey, idDebe, trato] = await Promise.all([
    resolverEtapaPropuestaEnviada(token),
    resolverCampoFechaEnviada(token),
    idDeEtiqueta(token, ETIQUETA_DEBE_COTIZACION),
    obtenerTratoConEtiquetas(token, dealId),
  ]);

  const cuerpo: Record<string, unknown> = {};
  if (stageId) cuerpo.stage_id = stageId;
  if (fechaKey) cuerpo.custom_fields = { [fechaKey]: fechas.hoyISO };

  // Solo se tocan etiquetas si el trato TIENE la de "debe cotización": así se
  // conservan intactas "⏸ Esperando al cliente" y "⭐ Prioridad".
  if (idDebe && trato && trato.labelIds.includes(idDebe)) {
    // Solo `label_ids`: la v2 rechaza el `label` viejo con un 400 que tumba
    // el PATCH completo (etapa y fecha incluidas).
    cuerpo.label_ids = trato.labelIds.filter((id) => id !== idDebe);
    resultado.etiquetaRetirada = true;
  }

  if (Object.keys(cuerpo).length > 0) {
    await request("PATCH", `/api/v2/deals/${dealId}`, token, cuerpo);
    resultado.etapaMovida = Boolean(stageId);
    resultado.fechaSellada = Boolean(fechaKey);
  } else {
    resultado.etiquetaRetirada = false;
  }

  // La tarea de seguimiento NO se crea aquí: la automatización nativa
  // "Etapa Propuesta Presentada → seguimiento a 3 días hábiles" la genera al
  // ver el cambio de etapa que acabamos de hacer. Crearla también desde el
  // código dejaría DOS tareas idénticas — y con un solo dueño de la verdad,
  // mover la tarjeta a mano en Pipedrive produce exactamente el mismo
  // resultado que pulsar el botón del correo.
  resultado.seguimientoCreado = resultado.etapaMovida;

  return resultado;
}

/*
 * NOTA DE DISEÑO — quién crea las tareas.
 *
 * Las crea SIEMPRE Pipedrive, con sus dos automatizaciones nativas:
 *   etiqueta DEBE COTIZACION  → "Armar y enviar cotizacion" (+2 días hábiles)
 *   etapa Propuesta Presentada → "Seguimiento de propuesta"  (+3 días hábiles)
 *
 * Este código solo mueve la etapa o pone la etiqueta; la tarea nace sola. Se
 * quitó un helper que también las creaba porque duplicaba el pendiente: su
 * guarda "¿ya existe una igual?" no servía de nada, ya que el código escribe
 * de inmediato y la automatización llega unos segundos después, cuando ya no
 * hay nada que deduplicar.
 *
 * El beneficio real de tener un solo dueño: arrastrar la tarjeta a mano en
 * Pipedrive produce EXACTAMENTE el mismo resultado que pulsar el botón del
 * correo. Nada depende de por dónde entró la acción.
 */

/** Trato con sus etiquetas, para poder añadir/quitar sin pisar las demás. */
async function obtenerTratoConEtiquetas(
  token: string,
  dealId: number,
): Promise<{ id: number; labelIds: number[] } | null> {
  try {
    const d = await request<DealV2>("GET", `/api/v2/deals/${dealId}`, token);
    if (!d) return null;
    return { id: d.id, labelIds: leerLabelIds(d) };
  } catch (err) {
    console.error("[cabina] No se pudo leer el trato:", err);
    return null;
  }
}

/**
 * Normaliza un teléfono a E.164 para buscar y guardar en Pipedrive.
 *
 * Un móvil mexicano de 10 dígitos se prefija con +52. **Cualquier número que
 * ya venga con `+` y una lada distinta se respeta tal cual**: la regla vieja
 * de "quitar el 1 inicial" —pensada para los teléfonos mexicanos antiguos—
 * convertía los +1 de Estados Unidos en celulares mexicanos falsos, y la
 * cartera tiene clientes con lada extranjera.
 */
export function normalizarTelefono(crudo: string): string {
  const limpio = crudo.trim();
  if (limpio.startsWith("+")) return `+${limpio.slice(1).replace(/\D/g, "")}`;

  const digitos = limpio.replace(/\D/g, "");
  if (digitos.length === 10) return `+52${digitos}`;
  if (digitos.length === 12 && digitos.startsWith("52")) return `+${digitos}`;
  return digitos ? `+${digitos}` : "";
}

type PersonaBusqueda = {
  item?: { id?: number; name?: string; phones?: string[] };
};

/** Persona con ese teléfono, o null. Busca por el campo `phone`. */
async function buscarPersonaPorTelefono(
  token: string,
  telefono: string,
): Promise<number | null> {
  if (!telefono) return null;
  try {
    const r = await request<{ items?: PersonaBusqueda[] }>(
      "GET",
      `/api/v2/persons/search?term=${encodeURIComponent(telefono)}&fields=phone&exact_match=true&limit=5`,
      token,
    );
    return r?.items?.[0]?.item?.id ?? null;
  } catch (err) {
    console.error("[captura] Falló la búsqueda por teléfono:", err);
    return null;
  }
}

/** Trato abierto más reciente de una persona, o null si no tiene. */
async function tratoAbiertoDePersona(
  token: string,
  personId: number,
): Promise<number | null> {
  try {
    const r = await request<DealV2[]>(
      "GET",
      `/api/v2/deals?person_id=${personId}&status=open&limit=50&sort_by=update_time&sort_direction=desc`,
      token,
    );
    return r?.[0]?.id ?? null;
  } catch (err) {
    console.error("[captura] No se pudieron listar los tratos:", err);
    return null;
  }
}

export type EntradaCaptura = {
  nombre: string;
  telefono: string;
  /** Qué pidió: alimenta el título del trato y la nota. */
  quiere: string;
};

export type ResultadoCaptura = {
  personId: number;
  dealId: number;
  /** true si se reutilizó un trato existente en vez de crear uno. */
  reutilizado: boolean;
  etiquetaPuesta: boolean;
  tareaCreada: boolean;
};

/**
 * La captura rápida desde el celular: convierte "me pidieron cotización por
 * WhatsApp" en un trato etiquetado, en un solo envío.
 *
 * Reutiliza el trato abierto de la persona si ya existe — duplicar prospectos
 * es peor que no capturarlos: ensucia el embudo y parte el historial en dos.
 *
 * NO crea la tarea aquí: al poner la etiqueta, la automatización nativa de
 * Pipedrive la genera sola con su plazo de 2 días hábiles. Crearla también
 * desde el código dejaría dos tareas idénticas.
 */
export async function capturarPideCotizacion(
  entrada: EntradaCaptura,
): Promise<ResultadoCaptura> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) throw new Error("PIPEDRIVE_API_TOKEN no está configurado.");

  const telefono = normalizarTelefono(entrada.telefono);
  const nombre = entrada.nombre.trim() || "Sin nombre";
  const quiere = entrada.quiere.trim();

  // 1. ¿Ya existe la persona?
  let personId = await buscarPersonaPorTelefono(token, telefono);
  if (!personId) {
    const p = await request<{ id: number }>("POST", "/api/v2/persons", token, {
      name: nombre,
      ...(telefono
        ? { phones: [{ value: telefono, primary: true, label: "mobile" }] }
        : {}),
    });
    personId = p.id;
  }

  // 2. ¿Ya tiene trato abierto?
  let dealId = await tratoAbiertoDePersona(token, personId);
  const reutilizado = dealId !== null;

  if (!dealId) {
    const target = await resolveTarget(token).catch(() => null);
    const d = await request<{ id: number }>("POST", "/api/v2/deals", token, {
      title: `${nombre} — ${quiere || "Cotización"}`,
      person_id: personId,
      ...(target
        ? { pipeline_id: target.pipelineId, stage_id: target.stageId }
        : {}),
    });
    dealId = d.id;
  }

  // 3. La etiqueta: es lo que dispara la automatización nativa.
  const idDebe = await idDeEtiqueta(token, ETIQUETA_DEBE_COTIZACION);
  const trato = await obtenerTratoConEtiquetas(token, dealId);
  let etiquetaPuesta = false;

  if (idDebe && trato) {
    if (!trato.labelIds.includes(idDebe)) {
      await escribirEtiquetas(token, dealId, [...trato.labelIds, idDebe]);
    }
    etiquetaPuesta = true;
  }

  // 4. Nota con lo que pidió, para no perder el contexto de la conversación.
  if (quiere) {
    try {
      await request("POST", "/v1/notes", token, {
        deal_id: dealId,
        content: `<p><b>Pidió cotización por WhatsApp</b></p><p>${quiere
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p>`,
      });
    } catch (err) {
      console.error("[captura] No se pudo guardar la nota:", err);
    }
  }

  return {
    personId,
    dealId,
    reutilizado,
    etiquetaPuesta,
    // La tarea la crea la automatización de Pipedrive al ver la etiqueta.
    tareaCreada: etiquetaPuesta,
  };
}

export type ResultadoPidioCotizacion = {
  etiquetaPuesta: boolean;
  tareaCreada: boolean;
};

/**
 * El "📋 Me pidió cotización" de la cabina — la red que atrapa lo que se
 * quedó atrás.
 *
 * Iria dijo que la tarjeta NO siempre llega a "Propuesta pendiente" («a veces
 * se queda atrás»), así que esta acción existe para corregirlo desde el
 * correo, sin abrir Pipedrive ni arrastrar nada.
 *
 * Pone la etiqueta y crea la tarea con fecha. **No mueve la etapa**: mover
 * tratos de columna dispara el webhook a Zoho Flow, y aunque hoy solo actúa
 * en el stage_id 12, no vale la pena que un botón del correo genere eventos
 * de etapa que nadie pidió. La etiqueta es señal suficiente para el digest y
 * para la automatización nativa.
 */
export async function marcarPidioCotizacion(
  dealId: number,
): Promise<ResultadoPidioCotizacion> {
  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) throw new Error("PIPEDRIVE_API_TOKEN no está configurado.");

  const resultado: ResultadoPidioCotizacion = {
    etiquetaPuesta: false,
    tareaCreada: false,
  };

  const [idDebe, trato] = await Promise.all([
    idDeEtiqueta(token, ETIQUETA_DEBE_COTIZACION),
    obtenerTratoConEtiquetas(token, dealId),
  ]);

  // FALLA CERRADO. `escribirEtiquetas` REEMPLAZA la lista completa, así que
  // sin saber qué etiquetas tiene hoy el trato no se puede escribir: un
  // `trato` nulo (timeout al leer) se trataría como "no tiene ninguna" y el
  // PATCH borraría ⭐ Prioridad y ⏸ Esperando al cliente en silencio,
  // reportando éxito. Preferimos no poner la etiqueta y decirlo.
  if (idDebe && trato) {
    if (!trato.labelIds.includes(idDebe)) {
      await escribirEtiquetas(token, dealId, [...trato.labelIds, idDebe]);
    }
    resultado.etiquetaPuesta = true;
  } else if (!idDebe) {
    console.error(
      `[cabina] No existe la etiqueta "${ETIQUETA_DEBE_COTIZACION}"; se crea solo la tarea.`,
    );
  } else {
    console.error(
      `[cabina] No se pudo leer el trato ${dealId}; no se tocan sus etiquetas.`,
    );
  }

  // La tarea la crea la automatización nativa al ver la etiqueta que
  // acabamos de poner ("Etiqueta DEBE COTIZACION → tarea a 2 días hábiles").
  // Crearla también aquí duplicaría el pendiente: el guard por asunto no
  // salva, porque el código escribe de inmediato y la automatización llega
  // unos segundos después, cuando ya no hay nada que deduplicar.
  resultado.tareaCreada = resultado.etiquetaPuesta;

  return resultado;
}
