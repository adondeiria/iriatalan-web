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
  formData.append("SingleLine", body.nombre);
  formData.append("Number", body.whatsapp ?? "");
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
    });

    // Zoho devuelve 200 OK o 3xx (redirect a thank-you page) cuando
    // la submission es exitosa. Cualquier 4xx/5xx indica error.
    if (res.status >= 200 && res.status < 400) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: `Zoho rechazó la submission (status ${res.status}).` },
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
