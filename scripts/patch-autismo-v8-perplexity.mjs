// patch-autismo-v8-perplexity.mjs
// Cambios 5, 7, 9, 10, 12 del feedback de Perplexity
//   #5  → Aclaración sobre lenguaje (sección apunte sobre lenguaje)
//   #7  → Regulación vigente al final de FAQ apoyos gobierno
//   #9  → Matiz rentas vitalicias (al final de la sección)
//   #10 → Reordenar CTAs: "Números" lleva a checklist, "Hablamos" mantiene agenda
//   #12 → Bullets de valor en "¿Hablamos de tu situación?"
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
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
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
  if (opts.listItem) { block.listItem = opts.listItem; block.level = opts.level || 1; }
  return block;
};
const bullet = (t) => para(t, { listItem: "bullet", level: 1 });

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
const doc = await query(`*[_id=="${ID}"][0]{body, faqs}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";
const isH3 = (b) => b._type === "block" && b.style === "h3";

const newBody = [];
let did5 = false, did7 = false, did9 = false, did10a = false, did10b = false, did12 = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // #5 — Aclaración tras "Por eso prefiero no hablar de 'hijos discapacitados'..."
  if (!did5 && block._type === "block" && /por eso prefiero no hablar de.*hijos discapacitados/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      'Cuando uso la palabra "discapacidad", la uso como categoría legal y funcional — no como etiqueta que defina a la persona.'
    ));
    did5 = true;
    continue;
  }

  // #7 — Regulación vigente al final de la FAQ de apoyos del gobierno
  if (!did7 && isH3(block) && /qu[eé] pasa con los apoyos del gobierno/i.test(t)) {
    newBody.push(block); // el H3
    // Reemplazar el siguiente párrafo (la respuesta actual)
    if (i + 1 < doc.body.length && doc.body[i + 1]._type === "block" && doc.body[i + 1].style === "normal") {
      newBody.push(para(
        'En México hoy los apoyos por discapacidad no se pierden automáticamente por tener patrimonio, como sí ocurre en Estados Unidos. Pero esta área cambia con frecuencia. Siempre revisamos la regulación vigente en el año en que diseñamos el plan, porque los programas sociales cambian de reglas y montos con frecuencia.'
      ));
      i++; // saltar la respuesta vieja
      did7 = true;
    }
    continue;
  }

  // #9 — Matiz rentas vitalicias: insertar antes del párrafo "Las rentas vitalicias se contratan directamente con la aseguradora"
  if (!did9 && block._type === "block" && /las rentas vitalicias se contratan directamente con la aseguradora/i.test(t)) {
    newBody.push(para(
      'El diseño concreto — monto, indexaciones, duración — depende del producto y de la aseguradora. En la sesión inicial revisamos qué combinación es más estable frente a inflación médica y longevidad.'
    ));
    newBody.push(block);
    did9 = true;
    continue;
  }

  // #10a — Cambio en "¿Ya hiciste números?": el último párrafo apunta al checklist (no a agenda)
  if (!did10a && block._type === "block" && /agenda una sesión inicial y revisemos juntos qué tan protegido/i.test(t)) {
    newBody.push(para(
      'Si todavía no tienes números claros, empieza por descargar el checklist arriba — está pensado precisamente para que hagas esa cuenta tú misma y veas exactamente qué áreas necesitan atención antes de cualquier conversación conmigo.'
    ));
    did10a = true;
    continue;
  }

  // #12 — En "¿Hablamos de tu situación?": después del párrafo principal, añadir bullets de valor
  // Identificamos el párrafo "Mi compromiso es que termines con más claridad de la que llegaste."
  if (!did12 && block._type === "block" && /mi compromiso es que termines con más claridad de la que llegaste/i.test(t)) {
    newBody.push(block);
    newBody.push(para("En esa sesión:"));
    newBody.push(bullet("Salimos con un **mapa de piezas** (testamento, seguro de vida, fideicomiso, renta vitalicia) y un **orden sugerido** según tu situación."));
    newBody.push(bullet("Si te conviene contratar conmigo, te explico exactamente qué producto y por qué."));
    newBody.push(bullet("Si no te conviene contratar conmigo, al menos te llevas **claridad para hablar con tu notario, banco u otro asesor** — sin haber perdido el tiempo."));
    did12 = true;
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Cambios:`);
console.log(`   #5  Aclaración lenguaje: ${did5 ? "sí" : "NO"}`);
console.log(`   #7  Regulación vigente: ${did7 ? "sí" : "NO"}`);
console.log(`   #9  Matiz rentas vitalicias: ${did9 ? "sí" : "NO"}`);
console.log(`   #10 CTA Números → checklist: ${did10a ? "sí" : "NO"}`);
console.log(`   #12 Bullets de valor sesión: ${did12 ? "sí" : "NO"}`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did5 || !did7 || !did9 || !did10a || !did12) {
  console.error("❌ Algún cambio no se aplicó. Abortando.");
  process.exit(1);
}

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN.");
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
