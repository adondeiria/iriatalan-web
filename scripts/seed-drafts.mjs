// Seed: importa los 12 artículos en draft desde sanity/seeds/draft-articles.ndjson
// al Sanity Content Lake usando `createIfNotExists` (idempotente — no sobrescribe
// ediciones manuales en Studio).
//
// Lee SANITY_API_WRITE_TOKEN de .env.local. Sin token → exit 1.
// Sin `--apply` corre en dry-run (solo imprime lo que crearía).
//
// Usage:
//   node scripts/seed-drafts.mjs            (dry-run)
//   node scripts/seed-drafts.mjs --apply    (ejecuta)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!TOKEN) {
  console.error("❌ Missing SANITY_API_WRITE_TOKEN in .env.local");
  console.error(
    "   Pídelo en: https://sanity.io/manage → proyecto IRIA TALAN RIF → API → Tokens"
  );
  process.exit(1);
}

const seedsPath = path.join(
  __dirname,
  "..",
  "sanity",
  "seeds",
  "draft-articles.ndjson"
);
const lines = fs
  .readFileSync(seedsPath, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

const docs = lines.map((line, i) => {
  try {
    return JSON.parse(line);
  } catch (e) {
    console.error(`❌ Línea ${i + 1} no es JSON válido:`, e.message);
    process.exit(1);
  }
});

console.log(
  `📄 ${docs.length} drafts encontrados en seeds/draft-articles.ndjson\n`
);

docs.forEach((d, i) => {
  console.log(`[${(i + 1).toString().padStart(2, "0")}] ${d._id}`);
  console.log(`     ${d.title}`);
  console.log(`     topic=${d.topic} · format=${d.format} · draft=${d.draft}`);
});

if (!APPLY) {
  console.log("\n🟡 DRY-RUN — corre con `--apply` para crear en Sanity.");
  console.log(
    "   Idempotente: usa createIfNotExists (no sobrescribe ediciones existentes)."
  );
  process.exit(0);
}

const apiBase = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`;

async function mutate(mutations) {
  const url = `${apiBase}/mutate/${DATASET}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

// createIfNotExists = solo crea si no existe; nunca sobrescribe.
// Permite re-correr el seed sin destruir ediciones manuales en Studio.
const mutations = docs.map((d) => ({ createIfNotExists: d }));

console.log("\n🟢 Aplicando…");
const result = await mutate(mutations);

const created = (result.results ?? []).filter(
  (r) => r.operation === "create"
);
const skipped = (result.results ?? []).filter(
  (r) => r.operation !== "create"
);

console.log(`\n✅ ${created.length} creados`);
console.log(`⏭  ${skipped.length} ya existían (no tocados)`);
console.log(
  "\nVer en Studio: https://iriatalan.com.mx/studio/structure/article"
);
