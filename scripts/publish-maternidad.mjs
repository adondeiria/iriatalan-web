// Publica el artículo de maternidad GMM: asigna autor (Iria Talan) + draft=false + publishedAt.
// Sin --apply hace dry-run (muestra estado del doc y el autor encontrado). Requiere --apply para publicar.
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
const ID = "article-seguro-gastos-medicos-maternidad";

async function q(groq) {
  const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(groq)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) { console.error("Query error", r.status, await r.text()); process.exit(1); }
  return (await r.json()).result;
}

const author = await q(`*[_type == "author"] | order(_updatedAt desc)[0]{_id, name}`);
const doc = await q(`*[_id=="${ID}"][0]{title,"slug":slug.current,draft,publishedAt,"hasHero":defined(heroImage),"hasAuthor":defined(author),"blocks":count(body)}`);

console.log("Autor encontrado:", JSON.stringify(author));
console.log("Estado del doc:", JSON.stringify(doc, null, 2));
if (!doc) { console.error("No se encontró el artículo."); process.exit(1); }
if (!author?._id) { console.error("No se encontró doc de autor."); process.exit(1); }

if (!process.argv.includes("--apply")) { console.log("\nDRY-RUN. Corre con --apply para publicar (autor + draft=false + publishedAt)."); process.exit(0); }

const publishedAt = doc.publishedAt || new Date().toISOString();
const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{ patch: { id: ID, set: { draft: false, publishedAt, author: { _type: "reference", _ref: author._id } } } }] }),
});
if (!r.ok) { console.error("ERROR", r.status, await r.text()); process.exit(1); }
console.log(`\nOK · PUBLICADO. autor=${author.name} · draft=false · publishedAt=${publishedAt}`);
console.log(`URL: https://iriatalan.com.mx/blog/${doc.slug}`);
