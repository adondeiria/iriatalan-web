import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { esAccionValida, firmarAccion, verificarAccion } from "./token.ts";

const SECRETO = "secreto-de-prueba-nada-productivo";

describe("token de acción de la cabina", () => {
  it("firma y verifica la misma acción sobre el mismo trato", () => {
    const t = firmarAccion("propuesta-enviada", 347, SECRETO);
    assert.equal(verificarAccion("propuesta-enviada", 347, t, SECRETO), true);
  });

  it("el token de un trato NO sirve para otro", () => {
    const t = firmarAccion("propuesta-enviada", 347, SECRETO);
    assert.equal(verificarAccion("propuesta-enviada", 348, t, SECRETO), false);
  });

  it("EL CASO QUE IMPORTA: el token de una acción NO ejecuta la otra", () => {
    const enviada = firmarAccion("propuesta-enviada", 347, SECRETO);
    const cotizacion = firmarAccion("pidio-cotizacion", 347, SECRETO);

    // Cruzados: cada token solo abre su propia puerta.
    assert.equal(verificarAccion("pidio-cotizacion", 347, enviada, SECRETO), false);
    assert.equal(verificarAccion("propuesta-enviada", 347, cotizacion, SECRETO), false);

    // Y son firmas distintas, no la misma con otro nombre.
    assert.notEqual(enviada, cotizacion);
  });

  it("una acción inventada nunca valida, aunque el token sea real", () => {
    const t = firmarAccion("propuesta-enviada", 347, SECRETO);
    assert.equal(verificarAccion("borrar-todo", 347, t, SECRETO), false);
    assert.equal(verificarAccion("", 347, t, SECRETO), false);
  });

  it("cambiar el secreto invalida todo", () => {
    const t = firmarAccion("propuesta-enviada", 347, SECRETO);
    assert.equal(verificarAccion("propuesta-enviada", 347, t, "otro"), false);
  });

  it("basura no truena: false, no excepción", () => {
    assert.equal(verificarAccion("propuesta-enviada", 347, "a", SECRETO), false);
    assert.equal(verificarAccion("propuesta-enviada", 347, "zz-no-hex", SECRETO), false);
    assert.equal(verificarAccion("propuesta-enviada", 347, "", SECRETO), false);
    assert.equal(
      verificarAccion("propuesta-enviada", NaN, firmarAccion("propuesta-enviada", 1, SECRETO), SECRETO),
      false,
    );
    assert.equal(
      verificarAccion("propuesta-enviada", -5, firmarAccion("propuesta-enviada", -5, SECRETO), SECRETO),
      false,
    );
    assert.equal(
      verificarAccion("propuesta-enviada", 1, firmarAccion("propuesta-enviada", 1, SECRETO), ""),
      false,
    );
  });

  it("un bit cambiado en el token = false", () => {
    const t = firmarAccion("pidio-cotizacion", 347, SECRETO);
    const alterado = (t[0] === "0" ? "1" : "0") + t.slice(1);
    assert.equal(verificarAccion("pidio-cotizacion", 347, alterado, SECRETO), false);
  });

  it("el token es hex de 64 (sha256) — formato estable para URLs", () => {
    assert.match(firmarAccion("propuesta-enviada", 1, SECRETO), /^[0-9a-f]{64}$/);
  });

  it("esAccionValida solo acepta las dos acciones reales", () => {
    assert.equal(esAccionValida("propuesta-enviada"), true);
    assert.equal(esAccionValida("pidio-cotizacion"), true);
    assert.equal(esAccionValida("otra-cosa"), false);
  });
});
