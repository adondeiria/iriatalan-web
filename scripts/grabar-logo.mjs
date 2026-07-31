/**
 * Graba el logo RIF real sobre la tapa de un cuaderno fotografiado.
 *
 * El logo NO lo dibuja un generador de imagen: se toma el SVG vectorial de la
 * marca (public/logo-rif.svg), se recolorea con un degradado que simula foil
 * metálico y se proyecta sobre el plano de la tapa con una HOMOGRAFÍA — no una
 * afín. Con el libro a tres cuartos la tapa se ve en perspectiva (sus bordes
 * opuestos no son paralelos en pantalla) y una afín deja el grabado "pegado"
 * encima en vez de acostado sobre la tapa.
 *
 * Uso:
 *   node scripts/grabar-logo.mjs <base> <salida> <quadTapa> [opciones JSON]
 *
 *   quadTapa: [[x,y] x4] esquinas de la cara de la tapa, en orden
 *             superior-izq, superior-der, inferior-der, inferior-izq.
 *   opciones: { cx, cy, ancho, color, debug }
 *             cx, cy  centro del logo en coords normalizadas de la tapa (0..1)
 *             ancho   ancho del logo como fracción del ancho de la tapa
 *             color   "rojo" | "oro"
 *             debug   true → dibuja el quad para verificar las esquinas
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const [, , BASE, SALIDA, QUAD_JSON, OPTS_JSON] = process.argv;
const quad = JSON.parse(QUAD_JSON);
const opts = JSON.parse(OPTS_JSON ?? "{}");

const cx = opts.cx ?? 0.5;
const cy = opts.cy ?? 0.42;
const anchoFrac = opts.ancho ?? 0.62;
const color = opts.color ?? "rojo";
const LOGO_SVG = path.resolve("public/logo-rif.svg");
const LOGO_AR = 740 / 258; // proporción del viewBox del SVG

// ── Homografía: cuadrado unitario → quad ────────────────────────────────────
function homografia(q) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, sx = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const h = (dx1 * sy - sx * dy1) / den;
  return [
    [x1 - x0 + g * x1, x3 - x0 + h * x3, x0],
    [y1 - y0 + g * y1, y3 - y0 + h * y3, y0],
    [g, h, 1],
  ];
}

function aplicar(H, u, v) {
  const w = H[2][0] * u + H[2][1] * v + H[2][2];
  return [
    (H[0][0] * u + H[0][1] * v + H[0][2]) / w,
    (H[1][0] * u + H[1][1] * v + H[1][2]) / w,
  ];
}

function invertir(M) {
  const [a, b, c] = M[0];
  const [d, e, f] = M[1];
  const [g, h, i] = M[2];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [
    [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
    [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
    [C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
  ];
}

// ── Logo vectorial con degradado metálico ───────────────────────────────────
const PALETAS = {
  // Rojo de marca con realce claro y caída oscura: así el trazo lee como foil
  // estampado y no como tinta plana.
  rojo: ["#F4657E", "#E01A45", "#B00A2E", "#7A0B23"],
  oro: ["#E8D097", "#D2B471", "#A8863F", "#6E5623"],
};

function svgMetalico(c) {
  const [c1, c2, c3, c4] = PALETAS[c] ?? PALETAS.rojo;
  const svg = fs.readFileSync(LOGO_SVG, "utf8");
  const grad = `<defs><linearGradient id="metal" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="38%" stop-color="${c2}"/>
      <stop offset="68%" stop-color="${c3}"/>
      <stop offset="100%" stop-color="${c4}"/>
    </linearGradient></defs>`;
  return svg
    .replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="url(#metal)"')
    .replace(/(<svg[^>]*>)/, `$1${grad}`);
}

const baseMeta = await sharp(BASE).metadata();
const W = baseMeta.width, H = baseMeta.height;
const Htapa = homografia(quad);

const anchoTapa = Math.hypot(quad[1][0] - quad[0][0], quad[1][1] - quad[0][1]);
const altoTapa = Math.hypot(quad[3][0] - quad[0][0], quad[3][1] - quad[0][1]);
const wN = anchoFrac;
const hN = (anchoFrac * anchoTapa) / LOGO_AR / altoTapa;
const quadLogo = [
  aplicar(Htapa, cx - wN / 2, cy - hN / 2),
  aplicar(Htapa, cx + wN / 2, cy - hN / 2),
  aplicar(Htapa, cx + wN / 2, cy + hN / 2),
  aplicar(Htapa, cx - wN / 2, cy + hN / 2),
];

if (opts.debug) {
  const pts = quad
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="8" fill="#00ff88"/><text x="${x + 12}" y="${y - 10}" fill="#00ff88" font-size="26">${i}</text>`)
    .join("");
  const poly = quad.map((p) => p.join(",")).join(" ");
  const polyL = quadLogo.map((p) => p.map(Math.round).join(",")).join(" ");
  await sharp(BASE)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${W}" height="${H}"><polygon points="${poly}" fill="#00ff8825" stroke="#00ff88" stroke-width="3"/><polygon points="${polyL}" fill="#ff00aa45" stroke="#ff00aa" stroke-width="2"/>${pts}</svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 88 })
    .toFile(SALIDA);
  console.log(JSON.stringify({ debug: true, quadLogo: quadLogo.map((p) => p.map(Math.round)) }));
  process.exit(0);
}

const bbox = {
  x0: Math.max(0, Math.floor(Math.min(...quadLogo.map((p) => p[0]))) - 2),
  y0: Math.max(0, Math.floor(Math.min(...quadLogo.map((p) => p[1]))) - 2),
  x1: Math.min(W, Math.ceil(Math.max(...quadLogo.map((p) => p[0]))) + 2),
  y1: Math.min(H, Math.ceil(Math.max(...quadLogo.map((p) => p[1]))) + 2),
};
const bw = bbox.x1 - bbox.x0, bh = bbox.y1 - bbox.y0;

// Supersampling: el trazo del texto es fino y sin esto la proyección lo rompe.
const SS = 4;
const srcW = Math.round(bw * SS);
const srcH = Math.round(srcW / LOGO_AR);
const plano = await sharp(Buffer.from(svgMetalico(color)), { density: 900 })
  .resize({ width: srcW, height: srcH, fit: "fill" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const Hlogo = homografia(quadLogo);
const Hinv = invertir(Hlogo);

const out = Buffer.alloc(bw * bh * 4, 0);
const src = plano.data, sw = plano.info.width, sh = plano.info.height;

for (let y = 0; y < bh; y++) {
  for (let x = 0; x < bw; x++) {
    const px = bbox.x0 + x + 0.5, py = bbox.y0 + y + 0.5;
    const w = Hinv[2][0] * px + Hinv[2][1] * py + Hinv[2][2];
    const u = (Hinv[0][0] * px + Hinv[0][1] * py + Hinv[0][2]) / w;
    const v = (Hinv[1][0] * px + Hinv[1][1] * py + Hinv[1][2]) / w;
    if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    const su = u * sw, sv = v * sh;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const sx = Math.round(su + (dx * SS) / 3);
        const sy = Math.round(sv + (dy * SS) / 3);
        if (sx < 0 || sy < 0 || sx >= sw || sy >= sh) continue;
        const o = (sy * sw + sx) * 4;
        r += src[o]; g += src[o + 1]; b += src[o + 2]; a += src[o + 3]; n++;
      }
    }
    if (!n) continue;
    const o = (y * bw + x) * 4;
    out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
  }
}

const capa = await sharp(out, { raw: { width: bw, height: bh, channels: 4 } }).png().toBuffer();

// Hueco del troquel: silueta oscura desplazada bajo el trazo. Sin esto el logo
// se ve impreso encima, no estampado en el cuero.
const hueco = await sharp(capa)
  .composite([
    {
      input: Buffer.from(`<svg width="${bw}" height="${bh}"><rect width="100%" height="100%" fill="#12080a"/></svg>`),
      blend: "in",
    },
  ])
  .png()
  .toBuffer();

await sharp(BASE)
  .composite([
    { input: hueco, left: bbox.x0 + 1, top: bbox.y0 + 2, blend: "over" },
    { input: capa, left: bbox.x0, top: bbox.y0, blend: "over" },
  ])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(SALIDA);

console.log(JSON.stringify({ salida: SALIDA, color, bbox, quadLogo: quadLogo.map((p) => p.map(Math.round)) }));
