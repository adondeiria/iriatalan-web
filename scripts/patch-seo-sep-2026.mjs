/**
 * Patch one-shot (sep-2026): cambios salidos de la exportación de Search Console
 * del 27-sep-2026.
 *
 *  maternidad  — seoTitle/seoDescription propios (hoy caían al título largo y al
 *                excerpt), "Respuesta corta" arriba del texto, y la FAQ de "ya
 *                estoy embarazada" contestada con un "No." directo. Regla de Iria:
 *                ninguna aseguradora cubre un embarazo en curso; las cinco tienen
 *                10 meses de periodo de espera.
 *  st6         — el "piso" de la pensión IMSS enlaza al artículo de seguros para
 *                hijos con discapacidad (la puerta de Google hacia el nicho).
 *  autismo     — "18 años" → "desde 2008" (regla: nunca un número de años que
 *                envejece). Se aplica también al borrador pendiente, o volvería
 *                al publicarlo.
 *
 * Cada cambio verifica el texto exacto que espera encontrar; si no coincide,
 * se salta y lo reporta (el documento cambió desde que se escribió el patch).
 *
 * Uso:  node scripts/patch-seo-sep-2026.mjs           (dry-run)
 *       node scripts/patch-seo-sep-2026.mjs --apply
 */
import { config } from "dotenv";
import { randomBytes } from "node:crypto";

config({ path: ".env.local" });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
const API = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01`;
const APPLY = process.argv.includes("--apply");

if (!PROJECT_ID || !TOKEN) {
  console.error("✖ Falta NEXT_PUBLIC_SANITY_PROJECT_ID o SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

const newKey = () => randomBytes(6).toString("hex");
const span = (text, marks = []) => ({ _type: "span", _key: newKey(), text, marks });
const textOf = (block) => (block?.children ?? []).map((c) => c.text).join("");

// Mediodía CDMX = 18:00 UTC: evita que la firma "Revisado" caiga en otro día
// (la plantilla todavía formatea en UTC; ver blog-datos-publicacion).
const DATE_MODIFIED = "2026-09-27T18:00:00.000Z";

async function getDoc(id) {
  const q = encodeURIComponent(`*[_id=="${id}"][0]`);
  const r = await fetch(`${API}/data/query/${DATASET}?query=${q}&perspective=raw`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) throw new Error(`query ${id}: ${r.status} ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const r = await fetch(`${API}/data/mutate/${DATASET}?returnIds=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`mutate: ${r.status} ${await r.text()}`);
  return r.json();
}

const report = [];
const skip = (msg) => report.push(`  ⚠ SALTADO: ${msg}`);
const plan = (msg) => report.push(`  ✓ ${msg}`);

// ------------------------------------------------------------------ maternidad
async function maternidad() {
  const id = "article-seguro-gastos-medicos-maternidad";
  const doc = await getDoc(id);
  report.push(`\n## ${id} (rev ${doc._rev})`);
  const set = {};
  const ops = [];

  set.seoTitle = "Seguro de gastos médicos para embarazo y maternidad";
  set.seoDescription =
    "¿Ya estás embarazada? Ningún seguro cubre ese parto: hay 10 meses de espera. Compara GNP, AXA, MetLife, BUPA y Seguros Monterrey antes de buscar bebé.";
  set.dateModified = DATE_MODIFIED;
  plan(`seoTitle (${set.seoTitle.length}): ${set.seoTitle}`);
  plan(`seoDescription (${set.seoDescription.length}): ${set.seoDescription}`);

  // Respuesta corta, justo después de los key takeaways.
  const RESPUESTA = "Respuesta corta:";
  const ya = doc.body.some((b) => textOf(b).startsWith(RESPUESTA));
  const kt = doc.body[0];
  if (ya) skip("la respuesta corta ya existe");
  else if (kt?._key !== "8b9648c9b83d") skip("el primer bloque ya no es el keyTakeaways esperado");
  else {
    const block = {
      _type: "block",
      _key: newKey(),
      style: "normal",
      markDefs: [],
      children: [
        span(RESPUESTA, ["strong"]),
        span(
          " si ya estás embarazada, ningún seguro de gastos médicos mayores en México va a cubrir ese parto. Las cinco aseguradoras que comparo —GNP, AXA, MetLife, BUPA y Seguros Monterrey— piden 10 meses de periodo de espera para maternidad, y un embarazo dura 9. El seguro para maternidad se contrata antes de buscar el embarazo.",
        ),
      ],
    };
    ops.push({ patch: { id, insert: { after: `body[_key=="${kt._key}"]`, items: [block] } } });
    plan(`insertar después de keyTakeaways: "${textOf(block)}"`);
  }

  // FAQ: "¿Puedo contratar un GMM si ya estoy embarazada…?"
  const faq = doc.body.find((b) => b._key === "d27cdc551e3b");
  if (!faq || !textOf(faq).startsWith("No conviene asumirlo.")) skip("la respuesta de la FAQ de embarazo ya cambió");
  else {
    const nuevo =
      "No. Ninguna de las cinco aseguradoras cubre un embarazo que ya está en curso: todas piden 10 meses de periodo de espera para maternidad, y un embarazo dura 9. El seguro para maternidad se contrata antes de buscar el embarazo, no después.";
    ops.push({ patch: { id, set: { [`body[_key=="${faq._key}"].children`]: [span(nuevo)] } } });
    plan(`FAQ embarazo → "${nuevo}"`);
  }

  ops.unshift({ patch: { id, set } });
  return { id, slug: "seguro-gastos-medicos-maternidad", ops };
}

// ------------------------------------------------------------------------ st6
async function st6() {
  const id = "article-st6-imss-pension-orfandad-sin-limite-edad";
  const doc = await getDoc(id);
  report.push(`\n## ${id} (rev ${doc._rev})`);
  const ops = [];
  const HREF = "/blog/proteger-hijo-con-discapacidad-cuando-yo-falte";
  const b = doc.body.find((x) => x._key === "e1202c33793f");
  const FIN = "El resto se cubre con una estructura de seguros dimensionada a los costos reales de largo plazo.";
  if (!b || !textOf(b).endsWith(FIN)) skip("el párrafo de \"¿La pensión del IMSS es suficiente?\" ya cambió");
  else if ((b.markDefs ?? []).some((m) => m.href === HREF)) skip("el enlace ya existe");
  else {
    const linkKey = newKey();
    const children = [
      ...b.children,
      span(" Te explico cómo armarla en "),
      span("¿Qué pasará con mi hijo autista o con discapacidad cuando yo falte?", [linkKey]),
      span("."),
    ];
    const markDefs = [...(b.markDefs ?? []), { _type: "link", _key: linkKey, href: HREF }];
    ops.push({
      patch: {
        id,
        set: {
          [`body[_key=="${b._key}"].children`]: children,
          [`body[_key=="${b._key}"].markDefs`]: markDefs,
          dateModified: DATE_MODIFIED,
        },
      },
    });
    plan(`agregar al final: "Te explico cómo armarla en [¿Qué pasará con mi hijo…?](${HREF})."`);
  }
  return { id, slug: "st6-imss-pension-orfandad-sin-limite-edad", ops };
}

// -------------------------------------------------------------------- autismo
const REEMPLAZOS = [
  ["desde 2008 — 18 años acompañando a familias mexicanas", "desde 2008, acompañando a familias mexicanas"],
  [" — son ya 18 años acompañando a familias mexicanas", ", y desde entonces acompaño a familias mexicanas"],
];

async function autismo(id) {
  const doc = await getDoc(id);
  if (!doc) return null;
  report.push(`\n## ${id} (rev ${doc._rev})`);
  const set = {};
  for (const b of doc.body ?? []) {
    if (b._type !== "block") continue;
    b.children.forEach((c, i) => {
      let t = c.text;
      for (const [de, a] of REEMPLAZOS) t = t.replace(de, a);
      if (t !== c.text) {
        set[`body[_key=="${b._key}"].children[_key=="${c._key}"].text`] = t;
        plan(`"${c.text.trim()}" → "${t.trim()}"`);
      }
    });
  }
  const quedan = (doc.body ?? []).filter((b) => /\b18 años\b/.test(textOf(b)) && /acompañ/.test(textOf(b)));
  if (Object.keys(set).length === 0) skip("no hay \"18 años\" de experiencia que corregir");
  return { id, slug: "como-dejar-dinero-hijo-autismo-discapacidad-mexico", ops: Object.keys(set).length ? [{ patch: { id, set } }] : [], quedan };
}

// ----------------------------------------------------------------------- main
const jobs = [
  await maternidad(),
  await st6(),
  await autismo("article-como-dejar-dinero-hijo-autismo-discapacidad-mexico"),
  await autismo("drafts.article-como-dejar-dinero-hijo-autismo-discapacidad-mexico"),
].filter(Boolean);

console.log(report.join("\n"));
const mutations = jobs.flatMap((j) => j.ops);
console.log(`\n${mutations.length} mutaciones.`);

if (!APPLY) {
  console.log("Dry-run. Agrega --apply para escribir en Sanity.");
  process.exit(0);
}

const res = await mutate(mutations);
console.log("✓ Sanity:", res.transactionId);

if (REVALIDATE_SECRET) {
  for (const slug of new Set(jobs.map((j) => j.slug))) {
    const r = await fetch(`https://iriatalan.com.mx/api/revalidate?secret=${REVALIDATE_SECRET}&path=/blog/${slug}`, {
      method: "POST",
    });
    console.log(`revalidate /blog/${slug}: ${r.status}`);
  }
}
