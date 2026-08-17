import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clasificarEtapa,
  mensajeParaEtapa,
  nombreDePila,
} from "./mensajes.ts";

// Lunes 17-ago-2026, 10:00 CDMX: día hábil, para que fraseDiaHabil sea estable.
const LUNES = new Date("2026-08-17T16:00:00Z");

describe("nombreDePila", () => {
  it("saca el primer nombre y lo capitaliza", () => {
    assert.equal(nombreDePila("MARIA FERNANDA LOPEZ"), "Maria");
    assert.equal(nombreDePila("antonio maqueda"), "Antonio");
  });

  it("vacío o null regresa cadena vacía, nunca 'undefined'", () => {
    assert.equal(nombreDePila(null), "");
    assert.equal(nombreDePila(undefined), "");
    assert.equal(nombreDePila("   "), "");
  });
});

describe("clasificarEtapa — nombres reales del embudo, con y sin acentos", () => {
  it("mapea las etapas nuevas del embudo VENTA", () => {
    assert.equal(clasificarEtapa("Nuevo"), "nuevo");
    assert.equal(clasificarEtapa("Contactado"), "contactado");
    assert.equal(clasificarEtapa("Propuesta en preparación"), "preparacion");
    assert.equal(clasificarEtapa("Propuesta enviada"), "enviada");
    assert.equal(clasificarEtapa("Seguimiento / Negociación"), "seguimiento");
    assert.equal(clasificarEtapa("Pospuesto este año"), "pospuesto");
    assert.equal(clasificarEtapa("Pospuesto futuro"), "pospuesto");
  });

  it("entiende también los nombres viejos (pre-migración)", () => {
    assert.equal(clasificarEtapa("Lead RS / Webpage"), "nuevo");
    assert.equal(clasificarEtapa("Iria Contactado"), "contactado");
    assert.equal(clasificarEtapa("Propuesta pendiente"), "preparacion");
    assert.equal(clasificarEtapa("Propuesta Presentada"), "enviada");
  });

  it("lo desconocido cae a 'otra', no truena", () => {
    assert.equal(clasificarEtapa("Fase Cierre X"), "otra");
    assert.equal(clasificarEtapa(""), "otra");
  });
});

describe("mensajeParaEtapa", () => {
  it("saluda por nombre cuando lo hay", () => {
    const m = mensajeParaEtapa("nuevo", "Antonio Maqueda", LUNES);
    assert.ok(m.startsWith("¡Hola Antonio!"));
  });

  it("sin nombre saluda sin hueco raro", () => {
    const m = mensajeParaEtapa("nuevo", null, LUNES);
    assert.ok(m.startsWith("¡Hola! "));
    assert.ok(!m.includes("undefined"));
  });

  it("el apellido de Iria va sin acento (Talan)", () => {
    const m = mensajeParaEtapa("nuevo", "Ana", LUNES);
    assert.ok(m.includes("Iria Talan"));
    assert.ok(!m.includes("Talán"));
  });

  it("cada etapa tiene mensaje no vacío", () => {
    for (const etapa of [
      "nuevo",
      "contactado",
      "preparacion",
      "enviada",
      "seguimiento",
      "pospuesto",
      "otra",
    ] as const) {
      const m = mensajeParaEtapa(etapa, "Ana", LUNES);
      assert.ok(m.length > 40, `mensaje raquítico para ${etapa}`);
    }
  });

  it("'nuevo' compromete fecha sin decir 'hoy mismo' (la propuesta no es instantánea)", () => {
    const m = mensajeParaEtapa("nuevo", "Ana", LUNES);
    assert.ok(!m.includes("hoy mismo"));
    assert.ok(m.includes("a más tardar"));
  });
});
