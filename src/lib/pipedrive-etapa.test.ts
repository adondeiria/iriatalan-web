import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { elegirEtapaLeads } from "./pipedrive.ts";

// Las etapas reales del embudo "Financial and insurance" (id 2) el 13-nov-2026,
// en el orden en que estaban cuando los leads empezaron a caer mal: "POR
// RETOMAR" (creada el 7-sep) quedó en primer lugar y el robot, que tomaba la
// primera columna, mandó ahí todos los leads automáticos durante dos meses.
const ETAPAS_7_SEP = [
  { id: 6, name: "Calificado/ Cliente Nueva propuesta", order_nr: 3 },
  { id: 17, name: "Lead RS / Webpage", order_nr: 2 },
  { id: 19, name: "POR RETOMAR", order_nr: 1 },
  { id: 20, name: "Angi contactado", order_nr: 4 },
];

describe("etapa destino de los leads automáticos", () => {
  it("elige 'Lead RS / Webpage' por nombre aunque no sea la primera columna", () => {
    const r = elegirEtapaLeads(ETAPAS_7_SEP, "Lead RS / Webpage");
    assert.equal(r?.id, 17);
    assert.equal(r?.porNombre, true);
  });

  it("no le importan mayúsculas, acentos ni espacios de más", () => {
    const etapas = [{ id: 5, name: "  Léad rs / WEBPAGE ", order_nr: 9 }, { id: 1, name: "Otra", order_nr: 1 }];
    assert.equal(elegirEtapaLeads(etapas, "lead RS / Webpage")?.id, 5);
  });

  it("tampoco le importan los espacios dobles dentro del nombre", () => {
    const etapas = [{ id: 1, name: "Otra", order_nr: 1 }, { id: 8, name: "Lead RS  /  Webpage", order_nr: 2 }];
    assert.equal(elegirEtapaLeads(etapas, "Lead RS / Webpage")?.id, 8);
  });

  it("con dos columnas del mismo nombre gana la de más a la izquierda", () => {
    const etapas = [
      { id: 40, name: "Lead RS / Webpage", order_nr: 5 },
      { id: 41, name: "Lead RS / Webpage", order_nr: 2 },
    ];
    assert.equal(elegirEtapaLeads(etapas, "Lead RS / Webpage")?.id, 41);
  });

  it("acepta un id numérico configurado", () => {
    const r = elegirEtapaLeads(ETAPAS_7_SEP, "20");
    assert.equal(r?.id, 20);
    assert.equal(r?.porNombre, true);
  });

  it("si la columna ya no existe, cae a la primera por orden (marcada para el aviso)", () => {
    const r = elegirEtapaLeads(ETAPAS_7_SEP, "Columna borrada");
    assert.equal(r?.id, 19);
    assert.equal(r?.porNombre, false);
  });

  it("un id numérico que no existe también cae a la primera por orden", () => {
    const r = elegirEtapaLeads(ETAPAS_7_SEP, "999");
    assert.equal(r?.id, 19);
    assert.equal(r?.porNombre, false);
  });

  it("devuelve null si el embudo no tiene etapas", () => {
    assert.equal(elegirEtapaLeads([], "Lead RS / Webpage"), null);
  });

  it("no confunde una columna que sólo contiene el nombre", () => {
    const etapas = [
      { id: 30, name: "Lead RS / Webpage ARCHIVO", order_nr: 1 },
      { id: 31, name: "Lead RS / Webpage", order_nr: 2 },
    ];
    assert.equal(elegirEtapaLeads(etapas, "Lead RS / Webpage")?.id, 31);
  });
});
