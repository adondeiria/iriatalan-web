/**
 * POST /api/cabina/hecho — ejecuta una acción de la cabina.
 *
 * SOLO POST: el link del correo abre una página de confirmación (GET sin
 * efectos) y es el botón de esa página el que llega aquí. Así un escáner de
 * links de Gmail que pre-visite el GET no puede mover nada por accidente.
 *
 * Autoriza el HMAC del par (acción, dealId) — ver src/lib/cabina/token.ts.
 * El token de una acción NO sirve para la otra.
 */

import { NextRequest, NextResponse } from "next/server";

import { verificarAccion, type AccionCabina } from "@/lib/cabina/token";
import { proximoDiaHabilISO } from "@/lib/dia-habil";
import { marcarPidioCotizacion, marcarPropuestaEnviada } from "@/lib/pipedrive";

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
  const accion = String(form?.get("a") ?? "");
  const dealId = Number(form?.get("deal") ?? NaN);
  const token = String(form?.get("t") ?? "");

  if (!verificarAccion(accion, dealId, token, secreto)) {
    return NextResponse.json({ error: "token inválido" }, { status: 403 });
  }

  const ahora = new Date();
  let parcial: string | null = null;

  // El PATCH a Pipedrive puede lanzar (401, 5xx, timeout). Sin este try, la
  // excepción subiría hasta Next y Iria vería una página de error genérica en
  // vez del aviso de "quedó a medias", que es justo lo que necesita saber.
  try {
    if ((accion as AccionCabina) === "propuesta-enviada") {
      const r = await marcarPropuestaEnviada(dealId, {
        hoyISO: proximoDiaHabilISO(ahora, 0),
      });
      if (!r.etapaMovida) parcial = "etapa";
      else if (!r.seguimientoCreado) parcial = "seguimiento";
    } else {
      const r = await marcarPidioCotizacion(dealId);
      if (!r.etiquetaPuesta) parcial = "etiqueta";
      else if (!r.tareaCreada) parcial = "tarea";
    }
  } catch (err) {
    console.error("[cabina] La acción falló contra Pipedrive:", err);
    parcial = "falla";
  }

  // De vuelta a la página de confirmación, ahora en modo "listo". 303 para
  // que el navegador haga GET y un refresh no repita el POST.
  const destino = new URL("/cabina/hecho", req.nextUrl.origin);
  destino.searchParams.set("a", accion);
  destino.searchParams.set("deal", String(dealId));
  destino.searchParams.set("t", token);
  destino.searchParams.set("listo", "1");
  if (parcial) destino.searchParams.set("parcial", parcial);
  return NextResponse.redirect(destino, 303);
}
