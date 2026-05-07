// One-shot: fetch author longBio, fix typo MDRT + remove duplicate line, patch back
// Reads SANITY_API_WRITE_TOKEN from .env.local
// Usage: node scripts/sanity-fix-author.mjs [--apply]
// Without --apply: dry-run (only prints diff)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const PROJECT_ID = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = env.NEXT_PUBLIC_SANITY_DATASET;
const API_VERSION = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const TOKEN = env.SANITY_API_WRITE_TOKEN;
const APPLY = process.argv.includes("--apply");

if (!TOKEN) {
  console.error("Missing SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const apiBase = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data`;

async function query(groq) {
  const url = `${apiBase}/query/${DATASET}?query=${encodeURIComponent(groq)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`Query failed: ${r.status} ${await r.text()}`);
  return (await r.json()).result;
}

async function mutate(mutations) {
  const url = `${apiBase}/mutate/${DATASET}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations }),
  });
  if (!r.ok) throw new Error(`Mutate failed: ${r.status} ${await r.text()}`);
  return await r.json();
}

const doc = await query(
  `*[_type == "author"] | order(_updatedAt desc)[0]{_id, _type, name, longBio}`
);

if (!doc) {
  console.error("No author document found");
  process.exit(1);
}

console.log(`\nFound author doc: ${doc._id}`);
console.log(`Name: ${doc.name}`);
console.log(`longBio blocks: ${doc.longBio?.length ?? 0}\n`);

doc.longBio?.forEach((b, i) => {
  const text =
    b.children?.map((c) => c.text || "").join("") ?? `[${b._type}]`;
  console.log(
    `[${i}] ${b.style ?? b._type}: "${text.slice(0, 120)}${text.length > 120 ? "..." : ""}"`
  );
});

const removeIdx = new Set();

doc.longBio?.forEach((b, i) => {
  const text = b.children?.map((c) => c.text || "").join("") ?? "";
  const prev = i > 0 ? doc.longBio[i - 1] : null;
  const prevText = prev?.children?.map((c) => c.text || "").join("") ?? "";
  if (text && text === prevText) {
    removeIdx.add(i);
    console.log(`\n>>> [${i}] DUPLICATE detected, will remove`);
  }
  if (text.includes("Miembro IMEF")) {
    removeIdx.add(i);
    console.log(`\n>>> [${i}] IMEF block, will remove`);
  }
});

// Use .* for separator (em-dash / en-dash / hyphen variations) and substring detection
const REPLACEMENTS = [
  {
    name: "MDRT typo",
    test: (t) => /Top\(\s*Court of the Table/.test(t),
    transform: (t) =>
      t.replace(
        /Top\(\s*Court of the Table/g,
        "Top of the Table 2024 · Court of the Table 2025"
      ),
  },
  {
    name: "Yale official name",
    test: (t) => /Wealth Management Certificate/.test(t) && /Yale/.test(t),
    transform: () =>
      "Wealth Management Theory & Practice — Yale School of Management Executive Education (2019)",
  },
  {
    name: "LSE disclaimer",
    test: (t) =>
      /MBA Essentials/.test(t) &&
      /London School of Economics/.test(t) &&
      !/Executive Education/.test(t),
    transform: () =>
      "MBA Essentials — LSE Executive Education (curso ejecutivo, no MBA)",
  },
  {
    name: "BMV diplomado",
    test: (t) => /Certificación BMV/.test(t),
    transform: () =>
      "Diplomado en Análisis Financiero — Bolsa Mexicana de Valores",
  },
  {
    name: "CNSF cédula",
    test: (t) =>
      /Asesora Autorizada CNSF/.test(t) && !/Cédula V388618/.test(t),
    transform: () =>
      "Asesora Autorizada CNSF · Cédula V388618 — Comisión Nacional de Seguros y Fianzas",
  },
];

const newLongBio = doc.longBio
  ?.map((b, i) => {
    if (removeIdx.has(i)) return null;
    if (!b.children) return b;
    // Concatenated text of the WHOLE block (across all children, with marks)
    const fullText = b.children.map((c) => c.text || "").join("");
    for (const r of REPLACEMENTS) {
      if (r.test(fullText)) {
        const newText = r.transform(fullText);
        console.log(
          `\n>>> [${i}] ${r.name} applied (block replace):\n  before: "${fullText.slice(0, 120)}"\n  after:  "${newText.slice(0, 120)}"`
        );
        // Build a single child preserving the FIRST child's marks if it had any (typically the "strong" intro of credential)
        const firstMarks = b.children[0]?.marks ?? [];
        const newChild = {
          _type: "span",
          _key: b.children[0]?._key ?? `child-${i}`,
          text: newText,
          marks: firstMarks,
        };
        return { ...b, children: [newChild], markDefs: b.markDefs ?? [] };
      }
    }
    return b;
  })
  .filter(Boolean);

const changed =
  JSON.stringify(newLongBio) !== JSON.stringify(doc.longBio);
if (!changed) {
  console.log("\nNothing to fix. Aborting.");
  process.exit(0);
}

console.log(
  `\nNew longBio blocks: ${newLongBio.length} (was ${doc.longBio.length})`
);

if (!APPLY) {
  console.log("\nDRY-RUN. Re-run with --apply to mutate the document.");
  process.exit(0);
}

console.log("\nApplying patch...");
const result = await mutate([
  {
    patch: {
      id: doc._id,
      set: { longBio: newLongBio },
    },
  },
]);
console.log("\n✅ Patch applied:", JSON.stringify(result, null, 2));
