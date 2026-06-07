// patch-proteger-v2-checklist.mjs
// Reescritura del artículo A ("¿Qué pasará con mi hijo autista...?") como
// CHECKLIST PRÁCTICO de trámites y documentos que los papás tienen que
// dejar listos. Lo diferencia claramente del B (que es la guía estratégica
// de productos).
//
// Estructura:
//   - Apertura nueva: "La mayoría de los papás se hacen la pregunta equivocada"
//   - Mini-bio en voz de Iria
//   - Bloque 1 — Trámites legales (testamento, régimen de apoyos post-SCJN,
//     tutor, poderes notariales, carta de intención) + mini-checklist visual
//   - Bloque 2 — Seguridad social (IMSS ST-6 con frase clave + paso a paso +
//     ST-4 si queda inválido, ISSSTE)
//   - Bloque 3 — Beneficiarios y productos financieros (seguro de vida con
//     errores comunes, Afore, renta vitalicia con link al B)
//   - Bloque 4 — La carpeta de emergencia familiar + pregunta retórica
//   - CTA principal: "revisión de protección familiar" (45 min, no vendo
//     seguro directo, vendo auditoría)
//   - Puente al B
//   - 5 FAQs reescritas con enfoque "trámites"
//
// Preserva custom blocks existentes: keyTakeaways, checklistDiscapacidad,
// ctaWhatsApp, disclaimer (los reubica si hace falta).
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

// ─── Helpers de Portable Text ────────────────────────────────────────────

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
      // Soporta **bold** dentro de link
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
const h2 = (t) => para(t, { style: "h2" });
const h3 = (t) => para(t, { style: "h3" });
const h4 = (t) => para(t, { style: "h4" });
const quote = (t) => para(t, { style: "blockquote" });
const bullet = (t, level = 1) => para(t, { listItem: "bullet", level });
const numbered = (t, level = 1) => para(t, { listItem: "number", level });

const richAnswer = (paragraphs) => paragraphs.map((p) => para(p));

// ─── Sanity I/O ──────────────────────────────────────────────────────────

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

// ─── Lee body actual para extraer custom blocks que vamos a preservar ────

console.log("🔍 Leyendo body actual del A...");
const doc = await query(`*[_id=="${ART_ID}"][0]{body}`);
console.log(`   ✓ ${doc.body.length} blocks actuales`);

const customs = {};
for (const b of doc.body) {
  if (b._type !== "block") {
    if (!customs[b._type]) customs[b._type] = b;
  }
}
console.log(`   Custom blocks detectados: ${Object.keys(customs).join(", ") || "(ninguno)"}`);

// ─── Construye el body nuevo desde cero ──────────────────────────────────

const newBody = [];

// keyTakeaways (preservar al inicio si existe)
if (customs.keyTakeaways) newBody.push(customs.keyTakeaways);

// ── Apertura nueva ──
newBody.push(para("La mayoría de los papás de un hijo con autismo o discapacidad se hacen **la pregunta equivocada**."));
newBody.push(para("No es: *“¿Cuánto dinero debo dejarle?”*"));
newBody.push(para("La pregunta correcta es: ***“Si mañana yo faltara, ¿mi familia sabría exactamente qué hacer?”***"));
newBody.push(para("He visto familias que heredan millones de pesos — y aun así pasan años tratando de resolver trámites, pensiones y seguros que nunca quedaron documentados. **La verdadera protección empieza mucho antes que el dinero.**"));
newBody.push(para("Este artículo es la lista práctica de **los documentos, trámites y designaciones que tienes que dejar listos hoy** para que el día que tú faltes, tu familia sepa qué hacer."));

// ── Mini-bio en voz de Iria ──
newBody.push(para("**Antes de seguir: soy Iria Talan**, agente de seguros y asesora patrimonial desde 2008. Una parte importante de mi consulta son familias neurodivergentes — papás, mamás y hermanos que vienen cargando justo esta pregunta. Lo que viene es exactamente la lista que reviso con cada familia que acompaño."));

// ── Bloque 0: El miedo (mantenemos H2 original con texto ajustado) ──
newBody.push(h2("El miedo que nadie quiere decir en voz alta"));
newBody.push(para("Muchos papás de hijos con neurodivergencia viven con una preocupación sorda que rara vez comparten en voz alta: *¿quién lo cuidará? ¿quién administrará el dinero? ¿cómo garantizo que sus terapias y medicinas sigan pagándose en automático?*"));
newBody.push(para("Es natural evadir estos pensamientos, pero ignorarlos no disuelve el riesgo. **Planear no es anticipar la muerte — es asegurar la continuidad de la calidad de vida de quien más amas.**"));

// ── BLOQUE 1: Trámites legales ──
newBody.push(h2("🏛️ Bloque 1 — Trámites legales que tienes que dejar listos"));
newBody.push(para("Estos son los documentos que un notario, un abogado o un juez familiar tienen que firmar contigo. Son la base del plan."));

// 1.1 Testamento
newBody.push(h3("1. Testamento vigente con cláusulas específicas"));
newBody.push(para("Un testamento actualizado sigue siendo la base legal para decidir quién hereda y quién cuidará de tu hij@. Si tienes un hijo con discapacidad o neurodivergencia, lo importante es que incluya **cláusulas específicas** sobre tutor, administración de bienes y reglas mínimas de convivencia familiar."));
newBody.push(para("Puntos que muchos notarios no te preguntan si tú no los llevas preparados:"));
newBody.push(bullet("Quién será el **tutor principal** y quién el sustituto."));
newBody.push(bullet("Qué **límites** tendrá esa persona para vender propiedades o usar el dinero."));
newBody.push(bullet("Cómo quieres que se coordine con **hermanos** u otros cuidadores."));

// 1.2 Régimen de apoyos
newBody.push(h3("2. Régimen legal de apoyos para tu hij@"));
newBody.push(para("En México la figura clásica del *“juicio de interdicción”* (la que sustituía totalmente la voluntad de la persona) está siendo desplazada por un **modelo de apoyos** que respeta la capacidad jurídica de las personas con discapacidad. Esto cambió gracias a criterios de la Suprema Corte y a la Convención de la ONU sobre Derechos de las Personas con Discapacidad."));
newBody.push(para("Hoy el enfoque es: tu hij@ sigue siendo titular de sus derechos, pero puede contar con **apoyos** para ejercerlos. Dependiendo de su nivel de autonomía, tienes dos rutas:"));

newBody.push(h4("Ruta A — Vía judicial (si tu hij@ no puede tomar decisiones jurídicas por sí mism@)"));
newBody.push(numbered("**Demanda** ante un Juez de lo Familiar (con abogado privado o del Instituto Federal de Defensoría Pública)."));
newBody.push(numbered("**Evaluaciones médicas** de neurólogos, psiquiatras o psicólogos que determinen qué decisiones requieren asistencia."));
newBody.push(numbered("**Audiencia** donde el juez entrevista directamente a tu hij@ para ver qué apoyos se ajustan mejor a su autonomía."));
newBody.push(numbered("**Sentencia** que designa los apoyos o tutores y define los alcances de la asistencia."));

newBody.push(h4("Ruta B — Vía notarial (si tu hij@ conserva la capacidad de comprender sus actos)"));
newBody.push(para("Pueden acudir juntos a un notario público y constituir un **mandato especial** o un **sistema de apoyos voluntarios**, designando por anticipado quiénes lo acompañarán en decisiones patrimoniales en el futuro. Es más rápido, más barato y más respetuoso con su autonomía."));

newBody.push(para("⚠️ **Esta área legal está en transición y cambia por estado.** Antes de iniciar cualquier trámite, revisa con un abogado o notario qué aplica en tu estado y para tu caso específico."));

// 1.3 Tutor en testamento
newBody.push(h3("3. Designación de tutor en el testamento"));
newBody.push(para("El testamento te permite proponer al **tutor testamentario** de tu hij@. No se trata solo de “la persona más cercana”, sino de quien realmente tenga la estabilidad emocional, financiera y de salud para sostener esta responsabilidad por décadas."));
newBody.push(para("Tres preguntas que conviene contestar antes de elegir:"));
newBody.push(bullet("¿Quién tiene **hoy la mejor relación** con tu hij@?"));
newBody.push(bullet("¿Quién comparte tu **filosofía de cuidado y educación**?"));
newBody.push(bullet("¿Qué adulto podría **coordinarse sin fricciones** con el resto de la familia?"));

// 1.4 Poderes notariales
newBody.push(h3("4. Poderes notariales mientras tú sigues viv@"));
newBody.push(para("Un hueco frecuente: *¿qué pasa si me enfermo gravemente, pero aún no muero?* Ahí es donde los **poderes notariales bien estructurados** se vuelven pieza clave. Sirven para que alguien de confianza pueda tomar decisiones financieras o administrativas por ti cuando tú ya no puedas hacerlo."));
newBody.push(para("Sirven para cosas como:"));
newBody.push(bullet("Cobrar seguros y mover recursos hacia el cuidado de tu hij@."));
newBody.push(bullet("Firmar documentos bancarios o de Afore."));
newBody.push(bullet("Resolver trámites de pensiones o seguridad social a tiempo."));

// 1.5 Carta de intención
newBody.push(h3("5. Carta de intención: el manual de usuario de tu hij@"));
newBody.push(para("No es un documento legal, pero en la práctica vale oro. Escribes con detalle cómo funciona la vida diaria de tu hij@: horarios, rutinas, desencadenantes de crisis, terapias, medicamentos, gustos y miedos. Es la guía que te gustaría que alguien leyera el primer día que tú ya no estás."));
newBody.push(para("Cosas que vale la pena dejar por escrito:"));
newBody.push(bullet("*“Así se calma cuando entra en crisis.”*"));
newBody.push(bullet("*“Nunca le funciona que le hablen así…”*"));
newBody.push(bullet("*“Esta es la lista de doctores y terapeutas que conoce y en quienes confía.”*"));

// Mini-checklist visual del bloque 1
newBody.push(h3("📋 Mini-checklist del Bloque 1"));
newBody.push(para("**¿Lo tienes? ¿Tu familia sabe dónde está?**"));
newBody.push(bullet("☐ Testamento actualizado · ☐ Tu familia sabe con qué notario se firmó"));
newBody.push(bullet("☐ Régimen de apoyos definido (judicial o notarial) · ☐ Tu familia conoce quién será el tutor o apoyo principal"));
newBody.push(bullet("☐ Poderes notariales vigentes · ☐ Tu familia sabe quién tiene los originales"));
newBody.push(bullet("☐ Carta de intención escrita · ☐ Tu familia sabe dónde leerla y cómo actualizarla"));

// ── BLOQUE 2: Seguridad social ──
newBody.push(h2("🏥 Bloque 2 — Seguridad social: el trámite que casi nadie te explica"));
newBody.push(para("Tanto el IMSS como el ISSSTE contemplan esquemas donde un **hijo con incapacidad** puede recibir pensión derivada del trabajador fallecido **sin límite de edad**, siempre que se cumplan ciertos requisitos médicos y administrativos. Es uno de los trámites más importantes y menos conocidos para familias neurodivergentes en México."));

// IMSS
newBody.push(h3("IMSS — El trámite que tienes que hacer en vida: el ST-6"));
newBody.push(quote("Legalmente, tu hij@ no se protege “con la etiqueta de autismo” — se protege con un **dictamen de beneficiario incapacitado (ST-6)** emitido por Salud en el Trabajo del IMSS. Ese papel, combinado con tu pensión o tus semanas cotizadas, es lo que permite solicitar pensión de orfandad **sin límite de edad** el día que tú faltes."));
newBody.push(para("**Tienes que tramitarlo mientras estás viv@.** Si no se tramita ahora, el día que falle el papá o la mamá asegurada la familia tiene que pelearlo a contrarreloj — y muchas veces se pierden meses (o todo el derecho)."));

newBody.push(h4("Paso a paso IMSS para hijos con discapacidad"));
newBody.push(numbered("**Alta como beneficiario “de diario”** — Asegúrate que tu hij@ aparezca en *“Mi grupo familiar”* en tu vigencia de derechos. Si tiene más de 16 años, presenta constancia de estudios o el dictamen de incapacidad."));
newBody.push(numbered("**Inicias en tu UMF con tu médico familiar** — Le expones diagnóstico y dependencia económica."));
newBody.push(numbered("**Te canalizan a Salud en el Trabajo** — Integran el expediente con diagnósticos, reportes y funcionalidad."));
newBody.push(numbered("**Salud en el Trabajo emite el ST-6** — Si procede, tu hij@ queda registrado como hijo incapacitado sin límite de edad."));
newBody.push(numbered("**Guardas el ST-6 en tu carpeta de emergencia** — Con instrucciones claras para que el tutor pueda usarlo después para solicitar la pensión de orfandad."));

newBody.push(h4("Bonus: si tú quedas inválid@ (no fallecid@)"));
newBody.push(para("Existe el **ST-4** (Dictamen de Invalidez del Trabajador), que se tramita con el formato IMSS-03009. Te permite acceder a tu propia pensión de invalidez mientras tu hij@ sigue protegido con su ST-6."));
newBody.push(bullet("**ST-4** → para ti (asegurad@): pensión de invalidez si quedas incapacitad@."));
newBody.push(bullet("**ST-6** → para tu hij@ (beneficiario): pensión de orfandad sin límite de edad cuando tú faltes."));

// ISSSTE
newBody.push(h3("ISSSTE — Procedimiento equivalente"));
newBody.push(para("Si trabajas en gobierno y cotizas al ISSSTE, hay procedimientos equivalentes para registrar a un hijo con incapacidad permanente como beneficiario. El requisito de fondo es el mismo: acreditar incapacidad y dependencia económica con dictámenes médicos."));
newBody.push(para("Lo más recomendable:"));
newBody.push(bullet("Pregunta directamente en tu **área de Recursos Humanos** cómo funciona el registro de beneficiarios con incapacidad."));
newBody.push(bullet("Guarda copia de **todo**: dictámenes, resoluciones y números de expediente."));

// Afore
newBody.push(h3("Afore — beneficiarios bien nombrados"));
newBody.push(para("Muchas familias nunca revisan a quién pusieron como beneficiario en su Afore. En el caso de un hijo con discapacidad o neurodivergencia, esto se tiene que coordinar con el testamento, los apoyos legales y el plan patrimonial completo."));
newBody.push(bullet("**Revisa hoy** quiénes son los beneficiarios registrados en tu Afore."));
newBody.push(bullet("**Ajusta** si aparece un ex cónyuge, personas fallecidas o alguien con quien ya no tienes relación."));
newBody.push(bullet("**Define** si tu hij@ debe aparecer directo o si conviene canalizar los recursos a un fideicomiso o estructura que administre por él."));

// ── BLOQUE 3: Beneficiarios y productos financieros ──
newBody.push(h2("💰 Bloque 3 — Beneficiarios y productos financieros"));

// Seguro de vida
newBody.push(h3("Seguro de vida de los papás"));
newBody.push(para("El seguro de vida es la herramienta que convierte tu plan en **liquidez inmediata** el día que tú faltes. Pero si los beneficiarios están mal configurados, el dinero puede terminar en manos equivocadas o congelado en trámites por meses."));
newBody.push(para("Los errores que veo todo el tiempo en consulta:"));
newBody.push(bullet("**Ex cónyuge** sigue como beneficiario y nadie se ha dado cuenta."));
newBody.push(bullet("**Beneficiario fallecido** que nunca se actualizó."));
newBody.push(bullet("**Beneficiarios menores de edad** sin un tutor o fideicomiso que administre."));
newBody.push(bullet("**Hijo con discapacidad como beneficiario directo**, sin estructura legal que reciba y administre por él."));
newBody.push(para("Tu objetivo no es solo *“escoger un monto”*. Es **alinear el diseño del seguro con tu testamento, tus apoyos legales y el mecanismo de administración** (por ejemplo, un fideicomiso integrado con reglas claras)."));

// Afore y otras cuentas
newBody.push(h3("Afore, planes personales y otras cuentas con beneficiarios"));
newBody.push(para("La Afore, los planes personales para el retiro y las cuentas bancarias son parte del mismo rompecabezas. En México suelen regirse por las **designaciones de beneficiarios**, no por lo que diga tu testamento — así que una lista mal hecha puede tirar por la borda todo tu esfuerzo de planeación."));
newBody.push(para("Revisa específicamente:"));
newBody.push(bullet("Afore y planes personales de retiro."));
newBody.push(bullet("Pólizas de ahorro, dotales o unit-linked."));
newBody.push(bullet("Inversiones y cuentas bancarias con beneficiarios designados."));

// Renta vitalicia
newBody.push(h3("Plan de pensión con renta vitalicia para tu hij@"));
newBody.push(para("Para muchas familias, la pieza que da tranquilidad es asegurar un **flujo mensual de por vida** para el cuidado del hij@ — no solo un monto grande de una sola vez. Ahí entran dos estrategias:"));
newBody.push(bullet("**Seguro de vida con fideicomiso integrado** que paga una renta mensual."));
newBody.push(bullet("**Contratos de renta vitalicia** diseñados específicamente como “pensión privada” para tu hij@."));
newBody.push(para("👉 Profundizo cómo se arman estas piezas — cuánto cuestan, en qué orden contratarlas, con qué aseguradoras — en la guía completa: [¿Cómo dejar dinero a un hijo con autismo o discapacidad sin poner en riesgo su futuro?](/blog/como-dejar-dinero-hijo-autismo-discapacidad-mexico)"));

// ── BLOQUE 4: Carpeta de emergencia ──
newBody.push(h2("📁 Bloque 4 — La carpeta de emergencia familiar"));
newBody.push(para("Si todo lo anterior existe pero **nadie en tu familia sabe dónde está**, en la práctica no existe. Una carpeta de emergencia familiar (física o digital) hace que tu plan sea **encontrable y accionable** el día que haga falta."));
newBody.push(para("¿Qué debe contener, mínimo?"));
newBody.push(bullet("Actas de nacimiento y matrimonio."));
newBody.push(bullet("CURP e INE de cada miembro adulto."));
newBody.push(bullet("Testamento (datos del notario, fecha y ubicación del original)."));
newBody.push(bullet("Pólizas de seguro y números de póliza."));
newBody.push(bullet("Estados de cuenta bancarios y de Afore más recientes."));
newBody.push(bullet("**ST-6 del hij@** (o dictámenes equivalentes ISSSTE)."));
newBody.push(bullet("Datos de contacto de tus asesores: notario, abogado, agente de seguros, terapeuta principal."));
newBody.push(bullet("Historial médico, medicamentos y terapias de tu hij@."));
newBody.push(bullet("Lista de beneficiarios actualizada y cómo cambiarla si es necesario."));
newBody.push(quote("Si tu familia tuviera que encontrar toda esta información mañana, ¿sabría dónde buscar?"));

// checklist lead magnet block
if (customs.checklistDiscapacidad) newBody.push(customs.checklistDiscapacidad);

// ── CTA principal: auditoría / revisión ──
newBody.push(h2("🎯 ¿Hablamos de tu situación? La revisión de protección familiar"));
newBody.push(para("Si después de leer esto te das cuenta que tienes huecos — *no eres la excepción, eres la norma*. La mayoría de las familias que llegan a mi consulta tienen alguno de estos bloques sin resolver."));
newBody.push(para("En mi **revisión de protección familiar** para familias con hij@s neurodivergentes analizamos, en 45 minutos:"));
newBody.push(bullet("Tu **testamento actual** (si existe) y lo que le falta."));
newBody.push(bullet("**Beneficiarios** en seguros, Afore y cuentas bancarias."));
newBody.push(bullet("**Pensiones potenciales** (IMSS / ISSSTE) y si ya estás haciendo los trámites clave (ST-6)."));
newBody.push(bullet("**Régimen de apoyos legales** para tu hij@ — qué existe hoy y qué convendría diseñar."));
newBody.push(bullet("**Productos financieros**: seguros, fideicomisos y planes de renta que realmente se alineen con tu caso."));
newBody.push(para("Salimos con un **mapa concreto de qué arreglar, con orden de prioridad**. Si te conviene contratar algo conmigo, te explico exactamente qué y por qué. Si te conviene un camino distinto, también te lo digo."));
newBody.push(para("**👉 Agenda tu revisión (45 minutos, sin costo).**"));

// CTA WhatsApp
if (customs.ctaWhatsApp) newBody.push(customs.ctaWhatsApp);

// Disclaimer
if (customs.disclaimer) newBody.push(customs.disclaimer);

// ── Puente final al B ──
newBody.push(h2("¿Listo para ver los productos en detalle?"));
newBody.push(para("Este artículo te dio **la lista de qué tienes que dejar listo**. La guía completa te da **cómo se arma el plan financiero**: tablas comparativas, cifras concretas, productos específicos (seguro de vida con fideicomiso integrado, renta vitalicia, GMM) y el orden recomendado de contratación."));
newBody.push(para("👉 [¿Cómo dejar dinero a un hijo con autismo o discapacidad sin poner en riesgo su futuro?](/blog/como-dejar-dinero-hijo-autismo-discapacidad-mexico)"));

// Recursos relacionados
newBody.push(h2("Recursos relacionados"));
newBody.push(bullet("Asesoría para familias con hijos neurodivergentes"));
newBody.push(bullet("Asesoría patrimonial: protege y ordena el futuro de tu familia"));
newBody.push(bullet("Por qué tu testamento no protege tus seguros ni tus cuentas"));

// ─── Reescritura de las 5 FAQs con enfoque "trámites" ─────────────────────

const faqUpdates = {
  "faq-disc-1": {
    // ¿Quién cuidará a mi hijo con autismo cuando yo falte?
    question: "¿Quién cuidará a mi hijo con autismo cuando yo falte?",
    answer: richAnswer([
      "Quien tú dejes designado **por escrito** — y solo si lo dejaste designado por escrito. Si no, la decisión queda en manos de un juez de lo familiar, y los procesos en México pueden tardar meses.",
      "Las herramientas concretas para designar son: **tutor testamentario** (en el testamento), **apoyos vía notario** (mandato voluntario si tu hij@ comprende sus actos) o **apoyos vía juez de lo familiar** (si tu hij@ no puede tomar decisiones jurídicas por sí mism@).",
      "El primer paso no es resolverlo todo, es **abrir la conversación con tu pareja, tus hermanos o los amigos cercanos** que pudieran estar en esa red.",
    ]),
  },
  "faq-disc-2": {
    question: "¿Un testamento es suficiente para proteger a un hijo con discapacidad?",
    answer: richAnswer([
      "El testamento es el cimiento — pero por sí solo casi nunca alcanza.",
      "El testamento define **quién hereda**, pero no resuelve **quién administra el día a día** cuando tu hij@ no puede hacerlo. Para eso hacen falta otras piezas: el **ST-6 del IMSS** para asegurar pensión de orfandad sin límite de edad, los beneficiarios bien designados en cuentas y seguros, los apoyos legales (vía juez o notario) y un seguro de vida con la estructura correcta.",
      "Si solo tienes testamento, tu plan está a medio camino.",
    ]),
  },
  "faq-disc-3": {
    question: "¿Tengo que hacer juicio de interdicción para mi hij@?",
    answer: richAnswer([
      "**No necesariamente.** La figura clásica del juicio de interdicción está siendo reemplazada en México por un modelo de **apoyos** que respeta la capacidad jurídica de tu hij@ — gracias a criterios de la SCJN y a la Convención de la ONU sobre Derechos de las Personas con Discapacidad.",
      "Hoy hay dos rutas: **vía judicial** (proceso ante Juez de lo Familiar para designar apoyos) si tu hij@ no puede tomar decisiones jurídicas por sí mism@; o **vía notarial** (mandato especial o sistema de apoyos voluntarios) si conserva la capacidad de comprender sus actos.",
      "La mejor estrategia normalmente combina las dos. Pero el camino exacto cambia por estado — revísalo con un abogado o notario local antes de iniciar.",
    ]),
  },
  "faq-disc-4": {
    question: "¿Qué es el ST-6 del IMSS y por qué necesito tramitarlo?",
    answer: richAnswer([
      "El **ST-6** es el dictamen de *beneficiario incapacitado* que emite Salud en el Trabajo del IMSS. Es **la llave** que permite que tu hij@ siga siendo tu beneficiario sin límite de edad, y que pueda solicitar **pensión de orfandad** el día que tú faltes.",
      "Tienes que tramitarlo mientras estás viv@. Si no lo haces ahora, el día que falle el papá o mamá asegurada la familia tiene que pelearlo a contrarreloj — y muchas veces se pierden meses o todo el derecho.",
      "El proceso arranca en tu UMF con el médico familiar; te canalizan a Salud en el Trabajo, que integra expediente y emite el dictamen si procede.",
    ]),
  },
  "faq-disc-5": {
    question: "¿Cuándo debo empezar a hacer todos estos trámites?",
    answer: richAnswer([
      "Hoy. Sin solemnidades: literalmente hoy.",
      "No porque haya urgencia médica, sino porque **empezar a los 40 te da más margen fiscal, más opciones de seguros y más tiempo para reunir dictámenes médicos que empezar a los 60** — y empezar a los 60 sigue siendo muchísimo mejor que no empezar.",
      "Lo más caro de la planeación patrimonial no es el costo de las pólizas. Es el costo de los años que se dejaron pasar.",
    ]),
  },
};

// ─── Diagnóstico y aplicación ────────────────────────────────────────────

console.log(`\n📋 Resumen:`);
console.log(`   Body actual: ${doc.body.length} → nuevo: ${newBody.length} bloques`);
console.log(`   Custom blocks preservados: ${Object.keys(customs).filter(k => ["keyTakeaways","checklistDiscapacidad","ctaWhatsApp","disclaimer"].includes(k)).join(", ")}`);
console.log(`   FAQs a reescribir: ${Object.keys(faqUpdates).length}`);

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
