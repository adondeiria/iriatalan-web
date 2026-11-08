// One-shot (nov-2026): author → AMASFAC 4º lugar 2025 en longBio + quitar "Seguros Autos" de specialties.
// Mismo patrón que scripts/sanity-fix-author-fields.mjs. Lee SANITY_API_WRITE_TOKEN de .env.local.
//
// Uso:
//   node scripts/sanity-fix-author-amasfac-autos.mjs                 → DRY-RUN: diff borrador vs publicado + patch planeado
//   node scripts/sanity-fix-author-amasfac-autos.mjs --apply         → aplica el patch al PUBLICADO (con ifRevisionID)
//   node scripts/sanity-fix-author-amasfac-autos.mjs --delete-draft=<_rev del borrador>
//                                                                     → borra el borrador SOLO si su _rev sigue igual
//   node scripts/sanity-fix-author-amasfac-autos.mjs --verify        → GROQ a api.sanity.io (no CDN) + revalidate /sobre-iria

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
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
const DELETE_DRAFT_REV = process.argv.find((a) => a.startsWith("--delete-draft="))?.split("=")[1];

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}
if (PROJECT_ID !== "0xa0dciq" || DATASET !== "production") {
  console.error(`Proyecto/dataset inesperado: ${PROJECT_ID}/${DATASET}`);
  process.exit(1);
}

// api.sanity.io (NO apicdn) para leer siempre lo último.
const apiBase = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`;
const auth = { Authorization: `Bearer ${TOKEN}` };

const PUB_ID = "e61428b9-62f9-45a5-91cd-85b85454c120";
const DRAFT_ID = `drafts.${PUB_ID}`;
const BLOCK_KEY = "834707c4180e";
const SPAN_KEY = "ff1667714d87"; // primer span del bloque (marks: strong) — se conserva tal cual, solo cambia el texto
const NEW_SPAN_TEXT = "4º Lugar Nacional 2025, Trofeo AMASFAC";
const EXPECTED_FULL_TEXT =
  "4º Lugar Nacional 2025, Trofeo AMASFAC — Asociación Mexicana de Agentes de Seguros y Fianzas, la red de agentes más grande del país";
const SPECIALTY_TO_REMOVE = "Seguros Autos";
const SYSTEM_FIELDS = new Set(["_id", "_rev", "_createdAt", "_updatedAt", "_system"]);

async function getDocs(ids) {
  const r = await fetch(`${apiBase}/doc/${DATASET}/${ids.join(",")}`, { headers: auth });
  if (!r.ok) throw new Error(`Doc fetch failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return Object.fromEntries(j.documents.map((d) => [d._id, d]));
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

const blockText = (b) => (b?.children ?? []).map((c) => c.text ?? "").join("");
const short = (v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return s && s.length > 160 ? s.slice(0, 157) + "..." : s;
};

// Diff legible campo por campo. Arrays con _key → por _key; arrays de strings → agregados/quitados/orden.
function diffDocs(a, b, labelA, labelB) {
  const out = [];
  const fields = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((f) => !SYSTEM_FIELDS.has(f)).sort();
  for (const f of fields) {
    const va = a[f];
    const vb = b[f];
    if (isDeepStrictEqual(va, vb)) continue;
    const lines = [];
    if (Array.isArray(va) && Array.isArray(vb) && [...va, ...vb].every((x) => x && typeof x === "object" && x._key)) {
      const ma = new Map(va.map((x) => [x._key, x]));
      const mb = new Map(vb.map((x) => [x._key, x]));
      for (const [k, x] of ma) {
        if (!mb.has(k)) lines.push(`    − [${k}] solo en ${labelA}: ${short(blockText(x) || x)}`);
        else if (!isDeepStrictEqual(x, mb.get(k))) {
          const y = mb.get(k);
          if (x._type === "block" && y._type === "block") {
            lines.push(`    ~ [${k}] bloque distinto`);
            lines.push(`        ${labelA}: ${JSON.stringify(x.children.map((c) => ({ text: c.text, marks: c.marks })))}`);
            lines.push(`        ${labelB}: ${JSON.stringify(y.children.map((c) => ({ text: c.text, marks: c.marks })))}`);
            const rest = (o) => ({ ...o, children: undefined });
            if (!isDeepStrictEqual(rest(x), rest(y))) lines.push(`        (además cambian estilo/lista/markDefs)`);
          } else {
            lines.push(`    ~ [${k}] ${labelA}: ${short(x)}`);
            lines.push(`      [${k}] ${labelB}: ${short(y)}`);
          }
        }
      }
      for (const [k, y] of mb) if (!ma.has(k)) lines.push(`    + [${k}] solo en ${labelB}: ${short(blockText(y) || y)}`);
      const orderA = va.map((x) => x._key).filter((k) => mb.has(k));
      const orderB = vb.map((x) => x._key).filter((k) => ma.has(k));
      if (!isDeepStrictEqual(orderA, orderB)) lines.push(`    ↕ cambia el orden de los elementos`);
    } else if (Array.isArray(va) && Array.isArray(vb) && [...va, ...vb].every((x) => typeof x === "string")) {
      for (const s of va) if (!vb.includes(s)) lines.push(`    − "${s}" (solo en ${labelA})`);
      for (const s of vb) if (!va.includes(s)) lines.push(`    + "${s}" (solo en ${labelB})`);
      const ca = va.filter((s) => vb.includes(s));
      const cb = vb.filter((s) => va.includes(s));
      if (!isDeepStrictEqual(ca, cb)) lines.push(`    ↕ cambia el orden`);
    } else {
      lines.push(`    ${labelA}: ${short(va)}`);
      lines.push(`    ${labelB}: ${short(vb)}`);
    }
    out.push({ field: f, lines });
  }
  return out;
}

function printDiff(title, diff) {
  console.log(`\n=== ${title} ===`);
  if (!diff.length) return console.log("  (sin diferencias)");
  for (const d of diff) {
    console.log(`  • ${d.field}`);
    d.lines.forEach((l) => console.log(l));
  }
}

// Aplica en memoria los dos cambios pedidos, sin tocar nada más.
function withChanges(doc) {
  const next = structuredClone(doc);
  const block = next.longBio?.find((b) => b._key === BLOCK_KEY);
  const span = block?.children?.find((c) => c._key === SPAN_KEY);
  if (!span) throw new Error(`No encontré longBio[_key=="${BLOCK_KEY}"].children[_key=="${SPAN_KEY}"]`);
  span.text = NEW_SPAN_TEXT;
  if (blockText(block) !== EXPECTED_FULL_TEXT)
    throw new Error(`El bloque no quedaría con el texto exacto. Quedaría: "${blockText(block)}"`);
  next.specialties = (next.specialties ?? []).filter((s) => s !== SPECIALTY_TO_REMOVE);
  return next;
}

// ───────────────────────── VERIFY ─────────────────────────
if (VERIFY) {
  const res = await query(
    `*[_id == $id][0]{
      "bloque": pt::text(longBio[_key == $blockKey][0]),
      "tiene8vo": count(longBio[pt::text(@) match "*8vo Lugar Nacional, Trofeo*"]) > 0,
      "longBio8voStr": pt::text(longBio) match "8vo",
      specialties,
      "tieneAutos": $autos in specialties,
      _rev, _updatedAt
    }`,
    { id: PUB_ID, blockKey: BLOCK_KEY, autos: SPECIALTY_TO_REMOVE }
  );
  const full = (await getDocs([PUB_ID]))[PUB_ID];
  const longBioPlain = (full.longBio ?? []).map(blockText).join("\n");
  const drafts = await getDocs([DRAFT_ID]).catch(() => ({}));
  console.log(JSON.stringify(res, null, 2));
  console.log(`\nlongBio contiene "8vo Lugar Nacional, Trofeo" (texto plano JS): ${longBioPlain.includes("8vo Lugar Nacional, Trofeo")}`);
  console.log(`Bloque == texto exacto pedido: ${res.bloque === EXPECTED_FULL_TEXT}`);
  console.log(`specialties contiene "${SPECIALTY_TO_REMOVE}": ${res.tieneAutos}`);
  console.log(`Borrador existe: ${Boolean(drafts[DRAFT_ID])}`);

  if (!REVALIDATE_SECRET) {
    console.log("\n⚠️  Sin REVALIDATE_SECRET en .env.local: no se puede revalidar; queda el ISR.");
  } else {
    const url = `${SITE_URL}/api/revalidate?path=/sobre-iria&secret=${encodeURIComponent(REVALIDATE_SECRET)}`;
    const r = await fetch(url, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    console.log(`\n🔄 Revalidate /sobre-iria → ${r.status} ${JSON.stringify(j)}`);
  }
  process.exit(0);
}

// ───────────────────────── DELETE DRAFT ─────────────────────────
if (DELETE_DRAFT_REV) {
  const docs = await getDocs([PUB_ID, DRAFT_ID]);
  const draft = docs[DRAFT_ID];
  if (!draft) {
    console.log("No hay borrador. Nada que borrar.");
    process.exit(0);
  }
  if (draft._rev !== DELETE_DRAFT_REV) {
    console.error(`❌ El borrador cambió desde la revisión (_rev ${draft._rev} ≠ ${DELETE_DRAFT_REV}). No lo borro.`);
    process.exit(1);
  }
  const result = await mutate([{ delete: { id: DRAFT_ID } }]);
  console.log(`🗑️  Borrador eliminado:`, JSON.stringify(result, null, 2));
  process.exit(0);
}

// ───────────────────────── DRY-RUN / APPLY ─────────────────────────
const docs = await getDocs([PUB_ID, DRAFT_ID]);
const pub = docs[PUB_ID];
const draft = docs[DRAFT_ID];
if (!pub) throw new Error(`No existe el publicado ${PUB_ID}`);

console.log(`Publicado: ${pub._id}  _rev ${pub._rev}  _updatedAt ${pub._updatedAt}`);
console.log(`Borrador : ${draft ? `${draft._id}  _rev ${draft._rev}  _updatedAt ${draft._updatedAt}` : "(no existe)"}`);

const target = withChanges(pub);

if (draft) {
  printDiff("PASO 1 — Borrador vs Publicado (campos que difieren)", diffDocs(pub, draft, "publicado", "borrador"));
  printDiff(
    "Borrador vs Publicado-con-los-2-cambios (lo que el borrador tiene DE MÁS o DISTINTO a lo pedido)",
    diffDocs(target, draft, "objetivo", "borrador")
  );
}

printDiff("PASO 2 — Patch planeado sobre el PUBLICADO (antes → después)", diffDocs(pub, target, "antes", "después"));

if (!APPLY) {
  console.log(`\nDRY-RUN. Nada se modificó. Re-run con --apply para mutar el publicado.`);
  process.exit(0);
}

const result = await mutate([
  {
    patch: {
      id: PUB_ID,
      ifRevisionID: pub._rev, // si alguien publicó en medio, falla en vez de pisar
      set: {
        [`longBio[_key=="${BLOCK_KEY}"].children[_key=="${SPAN_KEY}"].text`]: NEW_SPAN_TEXT,
        specialties: target.specialties,
      },
    },
  },
]);
console.log(`\n✅ Patch aplicado:`, JSON.stringify(result, null, 2));
