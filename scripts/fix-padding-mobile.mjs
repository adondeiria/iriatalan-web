// One-shot helper: applies mobile-responsive vertical padding to remaining
// pages that the bulk Edit pass didn't reach. Safe to delete after running.
//
// Pattern: pY (mobile-fixed) -> pY-mobile sm:pY-desktop
//   py-12 -> py-8  sm:py-12
//   py-16 -> py-10 sm:py-16
//   py-20 -> py-12 sm:py-20

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

const FILES = [
  "src/app/hijos-neurodivergentes/page.tsx",
  "src/app/patrimonial/page.tsx",
  "src/app/familias-arcoiris/page.tsx",
  "src/app/[slug]/page.tsx",
];

const REPLACEMENTS = [
  {
    from: 'px-6 py-12 border-t border-zinc-200 dark:border-zinc-800',
    to:   'px-6 py-8 sm:py-12 border-t border-zinc-200 dark:border-zinc-800',
  },
  {
    from: 'px-6 py-16 border-t border-zinc-200 dark:border-zinc-800',
    to:   'px-6 py-10 sm:py-16 border-t border-zinc-200 dark:border-zinc-800',
  },
  {
    from: 'px-6 py-20 max-w-4xl mx-auto w-full',
    to:   'px-6 py-12 sm:py-20 max-w-4xl mx-auto w-full',
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
    console.log(`-- ${rel}: 0 replacements (already migrated or pattern not present)`);
  }
  totalChanges += fileChanges;
}

console.log(`\nDone. Total replacements: ${totalChanges}`);
