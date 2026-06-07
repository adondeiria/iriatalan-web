// patch-autismo-v6-full-rewrite.mjs
// Reemplaza el body completo, tldr, excerpt con la versión editada por Iria (post v5).
// Parsea el markdown con custom blocks: keyTakeaways, comparisonTable, ctaWhatsApp, disclaimer.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

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
const SITE_URL = env.SITE_URL || "https://iriatalan.com.mx";
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const SLUG = "como-dejar-dinero-hijo-autismo-discapacidad-mexico";
const APPLY = process.argv.includes("--apply");
const MD_FILE = path.join(__dirname, "..", "tmp", "autismo-v6-iria-edits.md");

const key = () => crypto.randomBytes(6).toString("hex");

function parseInlineMarks(text) {
  const children = [];
  const markDefs = [];
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const linkMatch = text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) { tokens.push({ type: "link", text: linkMatch[1], href: linkMatch[2] }); i += linkMatch[0].length; continue; }
    if (text.slice(i, i + 2) === "**") {
      const end = text.indexOf("**", i + 2);
      if (end > 0) { tokens.push({ type: "strong", text: text.slice(i + 2, end) }); i = end + 2; continue; }
    }
    if (text[i] === "*" && text[i + 1] !== "*" && text[i - 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end > 0 && text[end - 1] !== "*" && text[end + 1] !== "*") {
        tokens.push({ type: "em", text: text.slice(i + 1, end) }); i = end + 1; continue;
      }
    }
    let next = i;
    while (next < text.length) {
      if (text[next] === "[" || text[next] === "*") break;
      next++;
    }
    if (next > i) { tokens.push({ type: "text", text: text.slice(i, next) }); i = next; } else { tokens.push({ type: "text", text: text[i] }); i++; }
  }
  for (const tok of tokens) {
    if (tok.type === "text") children.push({ _type: "span", _key: key(), text: tok.text, marks: [] });
    else if (tok.type === "strong") children.push({ _type: "span", _key: key(), text: tok.text, marks: ["strong"] });
    else if (tok.type === "em") children.push({ _type: "span", _key: key(), text: tok.text, marks: ["em"] });
    else if (tok.type === "link") {
      const annKey = key();
      markDefs.push({ _key: annKey, _type: "link", href: tok.href });
      children.push({ _type: "span", _key: key(), text: tok.text, marks: [annKey] });
    }
  }
  return { children, markDefs };
}

function paragraph(text, style = "normal", listItem = null, level = null) {
  const { children, markDefs } = parseInlineMarks(text);
  const block = { _type: "block", _key: key(), style, children, markDefs };
  if (listItem) { block.listItem = listItem; block.level = level || 1; }
  return block;
}

function parseDraft(md) {
  const lines = md.split("\n");
  const out = { title: null, tldr: null, excerpt: null, keyTakeaways: [], body: [], disclaimer: null };
  let mode = "preamble";
  let buffer = [];
  let currentTable = null;
  let currentCTA = null;

  function flushBuffer() { const t = buffer.join("\n").trim(); buffer = []; return t; }
  function flushTable() {
    if (!currentTable) return;
    const { headers, rows } = currentTable;
    out.body.push({
      _type: "comparisonTable", _key: key(), caption: currentTable.caption || "",
      headers, rows: rows.map((cells) => ({ _key: key(), _type: "row", cells })),
    });
    currentTable = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("# ") && !out.title) { out.title = trimmed.slice(2).trim(); continue; }
    if (trimmed.startsWith("**Slug**:")) continue;
    if (trimmed === "---") { if (mode === "tldr") { out.tldr = flushBuffer(); mode = "preamble"; } else if (mode === "excerpt") { out.excerpt = flushBuffer(); mode = "preamble"; } else if (mode === "body") flushTable(); continue; }

    // CTA WhatsApp block
    if (trimmed === "[CTAWHATSAPP]") { currentCTA = { heading: "", text: "", buttonLabel: "", preFilledMessage: "" }; flushTable(); continue; }
    if (trimmed === "[/CTAWHATSAPP]") {
      if (currentCTA) {
        out.body.push({ _type: "ctaWhatsApp", _key: key(), heading: currentCTA.heading, text: currentCTA.text, buttonLabel: currentCTA.buttonLabel, preFilledMessage: currentCTA.preFilledMessage });
        currentCTA = null;
      }
      continue;
    }
    if (currentCTA) {
      if (/^Heading:/i.test(trimmed)) currentCTA.heading = trimmed.replace(/^Heading:\s*/i, "");
      else if (/^Texto:/i.test(trimmed)) currentCTA.text = trimmed.replace(/^Texto:\s*/i, "");
      else if (/^Botón:/i.test(trimmed)) currentCTA.buttonLabel = trimmed.replace(/^Botón:\s*/i, "");
      else if (/^Mensaje pre-llenado:/i.test(trimmed)) currentCTA.preFilledMessage = trimmed.replace(/^Mensaje pre-llenado:\s*/i, "");
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushTable();
      const heading = trimmed.slice(3).trim();
      if (mode === "tldr") out.tldr = flushBuffer();
      else if (mode === "excerpt") out.excerpt = flushBuffer();
      if (/^TL;?DR$/i.test(heading)) { mode = "tldr"; buffer = []; continue; }
      if (/^Excerpt$/i.test(heading)) { mode = "excerpt"; buffer = []; continue; }
      if (/Key Takeaways/i.test(heading)) { mode = "keytakeaways"; buffer = []; continue; }
      if (/^Disclaimer/i.test(heading)) {
        let variant = "financiero";
        const m = heading.match(/(financiero|m[eé]dico|legal|gen[eé]rico)/i);
        if (m) variant = m[1].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
        out.disclaimer = { variant, text: "" };
        mode = "disclaimer"; buffer = []; continue;
      }
      out.body.push(paragraph(heading, "h2"));
      mode = "body";
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushTable();
      const heading = trimmed.slice(4).trim();
      if (/Key Takeaways/i.test(heading)) { mode = "keytakeaways"; buffer = []; continue; }
      out.body.push(paragraph(heading, "h3"));
      mode = "body";
      continue;
    }

    if (mode === "tldr" || mode === "excerpt" || mode === "disclaimer") {
      if (trimmed) buffer.push(trimmed);
      continue;
    }

    if (mode === "keytakeaways") {
      if (/^[-*]\s+/.test(trimmed)) { out.keyTakeaways.push(trimmed.replace(/^[-*]\s+/, "").trim()); continue; }
      if (trimmed && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
        mode = "body";
        if (trimmed) out.body.push(paragraph(trimmed));
      }
      continue;
    }

    if (mode === "body" || mode === "preamble") {
      if (/^\|.+\|/.test(trimmed)) {
        if (/^\|[\s:|-]+\|$/.test(trimmed)) continue;
        const cells = trimmed.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        if (!currentTable) currentTable = { headers: cells, rows: [], caption: "" };
        else currentTable.rows.push(cells);
        continue;
      } else if (currentTable) {
        flushTable();
      }

      if (trimmed.startsWith("> ")) { out.body.push(paragraph(trimmed.slice(2).trim(), "blockquote")); continue; }
      if (/^\d+\.\s+/.test(trimmed)) { out.body.push(paragraph(trimmed.replace(/^\d+\.\s+/, ""), "normal", "number", 1)); continue; }
      if (/^[-*]\s+/.test(trimmed)) { out.body.push(paragraph(trimmed.replace(/^[-*]\s+/, ""), "normal", "bullet", 1)); continue; }
      if (trimmed) out.body.push(paragraph(trimmed));
    }
  }

  if (mode === "tldr") out.tldr = flushBuffer();
  if (mode === "excerpt") out.excerpt = flushBuffer();
  if (mode === "disclaimer") out.disclaimer = { variant: out.disclaimer.variant, text: flushBuffer() };
  flushTable();

  return out;
}

async function query(q) {
  const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`Query ${r.status}: ${await r.text()}`);
  return (await r.json()).result;
}
async function mutate(mutations) {
  const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate ${r.status}: ${await r.text()}`);
  return await r.json();
}

if (!TOKEN) { console.error("❌ Falta SANITY_API_WRITE_TOKEN"); process.exit(1); }
if (!fs.existsSync(MD_FILE)) { console.error("❌ No existe", MD_FILE); process.exit(1); }

console.log("🔍 Parseando markdown...");
const md = fs.readFileSync(MD_FILE, "utf8");
const parsed = parseDraft(md);

// Construir body completo
const body = [];
if (parsed.keyTakeaways.length > 0) body.push({ _type: "keyTakeaways", _key: key(), items: parsed.keyTakeaways });
body.push(...parsed.body);
if (parsed.disclaimer && parsed.disclaimer.text) {
  body.push({ _type: "disclaimer", _key: key(), variant: parsed.disclaimer.variant, text: parsed.disclaimer.text });
}

// Extraer questionsAnswered
const newQA = [];
for (const block of body) {
  if (block._type === "block" && block.style === "h2") {
    const text = (block.children || []).map((c) => c.text || "").join("").trim();
    if (text.startsWith("¿")) newQA.push(text);
  }
}

console.log(`   ✓ Title: ${parsed.title}`);
console.log(`   ✓ TL;DR: ${parsed.tldr.length} chars (max 320) ${parsed.tldr.length > 320 ? "❌" : "✓"}`);
console.log(`   ✓ Excerpt: ${parsed.excerpt.length} chars (max 160) ${parsed.excerpt.length > 160 ? "❌" : "✓"}`);
console.log(`   ✓ Key Takeaways: ${parsed.keyTakeaways.length}`);
console.log(`   ✓ Body blocks: ${body.length}`);
console.log(`   ✓ Tables: ${body.filter((b) => b._type === "comparisonTable").length}`);
console.log(`   ✓ CTAs WhatsApp: ${body.filter((b) => b._type === "ctaWhatsApp").length}`);
console.log(`   ✓ Disclaimers: ${body.filter((b) => b._type === "disclaimer").length}`);
console.log(`   ✓ questionsAnswered: ${newQA.length}`);

if (parsed.tldr.length > 320 || parsed.excerpt.length > 160 || newQA.length < 3 || body.length < 50) {
  console.error("❌ Validación falló. Abortando.");
  process.exit(1);
}

const now = new Date().toISOString();

if (!APPLY) {
  console.log("\n🟡 DRY-RUN. Corre con --apply.");
  process.exit(0);
}

console.log("\n🟢 Aplicando...");
await mutate([{
  patch: {
    id: ID,
    set: {
      body,
      tldr: parsed.tldr,
      excerpt: parsed.excerpt,
      questionsAnswered: newQA,
      updatedAt: now,
      lastReviewed: now.slice(0, 10),
    },
  },
}]);
console.log("   ✓ Artículo actualizado.");
console.log(`   ℹ️  ISR refresca en ~30s.`);
console.log(`\n✅ ${SITE_URL}/blog/${SLUG}`);
