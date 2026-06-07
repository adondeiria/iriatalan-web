// Sube la imagen hero (manos de familia entrelazadas) al CDN de Sanity y la
// asigna como heroImage del draft del 4to articulo. Requiere --apply.
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
const DOC_ID = "article-hijo-discapacidad-cuando-yo-falte";
// WALK3: mamá mayor y su hijo adulto con sindrome de Down caminando en un parque.
const IMG_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_3Cxf2SKL4VVOUjrX7ZE3rpE4pI3/hf_20260605_185100_ada3e778-3919-4ae4-a58a-bb83ee0025f2.png";
const ALT = "Una madre mayor y su hijo adulto caminan juntos por un parque, mirándose con cariño, símbolo de un vínculo fuerte y un futuro planeado con tranquilidad";

if (!TOKEN) { console.error("Falta token"); process.exit(1); }
if (!process.argv.includes("--apply")) { console.log("DRY-RUN. Subiria la imagen y la asignaria como heroImage."); process.exit(0); }

const imgBytes = await (await fetch(IMG_URL)).arrayBuffer();
const up = await fetch(`https://${PID}.api.sanity.io/v${VER}/assets/images/${DS}?filename=hero-manos-familia-discapacidad.jpeg`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "image/jpeg" },
  body: Buffer.from(imgBytes),
});
if (!up.ok) { console.error(`Upload fallo: ${up.status} ${await up.text()}`); process.exit(1); }
const asset = (await up.json()).document;
console.log(`Imagen subida: ${asset._id}`);

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
if (!r.ok) { console.error(`Patch fallo: ${r.status} ${await r.text()}`); process.exit(1); }
console.log("OK · heroImage (opcion A) asignada al draft con alt text.");
