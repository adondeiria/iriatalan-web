// upload-checklist-files.mjs — sube PDF + XLSX del checklist a Sanity y devuelve URLs CDN
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0,i).replace(/^﻿/,"").trim(), l.slice(i+1).trim().replace(/^['"]|['"]$/g,"")]; })
);
const PID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = env.NEXT_PUBLIC_SANITY_DATASET;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const APPLY = process.argv.includes("--apply");

const FILES = [
  {
    local: "C:/Users/iriat/Downloads/checklist-proteccion-hijo-discapacidad.pdf",
    name: "checklist-proteccion-hijo-neurodivergente.pdf",
    mime: "application/pdf",
  },
  {
    local: "C:/Users/iriat/Downloads/checklist-proteccion-hijo-discapacidad.xlsx",
    name: "checklist-proteccion-hijo-neurodivergente.xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
];

if (!TOKEN) { console.error("❌ Falta SANITY_API_WRITE_TOKEN"); process.exit(1); }

for (const f of FILES) {
  if (!fs.existsSync(f.local)) {
    console.error(`❌ No existe ${f.local}`);
    process.exit(1);
  }
  const bytes = fs.readFileSync(f.local);
  console.log(`\n📂 ${f.local}`);
  console.log(`   Tamaño: ${(bytes.length / 1024).toFixed(1)} KB`);

  if (!APPLY) { console.log("   🟡 DRY-RUN — usa --apply para subir"); continue; }

  const r = await fetch(
    `https://${PID}.api.sanity.io/v${VER}/assets/files/${DS}?filename=${encodeURIComponent(f.name)}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": f.mime },
      body: bytes,
    }
  );
  if (!r.ok) { console.error("❌ Upload falló:", r.status, await r.text()); process.exit(1); }
  const j = await r.json();
  console.log(`   ✓ Asset ID: ${j.document?._id}`);
  console.log(`   ✓ URL: ${j.document?.url}`);
}

if (!APPLY) console.log("\n🟡 DRY-RUN total — sin cambios. Corre con --apply.");
