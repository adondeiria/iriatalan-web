// patch-autismo-v3.mjs
// Ronda 3 de ediciones al artículo live:
//   A) "Síndrome de Down + discapacidad intelectual" más arriba (respuesta corta)
//   B) Tabla "La estrategia completa" después de la respuesta corta (comparisonTable)
//   C) H2 reformulado: "¿Cuál es la respuesta corta?" → "¿Cómo proteger económicamente a un hijo con autismo o discapacidad?"
//   D) CTA "¿Ya hiciste números?" antes de "¿Hablamos de tu situación?"
//   E) FAQ nueva: "¿Cuánto dinero necesita un hijo con discapacidad para vivir toda la vida?"
//   F) Suavizar "garantizan" en sección de rentas vitalicias (YMYL/CONDUSEF)
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
const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
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
  if (opts.listItem) { block.listItem = opts.listItem; block.level = opts.level || 1; }
  return block;
};
const h2 = (t) => para(t, { style: "h2" });
const h3 = (t) => para(t, { style: "h3" });
const bullet = (t) => para(t, { listItem: "bullet", level: 1 });

// ---- BLOQUES NUEVOS ----

// Cambio B: Tabla "La estrategia completa"
const TABLA_ESTRATEGIA = {
  _type: "comparisonTable",
  _key: key(),
  caption: "La estrategia completa de protección patrimonial",
  headers: ["Pieza", "Qué resuelve"],
  rows: [
    { _key: key(), _type: "row", cells: ["Testamento", "Define quién hereda y cómo"] },
    { _key: key(), _type: "row", cells: ["Seguro de vida", "Genera liquidez inmediata libre de ISR"] },
    { _key: key(), _type: "row", cells: ["Fideicomiso de administración", "Administra los recursos según tus reglas"] },
    { _key: key(), _type: "row", cells: ["Seguro de vida con beneficiario fideicomiso", "Combina las dos piezas anteriores"] },
    { _key: key(), _type: "row", cells: ["Renta vitalicia", "Diseñada para generar un ingreso mensual de largo plazo"] },
    { _key: key(), _type: "row", cells: ["Carta de intención", "Explica cómo cuidar a tu hijo en el día a día"] },
  ],
};

// Cambio D: CTA "¿Ya hiciste números?"
const CTA_NUMEROS = [
  h2("¿Ya hiciste números?"),
  para(
    "Si tu hijo necesitara $25,000 mensuales durante 30 años para mantener su nivel de vida, estaríamos hablando de **más de 9 millones de pesos** — solo para sostener ese flujo. Y eso sin contar inflación médica, imprevistos ni vivienda."
  ),
  para("La mayoría de las familias con las que platico nunca ha hecho ese cálculo."),
  para(
    "Agenda una sesión inicial y revisemos juntos qué tan protegido está hoy el futuro de tu hijo."
  ),
];

// Cambio E: FAQ nueva
const NEW_FAQ_ID = "faq-autismo-cuanto-dinero-necesita-hijo-discapacidad";
const NEW_FAQ_DOC = {
  _id: NEW_FAQ_ID,
  _type: "faq",
  question: "¿Cuánto dinero necesita un hijo con discapacidad para vivir toda la vida?",
  answer:
    "No existe una cifra única. Depende del nivel de necesidades de apoyo de tu hijo, sus terapias, vivienda, cuidadores, medicamentos y nivel de autonomía. Para darte una idea: si tu hijo necesitara $25,000 mensuales durante 30 años, estaríamos hablando de más de 9 millones de pesos — y eso sin contar inflación médica ni imprevistos. En muchas familias, el costo acumulado durante décadas puede superar fácilmente varios millones de pesos. Hacer este cálculo es uno de los primeros pasos para diseñar una estrategia patrimonial realista.",
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

console.log("🔍 Leyendo doc...");
const doc = await query(`*[_id=="${ID}"][0]{_id, body, faqs}`);
console.log(`   ✓ Body actual: ${doc.body.length} blocks`);

const getText = (b) =>
  b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

// === CAMBIO C: reformular H2 "¿Cuál es la respuesta corta?" ===
let idxRespuestaCorta = -1;
for (let i = 0; i < doc.body.length; i++) {
  if (isH2(doc.body[i]) && /cu[aá]l es la respuesta corta/i.test(getText(doc.body[i]))) {
    idxRespuestaCorta = i;
    break;
  }
}
console.log(`   ✓ H2 'respuesta corta' en idx: ${idxRespuestaCorta}`);

// === Buscar el primer párrafo después de la respuesta corta (para reformular con síndrome Down) ===
// === Buscar el siguiente H2 después de la respuesta corta (para insertar tabla ANTES) ===
let idxNextAfterRC = -1;
for (let i = idxRespuestaCorta + 1; i < doc.body.length; i++) {
  if (isH2(doc.body[i])) { idxNextAfterRC = i; break; }
}
console.log(`   ✓ Siguiente H2 tras respuesta corta (donde insertar tabla): ${idxNextAfterRC}`);

// === Buscar H2 "¿Hablamos de tu situación?" para insertar CTA antes ===
let idxHablamos = -1;
for (let i = 0; i < doc.body.length; i++) {
  if (isH2(doc.body[i]) && /hablamos de tu situaci[oó]n/i.test(getText(doc.body[i]))) {
    idxHablamos = i; break;
  }
}
console.log(`   ✓ H2 'hablamos' en idx: ${idxHablamos}`);

if (idxRespuestaCorta === -1 || idxNextAfterRC === -1 || idxHablamos === -1) {
  console.error("❌ No localicé puntos de inserción"); process.exit(1);
}

// === Construir nuevo body ===
const newBody = [];
let didReformulateH2 = false;
let didReformulateFirstPara = false;
let didSuavizarRentasVitaliciasIntro = false;
let didSuavizarMontoGarantizado = false;
let didUpdateKeyTakeaway = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const text = getText(block);

  // CAMBIO C: reformular H2 de respuesta corta
  if (i === idxRespuestaCorta) {
    newBody.push(h2("¿Cómo proteger económicamente a un hijo con autismo o discapacidad?"));
    didReformulateH2 = true;
    continue;
  }

  // CAMBIO A: reformular primer párrafo de la respuesta corta
  if (
    !didReformulateFirstPara &&
    i > idxRespuestaCorta &&
    block._type === "block" &&
    block.style === "normal" &&
    /cuando hay neurodivergencia de por medio/i.test(text)
  ) {
    newBody.push(
      para(
        "Cuando tu hijo es autista, vive con **síndrome de Down**, **discapacidad intelectual** u otra condición que requiera apoyo de largo plazo, y va a necesitar acompañamiento para administrar recursos en su vida adulta, dejarle bienes o dinero directamente a su nombre casi nunca es la mejor solución en México."
      )
    );
    didReformulateFirstPara = true;
    continue;
  }

  // CAMBIO B: insertar tabla "estrategia completa" ANTES del siguiente H2 tras respuesta corta
  if (i === idxNextAfterRC) {
    newBody.push(TABLA_ESTRATEGIA);
    newBody.push(block);
    continue;
  }

  // CAMBIO D: insertar CTA "¿Ya hiciste números?" ANTES del H2 "¿Hablamos de tu situación?"
  if (i === idxHablamos) {
    newBody.push(...CTA_NUMEROS);
    newBody.push(block);
    continue;
  }

  // CAMBIO F (suavizar 1): "Para esto existen las rentas vitalicias: planes estructurados (...) que garantizan..."
  if (
    !didSuavizarRentasVitaliciasIntro &&
    block._type === "block" &&
    /para esto existen las/i.test(text) &&
    /garantizan/i.test(text)
  ) {
    newBody.push(
      para(
        'Para esto existen las **rentas vitalicias**: planes y estructuras (de retiro o seguros específicos) diseñados para generar un **flujo mensual a tu hijo durante décadas**, e incluso de por vida según el producto, sin importar cuánto viva ni qué pase con la economía.'
      )
    );
    didSuavizarRentasVitaliciasIntro = true;
    continue;
  }

  // CAMBIO F (suavizar 2): "El monto está garantizado contractualmente por la aseguradora."
  if (
    !didSuavizarMontoGarantizado &&
    block._type === "block" &&
    block.listItem === "bullet" &&
    /el monto est[aá] garantizado/i.test(text)
  ) {
    newBody.push(
      para(
        "El monto y la duración quedan establecidos contractualmente con la aseguradora.",
        { listItem: "bullet", level: 1 }
      )
    );
    didSuavizarMontoGarantizado = true;
    continue;
  }

  // CAMBIO F (suavizar 3): Key takeaway de rentas vitalicias
  if (
    !didUpdateKeyTakeaway &&
    block._type === "keyTakeaways" &&
    Array.isArray(block.items)
  ) {
    const items = block.items.map((it) =>
      /rentas vitalicias garantizan/i.test(it)
        ? "Las rentas vitalicias están diseñadas para generar un ingreso mensual de largo plazo para tu hijo — algo que el capital heredado no siempre puede asegurar."
        : it
    );
    newBody.push({ ...block, items });
    didUpdateKeyTakeaway = true;
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Cambios aplicados:`);
console.log(`   ✓ A — Síndrome Down + discap intelectual en respuesta corta: ${didReformulateFirstPara ? "sí" : "NO"}`);
console.log(`   ✓ B — Tabla estrategia completa: insertada (${idxNextAfterRC})`);
console.log(`   ✓ C — H2 reformulado: ${didReformulateH2 ? "sí" : "NO"}`);
console.log(`   ✓ D — CTA ¿Ya hiciste números?: insertado (${idxHablamos})`);
console.log(`   ✓ E — FAQ nueva: ${NEW_FAQ_ID}`);
console.log(`   ✓ F1 — Suavizar rentas vitalicias intro: ${didSuavizarRentasVitaliciasIntro ? "sí" : "NO"}`);
console.log(`   ✓ F2 — Suavizar monto garantizado: ${didSuavizarMontoGarantizado ? "sí" : "NO"}`);
console.log(`   ✓ F3 — Suavizar key takeaway: ${didUpdateKeyTakeaway ? "sí" : "NO"}`);
console.log(`\n   Body: ${doc.body.length} → ${newBody.length} blocks`);

if (
  !didReformulateH2 ||
  !didReformulateFirstPara ||
  !didSuavizarRentasVitaliciasIntro ||
  !didSuavizarMontoGarantizado ||
  !didUpdateKeyTakeaway
) {
  console.error("\n❌ Faltó aplicar uno o más cambios. Abortando para no romper nada.");
  process.exit(1);
}

const newFaqsRefs = [
  ...(doc.faqs || []),
  { _key: key(), _type: "reference", _ref: NEW_FAQ_ID },
];
const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para ejecutar.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");
await mutate([{ createOrReplace: NEW_FAQ_DOC }]);
console.log("   ✓ FAQ creado.");

await mutate([
  {
    patch: {
      id: ID,
      set: {
        body: newBody,
        faqs: newFaqsRefs,
        updatedAt: now,
        lastReviewed: now.slice(0, 10),
      },
    },
  },
]);
console.log("   ✓ Artículo actualizado.");

if (REVALIDATE_SECRET) {
  const url = `${SITE_URL}/api/revalidate?path=/blog/${SLUG}&secret=${encodeURIComponent(REVALIDATE_SECRET)}`;
  try {
    const r = await fetch(url, { method: "POST" });
    if (r.ok) console.log("   ✓ Revalidate OK.");
  } catch (e) {
    console.log(`   ⚠️  Revalidate falló: ${e.message}`);
  }
} else {
  console.log("   ℹ️  ISR refresca en ~30s.");
}

console.log(`\n✅ LIVE: ${SITE_URL}/blog/${SLUG}`);
