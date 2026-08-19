import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { construirAviso } from "./lead-whatsapp-correo.ts";

describe("aviso por correo de leads de WhatsApp", () => {
  it("un prospecto nuevo se anuncia como nuevo", () => {
    const { asunto, html } = construirAviso({
      nombre: "William Szabo",
      telefono: "+19789892266",
      origen: "WhatsApp entrante",
      dealId: 389,
      tratoReutilizado: false,
    });
    assert.match(asunto, /Nuevo prospecto/);
    assert.match(asunto, /William Szabo/);
    assert.match(html, /\+19789892266/);
    assert.match(html, /deal\/389/);
  });

  it("uno que ya está en seguimiento NO se anuncia como nuevo", () => {
    // Distinguirlos importa: si todo dijera "prospecto nuevo", cada mensaje de
    // alguien en curso parecería un lead más y ensuciaría la lectura.
    const { asunto, html } = construirAviso({
      nombre: "William Szabo",
      telefono: "+19789892266",
      tratoReutilizado: true,
    });
    assert.doesNotMatch(asunto, /Nuevo prospecto/);
    assert.match(asunto, /ya en seguimiento/);
    assert.match(html, /No se creó un trato nuevo/);
  });

  it("sin nombre no deja el aviso vacío", () => {
    const { asunto } = construirAviso({ nombre: "   ", telefono: "+525512345678" });
    assert.match(asunto, /Sin nombre/);
  });

  it("EL CASO QUE IMPORTA: escapa el HTML del nombre", () => {
    // El nombre viene de WhatsApp: cualquiera puede ponerse etiquetas por nombre.
    const { html } = construirAviso({
      nombre: '<img src=x onerror="alert(1)">',
      telefono: "+525512345678",
    });
    assert.doesNotMatch(html, /<img/);
    assert.match(html, /&lt;img/);
  });

  it("omite la fila del trato cuando no hay dealId", () => {
    const { html } = construirAviso({ nombre: "Ana", telefono: "+525512345678" });
    assert.doesNotMatch(html, /Pipedrive<\/a>/);
  });
});
