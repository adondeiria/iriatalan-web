/**
 * optimize-heroes.mjs — Re-encode one-off de imágenes hero pesadas (2-10 MB)
 *
 * Contexto: PSI móvil 29. Los héroes son PNG/JPG crudos de cámara/diseño;
 * el optimizador de Next re-encodea on-demand desde masters gigantes.
 * Este script los baja a masters razonables (~2560px, mozjpeg q80).
 *
 * - Respaldo de originales en tmp/img-backup/ (además del historial git).
 * - PNG fotográfico sin alpha → .jpg (mozjpeg q80). Con alpha → .webp q80.
 * - JPG → JPG re-encodeado (mismo nombre).
 * - Nunca agranda (withoutEnlargement). Solo escribe si ahorra >10%.
 * - Imprime tabla antes/después + lista de renombres para actualizar refs.
 *
 * Uso: node scripts/optimize-heroes.mjs
 */

import sharp from "sharp";
import { copyFile, mkdir, stat, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "public");
const BACKUP = path.resolve(process.cwd(), "tmp", "img-backup");

const MAX_WIDTH = 2560;
// q90: las fotos con rostros (retrato de Iria, nichos) mostraban artefactos a
// q80 tras la doble compresión master→AVIF. q90 da un master limpio; el peso
// servido sigue siendo minúsculo.
const QUALITY = 90;

// Héroes referenciados en código (verificado por grep 2026-07-22).
// NO incluir img/blog/* (bookkeeping del pipeline de Sanity, no se sirven de aquí).
const TARGETS = [
  "img/iria/IRIA_HERO_FINAL4.png",
  "img/servicios/retiro-hero.png",
  "img/servicios/patrimonial-hero.png",
  "img/servicios/gmm-hero.png",
  "img/servicios/empresas-hero.png",
  "img/nichos/mujeres-hero.png",
  "img/nichos/familias-arcoiris-hero.png",
  "img/nichos/hijos-neurodivergentes-hero.png",
  "img/silencios/silencio-01-pension.png",
  "img/silencios/silencio-02-universidades.png",
  "img/silencios/silencio-03-ppr.png",
  "img/silencios/silencio-04-beneficiarios.png",
  "img/silencios/silencio-05-empresas.png",
  "img/silencios/silencio-06-neurodivergentes.png",
  "img/silencios/silencio-07-sucesion.png",
  "img/servicios/seguros-vida-hero.jpg",
  "img/servicios/planes-educacionales-hero.jpg",
  "img/servicios/fondos-de-inversion-hero.jpg",
];

const kb = (bytes) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

async function main() {
  const renames = [];
  const rows = [];

  for (const rel of TARGETS) {
    const abs = path.join(ROOT, rel);
    // Fuente = original de respaldo si existe (para no re-comprimir un archivo
    // ya comprimido en corridas repetidas); si no, el de public + respaldarlo.
    const backupPath = path.join(BACKUP, rel);
    let src;
    if (existsSync(backupPath)) {
      src = backupPath;
    } else if (existsSync(abs)) {
      await mkdir(path.dirname(backupPath), { recursive: true });
      await copyFile(abs, backupPath);
      src = backupPath;
    } else {
      rows.push({ rel, note: "NO EXISTE (ni respaldo) — saltado" });
      continue;
    }

    const before = (await stat(src)).size;
    const img = sharp(src, { limitInputPixels: false });
    const meta = await img.metadata();
    const hasAlpha = Boolean(meta.hasAlpha);

    const targetExt = hasAlpha ? ".webp" : ".jpg";
    const outRel = rel.replace(/\.(png|jpg|jpeg)$/i, targetExt);
    const outAbs = path.join(ROOT, outRel);
    const tmpOut = outAbs + ".tmp";

    let pipeline = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    pipeline = hasAlpha
      ? pipeline.webp({ quality: QUALITY })
      : pipeline.jpeg({ quality: QUALITY, mozjpeg: true });

    await pipeline.toFile(tmpOut);
    const after = (await stat(tmpOut)).size;

    // Solo aplicar si ahorra >10% (si ya estaba optimizada, dejarla).
    if (after > before * 0.9) {
      await unlink(tmpOut);
      rows.push({ rel, before, after: before, note: "ya óptima — sin cambio" });
      continue;
    }

    // Reemplazo atómico-ish: escribir destino final, borrar original si cambió el nombre.
    await copyFile(tmpOut, outAbs);
    await unlink(tmpOut);
    if (outAbs !== abs) {
      if (existsSync(abs)) await unlink(abs);
      renames.push({ from: `/${rel}`, to: `/${outRel}` });
    }

    rows.push({ rel: outRel, before, after, note: outAbs !== abs ? `renombrada desde ${path.basename(rel)}` : "" });
  }

  // Reporte
  let totalBefore = 0;
  let totalAfter = 0;
  console.log("\n=== RESULTADO ===");
  for (const r of rows) {
    if (r.before) {
      totalBefore += r.before;
      totalAfter += r.after;
      console.log(
        `${r.rel.padEnd(52)} ${kb(r.before).padStart(10)} -> ${kb(r.after).padStart(9)}  ${r.note}`,
      );
    } else {
      console.log(`${r.rel.padEnd(52)} ${r.note}`);
    }
  }
  console.log(`\nTOTAL: ${kb(totalBefore)} -> ${kb(totalAfter)} (${Math.round((1 - totalAfter / totalBefore) * 100)}% menos)`);

  if (renames.length) {
    console.log("\n=== RENOMBRES (actualizar referencias en src) ===");
    for (const r of renames) console.log(`${r.from} -> ${r.to}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
