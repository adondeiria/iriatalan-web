// patch-autismo-checklist-link.mjs
// Convierte el bloque "[Descargar checklist gratuito →]" del artículo en un link real.
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

const TARGET_URL = "/checklist-neurodivergencia";

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

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";

const newBody = [];
let didReplace = false;
for (const block of doc.body) {
  const t = getText(block);
  // Buscar el párrafo que contiene "[Descargar checklist gratuito" (con o sin →)
  if (!didReplace && block._type === "block" && /\[descargar checklist gratuito/i.test(t)) {
    const annKey = key();
    newBody.push({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [{ _key: annKey, _type: "link", href: TARGET_URL }],
      children: [
        {
          _type: "span",
          _key: key(),
          text: "👉 Descargar el checklist gratuito (PDF + Excel)",
          marks: [annKey, "strong"],
        },
      ],
    });
    didReplace = true;
    continue;
  }
  newBody.push(block);
}

console.log(`   ✓ Botón checklist reemplazado: ${didReplace ? "sí" : "NO"}`);
if (!didReplace) { console.error("❌ No encontré el bloque"); process.exit(1); }

const now = new Date().toISOString();
if (!APPLY) { console.log("\n🟡 DRY-RUN — corre con --apply"); process.exit(0); }

console.log("\n🟢 Aplicando...");
await mutate([{ patch: { id: ID, set: { body: newBody, updatedAt: now } } }]);
console.log("   ✓ Listo.");
