// draft-push.mjs
//
// Push un draft del repo a Sanity como documento `article` listo para que Iria
// haga la revisión final en Studio y publique con 1 click.
//
// Lee el archivo más reciente de `sanity/seeds/draft-history/<slug>__*.md`,
// lo parsea (extracta TL;DR, Excerpt, Key Takeaways, body con custom blocks,
// disclaimer, sources), convierte el body a Portable Text JSON con los custom
// blocks del schema `article` (keyTakeaways, dataCallout, disclaimer,
// comparisonTable, glossaryReference), y pushea con `createOrReplace` al
// Content Lake manteniendo `draft: true`.
//
// Idempotente: re-correrlo sobrescribe el documento existente con el nuevo
// contenido. NO publica — Iria revisa en Studio y apaga el toggle Draft a mano.
//
// Lee SANITY_API_WRITE_TOKEN de .env.local. Sin token → exit 1.
// Sin `--apply` corre en dry-run (imprime el doc, sin pushear).
//
// Usage:
//   node scripts/draft-push.mjs <slug>                # dry-run
//   node scripts/draft-push.mjs <slug> --apply        # push real
//   node scripts/draft-push.mjs <slug> --file <path>  # archivo específico
//   node scripts/draft-push.mjs <slug> --verbose      # imprime body JSON

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

// ============================================================
// 1. SETUP
// ============================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const envPath = path.join(repoRoot, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("❌ Falta .env.local en", envPath);
  process.exit(1);
}

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

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const PUBLISH = args.includes("--publish");
const VERBOSE = args.includes("--verbose");
const fileFlagIdx = args.indexOf("--file");
const FILE_OVERRIDE = fileFlagIdx >= 0 ? args[fileFlagIdx + 1] : null;
const slug = args.find(
  (a, i) =>
    !a.startsWith("--") && a !== FILE_OVERRIDE && args[i - 1] !== "--file"
);

const REVALIDATE_SECRET = env.REVALIDATE_SECRET;
const SITE_URL =
  env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || "https://iriatalan.com.mx";

if (PUBLISH && !APPLY) {
  console.error("❌ --publish requiere --apply (sin --apply no hace nada).");
  process.exit(1);
}

if (PUBLISH && !REVALIDATE_SECRET) {
  console.error(
    "⚠️  --publish: falta REVALIDATE_SECRET en .env.local. El push procederá con draft:false pero el revalidate fallará y dependerá del ISR (30s) para refrescar producción."
  );
}

if (!slug) {
  console.error(
    "❌ Falta el slug. Uso: node scripts/draft-push.mjs <slug> [--apply]"
  );
  process.exit(1);
}

if (APPLY && !TOKEN) {
  console.error("❌ Falta SANITY_API_WRITE_TOKEN en .env.local");
  console.error(
    "   Crear en: https://sanity.io/manage → IRIA TALAN RIF → API → Tokens (scope Editor)"
  );
  process.exit(1);
}

// ============================================================
// 2. LOCATE & READ DRAFT FILE
// ============================================================

const draftHistoryDir = path.join(repoRoot, "sanity", "seeds", "draft-history");

function resolveDraftFile(slug, override) {
  if (override) {
    const p = path.isAbsolute(override)
      ? override
      : path.join(repoRoot, override);
    if (!fs.existsSync(p)) {
      console.error(`❌ Archivo no encontrado: ${p}`);
      process.exit(1);
    }
    return p;
  }
  const matches = fs
    .readdirSync(draftHistoryDir)
    .filter((f) => f.startsWith(`${slug}__`) && f.endsWith(".md"))
    .sort()
    .reverse();
  if (matches.length === 0) {
    console.error(
      `❌ No hay archivos en draft-history para slug "${slug}". Buscado: ${slug}__*.md`
    );
    process.exit(1);
  }
  return path.join(draftHistoryDir, matches[0]);
}

const draftFile = resolveDraftFile(slug, FILE_OVERRIDE);
const raw = fs.readFileSync(draftFile, "utf8");

console.log(`📄 Draft: ${path.relative(repoRoot, draftFile)}`);

// ============================================================
// 3. KEY GENERATOR
// ============================================================

function key() {
  return crypto.randomBytes(6).toString("hex");
}

// ============================================================
// 4. INLINE MARKS PARSER (bold, italic, links inside paragraphs)
// ============================================================

function parseInlineMarks(text) {
  const children = [];
  const markDefs = [];
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    // Link [text](url)
    const linkMatch = text.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push({ type: "link", text: linkMatch[1], href: linkMatch[2] });
      i += linkMatch[0].length;
      continue;
    }
    // Bold **text**
    if (text.slice(i, i + 2) === "**") {
      const end = text.indexOf("**", i + 2);
      if (end > 0) {
        tokens.push({ type: "strong", text: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    // Italic *text*
    if (text[i] === "*" && text[i + 1] !== "*" && text[i - 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end > 0 && text[end - 1] !== "*" && text[end + 1] !== "*") {
        tokens.push({ type: "em", text: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    // Inline code `text`
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > 0) {
        tokens.push({ type: "code", text: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    // Plain text — acumula hasta próximo marker
    let next = i;
    while (next < text.length) {
      if (text[next] === "[" || text[next] === "*" || text[next] === "`")
        break;
      next++;
    }
    if (next > i) {
      tokens.push({ type: "text", text: text.slice(i, next) });
      i = next;
    } else {
      tokens.push({ type: "text", text: text[i] });
      i++;
    }
  }

  for (const tok of tokens) {
    if (tok.type === "text") {
      children.push({ _type: "span", _key: key(), text: tok.text, marks: [] });
    } else if (tok.type === "strong") {
      children.push({
        _type: "span",
        _key: key(),
        text: tok.text,
        marks: ["strong"],
      });
    } else if (tok.type === "em") {
      children.push({
        _type: "span",
        _key: key(),
        text: tok.text,
        marks: ["em"],
      });
    } else if (tok.type === "code") {
      children.push({
        _type: "span",
        _key: key(),
        text: tok.text,
        marks: ["code"],
      });
    } else if (tok.type === "link") {
      const annKey = key();
      markDefs.push({ _key: annKey, _type: "link", href: tok.href });
      children.push({
        _type: "span",
        _key: key(),
        text: tok.text,
        marks: [annKey],
      });
    }
  }

  return { children, markDefs };
}

function paragraph(text, style = "normal", listItem = null, level = null) {
  const { children, markDefs } = parseInlineMarks(text);
  const block = {
    _type: "block",
    _key: key(),
    style,
    children,
    markDefs,
  };
  if (listItem) block.listItem = listItem;
  if (level) block.level = level;
  return block;
}

// ============================================================
// 5. MARKDOWN → SECTIONS PARSER
// ============================================================

function parseDraft(md) {
  const lines = md.split("\n");
  const out = {
    title: null,
    fields: { slug: null, topic: null, format: null },
    tldr: null,
    excerpt: null,
    keyTakeaways: [],
    body: [],
    disclaimer: null,
    sources: [],
  };

  let mode = "preamble";
  let buffer = [];
  let currentTable = null;

  function flushBuffer() {
    const text = buffer.join("\n").trim();
    buffer = [];
    return text;
  }

  function flushTable() {
    if (!currentTable) return;
    const { headers, rows, caption } = currentTable;
    out.body.push({
      _type: "comparisonTable",
      _key: key(),
      caption: caption || "",
      headers,
      rows: rows.map((cells) => ({
        _key: key(),
        _type: "row",
        cells,
      })),
    });
    currentTable = null;
  }

  function pushParagraph(text, style = "normal") {
    flushTable();
    if (!text.trim()) return;
    out.body.push(paragraph(text.trim(), style));
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("# ") && !out.title) {
      out.title = trimmed.slice(2).trim();
      continue;
    }

    if (trimmed.startsWith("**Slug**:")) {
      const slugMatch = trimmed.match(/\*\*Slug\*\*:\s*`?([^`·\s]+)`?/);
      const topicMatch = trimmed.match(/\*\*Topic\*\*:\s*`?([^`·\s]+)`?/);
      const formatMatch = trimmed.match(/\*\*Format\*\*:\s*`?([^`·\s]+)`?/);
      if (slugMatch) out.fields.slug = slugMatch[1];
      if (topicMatch) out.fields.topic = topicMatch[1];
      if (formatMatch) out.fields.format = formatMatch[1];
      continue;
    }

    if (trimmed === "---") {
      if (mode === "tldr") {
        out.tldr = flushBuffer();
        mode = "preamble";
      } else if (mode === "excerpt") {
        out.excerpt = flushBuffer();
        mode = "preamble";
      } else if (mode === "disclaimer") {
        out.disclaimer = {
          variant: out.disclaimer.variant,
          text: flushBuffer(),
        };
        mode = "preamble";
      } else if (mode === "body") {
        flushTable();
      }
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const heading = trimmed.slice(3).trim();

      if (mode === "tldr") out.tldr = flushBuffer();
      else if (mode === "excerpt") out.excerpt = flushBuffer();
      else if (mode === "disclaimer") {
        out.disclaimer = {
          variant: out.disclaimer.variant,
          text: flushBuffer(),
        };
      }

      if (/^TL;?DR/i.test(heading)) {
        mode = "tldr";
        buffer = [];
        continue;
      }
      if (/^Excerpt/i.test(heading)) {
        mode = "excerpt";
        buffer = [];
        continue;
      }
      if (/Key Takeaways/i.test(heading)) {
        mode = "keytakeaways";
        buffer = [];
        continue;
      }
      if (/Disclaimer/i.test(heading)) {
        let variant = "financiero";
        const variantMatch = heading.match(
          /(financiero|m[eé]dico|legal|gen[eé]rico)/i
        );
        if (variantMatch) {
          variant = variantMatch[1]
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "");
        }
        out.disclaimer = { variant, text: "" };
        mode = "disclaimer";
        buffer = [];
        continue;
      }
      if (/^(Sources|Recursos|Fuentes)/i.test(heading)) {
        flushTable();
        mode = "sources";
        buffer = [];
        continue;
      }
      if (/^JSON metadata/i.test(heading)) {
        mode = "ignore";
        continue;
      }

      flushTable();
      out.body.push(paragraph(heading, "h2"));
      mode = "body";
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushTable();
      if (mode === "tldr") out.tldr = flushBuffer();
      if (mode === "excerpt") out.excerpt = flushBuffer();
      const heading = trimmed.slice(4).trim();
      out.body.push(paragraph(heading, "h3"));
      mode = "body";
      continue;
    }

    if (mode === "ignore") continue;

    if (mode === "tldr" || mode === "excerpt") {
      if (trimmed) buffer.push(trimmed);
      continue;
    }

    if (mode === "keytakeaways") {
      if (/^[-*]\s+/.test(trimmed)) {
        out.keyTakeaways.push(trimmed.replace(/^[-*]\s+/, "").trim());
        continue;
      }
      if (trimmed && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
        mode = "body";
        pushParagraph(trimmed);
      }
      continue;
    }

    if (mode === "disclaimer") {
      if (trimmed) buffer.push(trimmed);
      continue;
    }

    if (mode === "sources") {
      const m = trimmed.match(/^\d+\.\s+(.+)$/);
      if (m) {
        const sourceText = m[1];
        const urlMatch = sourceText.match(/https?:\/\/[^\s)\]]+/);
        const url = urlMatch ? urlMatch[0] : "";
        const publisherMatch = sourceText.match(/^([^—–]+)\s*[—–]/);
        const publisher = publisherMatch ? publisherMatch[1].trim() : "";
        let title = sourceText;
        if (urlMatch) {
          const idxUrl = sourceText.indexOf(urlMatch[0]);
          title = sourceText.slice(0, idxUrl).replace(/\s*[—–]\s*$/, "").trim();
        }
        title = title.replace(/[*`]/g, "").replace(/\s+/g, " ").trim();
        out.sources.push({
          _key: key(),
          _type: "source",
          title: title || sourceText,
          url,
          publisher,
        });
      }
      continue;
    }

    if (mode === "body") {
      // Tabla markdown
      if (/^\|.+\|/.test(trimmed)) {
        if (/^\|[\s:|-]+\|$/.test(trimmed)) continue;
        const cells = trimmed
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
        if (!currentTable) {
          currentTable = { headers: cells, rows: [], caption: "" };
        } else {
          currentTable.rows.push(cells);
        }
        continue;
      } else if (currentTable) {
        flushTable();
      }

      // Blockquote / callout
      if (trimmed.startsWith("> ")) {
        const inner = trimmed.slice(2).trim();
        if (/^📎/.test(inner)) {
          const claim = inner.replace(/^📎\s*/, "").trim();
          out.body.push({
            _type: "dataCallout",
            _key: key(),
            claim,
            sourceName: "Pendiente — completar en Studio",
            publisher: "",
            sourceUrl: "https://example.com/pending",
          });
        } else if (/^📖/.test(inner)) {
          out.body.push(paragraph(inner, "normal"));
        } else {
          out.body.push(paragraph(inner, "blockquote"));
        }
        continue;
      }

      // Lista numerada
      if (/^\d+\.\s+/.test(trimmed)) {
        const txt = trimmed.replace(/^\d+\.\s+/, "");
        flushTable();
        out.body.push(paragraph(txt, "normal", "number", 1));
        continue;
      }

      // Lista bullet
      if (/^[-*]\s+/.test(trimmed)) {
        const txt = trimmed.replace(/^[-*]\s+/, "");
        flushTable();
        out.body.push(paragraph(txt, "normal", "bullet", 1));
        continue;
      }

      // Párrafo normal
      if (trimmed) {
        pushParagraph(trimmed);
      }
      continue;
    }
  }

  if (mode === "tldr") out.tldr = flushBuffer();
  if (mode === "excerpt") out.excerpt = flushBuffer();
  if (mode === "disclaimer") {
    out.disclaimer = { variant: out.disclaimer.variant, text: flushBuffer() };
  }
  flushTable();

  return out;
}

// ============================================================
// 6. BUILD SANITY DOC
// ============================================================

function buildSanityDoc(parsed) {
  const slugVal = parsed.fields.slug || slug;
  const docId = `article-${slugVal}`;

  const body = [];

  if (parsed.keyTakeaways && parsed.keyTakeaways.length > 0) {
    body.push({
      _type: "keyTakeaways",
      _key: key(),
      items: parsed.keyTakeaways,
    });
  }

  body.push(...parsed.body);

  if (parsed.disclaimer && parsed.disclaimer.text) {
    body.push({
      _type: "disclaimer",
      _key: key(),
      variant: parsed.disclaimer.variant || "financiero",
      text: parsed.disclaimer.text,
    });
  }

  const doc = {
    _id: docId,
    _type: "article",
    draft: !PUBLISH,
    title: parsed.title,
    slug: { _type: "slug", current: slugVal },
    topic: parsed.fields.topic,
    format: parsed.fields.format,
    tldr: parsed.tldr,
    excerpt: parsed.excerpt,
    questionsAnswered: extractQuestionsFromBody(parsed.body),
    body,
    sources: parsed.sources,
    lastReviewed: new Date().toISOString().slice(0, 10),
  };

  if (PUBLISH) {
    doc.publishedAt = new Date().toISOString();
    doc.updatedAt = doc.publishedAt;
  }

  return doc;
}

function extractQuestionsFromBody(body) {
  const questions = [];
  for (const block of body) {
    if (block._type === "block" && block.style === "h2") {
      const text = (block.children || [])
        .map((c) => c.text || "")
        .join("");
      if (text.startsWith("¿")) questions.push(text.trim());
    }
  }
  return questions;
}

// ============================================================
// 7. SANITY HTTP MUTATE
// ============================================================

async function mutate(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Mutate failed: ${r.status} ${txt}`);
  }
  return await r.json();
}

// ============================================================
// 8. VALIDATIONS
// ============================================================

function validate(doc) {
  const errors = [];
  if (!doc.title) errors.push("title vacío");
  if (!doc.slug?.current) errors.push("slug.current vacío");
  if (!doc.topic) errors.push("topic vacío");
  if (!doc.format) errors.push("format vacío");
  if (doc.tldr && doc.tldr.length > 320) {
    errors.push(`tldr tiene ${doc.tldr.length} chars (max 320)`);
  }
  if (doc.excerpt && doc.excerpt.length > 160) {
    errors.push(`excerpt tiene ${doc.excerpt.length} chars (max 160)`);
  }
  if (!Array.isArray(doc.body) || doc.body.length === 0) {
    errors.push("body vacío");
  }
  return errors;
}

// ============================================================
// 9. MAIN
// ============================================================

const parsed = parseDraft(raw);
const doc = buildSanityDoc(parsed);
const errors = validate(doc);

console.log("\n📦 Documento que se va a pushear a Sanity:");
console.log("   _id:", doc._id);
console.log("   _type:", doc._type);
console.log("   draft:", doc.draft);
console.log("   title:", doc.title);
console.log("   slug:", doc.slug.current);
console.log("   topic:", doc.topic);
console.log("   format:", doc.format);
console.log("   tldr:", doc.tldr ? `${doc.tldr.length} chars` : "(vacío)");
console.log(
  "   excerpt:",
  doc.excerpt ? `${doc.excerpt.length} chars` : "(vacío)"
);
console.log("   questionsAnswered:", doc.questionsAnswered.length);
console.log("   body blocks:", doc.body.length);
console.log(
  "   keyTakeaways:",
  doc.body[0]?._type === "keyTakeaways" ? doc.body[0].items.length : 0
);
const dataCallouts = doc.body.filter((b) => b._type === "dataCallout").length;
console.log("   dataCallout(s):", dataCallouts);
const tables = doc.body.filter((b) => b._type === "comparisonTable").length;
console.log("   comparisonTable(s):", tables);
const hasDisclaimer = doc.body.some((b) => b._type === "disclaimer");
console.log("   disclaimer:", hasDisclaimer ? "✓" : "(ninguno)");
console.log("   sources:", doc.sources.length);

if (errors.length > 0) {
  console.error("\n❌ Errores de validación:");
  errors.forEach((e) => console.error("  -", e));
  if (APPLY) process.exit(1);
  console.error("   (dry-run continúa para que veas el doc igualmente)");
}

if (!APPLY) {
  console.log("\n🟡 DRY-RUN — corre con `--apply` para pushear a Sanity.");
  if (PUBLISH) {
    console.log(
      "   El doc se publicará con `draft: false` (visible en la web tras revalidate)."
    );
  } else {
    console.log(
      "   El doc se subirá con `draft: true`, listo para revisar en Studio."
    );
  }
  if (VERBOSE) {
    console.log("\n--- BODY (verbose) ---");
    console.log(JSON.stringify(doc.body, null, 2));
  }
  process.exit(0);
}

console.log(
  PUBLISH
    ? "\n🟢 Pusheando + publicando a Sanity (draft:false)..."
    : "\n🟢 Pusheando a Sanity con createOrReplace..."
);
const result = await mutate([{ createOrReplace: doc }]);
console.log("\n✅ Done.");
console.log("   Document ID:", doc._id);

if (PUBLISH) {
  // Trigger revalidate del path público para que producción sirva el contenido nuevo sin esperar ISR (30s)
  if (REVALIDATE_SECRET) {
    const revalidateUrl = `${SITE_URL}/api/revalidate?path=/blog/${doc.slug.current}&secret=${encodeURIComponent(REVALIDATE_SECRET)}`;
    console.log("\n🔄 Disparando revalidate en producción...");
    try {
      const r = await fetch(revalidateUrl, { method: "POST" });
      const json = await r.json().catch(() => ({}));
      if (r.ok && json.revalidated) {
        console.log(`   ✅ Revalidate OK — ${json.now || "sin timestamp"}`);
      } else {
        console.log(
          `   ⚠️  Revalidate respondió ${r.status}. Response: ${JSON.stringify(json)}`
        );
        console.log(
          "   Producción debería actualizarse en ~30s vía ISR de cualquier forma."
        );
      }
    } catch (err) {
      console.log(`   ⚠️  Revalidate falló: ${err.message}`);
      console.log(
        "   Producción debería actualizarse en ~30s vía ISR de cualquier forma."
      );
    }
  }
  console.log(`\n📍 URL pública: ${SITE_URL}/blog/${doc.slug.current}`);
  console.log(
    `\n   Verifica que producción ya sirve el contenido nuevo con:`
  );
  console.log(`   node scripts/draft-verify-live.mjs ${doc.slug.current}`);
  console.log(
    `\n   ⚠️  Si publicaste sin imagen hero/autor en Sanity, complétalos en Studio:`
  );
  console.log(`   https://iriatalan.com.mx/studio/structure/article;${doc._id}`);
} else {
  console.log(
    `   Studio URL: https://iriatalan.com.mx/studio/structure/article;${doc._id}`
  );
  console.log("\n   Próximos pasos en Studio:");
  console.log("   1. Verifica el body — todos los bloques bien estructurados");
  console.log("   2. Selecciona Autor (reference a Iria Talan)");
  console.log("   3. Sube imagen hero con alt text");
  console.log("   4. Revisa Sources — todos con publisher y URL real");
  console.log(
    "   5. Para los dataCallout, completa sourceUrl real (los pendientes están marcados)"
  );
  console.log("   6. Apaga toggle 🔴 Draft → click Publish");
}
