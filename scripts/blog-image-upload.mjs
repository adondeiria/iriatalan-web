// blog-image-upload.mjs
//
// Sube la imagen hero (y opcionalmente inline) del blog a Sanity Content Lake,
// patchea el documento article con la referencia del asset, y revalida producción.
//
// Resuelve el gap del pipeline: draft-push.mjs NO sube assets, solo el cuerpo.
//
// Lee paths locales de blog-pipeline-state.json campo imageAsset.{hero,inline}.localPath.
// Lee SANITY_API_WRITE_TOKEN y REVALIDATE_SECRET de .env.local.
//
// Usage:
//   node scripts/blog-image-upload.mjs <slug>
//   node scripts/blog-image-upload.mjs <slug> --hero-only
//   node scripts/blog-image-upload.mjs <slug> --no-revalidate

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const envPath = path.join(repoRoot, ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      const key = l.slice(0, idx).replace(/^﻿/, "").trim();
      const val = l
        .slice(idx + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      return [key, val];
    })
);

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
const SITE_URL = env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || "https://iriatalan.com.mx";

if (!TOKEN) {
  console.error("Falta SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

const args = process.argv.slice(2);
const HERO_ONLY = args.includes("--hero-only");
const NO_REVALIDATE = args.includes("--no-revalidate");
const slug = args.find((a) => !a.startsWith("--"));

if (!slug) {
  console.error("Falta slug. Uso: node scripts/blog-image-upload.mjs <slug>");
  process.exit(1);
}

const statePath = path.join(repoRoot, "sanity", "seeds", "blog-pipeline-state.json");
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const blog = state.blogs.find((b) => b.slug === slug);

if (!blog) {
  console.error(`Slug "${slug}" no esta en blog-pipeline-state.json`);
  process.exit(1);
}

if (!blog.imageAsset?.hero?.localPath) {
  console.error(`No hay imageAsset.hero.localPath para "${slug}"`);
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

async function uploadImage(localPath, label) {
  const fullPath = path.isAbsolute(localPath)
    ? localPath
    : path.join(repoRoot, localPath);

  if (!fs.existsSync(fullPath)) {
    console.error(`Archivo no existe: ${fullPath}`);
    process.exit(1);
  }

  const sizeKb = (fs.statSync(fullPath).size / 1024).toFixed(1);
  console.log(`Subiendo ${label}: ${path.basename(fullPath)} (${sizeKb} KB)`);

  const stream = fs.createReadStream(fullPath);
  const asset = await client.assets.upload("image", stream, {
    filename: path.basename(fullPath),
  });

  console.log(`   Asset ID: ${asset._id}`);
  return asset;
}

async function main() {
  const docId = `article-${slug}`;
  console.log(`\nDocument: ${docId}`);

  // 1. Upload hero
  const heroAsset = await uploadImage(blog.imageAsset.hero.localPath, "hero");

  // 2. Optionally upload inline
  let inlineAsset = null;
  if (!HERO_ONLY && blog.imageAsset?.inline?.localPath) {
    inlineAsset = await uploadImage(blog.imageAsset.inline.localPath, "inline");
  }

  // 3. Patch document with heroImage
  console.log(`\nPatcheando documento con heroImage...`);
  const patch = {
    heroImage: {
      _type: "image",
      asset: {
        _ref: heroAsset._id,
        _type: "reference",
      },
    },
  };

  const result = await client.patch(docId).set(patch).commit();
  console.log(`   Document patched. Revision: ${result._rev}`);

  // 4. Revalidate
  if (!NO_REVALIDATE && REVALIDATE_SECRET) {
    console.log(`\nDisparando revalidate...`);
    const url = new URL("/api/revalidate", SITE_URL);
    url.searchParams.set("secret", REVALIDATE_SECRET);
    url.searchParams.set("path", `/blog/${slug}`);
    const res = await fetch(url.toString(), { method: "POST" });
    const data = await res.json();
    if (data.revalidated) {
      console.log(`   Revalidate OK - ${data.now}`);
    } else {
      console.log(`   Revalidate respondio: ${JSON.stringify(data)}`);
    }
  }

  console.log(`\nURL: ${SITE_URL}/blog/${slug}`);
  console.log(`\nAsset refs:`);
  console.log(`  hero:   ${heroAsset._id}`);
  if (inlineAsset) console.log(`  inline: ${inlineAsset._id}  (en Sanity, no auto-linkeado en body)`);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
