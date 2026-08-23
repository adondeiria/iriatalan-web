import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FAQ_PERFIL } from "./perfil-textos.ts";

/**
 * El FAQ es lo único de esta página que Google y las IA pueden leer: el
 * cuestionario es una app y su contenido se pinta al hacer clic. Si una
 * respuesta se rompe o se contradice con la lógica, la página deja de servir
 * para lo que fue puesta ahí.
 */

describe("FAQ del perfil del inversionista", () => {
  it("cubre las búsquedas que la página quiere atender", () => {
    const todo = FAQ_PERFIL.map((f) => f.pregunta.toLowerCase()).join(" | ");
    for (const tema of [
      "qué es un perfil de inversionista",
      "qué tipo de inversionista soy",
    ]) {
      assert.ok(
        todo.includes(tema.toLowerCase()),
        `falta una pregunta sobre "${tema}"`,
      );
    }
  });

  it("cada respuesta se sostiene sola, sin depender del resto de la página", () => {
    for (const f of FAQ_PERFIL) {
      // Una respuesta que empieza con "esto", "aquí" o "como se dijo" no se
      // puede citar suelta — y citada suelta es como la va a usar una IA.
      assert.doesNotMatch(
        f.respuesta,
        /^(esto|eso|aquí|como (se dijo|vimos)|arriba)/i,
        `respuesta dependiente del contexto: "${f.pregunta}"`,
      );
      assert.ok(
        f.respuesta.length >= 120,
        `respuesta demasiado corta para citarse: "${f.pregunta}"`,
      );
      assert.ok(f.pregunta.trim().endsWith("?"));
    }
  });

  it("no promete rendimientos ni garantías de resultado", () => {
    // Categoría YMYL en un sector regulado: ninguna respuesta puede leerse
    // como promesa de rendimiento.
    const promesa =
      /\b(garantizamos|te aseguro que|siempre sube|sin riesgo|rendimiento asegurado)\b/i;
    for (const f of FAQ_PERFIL) {
      assert.doesNotMatch(f.respuesta, promesa, `promesa en: "${f.pregunta}"`);
    }
  });

  it("no nombra aseguradoras ni estrategias internas", () => {
    const marcas = /allianz|gnp|axa|metlife|bupa|smnyl|optimaxx/i;
    for (const f of FAQ_PERFIL) {
      assert.doesNotMatch(f.respuesta, marcas, `marca en: "${f.pregunta}"`);
      assert.doesNotMatch(f.pregunta, marcas);
    }
  });

  it("dice explícitamente que no se guardan datos", () => {
    // Es la promesa de privacidad sobre la que se rediseñó todo. Si el texto
    // desaparece, la página deja de declarar lo que de hecho hace.
    const privacidad = FAQ_PERFIL.find((f) => /guarda/i.test(f.pregunta));
    assert.ok(privacidad, "falta la pregunta sobre datos");
    assert.match(privacidad.respuesta, /no se envían|ningún servidor/i);
  });

  it("es coherente con el techo de la P8 y con el corte de 5 años", () => {
    const texto = FAQ_PERFIL.map((f) => f.respuesta).join(" ");
    assert.match(texto, /conservador, sin importar cuánto plazo/i);
    assert.match(texto, /menos de 5 años|menos de cinco años/i);
    assert.match(texto, /CETES/);
  });

  it("aclara que no sustituye al cuestionario oficial", () => {
    const texto = FAQ_PERFIL.map((f) => f.respuesta).join(" ");
    assert.match(texto, /no (lo )?reemplaza|complementa/i);
  });
});
