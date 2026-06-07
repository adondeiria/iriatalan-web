// patch-proteger-v6-detalles.mjs
//
//   #1 Find/replace global "viv@" → "vivo(a)" en body + 10 FAQs
//   #2 Rediseñar mini-checklist del Bloque 1:
//      de 4 bullets con doble columna a 4 items + 4 sub-items indentados
//
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
const ART_ID = "article-hijo-discapacidad-cuando-yo-falte";
const APPLY = process.argv.includes("--apply");
const key = () => crypto.randomBytes(6).toString("hex");

const para = (text, opts = {}) => {
  const block = { _type: "block", _key: key(), style: opts.style || "normal", markDefs: [], children: [] };
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) {
      block.children.push({ _type: "span", _key: key(), text: p.slice(2, -2), marks: ["strong"] });
    } else if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
      block.children.push({ _type: "span", _key: key(), text: p.slice(1, -1), marks: ["em"] });
    } else {
      block.children.push({ _type: "span", _key: key(), text: p, marks: [] });
    }
  }
  if (opts.listItem) { block.listItem = opts.listItem; block.level = opts.level || 1; }
  return block;
};
const bullet = (t, level = 1) => para(t, { listItem: "bullet", level });

const replaceInText = (text) => {
  if (typeof text !== "string") return text;
  return text
    .replace(/viv@s/g, "vivos")
    .replace(/viv@/g, "vivo(a)");
};
const applyReplaceInBody = (body) =>
  body.map((b) => {
    if (b._type !== "block" || !b.children) return b;
    return { ...b, children: b.children.map((c) =>
      c._type === "span" && c.text ? { ...c, text: replaceInText(c.text) } : c
    )};
  });

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

console.log("🔍 Leyendo body y FAQs...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);
const allFaqs = await query(`*[_type=="faq" && _id in ["faq-disc-1","faq-disc-2","faq-disc-3","faq-disc-4","faq-disc-5","faq-disc-6","faq-disc-7","faq-disc-8","faq-disc-9","faq-disc-10"]]{_id, question, answer}`);
console.log(`   ✓ ${allFaqs.length} FAQs`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";

// ─── #2 Rediseñar mini-checklist ─────────────────────────────────────────

let newBody = [];
let did2 = false;
let skipOldChecklist = 0;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // Detección del bullet "Testamento actualizado · Tu familia sabe con qué notario"
  // (es el primer bullet del mini-checklist viejo)
  if (!did2 && block._type === "block" && block.listItem === "bullet"
      && /testamento actualizado.{0,20}tu familia sabe con qu[eé] notario/i.test(t)) {
    // Insertar nuevo diseño con sub-bullets
    newBody.push(bullet("☐ **Testamento actualizado**", 1));
    newBody.push(bullet("↳ ¿Tu familia sabe con qué notario se firmó?", 2));
    newBody.push(bullet("☐ **Régimen de apoyos definido** (judicial o notarial)", 1));
    newBody.push(bullet("↳ ¿Tu familia conoce quién será el tutor o apoyo principal?", 2));
    newBody.push(bullet("☐ **Poderes notariales vigentes**", 1));
    newBody.push(bullet("↳ ¿Tu familia sabe quién tiene los originales?", 2));
    newBody.push(bullet("☐ **Carta de intención escrita**", 1));
    newBody.push(bullet("↳ ¿Tu familia sabe dónde leerla y cómo actualizarla?", 2));
    skipOldChecklist = 3; // saltamos los 3 bullets viejos restantes
    did2 = true;
    continue;
  }
  if (skipOldChecklist > 0) {
    skipOldChecklist--;
    continue;
  }

  newBody.push(block);
}

// ─── #1 Find/replace "viv@" → "vivo(a)" en body + FAQs ─────────────────

let bodyVivCount = 0;
for (const b of newBody) {
  if (b._type === "block" && b.children) {
    for (const c of b.children) {
      if (c.text && /viv@/.test(c.text)) bodyVivCount += (c.text.match(/viv@/g) || []).length;
    }
  }
}
newBody = applyReplaceInBody(newBody);

let faqVivCount = 0;
const faqUpdates = [];
for (const f of allFaqs) {
  const joined = JSON.stringify(f.answer || []) + (f.question || "");
  const cnt = (joined.match(/viv@/g) || []).length;
  if (cnt === 0) continue;
  faqVivCount += cnt;
  faqUpdates.push({
    id: f._id,
    question: replaceInText(f.question || ""),
    answer: applyReplaceInBody(f.answer || []),
  });
}

console.log(`\n📋 Cambios v6:`);
console.log(`   #1 viv@ → vivo(a) (body):        ${bodyVivCount} reemplazos`);
console.log(`   #1 viv@ → vivo(a) (FAQs):        ${faqVivCount} reemplazos en ${faqUpdates.length} FAQs`);
console.log(`   #2 Mini-checklist rediseñado:    ${did2 ? "sí" : "NO"}`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did2) {
  console.error("\n❌ Anclaje del mini-checklist no pegó. Abortando.");
  process.exit(1);
}

const now = new Date().toISOString();
if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Usa --apply para guardar.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");
const mutations = [
  {
    patch: {
      id: ART_ID,
      set: { body: newBody, updatedAt: now, lastReviewed: now.slice(0, 10) },
    },
  },
  ...faqUpdates.map((u) => ({
    patch: { id: u.id, set: { question: u.question, answer: u.answer } },
  })),
];
await mutate(mutations);
console.log(`   ✓ Listo. Patched: 1 article + ${faqUpdates.length} FAQs.`);
