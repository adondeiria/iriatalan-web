// patch-autismo-v9-comercial.mjs
// Refuerzo comercial: que quede claro que Iria es agente de seguros (vida con fideicomiso integrado,
// retiro / renta vitalicia, gastos médicos mayores) y que el artículo es la antesala a contratarla.
//
//   #1  → Mini-bio comercial cerca del inicio (después de "Un apunte sobre lenguaje"),
//          antes de "¿Cómo proteger económicamente...?"
//   #2  → Cierre comercial al final de "¿Para qué sirve el seguro de vida...?"
//   #3  → Reescribir el último párrafo de la sección rentas vitalicias
//          (de "se contratan con la aseguradora" → "es lo que armo contigo")
//   #4  → Nueva sección H2 "## Lo que armo contigo" antes de "¿Hablamos de tu situación?"
//   #5  → Reforzar CTA final con segundo CTA de cotización directa por WhatsApp
//          + actualizar "Sobre la asesora" con productos concretos
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
const h2 = (t) => para(t, { style: "h2" });
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
const doc = await query(`*[_id=="${ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

const newBody = [];
let did1 = false, did2 = false, did3 = false, did4 = false, did5a = false, did5b = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // #1 — Mini-bio comercial: insertar ANTES del H2 "¿Cómo proteger económicamente...?"
  if (!did1 && isH2(block) && /c[oó]mo proteger econ[oó]micamente a un hijo/i.test(t)) {
    newBody.push(h2("Antes de empezar: ¿quién te está escribiendo?"));
    newBody.push(para(
      "Soy **Iria Talan**, agente de seguros y asesora patrimonial desde 2008 — 18 años acompañando a familias mexicanas. Una parte importante de mi consulta son **familias neurodivergentes**: papás de hijos con autismo, síndrome de Down, discapacidad intelectual o condiciones similares que pueden requerir apoyo de largo plazo."
    ));
    newBody.push(para(
      "Lo que armo con estas familias son, principalmente, tres piezas:"
    ));
    newBody.push(bullet("**Seguros de vida con beneficiario calificado o fideicomiso integrado** — para que el dinero llegue rápido, libre de impuestos, y se administre con reglas escritas por ti."));
    newBody.push(bullet("**Planes de retiro con renta vitalicia** — para que tu hijo tenga un ingreso mensual asegurado durante décadas, incluso de por vida según el instrumento."));
    newBody.push(bullet("**Gastos médicos mayores** — la red de respaldo para terapias, cirugías y hospitalizaciones que la salud pública no siempre cubre con la rapidez que requiere una emergencia."));
    newBody.push(para(
      "Te lo digo desde el inicio para que leas el resto del artículo con esa transparencia: **vivo de diseñar y vender estas pólizas**. Lo que viene abajo es exactamente lo que armo contigo si decides agendar una sesión."
    ));
    newBody.push(block);
    did1 = true;
    continue;
  }

  // #2 — Cierre comercial en "¿Para qué sirve el seguro de vida...?"
  // Anclaje: el párrafo "...convierte un plan que está en papel en una protección real desde el día uno."
  if (!did2 && block._type === "block" && /convierte un plan que está en papel en una protección real desde el día uno/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "Este es uno de los productos que vendo todos los días. **Cotizar tu seguro de vida toma una sola sesión** — me cuentas tu edad, tu patrimonio y para quién es; te regreso opciones concretas de aseguradoras serias (GNP, MetLife, Seguros Monterrey) con sus números puestos lado a lado para que decidas con calma."
    ));
    did2 = true;
    continue;
  }

  // #3 — Reescribir cierre de rentas vitalicias
  // Anclaje: "Las rentas vitalicias se contratan directamente con la aseguradora, no en un banco..."
  if (!did3 && block._type === "block" && /las rentas vitalicias se contratan directamente con la aseguradora/i.test(t)) {
    newBody.push(para(
      "Las rentas vitalicias y los planes de retiro se contratan **con la aseguradora a través de un agente** — no en un banco, no en línea. Es uno de los productos que más diseño con familias neurodivergentes, precisamente porque resuelve el miedo a que el capital se agote antes que el hijo."
    ));
    did3 = true;
    continue;
  }

  // #4 — Nueva sección "## Lo que armo contigo" justo antes de "¿Hablamos de tu situación?"
  if (!did4 && isH2(block) && /hablamos de tu situaci[oó]n/i.test(t)) {
    newBody.push(h2("Lo que armo contigo"));
    newBody.push(para(
      "Para que sepas exactamente qué esperar si me contactas — estos son los productos que diseño con familias como la tuya:"
    ));
    newBody.push(bullet("**Seguro de vida con beneficiario calificado o fideicomiso integrado.** La pieza central: dinero libre de impuestos, en cuestión de semanas, con reglas de administración que tú escribes."));
    newBody.push(bullet("**Plan de retiro con renta vitalicia para tu hijo.** Para asegurar un ingreso mensual de largo plazo que no dependa de cómo le vaya a la bolsa ni de quién esté disponible cuando tú faltes."));
    newBody.push(bullet("**Plan de retiro para los papás.** Porque cuidar a tu hijo empieza por no convertirte tú en una carga económica para él o para tus otros hijos."));
    newBody.push(bullet("**Gastos médicos mayores.** Para cubrir terapias intensivas, hospitalizaciones o cirugías que requiere la condición de tu hijo — sin tener que vaciar el ahorro familiar."));
    newBody.push(bullet("**Coordinación con notario y banco si necesitas un fideicomiso bancario externo.** Solo si tu patrimonio lo justifica; muchas veces no hace falta."));
    newBody.push(para(
      "Soy agente independiente, lo que significa que coloco contigo la aseguradora que mejor te convenga (GNP, MetLife, Seguros Monterrey, AXA y otras) — no la que más comisión me deje a mí."
    ));
    newBody.push(block);
    did4 = true;
    continue;
  }

  // #5a — Segundo CTA específico de cotización, justo antes del bloque CTA WhatsApp
  if (!did5a && block._type === "ctaWhatsApp") {
    newBody.push(para(
      "**¿Ya sabes que quieres cotizar un seguro de vida o un plan de retiro?** Mándame WhatsApp directamente con tu edad y un estimado del monto que tienes en mente — te regreso opciones concretas el mismo día, sin agendar nada formal."
    ));
    newBody.push(block);
    did5a = true;
    continue;
  }

  // #5b — Reescribir "Sobre la asesora" para mencionar productos concretos
  // Anclaje: el párrafo que empieza "Soy agente de seguros y asesora patrimonial desde 2008"
  if (!did5b && block._type === "block" && /soy agente de seguros y asesora patrimonial desde 2008/i.test(t)) {
    newBody.push(para(
      "Soy **agente de seguros y asesora patrimonial desde 2008** — son ya 18 años acompañando a familias mexicanas en planeación financiera de largo plazo. Trabajo de forma especial con **familias neurodivergentes**: familias cuyos hijos son autistas, viven con síndrome de Down, con discapacidad intelectual u otras condiciones que pueden requerir apoyo durante décadas."
    ));
    newBody.push(para(
      "Los productos que diseño contigo son **seguros de vida con beneficiario calificado o fideicomiso integrado**, **planes de retiro con renta vitalicia** (para los papás o para el hijo), y **gastos médicos mayores**. Soy agente independiente — coloco la aseguradora que más te conviene a ti, no la que más comisión me deje a mí."
    ));
    did5b = true;
    continue;
  }

  newBody.push(block);
}

console.log(`\n📋 Cambios:`);
console.log(`   #1  Mini-bio comercial arriba:       ${did1 ? "sí" : "NO"}`);
console.log(`   #2  Cierre comercial seguro de vida: ${did2 ? "sí" : "NO"}`);
console.log(`   #3  Reescribir cierre rentas vital.: ${did3 ? "sí" : "NO"}`);
console.log(`   #4  Nueva sección 'Lo que armo':     ${did4 ? "sí" : "NO"}`);
console.log(`   #5a CTA cotización directa WhatsApp: ${did5a ? "sí" : "NO"}`);
console.log(`   #5b Reescribir 'Sobre la asesora':   ${did5b ? "sí" : "NO"}`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did1 || !did2 || !did3 || !did4 || !did5a || !did5b) {
  console.error("\n❌ Algún cambio no se aplicó. Abortando.");
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
    id: ID,
    set: {
      body: newBody,
      updatedAt: now,
      lastReviewed: now.slice(0, 10),
    },
  },
}]);
console.log("   ✓ Listo.");
