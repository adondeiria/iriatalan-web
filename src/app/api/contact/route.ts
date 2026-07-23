import { NextResponse } from "next/server";

import { createPipedriveLead, isPipedriveConfigured } from "@/lib/pipedrive";

/**
 * POST /api/contact — Único punto de entrada de leads del sitio. Lo usan el
 * form de /contacto y los 4 lead magnets (guía, checkup, checklist, calculadora).
 *
 * DESTINOS (se escriben en paralelo; basta que uno funcione para dar success):
 *   · Pipedrive — Persona + Lead en la Leads Inbox. Es el CRM de prospección.
 *     Activo solo si existe PIPEDRIVE_API_TOKEN.
 *   · Zoho Forms — el destino histórico. Se mantiene como respaldo durante la
 *     migración para que ningún lead se pierda si Pipedrive falla.
 *
 * Cuando Iria confirme que Pipedrive recibe bien, se apaga Zoho poniendo
 * PIPEDRIVE_ONLY=true en Vercel — sin tocar código ni redeployar el repo.
 *
 * Recibe JSON con schema interno (nombre, whatsapp, email, ciudad, servicio,
 * condicion_medica, aportacion, mensaje, privacy_accepted) y lo mapea a los
 * field names que Zoho asignó en el form embed (SingleLine, Number, etc.).
 *
 * Endpoint Zoho extraído del HTML embed code descargado el 2026-05-10.
 * Si Iria regenera el form en Zoho, este URL puede cambiar — actualizar aquí.
 *
 * ANTI-SPAM (silencioso, sin scripts externos — no afecta PSI):
 * 1. Honeypot: campo oculto `website` que solo llenan los bots → success falso.
 * 2. Tiempo mínimo de llenado: submits en <3s son bots → success falso.
 * 3. Validación estricta: email con formato, longitudes acotadas, y WhatsApp
 *    de 10 dígitos MX obligatorio cuando el origen es el form de /contacto.
 * 4. Rate limit por IP (in-memory): máx 5 envíos / 10 min.
 *
 * A los bots (1 y 2) se les responde `{ success: true }` SIN reenviar a Zoho,
 * para no darles señal de que fueron bloqueados y evitar que adapten el ataque.
 */

const ZOHO_SUBMIT_URL =
  "https://forms.zohopublic.com/iriatalan/form/iriatalancontactoprecualificacion/formperma/cBGea7ACeL3vIinU4T3HXY3mbKFFjZHmeQe_qr3BWlw/htmlRecords/submit";

// --- Parámetros anti-spam ---
const MIN_FILL_MS = 3000; // Un humano tarda >3s en llenar el form.
const RATE_LIMIT_MAX = 5; // Envíos permitidos por ventana.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos.

// Store in-memory de rate limit. En serverless cada instancia tiene su propio
// Map — es una primera capa, no una defensa perfecta; se combina con honeypot,
// timing y validación estricta. Clave = IP, valor = timestamps de envíos.
const rateStore = new Map<string, number[]>();

type ContactPayload = {
  nombre?: string;
  whatsapp?: string;
  email?: string;
  ciudad?: string;
  servicio?: string;
  condicion_medica?: "SI" | "NO" | "N/A" | "";
  aportacion?: string;
  mensaje?: string;
  privacy_accepted?: boolean;
  // Anti-spam (opcionales — forms viejos sin estos campos no se rompen):
  website?: string; // honeypot: debe llegar vacío.
  elapsed_ms?: number; // ms desde que se renderizó el form.
  source?: string; // "contacto" activa la regla de WhatsApp obligatorio.
  origin_path?: string; // ruta donde se llenó el form (ej. "/gmm").
  // Procedencia (de qué red social o campaña llegó). Ver lib/attribution.ts.
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
};

/**
 * Sanea un valor de atribución. Viene del cliente, así que no se confía: se
 * limita a caracteres inocuos y longitud acotada antes de llegar al CRM.
 */
function limpiarAtribucion(valor: string | undefined): string {
  return (valor ?? "").replace(/[^\w\s.\-/]/g, "").trim().slice(0, 60);
}

/**
 * Página de origen del lead, saneada. Se prefiere la ruta real que envió el
 * form; si no llegó, se cae al nombre del formulario. Solo se acepta un path
 * interno (empieza con "/", sin protocolo ni host) para que nadie inyecte una
 * URL externa en la nota del CRM.
 */
function resolveOrigin(payload: ContactPayload): string {
  const path = (payload.origin_path ?? "").trim();
  if (/^\/[\w\-/]*$/.test(path)) return path.slice(0, 80);
  const source = (payload.source ?? "").trim();
  return source ? source.slice(0, 40) : "desconocido";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Extrae la IP del cliente desde los headers que setea Vercel. */
function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** true si la IP superó el límite en la ventana. Registra el intento actual. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (rateStore.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  hits.push(now);
  rateStore.set(ip, hits);
  // Poda oportunista para que el Map no crezca sin control.
  if (rateStore.size > 5000) {
    for (const [key, times] of rateStore) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        rateStore.delete(key);
      }
    }
  }
  return hits.length > RATE_LIMIT_MAX;
}

/**
 * Normaliza un móvil mexicano a 10 dígitos. Acepta con/sin lada país (+52,
 * 52, 521). Devuelve null si no puede formar 10 dígitos válidos.
 */
function normalizeMxMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let d = digits;
  if (d.length === 13 && d.startsWith("521")) d = d.slice(3);
  else if (d.length === 12 && d.startsWith("52")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  return d.length === 10 ? d : null;
}

/** Respuesta silenciosa a bots: el bot cree que funcionó y no reintenta. */
function fakeSuccess() {
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo del request inválido (JSON malformado)." },
      { status: 400 },
    );
  }

  // (1) Honeypot — si el campo oculto viene lleno, es bot.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return fakeSuccess();
  }

  // (2) Tiempo mínimo de llenado — submits instantáneos son bots.
  //     Solo se evalúa si el form envió el dato (fail-open para forms viejos).
  if (typeof body.elapsed_ms === "number" && body.elapsed_ms < MIN_FILL_MS) {
    return fakeSuccess();
  }

  // (4) Rate limit por IP.
  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      {
        error:
          "Recibimos varios envíos desde tu conexión. Espera unos minutos o escríbenos por WhatsApp.",
      },
      { status: 429 },
    );
  }

  // (3) Validación estricta de campos requeridos.
  const nombre = (body.nombre ?? "").trim();
  const email = (body.email ?? "").trim();
  const servicio = (body.servicio ?? "").trim();

  if (!nombre || !email || !servicio || !body.privacy_accepted) {
    return NextResponse.json(
      {
        error:
          "Faltan campos requeridos: nombre, email, servicio o aceptación de privacidad.",
      },
      { status: 400 },
    );
  }

  if (nombre.length < 2 || nombre.length > 80) {
    return NextResponse.json(
      { error: "El nombre debe tener entre 2 y 80 caracteres." },
      { status: 400 },
    );
  }

  if (email.length > 120 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "El correo no tiene un formato válido." },
      { status: 400 },
    );
  }

  // WhatsApp: obligatorio (10 dígitos MX) cuando el origen es /contacto.
  // Para los lead-magnets (guia/checkup/etc.) sigue siendo opcional.
  const isContactoForm = body.source === "contacto";
  const rawWhatsapp = (body.whatsapp ?? "").trim();
  let whatsappDigits = rawWhatsapp.replace(/\D/g, "").slice(0, 15);

  if (isContactoForm) {
    const normalized = normalizeMxMobile(rawWhatsapp);
    if (!normalized) {
      return NextResponse.json(
        {
          error:
            "Ingresa un WhatsApp válido a 10 dígitos (ej. 55 1234 5678).",
        },
        { status: 400 },
      );
    }
    whatsappDigits = normalized;
  }

  // Longitudes acotadas antes de reenviar (defensa en profundidad).
  const ciudad = (body.ciudad ?? "").trim().slice(0, 80);
  const aportacion = (body.aportacion ?? "").trim().slice(0, 120);
  const mensajeLimpio = (body.mensaje ?? "").trim().slice(0, 2000);

  // El origen viaja anexado al mensaje que ve Iria en Zoho (que no tiene campo
  // propio para esto) y como campo dedicado en la nota de Pipedrive.
  const origen = resolveOrigin(body);
  const utmSource = limpiarAtribucion(body.utm_source);
  const utmMedium = limpiarAtribucion(body.utm_medium);
  const utmCampaign = limpiarAtribucion(body.utm_campaign);
  const referrer = limpiarAtribucion(body.referrer);

  // Zoho no tiene campos para esto, así que la procedencia viaja anexada al
  // mensaje. En Pipedrive va desglosada en la nota.
  const procedencia = [
    `Origen: ${origen}`,
    utmSource && `Vino de: ${utmSource}`,
    utmCampaign && `Campaña: ${utmCampaign}`,
    !utmSource && referrer && `Referido por: ${referrer}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const mensajeConOrigen = mensajeLimpio
    ? `${mensajeLimpio}\n\n[${procedencia}]`
    : `[${procedencia}]`;

  const lead = {
    nombre,
    email,
    whatsapp: whatsappDigits,
    ciudad,
    servicio,
    condicionMedica: body.condicion_medica ?? "",
    aportacion,
    mensaje: mensajeLimpio,
    origen,
    utmSource,
    utmMedium,
    utmCampaign,
    referrer,
  };

  // Se escriben los dos destinos en paralelo: el visitante no espera la suma
  // de ambas latencias, y una caída de Pipedrive no retrasa a Zoho.
  const enviarAZoho = !(process.env.PIPEDRIVE_ONLY === "true");
  const [pipedrive, zoho] = await Promise.allSettled([
    isPipedriveConfigured()
      ? createPipedriveLead(lead)
      : Promise.reject(new Error("Pipedrive no configurado.")),
    enviarAZoho
      ? submitToZoho({
          nombre,
          whatsappDigits,
          email,
          ciudad,
          servicio,
          condicionMedica: body.condicion_medica ?? "",
          aportacion,
          mensaje: mensajeConOrigen,
        })
      : Promise.reject(new Error("Zoho desactivado (PIPEDRIVE_ONLY).")),
  ]);

  if (pipedrive.status === "fulfilled" || zoho.status === "fulfilled") {
    // Al menos un CRM tiene el lead. Si el otro falló, queda en los logs de
    // Vercel para revisarlo sin castigar al visitante con un error.
    if (pipedrive.status === "rejected" && isPipedriveConfigured()) {
      console.error("[contact] Pipedrive falló:", pipedrive.reason);
    }
    if (zoho.status === "rejected" && enviarAZoho) {
      console.error("[contact] Zoho falló:", zoho.reason);
    }
    return NextResponse.json({ success: true });
  }

  // Ningún destino recibió el lead: esto sí es un error real para el visitante.
  console.error("[contact] Ningún destino recibió el lead.", {
    pipedrive: pipedrive.reason,
    zoho: zoho.reason,
  });
  return NextResponse.json(
    {
      error:
        "No pudimos registrar tu mensaje. Por favor escríbenos por WhatsApp y lo resolvemos ahí mismo.",
    },
    { status: 502 },
  );
}

/** Envía el lead al form de Zoho. Lanza si Zoho no acepta la submission. */
async function submitToZoho(input: {
  nombre: string;
  whatsappDigits: string;
  email: string;
  ciudad: string;
  servicio: string;
  condicionMedica: string;
  aportacion: string;
  mensaje: string;
}): Promise<void> {
  // Mapeo a field names exactos de Zoho.
  const formData = new FormData();
  formData.append("zf_referrer_name", "iriatalan.com.mx");
  formData.append("zf_redirect_url", "");
  formData.append("zc_gad", "");
  formData.append("SingleLine", input.nombre);
  formData.append("Number", input.whatsappDigits);
  formData.append("SingleLine1", input.email);
  formData.append("SingleLine2", input.ciudad);
  formData.append("Dropdown", input.servicio);
  if (input.condicionMedica) {
    formData.append("Checkbox", input.condicionMedica);
  }
  formData.append("SingleLine4", input.aportacion);
  formData.append("SingleLine3", input.mensaje);
  formData.append("TermsConditions", "on");

  const res = await fetch(ZOHO_SUBMIT_URL, {
    method: "POST",
    body: formData,
    // Zoho redirects a página de "thank you" después del submit (302).
    // No queremos seguir el redirect — solo verificar que el submit pasó.
    redirect: "manual",
    headers: {
      // Zoho rechaza con 409 sin estos headers — espera tráfico tipo browser.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      Origin: "https://iriatalan.com.mx",
      Referer: "https://iriatalan.com.mx/contacto",
    },
  });

  if (res.status >= 200 && res.status < 400) return;

  const responseBody = await res.text().catch(() => "(unable to read body)");
  throw new Error(
    `Zoho rechazó la submission (status ${res.status}): ${responseBody.slice(0, 300)}`,
  );
}
