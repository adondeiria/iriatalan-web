// md2html.mjs — convierte un draft markdown del blog a HTML autocontenido y legible.
// Uso: node scripts/md2html.mjs <ruta.md> <salida.html>
import fs from "node:fs";

const [, , inPath, outPath] = process.argv;
const src = fs.readFileSync(inPath, "utf8");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// inline: **bold**, [text](url), `code`
function inline(s) {
  let t = esc(s);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, txt, url) => {
    const safe = url.replace(/"/g, "&quot;");
    return `<a href="${safe}">${txt}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  return t;
}

const lines = src.split("\n");
const out = [];
let i = 0;
let inUl = false,
  inOl = false;

const closeLists = () => {
  if (inUl) { out.push("</ul>"); inUl = false; }
  if (inOl) { out.push("</ol>"); inOl = false; }
};

while (i < lines.length) {
  const line = lines[i];

  // table block
  if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
    closeLists();
    const header = line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    i += 2;
    const rows = [];
    while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
      rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      i++;
    }
    out.push("<table><thead><tr>" + header.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>");
    for (const r of rows) out.push("<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
    out.push("</tbody></table>");
    continue;
  }

  let m;
  if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
    closeLists();
    const lvl = m[1].length;
    out.push(`<h${lvl}>${inline(m[2])}</h${lvl}>`);
  } else if (/^\s*---\s*$/.test(line)) {
    closeLists();
    out.push("<hr>");
  } else if ((m = line.match(/^\s*>\s?(.*)$/))) {
    closeLists();
    out.push(`<blockquote>${inline(m[1])}</blockquote>`);
  } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
    if (!inUl) { closeLists(); out.push("<ul>"); inUl = true; }
    out.push(`<li>${inline(m[1])}</li>`);
  } else if ((m = line.match(/^\s*\d+\.\s+(.*)$/))) {
    if (!inOl) { closeLists(); out.push("<ol>"); inOl = true; }
    out.push(`<li>${inline(m[1])}</li>`);
  } else if (/^\s*$/.test(line)) {
    closeLists();
  } else {
    closeLists();
    out.push(`<p>${inline(line)}</p>`);
  }
  i++;
}
closeLists();

const title = (src.match(/^#\s+(.*)$/m) || [, "Borrador"])[1];
const html = `<!doctype html><html lang="es-MX"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root{color-scheme:light}
body{font-family:Georgia,'Times New Roman',serif;max-width:720px;margin:0 auto;padding:28px 20px 80px;color:#1a1512;line-height:1.6;background:#faf7f2}
h1{font-size:1.9rem;line-height:1.2;margin:.4em 0 .6em}
h2{font-size:1.4rem;margin:1.8em 0 .5em;border-bottom:1px solid #e4ddd0;padding-bottom:.2em}
h3{font-size:1.15rem;margin:1.4em 0 .4em}
a{color:#7a1f22}
code{background:#efe9df;padding:.05em .35em;border-radius:4px;font-size:.92em;font-family:ui-monospace,Menlo,monospace}
blockquote{margin:1em 0;padding:.6em 1em;border-left:4px solid #b08d57;background:#f3ecdf;border-radius:0 6px 6px 0}
table{border-collapse:collapse;width:100%;margin:1.2em 0;font-size:.95rem;font-family:system-ui,sans-serif}
th,td{border:1px solid #d9cfbe;padding:.5em .7em;text-align:left;vertical-align:top}
th{background:#7a1f22;color:#fff;font-weight:600}
tr:nth-child(even) td{background:#f3ecdf}
hr{border:none;border-top:1px solid #e4ddd0;margin:1.6em 0}
ul,ol{padding-left:1.3em}
li{margin:.25em 0}
</style></head><body>
${out.join("\n")}
</body></html>`;

fs.writeFileSync(outPath, html);
console.log(`✅ ${outPath} (${(html.length / 1024).toFixed(1)} KB)`);
