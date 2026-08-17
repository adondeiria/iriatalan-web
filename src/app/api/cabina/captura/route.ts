/**
 * POST /api/cabina/captura — guarda el prospecto que pidió cotización.
 *
 * Lo llama el formulario de /cabina/captura. Autoriza con la misma llave de
 * la página (HMAC del secreto), no con sesión: Iria captura desde el celular
 * en medio de una conversación de WhatsApp y una sesión vencida ahí es un
 * prospecto perdido.
 */

import { NextRequest, NextResponse } from "next/server";

import { verificarLlaveCaptura } from "@/lib/cabina/token";
import { capturarPideCotizacion } from "@/lib/pipedrive";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secreto = process.env.CABINA_SECRET;
  if (!secreto) {
    return NextResponse.json(
      { error: "CABINA_SECRET no está configurado" },
      { status: 500 },
    );
  }

  const form = await req.formData().catch(() => null);
  const llave = String(form?.get("k") ?? "");

  if (!verificarLlaveCaptura(llave, secreto)) {
    return NextResponse.json({ error: "llave inválida" }, { status: 403 });
  }

  const nombre = String(form?.get("nombre") ?? "").trim();
  const telefono = String(form?.get("telefono") ?? "").trim();
  const quiere = String(form?.get("quiere") ?? "").trim();

  const destino = new URL("/cabina/captura", req.nextUrl.origin);
  destino.searchParams.set("k", llave);

  if (!nombre || !telefono) {
    destino.searchParams.set("error", "faltan");
    return NextResponse.redirect(destino, 303);
  }

  try {
    const r = await capturarPideCotizacion({ nombre, telefono, quiere });
    destino.searchParams.set("ok", "1");
    destino.searchParams.set("deal", String(r.dealId));
    if (r.reutilizado) destino.searchParams.set("reuso", "1");
  } catch (err) {
    console.error("[captura] No se pudo capturar:", err);
    destino.searchParams.set("error", "pipedrive");
  }

  // 303 para que un refresh no reenvíe el formulario y duplique el prospecto.
  return NextResponse.redirect(destino, 303);
}
