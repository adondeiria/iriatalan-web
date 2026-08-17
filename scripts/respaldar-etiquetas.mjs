/**
 * Respaldo de las etiquetas de TODOS los tratos, antes de borrar el catálogo.
 *
 * Borrar una opción del campo `label` la quita de todos los tratos y no hay
 * "deshacer". Este archivo es el seguro: guarda qué etiqueta tenía cada trato
 * (por id y por nombre), de modo que sea posible reconstruirlas si algún día
 * hacen falta.
 *
 * Solo lee. Escribe un único archivo local.
 *
 *   node scripts/respaldar-etiquetas.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";

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

const campos = await pd("/v1/dealFields?limit=500");
const campoLabel = campos.data.find((f) => f.key === "label");
const catalogo = (campoLabel?.options ?? []).map((o) => ({
  id: o.id,
  label: o.label,
  color: o.color ?? null,
}));

const tratos = [];
let cursor = null;
do {
  const q = new URLSearchParams({ limit: "500", sort_by: "id" });
  if (cursor) q.set("cursor", cursor);
  const r = await pd(`/api/v2/deals?${q}`);
  for (const d of r.data ?? []) {
    const ids = Array.isArray(d.label_ids)
      ? d.label_ids
      : d.label != null
        ? String(d.label).split(",").map(Number)
        : [];
    if (ids.length === 0) continue;
    tratos.push({
      id: d.id,
      title: d.title,
      status: d.status,
      label_ids: ids,
      etiquetas: ids.map(
        (i) => catalogo.find((c) => c.id === i)?.label ?? `(id ${i})`,
      ),
    });
  }
  cursor = r.additional_data?.next_cursor ?? null;
} while (cursor);

const salida = {
  generado: new Date().toISOString(),
  nota: "Respaldo previo al borrado del catálogo de etiquetas de trato en Pipedrive.",
  campo_label_id: campoLabel?.id ?? null,
  catalogo,
  tratos,
};

const destino = new URL("../../respaldo-etiquetas-pipedrive.json", import.meta.url);
writeFileSync(destino, JSON.stringify(salida, null, 2), "utf8");

console.log(`Catálogo respaldado: ${catalogo.length} etiquetas`);
console.log(`Tratos con etiqueta: ${tratos.length}`);
console.log(
  `Marcas totales: ${tratos.reduce((n, t) => n + t.label_ids.length, 0)}`,
);
console.log(`\nArchivo: ${decodeURIComponent(destino.pathname.slice(1))}`);
