/**
 * Crea el campo de trato "Fecha propuesta enviada" (tipo fecha).
 *
 * Es el dato duro que sustituye a la memoria: cuándo salió realmente la
 * propuesta. La cabina lo sella sola al pulsar "✅ Propuesta enviada", y
 * `marcarPropuestaEnviada` lo resuelve POR NOMBRE, así que basta con que
 * exista con este nombre exacto.
 *
 * Idempotente: si ya existe, no hace nada.
 *
 *   node scripts/crear-campo-fecha-propuesta.mjs            (simula)
 *   node scripts/crear-campo-fecha-propuesta.mjs --aplicar
 */

import { readFileSync } from "node:fs";

const APLICAR = process.argv.includes("--aplicar");
const NOMBRE = "Fecha propuesta enviada";

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
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json;
}

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const campos = await pd("GET", "/v1/dealFields?limit=500");
const existente = campos.data.find((f) => norm(f.name ?? "") === norm(NOMBRE));

if (existente) {
  console.log(`Ya existe: "${existente.name}" (key ${existente.key}, tipo ${existente.field_type})`);
} else if (!APLICAR) {
  console.log(`SIMULACIÓN: se crearía el campo "${NOMBRE}" (tipo date).`);
  console.log("Para aplicar: node scripts/crear-campo-fecha-propuesta.mjs --aplicar");
} else {
  const r = await pd("POST", "/v1/dealFields", {
    name: NOMBRE,
    field_type: "date",
  });
  console.log(`Creado: "${r.data.name}" (key ${r.data.key}, id ${r.data.id})`);
}
