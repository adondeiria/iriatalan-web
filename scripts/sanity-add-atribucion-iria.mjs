// One-shot (nov-2026): agrega una frase de atribución con el nombre de Iria en 3 artículos y 1 término de glosario.
// Mismo patrón que scripts/sanity-fix-author-fields.mjs. Lee SANITY_API_WRITE_TOKEN de .env.local.
//
// Artículos: inserta UN bloque normal (sin marks) justo después del primer párrafo del body
//            (primer bloque _type "block", style "normal", que no sea lista ni encabezado).
// Glosario:  agrega UN bloque normal al final de `longExplanation` (Portable Text). NO toca
//            `shortDefinition`: tiene tope de 320 caracteres (validación del schema) y se reutiliza
//            como meta description, DefinedTerm en JSON-LD, índice /glosario y fichas de términos relacionados.
//
// Uso:
//   node scripts/sanity-add-atribucion-iria.mjs            → DRY-RUN (no muta)
//   node scripts/sanity-add-atribucion-iria.mjs --apply    → aplica en los PUBLICADOS (ifRevisionID)
//   node scripts/sanity-add-atribucion-iria.mjs --verify   → GROQ (api, no CDN) + revalidate + revisa el sitio real

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const SITE_URL = env.SITE_URL || "https://iriatalan.com.mx";
const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
const APPLY = process.argv.includes("--apply");
const VERIFY = process.argv.includes("--verify");

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}
if (PROJECT_ID !== "0xa0dciq" || DATASET !== "production") {
  console.error(`Proyecto/dataset inesperado: ${PROJECT_ID}/${DATASET}`);
  process.exit(1);
}

const apiBase = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`; // api, NO apicdn
const auth = { Authorization: `Bearer ${TOKEN}` };

const TARGETS = [
  {
    id: "article-seguro-gastos-medicos-maternidad",
    type: "article",
    field: "body",
    path: "/blog/seguro-gastos-medicos-maternidad",
    text: "Iria Talan, asesora patrimonial con cédula de la CNSF V388618 y MDRT Top of the Table, compara en esta guía los beneficios de maternidad de GNP, AXA, MetLife, BUPA y Seguros Monterrey New York Life.",
  },
  {
    id: "article-incremento-costos-universitarios-mexico",
    type: "article",
    field: "body",
    path: "/blog/incremento-costos-universitarios-mexico",
    text: "Iria Talan, asesora patrimonial con cédula de la CNSF V388618 y MDRT Top of the Table, analiza en esta guía cuánto cuestan las universidades privadas de México en 2026 y cuánto conviene ahorrar para pagarlas.",
  },
  {
    id: "article-st6-imss-pension-orfandad-sin-limite-edad",
    type: "article",
    field: "body",
    path: "/blog/st6-imss-pension-orfandad-sin-limite-edad",
    text: "Iria Talan, asesora patrimonial con cédula de la CNSF V388618 que acompaña a familias con hijos con discapacidad, explica en esta guía cómo tramitar el ST-6 del IMSS para asegurar la pensión de orfandad sin límite de edad.",
  },
  {
    id: "glossary-renta-vitalicia",
    type: "glossaryTerm",
    field: "longExplanation",
    path: "/glosario/renta-vitalicia",
    text: "Definición revisada por Iria Talan, asesora patrimonial con cédula de la CNSF V388618 y MDRT Top of the Table, que asesora en planeación de retiro.",
  },
];

const key = () => crypto.randomBytes(6).toString("hex");
const blockText = (b) => (b?._type === "block" ? (b.children ?? []).map((c) => c.text ?? "").join("") : "");
const short = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

async function getDocs(ids) {
  const r = await fetch(`${apiBase}/doc/${DATASET}/${ids.join(",")}`, { headers: auth });
  if (!r.ok) throw new Error(`Doc fetch failed: ${r.status} ${await r.text()}`);
  return Object.fromEntries((await r.json()).documents.map((d) => [d._id, d]));
}

async function query(groq, params = {}) {
  const qs = new URLSearchParams({ query: groq, perspective: "published" });
  for (const [k, v] of Object.entries(params)) qs.set(`$${k}`, JSON.stringify(v));
  const r = await fetch(`${apiBase}/query/${DATASET}?${qs}`, { headers: auth });
  if (!r.ok) throw new Error(`Query failed: ${r.status} ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const r = await fetch(`${apiBase}/mutate/${DATASET}?returnIds=true`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

// Cuenta apariciones exactas de la frase en todo el documento (cualquier campo de texto).
function countPhrase(doc, phrase) {
  return JSON.stringify(doc).split(phrase).length - 1;
}

const newBlock = (text) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: key(), _type: "span", marks: [], text }],
});

// ───────────────────────── VERIFY ─────────────────────────
if (VERIFY) {
  let allOk = true;
  for (const t of TARGETS) {
    const res = await query(
      `*[_id == $id][0]{
        "bloques": count(${t.field}[_type == "block" && pt::text(@) == $text]),
        "textoTotal": pt::text(${t.field}),
        "posicion": ${t.field}[_type == "block" && pt::text(@) == $text][0]._key,
        _rev
      }`,
      { id: t.id, text: t.text }
    );
    const ocurrencias = (res?.textoTotal ?? "").split(t.text).length - 1;
    const docOk = res?.bloques === 1 && ocurrencias === 1;

    let revalidate = "sin REVALIDATE_SECRET";
    if (REVALIDATE_SECRET) {
      const r = await fetch(
        `${SITE_URL}/api/revalidate?path=${encodeURIComponent(t.path)}&secret=${encodeURIComponent(REVALIDATE_SECRET)}`,
        { method: "POST" }
      );
      const j = await r.json().catch(() => ({}));
      revalidate = `${r.status} revalidated=${j.revalidated}`;
    }

    // El sitio: espera unos segundos a que regenere y busca la frase en el HTML (texto visible).
    let enSitio = 0;
    for (let i = 0; i < 6 && enSitio === 0; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 3000 : 5000));
      const html = await (await fetch(`${SITE_URL}${t.path}`, { cache: "no-store" })).text();
      const visible = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, "");
      enSitio = visible.split(t.text).length - 1;
    }
    const ok = docOk && enSitio === 1;
    allOk &&= ok;
    console.log(
      `${ok ? "✅" : "❌"} ${t.id}\n   Sanity: bloques con la frase=${res?.bloques}, apariciones en ${t.field}=${ocurrencias}, _key=${res?.posicion}\n   Revalidate ${t.path}: ${revalidate}\n   Sitio real: la frase aparece ${enSitio} vez/veces en el texto visible`
    );
  }
  process.exit(allOk ? 0 : 1);
}

// ───────────────────────── DRY-RUN / APPLY ─────────────────────────
const ids = TARGETS.flatMap((t) => [t.id, `drafts.${t.id}`]);
const docs = await getDocs(ids);
const mutations = [];
let problems = 0;

for (const t of TARGETS) {
  const doc = docs[t.id];
  const draft = docs[`drafts.${t.id}`];
  console.log(`\n━━━ ${t.id}  (${t.path})`);
  if (!doc) {
    console.log("  ❌ No existe el publicado.");
    problems++;
    continue;
  }
  console.log(`  _rev ${doc._rev} · _updatedAt ${doc._updatedAt} · draft=${doc.draft}`);
  if (draft) {
    console.log(`  ⚠️  HAY BORRADOR SIN PUBLICAR (${draft._id}, ${draft._updatedAt}). No sigo con este documento.`);
    problems++;
    continue;
  }
  const yaEsta = countPhrase(doc, t.text);
  if (yaEsta > 0) {
    console.log(`  ⏭️  La frase ya aparece ${yaEsta} vez/veces. No se inserta de nuevo.`);
    continue;
  }

  const arr = doc[t.field] ?? [];
  const block = newBlock(t.text);

  if (t.type === "article") {
    const idx = arr.findIndex((b) => b._type === "block" && b.style === "normal" && !b.listItem);
    if (idx < 0) {
      console.log("  ❌ No encontré un párrafo normal en el body.");
      problems++;
      continue;
    }
    const before = arr.slice(0, idx);
    console.log(`  Antes del primer párrafo (se quedan igual): ${before.map((b) => (b._type === "block" ? `${b.style}:"${short(blockText(b), 40)}"` : b._type)).join(" · ") || "(nada)"}`);
    console.log(`    [${idx}]   ${arr[idx]._key}  ¶ "${short(blockText(arr[idx]))}"`);
    console.log(`  + [${idx + 1}]   ${block._key}  ¶ "${t.text}"   ← NUEVO (style normal, sin marks)`);
    if (arr[idx + 1]) console.log(`    [${idx + 2}]   ${arr[idx + 1]._key}  ${arr[idx + 1]._type === "block" ? `${arr[idx + 1].style} "${short(blockText(arr[idx + 1]))}"` : arr[idx + 1]._type}`);
    console.log(`  body: ${arr.length} → ${arr.length + 1} bloques`);
    mutations.push({
      patch: { id: t.id, ifRevisionID: doc._rev, insert: { after: `body[_key=="${arr[idx]._key}"]`, items: [block] } },
    });
  } else {
    console.log(`  shortDefinition (NO se toca, ${doc.shortDefinition?.length ?? 0} car.): "${doc.shortDefinition}"`);
    console.log(`  longExplanation hoy: ${arr.length ? `${arr.length} bloques` : "(vacío / no existe)"}`);
    if (arr.length) console.log(`    último: "${short(blockText(arr.at(-1)))}"`);
    console.log(`  + ${block._key}  ¶ "${t.text}"   ← NUEVO al final de longExplanation`);
    mutations.push(
      arr.length
        ? { patch: { id: t.id, ifRevisionID: doc._rev, insert: { after: "longExplanation[-1]", items: [block] } } }
        : { patch: { id: t.id, ifRevisionID: doc._rev, set: { longExplanation: [block] } } }
    );
  }
}

console.log(`\n${mutations.length} documento(s) a modificar · ${problems} con problema.`);
if (!APPLY) {
  console.log("DRY-RUN. Nada se modificó. Re-run con --apply para aplicar en los publicados.");
  process.exit(0);
}
if (problems) {
  console.error("❌ Hay documentos con problema; no aplico nada. Revisa arriba.");
  process.exit(1);
}
// Una sola transacción: o entran los 4 o ninguno.
const result = await mutate(mutations);
console.log("\n✅ Aplicado:", JSON.stringify(result, null, 2));
