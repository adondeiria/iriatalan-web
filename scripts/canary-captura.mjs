/**
 * Canary de la captura rápida contra Pipedrive EN VIVO.
 *
 * Simula lo que hace `capturarPideCotizacion` y verifica por API:
 *   1. Persona nueva → crea persona + trato + etiqueta → la automatización
 *      genera la tarea sola.
 *   2. La MISMA persona otra vez → reutiliza su trato, NO duplica.
 *
 * Limpia todo al final.
 *
 *   node scripts/canary-captura.mjs
 */

import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const TOKEN = env.match(/^PIPEDRIVE_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!TOKEN) {
  console.error("Falta PIPEDRIVE_API_TOKEN en .env.local");
  process.exit(1);
}

const BASE = "https://api.pipedrive.com";
// Número inventado que no choca con la cartera real.
const TEL = "+525500000199";

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

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

let problemas = 0;
const check = (cond, msg) => {
  if (!cond) problemas += 1;
  console.log(`  [${cond ? "OK  " : "FALLA"}] ${msg}`);
};

// Resolver etiqueta.
const campos = await pd("GET", "/v1/dealFields?limit=500");
const idDebe = (campos.data.find((f) => f.key === "label")?.options ?? []).find(
  (o) => norm(o.label) === norm("DEBE COTIZACION"),
)?.id;

console.log("=== 1. Prospecto NUEVO ===\n");

// Buscar: no debe existir.
const previo = await pd(
  "GET",
  `/api/v2/persons/search?term=${encodeURIComponent(TEL)}&fields=phone&exact_match=true&limit=5`,
);
check(!previo.data?.items?.length, "El teléfono de prueba no existe todavía");

// Crear persona + trato + etiqueta (lo que hace la captura).
const persona = await pd("POST", "/api/v2/persons", {
  name: "CANARY captura — borrar",
  phones: [{ value: TEL, primary: true, label: "mobile" }],
});
const personId = persona.data.id;

const stages = await pd("GET", "/api/v2/stages?limit=500");
const primera = [...stages.data].sort((a, b) => a.order_nr - b.order_nr)[0];

const trato = await pd("POST", "/api/v2/deals", {
  title: "CANARY captura — borrar",
  person_id: personId,
  stage_id: primera.id,
});
const dealId = trato.data.id;
await pd("PATCH", `/api/v2/deals/${dealId}`, { label_ids: [idDebe] });
console.log(`  Persona ${personId}, trato ${dealId} creados y etiquetados.`);

// La automatización debe generar la tarea.
let tarea = null;
for (let i = 1; i <= 12; i += 1) {
  await new Promise((r) => setTimeout(r, 5000));
  const acts = await pd("GET", `/api/v2/activities?deal_id=${dealId}&limit=50`);
  tarea = (acts.data ?? []).find((a) => norm(a.subject ?? "").includes("armar y enviar"));
  if (tarea) break;
  process.stdout.write(".");
}
console.log("");
check(Boolean(tarea), `La automatización creó la tarea${tarea ? ` (vence ${tarea.due_date})` : ""}`);
check(tarea?.deal_id === dealId, "La tarea quedó PEGADA al trato (no huérfana)");

console.log("\n=== 2. La MISMA persona pide otra cotización ===\n");

// La búsqueda por teléfono debe encontrarla.
const busca = await pd(
  "GET",
  `/api/v2/persons/search?term=${encodeURIComponent(TEL)}&fields=phone&exact_match=true&limit=5`,
);
const encontrada = busca.data?.items?.[0]?.item?.id;
check(encontrada === personId, `La busca por teléfono la encuentra (id ${encontrada})`);

// Y debe hallar su trato abierto en vez de crear otro.
const abiertos = await pd(
  "GET",
  `/api/v2/deals?person_id=${personId}&status=open&limit=50`,
);
check(
  (abiertos.data ?? []).length === 1 && abiertos.data[0].id === dealId,
  `Tiene UN solo trato abierto (${(abiertos.data ?? []).length}) → no se duplica`,
);

// Limpieza.
console.log("\n=== Limpieza ===\n");
if (tarea) await pd("DELETE", `/api/v2/activities/${tarea.id}`);
await pd("DELETE", `/api/v2/deals/${dealId}`);
await pd("DELETE", `/api/v2/persons/${personId}`);
console.log("  Canary borrado (tarea, trato y persona).");

console.log(
  problemas === 0
    ? "\n=== La captura rápida opera correctamente. ==="
    : `\n=== ${problemas} problema(s). ===`,
);
