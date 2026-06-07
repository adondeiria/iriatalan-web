// patch-proteger-v1-diferenciacion.mjs
// Diferenciar el artículo "¿Qué pasará...?" del "¿Cómo dejar dinero...?"
// Reposicionar A como awareness/top-of-funnel, eliminar duplicación con B,
// enriquecer las FAQs escuetas y agregar funnel claro hacia B.
//
//   #1  → Mini-bio corta + nota de positioning ("este es el punto de entrada")
//          después del intro y antes del H2 "El miedo que nadie quiere decir..."
//   #2  → Quitar sección "Los 5 errores más comunes" (duplicada con B)
//          y reemplazarla por "¿Qué sigue después de aceptar el miedo?" (3 pasos cortos)
//   #3  → CTA explícito al artículo B antes de "Recursos relacionados"
//   #4  → Enriquecer las 5 FAQs (faq-disc-1 a faq-disc-5) — pasarlas de 1 línea
//          a 2-4 líneas, enfoque emocional/conceptual (no técnico, eso es del B)
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
  // Soporta **bold** y [texto](url) como link marks
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
    const parts = seg.value.split(/(\*\*[^*]+\*\*)/);
    for (const p of parts) {
      if (!p) continue;
      if (p.startsWith("**") && p.endsWith("**")) {
        block.children.push({ _type: "span", _key: key(), text: p.slice(2, -2), marks: ["strong"] });
      } else {
        block.children.push({ _type: "span", _key: key(), text: p, marks: [] });
      }
    }
  }
  if (opts.listItem) { block.listItem = opts.listItem; block.level = opts.level || 1; }
  return block;
};
const h2 = (t) => para(t, { style: "h2" });
const bullet = (t) => para(t, { listItem: "bullet", level: 1 });

// Una respuesta de FAQ enriquecida: array de bloques Portable Text
const richAnswer = (paragraphs) => paragraphs.map((p) => para(p));

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

console.log("🔍 Leyendo body del A...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

const newBody = [];
let did1 = false, did2 = false, did3 = false;
let skipUntilCustom = false; // para saltarse bloques de "5 errores"

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // #2 — Quitar sección "5 errores" y reemplazarla
  // Detección: H2 con "Los 5 errores más comunes" — salta hasta el siguiente bloque
  // custom (checklistDiscapacidad), que es donde termina la sección.
  if (!did2 && isH2(block) && /los 5 errores m[aá]s comunes/i.test(t)) {
    newBody.push(h2("¿Qué sigue después de aceptar el miedo?"));
    newBody.push(para(
      "Si llegaste hasta aquí, ya hiciste lo más difícil: nombrar el miedo en voz alta. El siguiente paso no es tener todo resuelto — es dar **tres pasos chiquitos** que abren el camino:"
    ));
    newBody.push(para("**1. Hablarlo con tu pareja o con tu red más cercana.** No necesitas tener las respuestas todavía. Solo necesitas que la conversación ya no viva solo en tu cabeza."));
    newBody.push(para("**2. Hacer una lista honesta de quiénes son tu red de apoyo.** ¿Quién, además de ti, conoce a tu hijo lo suficiente para acompañarlo? ¿Quién querrías que estuviera ahí cuando tú ya no estés? Esa lista es la materia prima de tu plan."));
    newBody.push(para("**3. Leer la guía completa de planeación patrimonial para familias neurodivergentes.** Ahí vas a encontrar el “cómo” — qué piezas existen en México (testamento, seguro de vida con fideicomiso, renta vitalicia), cuánto cuestan, en qué orden contratarlas y qué errores evitar."));
    skipUntilCustom = true;
    did2 = true;
    continue;
  }
  // Mientras skipUntilCustom: saltar bloques hasta el primer bloque que NO sea de párrafo numerado/normal,
  // o hasta encontrar un custom block ([checklistDiscapacidad]).
  if (skipUntilCustom) {
    if (block._type !== "block") {
      // llegamos a un custom block — terminamos de saltar y dejamos pasar el bloque actual
      skipUntilCustom = false;
      newBody.push(block);
      continue;
    }
    // saltar este bloque (era parte de la lista vieja de 5 errores)
    continue;
  }

  // #1 — Mini-bio + nota de positioning antes del H2 "El miedo que nadie quiere decir..."
  if (!did1 && isH2(block) && /el miedo que nadie quiere decir/i.test(t)) {
    newBody.push(para(
      "**Antes de seguir: soy Iria Talan**, agente de seguros y asesora patrimonial desde 2008. Una parte importante de mi consulta son familias neurodivergentes — papás, mamás y hermanos que vienen cargando justo esta pregunta. Te escribo desde ahí, no desde la teoría."
    ));
    newBody.push(para(
      "**Este artículo es la puerta de entrada al tema.** Está pensado para nombrar el miedo y mostrarte que sí hay un camino. Si después de leerlo quieres ver exactamente cómo se arma en la práctica (con números, productos y orden de contratación), al final te dejo el link a la guía completa."
    ));
    newBody.push(block);
    did1 = true;
    continue;
  }

  // #3 — CTA al B antes del H2 "Recursos relacionados"
  if (!did3 && isH2(block) && /recursos relacionados/i.test(t)) {
    newBody.push(h2("¿Listo para ver cómo se hace?"));
    newBody.push(para(
      "Este artículo te dio el porqué. La guía completa te da el cómo: tablas comparativas, cifras concretas de lo que cuesta sostener cuidados durante 30 años, los productos específicos que armo con las familias (seguro de vida con fideicomiso integrado, renta vitalicia, gastos médicos mayores) y el orden en que conviene contratarlos."
    ));
    newBody.push(para(
      "👉 **[¿Cómo dejar dinero a un hijo con autismo o discapacidad sin poner en riesgo su futuro?](/blog/como-dejar-dinero-hijo-autismo-discapacidad-mexico)**"
    ));
    newBody.push(block);
    did3 = true;
    continue;
  }

  newBody.push(block);
}

// #4 — Enriquecer las 5 FAQs
const faqUpdates = {
  "faq-disc-1": {
    // ¿Quién cuidará a mi hijo con autismo cuando yo falte?
    answer: richAnswer([
      "No hay una sola respuesta — depende de la red de apoyo que vayas construyendo en vida y de la estructura legal que dejes lista antes de faltar.",
      "Lo que sí está claro es que **la pregunta no se responde sola**: si no nombras tutores en tu testamento, si no platicas con quienes podrían acompañar a tu hijo, y si no dejas instrucciones escritas, la decisión queda en manos de un juez — y los procesos judiciales en México pueden tardar meses o años.",
      "El primer paso no es resolverlo todo. Es **abrir la conversación con tu pareja, tus hermanos o los amigos cercanos** que pudieran estar en esa red. De ahí parte el resto del plan.",
    ]),
  },
  "faq-disc-2": {
    // ¿Un testamento es suficiente para proteger a un hijo con discapacidad?
    answer: richAnswer([
      "El testamento es el cimiento — pero por sí solo casi nunca alcanza cuando tu hijo va a necesitar apoyo de largo plazo en la vida adulta.",
      "El testamento define **quién hereda**, pero no resuelve **quién administra el día a día** cuando tu hijo no puede hacerlo solo. Para eso hacen falta otras piezas: beneficiarios bien designados en cuentas y seguros, un seguro de vida con la estructura correcta, y a veces un fideicomiso que ejecute reglas escritas por ti.",
      "Si solo tienes testamento, tu plan está a medio camino.",
    ]),
  },
  "faq-disc-3": {
    // ¿Necesito un fideicomiso para mi hijo?
    answer: richAnswer([
      "No siempre. Para muchas familias con patrimonio normal, **la combinación de testamento + seguro de vida con beneficiario calificado o fideicomiso integrado** ya resuelve el problema sin necesidad de constituir un fideicomiso bancario aparte.",
      "El fideicomiso bancario externo tiene sentido cuando el patrimonio es grande, hay activos complejos (negocios, varios inmuebles) o cuando se quiere blindar el dinero de pleitos familiares con reglas muy específicas.",
      "Esta es exactamente la conversación que tenemos en la sesión inicial: ver tu caso concreto y decidir qué herramienta encaja — sin venderte la más cara “por si las dudas”.",
    ]),
  },
  "faq-disc-4": {
    // ¿Puedo dejar un seguro de vida para proteger a mi hijo?
    answer: richAnswer([
      "Sí — y en muchas familias es **la pieza más importante** del plan.",
      "El seguro de vida hace algo que ningún otro instrumento puede hacer: pone dinero líquido en la cuenta correcta en cuestión de semanas, libre de impuestos, justo cuando la familia más lo necesita. Mientras la casa, las inversiones o el negocio se acomodan, las terapias, los cuidadores y los gastos del día a día no se detienen.",
      "El detalle clave es **cómo dejas designado al beneficiario**. Si ponemos al hijo directo, podemos meterlo en un proceso judicial. Si ponemos a un fideicomiso o usamos la figura de beneficiario calificado, el dinero llega y se administra según tus reglas.",
    ]),
  },
  "faq-disc-5": {
    // ¿Cuándo debo empezar a planear?
    answer: richAnswer([
      "Hoy. Sin solemnidades: literalmente hoy.",
      "No porque haya urgencia médica, sino porque **empezar a los 40 te da más margen fiscal y más opciones de seguros que empezar a los 60** — y empezar a los 60 sigue siendo muchísimo mejor que no empezar.",
      "Lo más caro de la planeación patrimonial no es el costo de las pólizas. Es el costo de los años que se dejaron pasar.",
    ]),
  },
};

console.log(`\n📋 Cambios:`);
console.log(`   #1  Mini-bio + positioning:        ${did1 ? "sí" : "NO"}`);
console.log(`   #2  Quitar 5 errores, meter ¿Qué sigue?: ${did2 ? "sí" : "NO"}`);
console.log(`   #3  CTA al B antes de Recursos:    ${did3 ? "sí" : "NO"}`);
console.log(`   #4  Enriquecer ${Object.keys(faqUpdates).length} FAQs: sí`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

if (!did1 || !did2 || !did3) {
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
  ...Object.entries(faqUpdates).map(([id, fields]) => ({
    patch: { id, set: fields },
  })),
];
await mutate(mutations);
console.log(`   ✓ Listo. Patched: 1 article + ${Object.keys(faqUpdates).length} FAQs.`);
