// One-shot: replace author.credentials + filter specialties + update officeAddress
// Reads SANITY_API_WRITE_TOKEN from .env.local
// Usage: node scripts/sanity-fix-author-fields.mjs [--apply]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const APPLY = process.argv.includes("--apply");

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const apiBase = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`;

async function query(groq) {
  const url = `${apiBase}/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`Query failed: ${r.status} ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const url = `${apiBase}/mutate/${DATASET}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

// El ORDEN importa: decide el orden de los grupos en /sobre-iria y del award[]
// en el JSON-LD. La formación va primero (el cliente reconoce "Yale", no "Top of
// the Table"), MDRT después, y regulatorio al cierre. Yale y LSE siempre con
// "Executive Education": son programas ejecutivos, no posgrados.
// De MDRT solo Top of the Table, sin los años de Court of the Table.
const NEW_CREDENTIALS = [
  { _key: "cred-yale", _type: "credential", title: "Wealth Management Theory & Practice", issuer: "Yale School of Management — Executive Education", year: "2019", category: "academica" },
  { _key: "cred-lse", _type: "credential", title: "MBA Essentials", issuer: "London School of Economics — Executive Education (curso ejecutivo, no MBA)", year: "2023", category: "academica" },
  { _key: "cred-tec", _type: "credential", title: "Ingeniera Mecánica Administradora", issuer: "Tecnológico de Monterrey", year: "2004", category: "academica" },
  { _key: "cred-mdrt", _type: "credential", title: "Miembro MDRT desde 2008 · Top of the Table 2024", issuer: "Million Dollar Round Table — nivel más alto de la élite mundial de la industria de seguros", category: "industria" },
  { _key: "cred-amasfac", _type: "credential", title: "8vo Lugar Nacional — Trofeo AMASFAC", issuer: "AMASFAC (Asociación Mexicana de Agentes de Seguros y Fianzas)", year: "2024", category: "industria" },
  { _key: "cred-gnp", _type: "credential", title: "Asesora Diamante", issuer: "GNP Seguros", year: "Desde 2016", category: "carrier" },
  { _key: "cred-smnyl", _type: "credential", title: "Asesora Diamante", issuer: "Seguros Monterrey New York Life", year: "Desde 2008", category: "carrier" },
  { _key: "cred-bmv", _type: "credential", title: "Diplomado en Análisis Financiero", issuer: "Bolsa Mexicana de Valores", year: "2015", category: "regulatoria" },
  { _key: "cred-cnsf", _type: "credential", title: "Asesora Autorizada · Cédula V388618", issuer: "Comisión Nacional de Seguros y Fianzas (CNSF)", year: "Desde 2008", url: "https://agentesajustadores.cnsf.gob.mx/", category: "regulatoria" },
];

// OJO: este script reemplaza las credenciales ENTERAS. Si se re-corre, revisa
// primero que NEW_CREDENTIALS siga coincidiendo con FALLBACK_AUTHOR
// (src/lib/author.ts): cuando divergieron, la página mostró una lista de
// credenciales distinta a la de su propia FAQ.
const NEW_OFFICE_ADDRESS = "Homero 205 Int 702, Col. Polanco V Secc, Miguel Hidalgo, CDMX 11560";

const doc = await query(
  `*[_type == "author"] | order(_updatedAt desc)[0]{_id, name, credentials, specialties, officeAddress}`
);

console.log(`\nDoc: ${doc._id} (${doc.name})`);
console.log(`\nCURRENT credentials (${doc.credentials?.length ?? 0}):`);
(doc.credentials ?? []).forEach((c, i) =>
  console.log(`  [${i}] ${c.title}${c.year ? ` · ${c.year}` : ""} — ${c.issuer ?? ""}`)
);

console.log(`\nCURRENT specialties (${doc.specialties?.length ?? 0}):`);
(doc.specialties ?? []).forEach((s, i) => console.log(`  [${i}] ${s}`));

console.log(`\nCURRENT officeAddress: "${doc.officeAddress ?? "(none)"}"`);

const newSpecialties = (doc.specialties ?? []).filter((s) => s !== "Hombre Clave");

console.log(`\n--- CHANGES PLANNED ---`);
console.log(`credentials: ${doc.credentials?.length ?? 0} → ${NEW_CREDENTIALS.length} (full replace)`);
console.log(`specialties: ${doc.specialties?.length ?? 0} → ${newSpecialties.length} (removed "Hombre Clave" if present)`);
console.log(`officeAddress: "${doc.officeAddress ?? ""}" → "${NEW_OFFICE_ADDRESS}"`);

if (!APPLY) {
  console.log(`\nDRY-RUN. Re-run with --apply to mutate.`);
  process.exit(0);
}

const result = await mutate([
  {
    patch: {
      id: doc._id,
      set: {
        credentials: NEW_CREDENTIALS,
        specialties: newSpecialties,
        officeAddress: NEW_OFFICE_ADDRESS,
      },
    },
  },
]);
console.log(`\n✅ Patch aplicado:`, JSON.stringify(result, null, 2));
