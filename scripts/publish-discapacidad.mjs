// Publica el 4to articulo (discapacidad/neurodivergencia): draft=false + publishedAt.
// Sin --apply hace dry-run: solo muestra el estado actual del doc. Requiere --apply.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const { NEXT_PUBLIC_SANITY_PROJECT_ID: PID, NEXT_PUBLIC_SANITY_DATASET: DS, SANITY_API_WRITE_TOKEN: TOKEN } = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const ID = "article-hijo-discapacidad-cuando-yo-falte";

// 1) Estado actual
const q = encodeURIComponent(`*[_id=="${ID}"][0]{title,"slug":slug.current,draft,publishedAt,"hasHero":defined(heroImage),"blocks":count(body)}`);
const sr = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${q}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
const doc = (await sr.json()).result;
console.log("Estado actual:", JSON.stringify(doc, null, 2));
if (!doc) { console.error("No se encontró el doc."); process.exit(1); }

if (!process.argv.includes("--apply")) { console.log("\nDRY-RUN. Corre con --apply para publicar."); process.exit(0); }

const publishedAt = doc.publishedAt || new Date().toISOString();
const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{ patch: { id: ID, set: { draft: false, publishedAt } } }] }),
});
if (!r.ok) { console.error("ERROR", r.status, await r.text()); process.exit(1); }
console.log(`\nOK · PUBLICADO. draft=false · publishedAt=${publishedAt}`);
console.log(`URL: https://iriatalan.com.mx/blog/${doc.slug}`);
