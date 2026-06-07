// refresh-autismo-meta.mjs
// Post-edición manual en Sanity: refresca updatedAt + lastReviewed + re-extrae questionsAnswered desde H2 del body.
// Sin --apply = dry-run.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const SITE_URL = env.SITE_URL || "https://iriatalan.com.mx";
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const SLUG = "como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const APPLY = process.argv.includes("--apply");

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

if (!TOKEN) { console.error("❌ Falta SANITY_API_WRITE_TOKEN"); process.exit(1); }

console.log("🔍 Leyendo body actual...");
const doc = await query(`*[_id=="${ID}"][0]{_id, title, body, questionsAnswered, updatedAt}`);
console.log(`   ✓ ${doc.body.length} blocks`);
console.log(`   ✓ updatedAt actual: ${doc.updatedAt}`);

// Re-extraer questionsAnswered de los H2 que empiezan con ¿
const newQA = [];
for (const block of doc.body) {
  if (block._type === "block" && block.style === "h2") {
    const text = (block.children || []).map((c) => c.text || "").join("").trim();
    if (text.startsWith("¿")) newQA.push(text);
  }
}

console.log(`\n📋 questionsAnswered:`);
console.log(`   antes: ${doc.questionsAnswered?.length || 0} preguntas`);
console.log(`   ahora: ${newQA.length} preguntas`);
newQA.forEach((q, i) => console.log(`     ${i + 1}. ${q}`));

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para ejecutar.");
  process.exit(0);
}

console.log("\n🟢 Aplicando refresh...");
await mutate([{
  patch: {
    id: ID,
    set: {
      questionsAnswered: newQA,
      updatedAt: now,
      lastReviewed: now.slice(0, 10),
    },
  },
}]);
console.log("   ✓ Metadata refrescada.");

console.log(`\n✅ ${SITE_URL}/blog/${SLUG}`);
console.log("   (ISR regenera en ~30s)");
