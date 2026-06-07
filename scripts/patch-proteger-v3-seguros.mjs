// patch-proteger-v3-seguros.mjs
// Refuerzo COMERCIAL al artículo A (post-v2 checklist):
// dar auge a los seguros que vende Iria sin romper el tono "checklist práctico".
//
//   #1  → Reescribir mini-bio (agregar productos concretos que vende)
//   #2  → Insertar sección "La pensión IMSS no basta — es solo el piso"
//          al final del Bloque 2, antes del Bloque 3
//   #3  → Cambiar H2 del Bloque 3 a "Los seguros que tu hij@ necesita
//          (y los beneficiarios bien puestos)"
//   #4  → Insertar 2 nuevos H3 después de "Seguro de vida de los papás":
//          - Seguro de vida o ahorro programado para tu hij@
//          - Gastos médicos mayores para él y para ti
//   #5  → Expandir el bullet "Pólizas de seguro" de la carpeta de emergencia
//          con detalles específicos
//   #6  → Agregar segundo CTA (cotización directa por WhatsApp) antes del
//          bloque ctaWhatsApp
//
// Patches quirúrgicos sobre el body v2 actual.
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
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  const segments = [];
  let m;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > cursor) segments.push({ kind: "text", value: text.slice(cursor, m.index) });
    segments.push({ kind: "link", value: m[1], href: m[2] });
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) segments.push({ kind: "text", value: text.slice(cursor) });
  for (const seg of segments) {
    if (seg.kind === "link") {
      const linkKey = key();
      block.markDefs.push({ _key: linkKey, _type: "link", href: seg.href });
      block.children.push({ _type: "span", _key: key(), text: seg.value, marks: [linkKey] });
      continue;
    }
    const parts = seg.value.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
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
  }
  if (opts.listItem) { block.listItem = opts.listItem; block.level = opts.level || 1; }
  return block;
};
const h2 = (t) => para(t, { style: "h2" });
const h3 = (t) => para(t, { style: "h3" });
const bullet = (t, level = 1) => para(t, { listItem: "bullet", level });

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

console.log("🔍 Leyendo body actual del A (v2 aplicado)...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";
const isH3 = (b) => b._type === "block" && b.style === "h3";

const newBody = [];
let did1 = false, did2 = false, did3 = false, did4 = false, did5 = false, did6 = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // #1 — Reescribir mini-bio (anclaje: "Antes de seguir: soy Iria Talan")
  if (!did1 && block._type === "block" && /antes de seguir.{0,5}soy.{0,5}iria talan/i.test(t)) {
    newBody.push(para(
      "**Antes de seguir: soy Iria Talan**, agente de seguros y asesora patrimonial desde 2008. Una parte importante de mi consulta son familias neurodivergentes — papás, mamás y hermanos que vienen cargando justo esta pregunta. Con ellas diseño **seguros de vida con fideicomiso integrado, planes de retiro con renta vitalicia y gastos médicos mayores**, que son la pieza que hace que la lista de papeles y trámites de abajo se convierta en una protección real para tu hij@ — no solo en buenas intenciones."
    ));
    did1 = true;
    continue;
  }

  // #2 — Insertar "La pensión IMSS no basta" al final del Bloque 2,
  //      antes del H2 del Bloque 3
  if (!did2 && isH2(block) && /bloque 3.{0,5}beneficiarios y productos financieros/i.test(t)) {
    newBody.push(h3("⚠️ La pensión del IMSS no basta — es solo el piso"));
    newBody.push(para(
      "La pensión de orfandad del IMSS para un hijo incapacitado se calcula sobre el **salario base de cotización** (con tope), y representa un porcentaje fijo de ese monto. Para la mayoría de las familias que necesitan cubrir terapias, cuidadores, medicinas y vivienda especializada, **esa pensión apenas alcanza para una fracción del costo real**."
    ));
    newBody.push(para(
      "Por eso, en la práctica, **los seguros son la pieza que hace que todo lo demás funcione**: aportan la liquidez inmediata, libre de impuestos, que cubre el *delta* entre lo que paga la seguridad social y lo que tu hij@ realmente necesita para vivir bien."
    ));
    // Continuamos con el bloque actual (el H2 del Bloque 3)
    did2 = true;
    // Caemos al siguiente if para cambiar el H2
  }

  // #3 — Cambiar H2 del Bloque 3
  if (!did3 && isH2(block) && /bloque 3.{0,5}beneficiarios y productos financieros/i.test(t)) {
    newBody.push(h2("💰 Bloque 3 — Los seguros que tu hij@ necesita (y los beneficiarios bien puestos)"));
    did3 = true;
    continue;
  }

  // #4 — Insertar 2 nuevos H3 (vida hijo + GMM) después del último párrafo
  //      del H3 "Seguro de vida de los papás" — anclaje: el párrafo que
  //      termina con "(por ejemplo, un fideicomiso integrado con reglas claras)."
  if (!did4 && block._type === "block" && /alinear el dise.o del seguro con tu testamento.{0,300}fideicomiso integrado con reglas claras/i.test(t)) {
    newBody.push(block); // dejamos pasar el párrafo de cierre del seguro de los papás

    // Nueva sección: seguro de vida o ahorro programado para el hij@
    newBody.push(h3("Seguro de vida o ahorro programado para tu hij@"));
    newBody.push(para(
      "No todas las familias lo contemplan, pero **una póliza dotal o un plan de ahorro programado a nombre de tu hij@** puede acumular un capital que esté disponible en su vida adulta — para vivienda, para una emergencia, o como respaldo si llegara a necesitar cuidados intensivos."
    ));
    newBody.push(para(
      "El diseño correcto considera plazo, costo y a quién se asigna ese capital cuando tu hij@ no pueda administrarlo solo. Es una pieza relativamente accesible que muchas familias podrían contratar y nunca se les ha planteado."
    ));

    // Nueva sección: GMM
    newBody.push(h3("Gastos médicos mayores: para tu hij@ y para ti"));
    newBody.push(para(
      "Las familias neurodivergentes suelen enfrentar **gastos médicos no planeados** que la salud pública no siempre cubre con la velocidad que requiere una crisis: cirugías, hospitalizaciones, internamientos psiquiátricos, terapias intensivas, neurofeedback, equipamiento adaptado."
    ));
    newBody.push(para(
      "Una póliza de **gastos médicos mayores** dimensionada — para tu hij@ y también para ti, porque si tú te enfermas el sistema entero se cae — es la red que evita que el ahorro familiar se vacíe en una sola emergencia. Para hijos con condiciones preexistentes hay aseguradoras que aceptan con exclusión de la condición específica, y aún así la póliza vale la pena por todo lo demás que sí cubre."
    ));

    did4 = true;
    continue;
  }

  // #5 — Expandir el bullet "Pólizas de seguro" de la carpeta de emergencia
  //      anclaje: bullet que contiene "Pólizas de seguro y números de póliza"
  if (!did5 && block._type === "block" && block.listItem === "bullet"
      && /p.lizas de seguro y n.meros de p.liza/i.test(t)) {
    // Reemplazo este bullet por uno más rico + bullets sub-nivel
    newBody.push(bullet("**Pólizas de seguro** (vida, GMM, ahorro, renta vitalicia) — con esta info por cada póliza:"));
    newBody.push(bullet("Aseguradora y número de póliza", 2));
    newBody.push(bullet("Tipo de cobertura y suma asegurada", 2));
    newBody.push(bullet("Beneficiarios designados y porcentajes", 2));
    newBody.push(bullet("Datos de tu agente (nombre, WhatsApp, correo)", 2));
    newBody.push(bullet("Dónde está el original (carpeta física o cuenta digital)", 2));
    did5 = true;
    continue;
  }

  // #6 — Segundo CTA (cotización directa por WhatsApp) justo antes del bloque ctaWhatsApp
  if (!did6 && block._type === "ctaWhatsApp") {
    newBody.push(para(
      "**¿Ya sabes que quieres cotizar un seguro de vida, un GMM o un plan de retiro?** Mándame WhatsApp directo con tu edad y un estimado del monto que tienes en mente — te regreso opciones concretas el mismo día, sin necesidad de agendar nada formal."
    ));
    newBody.push(block);
    did6 = true;
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Cambios v3 (refuerzo de seguros):`);
console.log(`   #1 Mini-bio con productos:                ${did1 ? "sí" : "NO"}`);
console.log(`   #2 'IMSS no basta' antes del Bloque 3:    ${did2 ? "sí" : "NO"}`);
console.log(`   #3 H2 Bloque 3 reescrito:                 ${did3 ? "sí" : "NO"}`);
console.log(`   #4 H3 vida hij@ + GMM:                    ${did4 ? "sí" : "NO"}`);
console.log(`   #5 Bullet pólizas expandido:              ${did5 ? "sí" : "NO"}`);
console.log(`   #6 CTA cotización directa:                ${did6 ? "sí" : "NO"}`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did1 || !did2 || !did3 || !did4 || !did5 || !did6) {
  console.error("\n❌ Algún anclaje no pegó. Abortando.");
  process.exit(1);
}

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Usa --apply para guardar.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");
await mutate([{
  patch: {
    id: ART_ID,
    set: {
      body: newBody,
      updatedAt: now,
      lastReviewed: now.slice(0, 10),
    },
  },
}]);
console.log("   ✓ Listo.");
