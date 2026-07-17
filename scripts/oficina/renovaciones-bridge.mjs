#!/usr/bin/env node
/**
 * Puente Desk→CRM del aviso WhatsApp de renovaciones.
 *
 * Busca tickets de Desk marcados con estado "Propuesta enviada" (Tipo de
 * gestión = Renovacion, Seguimiento avisado = false), estampa
 * Fecha_propuesta_enviada en la póliza correspondiente del CRM (eso dispara
 * el workflow de WhatsApp) y cierra el loop en el ticket
 * (Seguimiento avisado = true, Próximo seguimiento = +3 días).
 *
 * Diseño y contexto: docs/OFICINA.md §4.
 *
 * Credenciales (env vars, configuradas como secrets del environment CCR):
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 * Opcionales:
 *   ZOHO_ACCOUNTS_BASE (default https://accounts.zoho.com)
 *   ZOHO_CRM_BASE      (default https://www.zohoapis.com)
 *   ZOHO_DESK_BASE     (default https://desk.zoho.com)
 *   DESK_ORG_ID        (default 674011166)
 *
 * Uso:
 *   node scripts/oficina/renovaciones-bridge.mjs            # dry-run: solo reporta
 *   node scripts/oficina/renovaciones-bridge.mjs --execute  # escribe de verdad
 */

const EXECUTE = process.argv.includes("--execute");
const ACCOUNTS = process.env.ZOHO_ACCOUNTS_BASE ?? "https://accounts.zoho.com";
const CRM = process.env.ZOHO_CRM_BASE ?? "https://www.zohoapis.com";
const DESK = process.env.ZOHO_DESK_BASE ?? "https://desk.zoho.com";
const ORG_ID = process.env.DESK_ORG_ID ?? "674011166";
const DEPT_DIRECCION = "317055000000006907";
const ESTADO_TRIGGER = "Propuesta enviada";
const MAX_POR_CORRIDA = 20;

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Falta la variable de entorno ${name}. Configúrala como secret del environment.`);
    process.exit(2);
  }
  return v;
}

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: requireEnv("ZOHO_CLIENT_ID"),
    client_secret: requireEnv("ZOHO_CLIENT_SECRET"),
    refresh_token: requireEnv("ZOHO_REFRESH_TOKEN"),
  });
  const res = await fetch(`${ACCOUNTS}/oauth/v2/token`, { method: "POST", body: params });
  const json = await res.json();
  if (!json.access_token) {
    throw new Error(`No se pudo refrescar el token: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json.access_token;
}

const authHeaders = (token) => ({ Authorization: `Zoho-oauthtoken ${token}` });

async function deskGet(token, path, params = {}) {
  const url = new URL(`${DESK}/api/v1${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { ...authHeaders(token), orgId: ORG_ID } });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Desk GET ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function deskPatch(token, path, body) {
  const res = await fetch(`${DESK}/api/v1${path}`, {
    method: "PATCH",
    headers: { ...authHeaders(token), orgId: ORG_ID, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Desk PATCH ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function crmGet(token, path, params = {}) {
  const url = new URL(`${CRM}/crm/v8${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: authHeaders(token) });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`CRM GET ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function crmPut(token, path, body) {
  const res = await fetch(`${CRM}/crm/v8${path}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.data?.[0]?.status === "error") {
    throw new Error(`CRM PUT ${path} → ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json;
}

function hoyISO() {
  // Fecha local CDMX (UTC-6) en formato YYYY-MM-DD.
  const now = new Date(Date.now() - 6 * 3600 * 1000);
  return now.toISOString().slice(0, 10);
}

function proximoSeguimientoISO(dias = 3) {
  const d = new Date(Date.now() + dias * 24 * 3600 * 1000);
  d.setUTCHours(16, 0, 0, 0); // 10:00 CDMX
  return d.toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

async function main() {
  const token = await getAccessToken();
  console.log(`Puente renovaciones — ${EXECUTE ? "EJECUCIÓN REAL" : "dry-run (usa --execute para escribir)"}`);

  const search = await deskGet(token, "/tickets/search", {
    status: ESTADO_TRIGGER,
    departmentId: DEPT_DIRECCION,
    limit: String(MAX_POR_CORRIDA),
    sortBy: "-modifiedTime",
  });
  const tickets = (search?.data ?? []).filter(
    (t) => t.cf?.cf_tipo_de_gestion === "Renovacion" && t.cf?.cf_seguimiento_avisado !== "true",
  );
  console.log(`Tickets candidatos: ${tickets.length}`);

  let enviados = 0;
  let saltados = 0;
  for (const t of tickets) {
    const etiqueta = `#${t.ticketNumber} (${t.id})`;
    const noPoliza = (t.cf?.cf_no_de_poliza ?? "").trim();
    if (!noPoliza) {
      console.warn(`${etiqueta}: sin No. de Poliza — se salta (revisar a mano).`);
      saltados++;
      continue;
    }

    const found = await crmGet(token, "/Polizas/search", {
      criteria: `(Name:starts_with:${noPoliza})`,
      fields: "Name,Fecha_de_finalizaci_n_de_vigencia,Contacto,Estatus",
      per_page: "10",
    });
    const candidatas = (found?.data ?? []).sort((a, b) =>
      String(b.Fecha_de_finalizaci_n_de_vigencia ?? "").localeCompare(
        String(a.Fecha_de_finalizaci_n_de_vigencia ?? ""),
      ),
    );
    const poliza = candidatas[0];
    if (!poliza) {
      console.warn(`${etiqueta}: póliza "${noPoliza}" no encontrada en CRM — se salta (revisar a mano).`);
      saltados++;
      continue;
    }

    console.log(`${etiqueta}: póliza ${poliza.Name} (${poliza.id}) → estampar Fecha_propuesta_enviada=${hoyISO()}`);
    if (!EXECUTE) continue;

    // 1) CRM primero: si falla, NO se marca el ticket y se reintenta en la próxima corrida.
    await crmPut(token, `/Polizas/${poliza.id}`, {
      data: [{ Fecha_propuesta_enviada: hoyISO() }],
    });
    // 2) Cierre del loop en Desk.
    await deskPatch(token, `/tickets/${t.id}`, {
      cf: { cf_seguimiento_avisado: true, cf_proximo_seguimiento: proximoSeguimientoISO() },
    });
    enviados++;
    console.log(`${etiqueta}: listo — WhatsApp disparado por el workflow de CRM, flags cerrados.`);
  }

  console.log(`Resumen: ${enviados} procesados, ${saltados} saltados, ${tickets.length} candidatos.`);
}

main().catch((err) => {
  console.error(`Error del puente: ${err.message}`);
  process.exit(1);
});
