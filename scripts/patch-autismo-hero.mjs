// patch-autismo-hero.mjs
// Sube imagen local a Sanity como asset y la asigna como heroImage del draft de autismo/discapacidad.
// Sin --apply hace dry-run (solo imprime lo que haría).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i).replace(/^﻿/, "").trim(),
        l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ""),
      ];
    })
);

const PID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DS = env.NEXT_PUBLIC_SANITY_DATASET;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;

const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const IMG = "C:/Users/iriat/Downloads/familia_neurodivergente_blog_alta_resolucion.png";
const ALT =
  "Familia mexicana planeando juntos el futuro patrimonial de su hijo autista — testamento, fideicomiso y seguro de vida sobre la mesa.";

if (!fs.existsSync(IMG)) {
  console.error("❌ No existe el archivo:", IMG);
  process.exit(1);
}
const bytes = fs.readFileSync(IMG);
console.log(`📂 Imagen local: ${IMG}`);
console.log(`   Tamaño: ${(bytes.length / 1024 / 1024).toFixed(2)} MB`);

if (!process.argv.includes("--apply")) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para subir + asignar el hero.");
  console.log(`   Doc a actualizar: ${ID}`);
  console.log(`   Alt text: ${ALT}`);
  process.exit(0);
}

if (!TOKEN) {
  console.error("❌ Falta SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

// 1) Sube el asset
console.log("\n🟢 Subiendo asset a Sanity...");
const assetRes = await fetch(
  `https://${PID}.api.sanity.io/v${VER}/assets/images/${DS}?filename=${encodeURIComponent(path.basename(IMG))}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "image/png",
    },
    body: bytes,
  }
);
if (!assetRes.ok) {
  console.error("❌ Upload falló:", assetRes.status, await assetRes.text());
  process.exit(1);
}
const assetJson = await assetRes.json();
const assetId = assetJson.document?._id;
const assetUrl = assetJson.document?.url;
if (!assetId) {
  console.error("❌ No vino assetId en respuesta:", JSON.stringify(assetJson));
  process.exit(1);
}
console.log(`   ✓ Asset ID: ${assetId}`);
console.log(`   ✓ URL: ${assetUrl}`);

// 2) Patch del doc con heroImage
console.log("\n🟢 Asignando heroImage al draft...");
const patchRes = await fetch(
  `https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mutations: [
        {
          patch: {
            id: ID,
            set: {
              heroImage: {
                _type: "image",
                asset: { _type: "reference", _ref: assetId },
                alt: ALT,
              },
            },
          },
        },
      ],
    }),
  }
);
if (!patchRes.ok) {
  console.error("❌ Patch falló:", patchRes.status, await patchRes.text());
  process.exit(1);
}
console.log("   ✓ heroImage asignada con alt text.");
console.log(
  `\n✅ Listo. Revisa en Studio: https://iriatalan.com.mx/studio/structure/article;${ID}`
);
