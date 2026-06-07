// patch-autismo-v5-down-faq.mjs
// Ronda 5: Ajustes 2 + 3
//   Ajuste 2 — Meter "síndrome de Down" en 4 lugares (3 en body + 1 en FAQ)
//   Ajuste 3 — Reemplazar FAQ "¿Cuánto dinero necesita un hijo con discapacidad?" con versión SEO mejorada
// Sin --apply = dry-run.
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
const SITE_URL = env.SITE_URL || "https://iriatalan.com.mx";
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const SLUG = "como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const APPLY = process.argv.includes("--apply");
const key = () => crypto.randomBytes(6).toString("hex");

const para = (text, opts = {}) => {
  const block = { _type: "block", _key: key(), style: opts.style || "normal", markDefs: [], children: [] };
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) {
      block.children.push({ _type: "span", _key: key(), text: p.slice(2, -2), marks: ["strong"] });
    } else {
      block.children.push({ _type: "span", _key: key(), text: p, marks: [] });
    }
  }
  return block;
};

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

// ============================================================
// 1) Body — reemplazar 3 párrafos para meter Síndrome de Down
// ============================================================
console.log("🔍 Leyendo body...");
const doc = await query(`*[_id=="${ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";

const newBody = [];
let didLug1 = false, didLug2 = false, didLug3 = false, didLug4 = false;
let inFaqAutistasReplaceMode = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // Lugar 1
  if (!didLug1 && /hay una frase que escucho.*hijo neurodivergente/i.test(t)) {
    newBody.push(para(
      'Hay una frase que escucho casi en cada consulta con un papá o una mamá de un hijo con autismo, síndrome de Down u otra condición que implique apoyos de largo plazo:'
    ));
    didLug1 = true;
    continue;
  }

  // Lugar 4
  if (!didLug4 && /cuando tu hijo es neurodivergente.*va a requerir acompañamiento/i.test(t)) {
    newBody.push(para(
      'Cuando tu hijo tiene autismo, síndrome de Down u otra condición que requiera apoyos de largo plazo, y va a requerir acompañamiento para administrar dinero en la vida adulta, la pregunta más importante no es *quién* recibe el patrimonio.'
    ));
    didLug4 = true;
    continue;
  }

  // Lugar 2
  if (!didLug2 && /y hay algo más que pocas familias contemplan/i.test(t) && /apoyo significativo para tomar decisiones/i.test(t)) {
    newBody.push(para(
      'Y hay algo más que pocas familias contemplan: en muchos casos de autismo con altas necesidades de apoyo, síndrome de Down con discapacidad intelectual asociada, o condiciones similares, dejarle los bienes directamente puede meter a la familia en un proceso legal largo (un juez decidiendo quién administra por él) antes de poder vender, rentar o disponer de cualquier cosa.'
    ));
    didLug2 = true;
    continue;
  }

  // Lugar 3: H3 FAQ "¿Esta planeación aplica para todos los hijos autistas?" + el párrafo que sigue
  if (!didLug3 && block._type === "block" && block.style === "h3" && /esta planeación aplica para todos los hijos autistas/i.test(t)) {
    newBody.push(block); // mantener el H3
    // Reemplazar el siguiente párrafo
    if (i + 1 < doc.body.length && doc.body[i + 1]._type === "block" && doc.body[i + 1].style === "normal") {
      newBody.push(para(
        'No. El autismo es un espectro muy amplio. Muchas personas autistas viven su vida adulta de forma plenamente autónoma y no necesitan este tipo de planeación especial. Esta guía está pensada para familias donde el hijo, por su nivel de necesidades de apoyo, probablemente va a requerir acompañamiento para tomar decisiones financieras o administrar recursos en su vida adulta — sea por autismo con altas necesidades de apoyo, síndrome de Down con discapacidad intelectual asociada, u otras condiciones similares.'
      ));
      i++; // saltar el párrafo viejo
      didLug3 = true;
    }
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Ajuste 2 — body:`);
console.log(`   ✓ Lugar 1 (frase consulta hijo neurodivergente): ${didLug1 ? "sí" : "NO"}`);
console.log(`   ✓ Lugar 2 (algo más que pocas familias contemplan): ${didLug2 ? "sí" : "NO"}`);
console.log(`   ✓ Lugar 3 (FAQ todos los hijos autistas): ${didLug3 ? "sí" : "NO"}`);
console.log(`   ✓ Lugar 4 (Cuando tu hijo es neurodivergente): ${didLug4 ? "sí" : "NO"}`);

if (!didLug1 || !didLug2 || !didLug3 || !didLug4) {
  console.error("❌ Alguno de los reemplazos no se encontró. Abortando.");
  process.exit(1);
}

// ============================================================
// 2) FAQs — buscar las 2 FAQs a actualizar
// ============================================================
// Ajuste 3 — FAQ doc separado
const FAQ_CUANTO_ID = "faq-autismo-cuanto-dinero-necesita-hijo-discapacidad";
const FAQ_CUANTO_NUEVA_QUESTION = "¿Cuánto dinero necesita una persona con autismo o discapacidad para vivir toda su vida?";
const FAQ_CUANTO_NUEVA_ANSWER = "No existe una cifra única. Depende de vivienda, terapias, medicamentos, cuidadores, transporte, expectativa de vida y nivel de autonomía. En muchas familias el costo acumulado puede representar varios millones de pesos durante décadas. Para darte una idea: si tu hijo necesitara $25,000 mensuales durante 30 años, hablaríamos de más de 9 millones de pesos solo para sostener ese flujo — sin contar inflación médica.";

console.log(`\n📋 Ajuste 3 — FAQ doc separado:`);
console.log(`   ✓ FAQ ID: ${FAQ_CUANTO_ID}`);
console.log(`   ✓ Nueva pregunta: ${FAQ_CUANTO_NUEVA_QUESTION}`);

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para ejecutar.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");

const mutations = [
  {
    patch: {
      id: ID,
      set: {
        body: newBody,
        updatedAt: now,
        lastReviewed: now.slice(0, 10),
      },
    },
  },
];

mutations.push({
  patch: {
    id: FAQ_CUANTO_ID,
    set: { question: FAQ_CUANTO_NUEVA_QUESTION, answer: FAQ_CUANTO_NUEVA_ANSWER },
  },
});

await mutate(mutations);
console.log("   ✓ Body + FAQs actualizados.");
console.log(`   ℹ️  ISR refresca en ~30s.`);
console.log(`\n✅ ${SITE_URL}/blog/${SLUG}`);
