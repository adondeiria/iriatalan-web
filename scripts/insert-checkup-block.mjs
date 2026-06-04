// Inserta el bloque checkupDownload en el body del artículo de testamento,
// después de b31 (último párrafo) y antes del disclaimer. Idempotente:
// si ya existe un bloque checkupDownload, no inserta otro.
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
const ID = "article-testamento-no-protege-seguros-cuentas";

const base = `https://${PID}.api.sanity.io/v${VER}/data`;
const q = encodeURIComponent(`*[_id=="${ID}"][0].body[_type=="checkupDownload"]`);
const exists = await (await fetch(`${base}/query/${DS}?query=${q}`, { headers: { Authorization: `Bearer ${TOKEN}` } })).json();
if (Array.isArray(exists.result) && exists.result.length > 0) {
  console.log("⏭  Ya existe un bloque checkupDownload, no se inserta otro."); process.exit(0);
}

const mutations = [{
  patch: {
    id: ID,
    insert: { after: 'body[_key=="b31"]', items: [{ _type: "checkupDownload", _key: "checkupdl1" }] },
  },
}];
const r = await fetch(`${base}/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!r.ok) { console.error(`❌ ${r.status} ${await r.text()}`); process.exit(1); }
console.log("✅ Bloque checkupDownload insertado en el artículo (después de b31).");
