// FASE 0.3 del plan AEO — cerrar los huecos de E-E-A-T de los artículos vivos.
// Patch quirúrgico (NUNCA createOrReplace): solo toca los campos faltantes.
//
//   1. `author` → st6-imss-pension-orfandad-sin-limite-edad, incremento-costos-universitarios-mexico
//   2. `sources` → los 4 artículos que estaban en cero
//   3. `heroImage` → st6 (era el único sin hero)
//
// Todas las URLs de `sources` se verificaron una por una contra la fuente real
// (ver comentario de cada bloque). Citar fuentes es el factor #1 de citación por
// IA, pero una fuente inventada o que no dice lo que el artículo afirma hace más
// daño que no tener ninguna — sobre todo en contenido YMYL.
//
// Antes de escribir, el script revalida por HTTP que cada URL siga respondiendo.
// Si alguna falla, aborta: mejor no publicar una fuente muerta.
//
// Uso:
//   node scripts/fix-eeat-dia5.mjs            # dry-run + chequeo de URLs
//   node scripts/fix-eeat-dia5.mjs --apply    # escribe
//   node scripts/fix-eeat-dia5.mjs --skip-url-check   # sin chequeo (offline)

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [
        l.slice(0, i).replace(/^﻿/, "").trim(),
        l.slice(i + 1).trim().replace(/^['"]|['"]$/g, ""),
      ];
    }),
);
const {
  NEXT_PUBLIC_SANITY_PROJECT_ID: PROJ,
  NEXT_PUBLIC_SANITY_DATASET: DS,
  SANITY_API_WRITE_TOKEN: TOKEN,
} = env;
const VER = env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";
const APPLY = process.argv.includes("--apply");
const SKIP_URL_CHECK = process.argv.includes("--skip-url-check");
const key = () => crypto.randomBytes(6).toString("hex");

if (!TOKEN) {
  console.error("❌ Falta SANITY_API_WRITE_TOKEN en .env.local");
  process.exit(1);
}

async function q(groq) {
  const r = await fetch(
    `https://${PROJ}.api.sanity.io/v${VER}/data/query/${DS}?query=${encodeURIComponent(groq)}`,
    { headers: { Authorization: `Bearer ${TOKEN}` } },
  );
  if (!r.ok) {
    console.error("Query error", r.status, await r.text());
    process.exit(1);
  }
  return (await r.json()).result;
}

async function mutate(mutations) {
  const r = await fetch(
    `https://${PROJ}.api.sanity.io/v${VER}/data/mutate/${DS}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutations }),
    },
  );
  const j = await r.json();
  if (!r.ok) {
    console.error("MUTATE ERROR", r.status, JSON.stringify(j));
    process.exit(1);
  }
  return j;
}

const AUTOR_IRIA = "e61428b9-62f9-45a5-91cd-85b85454c120"; // *[_type=="author"] → único
const HERO_DISCAPACIDAD = "image-552dbf74ff303477c4ba6fa7201baf10d0233a09-1376x768-jpg"; // gemelo sin usar de hero-manos-familia-discapacidad

// ─────────────────────────────────────────────────────────────
// FUENTES VERIFICADAS
// Cada entrada se comprobó contra el documento real: la nota dice qué
// afirmación del artículo respalda.
// ─────────────────────────────────────────────────────────────
const s = (title, url, publisher) => ({ _key: key(), _type: "source", title, url, publisher });

const FUENTE = {
  // Texto verificado: "los hijos mayores de 16 años que tengan dictaminada
  // incapacidad total […] podrán solicitar pensión de orfandad" + requisito
  // explícito del "dictamen ST-6" y de 150 semanas de cotización.
  imssOrfandad: () =>
    s(
      "Homoclave IMSS-01-004-C — Solicitud de Pensión de Orfandad, Modalidad C: hijo mayor de 16 años incapacitado (requiere dictamen ST-6)",
      "https://www.gob.mx/imss/articulos/homoclave-imss-01-004-c?idiom=es",
      "IMSS · gob.mx",
    ),
  // Folleto institucional del propio formato ST-6 para hija o hijo.
  imssST6: () =>
    s(
      "Dictamen de Beneficiario Incapacitado ST-6, para hija o hijo",
      "https://www.imss.gob.mx/sites/all/statics/elssa/docs/Linea11/L11-02-ST6-Incapacidad-Hijo.pdf",
      "IMSS",
    ),
  // Respalda el pasaje sobre la sustitución de la interdicción por el modelo de
  // apoyos: "El estado de interdicción es inconstitucional e inconvencional" y
  // que el sistema de apoyos "puede ser formalizado por medio jurisdiccional o
  // por la vía notarial" — que es justo la Ruta A / Ruta B del artículo.
  scjnCapacidad: () =>
    s(
      "Apuntes sobre derechos de las personas con discapacidad: reconocimiento de la capacidad jurídica y sistema de apoyos",
      "https://www.scjn.gob.mx/derechos-humanos/sites/default/files/Publicaciones/archivos/2024-02/apuntes-Capacidad-Juridica.pdf",
      "Suprema Corte de Justicia de la Nación",
    ),
  // Art. 12 — igual reconocimiento como persona ante la ley.
  onuCdpd: () =>
    s(
      "Convención sobre los Derechos de las Personas con Discapacidad — artículo 12, igual reconocimiento como persona ante la ley",
      "https://www.un.org/esa/socdev/enable/documents/tccconvs.pdf",
      "Organización de las Naciones Unidas",
    ),
  // Respalda "revisa a quién pusiste como beneficiario en tu Afore".
  consarBeneficiarios: () =>
    s(
      "Retiro por Beneficiarios (IMSS): qué pasa con los recursos de la cuenta Afore cuando fallece el trabajador",
      "https://www.gob.mx/consar/articulos/retiro-por-beneficiarios-imss",
      "CONSAR · gob.mx",
    ),
  // Respalda el apartado ISSSTE (pensión de orfandad, hijo mayor incapacitado).
  profedetIssste: () =>
    s(
      "Pensiones previstas en las Leyes del ISSSTE (incluye pensión de orfandad)",
      "https://www.profedet.gob.mx/profedet/pdf/pensiones-previstas-leyes-issste.pdf",
      "PROFEDET · gob.mx",
    ),
  // Art. 93 fr. XXI: no se paga ISR por "las cantidades que paguen las
  // instituciones de seguros a los asegurados o a sus beneficiarios cuando
  // ocurra el riesgo amparado". Respalda el "libre de impuestos" del artículo.
  lisr: () =>
    s(
      "Ley del Impuesto sobre la Renta — artículo 93, fracción XXI (exención de las cantidades pagadas por instituciones de seguros a los beneficiarios)",
      "https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf",
      "Cámara de Diputados",
    ),
  // Art. 381: definición legal del fideicomiso.
  lgtoc: () =>
    s(
      "Ley General de Títulos y Operaciones de Crédito — artículo 381 y siguientes (fideicomiso)",
      "https://www.diputados.gob.mx/LeyesBiblio/pdf/LGTOC.pdf",
      "Cámara de Diputados",
    ),
  cnsfRenta: () =>
    s(
      "Documento de Oferta de Renta Vitalicia — formatos oficiales",
      "https://www.gob.mx/cnsf/documentos/documento-de-oferta-de-renta-vitalicia-formatos",
      "CNSF · gob.mx",
    ),
  inegiEsperanza: () =>
    s(
      "Esperanza de vida al nacer en México",
      "https://cuentame.inegi.org.mx/descubre/poblacion/esperanza_de_vida/",
      "INEGI",
    ),
  banxicoUdi: () =>
    s(
      "Valor de la UDI (Unidad de Inversión) — serie histórica",
      "https://www.banxico.org.mx/SieInternet/consultarDirectorioInternetAction.do?sector=8&accion=consultarCuadro&idCuadro=CP150&locale=es",
      "Banco de México",
    ),
  condusefAdultos: () =>
    s(
      "Los adultos mayores son más vulnerables ante fraudes financieros",
      "https://www.condusef.gob.mx/?p=contenido&idc=384&idcat=1",
      "CONDUSEF",
    ),
  // Contiene el renglón "INPC Educación (colegiaturas)" — es la referencia
  // oficial para verificar la inflación de colegiaturas en México.
  inegiInpc: () =>
    s(
      "Índice Nacional de Precios al Consumidor — componente Educación (colegiaturas), marzo 2026",
      "https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/inpc/inpc_2q2026_04.pdf",
      "INEGI",
    ),
};

// ─────────────────────────────────────────────────────────────
// PLAN DE PATCHES
// ─────────────────────────────────────────────────────────────
const PLAN = [
  {
    slug: "st6-imss-pension-orfandad-sin-limite-edad",
    setAuthor: true,
    // Único artículo sin hero. Se reutiliza el gemelo sin usar de la imagen de
    // `proteger-hijo-con-discapacidad`: mismo tema (familia y discapacidad).
    // Si Iria prefiere una imagen propia, se sustituye en Studio.
    setHero: {
      _type: "image",
      asset: { _type: "reference", _ref: HERO_DISCAPACIDAD },
      alt: "Manos de una familia entrelazadas, representando el cuidado de un hijo con discapacidad",
    },
    sources: null, // ya tenía 4
  },
  {
    slug: "incremento-costos-universitarios-mexico",
    setAuthor: true,
    sources: [FUENTE.inegiInpc()],
  },
  {
    slug: "rentas-vitalicias-mexico",
    // Las 4 ya estaban enlazadas en el cuerpo del artículo: se promueven al
    // bloque de Fuentes para que sean legibles por máquina.
    sources: [
      FUENTE.inegiEsperanza(),
      FUENTE.banxicoUdi(),
      FUENTE.cnsfRenta(),
      FUENTE.condusefAdultos(),
    ],
  },
  {
    slug: "proteger-hijo-con-discapacidad-cuando-yo-falte",
    sources: [
      FUENTE.imssOrfandad(),
      FUENTE.imssST6(),
      FUENTE.scjnCapacidad(),
      FUENTE.onuCdpd(),
      FUENTE.consarBeneficiarios(),
      FUENTE.profedetIssste(),
    ],
  },
  {
    slug: "como-dejar-dinero-hijo-autismo-discapacidad-mexico",
    sources: [
      FUENTE.lisr(),
      FUENTE.lgtoc(),
      FUENTE.scjnCapacidad(),
      FUENTE.imssOrfandad(),
      FUENTE.cnsfRenta(),
      FUENTE.onuCdpd(),
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 1. Chequeo de URLs
// ─────────────────────────────────────────────────────────────
const todasLasUrls = [
  ...new Set(PLAN.flatMap((p) => (p.sources ?? []).map((f) => f.url))),
];

/**
 * Hosts cuyo TLS rechaza el cliente de Node aunque la página esté viva. La URL
 * de CONDUSEF se verificó a mano (responde 200 y contiene el contenido citado);
 * su handshake simplemente no negocia con `fetch`. Un error de red aquí no es
 * evidencia de que la fuente esté muerta.
 */
const TLS_QUISQUILLOSOS = ["condusef.gob.mx"];

if (!SKIP_URL_CHECK) {
  console.log(`=== Verificando ${todasLasUrls.length} URLs ===`);
  let muertas = 0;
  let avisos = 0;
  for (const url of todasLasUrls) {
    try {
      // Algunos sitios de gobierno rechazan HEAD → GET con abort temprano.
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20000);
      const r = await fetch(url, {
        signal: ctrl.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; iriatalan-link-check)" },
      });
      clearTimeout(t);
      // Un 4xx/5xx sí es evidencia de fuente muerta: eso aborta.
      if (!r.ok) muertas++;
      console.log(`  ${r.ok ? "✅" : "❌"} ${r.status}  ${url}`);
    } catch (e) {
      const tolerado = TLS_QUISQUILLOSOS.some((h) => url.includes(h));
      if (tolerado) {
        avisos++;
        console.log(`  ⚠️  sin verificar por TLS de Node (revisada a mano)  ${url}`);
      } else {
        muertas++;
        console.log(`  ❌ ERR (${e.message})  ${url}`);
      }
    }
  }
  if (muertas > 0) {
    console.error(
      `\n❌ ${muertas} URL(s) devolvieron error. No se escribe nada: una fuente muerta resta credibilidad en vez de sumarla.`,
    );
    process.exit(1);
  }
  console.log(
    avisos > 0
      ? `  Sin errores HTTP (${avisos} sin verificar automáticamente).\n`
      : "  Todas responden.\n",
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Estado actual + armado de mutaciones
// ─────────────────────────────────────────────────────────────
const muts = [];
console.log("=== Plan de patches ===");

for (const p of PLAN) {
  const doc = await q(
    `*[_type=="article" && slug.current=="${p.slug}"][0]{_id, "author":author._ref, "hero":heroImage.asset._ref, "nSources":count(sources)}`,
  );
  if (!doc?._id) {
    console.error(`❌ No existe el artículo ${p.slug}`);
    process.exit(1);
  }

  const set = {};
  const notas = [];

  if (p.setAuthor) {
    if (doc.author) {
      notas.push(`= author ya estaba (${doc.author})`);
    } else {
      set.author = { _type: "reference", _ref: AUTOR_IRIA };
      notas.push("+ author → Iria Talan");
    }
  }

  if (p.setHero) {
    if (doc.hero) {
      notas.push(`= heroImage ya estaba (${doc.hero})`);
    } else {
      set.heroImage = p.setHero;
      notas.push(`+ heroImage → ${p.setHero.asset._ref}`);
    }
  }

  if (p.sources) {
    if ((doc.nSources ?? 0) > 0) {
      notas.push(`= sources ya tenía ${doc.nSources} — no se pisan`);
    } else {
      set.sources = p.sources;
      notas.push(`+ sources → ${p.sources.length} fuentes verificadas`);
    }
  }

  console.log(`\n${p.slug}  (${doc._id})`);
  notas.forEach((n) => console.log("   " + n));

  if (Object.keys(set).length > 0) {
    // `lastReviewed` refleja que hoy se revisó el artículo: es señal de frescura
    // real, no inventada.
    set.lastReviewed = new Date().toISOString().slice(0, 10);
    muts.push({ patch: { id: doc._id, set } });
  }
}

// ─────────────────────────────────────────────────────────────
if (muts.length === 0) {
  console.log("\nNada que aplicar — todo estaba ya en su lugar.");
  process.exit(0);
}

if (!APPLY) {
  console.log(
    `\n🟡 DRY-RUN — ${muts.length} documento(s) se patchearían. Corre con --apply para escribir.`,
  );
  process.exit(0);
}

const res = await mutate(muts);
console.log(
  `\n✅ ${muts.length} documento(s) patcheado(s). transactionId=${res.transactionId || "?"}`,
);
