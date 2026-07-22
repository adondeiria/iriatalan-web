import { NextResponse } from "next/server";

/**
 * POST /api/contact — Forward del form de pre-cualificación a Zoho Forms.
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
};

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

  // Longitudes acotadas antes de reenviar a Zoho (defensa en profundidad).
  const ciudad = (body.ciudad ?? "").trim().slice(0, 80);
  const aportacion = (body.aportacion ?? "").trim().slice(0, 120);
  const mensaje = (body.mensaje ?? "").trim().slice(0, 2000);

  // Mapeo a field names exactos de Zoho.
  const formData = new FormData();
  formData.append("zf_referrer_name", "iriatalan.com.mx");
  formData.append("zf_redirect_url", "");
  formData.append("zc_gad", "");
  formData.append("SingleLine", nombre);
  formData.append("Number", whatsappDigits);
  formData.append("SingleLine1", email);
  formData.append("SingleLine2", ciudad);
  formData.append("Dropdown", servicio);
  if (body.condicion_medica) {
    formData.append("Checkbox", body.condicion_medica);
  }
  formData.append("SingleLine4", aportacion);
  formData.append("SingleLine3", mensaje);
  formData.append("TermsConditions", "on");

  try {
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

    // Capturamos el body para diagnóstico cuando Zoho rechaza.
    if (res.status >= 200 && res.status < 400) {
      return NextResponse.json({ success: true });
    }

    const responseBody = await res.text().catch(() => "(unable to read body)");
    return NextResponse.json(
      {
        error: `Zoho rechazó la submission (status ${res.status}).`,
        zohoResponse: responseBody.slice(0, 500),
      },
      { status: 502 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Error de red: ${err.message}`
            : "Error de red desconocido al contactar Zoho.",
      },
      { status: 500 },
    );
  }
}
