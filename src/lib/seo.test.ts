import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FALLBACK_AUTHOR } from "./author.ts";
import { buildPersonSchema } from "./seo.ts";

/**
 * El apellido se escribe Talan, sin acento, en todo lo que ve un cliente, y los
 * datos estructurados cuentan: Google y las IAs los leen y pueden repetir lo que
 * encuentran ahí. En mayo de 2026 se declaró "Iria Talán" como alternateName
 * para capturar cómo lo escribían terceros; en septiembre Iria decidió quitarlo.
 * Estas pruebas existen para que no vuelva por ningún camino: ni por el código
 * ni por un campo capturado en Sanity.
 */

describe("nombre de Iria en los datos estructurados", () => {
  it("el perfil de respaldo no declara Talán con acento", () => {
    const json = JSON.stringify(buildPersonSchema(FALLBACK_AUTHOR));
    assert.ok(!json.includes("Talán"), 'el JSON-LD del perfil trae "Talán"');
  });

  it("tampoco lo inventa cuando Sanity no trae nombre alterno", () => {
    const json = JSON.stringify(buildPersonSchema({ name: "Iria Talan" }));
    assert.ok(!json.includes("Talán"), 'el JSON-LD del perfil trae "Talán"');
  });

  it("y lo descarta aunque alguien lo capture en Sanity", () => {
    const json = JSON.stringify(
      buildPersonSchema({ name: "Iria Talan", alternateName: "Iria Talán" }),
    );
    assert.ok(!json.includes("Talán"), 'el JSON-LD del perfil trae "Talán"');
  });
});
