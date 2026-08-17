import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizarTelefono } from "../pipedrive.ts";

describe("normalizarTelefono — captura desde el celular", () => {
  it("10 dígitos mexicanos reciben +52", () => {
    assert.equal(normalizarTelefono("5537338976"), "+525537338976");
  });

  it("acepta el formato con espacios que se copia de WhatsApp", () => {
    assert.equal(normalizarTelefono("55 3733 8976"), "+525537338976");
    assert.equal(normalizarTelefono("55-3733-8976"), "+525537338976");
    assert.equal(normalizarTelefono("(55) 3733 8976"), "+525537338976");
  });

  it("ya con +52 se queda igual", () => {
    assert.equal(normalizarTelefono("+52 55 3733 8976"), "+525537338976");
  });

  it("12 dígitos que empiezan con 52 se toman como mexicanos", () => {
    assert.equal(normalizarTelefono("525537338976"), "+525537338976");
  });

  it("EL BUG QUE YA MORDIÓ: un +1 de EE.UU. NO se convierte en mexicano", () => {
    // La regla vieja de "quitar el 1 de 11 dígitos" agarraba los +1 y dejaba
    // a 6 clientes con un celular mexicano ajeno.
    assert.equal(normalizarTelefono("+19178339767"), "+19178339767");
    assert.ok(!normalizarTelefono("+19178339767").startsWith("+52"));
  });

  it("otras ladas extranjeras se respetan", () => {
    assert.equal(normalizarTelefono("+49 30 12345678"), "+493012345678");
    assert.equal(normalizarTelefono("+971 50 1234567"), "+971501234567");
    assert.equal(normalizarTelefono("+33 6 12 34 56 78"), "+33612345678");
  });

  it("vacío devuelve vacío, no un '+' suelto", () => {
    assert.equal(normalizarTelefono(""), "");
    assert.equal(normalizarTelefono("   "), "");
    assert.equal(normalizarTelefono("sin numero"), "");
  });
});
