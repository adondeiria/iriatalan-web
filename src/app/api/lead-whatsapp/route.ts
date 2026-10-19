/**
 * POST /api/lead-whatsapp — registra en Pipedrive a quien escribe por WhatsApp
 * sin haber pasado por el formulario del sitio.
 *
 * Lo llama Make cuando respond.io asigna una conversación entrante. Cubre el
 * hueco que dejó el formulario: quien entra por el botón de WhatsApp del blog
 * o marca directo NO tocaba ningún CRM, y se perdía si nadie lo capturaba a
 * mano. Pasó con un prospecto real el 16-ago.
 *
 * POR QUÉ AQUÍ Y NO EN MAKE: el módulo "Create a Person" de Make solo acepta
 * conexiones OAuth, y el OAuth de Pipedrive falla siempre con "CSRF token
 * mismatch" porque su redirect_uri apunta al dominio viejo (integromat.com).
 * Aquí, además, se reutiliza `registrarProspectoWhatsApp`, que ya deduplica.
 *
 * SEGURIDAD: secreto compartido en cabecera, comparado en tiempo constante.
 * El endpoint escribe en el CRM, así que no puede quedar abierto a internet.
 *
 * ENCENDIDO GRADUAL, igual que la bienvenida de respond.io:
 *   1. Sin LEAD_WHATSAPP_ENABLED=true          → responde ok pero NO escribe.
 *   2. Con LEAD_WHATSAPP_SOLO_TELEFONO=10díg.  → solo ese número escribe.
 *   3. Sin esa variable                        → producción.
 */

import { NextRequest, NextResponse } from "next/server";

import {
  estaEncendido,
  pasaCanary,
  quiereSoloNuevos,
  secretoValido,
} from "@/lib/lead-whatsapp";
import { avisarPorCorreo } from "@/lib/lead-whatsapp-correo";
import {
  normalizarTelefono,
  personaYaEnPipedrive,
  registrarProspectoWhatsApp,
} from "@/lib/pipedrive";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const secreto = process.env.LEAD_WHATSAPP_SECRET;
  if (!secreto) {
    return NextResponse.json(
      { error: "LEAD_WHATSAPP_SECRET no está configurado" },
      { status: 500 },
    );
  }

  const recibido = req.headers.get("x-lead-secret") ?? "";
  if (!secretoValido(recibido, secreto)) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    nombre?: unknown;
    telefono?: unknown;
    mensaje?: unknown;
    origen?: unknown;
  } | null;

  const nombre = String(body?.nombre ?? "").trim();
  const telefonoCrudo = String(body?.telefono ?? "").trim();
  const mensaje = String(body?.mensaje ?? "").trim();
  const origen = String(body?.origen ?? "").trim();

  if (!telefonoCrudo) {
    return NextResponse.json({ error: "falta telefono" }, { status: 400 });
  }

  const telefono = normalizarTelefono(telefonoCrudo);

  // Modo observación: contesta 200 para que Make no reintente en bucle, pero
  // deja constancia de a quién habría registrado.
  if (!estaEncendido()) {
    console.log(
      `[lead-whatsapp] APAGADO. Habría registrado a ${nombre || "(sin nombre)"} ${telefono}.`,
    );
    return NextResponse.json({ ok: true, apagado: true });
  }

  if (!pasaCanary(telefono)) {
    console.log(`[lead-whatsapp] ${telefono} fuera del canary; no se registra.`);
    return NextResponse.json({ ok: true, omitido: "canary" });
  }

  // soloNuevos (18-oct-2026): lo manda el workflow de respond.io que reemplaza
  // a Make. Make solo llamaba aquí si la persona NO estaba en Pipedrive; sin
  // esta compuerta, cada conversación nueva de un prospecto que ya conocemos
  // mandaría un correo de "ya en seguimiento" o abriría un trato nuevo si el
  // anterior estaba cerrado. Si la búsqueda falla (null) se registra igual:
  // registrarProspectoWhatsApp ya deduplica por coincidencia exacta.
  if (quiereSoloNuevos(body) && (await personaYaEnPipedrive(telefono)) === true) {
    console.log(`[lead-whatsapp] ${telefono} ya está en Pipedrive; soloNuevos, no se toca.`);
    return NextResponse.json({ ok: true, omitido: "ya_en_pipedrive" });
  }

  try {
    const r = await registrarProspectoWhatsApp({
      nombre,
      telefono,
      mensaje,
      origen,
    });

    // El aviso va DESPUÉS de registrar y sin romper la respuesta: si Resend
    // falla, el lead ya quedó en Pipedrive y devolver error provocaría un
    // reintento de Make. Se reporta en el cuerpo para poder auditarlo.
    const avisado = await avisarPorCorreo({
      nombre,
      telefono,
      origen,
      dealId: r.dealId,
      tratoReutilizado: r.tratoReutilizado,
    });

    return NextResponse.json({ ok: true, ...r, avisado });
  } catch (err) {
    console.error("[lead-whatsapp] No se pudo registrar:", err);
    // 502 y no 200: Make debe poder reintentar y quedar registrado el fallo.
    // Es seguro reintentar porque `registrarProspectoWhatsApp` deduplica.
    return NextResponse.json(
      { error: "no se pudo registrar en Pipedrive" },
      { status: 502 },
    );
  }
}
