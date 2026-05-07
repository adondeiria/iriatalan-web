// One-shot helper: migrates primary CTA buttons to RIF brand red.
// Replaces:   bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900
// With:       bg-rif-rojo text-white
// Safe to delete after running.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

const FILES = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/gmm/page.tsx",
  "src/app/[slug]/page.tsx",
  "src/app/familias-arcoiris/page.tsx",
  "src/app/patrimonial/page.tsx",
  "src/app/hijos-neurodivergentes/page.tsx",
  "src/app/empresas/page.tsx",
  "src/app/retiro/page.tsx",
  "src/app/mujeres/page.tsx",
];

const REPLACEMENTS = [
  {
    from: "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900",
    to:   "bg-rif-rojo text-white",
  },
];

let totalChanges = 0;

for (const rel of FILES) {
  const path = resolve(ROOT, rel);
  let src;
  try {
    src = await readFile(path, "utf8");
  } catch (err) {
    console.error(`SKIP ${rel}: ${err.message}`);
    continue;
  }

  let fileChanges = 0;
  for (const { from, to } of REPLACEMENTS) {
    const parts = src.split(from);
    const count = parts.length - 1;
    if (count > 0) {
      src = parts.join(to);
      fileChanges += count;
    }
  }

  if (fileChanges > 0) {
    await writeFile(path, src, "utf8");
    console.log(`OK ${rel}: ${fileChanges} replacement(s)`);
  } else {
    console.log(`-- ${rel}: 0 replacements`);
  }
  totalChanges += fileChanges;
}

console.log(`\nDone. Total CTA migrations: ${totalChanges}`);
