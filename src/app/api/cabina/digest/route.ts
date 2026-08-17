/**
 * GET /api/cabina/digest — arma y envía el correo diario de la cabina.
 *
 * Lo dispara el cron de Vercel (vercel.json: L-V 14:30 UTC = 8:30 CDMX).
 * Vercel manda `Authorization: Bearer ${CRON_SECRET}`; cualquier otra llamada
 * necesita el mismo header. Sin secreto configurado la ruta no opera: fallar
 * cerrado, nunca abierto.
 *
 * `?dry=1` regresa el HTML sin enviar el correo — para revisar el diseño y
 * para verificar por artefacto sin gastar envíos.
 */

import { NextRequest, NextResponse } from "next/server";

import {
  ETIQUETA_DEBE_COTIZACION,
  ETIQUETA_ESPERANDO_CLIENTE,
  ETIQUETA_PRIORIDAD,
  idDeEtiqueta,
  listarActividadesPendientes,
  listarTratosAbiertos,
  obtenerPersonas,
  request as pipedrive,
  resolverEmbudoVenta,
  type TratoAbierto,
} from "@/lib/pipedrive";
import { construirDigest, NOMBRE, type ProspectoDigest } from "@/lib/cabina/digest";
import { diasDesde, fechaCdmx } from "@/lib/cabina/fechas";

export const dynamic = "force-dynamic";

type StageV2 = { id: number; name?: string };

function noAutorizado(): NextResponse {
  return NextResponse.json({ error: "no autorizado" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cabina] CRON_SECRET no está configurado; digest apagado.");
    return noAutorizado();
  }
  if (req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return noAutorizado();
  }

  const token = process.env.PIPEDRIVE_API_TOKEN;
  const secreto = process.env.CABINA_SECRET;
  const siteUrl = (process.env.SITE_URL ?? "https://iriatalan.com.mx").replace(/\/$/, "");
  if (!token || !secreto) {
    return NextResponse.json(
      { error: "Faltan PIPEDRIVE_API_TOKEN o CABINA_SECRET" },
      { status: 500 },
    );
  }

  const ahora = new Date();
  const hoyISO = fechaCdmx(ahora);

  // 1. La foto del embudo, en paralelo.
  const pipelineId = resolverEmbudoVenta();
  const [tratos, actividades, idDebe, idEsperando, idPrioridad] = await Promise.all([
    listarTratosAbiertos(token, pipelineId),
    listarActividadesPendientes(token),
    idDeEtiqueta(token, ETIQUETA_DEBE_COTIZACION),
    idDeEtiqueta(token, ETIQUETA_ESPERANDO_CLIENTE),
    idDeEtiqueta(token, ETIQUETA_PRIORIDAD),
  ]);

  // 2. Nombres de etapa (deciden el mensaje de WhatsApp de cada tarjeta).
  const nombresEtapa = new Map<number, string>();
  try {
    const filtro = pipelineId ? `?pipeline_id=${pipelineId}&limit=500` : "?limit=500";
    const stages = await pipedrive<StageV2[]>("GET", `/api/v2/stages${filtro}`, token);
    for (const s of stages ?? []) nombresEtapa.set(s.id, s.name ?? "");
  } catch (err) {
    console.error("[cabina] Sin nombres de etapa; sigo con genéricos:", err);
  }

  // 3. Personas de todos los tratos involucrados, en un viaje.
  const tratosPorId = new Map(tratos.map((t) => [t.id, t]));
  const personas = await obtenerPersonas(
    token,
    tratos.map((t) => t.personId ?? 0).filter(Boolean),
  );

  const aProspecto = (
    trato: TratoAbierto,
    actividad: string | null,
    vence: string | null,
  ): ProspectoDigest => {
    const persona = trato.personId ? personas.get(trato.personId) : undefined;
    return {
      dealId: trato.id,
      titulo: trato.title,
      nombrePersona: persona?.name ?? null,
      telefono: persona?.telefono ?? null,
      nombreEtapa: nombresEtapa.get(trato.stageId) ?? "",
      actividad,
      vence,
      diasEsperando: diasDesde(trato.stageChangeTime ?? trato.addTime, ahora),
      debeCotizacion: idDebe !== null && trato.labelIds.includes(idDebe),
      esperandoCliente: idEsperando !== null && trato.labelIds.includes(idEsperando),
      prioridad: idPrioridad !== null && trato.labelIds.includes(idPrioridad),
    };
  };

  // 4. Las cuatro secciones. Un trato aparece UNA sola vez: la etiqueta
  //    "debe cotización" manda sobre todo lo demás, porque es el hueco que
  //    de verdad duele; si no la trae, se clasifica por su actividad.
  const debenCotizacion: ProspectoDigest[] = [];
  const vencidos: ProspectoDigest[] = [];
  const hoy: ProspectoDigest[] = [];
  const yaListado = new Set<number>();
  const conActividad = new Set<number>();

  for (const trato of tratos) {
    if (idDebe !== null && trato.labelIds.includes(idDebe)) {
      debenCotizacion.push(aProspecto(trato, null, null));
      yaListado.add(trato.id);
    }
  }

  // Ordenadas por vencimiento ascendente: un trato con DOS actividades
  // pendientes (una vencida y otra de hoy) debe entrar por la más urgente.
  // Sin este orden ganaba la que la API devolviera primero, y una actividad
  // vencida podía quedar escondida bajo la sección "Para hoy".
  const porVencimiento = [...actividades].sort((x, y) =>
    (x.dueDate ?? "9999-12-31").localeCompare(y.dueDate ?? "9999-12-31"),
  );

  for (const a of porVencimiento) {
    if (!a.dealId) continue;
    conActividad.add(a.dealId);
    if (yaListado.has(a.dealId) || !a.dueDate) continue;

    const trato = tratosPorId.get(a.dealId);
    if (!trato) continue; // actividad de un trato cerrado u otro embudo

    if (a.dueDate < hoyISO) {
      vencidos.push(aProspecto(trato, a.subject, a.dueDate));
      yaListado.add(a.dealId);
    } else if (a.dueDate === hoyISO) {
      hoy.push(aProspecto(trato, a.subject, a.dueDate));
      yaListado.add(a.dealId);
    }
  }

  const fugas = tratos
    .filter((t) => !conActividad.has(t.id) && !yaListado.has(t.id))
    .map((t) => aProspecto(t, null, null));

  const digest = construirDigest(
    { debenCotizacion, vencidos, hoy, fugas },
    { siteUrl, secreto, ahora },
  );

  if (!digest) {
    return NextResponse.json({ enviado: false, motivo: "embudo al día" });
  }

  if (req.nextUrl.searchParams.get("dry") === "1") {
    return new NextResponse(digest.html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // 5. Envío por Resend (fetch directo: sin SDK, sin dependencia nueva).
  const resendKey = process.env.RESEND_API_KEY;
  const destino = process.env.CABINA_EMAIL_DESTINO;
  if (!resendKey || !destino) {
    return NextResponse.json(
      { enviado: false, motivo: "Faltan RESEND_API_KEY o CABINA_EMAIL_DESTINO" },
      { status: 500 },
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`,
    },
    body: JSON.stringify({
      from: `${NOMBRE} <onboarding@resend.dev>`,
      to: [destino],
      subject: digest.asunto,
      html: digest.html,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    console.error("[cabina] Resend contestó", res.status, detalle);
    return NextResponse.json(
      { enviado: false, motivo: `Resend ${res.status}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    enviado: true,
    debenCotizacion: debenCotizacion.length,
    vencidos: vencidos.length,
    hoy: hoy.length,
    fugas: fugas.length,
  });
}
