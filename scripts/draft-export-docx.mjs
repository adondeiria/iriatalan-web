// draft-export-docx.mjs
//
// Convierte el draft markdown más reciente de un slug en un archivo .docx listo
// para que Iria revise fuera del chat (Word, Pages, Google Docs, LibreOffice).
//
// Resalta:
//   - Claims con datos numéricos sin fuente clara → AMARILLO
//   - dataCallout pendientes → ROJO
//   - Placeholders [VERIFICAR_CIFRA], [FUENTE_PENDIENTE] → ROJO
//   - Disclaimer → fondo GRIS
//
// Requiere `docx` npm package. Si no está instalado:
//   npm install docx --save-dev
//
// Usage:
//   node scripts/draft-export-docx.mjs <slug>
//   node scripts/draft-export-docx.mjs <slug> --file <path>
//   node scripts/draft-export-docx.mjs <slug> --out <path>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

let docxLib;
try {
  docxLib = await import("docx");
} catch (err) {
  console.error("❌ Falta instalar la librería `docx`. Corre:");
  console.error("   npm install docx --save-dev");
  console.error("");
  console.error("Después reintenta este script.");
  process.exit(1);
}

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ShadingType,
} = docxLib;

// ============================================================
// 1. ARGS
// ============================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const args = process.argv.slice(2);
const fileFlagIdx = args.indexOf("--file");
const outFlagIdx = args.indexOf("--out");
const FILE_OVERRIDE = fileFlagIdx >= 0 ? args[fileFlagIdx + 1] : null;
const OUT_OVERRIDE = outFlagIdx >= 0 ? args[outFlagIdx + 1] : null;
const slug = args.find((a, i) => {
  if (a.startsWith("--")) return false;
  if (a === FILE_OVERRIDE || a === OUT_OVERRIDE) return false;
  if (args[i - 1] === "--file" || args[i - 1] === "--out") return false;
  return true;
});

if (!slug) {
  console.error(
    "❌ Falta el slug. Uso: node scripts/draft-export-docx.mjs <slug>"
  );
  process.exit(1);
}

// ============================================================
// 2. LOCATE DRAFT FILE
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
console.log(`📄 Source: ${path.relative(repoRoot, draftFile)}`);

// ============================================================
// 3. PARSE MARKDOWN → BLOCKS WITH HIGHLIGHTING METADATA
// ============================================================

const RED_PATTERNS = [
  /\[VERIFICAR_CIFRA\]/g,
  /\[FUENTE_PENDIENTE\]/g,
  /\[TODO[: ]/g,
];
const YELLOW_HINT_PATTERNS = [
  /\b\d{1,3}(?:[.,]\d+)?\s*(?:%|MXN|USD|UMA|salarios m[ií]nimos|veces)/gi,
];

function highlightRuns(text) {
  const runs = [];
  let cursor = 0;

  const hits = [];
  for (const re of RED_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      hits.push({ start: m.index, end: m.index + m[0].length, type: "red" });
    }
  }
  for (const re of YELLOW_HINT_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      hits.push({
        start: m.index,
        end: m.index + m[0].length,
        type: "yellow",
      });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const h of hits) {
    const last = merged[merged.length - 1];
    if (last && h.start < last.end) {
      if (h.type === "red") {
        last.type = "red";
        last.end = Math.max(last.end, h.end);
      } else {
        last.end = Math.max(last.end, h.end);
      }
    } else {
      merged.push({ ...h });
    }
  }

  for (const h of merged) {
    if (h.start > cursor) {
      runs.push(new TextRun({ text: text.slice(cursor, h.start) }));
    }
    runs.push(
      new TextRun({
        text: text.slice(h.start, h.end),
        highlight: h.type,
        bold: h.type === "red",
      })
    );
    cursor = h.end;
  }
  if (cursor < text.length) {
    runs.push(new TextRun({ text: text.slice(cursor) }));
  }
  if (runs.length === 0) {
    runs.push(new TextRun({ text }));
  }
  return runs;
}

function parseDraft(md) {
  const lines = md.split("\n");
  const blocks = [];
  let titleSet = false;
  let mode = "preamble";
  let buffer = [];
  let disclaimerVariant = null;

  function flushBuffer(asType = "paragraph") {
    const text = buffer.join(" ").trim();
    buffer = [];
    if (!text) return;
    if (asType === "tldr") {
      blocks.push({ kind: "tldr", text });
    } else if (asType === "excerpt") {
      blocks.push({ kind: "excerpt", text });
    } else if (asType === "disclaimer") {
      blocks.push({ kind: "disclaimer", variant: disclaimerVariant, text });
    } else {
      blocks.push({ kind: "paragraph", text });
    }
  }

  for (const lineRaw of lines) {
    const trimmed = lineRaw.trim();

    if (trimmed.startsWith("# ") && !titleSet) {
      blocks.push({ kind: "h1", text: trimmed.slice(2).trim() });
      titleSet = true;
      continue;
    }

    if (trimmed.startsWith("**Slug**:")) {
      blocks.push({ kind: "metadata", text: trimmed });
      continue;
    }

    if (trimmed === "---") {
      if (mode === "tldr") flushBuffer("tldr");
      else if (mode === "excerpt") flushBuffer("excerpt");
      else if (mode === "disclaimer") flushBuffer("disclaimer");
      else flushBuffer();
      mode = "preamble";
      continue;
    }

    if (trimmed.startsWith("## ")) {
      if (mode === "tldr") flushBuffer("tldr");
      else if (mode === "excerpt") flushBuffer("excerpt");
      else if (mode === "disclaimer") flushBuffer("disclaimer");
      else flushBuffer();

      const heading = trimmed.slice(3).trim();
      if (/^TL;?DR/i.test(heading)) {
        mode = "tldr";
        continue;
      }
      if (/^Excerpt/i.test(heading)) {
        mode = "excerpt";
        continue;
      }
      if (/Disclaimer/i.test(heading)) {
        const m = heading.match(/(financiero|m[eé]dico|legal|gen[eé]rico)/i);
        disclaimerVariant = m
          ? m[1]
              .toLowerCase()
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
          : "financiero";
        mode = "disclaimer";
        continue;
      }
      blocks.push({ kind: "h2", text: heading });
      mode = "body";
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushBuffer();
      blocks.push({ kind: "h3", text: trimmed.slice(4).trim() });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      flushBuffer();
      const inner = trimmed.slice(2).trim();
      if (/^📎/.test(inner)) {
        blocks.push({
          kind: "callout-data",
          text: inner.replace(/^📎\s*/, "").trim(),
        });
      } else {
        blocks.push({ kind: "blockquote", text: inner });
      }
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ kind: "bullet", text: trimmed.replace(/^[-*]\s+/, "") });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push({ kind: "numbered", text: trimmed.replace(/^\d+\.\s+/, "") });
      continue;
    }

    if (mode === "tldr" || mode === "excerpt" || mode === "disclaimer") {
      if (trimmed) buffer.push(trimmed);
      continue;
    }

    if (trimmed) {
      buffer.push(trimmed);
    } else {
      flushBuffer();
    }
  }
  if (mode === "tldr") flushBuffer("tldr");
  else if (mode === "excerpt") flushBuffer("excerpt");
  else if (mode === "disclaimer") flushBuffer("disclaimer");
  else flushBuffer();

  return blocks;
}

// ============================================================
// 4. BUILD DOCX
// ============================================================

function buildDocx(blocks) {
  const children = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: "Borrador para revisión", italics: true })],
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Slug: ${slug} · Exportado: ${new Date().toISOString().slice(0, 10)}`,
          color: "888888",
        }),
      ],
    })
  );
  children.push(new Paragraph({ children: [new TextRun("")] }));

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Leyenda de resaltado: ", bold: true }),
        new TextRun({ text: "ROJO ", highlight: "red", bold: true }),
        new TextRun({ text: "= placeholder o fuente pendiente · " }),
        new TextRun({ text: "AMARILLO ", highlight: "yellow" }),
        new TextRun({ text: "= cifra que conviene fact-check humano." }),
      ],
    })
  );
  children.push(new Paragraph({ children: [new TextRun("")] }));

  for (const b of blocks) {
    if (b.kind === "h1") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.TITLE,
          children: [new TextRun({ text: b.text, bold: true })],
        })
      );
    } else if (b.kind === "metadata") {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: b.text, color: "888888", size: 18 })],
        })
      );
    } else if (b.kind === "h2") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: highlightRuns(b.text),
        })
      );
    } else if (b.kind === "h3") {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: highlightRuns(b.text),
        })
      );
    } else if (b.kind === "tldr") {
      children.push(
        new Paragraph({
          shading: {
            type: ShadingType.CLEAR,
            color: "auto",
            fill: "EAF4FB",
          },
          children: [
            new TextRun({ text: "TL;DR — ", bold: true }),
            ...highlightRuns(b.text),
          ],
        })
      );
    } else if (b.kind === "excerpt") {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Excerpt: ", bold: true, italics: true }),
            new TextRun({ text: b.text, italics: true }),
          ],
        })
      );
    } else if (b.kind === "disclaimer") {
      children.push(
        new Paragraph({
          shading: {
            type: ShadingType.CLEAR,
            color: "auto",
            fill: "F0F0F0",
          },
          children: [
            new TextRun({
              text: `⚠ Disclaimer (${b.variant || "financiero"}) — `,
              bold: true,
            }),
            ...highlightRuns(b.text),
          ],
        })
      );
    } else if (b.kind === "callout-data") {
      children.push(
        new Paragraph({
          shading: {
            type: ShadingType.CLEAR,
            color: "auto",
            fill: "FFE4E1",
          },
          children: [
            new TextRun({
              text: "📎 dataCallout (pendiente fuente) — ",
              bold: true,
              highlight: "red",
            }),
            ...highlightRuns(b.text),
          ],
        })
      );
    } else if (b.kind === "blockquote") {
      children.push(
        new Paragraph({
          shading: {
            type: ShadingType.CLEAR,
            color: "auto",
            fill: "F8F8F8",
          },
          children: highlightRuns(b.text),
        })
      );
    } else if (b.kind === "bullet") {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: highlightRuns(b.text),
        })
      );
    } else if (b.kind === "numbered") {
      children.push(
        new Paragraph({
          numbering: { reference: "default-numbering", level: 0 },
          children: highlightRuns(b.text),
        })
      );
    } else if (b.kind === "paragraph") {
      children.push(
        new Paragraph({
          children: highlightRuns(b.text),
        })
      );
    }
  }

  children.push(new Paragraph({ children: [new TextRun("")] }));
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "Cómo devolver tus correcciones:", bold: true })],
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun(
          "1. Acepta tus Track Changes (Word → Revisar → Aceptar todos)."
        ),
      ],
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun("2. Copia TODO el contenido del documento.")],
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun(
          `3. En Claude Code, corre: /blog-apply-edits ${slug} y pega el texto en el siguiente mensaje.`
        ),
      ],
    })
  );

  return new Document({
    creator: "iriatalan-blog-conductor",
    title: `Borrador ${slug}`,
    description: "Generado para revisión humana fuera de Claude Code.",
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

// ============================================================
// 5. WRITE FILE
// ============================================================

const blocks = parseDraft(raw);
const doc = buildDocx(blocks);

const outDir = path.join(repoRoot, "borradores");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = OUT_OVERRIDE
  ? path.isAbsolute(OUT_OVERRIDE)
    ? OUT_OVERRIDE
    : path.join(repoRoot, OUT_OVERRIDE)
  : path.join(outDir, `${slug}.docx`);

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outPath, buffer);

console.log(`✅ Word generado: ${path.relative(repoRoot, outPath)}`);
console.log(`   Bloques procesados: ${blocks.length}`);
console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`);
console.log("");
console.log(
  `   Próximo paso: abre el archivo, marca cambios, y vuelve a Claude con \`/blog-apply-edits ${slug}\`.`
);
