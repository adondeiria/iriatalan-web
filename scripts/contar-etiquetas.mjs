/**
 * Cuenta en cuántos tratos está puesta cada etiqueta, para decidir con datos
 * cuáles se pueden borrar sin perder información que importe.
 *
 * Solo lee. No modifica nada en Pipedrive.
 *
 *   node scripts/contar-etiquetas.mjs
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

// 1. Catálogo de etiquetas (son las opciones del campo `label` de trato).
const campos = await pd("/v1/dealFields?limit=500");
const campoLabel = campos.data.find((f) => f.key === "label");
const etiquetas = new Map(
  (campoLabel?.options ?? []).map((o) => [o.id, o.label]),
);
console.log(`Etiquetas en el catálogo: ${etiquetas.size}\n`);

// 2. Todos los tratos (abiertos y cerrados), paginando de verdad.
const uso = new Map([...etiquetas.keys()].map((id) => [id, 0]));
let sinEtiqueta = 0;
let total = 0;
let cursor = null;

do {
  const q = new URLSearchParams({ limit: "500", sort_by: "id" });
  if (cursor) q.set("cursor", cursor);
  const r = await pd(`/api/v2/deals?${q}`);

  for (const d of r.data ?? []) {
    total += 1;
    const ids = Array.isArray(d.label_ids)
      ? d.label_ids
      : d.label != null
        ? String(d.label).split(",").map(Number)
        : [];
    if (ids.length === 0) sinEtiqueta += 1;
    for (const id of ids) uso.set(id, (uso.get(id) ?? 0) + 1);
  }
  cursor = r.additional_data?.next_cursor ?? null;
} while (cursor);

// 3. Reporte, de la más usada a la menos.
const filas = [...uso.entries()]
  .map(([id, n]) => ({ id, nombre: etiquetas.get(id) ?? `(id ${id})`, n }))
  .sort((a, b) => b.n - a.n);

console.log(`Tratos revisados: ${total} (${sinEtiqueta} sin ninguna etiqueta)\n`);
console.log("USO   ETIQUETA");
console.log("----  --------------------------------");
for (const f of filas) {
  console.log(`${String(f.n).padStart(4)}  ${f.nombre}`);
}

const enCero = filas.filter((f) => f.n === 0);
console.log(
  `\nSin usar en ningún trato (${enCero.length}): ${enCero.map((f) => f.nombre).join(", ") || "ninguna"}`,
);
