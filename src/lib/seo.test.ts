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

/**
 * Las credenciales del perfil son lo que ChatGPT no atribuía en la medición de
 * julio de 2026 (MDRT, Yale, cédula). Para que un crawler las reconozca, cada
 * institución tiene que llamarse como la llama el resto de internet, la cédula
 * tiene que ser una licencia con su número, y los programas ejecutivos no pueden
 * pasar por títulos de posgrado.
 */
describe("credenciales en los datos estructurados", () => {
  const person = buildPersonSchema(FALLBACK_AUTHOR);
  const creds = person.hasCredential ?? [];
  const porNombre = (texto: string) => creds.find((c) => c.name?.includes(texto));

  it("la cédula CNSF es licencia y trae su número", () => {
    const cedula = porNombre("Cédula");
    assert.equal(cedula?.credentialCategory, "license");
    assert.equal(cedula?.identifier, "V388618");
    assert.equal(cedula?.recognizedBy?.name, "Comisión Nacional de Seguros y Fianzas (CNSF)");
  });

  it("Yale y LSE son certificados, no títulos", () => {
    assert.equal(porNombre("Wealth Management")?.credentialCategory, "certificate");
    assert.equal(porNombre("MBA Essentials")?.credentialCategory, "certificate");
    assert.equal(porNombre("Ingeniera")?.credentialCategory, "degree");
  });

  it("las instituciones van con su nombre, sin la aclaración de la página", () => {
    const nombres = creds.map((c) => c.recognizedBy?.name ?? "");
    assert.ok(nombres.includes("London School of Economics"));
    assert.ok(nombres.includes("Yale School of Management"));
    assert.ok(nombres.every((n) => !n.includes(" — ") && !n.includes("no MBA")));
    const alumni = (person.alumniOf ?? []).map((o) => o.name);
    assert.ok(alumni.every((n) => !n.includes(" — ")));
  });

  it("los reconocimientos van en award, no repetidos como credencial", () => {
    assert.equal(porNombre("Asesora Diamante"), undefined);
    assert.equal(porNombre("AMASFAC"), undefined);
    assert.ok(person.award?.some((a) => a.includes("Top of the Table")));
  });

  it("sin formación ni cédula, omite hasCredential en vez de emitir []", () => {
    const soloPremios = buildPersonSchema({
      name: "Iria Talan",
      credentials: [{ title: "Asesora Diamante", issuer: "GNP Seguros", category: "carrier" }],
    });
    assert.equal(soloPremios.hasCredential, undefined);
  });
});

describe("experiencia en los datos estructurados", () => {
  it('dice "desde 2008", no un número de años que envejece', () => {
    const json = JSON.stringify(buildPersonSchema(FALLBACK_AUTHOR));
    assert.ok(!/\b1[5-9] años/.test(json), "el perfil trae un número de años");
  });
});
