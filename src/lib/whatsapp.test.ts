import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { mensajeWhatsAppParaRuta, WA_MESSAGES } from "./whatsapp.ts";

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
