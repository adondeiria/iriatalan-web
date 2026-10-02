import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FALLBACK_AUTHOR } from "./author.ts";
import { GOOGLE_PROFILE_URL } from "./google-business.ts";
import {
  buildLocalBusinessSchema,
  buildPersonSchema,
  fechaModificacion,
} from "./seo.ts";

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

/**
 * "rendimiento-que-esperas…" se publicó el 23-ago-2026 a las 6:32 pm CDMX
 * (00:32 UTC del 24) y se revisó ese mismo día. El JSON-LD declaraba
 * dateModified "2026-08-23" < datePublished "2026-08-24T00:32Z".
 */
describe("dateModified nunca antes de la publicación", () => {
  const publishedAt = "2026-08-24T00:32:34.202Z";

  it("revisado el mismo día de CDMX → usa el instante de publicación", () => {
    assert.equal(fechaModificacion({ publishedAt, lastReviewed: "2026-08-23" }), publishedAt);
  });

  it("revisión de un día posterior se respeta, a mediodía de CDMX", () => {
    assert.equal(
      fechaModificacion({ publishedAt, lastReviewed: "2026-08-25" }),
      "2026-08-25T12:00:00-06:00"
    );
  });

  it("revisión al día siguiente de CDMX tampoco queda antes (24-ago 00:00Z < 00:32Z)", () => {
    const r = fechaModificacion({ publishedAt, lastReviewed: "2026-08-24" });
    assert.ok(Date.parse(r) > Date.parse(publishedAt), r);
  });

  it("una actualización con hora del mismo día se respeta si es posterior", () => {
    assert.equal(
      fechaModificacion({ publishedAt, updatedAt: "2026-08-24T05:00:00Z" }),
      "2026-08-24T05:00:00Z"
    );
  });

  it("una fecha ilegible no tumba la página", () => {
    assert.equal(fechaModificacion({ publishedAt, lastReviewed: "pendiente" }), "pendiente");
  });

  it("updatedAt anterior (dato malo) no gana a la publicación", () => {
    assert.equal(
      fechaModificacion({ publishedAt, updatedAt: "2026-08-23T17:00:00Z" }),
      publishedAt
    );
  });

  it("sin revisión ni actualización → la publicación", () => {
    assert.equal(fechaModificacion({ publishedAt }), publishedAt);
  });
});

describe("ficha de Google Business en el nodo local", () => {
  it("declara hasMap y la incluye en sameAs una sola vez", () => {
    const s = buildLocalBusinessSchema();
    assert.equal(s.hasMap, GOOGLE_PROFILE_URL);
    assert.equal(s.sameAs.filter((u) => u === GOOGLE_PROFILE_URL).length, 1);
  });

  it("no la duplica si Sanity ya la trae en sameAs", () => {
    const s = buildLocalBusinessSchema({ name: "Iria Talan", sameAs: [GOOGLE_PROFILE_URL] });
    assert.deepEqual(s.sameAs, [GOOGLE_PROFILE_URL]);
  });
});
