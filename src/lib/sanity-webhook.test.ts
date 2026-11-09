import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { planDesdeWebhook } from "./sanity-webhook.ts";

describe("planDesdeWebhook — qué se refresca y de qué se avisa a Bing", () => {
  it("artículo publicado: refresca /blog y avisa de su URL", () => {
    assert.deepEqual(
      planDesdeWebhook({ _id: "article-x", _type: "article", slug: "que-es-un-ppr-mexico", draft: false }),
      { revalidar: ["/blog"], avisar: ["/blog/que-es-un-ppr-mexico"] },
    );
  });

  it("término del glosario publicado: refresca /glosario y avisa de su URL", () => {
    assert.deepEqual(
      planDesdeWebhook({ _id: "glossary-renta-vitalicia", _type: "glossaryTerm", slug: "renta-vitalicia" }),
      { revalidar: ["/glosario"], avisar: ["/glosario/renta-vitalicia"] },
    );
  });

  it("toggle Draft encendido: no es público, no se avisa", () => {
    assert.equal(planDesdeWebhook({ _id: "article-x", _type: "article", slug: "x", draft: true }), null);
  });

  it("borrador de Sanity (drafts.*): se ignora", () => {
    assert.equal(planDesdeWebhook({ _id: "drafts.article-x", _type: "article", slug: "x" }), null);
  });

  it("tipos que no manejamos (autor, etc.): se ignoran", () => {
    assert.equal(planDesdeWebhook({ _id: "e61428b9", _type: "author", slug: "iria-talan" }), null);
  });

  it("sin slug o slug con caracteres raros: se ignora", () => {
    assert.equal(planDesdeWebhook({ _type: "article", slug: null }), null);
    assert.equal(planDesdeWebhook({ _type: "article", slug: "../api/x" }), null);
    assert.equal(planDesdeWebhook({ _type: "article", slug: "Con Espacios" }), null);
  });

  it("cuerpo vacío: se ignora", () => {
    assert.equal(planDesdeWebhook(null), null);
    assert.equal(planDesdeWebhook({}), null);
  });
});
