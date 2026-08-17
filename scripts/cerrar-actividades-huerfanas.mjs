/**
 * Marca como hechas las actividades pendientes que cuelgan de tratos YA
 * CERRADOS (ganados o perdidos): un "llamar para dar seguimiento" sobre un
 * trato perdido hace un año no es un pendiente, es ruido.
 *
 * NO TOCA las actividades sin trato asociado: esas son el Google Calendar de
 * Iria (citas, clases, días festivos) sincronizado con Pipedrive. Marcarlas
 * sería meterse en su agenda personal.
 *
 * Marca como `done`, no borra: el historial del trato queda intacto y la
 * acción se revierte desmarcando. Respalda antes de tocar nada.
 *
 *   node scripts/cerrar-actividades-huerfanas.mjs            (simula)
 *   node scripts/cerrar-actividades-huerfanas.mjs --aplicar
 */

import { readFileSync, writeFileSync } from "node:fs";

const APLICAR = process.argv.includes("--aplicar");

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const TOKEN = env.match(/^PIPEDRIVE_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!TOKEN) {
  console.error("Falta PIPEDRIVE_API_TOKEN en .env.local");
  process.exit(1);
}

const BASE = "https://api.pipedrive.com";

async function pd(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "x-api-token": TOKEN,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json;
}

async function paginar(path, extra = {}) {
  const out = [];
  let cursor = null;
  do {
    const q = new URLSearchParams({ limit: "500", ...extra });
    if (cursor) q.set("cursor", cursor);
    const r = await pd("GET", `${path}?${q}`);
    out.push(...(r.data ?? []));
    cursor = r.additional_data?.next_cursor ?? null;
  } while (cursor);
  return out;
}

const tratos = await paginar("/api/v2/deals", { sort_by: "id" });
const porId = new Map(tratos.map((d) => [d.id, d]));
const actividades = await paginar("/api/v2/activities", { done: "false" });

// SOLO las que tienen trato Y ese trato está cerrado. Sin `deal_id` = agenda
// personal: se queda fuera por diseño.
const objetivo = actividades.filter((a) => {
  if (!a.deal_id) return false;
  const d = porId.get(a.deal_id);
  return Boolean(d) && d.status !== "open";
});

console.log(`Actividades pendientes en total:      ${actividades.length}`);
console.log(`  sin trato (agenda personal, INTOCABLES): ${actividades.filter((a) => !a.deal_id).length}`);
console.log(`  de tratos abiertos (se respetan):        ${actividades.filter((a) => a.deal_id && porId.get(a.deal_id)?.status === "open").length}`);
console.log(`  DE TRATOS CERRADOS → a cerrar:           ${objetivo.length}\n`);

const porEstado = {};
for (const a of objetivo) {
  const s = porId.get(a.deal_id)?.status ?? "?";
  porEstado[s] = (porEstado[s] ?? 0) + 1;
}
console.log(`Desglose: ${JSON.stringify(porEstado)}\n`);

if (!APLICAR) {
  console.log("Muestra de 10:");
  for (const a of objetivo.slice(0, 10)) {
    const d = porId.get(a.deal_id);
    console.log(
      `  ${a.due_date ?? "sin fecha"} | ${String(a.subject ?? "").slice(0, 34).padEnd(34)} | ${String(d?.title ?? "").slice(0, 26)} [${d?.status}]`,
    );
  }
  console.log("\n--- SIMULACIÓN. No se escribió nada. ---");
  console.log("Para aplicar: node scripts/cerrar-actividades-huerfanas.mjs --aplicar");
} else {
  const respaldo = objetivo.map((a) => ({
    id: a.id,
    subject: a.subject,
    due_date: a.due_date,
    deal_id: a.deal_id,
    deal_title: porId.get(a.deal_id)?.title ?? null,
    deal_status: porId.get(a.deal_id)?.status ?? null,
  }));
  const destino = new URL(
    "../../respaldo-actividades-cerradas.json",
    import.meta.url,
  );
  writeFileSync(
    destino,
    JSON.stringify(
      { generado: new Date().toISOString(), actividades: respaldo },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Respaldo: ${decodeURIComponent(destino.pathname.slice(1))}\n`);

  let ok = 0;
  const fallos = [];
  for (const a of objetivo) {
    try {
      await pd("PATCH", `/api/v2/activities/${a.id}`, { done: true });
      ok += 1;
      if (ok % 20 === 0) console.log(`  ${ok}/${objetivo.length}…`);
    } catch (err) {
      fallos.push({ id: a.id, error: String(err).slice(0, 120) });
    }
  }

  console.log(`\nCerradas: ${ok}/${objetivo.length}`);
  if (fallos.length) {
    console.log(`Fallaron ${fallos.length}:`);
    for (const f of fallos.slice(0, 10)) console.log(`  ${f.id}: ${f.error}`);
  }
}
