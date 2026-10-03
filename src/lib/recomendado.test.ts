import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { limpiarRecomendadoPor } from "./recomendado.ts";
import { mensajeWhatsAppParaRuta, WA_MESSAGES } from "./whatsapp.ts";

describe("¿Quién te recomendó?", () => {
  it("conserva acentos, ñ y apellidos compuestos", () => {
    assert.equal(limpiarRecomendadoPor("  María José Peña-O'Neill  "), "María José Peña-O'Neill");
  });

  it("quita lo que no es un nombre (html, enlaces, emojis)", () => {
    assert.equal(limpiarRecomendadoPor("<b>Juan</b> https://x.com 😀"), "bJuanb httpsx.com");
  });

  it("vacío o no-texto → cadena vacía", () => {
    assert.equal(limpiarRecomendadoPor(undefined), "");
    assert.equal(limpiarRecomendadoPor(42), "");
    assert.equal(limpiarRecomendadoPor("   "), "");
  });

  it("acota a 80 caracteres", () => {
    assert.equal(limpiarRecomendadoPor("a".repeat(200)).length, 80);
  });
});

describe("WhatsApp: mensaje según la página", () => {
  it("las páginas en inglés mandan el mensaje en inglés", () => {
    assert.equal(mensajeWhatsAppParaRuta("/retirement-planning"), WA_MESSAGES.retirementPlanning);
    assert.equal(mensajeWhatsAppParaRuta("/foreigners-in-mexico"), WA_MESSAGES.foreignersInMexico);
    assert.equal(mensajeWhatsAppParaRuta("/international-health-insurance"), WA_MESSAGES.internationalHealth);
  });

  it("/retiro no se confunde con /retirement-planning", () => {
    assert.equal(mensajeWhatsAppParaRuta("/retiro"), WA_MESSAGES.retiro);
  });

  it("un artículo del blog usa el mensaje del blog; lo desconocido, el genérico", () => {
    assert.equal(mensajeWhatsAppParaRuta("/blog/modalidad-40-imss-conviene"), WA_MESSAGES.blog);
    assert.equal(mensajeWhatsAppParaRuta("/contacto"), WA_MESSAGES.default);
    assert.equal(mensajeWhatsAppParaRuta(null), WA_MESSAGES.default);
  });
});
