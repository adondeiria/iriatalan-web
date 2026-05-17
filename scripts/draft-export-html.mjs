// draft-export-html.mjs
//
// Genera un .html del draft más reciente, listo para abrir en Word/Google Docs/navegador.
// Workaround para cuando el .docx falla — usa markdown-it (ya en el proyecto) que es robusto.
//
// Usage:
//   node scripts/draft-export-html.mjs <slug>
//   node scripts/draft-export-html.mjs <slug> --out <path>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

const args = process.argv.slice(2);
const outFlagIdx = args.indexOf("--out");
const OUT_OVERRIDE = outFlagIdx >= 0 ? args[outFlagIdx + 1] : null;
const slug = args.find(
  (a, i) => !a.startsWith("--") && a !== OUT_OVERRIDE && args[i - 1] !== "--out"
);

if (!slug) {
  console.error("Falta slug. Uso: node scripts/draft-export-html.mjs <slug>");
  process.exit(1);
}

const draftHistoryDir = path.join(repoRoot, "sanity", "seeds", "draft-history");
const matches = fs
  .readdirSync(draftHistoryDir)
  .filter((f) => f.startsWith(`${slug}__`) && f.endsWith(".md"))
  .sort()
  .reverse();

if (matches.length === 0) {
  console.error(`No hay archivos draft-history para "${slug}".`);
  process.exit(1);
}

const draftFile = path.join(draftHistoryDir, matches[0]);
const md = fs.readFileSync(draftFile, "utf8");

const parser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const bodyHtml = parser.render(md);

const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${slug}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; max-width: 820px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.6; }
  h1 { color: #B30000; border-bottom: 2px solid #B30000; padding-bottom: 8px; font-size: 28px; }
  h2 { color: #B30000; margin-top: 36px; font-size: 22px; }
  h3 { color: #333; margin-top: 24px; font-size: 18px; }
  blockquote { border-left: 4px solid #B30000; padding: 8px 16px; background: #FFF5F5; margin: 16px 0; font-style: italic; color: #555; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; vertical-align: top; }
  th { background: #FAFAFA; font-weight: bold; }
  tr:nth-child(even) { background: #FBFBFB; }
  code { background: #F4F4F4; padding: 2px 6px; border-radius: 3px; font-family: Consolas, monospace; font-size: 13px; }
  pre { background: #F4F4F4; padding: 12px; border-radius: 4px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #DDD; margin: 32px 0; }
  ul, ol { padding-left: 28px; }
  li { margin: 4px 0; }
  strong { color: #1a1a1a; }
  a { color: #B30000; text-decoration: underline; }
  .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
</style>
</head>
<body>
<div class="meta">Generado desde ${matches[0]} - Edita libremente en Word/Google Docs/lo que quieras y pega los cambios en el chat.</div>
${bodyHtml}
</body>
</html>`;

const outPath = OUT_OVERRIDE || path.join(repoRoot, "borradores", `${slug}.html`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, fullHtml, "utf8");

const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`HTML generado: ${outPath}`);
console.log(`Tamano: ${sizeKb} KB`);
