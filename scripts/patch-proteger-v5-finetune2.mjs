// patch-proteger-v5-finetune2.mjs
// Segunda ronda de fine-tune (feedback de ChatGPT):
//
//   #1 Convertir frases extraordinarias en BLOCKQUOTES (visualmente
//      destacadas). Agregamos quote "No basta con dejar dinero. Hay que
//      dejar instrucciones." al cierre de la historia.
//   #2 Compactar la HISTORIA (de 6 párrafos a versión tipo bullets cortos)
//   #3 Suavizar la frase "dos hojas firmadas ante notario" →
//      "un par de documentos firmados a tiempo: testamento, beneficiarios
//      revisados, ST-6 tramitado"
//   #4 Caja destacada (blockquote) después del cálculo económico:
//      "Lo que la mayoría de las familias descubre: el problema no es
//      contratar un seguro, es reemplazar décadas de ingresos."
//   #5 Reordenar CTAs: mover disclaimer al final (después de "¿Listo
//      para ver productos?"), eliminar duplicaciones.
//   #6 Find/replace global: "hij@" → "hijo o hija", "hij@s" → "hijos"
//      en TODO el body + las 10 FAQs.
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
const h3 = (t) => para(t, { style: "h3" });
const quote = (t) => para(t, { style: "blockquote" });

// Helper find/replace en el texto de un span (mantiene marcas)
const replaceInText = (text) => {
  if (typeof text !== "string") return text;
  return text
    .replace(/hij@s/g, "hijos")
    .replace(/hij@/g, "hijo o hija");
};

const applyReplaceInBody = (body) => {
  return body.map((b) => {
    if (b._type !== "block" || !b.children) return b;
    const newChildren = b.children.map((c) => {
      if (c._type === "span" && c.text) {
        return { ...c, text: replaceInText(c.text) };
      }
      return c;
    });
    return { ...b, children: newChildren };
  });
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

console.log("🔍 Leyendo body actual del A (v4 aplicado) y FAQs...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const allFaqs = await query(`*[_type=="faq" && _id in ["faq-disc-1","faq-disc-2","faq-disc-3","faq-disc-4","faq-disc-5","faq-disc-6","faq-disc-7","faq-disc-8","faq-disc-9","faq-disc-10"]]{_id, question, answer}`);
console.log(`   ✓ ${allFaqs.length} FAQs`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";

// ─── Construye el body con cambios estructurales ────────────────────────

let newBody = [];
let did2 = false, did4 = false, did5 = false;
let skipHistoria = 0;
let disclaimerBlock = null;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // #5a — Capturar disclaimer para moverlo al final (lo guardamos, no lo emitimos aquí)
  if (block._type === "disclaimer") {
    disclaimerBlock = block;
    did5 = true;
    continue;
  }

  // #2 + #3 + #1 — Detectar inicio de la historia v4 ("Llega a mi consulta una mamá...")
  //    y reemplazar los 6 párrafos siguientes por versión compactada.
  if (skipHistoria > 0) {
    // estamos saltando los párrafos viejos de la historia
    skipHistoria--;
    if (skipHistoria === 0 && did2) {
      // ya terminamos de saltar; el bloque actual NO es de la historia,
      // déjalo pasar (caemos al final del loop)
    } else {
      continue;
    }
  }

  if (!did2 && block._type === "block"
      && /llega a mi consulta una mam[aá]\. el pap[aá] acaba de fallecer/i.test(t)) {
    // Versión compactada de la historia (estilo párrafos cortos)
    newBody.push(para("Llega una mamá a mi consulta. El papá acaba de fallecer."));
    newBody.push(para("Había patrimonio. Había ahorros. Incluso había un seguro de vida."));
    newBody.push(para("**Pero no había testamento.**"));
    newBody.push(para("Las cuentas quedaron bloqueadas. La casa entró a juicio sucesorio. Las terapias siguieron costando lo mismo. Y la familia tuvo que sobrevivir con ahorros propios, préstamos y la buena voluntad de la familia extendida."));
    newBody.push(para("Mucho de esto **se pudo haber evitado con un par de documentos firmados a tiempo**: testamento, beneficiarios revisados, ST-6 tramitado."));
    newBody.push(para("No es que el papá no quisiera a su familia. Es que nadie le explicó qué pasaba si no dejaba esos papeles listos."));
    // #1 — blockquote destacada al cierre
    newBody.push(quote("No basta con dejar dinero. **Hay que dejar instrucciones**."));
    // Saltamos los 6 párrafos originales de la historia que vienen a continuación
    // (incluyendo el bloque actual, que ya consumimos pero no emitimos)
    skipHistoria = 5; // los 5 párrafos siguientes (el actual ya lo procesamos)
    did2 = true;
    continue;
  }

  // #4 — Caja destacada después del párrafo "...se acerca a los $20-25 millones a lo largo de 30 años."
  if (!did4 && block._type === "block"
      && /si le sumas inflaci.n m.dica.{0,80}\$20-25 millones a lo largo de 30 a.os/i.test(t)) {
    newBody.push(block);
    newBody.push(quote("**Lo que la mayoría de las familias descubre:** el problema no es contratar un seguro. El problema es **reemplazar décadas de ingresos**. La protección financiera de un hijo o hija con necesidades de apoyo suele requerir **millones de pesos, no miles**."));
    did4 = true;
    continue;
  }

  newBody.push(block);
}

// #5b — Agregar disclaimer al final (después del último H2 "¿Listo para ver productos?" y el link al B)
if (disclaimerBlock) {
  newBody.push(disclaimerBlock);
}

// #6 — Find/replace global en el body
console.log(`\n🔄 Aplicando find/replace 'hij@' → 'hijo o hija' en el body...`);
let bodyHijaCount = 0;
for (const b of newBody) {
  if (b._type === "block" && b.children) {
    for (const c of b.children) {
      if (c.text && /hij@/.test(c.text)) bodyHijaCount += (c.text.match(/hij@/g) || []).length;
    }
  }
}
newBody = applyReplaceInBody(newBody);
console.log(`   ${bodyHijaCount} ocurrencias en body`);

// #6 — Find/replace global en las FAQs
let faqHijaCount = 0;
const faqUpdates = [];
for (const f of allFaqs) {
  const oldText = JSON.stringify(f.answer || []) + (f.question || "");
  const newCount = (oldText.match(/hij@/g) || []).length;
  if (newCount === 0) continue;
  faqHijaCount += newCount;
  const newAnswer = applyReplaceInBody(f.answer || []);
  const newQuestion = replaceInText(f.question || "");
  faqUpdates.push({ id: f._id, question: newQuestion, answer: newAnswer });
}
console.log(`   ${faqHijaCount} ocurrencias en ${faqUpdates.length} FAQs`);

console.log(`\n📋 Cambios v5:`);
console.log(`   #1 Blockquote 'No basta con dejar dinero':  ${did2 ? "sí" : "NO"}`);
console.log(`   #2 Historia compactada:                     ${did2 ? "sí" : "NO"}`);
console.log(`   #3 Frase 'dos hojas' suavizada:             ${did2 ? "sí" : "NO"}`);
console.log(`   #4 Caja destacada post-cálculo:             ${did4 ? "sí" : "NO"}`);
console.log(`   #5 Disclaimer movido al final:              ${did5 ? "sí" : "NO"}`);
console.log(`   #6 hij@ → hijo o hija (body):               ${bodyHijaCount} reemplazos`);
console.log(`   #6 hij@ → hijo o hija (FAQs):               ${faqHijaCount} reemplazos`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did2 || !did4 || !did5) {
  console.error("\n❌ Algún anclaje no pegó. Abortando.");
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
      set: {
        body: newBody,
        updatedAt: now,
        lastReviewed: now.slice(0, 10),
      },
    },
  },
  ...faqUpdates.map((u) => ({
    patch: { id: u.id, set: { question: u.question, answer: u.answer } },
  })),
];
await mutate(mutations);
console.log(`   ✓ Listo. Patched: 1 article + ${faqUpdates.length} FAQs.`);
