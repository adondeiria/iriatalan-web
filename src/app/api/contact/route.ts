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
 */

const ZOHO_SUBMIT_URL =
  "https://forms.zohopublic.com/iriatalan/form/iriatalancontactoprecualificacion/formperma/cBGea7ACeL3vIinU4T3HXY3mbKFFjZHmeQe_qr3BWlw/htmlRecords/submit";

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
};

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

  // Validación lado servidor — espejo de los required en Zoho.
  if (!body.nombre || !body.email || !body.servicio || !body.privacy_accepted) {
    return NextResponse.json(
      {
        error:
          "Faltan campos requeridos: nombre, email, servicio o aceptación de privacidad.",
      },
      { status: 400 },
    );
  }

  // Mapeo a field names exactos de Zoho.
  const formData = new FormData();
  formData.append("zf_referrer_name", "iriatalan.com.mx");
  formData.append("zf_redirect_url", "");
  formData.append("zc_gad", "");
  // Sanitizar whatsapp — Zoho 'Number' field rechaza '+' y espacios
  // (checktype c2 = solo dígitos). Quitamos cualquier carácter no numérico.
  const whatsappDigits = (body.whatsapp ?? "").replace(/\D/g, "");
  formData.append("SingleLine", body.nombre);
  formData.append("Number", whatsappDigits);
  formData.append("SingleLine1", body.email);
  formData.append("SingleLine2", body.ciudad ?? "");
  formData.append("Dropdown", body.servicio);
  if (body.condicion_medica) {
    formData.append("Checkbox", body.condicion_medica);
  }
  formData.append("SingleLine4", body.aportacion ?? "");
  formData.append("SingleLine3", body.mensaje ?? "");
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
