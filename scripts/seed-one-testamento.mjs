// Sube SOLO el draft "article-testamento-no-protege-seguros-cuentas" a Sanity.
// Reusa el patrón de seed-drafts.mjs (createIfNotExists, idempotente) pero filtra
// un único _id para no crear los scaffolds vacíos del pipeline.
// Sin --apply = dry-run. Lee SANITY_API_WRITE_TOKEN de .env.local.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TARGET_ID = "article-testamento-no-protege-seguros-cuentas";

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!TOKEN) { console.error("❌ Falta SANITY_API_WRITE_TOKEN en .env.local"); process.exit(1); }

const lines = fs.readFileSync(path.join(__dirname, "..", "sanity", "seeds", "draft-articles.ndjson"), "utf8")
  .split("\n").map((l) => l.trim()).filter(Boolean);
const doc = lines.map((l) => JSON.parse(l)).find((d) => d._id === TARGET_ID);

if (!doc) { console.error(`❌ No encontré el doc ${TARGET_ID} en el ndjson`); process.exit(1); }

console.log(`📄 Documento a subir:\n   _id: ${doc._id}\n   título: ${doc.title}\n   topic=${doc.topic} · draft=${doc.draft} · bloques=${doc.body.length}\n`);

if (!APPLY) {
  console.log("🟡 DRY-RUN — corre con --apply para crear en Sanity (createIfNotExists, no sobrescribe).");
  process.exit(0);
}

const r = await fetch(`https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{ createIfNotExists: doc }] }),
});
if (!r.ok) { console.error(`❌ Mutate falló: ${r.status} ${await r.text()}`); process.exit(1); }
const result = await r.json();
const op = result.results?.[0]?.operation;
console.log(op === "create" ? "✅ Creado en Sanity como DRAFT (oculto al público)." : `⏭  Ya existía (operación: ${op}). No se tocó.`);
console.log("\nVer en Studio: https://iriatalan.com.mx/studio/structure/article");
