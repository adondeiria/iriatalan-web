/**
 * Sonda de la cabina contra Pipedrive EN VIVO. Solo lectura.
 *
 * Comprueba que lo que el código busca POR NOMBRE existe de verdad en la
 * cuenta: las 4 etiquetas, el campo de fecha y la etapa "Propuesta
 * Presentada". Si algo de esto no resuelve, la cabina falla en silencio —
 * pone la tarea pero no la etiqueta, o mueve la etapa pero no sella la
 * fecha— y el correo se vuelve mentiroso sin avisar.
 *
 * También reporta la foto real del embudo: cuántos tratos caerían hoy en
 * cada sección del digest.
 *
 *   node scripts/sonda-cabina.mjs
 */

import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const TOKEN = env.match(/^PIPEDRIVE_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!TOKEN) {
  console.error("Falta PIPEDRIVE_API_TOKEN en .env.local");
  process.exit(1);
}

const BASE = "https://api.pipedrive.com";

async function pd(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-api-token": TOKEN, Accept: "application/json" },
  });
  const json = await res.json();
  if (!res.ok || json?.success === false) {
    throw new Error(`${path} → ${res.status} ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json;
}

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const ok = (b) => (b ? "OK  " : "FALLA");
let problemas = 0;
const check = (cond, msg) => {
  if (!cond) problemas += 1;
  console.log(`  [${ok(cond)}] ${msg}`);
};

console.log("=== Lo que la cabina busca por nombre ===\n");

const campos = await pd("/v1/dealFields?limit=500");
const campoLabel = campos.data.find((f) => f.key === "label");
const etiquetas = new Map(
  (campoLabel?.options ?? []).map((o) => [norm(o.label), o.id]),
);

for (const nombre of [
  "DEBE COTIZACION",
  "ESPERANDO CLIENTE",
  "PRIORIDAD",
  "PAGINA WEB",
]) {
  const id = etiquetas.get(norm(nombre));
  check(Boolean(id), `Etiqueta "${nombre}"${id ? ` → id ${id}` : " NO EXISTE"}`);
}

const campoFecha = campos.data.find(
  (f) => norm(f.name ?? "") === norm("Fecha propuesta enviada"),
);
check(
  Boolean(campoFecha),
  `Campo "Fecha propuesta enviada"${campoFecha ? ` → key ${campoFecha.key}` : " NO EXISTE"}`,
);
check(
  campoFecha?.field_type === "date",
  `El campo es tipo date (es: ${campoFecha?.field_type ?? "—"})`,
);

// La etapa destino del botón "✅ Propuesta enviada", con la MISMA regla que
// usa el código: contiene "propuesta" y ("enviada" o "presentada").
const stages = await pd("/api/v2/stages?limit=500");
const candidatas = (stages.data ?? []).filter((s) => {
  const n = norm(s.name ?? "");
  return n.includes("propuesta") && (n.includes("enviada") || n.includes("presentada"));
});
check(
  candidatas.length === 1,
  `Etapa destino resuelve a UNA sola: ${candidatas.map((s) => `${s.id}·${s.name}`).join(" | ") || "NINGUNA"}`,
);

// Y que NO capture por error la de "pendiente por enviar".
const pendiente = (stages.data ?? []).find((s) =>
  norm(s.name ?? "").includes("pendiente"),
);
check(
  !candidatas.some((c) => c.id === pendiente?.id),
  `No confunde "${pendiente?.name ?? "—"}" con la de enviada`,
);

console.log("\n=== Foto del embudo (lo que vería el correo hoy) ===\n");

const hoyISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const tratos = [];
let cursor = null;
do {
  const q = new URLSearchParams({ limit: "500", status: "open", sort_by: "id" });
  if (cursor) q.set("cursor", cursor);
  const r = await pd(`/api/v2/deals?${q}`);
  tratos.push(...(r.data ?? []));
  cursor = r.additional_data?.next_cursor ?? null;
} while (cursor);

const acts = [];
cursor = null;
do {
  const q = new URLSearchParams({ limit: "500", done: "false" });
  if (cursor) q.set("cursor", cursor);
  const r = await pd(`/api/v2/activities?${q}`);
  acts.push(...(r.data ?? []));
  cursor = r.additional_data?.next_cursor ?? null;
} while (cursor);

const idDebe = etiquetas.get(norm("DEBE COTIZACION"));
const conAct = new Set(acts.map((a) => a.deal_id).filter(Boolean));
const labelIds = (d) =>
  Array.isArray(d.label_ids) ? d.label_ids : d.label != null ? [Number(d.label)] : [];

const debe = tratos.filter((d) => idDebe && labelIds(d).includes(idDebe)).length;
const vencidas = acts.filter((a) => a.due_date && a.due_date < hoyISO).length;
const deHoy = acts.filter((a) => a.due_date === hoyISO).length;
const fugas = tratos.filter((d) => !conAct.has(d.id)).length;

console.log(`  Tratos abiertos:            ${tratos.length}`);
console.log(`  Actividades pendientes:     ${acts.length}`);
console.log(`  ── Secciones del digest ──`);
console.log(`  Te deben cotización:        ${debe}`);
console.log(`  Vencidos:                   ${vencidas}`);
console.log(`  Para hoy (${hoyISO}):     ${deHoy}`);
console.log(`  SIN SIGUIENTE PASO:         ${fugas}`);

console.log(
  problemas === 0
    ? "\n=== Todo resuelve. La cabina puede operar. ==="
    : `\n=== ${problemas} problema(s). Revisar antes de encender. ===`,
);
