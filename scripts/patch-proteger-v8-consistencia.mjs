// patch-proteger-v8-consistencia.mjs
// Consistencia final (feedback ChatGPT):
//   E1 keyTakeaways.items: limpiar "hij@" en el ítem 0
//   E2 Find/replace global "mism@" / "asegurad@" / "incapacitad@"
//      (en body + FAQs + ctaWhatsApp + keyTakeaways items)
//   E3 ctaWhatsApp: reescribir heading/text/preFilledMessage para
//      que NO compita con el CTA "Revisión de protección familiar"
//   E4 Mover "No es una sesión para venderte..." ANTES de los bullets ✅
//   E5 (opcional) Agregar línea "Si todo esto te parece mucho..."
//      después del CTA principal
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

// ─── Find/replace de los @ residuales (con cuidado de gramática) ────────
const replaceArroba = (s) => {
  if (typeof s !== "string") return s;
  return s
    .replace(/hij@s/g, "hijos")
    .replace(/hij@/g, "hijo o hija")
    .replace(/por s. mism@/g, "por sí mismo")
    .replace(/mism@s/g, "mismos")
    .replace(/mism@/g, "mismo(a)")
    .replace(/asegurad@s/g, "asegurados")
    .replace(/asegurad@/g, "asegurado(a)")
    .replace(/incapacitad@s/g, "incapacitados")
    .replace(/incapacitad@/g, "incapacitado(a)")
    .replace(/registrad@s/g, "registrados")
    .replace(/registrad@/g, "registrado(a)")
    .replace(/inv.lid@s/g, "inválidos")
    .replace(/inv.lid@/g, "inválido(a)")
    .replace(/viv@/g, "vivo(a)");
};
const applyReplaceInBody = (body) =>
  body.map((b) => {
    // Bloque normal con children/spans
    if (b._type === "block" && b.children) {
      return { ...b, children: b.children.map((c) =>
        c._type === "span" && c.text ? { ...c, text: replaceArroba(c.text) } : c
      )};
    }
    // keyTakeaways: items[]
    if (b._type === "keyTakeaways" && Array.isArray(b.items)) {
      return { ...b, items: b.items.map(replaceArroba) };
    }
    // ctaWhatsApp: heading/text/preFilledMessage (lo manejamos aparte abajo)
    return b;
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

console.log("🔍 Leyendo body + FAQs...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body}`);
const allFaqs = await query(`*[_type=="faq" && _id in ["faq-disc-1","faq-disc-2","faq-disc-3","faq-disc-4","faq-disc-5","faq-disc-6","faq-disc-7","faq-disc-8","faq-disc-9","faq-disc-10"]]{_id, question, answer}`);
console.log(`   ✓ ${doc.body.length} blocks, ${allFaqs.length} FAQs`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";

// ─── Pre-conteo de "@" para diagnóstico ─────────────────────────────────
let countBody = 0, countFaqs = 0;
const reAt = /\b\w*@\w*\b/g;
for (const b of doc.body) {
  const json = JSON.stringify(b);
  countBody += (json.match(reAt) || []).length;
}
for (const f of allFaqs) {
  const json = JSON.stringify(f);
  countFaqs += (json.match(reAt) || []).length;
}
console.log(`   "@" detectados antes: body=${countBody}, faqs=${countFaqs}`);

// ─── Reconstrucción del body con cambios estructurales ──────────────────

let newBody = [];
let did = {};

// E1: keyTakeaways → reescribimos items[0] específicamente para frasearlo
// sin "hij@". Lo demás también se limpia automáticamente con el find/replace.
const cleanKeyTakeaways = (b) => {
  if (b._type !== "keyTakeaways") return b;
  const items = (b.items || []).map(replaceArroba);
  // Item 0 lo reescribimos en lugar de solo replace, para que fluya mejor
  if (items[0] && /cuidar.{0,4}a tu hijo o hija/i.test(items[0])) {
    items[0] = "La pregunta clave no es quién hereda tu patrimonio, sino quién cuidará a tu hijo o hija y cómo se administrarán los recursos cuando tú no estés.";
  }
  did.E1 = true;
  return { ...b, items };
};

// E3: ctaWhatsApp → reescribimos para que no compita con el CTA "Revisión"
const rewriteCtaWhatsApp = (b) => {
  if (b._type !== "ctaWhatsApp") return b;
  did.E3 = true;
  return {
    ...b,
    heading: "¿Prefieres mandarme un WhatsApp?",
    text: "Si después de leer todo te late más arrancar por WhatsApp que por agenda, mándame un mensaje. Te respondo en horario hábil con las primeras preguntas para entender tu caso y, si tiene sentido, agendamos la revisión.",
    preFilledMessage: "Hola Iria, tengo un hijo o hija neurodivergente y quiero diseñar un plan para protegerlo a largo plazo.",
    buttonLabel: b.buttonLabel || "Mándame WhatsApp",
  };
};

// Necesitamos capturar 2 bloques clave para E4:
// - El bullet "Salimos con un mapa concreto..."
// - El párrafo "No es una sesión para venderte..."
// - El párrafo intro a bullets "En mi revisión de protección familiar..."
// Estrategia: hacer una pasada que detecte los 3, los almacene, y al
// reemitir el bloque "intro a bullets" inserte después el de "No es una sesión..."
// (y luego cuando lleguemos a la posición original de "No es una sesión...", lo omitimos).

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // E1: keyTakeaways
  if (block._type === "keyTakeaways") {
    newBody.push(cleanKeyTakeaways(block));
    continue;
  }

  // E3: ctaWhatsApp
  if (block._type === "ctaWhatsApp") {
    newBody.push(rewriteCtaWhatsApp(block));
    continue;
  }

  // E5: Insertar línea "Si todo esto te parece mucho..." después del CTA principal
  // Anclaje: el párrafo final "**👉 Agenda tu revisión (45 minutos, sin costo).**"
  if (!did.E5 && block._type === "block"
      && /agenda tu revisi.n.{0,15}45 minutos.{0,15}sin costo/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "*Si todo esto te parece mucho, empieza por la checklist de arriba.* La mayoría de las familias descubre que ya tiene algunas piezas resueltas y otras que simplemente no sabía que existían."
    ));
    did.E5 = true;
    continue;
  }

  newBody.push(block);
}

// ─── E4: Post-procesamiento — mover "No es una sesión..." ANTES de los bullets ✅
//        (lo sacamos de su posición actual y lo insertamos justo después del
//        párrafo intro "En mi revisión de protección familiar... check completo")
const idxNoEsSesion = newBody.findIndex((b) =>
  b._type === "block"
  && /no es una sesi.n para venderte un producto espec/i.test(getText(b))
);
const idxIntroBullets = newBody.findIndex((b) =>
  b._type === "block"
  && /en mi.{0,5}revisi.n de protecci.n familiar.{0,200}esto es lo que revisamos/i.test(getText(b))
);
if (idxNoEsSesion !== -1 && idxIntroBullets !== -1 && idxNoEsSesion !== idxIntroBullets + 1) {
  const [moved] = newBody.splice(idxNoEsSesion, 1);
  // Después de splice, los índices se desplazan: si idxIntroBullets < idxNoEsSesion,
  // su índice no cambia; si era mayor, ahora es uno menos.
  const insertIdx = idxIntroBullets < idxNoEsSesion ? idxIntroBullets + 1 : idxIntroBullets;
  newBody.splice(insertIdx, 0, moved);
  did.E4 = true;
}

// ─── E2: Find/replace global en body completo ───────────────────────────
newBody = applyReplaceInBody(newBody);

// ─── E2 (parte 2): Find/replace en cada FAQ ─────────────────────────────
const faqUpdates = [];
for (const f of allFaqs) {
  const oldJson = JSON.stringify(f);
  const newAnswer = applyReplaceInBody(f.answer || []);
  const newQuestion = replaceArroba(f.question || "");
  const newJson = JSON.stringify({ question: newQuestion, answer: newAnswer });
  if (newJson !== JSON.stringify({ question: f.question, answer: f.answer })) {
    faqUpdates.push({ id: f._id, question: newQuestion, answer: newAnswer });
  }
}

// ─── Conteo final ───────────────────────────────────────────────────────
let countBodyAfter = 0, countFaqsAfter = 0;
for (const b of newBody) {
  const json = JSON.stringify(b);
  countBodyAfter += (json.match(reAt) || []).length;
}
for (const u of faqUpdates) {
  const json = JSON.stringify(u);
  countFaqsAfter += (json.match(reAt) || []).length;
}

console.log(`\n📋 Cambios v8:`);
console.log(`   E1 keyTakeaways limpiado:           ${did.E1 ? "sí" : "NO"}`);
console.log(`   E2 @ residuales (body):             ${countBody} → ${countBodyAfter}`);
console.log(`   E2 @ residuales (FAQs):             ${countFaqs} → (procesadas ${faqUpdates.length})`);
console.log(`   E3 ctaWhatsApp reescrito:           ${did.E3 ? "sí" : "NO"}`);
console.log(`   E4 'No es una sesión' movido:       ${did.E4 ? "sí" : "NO"}`);
console.log(`   E5 línea pre-checklist agregada:    ${did.E5 ? "sí" : "NO"}`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did.E1 || !did.E3 || !did.E4 || !did.E5) {
  console.error(`\n❌ Algún cambio no se aplicó.`);
  process.exit(1);
}

const now = new Date().toISOString();
if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Usa --apply para guardar.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");
const mutations = [
  { patch: { id: ART_ID, set: { body: newBody, updatedAt: now, lastReviewed: now.slice(0, 10) } } },
  ...faqUpdates.map((u) => ({ patch: { id: u.id, set: { question: u.question, answer: u.answer } } })),
];
await mutate(mutations);
console.log(`   ✓ Listo. Patched: 1 article + ${faqUpdates.length} FAQs.`);
