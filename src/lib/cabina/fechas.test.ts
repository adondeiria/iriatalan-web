import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { diasDesde, fechaCdmx } from "./fechas.ts";

// Lunes 17-ago-2026, 10:00 CDMX (16:00 UTC).
const AHORA = new Date("2026-08-17T16:00:00Z");

describe("fechaCdmx", () => {
  it("da el día que vive Iria, no el del servidor", () => {
    assert.equal(fechaCdmx(AHORA), "2026-08-17");
  });

  it("a las 23:00 CDMX sigue siendo hoy, aunque en UTC ya sea mañana", () => {
    // Lunes 17-ago 23:00 CDMX = martes 18 05:00 UTC. Sin la zona, el digest
    // clasificaría como "vencidas" las actividades de hoy.
    assert.equal(fechaCdmx(new Date("2026-08-18T05:00:00Z")), "2026-08-17");
  });
});

describe("diasDesde — los formatos que manda Pipedrive", () => {
  it("v1 con espacio", () => {
    assert.equal(diasDesde("2026-08-10 14:23:45", AHORA), 7);
  });

  it("v2 con Z", () => {
    assert.equal(diasDesde("2026-08-10T14:23:45Z", AHORA), 7);
  });

  it("EL QUE ROMPÍA: offset numérico +00:00 devolvía null en silencio", () => {
    assert.equal(diasDesde("2026-08-10T14:23:45+00:00", AHORA), 7);
  });

  it("offset sin dos puntos también", () => {
    assert.equal(diasDesde("2026-08-10T14:23:45+0000", AHORA), 7);
  });

  it("offset distinto de cero se respeta", () => {
    // 09:23 en -05:00 = 14:23 UTC, mismo instante que el caso de arriba.
    assert.equal(diasDesde("2026-08-10T09:23:45-05:00", AHORA), 7);
  });

  it("null o basura no truena: devuelve null", () => {
    assert.equal(diasDesde(null, AHORA), null);
    assert.equal(diasDesde("", AHORA), null);
    assert.equal(diasDesde("ayer por la tarde", AHORA), null);
  });

  it("una fecha futura da 0, nunca negativo", () => {
    assert.equal(diasDesde("2026-09-01T00:00:00Z", AHORA), 0);
  });

  it("el mismo día da 0", () => {
    assert.equal(diasDesde("2026-08-17T09:00:00Z", AHORA), 0);
  });
});
