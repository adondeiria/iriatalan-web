// Quita marcadores ** (markdown bold) que quedaron literales dentro de bloques
// custom del body (keyTakeaways, comparisonTable) del artículo de maternidad.
// Esos bloques no renderizan markdown, así que los ** salían visibles.
// Los párrafos normales ya no tienen ** (draft-push los convirtió a marks), así
// que un strip global de ** en el body es seguro.
// Sin --apply: dry-run (cuenta ocurrencias). Con --apply: patchea body.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const { NEXT_PUBLIC_SANITY_PROJECT_ID: PROJ, NEXT_PUBLIC_SANITY_DATASET: DS, SANITY_API_WRITE_TOKEN: TOKEN } = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const ID = "article-seguro-gastos-medicos-maternidad";

async function q(groq) {
  const r = await fetch(`https://${PROJ}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(groq)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) { console.error("Query error", r.status, await r.text()); process.exit(1); }
  return (await r.json()).result;
}

const doc = await q(`*[_id=="${ID}"][0]{body}`);
const body = doc?.body;
if (!Array.isArray(body)) { console.error("body no es array:", JSON.stringify(doc)?.slice(0, 200)); process.exit(1); }

let count = 0;
const samples = [];
function clean(v) {
  if (typeof v === "string") {
    if (v.includes("**")) { count += (v.match(/\*\*/g) || []).length; if (samples.length < 8) samples.push(v.slice(0, 80)); }
    return v.replace(/\*\*/g, "");
  }
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") { const o = {}; for (const k of Object.keys(v)) o[k] = clean(v[k]); return o; }
  return v;
}
const cleaned = clean(body);

console.log(`Ocurrencias de ** encontradas: ${count}`);
console.log("Muestras (strings que tenían **):");
samples.forEach((s) => console.log("  ·", s));

if (!process.argv.includes("--apply")) { console.log("\nDRY-RUN. Corre con --apply para patchear el body."); process.exit(0); }
if (count === 0) { console.log("\nNada que limpiar."); process.exit(0); }

const r = await fetch(`https://${PROJ}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{ patch: { id: ID, set: { body: cleaned } } }] }),
});
if (!r.ok) { console.error("ERROR", r.status, await r.text()); process.exit(1); }
console.log(`\nOK · ${count} marcadores ** eliminados del body.`);
