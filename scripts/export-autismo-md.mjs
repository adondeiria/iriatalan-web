// export-autismo-md.mjs — exporta el body actual del artículo a markdown legible
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
const ID = "article-como-dejar-dinero-hijo-autismo-discapacidad-mexico";

const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(`*[_id=="${ID}"][0]{title, tldr, excerpt, body}`)}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
const { result: doc } = await r.json();

const renderSpans = (children = []) => {
  let out = "";
  for (const c of children) {
    let txt = c.text || "";
    if (c.marks?.includes("strong")) txt = `**${txt}**`;
    if (c.marks?.includes("em")) txt = `*${txt}*`;
    out += txt;
  }
  return out;
};

let md = `# ${doc.title}\n\n`;
md += `**TL;DR:** ${doc.tldr}\n\n`;
md += `**Excerpt:** ${doc.excerpt}\n\n---\n\n`;

for (const block of doc.body) {
  if (block._type === "keyTakeaways") {
    md += `### ⭐ Key Takeaways\n\n`;
    for (const item of block.items || []) md += `- ${item}\n`;
    md += `\n`;
    continue;
  }
  if (block._type === "comparisonTable") {
    if (block.caption) md += `*Tabla: ${block.caption}*\n\n`;
    md += `| ${block.headers.join(" | ")} |\n`;
    md += `| ${block.headers.map(() => "---").join(" | ")} |\n`;
    for (const row of block.rows || []) md += `| ${row.cells.join(" | ")} |\n`;
    md += `\n`;
    continue;
  }
  if (block._type === "disclaimer") {
    md += `> ⚠️ **Disclaimer (${block.variant}):** ${block.text}\n\n`;
    continue;
  }
  if (block._type === "ctaWhatsApp") {
    md += `[CTA WhatsApp]\n  Heading: ${block.heading}\n  Texto: ${block.text}\n  Botón: ${block.buttonLabel}\n  Mensaje pre-llenado: ${block.preFilledMessage}\n\n`;
    continue;
  }
  if (block._type !== "block") continue;
  const text = renderSpans(block.children);
  if (block.style === "h2") md += `\n## ${text}\n\n`;
  else if (block.style === "h3") md += `### ${text}\n\n`;
  else if (block.style === "blockquote") md += `> ${text}\n\n`;
  else if (block.listItem === "bullet") md += `- ${text}\n`;
  else if (block.listItem === "number") md += `1. ${text}\n`;
  else md += `${text}\n\n`;
}

const outPath = path.join(__dirname, "..", "tmp", "autismo-current.md");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, md);
console.log(`✓ Exportado: ${outPath}`);
console.log(`  ${md.length} chars`);
