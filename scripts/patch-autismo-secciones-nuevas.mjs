// patch-autismo-secciones-nuevas.mjs
// Añade 2 secciones nuevas al artículo publicado:
//   1) "¿Y si el beneficiario del seguro de vida es un fideicomiso?" (después de la sección seguro de vida)
//   2) "¿Cómo asegurar un ingreso mensual de por vida...? Las rentas vitalicias" (antes de "Los 5 errores")
// Suma 1 key takeaway, 1 FAQ relacionada, actualiza TL;DR, y refresca dateModified.
// Sin --apply = dry-run.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i).replace(/^﻿/, "").trim(),
        l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ""),
      ];
    })
);

const PID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = env.NEXT_PUBLIC_SANITY_DATASET;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
const SITE_URL = env.SITE_URL || "https://iriatalan.com.mx";
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const APPLY = process.argv.includes("--apply");
const SLUG = "como-dejar-dinero-hijo-autismo-discapacidad-mexico";

const key = () => crypto.randomBytes(6).toString("hex");

// Helpers para construir bloques Portable Text
const para = (text, opts = {}) => {
  const block = {
    _type: "block",
    _key: key(),
    style: opts.style || "normal",
    markDefs: [],
    children: [],
  };
  // Soporte para **bold** simple
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("**") && p.endsWith("**")) {
      block.children.push({
        _type: "span",
        _key: key(),
        text: p.slice(2, -2),
        marks: ["strong"],
      });
    } else {
      block.children.push({ _type: "span", _key: key(), text: p, marks: [] });
    }
  }
  if (opts.listItem) {
    block.listItem = opts.listItem;
    block.level = opts.level || 1;
  }
  return block;
};

const h2 = (text) => para(text, { style: "h2" });
const h3 = (text) => para(text, { style: "h3" });
const bullet = (text) => para(text, { listItem: "bullet", level: 1 });
const quote = (text) => para(text, { style: "blockquote" });

// ============================================================
// SECCIÓN NUEVA 1: seguro de vida con beneficiario fideicomiso
// ============================================================
const SECCION_1 = [
  h2("¿Y si el beneficiario del seguro de vida es un fideicomiso?"),
  para(
    "Esta es, en mi experiencia, **la combinación más sólida** para familias neurodivergentes en México."
  ),
  para("Funciona así:"),
  bullet(
    "En lugar de poner a tu hijo como beneficiario directo del seguro de vida, **pones al fideicomiso como beneficiario**."
  ),
  bullet(
    "Cuando los papás faltan, la aseguradora paga la indemnización **directo al fideicomiso**, no a una persona."
  ),
  bullet(
    "El fideicomiso recibe ese capital y lo administra según las reglas que tú dejaste por escrito en vida."
  ),
  para("¿Por qué importa tanto?"),
  bullet(
    "El dinero **nunca pasa por las manos de tu hijo** — no entra a juicio sucesorio, no hace falta abrirle cuenta, no necesita firmar nada."
  ),
  bullet(
    "**No depende** de que un hermano esté disponible para administrarlo."
  ),
  bullet("Llega rápido (semanas, no años) y **libre de ISR**."),
  bullet(
    "Empieza a ejecutar tus reglas el día 1: pagos directos a clínicas, a la escuela, al cuidador, lo que tú hayas dejado escrito."
  ),
  para(
    "Es la pieza que convierte un seguro de vida en una protección verdaderamente duradera. Hacerlo bien requiere coordinar la póliza y el fideicomiso desde antes (no después), y es parte central de lo que hago con las familias que acompaño."
  ),
];

// ============================================================
// SECCIÓN NUEVA 2: rentas vitalicias
// ============================================================
const SECCION_2 = [
  h2(
    "¿Cómo asegurar un ingreso mensual de por vida para tu hijo? Las rentas vitalicias"
  ),
  para("Hay un miedo que todos los papás me comparten en algún momento de la consulta:"),
  quote('"¿Y si el dinero se acaba antes que él?"'),
  para(
    "Es un miedo real. Heredar capital — por mucho que sea — siempre tiene la posibilidad de agotarse. Una mala decisión, una crisis económica, una inflación más alta de lo previsto, y los recursos pueden durar menos de lo que pensabas."
  ),
  para(
    "Para esto existen las **rentas vitalicias**: planes estructurados (de retiro o seguros específicos) que garantizan un **pago mensual a tu hijo durante toda su vida**, sin importar cuánto viva ni qué pase con la economía."
  ),
  para('Funcionan como una "pensión privada" diseñada específicamente para él:'),
  bullet(
    "Se contratan **estando vivos los padres**, con aportaciones periódicas o un monto inicial."
  ),
  bullet(
    "Cuando los papás faltan, **el flujo no se interrumpe** — sigue cayendo directo al beneficiario cada mes."
  ),
  bullet(
    "A diferencia de un capital heredado, **no se puede gastar de un solo golpe** ni perder en una mala decisión."
  ),
  bullet("El monto está garantizado contractualmente por la aseguradora."),
  para(
    'En muchas familias, la combinación más completa es: **seguro de vida con beneficiario fideicomiso para el capital + renta vitalicia para el ingreso mensual constante**. Una pieza cubre el "qué pasa el día que faltamos"; la otra cubre el "qué pasa todos los días siguientes durante décadas".'
  ),
];

// ============================================================
// FAQ nueva (documento separado)
// ============================================================
const NEW_FAQ_ID = "faq-autismo-capital-vs-renta-vitalicia";
const NEW_FAQ_DOC = {
  _id: NEW_FAQ_ID,
  _type: "faq",
  question:
    "¿Qué es mejor para mi hijo: heredarle capital o contratarle una renta vitalicia?",
  answer:
    'Depende del caso, pero muchas veces lo ideal es combinar las dos. El capital heredado da flexibilidad (sirve para gastos grandes, imprevistos, oportunidades), pero puede agotarse si no se administra bien. La renta vitalicia da certidumbre absoluta — paga un monto mensual de por vida sin importar nada — pero es más rígida. La combinación más sólida que veo en familias neurodivergentes es: una renta vitalicia que cubre los gastos fijos mensuales de tu hijo, y un fideicomiso con el capital para los gastos extraordinarios y las oportunidades.',
};

async function query(q) {
  const r = await fetch(
    `https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!r.ok) throw new Error(`Query ${r.status}: ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const r = await fetch(
    `https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutations }),
    }
  );
  if (!r.ok) throw new Error(`Mutate ${r.status}: ${await r.text()}`);
  return await r.json();
}

if (!TOKEN) {
  console.error("❌ Falta SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

// Leer doc actual
console.log("🔍 Leyendo doc actual...");
const doc = await query(
  `*[_id=="${ID}"][0]{_id, title, tldr, body, faqs}`
);
if (!doc) {
  console.error("❌ No encontré el doc.");
  process.exit(1);
}
console.log(`   ✓ Body actual: ${doc.body.length} blocks`);
console.log(`   ✓ TL;DR actual: ${doc.tldr.length} chars`);

// Encontrar puntos de inserción
const getText = (b) =>
  b._type === "block"
    ? (b.children || []).map((c) => c.text || "").join("").trim()
    : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

// Inserción 1: después de toda la sección "¿Para qué sirve el seguro de vida...?"
// Encuentro el H2 de seguro de vida, luego el SIGUIENTE H2, e inserto ANTES del siguiente H2.
let idxSeguroH2 = -1;
let idxNextAfterSeguro = -1;
for (let i = 0; i < doc.body.length; i++) {
  if (idxSeguroH2 === -1 && isH2(doc.body[i]) && /seguro de vida/i.test(getText(doc.body[i]))) {
    idxSeguroH2 = i;
    continue;
  }
  if (idxSeguroH2 !== -1 && idxNextAfterSeguro === -1 && isH2(doc.body[i])) {
    idxNextAfterSeguro = i;
    break;
  }
}

// Inserción 2: ANTES del H2 "Los 5 errores"
let idxLos5Errores = -1;
for (let i = 0; i < doc.body.length; i++) {
  if (isH2(doc.body[i]) && /los 5 errores/i.test(getText(doc.body[i]))) {
    idxLos5Errores = i;
    break;
  }
}

console.log(`   ✓ H2 seguro de vida en index: ${idxSeguroH2}`);
console.log(`   ✓ Siguiente H2 (donde inserto sección 1): ${idxNextAfterSeguro}`);
console.log(`   ✓ H2 Los 5 errores en index: ${idxLos5Errores}`);

if (idxSeguroH2 === -1 || idxNextAfterSeguro === -1 || idxLos5Errores === -1) {
  console.error("❌ No localicé puntos de inserción. Abortando.");
  process.exit(1);
}

// Encontrar y actualizar keyTakeaways (bloque al inicio)
const newKeyTakeaway =
  "Las rentas vitalicias garantizan un ingreso mensual de por vida para tu hijo — algo que el capital heredado no siempre puede asegurar.";

const newBody = [];
let ktUpdated = false;
for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];

  // Update keyTakeaways
  if (block._type === "keyTakeaways" && !ktUpdated) {
    const items = [...(block.items || [])];
    // Insertar el nuevo takeaway en penúltimo lugar (antes del "ninguna estrategia descansa en una sola pieza")
    items.splice(items.length - 1, 0, newKeyTakeaway);
    newBody.push({ ...block, items });
    ktUpdated = true;
    continue;
  }

  // Punto de inserción 2: antes de "Los 5 errores"
  if (i === idxLos5Errores) {
    newBody.push(...SECCION_2);
    newBody.push(block);
    continue;
  }

  // Punto de inserción 1: antes del siguiente H2 después de seguro de vida
  if (i === idxNextAfterSeguro) {
    newBody.push(...SECCION_1);
    newBody.push(block);
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Body: ${doc.body.length} → ${newBody.length} blocks`);
console.log(`   ✓ Sección 1 (fideicomiso-beneficiario): ${SECCION_1.length} bloques añadidos`);
console.log(`   ✓ Sección 2 (rentas vitalicias): ${SECCION_2.length} bloques añadidos`);
console.log(`   ✓ Key takeaway nuevo añadido: ${ktUpdated ? "sí" : "NO"}`);

// TL;DR nuevo
const newTLDR =
  "Cuando hay neurodivergencia y tu hijo va a necesitar apoyo en la vida adulta, dejarle bienes directamente rara vez basta. Lo que sí funciona es combinar testamento, seguro de vida con beneficiario fideicomiso, rentas vitalicias y una red de apoyo con instrucciones claras.";
console.log(`\n📝 TL;DR nuevo: ${newTLDR.length} chars (límite 320) ${newTLDR.length > 320 ? "❌" : "✓"}`);

if (newTLDR.length > 320) {
  console.error("❌ TL;DR excede 320 chars. Abortando.");
  process.exit(1);
}

// FAQ nueva — referencia al doc
const existingFaqs = doc.faqs || [];
const newFaqsRefs = [
  ...existingFaqs,
  { _key: key(), _type: "reference", _ref: NEW_FAQ_ID },
];

const now = new Date().toISOString();

console.log(`\n🆕 FAQ a crear: ${NEW_FAQ_ID}`);
console.log(`   Q: ${NEW_FAQ_DOC.question}`);

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para ejecutar.");
  process.exit(0);
}

// Aplicar
console.log("\n🟢 Aplicando cambios...");

// Primero crear/upsert el FAQ
await mutate([{ createOrReplace: NEW_FAQ_DOC }]);
console.log("   ✓ FAQ creado/actualizado.");

// Luego patch del artículo
await mutate([
  {
    patch: {
      id: ID,
      set: {
        body: newBody,
        tldr: newTLDR,
        faqs: newFaqsRefs,
        updatedAt: now,
        lastReviewed: now.slice(0, 10),
      },
    },
  },
]);
console.log("   ✓ Artículo actualizado (body + tldr + faqs + dateModified).");

// Revalidate
if (REVALIDATE_SECRET) {
  const url = `${SITE_URL}/api/revalidate?path=/blog/${SLUG}&secret=${encodeURIComponent(REVALIDATE_SECRET)}`;
  try {
    const r = await fetch(url, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.revalidated) {
      console.log("   ✓ Revalidate OK.");
    } else {
      console.log(`   ⚠️  Revalidate ${r.status}: ${JSON.stringify(j)}`);
    }
  } catch (e) {
    console.log(`   ⚠️  Revalidate falló: ${e.message}`);
  }
} else {
  console.log("   ℹ️  Sin REVALIDATE_SECRET — ISR refresca en ~30s.");
}

console.log(`\n✅ LIVE: ${SITE_URL}/blog/${SLUG}`);
