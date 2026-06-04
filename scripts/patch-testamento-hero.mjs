// Sube la imagen hero (v6b) al CDN de Sanity y la asigna como heroImage del draft.
// Lee SANITY_API_WRITE_TOKEN de .env.local. Requiere --apply.

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
const DOC_ID = "article-testamento-no-protege-seguros-cuentas";
const IMG_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxf2SKL4VVOUjrX7ZE3rpE4pI3/hf_20260604_170428_8eed231d-778a-4402-91e6-219f6922cc41.png";
const ALT = "Documento de endoso 'Cambio de Beneficiarios' sobre un escritorio, con escrituras, contrato bancario y póliza de seguro de vida";

if (!TOKEN) { console.error("❌ Falta token"); process.exit(1); }
if (!process.argv.includes("--apply")) { console.log("🟡 DRY-RUN. Subiría la imagen y la asignaría como heroImage."); process.exit(0); }

// 1) Subir el binario de la imagen al asset store de Sanity
const imgBytes = await (await fetch(IMG_URL)).arrayBuffer();
const up = await fetch(`https://${PID}.api.sanity.io/v${VER}/assets/images/${DS}?filename=hero-cambio-beneficiarios.png`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "image/png" },
  body: Buffer.from(imgBytes),
});
if (!up.ok) { console.error(`❌ Upload falló: ${up.status} ${await up.text()}`); process.exit(1); }
const asset = (await up.json()).document;
console.log(`✅ Imagen subida al asset store: ${asset._id}`);

// 2) Asignar como heroImage del draft (con alt text)
const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations: [{
    patch: { id: DOC_ID, set: { heroImage: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: ALT,
    } } },
  }] }),
});
if (!r.ok) { console.error(`❌ Patch falló: ${r.status} ${await r.text()}`); process.exit(1); }
console.log("✅ heroImage asignada al draft con alt text.");
console.log("\nVer en Studio: https://iriatalan.com.mx/studio/structure/article");
