// finalize-autismo.mjs
// 1) Asigna author = Iria Talan al draft autismo/discapacidad
// 2) Convierte los CTAs de texto en bloques custom (ctaWhatsApp para WhatsApp; el de Agenda queda con link)
// 3) Publica (draft:false + publishedAt + updatedAt)
// 4) Dispara revalidate si REVALIDATE_SECRET existe
// Sin --apply hace dry-run.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

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
const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
const SITE_URL = env.SITE_URL || "https://iriatalan.com.mx";
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const APPLY = process.argv.includes("--apply");

const key = () => crypto.randomBytes(6).toString("hex");

async function query(q) {
  const r = await fetch(
    `https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  if (!r.ok) throw new Error(`Query ${r.status}: ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const r = await fetch(
    `https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutations }),
    }
  );
  if (!r.ok) throw new Error(`Mutate ${r.status}: ${await r.text()}`);
  return await r.json();
}

if (!TOKEN) {
  console.error("❌ Falta SANITY_API_WRITE_TOKEN");
  process.exit(1);
}

// ============================================================
// 1) Encontrar autor Iria
// ============================================================
console.log("🔍 Buscando author = Iria Talan...");
const authors = await query(`*[_type=="author"]{_id, name}`);
const iria = authors.find((a) =>
  /iria/i.test(a.name || "") && /talan/i.test(a.name || "")
);
if (!iria) {
  console.error("❌ No encontré author 'Iria Talan'. Authors disponibles:");
  authors.forEach((a) => console.error(`   - ${a._id} → ${a.name}`));
  process.exit(1);
}
console.log(`   ✓ Author: ${iria._id} (${iria.name})`);

// ============================================================
// 2) Leer body actual del doc
// ============================================================
console.log("\n🔍 Leyendo body del draft...");
const doc = await query(
  `*[_id=="${ID}"][0]{_id, title, draft, publishedAt, "blocks":count(body), body, author}`
);
if (!doc) {
  console.error("❌ No encontré el draft");
  process.exit(1);
}
console.log(`   ✓ Draft: ${doc.title}`);
console.log(`   ✓ Estado actual: draft=${doc.draft}, blocks=${doc.blocks}`);

// ============================================================
// 3) Convertir CTAs en custom blocks
// ============================================================
console.log("\n🔧 Convirtiendo CTAs en bloques custom...");
const newBody = [];
let agendaConverted = false;
let waConverted = false;

for (const block of doc.body) {
  const text =
    block._type === "block"
      ? (block.children || []).map((c) => c.text || "").join("").trim()
      : "";

  // CTA WhatsApp
  if (block._type === "block" && /escr[ií]beme por whatsapp/i.test(text)) {
    newBody.push({
      _type: "ctaWhatsApp",
      _key: key(),
      heading: "¿Hablamos por WhatsApp?",
      text: "Si te queda más cómodo, mándame un mensaje y platicamos sin compromiso sobre la situación de tu familia.",
      buttonLabel: "Escríbeme por WhatsApp",
      preFilledMessage:
        "Hola Iria, vengo del artículo sobre planeación patrimonial para hijos con autismo o discapacidad. Me gustaría platicar contigo.",
    });
    waConverted = true;
    continue;
  }

  // El de Agenda lo dejamos como párrafo con enlace claro (mejorado)
  if (block._type === "block" && /agenda tu sesi[oó]n inicial/i.test(text)) {
    const annKey = key();
    newBody.push({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [{ _key: annKey, _type: "link", href: "/agenda" }],
      children: [
        {
          _type: "span",
          _key: key(),
          text: "👉 Agenda tu sesión inicial (45 minutos, sin costo)",
          marks: [annKey, "strong"],
        },
      ],
    });
    agendaConverted = true;
    continue;
  }

  newBody.push(block);
}

console.log(`   ✓ CTA Agenda convertido: ${agendaConverted ? "sí" : "NO"}`);
console.log(`   ✓ CTA WhatsApp convertido: ${waConverted ? "sí" : "NO"}`);
console.log(`   ✓ Body blocks: ${doc.body.length} → ${newBody.length}`);

// ============================================================
// 4) Construir mutación final (author + body + publish)
// ============================================================
const now = new Date().toISOString();
const publishedAt = doc.publishedAt || now;

console.log("\n📋 Cambios a aplicar:");
console.log(`   • author = ${iria._id}`);
console.log(`   • body: ${newBody.length} blocks (con CTA WhatsApp custom)`);
console.log(`   • draft = false`);
console.log(`   • publishedAt = ${publishedAt}`);
console.log(`   • updatedAt = ${now}`);

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply para ejecutar.");
  process.exit(0);
}

// ============================================================
// 5) Aplicar
// ============================================================
console.log("\n🟢 Aplicando cambios + publicando...");
await mutate([
  {
    patch: {
      id: ID,
      set: {
        author: { _type: "reference", _ref: iria._id },
        body: newBody,
        draft: false,
        publishedAt,
        updatedAt: now,
        lastReviewed: now.slice(0, 10),
      },
    },
  },
]);
console.log("   ✓ Patch aplicado. Doc publicado.");

// ============================================================
// 6) Revalidate
// ============================================================
if (REVALIDATE_SECRET) {
  console.log("\n🔄 Disparando revalidate de /blog/...");
  const slug = "como-dejar-dinero-hijo-autismo-discapacidad-mexico";
  const url = `${SITE_URL}/api/revalidate?path=/blog/${slug}&secret=${encodeURIComponent(REVALIDATE_SECRET)}`;
  try {
    const r = await fetch(url, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.revalidated) {
      console.log(`   ✓ Revalidate OK`);
    } else {
      console.log(`   ⚠️  Revalidate respondió ${r.status} · ${JSON.stringify(j)}`);
      console.log("   Producción debería actualizarse en ~30s vía ISR.");
    }
  } catch (e) {
    console.log(`   ⚠️  Revalidate falló: ${e.message}`);
  }
}

console.log(
  `\n✅ LIVE: ${SITE_URL}/blog/como-dejar-dinero-hijo-autismo-discapacidad-mexico`
);
