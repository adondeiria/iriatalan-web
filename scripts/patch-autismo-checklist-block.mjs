// patch-autismo-checklist-block.mjs
// Reemplaza toda la sección "Checklist gratuito para familias neurodivergentes" del body
// con un solo bloque custom de tipo "checklistDiscapacidad" (que renderea el lead magnet
// gateado existente — formulario + descarga directa de PDF/Excel).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0,i).replace(/^﻿/,"").trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,"")]; })
);
const PID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = env.NEXT_PUBLIC_SANITY_DATASET;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const APPLY = process.argv.includes("--apply");
const key = () => crypto.randomBytes(6).toString("hex");

async function query(q) {
  const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`Query ${r.status}: ${await r.text()}`);
  return (await r.json()).result;
}
async function mutate(mutations) {
  const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate ${r.status}: ${await r.text()}`);
  return await r.json();
}

console.log("🔍 Leyendo body...");
const doc = await query(`*[_id=="${ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

// Encontrar el H2 "Checklist gratuito..." y el siguiente H2 (donde termina la sección)
let idxStart = -1, idxEndExclusive = -1;
for (let i = 0; i < doc.body.length; i++) {
  if (idxStart === -1 && isH2(doc.body[i]) && /checklist gratuito/i.test(getText(doc.body[i]))) {
    idxStart = i;
    continue;
  }
  if (idxStart !== -1 && isH2(doc.body[i])) {
    idxEndExclusive = i;
    break;
  }
}

console.log(`   H2 "Checklist gratuito" idx: ${idxStart}, siguiente H2 idx: ${idxEndExclusive}`);

if (idxStart === -1 || idxEndExclusive === -1) {
  console.error("❌ No localicé los puntos de la sección. Abortando.");
  process.exit(1);
}

const removedCount = idxEndExclusive - idxStart;
console.log(`   Bloques a remover (sección entera): ${removedCount}`);

// Construir nuevo body: pre + bloque custom + resto
const newBody = [
  ...doc.body.slice(0, idxStart),
  { _type: "checklistDiscapacidad", _key: key() },
  ...doc.body.slice(idxEndExclusive),
];

console.log(`\n   Body: ${doc.body.length} → ${newBody.length}`);

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");
await mutate([{
  patch: {
    id: ID,
    set: {
      body: newBody,
      updatedAt: now,
      lastReviewed: now.slice(0, 10),
    },
  },
}]);
console.log("   ✓ Listo.");
console.log(`   ℹ️  ISR refresca en ~30s.`);
