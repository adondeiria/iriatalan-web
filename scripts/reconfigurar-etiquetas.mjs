/**
 * Deja el catálogo de etiquetas de trato como lo decidió Iria:
 * conserva 5 y crea las 4 de la cabina. Las demás se borran.
 *
 * OJO: borrar una opción del campo `label` la quita de TODOS los tratos.
 * Correr `scripts/respaldar-etiquetas.mjs` antes (ya hecho: el respaldo vive
 * en `web-iriatalan/respaldo-etiquetas-pipedrive.json`).
 *
 * Por defecto SIMULA y no escribe nada. Para aplicar de verdad:
 *   node scripts/reconfigurar-etiquetas.mjs --aplicar
 */

import { readFileSync } from "node:fs";

const APLICAR = process.argv.includes("--aplicar");

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const TOKEN = env.match(/^PIPEDRIVE_API_TOKEN=(.*)$/m)?.[1]?.trim();
if (!TOKEN) {
  console.error("Falta PIPEDRIVE_API_TOKEN en .env.local");
  process.exit(1);
}

const BASE = "https://api.pipedrive.com";

/** Las que sobreviven, por nombre exacto. */
const CONSERVAR = ["ASPA", "SINERGIA", "ENYD", "VIDA", "GMM"];

/** Las que se crean. Colores del set que ya usa la cuenta. */
const NUEVAS = [
  { label: "DEBE COTIZACION", color: "red" },
  { label: "ESPERANDO CLIENTE", color: "gray" },
  { label: "PRIORIDAD", color: "yellow" },
  { label: "PAGINA WEB", color: "blue" },
];

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
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json;
}

const campos = await pd("GET", "/v1/dealFields?limit=500");
const campoLabel = campos.data.find((f) => f.key === "label");
if (!campoLabel) {
  console.error("No se encontró el campo `label` de tratos.");
  process.exit(1);
}

const actuales = campoLabel.options ?? [];
const conservadas = actuales.filter((o) => CONSERVAR.includes(o.label));
const borradas = actuales.filter((o) => !CONSERVAR.includes(o.label));

const faltantes = CONSERVAR.filter(
  (n) => !conservadas.some((o) => o.label === n),
);
if (faltantes.length) {
  console.error(`ALTO: no existen estas etiquetas a conservar: ${faltantes.join(", ")}`);
  process.exit(1);
}

const yaExisten = NUEVAS.filter((n) =>
  actuales.some((o) => o.label.toUpperCase() === n.label.toUpperCase()),
);

// Las existentes viajan con su id (así Pipedrive las respeta); las nuevas sin
// id, para que las cree. Lo que no aparezca en esta lista, se borra.
const opciones = [
  ...conservadas.map((o) => ({ id: o.id, label: o.label, color: o.color })),
  ...NUEVAS.filter(
    (n) => !yaExisten.some((y) => y.label === n.label),
  ),
];

console.log(`Campo label id: ${campoLabel.id}\n`);
console.log(`CONSERVAR (${conservadas.length}):`);
for (const o of conservadas) console.log(`   ${o.label}  [${o.color}]`);
console.log(`\nCREAR (${opciones.length - conservadas.length}):`);
for (const n of NUEVAS) {
  if (!yaExisten.some((y) => y.label === n.label)) {
    console.log(`   ${n.label}  [${n.color}]`);
  }
}
console.log(`\nBORRAR (${borradas.length}):`);
for (const o of borradas) console.log(`   ${o.label}`);

if (APLICAR) {
  console.log("\nAplicando…");
  const r = await pd("PUT", `/v1/dealFields/${campoLabel.id}`, {
    options: opciones,
  });
  const finales = r.data?.options ?? [];
  console.log(`\nListo. El catálogo quedó con ${finales.length} etiquetas:`);
  for (const o of finales) console.log(`   ${o.id}  ${o.label}  [${o.color}]`);
} else {
  console.log("\n--- SIMULACIÓN. No se escribió nada. ---");
  console.log("Para aplicar: node scripts/reconfigurar-etiquetas.mjs --aplicar");
}
