import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fraseDiaHabil, proximoDiaHabilISO } from "./dia-habil.ts";

/**
 * Las fechas se escriben en UTC a propósito: es lo que ve el servidor. Cada
 * caso anota entre paréntesis qué hora es en CDMX (UTC-6), que es lo que vive
 * el prospecto y lo único que debe decidir la frase.
 */
const cdmx = (iso: string) => new Date(iso);

describe("fraseDiaHabil — los casos que pidió Iria", () => {
  it("domingo: el próximo hábil es mañana lunes", () => {
    // Domingo 16-ago-2026, 09:00 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-16T15:00:00Z")), "mañana lunes");
  });

  it("sábado: el próximo hábil es el lunes, no mañana", () => {
    // Sábado 15-ago-2026, 11:00 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-15T17:00:00Z")), "el lunes");
  });

  it("martes por la noche: mañana miércoles", () => {
    // Martes 18-ago-2026, 21:00 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-19T03:00:00Z")), "mañana miércoles");
  });
});

describe("fraseDiaHabil — dentro del horario de atención", () => {
  it("lunes a media mañana: hoy mismo", () => {
    // Lunes 17-ago-2026, 10:00 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-17T16:00:00Z")), "hoy mismo");
  });

  it("viernes 17:59 todavía es hoy", () => {
    // Viernes 21-ago-2026, 17:59 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-21T23:59:00Z")), "hoy mismo");
  });

  it("día hábil de madrugada: hoy mismo, porque abre a las 9", () => {
    // Miércoles 19-ago-2026, 06:00 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-19T12:00:00Z")), "hoy mismo");
  });
});

describe("fraseDiaHabil — los bordes que rompen esto", () => {
  it("viernes 18:00 en punto ya cerró: salta el fin de semana", () => {
    // Viernes 21-ago-2026, 18:00 CDMX
    assert.equal(fraseDiaHabil(cdmx("2026-08-22T00:00:00Z")), "el lunes");
  });

  it("viernes por la noche NO dice 'mañana sábado'", () => {
    // Viernes 21-ago-2026, 22:00 CDMX
    const frase = fraseDiaHabil(cdmx("2026-08-22T04:00:00Z"));
    assert.equal(frase, "el lunes");
    assert.ok(!frase.includes("sábado"), "nunca debe ofrecer un sábado");
    assert.ok(!frase.includes("domingo"), "nunca debe ofrecer un domingo");
  });

  it("domingo 23:00 CDMX sigue siendo domingo, aunque en UTC ya sea lunes", () => {
    // Domingo 16-ago-2026, 23:00 CDMX = lunes 05:00 UTC. Sin la zona horaria
    // esto contestaría "hoy mismo" y le prometería a alguien una llamada el
    // domingo en la noche.
    assert.equal(fraseDiaHabil(cdmx("2026-08-17T05:00:00Z")), "mañana lunes");
  });

  it("lunes 00:30 CDMX es lunes, no domingo", () => {
    // Lunes 17-ago-2026, 00:30 CDMX = lunes 06:30 UTC
    assert.equal(fraseDiaHabil(cdmx("2026-08-17T06:30:00Z")), "hoy mismo");
  });

  it("nunca devuelve vacío ni promete un día inhábil", () => {
    const inhabiles = ["sábado", "domingo"];
    // Barrido de 7 días completos, cada hora.
    for (let dia = 16; dia <= 22; dia += 1) {
      for (let h = 0; h < 24; h += 1) {
        const iso = `2026-08-${dia}T${String(h).padStart(2, "0")}:00:00Z`;
        const frase = fraseDiaHabil(cdmx(iso));
        assert.ok(frase.length > 0, `vacío en ${iso}`);
        for (const malo of inhabiles) {
          assert.ok(!frase.includes(malo), `prometió ${malo} en ${iso}`);
        }
      }
    }
  });
});

describe("proximoDiaHabilISO — fechas para actividades de la cabina", () => {
  it("lunes + 3 hábiles = jueves", () => {
    // Lunes 17-ago-2026, 10:00 CDMX
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-17T16:00:00Z"), 3), "2026-08-20");
  });

  it("miércoles + 3 hábiles salta el fin de semana: lunes", () => {
    // Miércoles 19-ago-2026, 10:00 CDMX → jue, vie, lun
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-19T16:00:00Z"), 3), "2026-08-24");
  });

  it("viernes + 1 hábil = lunes, nunca sábado", () => {
    // Viernes 21-ago-2026, 10:00 CDMX
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-21T16:00:00Z"), 1), "2026-08-24");
  });

  it("sábado + 0 aterriza en el lunes (0 también respeta lo hábil)", () => {
    // Sábado 22-ago-2026, 11:00 CDMX
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-22T17:00:00Z"), 0), "2026-08-24");
  });

  it("día hábil + 0 = ese mismo día", () => {
    // Martes 18-ago-2026, 10:00 CDMX
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-18T16:00:00Z"), 0), "2026-08-18");
  });

  it("la zona manda: viernes 20:00 CDMX (sábado UTC) + 1 hábil = lunes, no martes", () => {
    // Viernes 21-ago-2026, 20:00 CDMX = sábado 22 02:00 UTC. Si el cálculo
    // usara el calendario UTC, partiría del sábado y regresaría martes.
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-22T02:00:00Z"), 1), "2026-08-24");
  });

  it("cruza fin de mes sin despeinarse", () => {
    // Viernes 28-ago-2026, 10:00 CDMX + 2 hábiles = martes 1-sep
    assert.equal(proximoDiaHabilISO(cdmx("2026-08-28T16:00:00Z"), 2), "2026-09-01");
  });

  it("siempre regresa YYYY-MM-DD y nunca fin de semana (barrido)", () => {
    for (let dia = 16; dia <= 22; dia += 1) {
      for (let n = 0; n <= 5; n += 1) {
        const fecha = proximoDiaHabilISO(cdmx(`2026-08-${dia}T18:00:00Z`), n);
        assert.match(fecha, /^\d{4}-\d{2}-\d{2}$/);
        const diaSemana = new Date(`${fecha}T12:00:00Z`).getUTCDay();
        assert.ok(diaSemana >= 1 && diaSemana <= 5, `${fecha} cayó en fin de semana`);
      }
    }
  });
});
