import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  construirDigest,
  NOMBRE,
  TOPE_POR_SECCION,
  type DatosDigest,
  type ProspectoDigest,
} from "./digest.ts";
import { firmarAccion } from "./token.ts";

const CFG = {
  siteUrl: "https://iriatalan.com.mx",
  secreto: "secreto-test",
  ahora: new Date("2026-08-17T16:00:00Z"), // lunes 10:00 CDMX
};

const prospecto = (extra: Partial<ProspectoDigest> = {}): ProspectoDigest => ({
  dealId: 100,
  titulo: "ANA LOPEZ GMM",
  nombrePersona: "Ana Lopez",
  telefono: "+525537338976",
  nombreEtapa: "Propuesta pendiente",
  actividad: null,
  vence: null,
  diasEsperando: 3,
  debeCotizacion: false,
  esperandoCliente: false,
  prioridad: false,
  ...extra,
});

const vacio: DatosDigest = {
  debenCotizacion: [],
  vencidos: [],
  hoy: [],
  fugas: [],
};

describe("construirDigest", () => {
  it("sin nada que hacer regresa null (ese día no hay correo)", () => {
    assert.equal(construirDigest(vacio, CFG), null);
  });

  it("el asunto lleva el conteo real de cada sección", () => {
    const d = construirDigest(
      {
        debenCotizacion: [prospecto({ dealId: 1, debeCotizacion: true })],
        vencidos: [prospecto({ dealId: 2 }), prospecto({ dealId: 3 })],
        hoy: [prospecto({ dealId: 4 })],
        fugas: [prospecto({ dealId: 5 })],
      },
      CFG,
    );
    assert.ok(d);
    assert.equal(
      d.asunto,
      "LEADS RIF: 1 esperan cotización, 2 vencidos, 1 para hoy, 1 sin siguiente paso",
    );
  });

  it("el nombre del correo es el mismo en asunto y encabezado", () => {
    // Iria lo busca por este nombre en su bandeja: si el remitente dijera una
    // cosa y el asunto otra, dejaría de ser reconocible de un vistazo.
    const d = construirDigest({ ...vacio, hoy: [prospecto()] }, CFG);
    assert.ok(d);
    assert.ok(d.asunto.startsWith(`${NOMBRE}:`));
    assert.ok(d.html.includes(NOMBRE));
  });

  it("cada prospecto con teléfono trae su wa.me con mensaje", () => {
    const d = construirDigest({ ...vacio, hoy: [prospecto()] }, CFG);
    assert.ok(d);
    assert.ok(d.html.includes("https://wa.me/525537338976?text="));
    assert.ok(d.html.includes("Ana"));
  });

  it("sin teléfono no hay botón de WhatsApp, pero sí el de Pipedrive", () => {
    const d = construirDigest({ ...vacio, hoy: [prospecto({ telefono: null })] }, CFG);
    assert.ok(d);
    assert.ok(!d.html.includes("wa.me"));
    assert.ok(d.html.includes("pipedrive.com/deal/100"));
  });

  it("muestra los días esperando", () => {
    const d = construirDigest({ ...vacio, hoy: [prospecto({ diasEsperando: 12 })] }, CFG);
    assert.ok(d);
    assert.ok(d.html.includes("12 días esperando"));
  });

  it("un solo día se escribe en singular", () => {
    const d = construirDigest({ ...vacio, hoy: [prospecto({ diasEsperando: 1 })] }, CFG);
    assert.ok(d);
    assert.ok(d.html.includes("1 día esperando"));
    assert.ok(!d.html.includes("1 días"));
  });
});

describe("acciones y sus tokens", () => {
  it("'✅ Propuesta enviada' aparece cuando el trato debe cotización", () => {
    const d = construirDigest(
      { ...vacio, debenCotizacion: [prospecto({ debeCotizacion: true })] },
      CFG,
    );
    assert.ok(d);
    const t = firmarAccion("propuesta-enviada", 100, CFG.secreto);
    // El `&` viaja como `&amp;`: es lo correcto dentro de un href en HTML.
    assert.ok(
      d.html.includes(`a=propuesta-enviada&amp;deal=100&amp;t=${t}`),
      "falta el link de propuesta enviada",
    );
  });

  it("'📋 Me pidió cotización' SOLO aparece en las fugas", () => {
    const enFugas = construirDigest({ ...vacio, fugas: [prospecto()] }, CFG);
    assert.ok(enFugas);
    const t = firmarAccion("pidio-cotizacion", 100, CFG.secreto);
    assert.ok(enFugas.html.includes(`a=pidio-cotizacion&amp;deal=100&amp;t=${t}`));

    // En "para hoy" no tiene sentido: ya tiene un pendiente agendado.
    const enHoy = construirDigest({ ...vacio, hoy: [prospecto()] }, CFG);
    assert.ok(enHoy);
    assert.ok(!enHoy.html.includes("pidio-cotizacion"));
  });

  it("EL CASO QUE IMPORTA: los tokens de las dos acciones son distintos", () => {
    const enviada = firmarAccion("propuesta-enviada", 100, CFG.secreto);
    const cotiza = firmarAccion("pidio-cotizacion", 100, CFG.secreto);
    assert.notEqual(enviada, cotiza);
  });

  it("una fuga que ya debe cotización no ofrece 'me pidió cotización'", () => {
    const d = construirDigest(
      { ...vacio, fugas: [prospecto({ debeCotizacion: true })] },
      CFG,
    );
    assert.ok(d);
    assert.ok(!d.html.includes("pidio-cotizacion"));
  });
});

describe("orden y tope por sección", () => {
  it("los que llevan más días esperando salen primero", () => {
    const d = construirDigest(
      {
        ...vacio,
        debenCotizacion: [
          prospecto({ dealId: 1, nombrePersona: "Reciente", diasEsperando: 1 }),
          prospecto({ dealId: 2, nombrePersona: "Antiguo", diasEsperando: 30 }),
        ],
      },
      CFG,
    );
    assert.ok(d);
    assert.ok(
      d.html.indexOf("Antiguo") < d.html.indexOf("Reciente"),
      "el más viejo debe ir primero",
    );
  });

  it("⭐ Prioridad sube por encima de los más viejos", () => {
    const d = construirDigest(
      {
        ...vacio,
        debenCotizacion: [
          prospecto({ dealId: 1, nombrePersona: "Viejo", diasEsperando: 30 }),
          prospecto({ dealId: 2, nombrePersona: "Estrella", diasEsperando: 1, prioridad: true }),
        ],
      },
      CFG,
    );
    assert.ok(d);
    assert.ok(d.html.indexOf("Estrella") < d.html.indexOf("Viejo"));
    assert.ok(d.html.includes("⭐ Estrella"));
  });

  it("⏸ Esperando al cliente se va al fondo aunque sea el más viejo", () => {
    const d = construirDigest(
      {
        ...vacio,
        hoy: [
          prospecto({ dealId: 1, nombrePersona: "EnSuCancha", diasEsperando: 90, esperandoCliente: true }),
          prospecto({ dealId: 2, nombrePersona: "MiPendiente", diasEsperando: 2 }),
        ],
      },
      CFG,
    );
    assert.ok(d);
    assert.ok(
      d.html.indexOf("MiPendiente") < d.html.indexOf("EnSuCancha"),
      "lo que espera al cliente no debe encabezar la lista",
    );
  });

  it(`tope de ${TOPE_POR_SECCION}: el resto se resume, no se pierde`, () => {
    const muchos = Array.from({ length: 25 }, (_, i) =>
      prospecto({
        dealId: 1000 + i,
        nombrePersona: `Persona${i}`,
        diasEsperando: 25 - i, // el 0 es el más viejo
      }),
    );
    const d = construirDigest({ ...vacio, fugas: muchos }, CFG);
    assert.ok(d);

    // El encabezado dice el total real, no el recortado.
    assert.ok(d.html.includes("(25)"));
    // Se ven los 10 más viejos y no el número 11.
    assert.ok(d.html.includes("Persona0"));
    assert.ok(d.html.includes("Persona9"));
    assert.ok(!d.html.includes("Persona10"));
    // Y se avisa cuántos quedaron fuera.
    assert.ok(d.html.includes("y otros 15"));
  });

  it("con 10 o menos no aparece el pie de 'y otros'", () => {
    const diez = Array.from({ length: TOPE_POR_SECCION }, (_, i) =>
      prospecto({ dealId: 2000 + i, nombrePersona: `P${i}` }),
    );
    const d = construirDigest({ ...vacio, fugas: diez }, CFG);
    assert.ok(d);
    assert.ok(!d.html.includes("y otros"));
  });
});

describe("seguridad del HTML", () => {
  it("títulos con HTML no se inyectan", () => {
    const d = construirDigest(
      {
        ...vacio,
        hoy: [
          prospecto({
            nombrePersona: null,
            titulo: '<img src=x onerror=alert(1)>',
          }),
        ],
      },
      CFG,
    );
    assert.ok(d);
    assert.ok(!d.html.includes("<img src=x"));
    assert.ok(d.html.includes("&lt;img"));
  });

  it("una sección vacía no imprime su encabezado", () => {
    const d = construirDigest({ ...vacio, hoy: [prospecto()] }, CFG);
    assert.ok(d);
    assert.ok(!d.html.includes("Vencidos"));
    assert.ok(!d.html.includes("Te deben cotización"));
    assert.ok(d.html.includes("Para hoy"));
  });
});
