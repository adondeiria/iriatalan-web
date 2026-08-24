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
// Idempotente: re-correrlo actualiza el contenido del documento existente.
// NO publica — Iria revisa en Studio y apaga el toggle Draft a mano.
//
// IMPORTANTE — el push es `createOrReplace`, que reemplaza el documento
// ENTERO. Por eso, antes de mutar, se lee el doc que ya vive en Sanity y se
// fusionan los campos que solo existen en Studio (autor, hero, SEO, faqs,
// relatedArticles) más la fecha de publicación original. Sin ese merge, cada
// re-push dejaba el artículo sin autor ni imagen y le borraba `publishedAt`,
// que es justo lo que lo saca del índice del blog y del sitemap.
// Un artículo ya publicado tampoco se regresa a borrador al empujarle
// contenido: para eso está `--force-draft`.
//
// Lee SANITY_API_WRITE_TOKEN de .env.local. Sin token → exit 1.
// Sin `--apply` corre en dry-run (imprime el doc y el merge, sin pushear).
//
// Usage:
//   node scripts/draft-push.mjs <slug>                 # dry-run
//   node scripts/draft-push.mjs <slug> --apply         # push real
//   node scripts/draft-push.mjs <slug> --apply --publish  # push + publicar
//   node scripts/draft-push.mjs <slug> --file <path>   # archivo específico
//   node scripts/draft-push.mjs <slug> --verbose       # imprime body JSON
//   node scripts/draft-push.mjs <slug> --apply --force-draft  # regresar a borrador

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
    }),
);

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const PUBLISH = args.includes("--publish");
const VERBOSE = args.includes("--verbose");
// Regresa a borrador un artículo que ya estaba publicado. Por defecto NO se
// hace: un push de contenido a un artículo vivo lo actualiza, no lo baja.
const FORCE_DRAFT = args.includes("--force-draft");
const fileFlagIdx = args.indexOf("--file");
const FILE_OVERRIDE = fileFlagIdx >= 0 ? args[fileFlagIdx + 1] : null;
const slug = args.find(
  (a, i) =>
    !a.startsWith("--") && a !== FILE_OVERRIDE && args[i - 1] !== "--file",
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
    "⚠️  --publish: falta REVALIDATE_SECRET en .env.local. El push procederá con draft:false pero el revalidate fallará y dependerá del ISR (30s) para refrescar producción.",
  );
}

if (!slug) {
  console.error(
    "❌ Falta el slug. Uso: node scripts/draft-push.mjs <slug> [--apply]",
  );
  process.exit(1);
}

if (APPLY && !TOKEN) {
  console.error("❌ Falta SANITY_API_WRITE_TOKEN en .env.local");
  console.error(
    "   Crear en: https://sanity.io/manage → IRIA TALAN RIF → API → Tokens (scope Editor)",
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
      `❌ No hay archivos en draft-history para slug "${slug}". Buscado: ${slug}__*.md`,
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
      if (text[next] === "[" || text[next] === "*" || text[next] === "`") break;
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

  /*
    Markdown envuelve los párrafos a 80 columnas; un párrafo es un grupo de
    renglones seguidos, no un renglón. Sin acumularlos, cada renglón se
    convertía en un párrafo aparte —cortado a media frase— y una negrita que
    cruzara el corte se partía en dos, dejando los `**` visibles al lector.
    Por eso los renglones se juntan aquí y solo se vuelcan cuando algo cierra
    el párrafo: un renglón en blanco, un encabezado, una lista, una cita.
  */
  let paraBuffer = [];
  let quoteBuffer = [];
  let currentList = null;

  function flushParagraph() {
    if (currentList) {
      const { listItem, level, lines } = currentList;
      currentList = null;
      const txt = lines.join(" ").trim();
      if (txt) out.body.push(paragraph(txt, "normal", listItem, level));
    }
    if (!paraBuffer.length) return;
    const txt = paraBuffer.join(" ").trim();
    paraBuffer = [];
    if (txt) out.body.push(paragraph(txt, "normal"));
  }

  /**
   * Cierra una cita. Una cita de varios renglones es UN bloque.
   *
   * Las que empiezan con 📎 son `dataCallout`: cita textual de una fuente
   * verificable. Su último renglón es la atribución («— CONDUSEF, *Título*») y
   * de ahí salen `publisher` y `sourceName`; la URL se resuelve al final,
   * contra la lista de fuentes del propio borrador. Si no hay atribución se
   * deja la marca de pendiente, que es lo que obliga a revisarlo en Studio.
   */
  function flushQuote() {
    if (!quoteBuffer.length) return;
    const lines = quoteBuffer;
    quoteBuffer = [];

    const esCallout = /^📎/.test(lines[0]);
    const esLibro = /^📖/.test(lines[0]);

    if (!esCallout) {
      const txt = lines.join(" ").trim();
      if (txt) out.body.push(paragraph(txt, esLibro ? "normal" : "blockquote"));
      return;
    }

    /*
      Los borradores atribuyen la cita de dos maneras, y las dos son válidas:

        A) en un renglón aparte:   — CONDUSEF, *Verifica en el SIPRES*
        B) al final de la cita:    · **Fuente**: IMSS — https://imss.gob.mx/…

      La B trae la URL explícita; la A la resuelve después contra la sección
      Fuentes. Lo que quede sin URL se marca como pendiente y lo caza la
      validación — nunca se inventa un enlace.
    */
    let publisher = "";
    let sourceName = "";
    let sourceUrl = "";
    const cuerpo = [...lines];

    // Forma A: la atribución ocupa su propio renglón y abre con raya.
    if (cuerpo.length > 1 && /^\s*[—–-]\s+/.test(cuerpo[cuerpo.length - 1])) {
      const atribucion = cuerpo
        .pop()
        .replace(/^\s*[—–-]\s+/, "")
        .trim();
      const m = atribucion.match(/^([^,]+),\s*(.+)$/);
      if (m) {
        publisher = m[1].replace(/[*`]/g, "").trim();
        sourceName = m[2].replace(/[*`]/g, "").trim();
      } else {
        sourceName = atribucion.replace(/[*`]/g, "").trim();
      }
    }

    let claim = cuerpo
      .join(" ")
      .replace(/^📎\s*/, "")
      .trim();

    // Forma B: «· **Fuente**: Editor — URL» pegado al final de la propia cita.
    const inline = claim.match(/[·|]\s*\*{0,2}Fuente\*{0,2}\s*:\s*(.+)$/i);
    if (inline) {
      claim = claim
        .slice(0, inline.index)
        .replace(/\s*[·|]\s*$/, "")
        .trim();
      const resto = inline[1].trim();
      const urlMatch = resto.match(/https?:\/\/[^\s)\]`]+/);
      if (urlMatch) sourceUrl = urlMatch[0];
      const editor = (urlMatch ? resto.slice(0, urlMatch.index) : resto)
        .replace(/[*`]/g, "")
        .replace(/\s*[—–-]\s*$/, "")
        .trim();
      if (editor && !publisher) publisher = editor;
    }

    out.body.push({
      _type: "dataCallout",
      _key: key(),
      claim,
      sourceName,
      publisher,
      sourceUrl,
    });
  }

  /** Cierra párrafo y cita a la vez: lo que cualquier bloque nuevo necesita. */
  function flushTexto() {
    flushParagraph();
    flushQuote();
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
        mode = "body";
      } else if (mode === "excerpt") {
        out.excerpt = flushBuffer();
        mode = "body";
      } else if (mode === "disclaimer") {
        out.disclaimer = {
          variant: out.disclaimer.variant,
          text: flushBuffer(),
        };
        // A "body" y no a "preamble": lo que sigue al disclaimer es la entrada
        // del artículo, y en "preamble" no la recogía nadie.
        mode = "body";
      } else if (mode === "body") {
        flushTexto();
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
          /(financiero|m[eé]dico|legal|gen[eé]rico)/i,
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

      flushTexto();
      flushTable();
      out.body.push(paragraph(heading, "h2"));
      mode = "body";
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushTexto();
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
          title = sourceText
            .slice(0, idxUrl)
            .replace(/\s*[—–]\s*$/, "")
            .trim();
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
      // Renglón en blanco: es lo que cierra un párrafo o una cita en markdown.
      if (!trimmed) {
        flushTexto();
        continue;
      }

      // Tabla markdown
      if (/^\|.+\|/.test(trimmed)) {
        flushTexto();
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

      // Cita / callout: los renglones seguidos se acumulan en un solo bloque.
      if (trimmed.startsWith(">")) {
        flushParagraph();
        quoteBuffer.push(trimmed.replace(/^>\s?/, "").trim());
        continue;
      }
      flushQuote();

      // Lista numerada
      if (/^\d+\.\s+/.test(trimmed)) {
        flushTexto();
        flushTable();
        currentList = {
          listItem: "number",
          level: 1,
          lines: [trimmed.replace(/^\d+\.\s+/, "")],
        };
        continue;
      }

      // Lista bullet
      if (/^[-*]\s+/.test(trimmed)) {
        flushTexto();
        flushTable();
        currentList = {
          listItem: "bullet",
          level: 1,
          lines: [trimmed.replace(/^[-*]\s+/, "")],
        };
        continue;
      }

      // Renglón suelto: continúa la lista abierta, o el párrafo en curso.
      if (currentList) currentList.lines.push(trimmed);
      else paraBuffer.push(trimmed);
      continue;
    }
  }

  flushTexto();

  if (mode === "tldr") out.tldr = flushBuffer();
  if (mode === "excerpt") out.excerpt = flushBuffer();
  if (mode === "disclaimer") {
    out.disclaimer = { variant: out.disclaimer.variant, text: flushBuffer() };
  }
  flushTable();

  /*
    La URL de cada dataCallout sale de la lista de Fuentes del propio borrador,
    que vive al final del archivo y por eso se parsea después del cuerpo. El
    cruce es por título: la atribución de la cita nombra la misma página que
    aparece en Fuentes. Lo que no cruza se queda con la marca de pendiente —
    publicar una cita apuntando a una URL inventada es peor que no publicarla.
  */
  const normaliza = (t) =>
    (t || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  /** Dos URLs son la misma aunque cambien el protocolo, el www o la barra final. */
  const mismaUrl = (a, b) => {
    const pela = (u) =>
      (u || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/+$/, "");
    return !!pela(a) && pela(a) === pela(b);
  };

  /** El título de Fuentes repite el editor al frente; como etiqueta sobra. */
  const etiqueta = (fuente) => {
    let t = (fuente.title || "").trim();
    const pub = (fuente.publisher || "").trim();
    if (pub && t.toLowerCase().startsWith(pub.toLowerCase())) {
      t = t
        .slice(pub.length)
        .replace(/^\s*[—–-]\s*/, "")
        .trim();
    }
    if (t.length > 90) {
      const corte = t.indexOf(" (");
      t = corte > 15 ? t.slice(0, corte) : t.slice(0, 89).trim() + "…";
    }
    return t;
  };

  for (const b of out.body) {
    if (b._type !== "dataCallout") continue;

    // Con URL pero sin nombre: el nombre sale de la fuente que apunta ahí.
    if (b.sourceUrl && !b.sourceName) {
      const fuente = out.sources.find((f) => mismaUrl(f.url, b.sourceUrl));
      if (fuente) {
        b.sourceName = etiqueta(fuente);
        if (!b.publisher) b.publisher = fuente.publisher || "";
      } else {
        b.sourceName = b.publisher || "Fuente";
      }
      continue;
    }

    // Con nombre pero sin URL: la URL sale de la fuente que se llama igual.
    if (!b.sourceUrl) {
      const objetivo = normaliza(b.sourceName);
      const fuente = objetivo
        ? out.sources.find((f) => {
            const t = normaliza(f.title);
            return t && (t.includes(objetivo) || objetivo.includes(t));
          })
        : null;
      if (fuente?.url) {
        b.sourceUrl = fuente.url;
        if (!b.publisher) b.publisher = fuente.publisher || "";
      } else {
        b.sourceName = b.sourceName || "Pendiente — completar en Studio";
        b.sourceUrl = "https://example.com/pending";
      }
    }
  }

  return out;
}

// ============================================================
// 6. BUILD SANITY DOC
// ============================================================

/**
 * Los bloques custom (keyTakeaways, comparisonTable, disclaimer, dataCallout) y
 * los campos tldr/excerpt se renderizan como STRING PLANO en React
 * (`{item}`, `{cell}`, `{value.caption}`) — no pasan por PortableText, así que
 * no interpretan markdown. Si el markdown del draft trae `**negritas**`, los
 * asteriscos salen visibles en la página.
 *
 * En los párrafos normales esto no pasa porque parseInlineMarks() ya convierte
 * `**` en marks de Portable Text. Aquí se hace lo equivalente para los planos:
 * quitar los marcadores y quedarse con el texto.
 */
function aTextoPlano(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // [texto](url) → texto
    .replace(/\*\*(.+?)\*\*/gs, "$1") // **negrita** → negrita
    .replace(/(^|[\s(])\*(?!\s)(.+?)(?<!\s)\*(?=[\s.,;:)!?]|$)/gs, "$1$2") // *cursiva* → cursiva
    .replace(/`([^`]+)`/g, "$1") // `código` → código
    .replace(/\*\*/g, ""); // marcador huérfano (bold sin cerrar)
}

/** Campos de string plano por tipo de bloque custom. */
const CAMPOS_PLANOS = {
  keyTakeaways: ["items"],
  comparisonTable: ["caption", "headers", "rows"],
  disclaimer: ["text"],
  dataCallout: ["claim", "sourceName", "publisher"],
};

function limpiarBloquesPlanos(body) {
  for (const bloque of body) {
    const campos = CAMPOS_PLANOS[bloque._type];
    if (!campos) continue; // los `block` normales usan marks, no se tocan
    for (const campo of campos) {
      const v = bloque[campo];
      if (typeof v === "string") {
        bloque[campo] = aTextoPlano(v);
      } else if (Array.isArray(v)) {
        bloque[campo] = v.map((item) =>
          typeof item === "string"
            ? aTextoPlano(item)
            : item && Array.isArray(item.cells)
              ? { ...item, cells: item.cells.map(aTextoPlano) }
              : item,
        );
      }
    }
  }
  return body;
}

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
    title: aTextoPlano(parsed.title),
    slug: { _type: "slug", current: slugVal },
    topic: parsed.fields.topic,
    format: parsed.fields.format,
    tldr: aTextoPlano(parsed.tldr),
    excerpt: aTextoPlano(parsed.excerpt),
    questionsAnswered: extractQuestionsFromBody(parsed.body),
    body: limpiarBloquesPlanos(body),
    sources: parsed.sources,
    lastReviewed: new Date().toISOString().slice(0, 10),
  };

  return doc;
}

// ============================================================
// 6.5 MERGE CON LO QUE YA VIVE EN SANITY
// ============================================================

/**
 * Campos que se llenan SOLO en Studio: el markdown del repo no los produce.
 * Un `createOrReplace` ciego los borraba en cada push, así que después de
 * re-empujar un artículo había que volver a poner autor, hero y SEO a mano —
 * y si nadie se daba cuenta, el artículo quedaba sin atribución.
 */
const CAMPOS_DE_STUDIO = [
  "author",
  "heroImage",
  "reviewedBy",
  "seoTitle",
  "seoDescription",
  "relatedArticles",
  "faqs",
  "wordCount",
];

/**
 * Campos que el script SÍ produce, pero que pueden venir vacíos del markdown
 * (p.ej. un draft sin sección "Fuentes"). Vacío no debe pisar contenido real.
 */
const CAMPOS_VACIABLES = ["sources", "questionsAnswered"];

function estaVacio(v) {
  return v === undefined || v === null || (Array.isArray(v) && v.length === 0);
}

async function fetchExistingDoc(docId) {
  const q = encodeURIComponent(`*[_id == "${docId}"][0]`);
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${q}`;
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) {
    throw new Error(`Query falló: ${r.status} ${await r.text()}`);
  }
  return (await r.json()).result ?? null;
}

/**
 * Fusiona el doc recién parseado con el que ya existe en Sanity.
 * Devuelve qué se preservó y qué avisos hay que mostrar, para que el dry-run
 * enseñe exactamente lo que va a pasar antes de tocar producción.
 */
function mergeConExistente(doc, existing) {
  const preservados = [];
  const avisos = [];
  const ahora = new Date().toISOString();

  if (!existing) {
    if (PUBLISH) {
      doc.publishedAt = ahora;
      doc.updatedAt = ahora;
    }
    return { preservados, avisos, esNuevo: true };
  }

  for (const campo of CAMPOS_DE_STUDIO) {
    if (!estaVacio(existing[campo])) {
      doc[campo] = existing[campo];
      preservados.push(campo);
    }
  }

  for (const campo of CAMPOS_VACIABLES) {
    if (estaVacio(doc[campo]) && !estaVacio(existing[campo])) {
      doc[campo] = existing[campo];
      preservados.push(`${campo} (el draft venía vacío)`);
    }
  }

  // La fecha de publicación original es historia: no se re-escribe nunca.
  // Sobreescribirla movía el artículo en el orden del blog y cambiaba el
  // `datePublished` del JSON-LD, que es señal de frescura para buscadores e IA.
  if (existing.publishedAt) {
    doc.publishedAt = existing.publishedAt;
    preservados.push("publishedAt");
  } else if (PUBLISH) {
    doc.publishedAt = ahora;
  }

  // El `body` SÍ se reemplaza — es justo lo que el push viene a actualizar.
  // Pero lo que se insertó a mano en Studio (un ctaWhatsApp, un glossaryReference,
  // una imagen intercalada) no existe en el markdown del repo, así que se va a
  // perder. No se puede fusionar automáticamente sin saber dónde va cada bloque,
  // así que al menos se avisa antes de tocar producción.
  const tipos = (body) => {
    const m = new Map();
    for (const b of body ?? []) m.set(b._type, (m.get(b._type) ?? 0) + 1);
    return m;
  };
  const tiposViejos = tipos(existing.body);
  const tiposNuevos = tipos(doc.body);
  const enPeligro = [];
  for (const [tipo, n] of tiposViejos) {
    const nuevos = tiposNuevos.get(tipo) ?? 0;
    if (nuevos < n) enPeligro.push(`${n - nuevos}× ${tipo}`);
  }
  if (enPeligro.length > 0) {
    avisos.push(
      `El body se reemplaza: desaparecen bloques que hoy están en Sanity y no vienen del markdown → ${enPeligro.join(", ")}. Re-insértalos en Studio o agrégalos al draft.`,
    );
  }

  // Los enlaces in-body (markDefs) que se agregaron por script/Studio tampoco
  // están en el markdown y se van con el reemplazo.
  const links = (body) =>
    (body ?? []).reduce(
      (n, b) => n + (b.markDefs ?? []).filter((d) => d._type === "link").length,
      0,
    );
  const linksViejos = links(existing.body);
  const linksNuevos = links(doc.body);
  if (linksViejos > linksNuevos) {
    avisos.push(
      `Enlaces in-body: hay ${linksViejos} en Sanity y el draft trae ${linksNuevos} → se pierden ${linksViejos - linksNuevos}. Ponlos en el markdown como [texto](/ruta) para que sobrevivan.`,
    );
  }

  // Un artículo vivo no se baja por empujarle contenido nuevo.
  if (existing.draft === false && !FORCE_DRAFT) {
    doc.draft = false;
    if (!PUBLISH) {
      avisos.push(
        "Ya estaba publicado → se mantiene en línea (usa --force-draft para regresarlo a borrador).",
      );
    }
  }

  doc.updatedAt =
    doc.draft === false ? ahora : (existing.updatedAt ?? undefined);

  return { preservados, avisos, esNuevo: false };
}

function extractQuestionsFromBody(body) {
  const questions = [];
  for (const block of body) {
    if (block._type === "block" && block.style === "h2") {
      const text = (block.children || []).map((c) => c.text || "").join("");
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

  /*
    Una cita textual apuntando a `example.com/pending` es peor que no tener la
    cita: en el sitio queda un enlace de fuente que no lleva a ninguna fuente,
    en una categoría —dinero— donde la fuente ES el argumento. Se trata como
    error, no como aviso, para que no se cuele en un push desatendido.
  */
  const sinFuente = (doc.body || []).filter(
    (b) =>
      b._type === "dataCallout" &&
      /example\.com\/pending/.test(b.sourceUrl || ""),
  );
  for (const b of sinFuente) {
    errors.push(
      `dataCallout sin URL real ("${(b.claim || "").slice(0, 50)}…") — ` +
        `añade la atribución «— Editor, *Título*» al final de la cita y ` +
        `asegúrate de que ese título esté en la sección Fuentes`,
    );
  }

  /*
    Párrafos de un solo renglón cortado a media frase: la firma de un markdown
    con los renglones envueltos que no se juntó. Si aparece, algo se rompió en
    el parser y el artículo saldría despedazado.
  */
  const parrafos = (doc.body || [])
    .filter((b) => b._type === "block" && (b.style || "normal") === "normal")
    .map((b) =>
      (b.children || [])
        .map((c) => c.text)
        .join("")
        .trim(),
    )
    .filter(Boolean);
  if (parrafos.length >= 20) {
    const cortos = parrafos.filter((t) => t.length < 90).length;
    if (cortos / parrafos.length > 0.8) {
      errors.push(
        `${cortos} de ${parrafos.length} párrafos miden menos de 90 caracteres: ` +
          `el texto quedó cortado por renglón en vez de por párrafo`,
      );
    }
  }

  /*
    Asteriscos literales en el texto plano: una negrita que se partió. El
    lector los ve tal cual.
  */
  const conAsteriscos = parrafos.filter((t) => t.includes("**")).length;
  if (conAsteriscos) {
    errors.push(
      `${conAsteriscos} párrafo(s) con \`**\` literal: una negrita quedó partida`,
    );
  }

  return errors;
}

// ============================================================
// 9. MAIN
// ============================================================

const parsed = parseDraft(raw);
const doc = buildSanityDoc(parsed);

// Antes de reemplazar el documento hay que saber qué hay del otro lado: el
// push usa `createOrReplace`, y sin este merge cada re-push borraba autor,
// hero, SEO y la fecha de publicación que se habían puesto en Studio.
const existing = await fetchExistingDoc(doc._id);
const { preservados, avisos, esNuevo } = mergeConExistente(doc, existing);

const errors = validate(doc);

if (esNuevo) {
  console.log("\n🆕 No existe en Sanity — se crea desde cero.");
} else {
  console.log(
    `\n♻️  Ya existe en Sanity (draft: ${existing.draft}) — se hace merge, no reemplazo ciego.`,
  );
  console.log(
    preservados.length > 0
      ? `   Se conservan: ${preservados.join(", ")}`
      : "   (nada que conservar: el doc existente no tenía campos de Studio)",
  );
  avisos.forEach((a) => console.log(`   ⚠️  ${a}`));
}

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
  doc.excerpt ? `${doc.excerpt.length} chars` : "(vacío)",
);
console.log("   questionsAnswered:", doc.questionsAnswered.length);
console.log("   body blocks:", doc.body.length);
console.log(
  "   keyTakeaways:",
  doc.body[0]?._type === "keyTakeaways" ? doc.body[0].items.length : 0,
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
  // El estado se lee del doc ya fusionado, no del flag: un artículo que ya
  // estaba publicado sigue publicado aunque se empuje sin `--publish`.
  console.log(
    doc.draft === false
      ? "   El doc quedará con `draft: false` (visible en la web tras revalidate)."
      : "   El doc se subirá con `draft: true`, listo para revisar en Studio.",
  );
  if (VERBOSE) {
    console.log("\n--- BODY (verbose) ---");
    console.log(JSON.stringify(doc.body, null, 2));
  }
  // Sin `process.exit()` a propósito: la lectura previa a Sanity deja un socket
  // keep-alive abierto, y forzar la salida dispara una assertion de libuv en
  // Windows que devuelve exit code 9 — el workflow lo leería como fallo.
  // Dejamos que el proceso termine solo cuando el socket se cierre.
} else {
  console.log(
    PUBLISH
      ? "\n🟢 Pusheando + publicando a Sanity (draft:false)..."
      : `\n🟢 Pusheando a Sanity (createOrReplace con merge, draft:${doc.draft})...`,
  );
  await mutate([{ createOrReplace: doc }]);
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
            `   ⚠️  Revalidate respondió ${r.status}. Response: ${JSON.stringify(json)}`,
          );
          console.log(
            "   Producción debería actualizarse en ~30s vía ISR de cualquier forma.",
          );
        }
      } catch (err) {
        console.log(`   ⚠️  Revalidate falló: ${err.message}`);
        console.log(
          "   Producción debería actualizarse en ~30s vía ISR de cualquier forma.",
        );
      }
    }
    console.log(`\n📍 URL pública: ${SITE_URL}/blog/${doc.slug.current}`);
    console.log(
      `\n   Verifica que producción ya sirve el contenido nuevo con:`,
    );
    console.log(`   node scripts/draft-verify-live.mjs ${doc.slug.current}`);
    console.log(
      `\n   ⚠️  Si publicaste sin imagen hero/autor en Sanity, complétalos en Studio:`,
    );
    console.log(
      `   https://iriatalan.com.mx/studio/structure/article;${doc._id}`,
    );
  } else {
    console.log(
      `   Studio URL: https://iriatalan.com.mx/studio/structure/article;${doc._id}`,
    );
    console.log("\n   Próximos pasos en Studio:");
    console.log(
      "   1. Verifica el body — todos los bloques bien estructurados",
    );
    console.log("   2. Selecciona Autor (reference a Iria Talan)");
    console.log("   3. Sube imagen hero con alt text");
    console.log("   4. Revisa Sources — todos con publisher y URL real");
    console.log(
      "   5. Para los dataCallout, completa sourceUrl real (los pendientes están marcados)",
    );
    console.log("   6. Apaga toggle 🔴 Draft → click Publish");
  }
} // fin del bloque --apply
