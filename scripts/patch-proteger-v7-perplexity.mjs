// patch-proteger-v7-perplexity.mjs
// Tercera ronda de fine-tune (feedback de Perplexity, ~21 ajustes quirúrgicos).
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
      const inner = seg.value.split(/(\*\*[^*]+\*\*)/);
      for (const p of inner) {
        if (!p) continue;
        const marks = [linkKey];
        if (p.startsWith("**") && p.endsWith("**")) {
          marks.push("strong");
          block.children.push({ _type: "span", _key: key(), text: p.slice(2, -2), marks });
        } else {
          block.children.push({ _type: "span", _key: key(), text: p, marks });
        }
      }
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
const bullet = (t, level = 1) => para(t, { listItem: "bullet", level });
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

console.log("🔍 Leyendo body y FAQs...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body, tldr, excerpt}`);
console.log(`   ✓ ${doc.body.length} blocks`);
const allFaqs = await query(`*[_type=="faq" && _id in ["faq-disc-1","faq-disc-2","faq-disc-3","faq-disc-4","faq-disc-5","faq-disc-6","faq-disc-7","faq-disc-8","faq-disc-9","faq-disc-10"]]{_id, question, answer}`);
console.log(`   ✓ ${allFaqs.length} FAQs`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";

// ─── Verificar duplicación de "No es que el papá no quisiera" ───────────
let nopapaCount = 0;
for (const b of doc.body) {
  if (/no es que el pap[aá] no quisiera/i.test(getText(b))) nopapaCount++;
}
console.log(`\n🔎 Ocurrencias de "No es que el papá no quisiera": ${nopapaCount}`);

// ─── Reconstruir body con todos los patches ─────────────────────────────

let newBody = [];
const did = {};
let removedDupNoPapa = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // [DUP] Si encontramos una 2da ocurrencia de "No es que el papá", la omitimos
  if (nopapaCount > 1 && !removedDupNoPapa && /no es que el pap[aá] no quisiera/i.test(t)) {
    // Es la PRIMERA (la dejamos pasar); marcamos para quitar la próxima
    newBody.push(block);
    nopapaCount--; // ya pasó la 1ra
    continue;
  }
  if (nopapaCount === 1 && !removedDupNoPapa && /no es que el pap[aá] no quisiera/i.test(t)) {
    // Esta es la 2da (duplicada) → la quitamos
    removedDupNoPapa = true;
    did.dupNoPapa = true;
    continue;
  }

  // [#3] "está siendo desplazada" → "está siendo sustituida gradualmente"
  // y [#4] insertar nota sobre códigos civiles después del párrafo SCJN
  if (!did.b3 && block._type === "block"
      && /est[aá] siendo desplazada por un modelo de apoyos/i.test(t)) {
    // Reemplazamos el bloque entero reconstruyéndolo con la nueva frase
    newBody.push(para(
      'En México la figura clásica del *"juicio de interdicción"* (la que sustituía totalmente la voluntad de la persona) **está siendo sustituida gradualmente** por un **modelo de apoyos** que respeta la capacidad jurídica de las personas con discapacidad. Esto cambió gracias a criterios de la Suprema Corte y a la Convención de la ONU sobre Derechos de las Personas con Discapacidad.'
    ));
    newBody.push(para(
      "Dependiendo del estado, todavía puedes encontrar referencias a interdicción en los códigos civiles vigentes — pero los jueces ya están obligados a aplicar el estándar de apoyos y derechos humanos. Por eso el camino exacto cambia por estado y conviene revisarlo con un abogado local antes de iniciar."
    ));
    did.b3 = true;
    did.b4 = true;
    continue;
  }

  // [#5] Después del bullet numerado "Sentencia que designa los apoyos…"
  //      insertar línea sobre "el juez no debería quitarle la voluntad por completo"
  if (!did.b5 && block._type === "block" && block.listItem === "number"
      && /sentencia que designa los apoyos o tutores/i.test(t)) {
    newBody.push(block); // dejamos pasar el bullet
    newBody.push(para(
      "*En la práctica, el juez no debería 'quitarle la voluntad' por completo a tu hijo o hija — sino definir en qué actos jurídicos específicos necesita apoyo y quién lo brindará.*"
    ));
    did.b5 = true;
    continue;
  }

  // [#6] "sistema de apoyos voluntarios" → "mandatos y apoyos voluntarios"
  if (!did.b6 && block._type === "block"
      && /sistema de apoyos voluntarios/i.test(t)) {
    // Reconstruimos el bloque cambiando esa frase
    newBody.push(para(
      "Pueden acudir juntos a un notario público y constituir un **mandato especial** o **mandatos y apoyos voluntarios**, designando por anticipado quiénes lo acompañarán en decisiones patrimoniales en el futuro. Es más rápido, más barato y más respetuoso con su autonomía."
    ));
    did.b6 = true;
    continue;
  }

  // [#7] Mini-checklist: bullet "Régimen de apoyos definido"
  if (!did.b7 && block._type === "block" && block.listItem === "bullet"
      && /r.gimen de apoyos definido.{0,20}\(judicial o notarial\)/i.test(t)) {
    newBody.push(bullet("☐ **Régimen de apoyos definido** (por ejemplo: tutor nombrado en testamento + mandato notarial firmado)", 1));
    did.b7 = true;
    continue;
  }

  // [#9] Paso 4 IMSS: anclaje "Salud en el Trabajo emite el ST-6"
  if (!did.b9 && block._type === "block" && block.listItem === "number"
      && /salud en el trabajo emite el ST.6/i.test(t)) {
    newBody.push(para(
      "**Salud en el Trabajo emite el ST-6** — Si procede, tu hijo o hija queda registrado como **hijo incapacitado sin límite de edad para efectos del IMSS**. Este dictamen es la llave que permite solicitar pensión de orfandad el día que tú faltes.",
      { listItem: "number", level: 1 }
    ));
    did.b9 = true;
    continue;
  }

  // [#10] Seguro vida papás: cerrar con link a guía B
  //       anclaje: el párrafo "alinear el diseño del seguro con tu testamento..."
  if (!did.b10 && block._type === "block"
      && /alinear el dise.o del seguro con tu testamento.{0,200}fideicomiso integrado con reglas claras/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "En la [guía complementaria](/blog/como-dejar-dinero-hijo-autismo-discapacidad-mexico) te muestro ejemplos de configuraciones correctas de beneficiarios según el tipo de familia."
    ));
    did.b10 = true;
    continue;
  }

  // [#11] Seguro vida hijo: agregar "No es obligatorio..." al inicio de la sección
  //       anclaje: el H3 "Seguro de vida o ahorro programado para tu hijo o hija"
  if (!did.b11 && block._type === "block" && block.style === "h3"
      && /seguro de vida o ahorro programado para tu hijo o hija/i.test(t)) {
    newBody.push(block); // el H3
    newBody.push(para(
      "**No es obligatorio** tener un plan a nombre de tu hijo o hija, pero en muchos casos es una forma accesible de **construir un colchón de largo plazo** que estará disponible en su vida adulta."
    ));
    did.b11 = true;
    continue;
  }

  // [#12] GMM: agregar "El detalle fino..." después del párrafo de GMM con exclusión
  //       anclaje: párrafo que contiene "Para hijos con condiciones preexistentes hay aseguradoras"
  if (!did.b12 && block._type === "block"
      && /para hijos con condiciones preexistentes hay aseguradoras/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "*El detalle fino de qué sí y qué no cubre depende mucho de la aseguradora. Por eso es clave revisar las **condiciones particulares de cada póliza**, no solo el folleto comercial.*"
    ));
    did.b12 = true;
    continue;
  }

  // [#13] Bloque 4 carpeta: agregar "No tiene que salir perfecta..."
  //       anclaje: el último bullet de la carpeta (lista de beneficiarios)
  if (!did.b13 && block._type === "block" && block.listItem === "bullet"
      && /lista de beneficiarios actualizada y c.mo cambiarla/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "No tiene que salir perfecta a la primera. **Si hoy pudieras dejar solo cinco documentos listos en una sola carpeta, ya sería un cambio enorme.**"
    ));
    did.b13 = true;
    continue;
  }

  // [#14] Bloque 4 frase punzante: agregar micro-CTA después de "menos de una hora"
  if (!did.b14 && block._type === "block" && block.style === "blockquote"
      && /menos de una hora/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "*Si la respuesta es 'no', ése es tu primer proyecto de las próximas 4 semanas.*"
    ));
    did.b14 = true;
    continue;
  }

  // [#15] Tabla prioridad punto 7
  if (!did.b15 && block._type === "block" && block.listItem === "bullet"
      && /r.gimen legal de apoyos.{0,30}v.a notario o v.a juez/i.test(t)) {
    newBody.push(bullet("**7. Régimen legal de apoyos** (vía notario o vía juez) y designación de tutor. *Si tu hijo o hija ya es mayor de edad, este punto sube varios lugares en la lista.*"));
    did.b15 = true;
    continue;
  }

  // [#8] Tabla prioridad: "ST-6 del IMSS (o equivalente ISSSTE)"
  if (!did.b8 && block._type === "block" && block.listItem === "bullet"
      && /ST-6 del IMSS.{0,30}o equivalente ISSSTE/i.test(t)) {
    newBody.push(bullet("**2. ST-6 del IMSS** (o dictamen equivalente si cotizas al ISSSTE) — la llave para pensión sin límite de edad."));
    did.b8 = true;
    continue;
  }

  // [#16] Tabla prioridad cierre: agregar "No tienes que hacerlos en orden perfecto"
  //       anclaje: párrafo "Los primeros 5 puntos pueden quedar resueltos en 3-4 meses"
  if (!did.b16 && block._type === "block"
      && /los primeros 5 puntos pueden quedar resueltos en.{0,5}3-4 meses/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "*No tienes que hacerlos en orden perfecto — pero sí en una misma ventana de tiempo. Empezar 3 cosas a la vez es mejor que terminar 1 en años.*"
    ));
    did.b16 = true;
    continue;
  }

  // [#17] CTA Revisión: agregar "No es una sesión para venderte un producto específico"
  //       anclaje: párrafo "Salimos con un mapa concreto de qué arreglar"
  if (!did.b17 && block._type === "block"
      && /salimos con un.{0,15}mapa concreto de qu. arreglar/i.test(t)) {
    newBody.push(block);
    newBody.push(para(
      "**No es una sesión para venderte un producto específico** — es para que tengas un mapa claro con números, prioridades y un orden de ejecución para los próximos meses."
    ));
    did.b17 = true;
    continue;
  }

  // [#18] CTA WhatsApp cotización: agregar "horario hábil"
  //       anclaje: párrafo "¿Ya sabes que quieres cotizar un seguro de vida..."
  if (!did.b18 && block._type === "block"
      && /ya sabes que quieres cotizar un seguro de vida.{0,30}gmm|ya sabes que quieres cotizar un seguro de vida.{0,30}plan de retiro/i.test(t)) {
    newBody.push(para(
      "**¿Ya sabes que quieres cotizar un seguro de vida, un GMM o un plan de retiro?** Mándame WhatsApp directo con tu edad y un estimado del monto que tienes en mente — te regreso opciones concretas **el mismo día en horario hábil**, sin necesidad de agendar nada formal."
    ));
    did.b18 = true;
    continue;
  }

  // [#A] "estructura patrimonial sólida" en el body (si existe)
  if (!did.bA && block._type === "block"
      && /estructura patrimonial s.lida/i.test(t)) {
    // Reconstruir reemplazando esa frase. Como no sabemos contexto exacto, hacemos replace puntual.
    const newText = t.replace(/y, fundamentalmente, una estructura.*?neurodivergente.*?\./i,
      "y, fundamentalmente, **papeles en regla y dinero que llegue a tiempo** — sea por autismo, TDAH severo, síndrome de Down o cualquier reto del espectro neurodivergente.");
    newBody.push(para(newText));
    did.bA = true;
    continue;
  }

  newBody.push(block);
}

// ─── FAQ updates ─────────────────────────────────────────────────────────

const faqUpdates = [];

// [#19] FAQ-disc-3 interdicción: agregar nota sobre segunda opinión
const faq3 = allFaqs.find((f) => f._id === "faq-disc-3");
if (faq3) {
  faqUpdates.push({
    id: "faq-disc-3",
    question: faq3.question,
    answer: richAnswer([
      "**No necesariamente.** La figura clásica del juicio de interdicción está siendo reemplazada en México por un modelo de **apoyos** que respeta la capacidad jurídica de tu hijo o hija — gracias a criterios de la SCJN y a la Convención de la ONU sobre Derechos de las Personas con Discapacidad.",
      "Hoy hay dos rutas: **vía judicial** (proceso ante Juez de lo Familiar para designar apoyos) si tu hijo o hija no puede tomar decisiones jurídicas por sí mismo; o **vía notarial** (mandato especial o mandatos y apoyos voluntarios) si conserva la capacidad de comprender sus actos.",
      "La mejor estrategia normalmente combina las dos. Pero el camino exacto cambia por estado — revísalo con un abogado o notario local antes de iniciar.",
      "⚠️ **Si un profesional te recomienda 'solo' hacer interdicción sin hablarte del modelo de apoyos**, busca una segunda opinión con alguien que tenga enfoque de discapacidad y derechos humanos. La figura clásica ya no es el único camino — y en muchos casos no es el mejor.",
    ]),
  });
  did.b19 = true;
}

// [#20] FAQ-disc-4 ST-6: agregar cierre
const faq4 = allFaqs.find((f) => f._id === "faq-disc-4");
if (faq4) {
  faqUpdates.push({
    id: "faq-disc-4",
    question: faq4.question,
    answer: richAnswer([
      "El **ST-6** es el dictamen de *beneficiario incapacitado* que emite Salud en el Trabajo del IMSS. Es **la llave** que permite que tu hijo o hija siga siendo tu beneficiario sin límite de edad, y que pueda solicitar **pensión de orfandad** el día que tú faltes.",
      "Tienes que tramitarlo mientras estás vivo(a). Si no lo haces ahora, el día que falle el papá o mamá asegurada la familia tiene que pelearlo a contrarreloj — y muchas veces se pierden meses o todo el derecho.",
      "El proceso arranca en tu UMF con el médico familiar; te canalizan a Salud en el Trabajo, que integra expediente y emite el dictamen si procede.",
      "**En muchas familias, este es el trámite que nadie les explicó a tiempo.** Por eso es uno de los primeros pendientes que reviso con las familias que llegan a consulta.",
    ]),
  });
  did.b20 = true;
}

// [#21] FAQ-disc-6 18 años: bold "uno de los momentos críticos"
const faq6 = allFaqs.find((f) => f._id === "faq-disc-6");
if (faq6) {
  faqUpdates.push({
    id: "faq-disc-6",
    question: faq6.question,
    answer: richAnswer([
      "Al cumplir 18, **legalmente tu hijo o hija se vuelve mayor de edad** y, en principio, asume la titularidad de sus derechos: puede firmar contratos, abrir cuentas, votar y tomar decisiones financieras por sí mismo.",
      "Pero si por su condición no puede ejercer esos derechos sin apoyo, hay que **formalizar legalmente esa red de apoyo**. Antes se hacía vía juicio de interdicción; hoy el modelo es de **apoyos para la toma de decisiones** (vía notario o vía juez de lo familiar, según el caso).",
      "**Es uno de los momentos más críticos** de toda la planeación: si llega a los 18 sin tener resuelto el régimen de apoyos, el ST-6 del IMSS y la actualización del testamento, queda en un limbo legal donde un banco o una aseguradora pueden negarse a operar con él. **Conviene tener el plan listo antes de su mayoría de edad**, no después.",
    ]),
  });
  did.b21 = true;
}

console.log(`\n📋 Cambios v7:`);
const items = [
  ["[#A] estructura patrimonial sólida →", did.bA],
  ["[#DUP] duplicación 'No es que el papá' eliminada", did.dupNoPapa],
  ["[#3] desplazada → sustituida gradualmente", did.b3],
  ["[#4] nota sobre códigos civiles", did.b4],
  ["[#5] línea sobre no quitar voluntad por completo", did.b5],
  ["[#6] mandatos y apoyos voluntarios", did.b6],
  ["[#7] mini-checklist régimen apoyos con ejemplo", did.b7],
  ["[#8] tabla prioridad: dictamen equivalente ISSSTE", did.b8],
  ["[#9] paso 4 IMSS reforzado", did.b9],
  ["[#10] seguro papás → link a guía B", did.b10],
  ["[#11] seguro hijo: no es obligatorio", did.b11],
  ["[#12] GMM: condiciones particulares", did.b12],
  ["[#13] carpeta: no tiene que salir perfecta", did.b13],
  ["[#14] micro-CTA 'primer proyecto 4 semanas'", did.b14],
  ["[#15] punto 7: si ya mayor de edad sube", did.b15],
  ["[#16] cierre: 'no en orden perfecto, misma ventana'", did.b16],
  ["[#17] CTA: 'no para venderte producto'", did.b17],
  ["[#18] CTA WhatsApp: horario hábil", did.b18],
  ["[#19] FAQ-3 interdicción + segunda opinión", did.b19],
  ["[#20] FAQ-4 ST-6 cierre", did.b20],
  ["[#21] FAQ-6 momentos críticos bold", did.b21],
];
for (const [name, v] of items) {
  console.log(`   ${v ? "✓" : "·"} ${name}`);
}
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);

// Permitimos que algunos cambios "opcionales" no peguen (#A, #DUP), pero los principales sí
const required = ["b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10", "b11", "b12", "b13", "b14", "b15", "b16", "b17", "b18", "b19", "b20", "b21"];
const missing = required.filter((k) => !did[k]);
if (missing.length) {
  console.error(`\n❌ Faltan anclajes: ${missing.join(", ")}`);
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
