// patch-autismo-v7.mjs
// Cambios 2, 6, 7:
//   2) Bloque visual ❌/✅ dentro de "El error que veo con más frecuencia"
//   6) Nueva FAQ "¿Qué pasa si mi hijo vive más años de los que planeé?"
//   7) Negritas en "Es la estructura"
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

// Bloque con mix de bold + emoji + cursiva
function mixBlock(parts, style = "normal") {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: parts.map((p) => ({
      _type: "span",
      _key: key(),
      text: p.text,
      marks: p.marks || [],
    })),
  };
}

// Cambio 2 — bloques del visual ❌/✅
const BLOQUE_ERROR_VS = [
  mixBlock([
    { text: "La pregunta más importante no es:", marks: ["strong"] },
  ]),
  mixBlock([
    { text: "❌ " },
    { text: "¿Cuánto dinero le voy a dejar?", marks: ["em"] },
  ]),
  mixBlock([
    { text: "La pregunta correcta es:", marks: ["strong"] },
  ]),
  mixBlock([
    { text: "✅ " },
    { text: "¿Quién administrará ese dinero cuando yo ya no esté?", marks: ["em"] },
  ]),
];

// Cambio 6 — Nueva FAQ
const FAQ_NUEVA_H3 = "¿Qué pasa si mi hijo vive más años de los que planeé?";
const FAQ_NUEVA_RESP = "Es uno de los miedos más comunes — y con razón, la expectativa de vida ha crecido mucho. Si solo dejas capital heredado, existe el riesgo real de que se agote antes que tu hijo. Por eso las rentas vitalicias son tan importantes en este tipo de planeación: están diseñadas para generar mensualidades durante toda la vida del beneficiario, sin importar cuántos años viva. Combinar una renta vitalicia con un seguro de vida con fideicomiso integrado te da las dos cosas: capital de respaldo + flujo mensual asegurado de largo plazo.";

// Cambio 7 — Negritas en "Es la estructura"
const FRASE_FINAL = [
  mixBlock([
    { text: "La diferencia entre un caso y otro no es el patrimonio. " },
    { text: "Es la estructura.", marks: ["strong"] },
  ]),
];

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

console.log("🔍 Leyendo body...");
const doc = await query(`*[_id=="${ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

// Localizar el H2 "Sobre la asesora" para meter la FAQ nueva justo antes
let idxSobreAsesora = -1;
for (let i = 0; i < doc.body.length; i++) {
  if (isH2(doc.body[i]) && /sobre la asesora/i.test(getText(doc.body[i]))) {
    idxSobreAsesora = i; break;
  }
}
console.log(`   H2 "Sobre la asesora" idx: ${idxSobreAsesora}`);

const newBody = [];
let did2 = false, did7 = false, did6 = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // Cambio 2: reemplazar el párrafo "La pregunta es: ¿quién lo va a administrar?"
  if (!did2 && block._type === "block" && /^la pregunta es:.*qui[eé]n lo va a administrar/i.test(t.trim())) {
    newBody.push(...BLOQUE_ERROR_VS);
    did2 = true;
    continue;
  }

  // Cambio 7: reemplazar la frase final "La diferencia entre un caso y otro no es el patrimonio. Es la estructura."
  if (!did7 && block._type === "block" && /la diferencia entre un caso y otro no es el patrimonio.*estructura/i.test(t)) {
    newBody.push(...FRASE_FINAL);
    did7 = true;
    continue;
  }

  // Cambio 6: insertar la FAQ nueva justo ANTES del H2 "Sobre la asesora"
  if (i === idxSobreAsesora && !did6) {
    newBody.push(mixBlock([{ text: FAQ_NUEVA_H3 }], "h3"));
    newBody.push(mixBlock([{ text: FAQ_NUEVA_RESP }]));
    newBody.push(block);
    did6 = true;
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Cambios:`);
console.log(`   ✓ 2 — Bloque ❌/✅: ${did2 ? "sí" : "NO"}`);
console.log(`   ✓ 6 — FAQ vivir más años: ${did6 ? "sí" : "NO"}`);
console.log(`   ✓ 7 — Negritas "Es la estructura": ${did7 ? "sí" : "NO"}`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did2 || !did6 || !did7) {
  console.error("❌ Algún cambio no se aplicó. Abortando.");
  process.exit(1);
}

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
console.log(`\n✅ ${SITE_URL}/blog/${SLUG}`);
