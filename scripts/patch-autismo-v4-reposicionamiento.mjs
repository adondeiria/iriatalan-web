// patch-autismo-v4-reposicionamiento.mjs
// Ronda 4: reposicionamiento estratégico A-F (seguro > banco)
// B) Reescribir apertura de "¿Cómo ayuda un fideicomiso?"
// C) Reemplazar tabla "La estrategia completa" con jerarquía nueva
// D) Añadir cierres anti-banco a 3 secciones
// E) Reescribir CTA "¿Hablamos de tu situación?"
// F) Actualizar TL;DR y excerpt
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
  if (opts.listItem) { block.listItem = opts.listItem; block.level = opts.level || 1; }
  return block;
};
const bullet = (t) => para(t, { listItem: "bullet", level: 1 });
const numbered = (t) => para(t, { listItem: "number", level: 1 });

// ============================================================
// B) Apertura nueva de "¿Cómo ayuda un fideicomiso?"
// ============================================================
const APERTURA_FIDEICOMISO_NUEVA = [
  para(
    "**¿Qué es un fideicomiso, en cristiano?** Es un mecanismo legal que recibe bienes y los administra siguiendo reglas escritas por ti, durante décadas, aunque tú ya no estés para revisar. El fideicomiso ejecuta las reglas — paga directo a clínicas, escuelas, cuidadores — sin que tu hijo tenga que firmar nada ni que un hermano cargue solo con la responsabilidad."
  ),
  para("En México hay dos caminos para llegar a esa misma protección:"),
  numbered("**Un seguro de vida con fideicomiso integrado** — el camino más accesible y el que recomiendo a la mayoría de las familias."),
  numbered("**Un fideicomiso bancario externo** — un contrato aparte con un banco, útil para patrimonios grandes con activos complejos."),
  para("La diferencia entre ambos cambia mucho lo que pagas, lo que protege y cuándo conviene cada uno."),
];

// ============================================================
// C) Tabla nueva "La estrategia completa"
// ============================================================
const TABLA_NUEVA = {
  _type: "comparisonTable",
  _key: key(),
  caption: "La estrategia completa de protección patrimonial",
  headers: ["Pieza", "Qué resuelve"],
  rows: [
    { _key: key(), _type: "row", cells: ["Testamento", "Define quién hereda y cómo"] },
    { _key: key(), _type: "row", cells: ["Seguro de vida con fideicomiso integrado", "Genera liquidez inmediata y la administra según tus reglas — sin contrato bancario aparte"] },
    { _key: key(), _type: "row", cells: ["Renta vitalicia", "Asegura un ingreso mensual de largo plazo para tu hijo"] },
    { _key: key(), _type: "row", cells: ["Carta de intención", "Explica cómo cuidar a tu hijo en el día a día"] },
    { _key: key(), _type: "row", cells: ["Fideicomiso bancario externo (opcional)", "Para patrimonios grandes con activos complejos (negocios, inmuebles múltiples)"] },
  ],
};

// ============================================================
// D) Cierres anti-banco
// ============================================================
const CIERRE_FIDEICOMISO = para(
  "Antes de ir a un banco a preguntar por un fideicomiso, vale la pena ver si el camino del seguro de vida con fideicomiso integrado ya resuelve lo que necesitas — más económico, más rápido de armar, y suficiente para la mayoría de las familias que acompaño."
);
const CIERRE_BENEFICIARIO = para(
  "Diseñar esto bien no se hace en un banco — se hace coordinando la póliza desde el inicio con tu asesor de seguros. Si quieres ver cómo se vería en tu caso, agenda una sesión conmigo."
);
const CIERRE_RENTAS = para(
  "Las rentas vitalicias se contratan directamente con la aseguradora, no en un banco. Es una de las piezas que armamos juntos en la sesión inicial."
);

// ============================================================
// E) CTA nuevo
// ============================================================
const CTA_NUEVO = [
  para(
    "**Agenda una sesión inicial (45 minutos, sin costo).** En esa primera plática revisamos tu situación y salimos con un mapa concreto: qué piezas necesitas (seguro de vida, seguro con fideicomiso integrado, renta vitalicia), en qué orden contratarlas y un estimado de cuánto costaría según tu patrimonio actual."
  ),
  para(
    "Mi compromiso es que termines con más claridad de la que llegaste. Si te conviene contratar conmigo, te explico exactamente qué producto y por qué. Si te conviene un camino distinto, también te lo digo."
  ),
];

// ============================================================
// F) TL;DR y Excerpt nuevos
// ============================================================
const NEW_TLDR = "Cuando tu hijo va a necesitar apoyo en la vida adulta, dejarle bienes directamente rara vez basta. Lo que sí funciona es combinar un testamento, un seguro de vida con fideicomiso integrado, una renta vitalicia y una red de apoyo con instrucciones claras — todo coordinado desde el inicio.";
const NEW_EXCERPT = "Cómo proteger a tu hijo con autismo o discapacidad cuando tú ya no estés: seguro de vida con fideicomiso integrado, renta vitalicia y testamento en México.";

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
const doc = await query(`*[_id=="${ID}"][0]{_id, body, tldr, excerpt}`);
console.log(`   ✓ Body: ${doc.body.length} blocks`);
console.log(`   ✓ TL;DR actual: ${doc.tldr.length} chars`);
console.log(`   ✓ Excerpt actual: ${doc.excerpt.length} chars`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

// Localizar H2s clave
const findH2Idx = (regex) => {
  for (let i = 0; i < doc.body.length; i++) {
    if (isH2(doc.body[i]) && regex.test(getText(doc.body[i]))) return i;
  }
  return -1;
};
const findNextH2 = (fromIdx) => {
  for (let i = fromIdx + 1; i < doc.body.length; i++) {
    if (isH2(doc.body[i])) return i;
  }
  return doc.body.length;
};

const idxComoAyudaFideicomiso = findH2Idx(/c[oó]mo ayuda un fideicomiso/i);
const idxNextAfterFideicomiso = findNextH2(idxComoAyudaFideicomiso);
const idxYsiBeneficiario = findH2Idx(/y si el beneficiario del seguro de vida/i);
const idxNextAfterBeneficiario = findNextH2(idxYsiBeneficiario);
const idxRentasVitalicias = findH2Idx(/c[oó]mo asegurar un ingreso mensual.*rentas vitalicias/i);
const idxNextAfterRentas = findNextH2(idxRentasVitalicias);
const idxHablamos = findH2Idx(/hablamos de tu situaci[oó]n/i);

console.log(`\n📍 Puntos clave:`);
console.log(`   H2 "Cómo ayuda fideicomiso": ${idxComoAyudaFideicomiso}, siguiente H2: ${idxNextAfterFideicomiso}`);
console.log(`   H2 "Y si beneficiario": ${idxYsiBeneficiario}, siguiente H2: ${idxNextAfterBeneficiario}`);
console.log(`   H2 "rentas vitalicias": ${idxRentasVitalicias}, siguiente H2: ${idxNextAfterRentas}`);
console.log(`   H2 "Hablamos de tu situación": ${idxHablamos}`);

if (idxComoAyudaFideicomiso === -1 || idxYsiBeneficiario === -1 || idxRentasVitalicias === -1 || idxHablamos === -1) {
  console.error("❌ No localicé alguno de los H2 clave. Abortando.");
  process.exit(1);
}

// Construir nuevo body
const newBody = [];
let didReplaceTable = false;
let didReplaceFidApertura = false;
let didInsertCierreFideicomiso = false;
let didInsertCierreBeneficiario = false;
let didInsertCierreRentas = false;
let didReplaceCTA = false;
let skipUntilIdx = -1; // para saltarse los párrafos viejos de apertura del fideicomiso

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const text = getText(block);

  // Saltarse los bloques marcados para skip (apertura vieja del fideicomiso)
  if (skipUntilIdx > 0 && i < skipUntilIdx) continue;

  // C) Reemplazar tabla "estrategia completa"
  if (
    block._type === "comparisonTable" &&
    /estrategia completa de protecci[oó]n patrimonial/i.test(block.caption || "")
  ) {
    newBody.push(TABLA_NUEVA);
    didReplaceTable = true;
    continue;
  }

  // B) Después del H2 "¿Cómo ayuda un fideicomiso?", reemplazar los siguientes párrafos de apertura
  // (los 2 párrafos "¿Qué es un fideicomiso, en cristiano?..." y "Muchas familias utilizan fideicomisos...")
  if (i === idxComoAyudaFideicomiso) {
    newBody.push(block); // mantener el H2
    newBody.push(...APERTURA_FIDEICOMISO_NUEVA);
    didReplaceFidApertura = true;
    // Saltarse los 2 párrafos viejos que empiezan con "¿Qué es un fideicomiso" y "Muchas familias utilizan"
    let skip = 0;
    for (let j = i + 1; j < doc.body.length; j++) {
      const jt = getText(doc.body[j]);
      if (/qu[eé] es un fideicomiso, en cristiano/i.test(jt)) { skip = j - i + 1; }
      else if (skip > 0 && /muchas familias utilizan fideicomisos/i.test(jt)) { skip = j - i + 1; break; }
      else if (skip > 0 && isH2(doc.body[j])) break;
    }
    skipUntilIdx = i + 1 + skip;
    continue;
  }

  // D-1) Cierre anti-banco al final de "¿Cómo ayuda un fideicomiso?" (antes del siguiente H2)
  if (i === idxNextAfterFideicomiso && !didInsertCierreFideicomiso) {
    newBody.push(CIERRE_FIDEICOMISO);
    newBody.push(block);
    didInsertCierreFideicomiso = true;
    continue;
  }

  // D-2) Cierre anti-banco al final de "¿Y si el beneficiario...?" (antes del siguiente H2)
  if (i === idxNextAfterBeneficiario && !didInsertCierreBeneficiario) {
    newBody.push(CIERRE_BENEFICIARIO);
    newBody.push(block);
    didInsertCierreBeneficiario = true;
    continue;
  }

  // D-3) Cierre anti-banco al final de "rentas vitalicias" (antes del siguiente H2)
  if (i === idxNextAfterRentas && !didInsertCierreRentas) {
    newBody.push(CIERRE_RENTAS);
    newBody.push(block);
    didInsertCierreRentas = true;
    continue;
  }

  // E) Reemplazar párrafo del CTA "Agenda una sesión inicial (45 minutos, sin costo)..."
  if (
    !didReplaceCTA &&
    i > idxHablamos &&
    block._type === "block" &&
    /agenda una sesi[oó]n inicial \(45 minutos, sin costo\)/i.test(text) &&
    /no te vendo nada en esa llamada/i.test(text)
  ) {
    newBody.push(...CTA_NUEVO);
    didReplaceCTA = true;
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Cambios aplicados:`);
console.log(`   ✓ B — Apertura fideicomiso reescrita: ${didReplaceFidApertura ? "sí" : "NO"}`);
console.log(`   ✓ C — Tabla estrategia reemplazada: ${didReplaceTable ? "sí" : "NO"}`);
console.log(`   ✓ D1 — Cierre fideicomiso (anti-banco): ${didInsertCierreFideicomiso ? "sí" : "NO"}`);
console.log(`   ✓ D2 — Cierre beneficiario (anti-banco): ${didInsertCierreBeneficiario ? "sí" : "NO"}`);
console.log(`   ✓ D3 — Cierre rentas (anti-banco): ${didInsertCierreRentas ? "sí" : "NO"}`);
console.log(`   ✓ E — CTA reescrita: ${didReplaceCTA ? "sí" : "NO"}`);
console.log(`   ✓ F — TL;DR nuevo: ${NEW_TLDR.length} chars (${NEW_TLDR.length > 320 ? "❌ excede" : "✓"})`);
console.log(`   ✓ F — Excerpt nuevo: ${NEW_EXCERPT.length} chars (${NEW_EXCERPT.length > 160 ? "❌ excede" : "✓"})`);
console.log(`\n   Body: ${doc.body.length} → ${newBody.length} blocks`);

const allOk = didReplaceFidApertura && didReplaceTable && didInsertCierreFideicomiso && didInsertCierreBeneficiario && didInsertCierreRentas && didReplaceCTA && NEW_TLDR.length <= 320 && NEW_EXCERPT.length <= 160;
if (!allOk) {
  console.error("\n❌ Alguno de los cambios no se aplicó o excede límite. Abortando para no romper nada.");
  process.exit(1);
}

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para ejecutar.");
  process.exit(0);
}

// Re-extraer questionsAnswered
const newQA = [];
for (const block of newBody) {
  if (block._type === "block" && block.style === "h2") {
    const text = getText(block).trim();
    if (text.startsWith("¿")) newQA.push(text);
  }
}

console.log("\n🟢 Aplicando...");
await mutate([{
  patch: {
    id: ID,
    set: {
      body: newBody,
      tldr: NEW_TLDR,
      excerpt: NEW_EXCERPT,
      questionsAnswered: newQA,
      updatedAt: now,
      lastReviewed: now.slice(0, 10),
    },
  },
}]);
console.log("   ✓ Artículo actualizado.");
console.log(`   ℹ️  ISR refresca en ~30s.`);
console.log(`\n✅ ${SITE_URL}/blog/${SLUG}`);
