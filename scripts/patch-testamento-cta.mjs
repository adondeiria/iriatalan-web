// Patch al bloque CTA (ctaWhatsApp, _key=b36) del draft de testamento.
// Ajuste de cumplimiento: no implica revisar polizas de terceros.
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
if (!TOKEN) { console.error("❌ Falta token"); process.exit(1); }

const KEY = "b36";
const mutations = [{
  patch: {
    id: "article-testamento-no-protege-seguros-cuentas",
    set: {
      [`body[_key=="${KEY}"].heading`]: "¿Ordenamos tu estrategia patrimonial?",
      [`body[_key=="${KEY}"].text`]: "Revisar quién aparece como beneficiario en tus pólizas, cuentas y Afore es algo que puedes empezar hoy con tus propias instituciones. Lo que yo hago es ayudarte a diseñar y alinear tu protección patrimonial. Si ya eres mi cliente, revisamos juntos tus pólizas; si aún no, te oriento para empezar.",
      [`body[_key=="${KEY}"].buttonLabel`]: "Quiero asesoría patrimonial",
      [`body[_key=="${KEY}"].preFilledMessage`]: "Hola Iria, quiero asesoría para ordenar mi estrategia patrimonial.",
    },
  },
}];

if (!process.argv.includes("--apply")) {
  console.log("🟡 DRY-RUN:\n" + JSON.stringify(mutations, null, 2));
  process.exit(0);
}

const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!r.ok) { console.error(`❌ ${r.status} ${await r.text()}`); process.exit(1); }
console.log("✅ CTA del draft actualizado (sin implicar revisión de pólizas de terceros).");
