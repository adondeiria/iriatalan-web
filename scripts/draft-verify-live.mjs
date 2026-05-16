// draft-verify-live.mjs
//
// Verifica que producción (iriatalan.com.mx) está sirviendo el contenido nuevo
// de un artículo recién publicado. Lo invoca `iriatalan-blog-conductor` después
// de `/blog-publish` para cerrar el loop. Iria también puede correrlo manual.
//
// Flow:
//   1. Lee el draft markdown más reciente del slug en draft-history/.
//   2. Extrae 3-5 "markers únicos" — fragmentos de texto largos (60-200 chars)
//      que no son ni headings ni listas. Son frases narrativas inconfundibles.
//   3. Fetch GET https://iriatalan.com.mx/blog/<slug> con Cache-Control: no-cache.
//   4. Busca cada marker en el HTML.
//   5. Reporta cuántos encontró. Exit code 0 si TODOS aparecen, 1 si alguno falta.
//
// Usage:
//   node scripts/draft-verify-live.mjs <slug>
//   node scripts/draft-verify-live.mjs <slug> --file <path>
//   node scripts/draft-verify-live.mjs <slug> --url <url-override>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

// Leer .env.local para SITE_URL
const envPath = path.join(repoRoot, ".env.local");
const env = fs.existsSync(envPath)
  ? Object.fromEntries(
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
    )
  : {};

const SITE_URL =
  env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || "https://iriatalan.com.mx";

const args = process.argv.slice(2);
const fileFlagIdx = args.indexOf("--file");
const urlFlagIdx = args.indexOf("--url");
const FILE_OVERRIDE = fileFlagIdx >= 0 ? args[fileFlagIdx + 1] : null;
const URL_OVERRIDE = urlFlagIdx >= 0 ? args[urlFlagIdx + 1] : null;
const slug = args.find((a, i) => {
  if (a.startsWith("--")) return false;
  if (a === FILE_OVERRIDE || a === URL_OVERRIDE) return false;
  if (args[i - 1] === "--file" || args[i - 1] === "--url") return false;
  return true;
});

if (!slug) {
  console.error("❌ Falta el slug. Uso: node scripts/draft-verify-live.mjs <slug>");
  process.exit(1);
}

// ============================================================
// 1. Locate draft file
// ============================================================

const draftHistoryDir = path.join(repoRoot, "sanity", "seeds", "draft-history");

function resolveDraftFile(slug, override) {
  if (override) {
    return path.isAbsolute(override) ? override : path.join(repoRoot, override);
  }
  const matches = fs
    .readdirSync(draftHistoryDir)
    .filter((f) => f.startsWith(`${slug}__`) && f.endsWith(".md"))
    .sort()
    .reverse();
  if (matches.length === 0) {
    console.error(`❌ No hay draft archivado para "${slug}".`);
    process.exit(1);
  }
  return path.join(draftHistoryDir, matches[0]);
}

const draftFile = resolveDraftFile(slug, FILE_OVERRIDE);
const raw = fs.readFileSync(draftFile, "utf8");
console.log(`📄 Draft: ${path.relative(repoRoot, draftFile)}`);

// ============================================================
// 2. Extract markers
// ============================================================

function extractMarkers(md) {
  const lines = md.split("\n");
  const candidates = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#")) continue;
    if (t.startsWith("-") || t.startsWith("*")) continue;
    if (t.startsWith(">")) continue;
    if (t.startsWith("|")) continue;
    if (
      t.startsWith("**Slug**") ||
      t.startsWith("**Topic**") ||
      t.startsWith("**Format**")
    )
      continue;
    if (t.startsWith("```")) continue;
    if (t === "---") continue;
    const stripped = t
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
    if (stripped.length < 60 || stripped.length > 200) continue;
    if (/\[VERIFICAR_CIFRA\]|\[FUENTE_PENDIENTE\]|\[TODO/.test(stripped))
      continue;
    candidates.push(stripped);
  }
  if (candidates.length === 0) return [];
  const picks = [];
  const step = Math.max(1, Math.floor(candidates.length / 5));
  for (let i = 0; i < candidates.length && picks.length < 5; i += step) {
    picks.push(candidates[i]);
  }
  while (picks.length < 3 && picks.length < candidates.length) {
    picks.push(candidates[picks.length]);
  }
  return picks;
}

const markers = extractMarkers(raw);

if (markers.length === 0) {
  console.error(
    "❌ No pude extraer markers del draft (puede ser muy corto o solo headings/listas)."
  );
  process.exit(1);
}

console.log(`🔍 Markers a verificar (${markers.length}):`);
markers.forEach((m, i) => {
  const preview = m.length > 80 ? m.slice(0, 77) + "..." : m;
  console.log(`   ${i + 1}. ${preview}`);
});

// ============================================================
// 3. Fetch production
// ============================================================

const url = URL_OVERRIDE || `${SITE_URL}/blog/${slug}`;
console.log(`\n🌐 Fetching: ${url}`);

let html;
try {
  const r = await fetch(url, {
    method: "GET",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    cache: "no-store",
  });
  if (!r.ok) {
    console.error(`❌ HTTP ${r.status} — la página no respondió OK.`);
    process.exit(1);
  }
  html = await r.text();
  console.log(`   ✅ HTML recibido (${(html.length / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error(`❌ Fetch falló: ${err.message}`);
  process.exit(1);
}

// ============================================================
// 4. Check markers
// ============================================================

const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, " ")
  .trim();

console.log("\n📊 Resultados:");
let found = 0;
const results = [];
for (let i = 0; i < markers.length; i++) {
  const m = markers[i];
  const mNorm = m.replace(/\s+/g, " ").trim();
  const ok = text.includes(mNorm);
  const status = ok ? "✅" : "❌";
  const preview = mNorm.length > 60 ? mNorm.slice(0, 57) + "..." : mNorm;
  console.log(`   ${status} marker ${i + 1}: ${preview}`);
  results.push({ marker: m, found: ok });
  if (ok) found++;
}

console.log(`\n${found}/${markers.length} markers encontrados en producción.`);

if (found === markers.length) {
  console.log(`✅ Producción está sirviendo el contenido nuevo de "${slug}".`);
  process.exit(0);
} else {
  console.log(
    `⚠️  Producción aún NO sirve el contenido nuevo (o el draft difiere mucho del live).`
  );
  console.log(
    "   Posibles causas: ISR aún no propagó (espera 30-60s), CDN cache, o el draft no se publicó."
  );
  process.exit(1);
}
