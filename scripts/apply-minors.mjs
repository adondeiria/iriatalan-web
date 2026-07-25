// Dos fixes menores del Día 4 (patch quirúrgico, NO createOrReplace):
//   1. modalidad-40: enlazar los 3 "vehículos" en el body a sus páginas de servicio.
//   2. rentas-vitalicias: poner publishedAt (estaba null → no salía en índice ni sitemap).
// Dry-run por defecto. Con --apply escribe.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const { NEXT_PUBLIC_SANITY_PROJECT_ID: PROJ, NEXT_PUBLIC_SANITY_DATASET: DS, SANITY_API_WRITE_TOKEN: TOKEN } = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const APPLY = process.argv.includes("--apply");
const key = () => crypto.randomBytes(6).toString("hex");

async function q(groq) {
  const r = await fetch(`https://${PROJ}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(groq)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) { console.error("Query error", r.status, await r.text()); process.exit(1); }
  return (await r.json()).result;
}
async function mutate(mutations) {
  const r = await fetch(`https://${PROJ}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  const j = await r.json();
  if (!r.ok) { console.error("MUTATE ERROR", r.status, JSON.stringify(j)); process.exit(1); }
  return j;
}

// ─────────────────────────────────────────────────────────────
// FIX 1 — modalidad-40 in-body links
// ─────────────────────────────────────────────────────────────
const MOD_ID = "article-modalidad-40-imss-conviene";
// blockKey → { childKey, href }  (spans "strong" con el nombre del vehículo)
const LINKS = {
  a80a573ab09b: { childKey: "f6bcc7ef3ec8", href: "/retiro" },              // Seguro de Ahorro / retiro
  "72be791d8ca8": { childKey: "5388bb7722b8", href: "/seguros-vida" },       // Seguro de vida con valor en efectivo
  "6b41bdcc7a75": { childKey: "962029c13b74", href: "/fondos-de-inversion" }, // Fondo dedicado
};

const modBody = await q(`*[_id=="${MOD_ID}"][0].body`);
if (!Array.isArray(modBody)) { console.error("modalidad-40 body no es array"); process.exit(1); }

let modChanges = 0;
const modReport = [];
for (const [blockKey, { childKey, href }] of Object.entries(LINKS)) {
  const block = modBody.find((b) => b._key === blockKey);
  if (!block) { console.error(`✗ Falta bloque ${blockKey}`); process.exit(1); }
  const child = (block.children || []).find((c) => c._key === childKey);
  if (!child) { console.error(`✗ Falta child ${childKey} en bloque ${blockKey}`); process.exit(1); }

  block.markDefs = block.markDefs || [];
  child.marks = child.marks || [];
  // Idempotencia: ¿ya hay un mark link hacia ese href en este child?
  const already = child.marks.some((m) => (block.markDefs.find((d) => d._key === m)?.href === href));
  if (already) { modReport.push(`= [${blockKey}] ya enlazado → ${href}`); continue; }

  const k = key();
  block.markDefs.push({ _key: k, _type: "link", href });
  child.marks.push(k);
  modChanges++;
  modReport.push(`+ [${blockKey}] "${(child.text || "").slice(0, 48)}…" → ${href}`);
}
console.log("=== FIX 1 · modalidad-40 in-body links ===");
modReport.forEach((l) => console.log("  " + l));

// ─────────────────────────────────────────────────────────────
// FIX 2 — rentas-vitalicias publishedAt
// ─────────────────────────────────────────────────────────────
const RENT_ID = "article-rentas-vitalicias-mexico";
// Fecha honesta = lastTouched / subida del hero (2026-06-29 20:00 CST = 2026-06-30T02:00Z)
const RENT_PUBLISHED = "2026-06-30T02:00:00.000Z";
const rentNow = await q(`*[_id=="${RENT_ID}"][0]{publishedAt,draft}`);
console.log("\n=== FIX 2 · rentas-vitalicias publishedAt ===");
console.log(`  actual: publishedAt=${JSON.stringify(rentNow?.publishedAt)} draft=${rentNow?.draft}`);
const rentNeeds = !rentNow?.publishedAt;
console.log(rentNeeds ? `  + set publishedAt = ${RENT_PUBLISHED}` : "  = ya tiene publishedAt, sin cambios");

// ─────────────────────────────────────────────────────────────
if (!APPLY) {
  console.log(`\nDRY-RUN. modChanges=${modChanges}, rentNeeds=${rentNeeds}. Corre con --apply para escribir.`);
  process.exit(0);
}

const muts = [];
if (modChanges > 0) muts.push({ patch: { id: MOD_ID, set: { body: modBody } } });
if (rentNeeds) muts.push({ patch: { id: RENT_ID, set: { publishedAt: RENT_PUBLISHED } } });
if (muts.length === 0) { console.log("\nNada que aplicar."); process.exit(0); }

const res = await mutate(muts);
console.log(`\nOK · ${muts.length} mutación(es) aplicada(s). transactionId=${res.transactionId || "?"}`);
