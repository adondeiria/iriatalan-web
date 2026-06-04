// Patch al draft del artículo: asigna autor + fuentes legales verificadas.
// Idempotente (set). Lee SANITY_API_WRITE_TOKEN de .env.local. Requiere --apply.

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
if (!TOKEN) { console.error("❌ Falta token"); process.exit(1); }

const mutations = [{
  patch: {
    id: "article-testamento-no-protege-seguros-cuentas",
    set: {
      author: { _type: "reference", _ref: "e61428b9-62f9-45a5-91cd-85b85454c120" },
      sources: [
        { _key: "src-lcs", _type: "source", title: "Ley sobre el Contrato de Seguro", url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/211.pdf", publisher: "Cámara de Diputados (DOF)" },
        { _key: "src-lic", _type: "source", title: "Ley de Instituciones de Crédito", url: "https://www.diputados.gob.mx/LeyesBiblio/pdf/LIC.pdf", publisher: "Cámara de Diputados (DOF)" },
      ],
    },
  },
}];

if (!process.argv.includes("--apply")) {
  console.log("🟡 DRY-RUN. Patch a aplicar:\n" + JSON.stringify(mutations, null, 2));
  process.exit(0);
}

const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!r.ok) { console.error(`❌ ${r.status} ${await r.text()}`); process.exit(1); }
console.log("✅ Patch aplicado: autor (Iria Talan) + 2 fuentes (LCS, LIC) agregados al draft.");
