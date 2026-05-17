/**
 * Patch one-shot: inyecta dos bloques nuevos al article modalidad-40-imss-conviene
 *  1) externalToolLink al simulador IMSS — insertar justo ANTES del H2
 *     "¿A quién le conviene la Modalidad 40 y a quién no?" (key f4e0eb00cd55)
 *  2) ctaWhatsApp — insertar justo ANTES del disclaimer final (key 7233e4505035)
 *
 * Idempotente: chequea si ya existe un bloque del tipo apuntando al mismo URL
 * (simulador) o con la misma heading (CTA) antes de insertar.
 *
 * Después del patch, revalida la página vía /api/revalidate.
 *
 * Uso:  node scripts/patch-modalidad40-cta.mjs           (dry-run)
 *       node scripts/patch-modalidad40-cta.mjs --apply
 */
import { config } from "dotenv";
import { randomBytes } from "node:crypto";

config({ path: ".env.local" });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const API_VERSION = "2024-01-01";
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

if (!PROJECT_ID || !TOKEN) {
  console.error("✖ Falta NEXT_PUBLIC_SANITY_PROJECT_ID o SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");
const DOC_ID = "article-modalidad-40-imss-conviene";
const SLUG = "modalidad-40-imss-conviene";

const SIMULATOR_URL =
  "https://tspi.imss.gob.mx/serviciosperifericos-web/servicio/simularPension/inicio";

const newKey = () => randomBytes(6).toString("hex");

// ============================================================
// Bloques a insertar
// ============================================================
const externalToolBlock = {
  _key: newKey(),
  _type: "externalToolLink",
  badge: "Herramienta oficial",
  publisher: "IMSS",
  title: "Simula tu pensión con la herramienta oficial del IMSS",
  description:
    "Antes de tomar la decisión, prueba el simulador oficial. Mete tu salario, semanas cotizadas y régimen — te da una estimación de tu pensión con y sin Modalidad 40. Es el mismo motor que usa el IMSS internamente.",
  url: SIMULATOR_URL,
  buttonLabel: "Abrir simulador IMSS →",
};

const ctaWhatsAppBlock = {
  _key: newKey(),
  _type: "ctaWhatsApp",
  heading: "¿Quieres asegurar las cuotas de tu Modalidad 40?",
  text:
    "Si ya hiciste las cuentas y la Modalidad 40 te conviene, el siguiente paso es asegurar que vas a poder pagar las cuotas hasta el final. Platiquemos sobre el vehículo de ahorro que se ajusta a tu caso.",
  buttonLabel: "Escríbeme por WhatsApp",
  preFilledMessage: "Quiero ahorrar para garantizar mi modalidad 40",
};

// ============================================================
// Fetch doc actual
// ============================================================
async function fetchDoc() {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/doc/${DATASET}/${DOC_ID}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`fetch doc failed: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return j.documents?.[0];
}

// ============================================================
// Idempotencia: ya existe?
// ============================================================
function hasSimulatorBlock(body) {
  return body.some(
    (b) => b?._type === "externalToolLink" && b?.url === SIMULATOR_URL,
  );
}
function hasCtaWhatsAppBlock(body) {
  return body.some(
    (b) =>
      b?._type === "ctaWhatsApp" &&
      typeof b?.preFilledMessage === "string" &&
      b.preFilledMessage.toLowerCase().includes("modalidad 40"),
  );
}

// ============================================================
// Insert helpers (usa Sanity mutations API con before/after positions)
// ============================================================
async function insertBefore(blockToInsert, anchorKey) {
  const mutation = {
    mutations: [
      {
        patch: {
          id: DOC_ID,
          insert: {
            before: `body[_key=="${anchorKey}"]`,
            items: [blockToInsert],
          },
        },
      },
    ],
  };
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/mutate/${DATASET}`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mutation),
  });
  if (!r.ok) {
    throw new Error(`mutate failed: ${r.status} ${await r.text()}`);
  }
  return r.json();
}

// ============================================================
// Main
// ============================================================
(async () => {
  console.log(`▶ Doc: ${DOC_ID} (slug: ${SLUG})`);
  console.log(`▶ Modo: ${APPLY ? "APPLY (escribe)" : "DRY-RUN (solo verifica)"}`);
  console.log("");

  const doc = await fetchDoc();
  if (!doc) {
    console.error(`✖ Doc ${DOC_ID} no encontrado.`);
    process.exit(1);
  }
  const body = Array.isArray(doc.body) ? doc.body : [];
  console.log(`✓ Doc cargado — ${body.length} bloques`);

  // Anchors esperados
  const anchorSimulator = "f4e0eb00cd55"; // H2 "¿A quién le conviene...?"
  const anchorDisclaimer = "7233e4505035"; // disclaimer final
  const anchorSimulatorBlock = body.find((b) => b._key === anchorSimulator);
  const anchorDisclaimerBlock = body.find((b) => b._key === anchorDisclaimer);
  if (!anchorSimulatorBlock) {
    console.error(`✖ Anchor simulador (key ${anchorSimulator}) no encontrado en body.`);
    process.exit(1);
  }
  if (!anchorDisclaimerBlock) {
    console.error(`✖ Anchor disclaimer (key ${anchorDisclaimer}) no encontrado en body.`);
    process.exit(1);
  }
  console.log(`✓ Anchor 1 OK: ${anchorSimulator} = "${anchorSimulatorBlock.children?.[0]?.text}"`);
  console.log(`✓ Anchor 2 OK: ${anchorDisclaimer} = disclaimer`);

  // Idempotencia
  const simExists = hasSimulatorBlock(body);
  const ctaExists = hasCtaWhatsAppBlock(body);
  console.log("");
  console.log(`▶ Bloque simulador IMSS ya existe? ${simExists ? "SÍ — skip" : "NO — insertar"}`);
  console.log(`▶ Bloque CTA WhatsApp ya existe?  ${ctaExists ? "SÍ — skip" : "NO — insertar"}`);
  console.log("");

  if (!APPLY) {
    console.log("◌ DRY-RUN — no se aplica nada. Re-correr con --apply para escribir.");
    if (!simExists) {
      console.log("\n[DRY] Insertaría ANTES del H2 '¿A quién le conviene...?':");
      console.log(JSON.stringify(externalToolBlock, null, 2));
    }
    if (!ctaExists) {
      console.log("\n[DRY] Insertaría ANTES del disclaimer final:");
      console.log(JSON.stringify(ctaWhatsAppBlock, null, 2));
    }
    return;
  }

  if (!simExists) {
    console.log("→ Insertando externalToolLink antes del H2 '¿A quién le conviene...?'");
    await insertBefore(externalToolBlock, anchorSimulator);
    console.log("  ✓ OK");
  }
  if (!ctaExists) {
    console.log("→ Insertando ctaWhatsApp antes del disclaimer final");
    await insertBefore(ctaWhatsAppBlock, anchorDisclaimer);
    console.log("  ✓ OK");
  }

  // Revalidate
  if (REVALIDATE_SECRET) {
    console.log("\n→ Revalidate tag article:" + SLUG);
    try {
      const r = await fetch(`https://iriatalan.com.mx/api/revalidate?secret=${REVALIDATE_SECRET}&tag=article:${SLUG}`);
      console.log(`  Status: ${r.status} ${r.statusText}`);
    } catch (e) {
      console.log(`  ! Revalidate falló (no bloqueante, ISR=30s lo recoge igual): ${e.message}`);
    }
  } else {
    console.log("\n! REVALIDATE_SECRET no configurado — ISR=30s lo propagará igual.");
  }

  console.log("\n✓ Listo.");
})().catch((e) => {
  console.error("✖ Error:", e.message);
  process.exit(1);
});
