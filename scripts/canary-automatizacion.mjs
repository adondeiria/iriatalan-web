/**
 * Canary de la automatización "Etiqueta DEBE COTIZACION → tarea a 2 días".
 *
 * Crea un trato de prueba, le pone la etiqueta, espera, y verifica POR API
 * que Pipedrive creó sola la actividad con el vencimiento correcto. Al final
 * borra el trato de prueba.
 *
 * La verdad es el artefacto: que la UI diga "Activa para todos" no prueba que
 * dispare. Esto sí.
 *
 *   node scripts/canary-automatizacion.mjs
 *   node scripts/canary-automatizacion.mjs --conservar   (no borra el canary)
 */

import { readFileSync } from "node:fs";

const CONSERVAR = process.argv.includes("--conservar");

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const TOKEN = env.match(/^PIPEDRIVE_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!TOKEN) {
  console.error("Falta PIPEDRIVE_API_TOKEN en .env.local");
  process.exit(1);
}

const BASE = "https://api.pipedrive.com";
const ETIQUETA = "DEBE COTIZACION";
const ASUNTO = "armar y enviar cotizacion";

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

/** El día hábil que cae `n` días hábiles después de hoy, en CDMX. */
function habilesDespues(n) {
  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = hoy.split("-").map(Number);
  const cur = new Date(Date.UTC(y, m - 1, d, 12));
  let faltan = n;
  while (faltan > 0) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const dia = cur.getUTCDay();
    if (dia >= 1 && dia <= 5) faltan -= 1;
  }
  while (cur.getUTCDay() === 0 || cur.getUTCDay() === 6) {
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return cur.toISOString().slice(0, 10);
}

// 1. Resolver etiqueta y primera etapa.
const campos = await pd("GET", "/v1/dealFields?limit=500");
const opt = (campos.data.find((f) => f.key === "label")?.options ?? []).find(
  (o) => norm(o.label) === norm(ETIQUETA),
);
if (!opt) {
  console.error(`No existe la etiqueta "${ETIQUETA}".`);
  process.exit(1);
}

const stages = await pd("GET", "/api/v2/stages?limit=500");
const primera = [...stages.data].sort((a, b) => a.order_nr - b.order_nr)[0];

// 2. Crear el canary.
const creado = await pd("POST", "/api/v2/deals", {
  title: "CANARY cabina — borrar",
  stage_id: primera.id,
});
const dealId = creado.data.id;
console.log(`Canary creado: trato ${dealId} en etapa "${primera.name}"`);

// 3. Ponerle la etiqueta (esto debe disparar la automatización).
await pd("PATCH", `/api/v2/deals/${dealId}`, {
  label_ids: [opt.id],
});
console.log(`Etiqueta "${ETIQUETA}" (id ${opt.id}) aplicada. Esperando…`);

// 4. Sondear hasta 60 s: las automatizaciones no son instantáneas.
const esperado = habilesDespues(2);
let encontrada = null;
for (let i = 1; i <= 24; i += 1) {
  await new Promise((r) => setTimeout(r, 5000));
  const acts = await pd(
    "GET",
    `/api/v2/activities?deal_id=${dealId}&limit=100`,
  );
  encontrada = (acts.data ?? []).find((a) => norm(a.subject ?? "").includes(ASUNTO));
  if (encontrada) {
    console.log(`\nActividad detectada tras ~${i * 5}s.`);
    break;
  }
  process.stdout.write(".");
}

console.log("");
if (!encontrada) {
  console.log("FALLA: la automatización NO creó la actividad en 60 s.");
  console.log("Revisar: ¿está activa? ¿la condición usa 'contiene'?");
} else {
  const okAsunto = norm(encontrada.subject).includes(ASUNTO);
  const okFecha = encontrada.due_date === esperado;
  console.log(`  [${okAsunto ? "OK  " : "FALLA"}] Asunto: "${encontrada.subject}"`);
  console.log(
    `  [${okFecha ? "OK  " : "FALLA"}] Vence: ${encontrada.due_date} (esperado ${esperado}, 2 días hábiles)`,
  );
  console.log(`  [${encontrada.done === false ? "OK  " : "FALLA"}] Sigue pendiente`);
}

// 5. Limpiar.
if (CONSERVAR) {
  console.log(`\nCanary conservado: /deal/${dealId}`);
} else {
  await pd("DELETE", `/api/v2/deals/${dealId}`);
  console.log(`\nCanary ${dealId} borrado.`);
}
