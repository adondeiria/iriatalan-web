// Crea 5 documentos faq para el 4to articulo y los enlaza en article.faqs.
// Genera FAQPage JSON-LD + render visual "Preguntas relacionadas". Requiere --apply.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n").filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const { NEXT_PUBLIC_SANITY_PROJECT_ID: PID, NEXT_PUBLIC_SANITY_DATASET: DS, SANITY_API_WRITE_TOKEN: TOKEN } = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const ART = "article-hijo-discapacidad-cuando-yo-falte";

const FAQS = [
  ["faq-disc-1", "¿Quién cuidará a mi hijo con autismo cuando yo falte?",
   "Dependerá de la red de apoyo y de la estructura legal que hayas establecido previamente."],
  ["faq-disc-2", "¿Un testamento es suficiente para proteger a un hijo con discapacidad?",
   "Normalmente no. En muchos casos también es necesario revisar beneficiarios, seguros de vida y mecanismos de administración patrimonial."],
  ["faq-disc-3", "¿Necesito un fideicomiso para mi hijo?",
   "Depende de la situación familiar y patrimonial de cada familia."],
  ["faq-disc-4", "¿Puedo dejar un seguro de vida para proteger a mi hijo?",
   "Sí. Muchas familias utilizan seguros de vida para generar liquidez inmediata cuando ocurre un fallecimiento."],
  ["faq-disc-5", "¿Cuándo debo empezar a planear?",
   "Hoy. Mientras más tiempo tengas para estructurar la estrategia, más opciones tendrás disponibles."],
];

let k = 0;
const block = (text) => ([{ _type:"block",_key:`a${++k}`,style:"normal",markDefs:[],children:[{_type:"span",_key:`s${++k}`,text,marks:[]}] }]);

const mutations = [];
for (const [id, question, answer] of FAQS) {
  mutations.push({ createOrReplace: { _id: id, _type: "faq", question, answer: block(answer), topic: "patrimonial" } });
}
mutations.push({ patch: { id: ART, set: { faqs: FAQS.map(([id]) => ({ _type:"reference", _key:`ref-${id}`, _ref:id })) } } });

FAQS.forEach(([,q,a]) => console.log(`- ${q}\n  → ${a}`));
if (!process.argv.includes("--apply")) { console.log("\nDRY-RUN. Corre con --apply para crear y enlazar."); process.exit(0); }

const r = await fetch(`https://${PID}.api.sanity.io/v${VER}/data/mutate/${DS}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ mutations }),
});
if (!r.ok) { console.error("ERROR", r.status, await r.text()); process.exit(1); }
console.log("\nOK · 5 FAQ creadas y enlazadas a article.faqs");
