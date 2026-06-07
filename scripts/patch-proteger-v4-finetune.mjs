// patch-proteger-v4-finetune.mjs
// Mejoras quirúrgicas (feedback de ChatGPT) sobre el artículo A v3:
//
//   #1 Cálculo económico real ($40K/mes desglose CDMX/MTY/GDL,
//      proyección 10/20/30 años) después de "IMSS no basta"
//   #2 Historia real (juicio sucesorio sin testamento) después del
//      H2 "El miedo que nadie quiere decir en voz alta"
//   #3 Tabla de prioridades (8 acciones) al final del Bloque 4
//   #4 Frase punzante: reemplazar blockquote actual del Bloque 4
//      por "Si mañana tuvieras un accidente, ¿tu familia podría
//      encontrar todo esto en menos de una hora?"
//   #5 Bullets visuales con ✅ en el CTA principal
//   #6 5 FAQs nuevas (faq-disc-6..10) con createIfNotExists +
//      agregar referencias al array `faqs` del artículo
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
const h4 = (t) => para(t, { style: "h4" });
const quote = (t) => para(t, { style: "blockquote" });
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

console.log("🔍 Leyendo body actual del A (v3 aplicado)...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body, faqs}`);
console.log(`   ✓ ${doc.body.length} blocks, ${doc.faqs?.length || 0} faqs`);

const getText = (b) => b._type === "block" ? (b.children || []).map((c) => c.text || "").join("") : "";
const isH2 = (b) => b._type === "block" && b.style === "h2";

const newBody = [];
let did1 = false, did2 = false, did3 = false, did4 = false, did5a = false, did5b = false;
let inCtaReview = false;
let skipCtaBullets = false;

for (let i = 0; i < doc.body.length; i++) {
  const block = doc.body[i];
  const t = getText(block);

  // #2 — Historia real DESPUÉS del párrafo "Planear no es anticipar la muerte"
  if (!did2 && block._type === "block"
      && /planear no es anticipar la muerte.{0,80}continuidad de la calidad de vida/i.test(t)) {
    newBody.push(block);
    newBody.push(h3("Una historia que veo más seguido de lo que quisiera"));
    newBody.push(para("Llega a mi consulta una mamá. El papá acaba de fallecer. Tenían patrimonio — una casa, ahorros, quizás un seguro de vida. Pero **no había testamento**."));
    newBody.push(para("El día que él falta, todo lo demás se detiene. La casa entra a **juicio sucesorio** — un proceso que en México puede tardar uno, dos o tres años, según el estado y según si hay pleito entre herederos. Mientras tanto: la cuenta del banco está bloqueada. La casa no se puede vender ni rentar. Hasta el seguro de vida puede quedar atorado si el beneficiario no quedó bien designado."));
    newBody.push(para("Y mientras eso se acomoda, **las terapias del hijo siguen costando**. El seguro de gastos médicos vence. La renta del depa donde vive el hijo sigue venciendo. Los cuidadores no se pausan."));
    newBody.push(para("¿Quién paga todo eso esos meses? La mamá, con sus propios ahorros. Los hermanos, si tienen. La abuela, si vive. Préstamos familiares. Y muchas veces, vendiendo cosas a las prisas."));
    newBody.push(para("Todo eso **se pudo haber evitado con dos hojas firmadas ante un notario** años antes."));
    newBody.push(para("No es que el papá no quisiera a su familia. Es que nadie le explicó qué pasaba si no dejaba esas dos hojas listas."));
    did2 = true;
    continue;
  }

  // #1 — Cálculo económico DESPUÉS del párrafo "cubre el delta..." (post-IMSS no basta)
  if (!did1 && block._type === "block"
      && /cubre el delta entre lo que paga la seguridad social/i.test(t)) {
    newBody.push(block);
    newBody.push(h3("¿Cuánto dinero podría necesitar tu hij@ durante su vida adulta?"));
    newBody.push(para("Cada familia es distinta — pero hagamos un ejercicio para que veas el tamaño del problema. En una zona metropolitana (CDMX, Monterrey, Guadalajara), los gastos típicos de un adulto neurodivergente con necesidades de apoyo significativas se ven más o menos así:"));
    newBody.push(bullet("**Terapias intensivas** (ABA, fonoaudiología, ocupacional): $15,000 – $20,000 / mes"));
    newBody.push(bullet("**Medicamentos** (psiquiátricos, suplementos, especializados): $3,000 – $5,000 / mes"));
    newBody.push(bullet("**Transporte especializado o chofer-acompañante**: $4,000 – $6,000 / mes"));
    newBody.push(bullet("**Cuidador parcial** (4–6 horas/día): $13,000 – $18,000 / mes"));
    newBody.push(bullet("**Vivienda adaptada, alimentación y vida social**: variable"));
    newBody.push(para("**Total típico: alrededor de $40,000 al mes** — y eso sin contar imprevistos médicos ni cirugías."));
    newBody.push(para("Si proyectamos ese gasto en el tiempo (sin considerar inflación, que en cuidados médicos es alta):"));
    newBody.push(bullet("**$480,000 al año**"));
    newBody.push(bullet("**$4.8 millones en 10 años**"));
    newBody.push(bullet("**$9.6 millones en 20 años**"));
    newBody.push(bullet("**$14.4 millones en 30 años**"));
    newBody.push(para("Si le sumas inflación médica del 4-6% anual acumulado, el número real puede acercarse a los **$20-25 millones** a lo largo de 30 años."));
    newBody.push(quote("Por eso la pregunta no es *“¿cuánto cuesta un seguro?”* La pregunta es ***“¿cómo garantizo que ese dinero exista cuando yo ya no esté?”***"));
    newBody.push(para("⚠️ *Ejemplo basado en gastos típicos de zona metropolitana — cada familia es distinta y los números reales pueden ser mucho menores o mucho mayores según ciudad, condición y nivel de vida. No es cotización ni recomendación individualizada.*"));
    did1 = true;
    continue;
  }

  // #3 + #4 — Reemplazar la blockquote del Bloque 4 ("Si tu familia tuviera que encontrar...")
  //          por la frase punzante de ChatGPT + tabla de prioridades.
  if (!did4 && block._type === "block" && block.style === "blockquote"
      && /si tu familia tuviera que encontrar toda esta informaci/i.test(t)) {
    // #4: Frase punzante (reemplaza)
    newBody.push(quote("Si mañana tuvieras un accidente, ¿tu familia podría **encontrar todo esto en menos de una hora**?"));
    did4 = true;

    // #3: Tabla de prioridades (se mete justo después)
    newBody.push(h3("📋 Orden de prioridad: por dónde empezar"));
    newBody.push(para("Si vas a empezar hoy mismo, este es el orden que sugiero — de lo más urgente y barato a lo más estructural:"));
    newBody.push(bullet("**1. Testamento** — la base legal. Si no tienes nada más, ten esto."));
    newBody.push(bullet("**2. ST-6 del IMSS** (o equivalente ISSSTE) — la llave para pensión sin límite de edad."));
    newBody.push(bullet("**3. Revisión de beneficiarios** en Afore, seguros y cuentas bancarias."));
    newBody.push(bullet("**4. Seguro de vida** dimensionado a los costos reales de cuidado a 30 años."));
    newBody.push(bullet("**5. Carta de intención** — el manual de usuario de tu hij@."));
    newBody.push(bullet("**6. Carpeta de emergencia familiar** — que todo lo anterior sea encontrable."));
    newBody.push(bullet("**7. Régimen legal de apoyos** (vía notario o vía juez) y designación de tutor."));
    newBody.push(bullet("**8. Renta vitalicia o ahorro programado** para asegurar flujo mensual de largo plazo."));
    newBody.push(para("Los primeros 5 puntos pueden quedar resueltos en **3-4 meses** si te pones a trabajar. Los últimos 3 son los que requieren más diseño — y son los que normalmente revisamos juntos en la sesión inicial."));
    did3 = true;
    continue;
  }

  // #5 — Bullets visuales con ✅ en el CTA principal.
  // Anclaje: el párrafo "En mi **revisión de protección familiar** para familias con hij@s neurodivergentes analizamos..."
  if (!did5a && block._type === "block"
      && /en mi.{0,5}revisi.n de protecci.n familiar.{0,80}analizamos/i.test(t)) {
    newBody.push(para(
      "En mi **revisión de protección familiar** para familias con hij@s neurodivergentes, en 45 minutos hacemos un *check completo* de tu situación. Esto es lo que revisamos juntos:"
    ));
    newBody.push(bullet("✅ **Testamento** vigente (o el que conviene hacer)"));
    newBody.push(bullet("✅ **ST-6 del IMSS** y/o trámite equivalente del ISSSTE"));
    newBody.push(bullet("✅ **Beneficiarios** en seguros, Afore y cuentas bancarias"));
    newBody.push(bullet("✅ **Seguros de vida** y diseño con fideicomiso integrado"));
    newBody.push(bullet("✅ **Gastos médicos mayores** para tu hij@ y para ti"));
    newBody.push(bullet("✅ **Planes de ahorro o dotales** para tu hij@"));
    newBody.push(bullet("✅ **Fideicomisos** (bancarios externos o integrados al seguro)"));
    newBody.push(bullet("✅ **Renta vitalicia** para flujo mensual de largo plazo"));
    newBody.push(bullet("✅ **Costos futuros** de cuidado y el cálculo a 20-30 años"));
    newBody.push(bullet("✅ **Red de apoyo familiar** y carta de intención"));
    newBody.push(para("Salimos con un **mapa concreto de qué arreglar, con orden de prioridad**. Si te conviene contratar algo conmigo, te explico exactamente qué y por qué. Si te conviene un camino distinto, también te lo digo."));
    did5a = true;
    skipCtaBullets = true; // saltamos los bullets viejos del CTA
    continue;
  }

  // Saltar los bullets viejos del CTA (los que tenían "Tu testamento actual...", etc.)
  if (skipCtaBullets) {
    if (block._type === "block" && block.listItem === "bullet") continue; // skip
    if (block._type === "block" && /salimos con un.{0,10}mapa concreto/i.test(t)) continue; // skip viejo párrafo
    skipCtaBullets = false;
    // dejamos pasar el bloque actual (el "Agenda tu revisión...")
  }

  newBody.push(block);
}

// #6 — Crear 5 nuevas FAQs y agregar referencias al artículo
const newFaqs = {
  "faq-disc-6": {
    _id: "faq-disc-6",
    _type: "faq",
    question: "¿Qué pasa con mi hijo autista cuando cumpla 18 años?",
    answer: richAnswer([
      "Al cumplir 18, **legalmente tu hij@ se vuelve mayor de edad** y, en principio, asume la titularidad de sus derechos: puede firmar contratos, abrir cuentas, votar y tomar decisiones financieras por sí mism@.",
      "Pero si por su condición no puede ejercer esos derechos sin apoyo, hay que **formalizar legalmente esa red de apoyo**. Antes se hacía vía juicio de interdicción; hoy el modelo es de **apoyos para la toma de decisiones** (vía notario o vía juez de lo familiar, según el caso).",
      "Es uno de los momentos críticos: si llega a los 18 sin tener resuelto el régimen de apoyos, el ST-6 del IMSS y la actualización del testamento, queda en un limbo legal donde un banco o una aseguradora pueden negarse a operar con él.",
    ]),
  },
  "faq-disc-7": {
    _id: "faq-disc-7",
    _type: "faq",
    question: "¿Puede una persona con autismo recibir pensión del IMSS?",
    answer: richAnswer([
      "Sí, en dos escenarios:",
      "**(1) Como beneficiario del padre o madre asegurado:** si tu hij@ tiene un **dictamen de beneficiario incapacitado (formato ST-6)** emitido por Salud en el Trabajo del IMSS, puede ser beneficiario de pensión de orfandad **sin límite de edad** cuando el asegurado fallezca.",
      "**(2) Como asegurado por cuenta propia:** si trabajó y cotizó al IMSS, podría acceder a pensión de invalidez bajo la Ley del Seguro Social, mediante el formato ST-4 y dictamen de Salud en el Trabajo.",
      "La pieza clave en ambos casos es **el dictamen médico institucional**. Sin ese papel, la \"etiqueta\" diagnóstica no basta legalmente.",
    ]),
  },
  "faq-disc-8": {
    _id: "faq-disc-8",
    _type: "faq",
    question: "¿Cómo nombrar tutor para un hijo con discapacidad?",
    answer: richAnswer([
      "Hay dos vías principales en México:",
      "**(1) Tutor testamentario:** lo nombras en tu testamento. Es la forma más sencilla y la que recomiendo a casi todas las familias. Designas tutor principal y un sustituto en caso de que el primero no pueda o no quiera.",
      "**(2) Tutor designado por juez:** vía proceso judicial ante el Juez de lo Familiar, dentro del régimen de apoyos. Esto aplica cuando tu hij@ es mayor de edad y necesita apoyos formales para tomar decisiones jurídicas — el juez evalúa al hij@, a la familia y designa al tutor o apoyos más adecuados.",
      "En ambos casos, **lo importante no es solo nombrar a alguien**, sino dejar claro qué límites tiene esa persona, cómo se coordinará con otros familiares, y qué pasa si esa persona ya no puede ejercer la tutela.",
    ]),
  },
  "faq-disc-9": {
    _id: "faq-disc-9",
    _type: "faq",
    question: "¿Quién administra el dinero de una persona con discapacidad?",
    answer: richAnswer([
      "Depende de cómo dejes diseñada la estructura. Las opciones más comunes:",
      "**(1) Un tutor o apoyo legal** (familiar o profesional), designado por testamento o por juez. Administra siguiendo los lineamientos legales y, en su caso, las reglas que tú dejaste.",
      "**(2) Un fideicomiso** — bancario externo o integrado al seguro de vida. Es **el banco** quien administra siguiendo las reglas escritas por ti: cuánto se libera al mes, a qué se destina, quién supervisa.",
      "**(3) Combinación de ambos:** un familiar para decisiones personales (médicas, de vida) + un fideicomiso para administrar el dinero. Es la fórmula que recomiendo en la mayoría de los casos porque distribuye la carga y reduce conflictos familiares.",
    ]),
  },
  "faq-disc-10": {
    _id: "faq-disc-10",
    _type: "faq",
    question: "¿Qué pasa si los padres fallecen y no hay testamento?",
    answer: richAnswer([
      "**Lo peor que puede pasar.** La herencia entra a **juicio sucesorio intestamentario**, un proceso que en México puede tardar de uno a tres años, según el estado y según si hay desacuerdos entre herederos.",
      "Mientras dura el juicio: las cuentas bancarias quedan bloqueadas, las propiedades no se pueden vender ni rentar, y los seguros con beneficiario mal designado también pueden atorarse. Durante esos meses **no hay liquidez** para pagar terapias, cuidadores o gastos médicos del hij@ con discapacidad.",
      "Si además el hij@ es mayor de edad y necesita apoyos formales para tomar decisiones, se le abre un proceso paralelo ante un juez para designar quién administra por él — sumando más tiempo y más costos.",
      "Todo esto se evita con **dos hojas firmadas ante notario** años antes. La diferencia entre tener testamento y no tenerlo es, literalmente, años de la vida de tu familia.",
    ]),
  },
};

// Agregar las nuevas referencias al array `faqs` del artículo
const existingFaqRefs = doc.faqs || [];
const newFaqRefs = Object.keys(newFaqs).map((id) => ({
  _key: `ref-${id}`,
  _ref: id,
  _type: "reference",
}));
const allFaqRefs = [...existingFaqRefs, ...newFaqRefs];

console.log(`\n📋 Cambios v4 (fine-tune ChatGPT):`);
console.log(`   #1 Cálculo económico $40K → $14.4M:      ${did1 ? "sí" : "NO"}`);
console.log(`   #2 Historia juicio sucesorio:             ${did2 ? "sí" : "NO"}`);
console.log(`   #3 Tabla de prioridades:                  ${did3 ? "sí" : "NO"}`);
console.log(`   #4 Frase punzante reemplazada:            ${did4 ? "sí" : "NO"}`);
console.log(`   #5 Bullets ✅ en CTA:                     ${did5a ? "sí" : "NO"}`);
console.log(`   #6 5 FAQs nuevas (faq-disc-6..10):       sí`);
console.log(`   Body: ${doc.body.length} → ${newBody.length}`);
console.log(`   FAQs: ${existingFaqRefs.length} → ${allFaqRefs.length}`);

if (!did1 || !did2 || !did3 || !did4 || !did5a) {
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
  // Crear los 5 nuevos FAQs (createIfNotExists)
  ...Object.values(newFaqs).map((doc) => ({ createIfNotExists: doc })),
  // Patch al artículo: body actualizado + array de FAQs ampliado
  {
    patch: {
      id: ART_ID,
      set: {
        body: newBody,
        faqs: allFaqRefs,
        updatedAt: now,
        lastReviewed: now.slice(0, 10),
      },
    },
  },
];
await mutate(mutations);
console.log(`   ✓ Listo. Patched: 1 article + ${Object.keys(newFaqs).length} FAQs nuevas.`);
