import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { estaEncendido, pasaCanary, secretoValido } from "./lead-whatsapp.ts";

const SECRETO = "secreto-de-prueba-nada-productivo";

describe("secreto del endpoint de leads por WhatsApp", () => {
  it("acepta el secreto correcto", () => {
    assert.equal(secretoValido(SECRETO, SECRETO), true);
  });

  it("rechaza uno distinto de la misma longitud", () => {
    const otro = "s".repeat(SECRETO.length);
    assert.equal(secretoValido(otro, SECRETO), false);
  });

  it("rechaza longitudes distintas SIN lanzar", () => {
    // timingSafeEqual lanza si difieren; un throw aquí sería 500 en vez de 401.
    assert.equal(secretoValido("corto", SECRETO), false);
    assert.equal(secretoValido(SECRETO + "extra", SECRETO), false);
  });

  it("rechaza el vacío, y también si el esperado está vacío", () => {
    assert.equal(secretoValido("", SECRETO), false);
    assert.equal(secretoValido("loquesea", ""), false);
    assert.equal(secretoValido("", ""), false);
  });
});

describe("interruptor global", () => {
  it("apagado si la variable no existe", () => {
    assert.equal(estaEncendido({}), false);
  });

  it("solo enciende con el texto exacto 'true'", () => {
    assert.equal(
      estaEncendido({ LEAD_WHATSAPP_ENABLED: "true" }),
      true,
    );
    for (const v of ["TRUE", "1", "si", "yes", " true", ""]) {
      assert.equal(
        estaEncendido({ LEAD_WHATSAPP_ENABLED: v }),
        false,
        `"${v}" no debe encender`,
      );
    }
  });
});

describe("compuerta canary", () => {
  const canary = { LEAD_WHATSAPP_SOLO_TELEFONO: "5537338976" };

  it("sin variable, pasa cualquiera (producción)", () => {
    assert.equal(pasaCanary("+525537338976", {}), true);
    assert.equal(pasaCanary("+522228679066", {}), true);
  });

  it("con canary, solo pasa ese número", () => {
    assert.equal(pasaCanary("+525537338976", canary), true);
    assert.equal(pasaCanary("+522228679066", canary), false);
  });

  it("EL CASO QUE IMPORTA: variable a medias FALLA CERRADA", () => {
    // Una variable mal escrita no puede abrirle la puerta a toda la cartera.
    for (const malo of ["553733897", "55373389760", "+525537338976", "abc", "0"]) {
      assert.equal(
        pasaCanary("+525537338976", {
          LEAD_WHATSAPP_SOLO_TELEFONO: malo,
        }),
        false,
        `"${malo}" debe bloquear todo`,
      );
    }
  });

  it("una variable vacía o con espacios equivale a producción", () => {
    assert.equal(
      pasaCanary("+522228679066", {
        LEAD_WHATSAPP_SOLO_TELEFONO: "   ",
      }),
      true,
    );
  });

  it("no confunde un número que solo termina parecido", () => {
    // El canary compara el final del E.164 completo.
    assert.equal(pasaCanary("+15537338976", canary), true);
    assert.equal(pasaCanary("+525537338970", canary), false);
  });
});
