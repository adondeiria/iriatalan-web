import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import { notifyLeadToRespondio } from "./respondio.ts";

// Caso real (Sofía Vega, 14-sep-2026 9:15): el alta respondió 200, la relectura
// inmediata dio 404 y el módulo abortó con "no se pudo obtener el contacto".
// Resultado: 27 horas sin bienvenida, sin asignación y sin aviso. Estas pruebas
// fijan el comportamiento nuevo: reintentar la relectura y, si aun así no hay
// id, seguir por identificador de teléfono.

type Respuesta = { status: number; json?: unknown };
type Llamada = { method: string; url: string; body: unknown };

const E164 = "+525537338976";
const PHONE_ID = `phone:${encodeURIComponent(E164)}`;
const USER_IRIA = 369310;

const LEAD = {
  nombre: "Sofia Vega",
  email: "sofia@example.com",
  whatsapp: "5537338976",
  servicio: "Retiro / PPR",
  source: "contacto",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
};

function contactoJson(id: number, assigneeId: number | null) {
  return {
    id,
    firstName: "Sofia",
    email: "sofia@example.com",
    custom_fields: [],
    assignee: assigneeId === null ? null : { id: assigneeId, firstName: "Iria", lastName: "Talan" },
  };
}

/** Cola de respuestas en orden; registra cada llamada para inspeccionarla. */
function instalarFetch(cola: Respuesta[]): Llamada[] {
  const llamadas: Llamada[] = [];
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    const siguiente = cola.shift();
    if (!siguiente) throw new Error(`fetch inesperado: ${String(url)}`);
    llamadas.push({
      method: init?.method ?? "GET",
      url: String(url),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    return new Response(JSON.stringify(siguiente.json ?? {}), {
      status: siguiente.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  return llamadas;
}

const sinEsperar = { dormir: async () => {} };

describe("notifyLeadToRespondio: relectura tras el alta", () => {
  const fetchOriginal = globalThis.fetch;
  const envOriginal = { ...process.env };

  beforeEach(() => {
    process.env.RESPONDIO_API_TOKEN = "token-de-prueba";
    delete process.env.RESPONDIO_SOLO_TELEFONO;
    delete process.env.RESPONDIO_AVISO_INTERNO;
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
    process.env = { ...envOriginal };
  });

  it("reintenta la relectura y sigue por id cuando aparece", async () => {
    const llamadas = instalarFetch([
      { status: 404 }, // GET phone: lead nuevo
      { status: 200 }, // POST alta
      { status: 404 }, // GET phone: índice aún no lo tiene
      { status: 404 }, // GET phone: segundo intento
      { status: 200, json: contactoJson(999, null) }, // GET phone: tercero, ya está
      { status: 200 }, // POST plantilla por id
      { status: 200 }, // POST marca bienvenida_web_fecha
      { status: 200 }, // POST assignee por id
      { status: 200, json: contactoJson(999, USER_IRIA) }, // GET id: verificación
    ]);

    const r = await notifyLeadToRespondio(LEAD, sinEsperar);

    assert.equal(r.error, undefined);
    assert.equal(r.contactId, 999);
    assert.equal(r.plantillaEnviada, true);
    assert.equal(r.asignada, true);
    const plantilla = llamadas.find((l) => l.url.endsWith("/message"));
    assert.ok(plantilla?.url.includes("/contact/id:999/message"), plantilla?.url);
  });

  it("si la relectura nunca aparece, saluda y asigna por teléfono", async () => {
    const llamadas = instalarFetch([
      { status: 404 }, // GET phone: lead nuevo
      { status: 200 }, // POST alta
      { status: 404 }, // GET phone ×3: nunca aparece
      { status: 404 },
      { status: 404 },
      { status: 200 }, // POST plantilla por phone
      { status: 200 }, // POST marca bienvenida_web_fecha
      { status: 200 }, // POST assignee por phone
      { status: 200, json: contactoJson(1001, USER_IRIA) }, // GET phone: verificación
    ]);

    const r = await notifyLeadToRespondio(LEAD, sinEsperar);

    assert.equal(r.error, undefined, "no debe abortar");
    assert.equal(r.plantillaEnviada, true, "la bienvenida debe salir");
    assert.equal(r.asignada, true, "la asignación debe quedar");
    const plantilla = llamadas.find((l) => l.url.endsWith("/message"));
    assert.ok(
      plantilla?.url.includes(`/contact/${PHONE_ID}/message`),
      `plantilla debió ir por teléfono: ${plantilla?.url}`,
    );
    const asignacion = llamadas.find((l) => l.url.endsWith("/conversation/assignee"));
    assert.ok(
      asignacion?.url.includes(`/contact/${PHONE_ID}/conversation/assignee`),
      `asignación debió ir por teléfono: ${asignacion?.url}`,
    );
    assert.deepEqual(asignacion?.body, { assignee: USER_IRIA });
  });

  it("con contacto existente no reintenta ni retrasa nada", async () => {
    const llamadas = instalarFetch([
      { status: 200, json: contactoJson(500, null) }, // GET phone: ya existe
      { status: 200 }, // POST actualización de campos
      { status: 200 }, // POST plantilla por id
      { status: 200 }, // POST marca
      { status: 200 }, // POST assignee por id
      { status: 200, json: contactoJson(500, USER_IRIA) }, // GET id: verificación
    ]);

    const r = await notifyLeadToRespondio(LEAD, sinEsperar);

    assert.equal(r.contactId, 500);
    assert.equal(r.asignada, true);
    const gets = llamadas.filter((l) => l.method === "GET");
    assert.equal(gets.length, 2, "un GET inicial y uno de verificación, nada más");
  });
});
