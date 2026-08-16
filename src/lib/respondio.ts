/**
 * Cliente de respond.io para el contacto inmediato de los leads del sitio.
 *
 * El problema que resuelve: un lead llenaba el formulario, aterrizaba en
 * Pipedrive y ahí se quedaba. Uno esperó tres días. Ahora, en el mismo minuto:
 *   1. El lead recibe un WhatsApp de bienvenida desde el WABA de RIF.
 *   2. La conversación queda ASIGNADA a Iria, lo que dispara sus notificaciones
 *      nativas de respond.io (escritorio, push y correo).
 * El seguimiento lo da ella desde su bandeja; aquí no hay cadencia automática.
 *
 * ESTE MÓDULO NO ES PERSISTENCIA. Los CRMs son Pipedrive y Zoho; respond.io es
 * la notificación. Por eso `route.ts` NO lo cuenta para dar `success` al
 * visitante: si fuera el único que respondió bien, alguien vería "enviado" con
 * un lead que no quedó registrado en ningún lado.
 *
 * Endpoints confirmados en vivo con `catalyst/sondas/sonda-lead-web.js`
 * (13-ago-2026); ninguno se dio por bueno leyendo documentación:
 *   · GET  /contact/phone:{E164}                 -> 200 con el contacto, o 404 limpio.
 *   · POST /contact/create_or_update/phone:{E164} -> 200. NO devuelve el id (hay
 *     que releer con GET) y NO pisa nombre/email que ya tuvieran valor, así que
 *     a un contacto existente se le mandan solo los campos custom.
 *   · POST /contact/id:{id}/message              -> plantilla de WhatsApp.
 *   · POST /contact/id:{id}/conversation/assignee -> asignar la conversación.
 *
 * Auth con `Authorization: Bearer`. Es el token de la Developer API, NO la
 * "Clave API" de la integración de Make: confundirlos ya costó un 401.
 */

export type RespondioLeadInput = {
  nombre: string;
  email: string;
  /** WhatsApp normalizado a 10 dígitos MX, o cadena vacía si no se capturó. */
  whatsapp: string;
  servicio: string;
  /** Formulario de origen: "contacto" | "guia" | "checkup" | … */
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export type RespondioLeadResult = {
  contactId: number | null;
  creado: boolean;
  plantillaEnviada: boolean;
  asignada: boolean;
  avisoInterno: boolean;
  /**
   * Compuerta de entrada: no había nada que hacer con este lead (no venía de
   * /contacto, no traía teléfono, o el canary lo dejó fuera). NO es un hueco:
   * `route.ts` lo usa para no ensuciar Pipedrive con tareas espurias.
   */
  omitido?: string;
  /** Qué pasó cuando sí se actuó. Informativo, para los logs. */
  nota?: string;
  /** respond.io falló: el lead pudo quedarse sin saludo y sin avisarle a Iria. */
  error?: boolean;
};

const API_BASE = "https://api.respond.io/v2";

/** Cada llamada suelta. El visitante está esperando su acuse de recibo. */
const TIMEOUT_MS = 3000;

/**
 * Techo del brazo completo: al pasarse se abandonan los pasos que falten.
 * Dos excepciones deliberadas: el reintento interno de `escribirContacto`
 * (es parte de una operación ya empezada) y el aviso interno a Iria (es la
 * última red de seguridad). El techo duro de la petición es `maxDuration`.
 */
const PRESUPUESTO_MS = 8000;

/** Una segunda bienvenida al mismo lead se ve como un bot descompuesto. */
const DIAS_SIN_REPETIR_BIENVENIDA = 7;

const CANAL_WHATSAPP = Number(process.env.RESPONDIO_CHANNEL_ID ?? 535323);
const USER_IRIA = Number(process.env.RESPONDIO_USER_IRIA_ID ?? 369310);
const USER_MARIA = Number(process.env.RESPONDIO_USER_MARIA_ID ?? 1166822);
const PLANTILLA_BIENVENIDA =
  process.env.RESPONDIO_TEMPLATE_BIENVENIDA ?? "bienvenida_lead_v1";

/**
 * Las etiquetas del formulario están escritas para el CRM y varias suenan mal
 * dentro de la frase de la plantilla ("Recibí tu solicitud sobre Otro / no
 * estoy seguro"). Aquí se convierten a algo que se pueda leer en un WhatsApp.
 *
 * Las llaves deben coincidir EXACTAMENTE con `SERVICIOS` de
 * `src/app/contacto/contact-form.tsx`, que a su vez coincide con el picklist de
 * Zoho. Si alguien cambia una etiqueta allá y no aquí, el lead recibe la
 * etiqueta cruda: feo, pero no roto (ver `fraseDeServicio`).
 */
const SERVICIO_EN_FRASE: Record<string, string> = {
  "Retiro / PPR": "tu plan de retiro",
  "Gastos medicos mayores": "gastos médicos mayores",
  "Seguro de vida": "seguro de vida",
  "Seguro / Fideicomiso educacional": "un plan educativo",
  "Ahorro para Modalidad 40": "Modalidad 40",
  "Empresarial / Persona Clave": "protección empresarial",
  "Patrimonial / HNWI / Fideicomisos": "planeación patrimonial",
  "Familias diversas": "protección para tu familia",
  "Hijos neurodivergentes": "un plan para tus hijos",
  "Mexicanos en el extranjero": "tu cobertura viviendo fuera de México",
  "Mujeres - asesoria enfocada": "asesoría financiera",
  "Foreigners living in Mexico": "tu cobertura viviendo en México",
  "Otro / no estoy seguro": "asesoría",
};

/**
 * Frase para el `{{2}}` de la plantilla. El respaldo es "asesoría" —el mismo
 * texto que "Otro / no estoy seguro"— para que un servicio vacío o una etiqueta
 * que cambió en el formulario no produzcan una frase rara.
 */
export function fraseDeServicio(servicio: string): string {
  const limpio = (servicio ?? "").trim();
  if (!limpio) return "asesoría";
  return SERVICIO_EN_FRASE[limpio] ?? "asesoría";
}

/**
 * `RESPONDIO_LEAD_ENABLED` es el kill-switch: se apaga desde Vercel sin
 * redeployar. Arranca apagado a propósito — los campos custom deben existir en
 * respond.io antes del primer lead (ver `escribirContacto`).
 */
export function isRespondioLeadConfigured(): boolean {
  return Boolean(
    process.env.RESPONDIO_API_TOKEN &&
      process.env.RESPONDIO_LEAD_ENABLED === "true",
  );
}

type RespuestaApi = { status: number; json: unknown };

async function llamar(
  method: "GET" | "POST",
  ruta: string,
  body?: unknown,
): Promise<RespuestaApi> {
  const res = await fetch(`${API_BASE}${ruta}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.RESPONDIO_API_TOKEN ?? ""}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const json = (await res.json().catch(() => null)) as unknown;
  return { status: res.status, json };
}

type CampoCustom = { name: string; value: string | null };

type ContactoRespondio = {
  id: number;
  firstName: string;
  email: string;
  camposCustom: CampoCustom[];
  assigneeId: number | null;
  assigneeNombre: string;
};

function comoRegistro(valor: unknown): Record<string, unknown> | null {
  return valor && typeof valor === "object"
    ? (valor as Record<string, unknown>)
    : null;
}

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

/** Traduce la respuesta cruda del GET a algo con lo que se pueda razonar. */
function comoContacto(json: unknown): ContactoRespondio | null {
  const raiz = comoRegistro(json);
  if (!raiz) return null;
  const datos = comoRegistro(raiz.data) ?? raiz;
  if (typeof datos.id !== "number") return null;

  const asignado = comoRegistro(datos.assignee);
  const campos = Array.isArray(datos.custom_fields)
    ? (datos.custom_fields as unknown[])
        .map((c) => comoRegistro(c))
        .filter((c): c is Record<string, unknown> => c !== null)
        .map((c) => ({
          name: texto(c.name),
          value: typeof c.value === "string" ? c.value : null,
        }))
    : [];

  return {
    id: datos.id,
    firstName: texto(datos.firstName),
    email: texto(datos.email),
    camposCustom: campos,
    assigneeId:
      asignado && typeof asignado.id === "number" ? asignado.id : null,
    assigneeNombre: asignado
      ? [texto(asignado.firstName), texto(asignado.lastName)]
          .filter(Boolean)
          .join(" ")
      : "",
  };
}

function campoDe(contacto: ContactoRespondio, nombre: string): string {
  return contacto.camposCustom.find((c) => c.name === nombre)?.value ?? "";
}

/** respond.io guarda nombre y apellido por separado; el formulario, junto. */
function partirNombre(nombre: string): { firstName: string; lastName: string } {
  const partes = nombre.trim().split(/\s+/);
  return {
    firstName: partes[0] ?? nombre.trim(),
    lastName: partes.slice(1).join(" "),
  };
}

function fechaReciente(iso: string, dias: number): boolean {
  if (!iso) return false;
  const t = Date.parse(iso);
  return Number.isFinite(t) && Date.now() - t < dias * 24 * 60 * 60 * 1000;
}

/** Un solo string con la procedencia, para no gastar tres campos custom. */
function resumenUtm(input: RespondioLeadInput): string {
  return [input.utmSource, input.utmMedium, input.utmCampaign]
    .filter(Boolean)
    .join("/")
    .slice(0, 100);
}

function identifier(e164: string): string {
  return `phone:${encodeURIComponent(e164)}`;
}

async function enviarPlantilla(
  ruta: string,
  nombrePlantilla: string,
  parametros: string[],
): Promise<boolean> {
  const r = await llamar("POST", ruta, {
    channelId: CANAL_WHATSAPP,
    message: {
      type: "whatsapp_template",
      template: {
        name: nombrePlantilla,
        languageCode: "es_MX",
        components: [
          {
            type: "body",
            parameters: parametros.map((text) => ({ type: "text", text })),
          },
        ],
      },
    },
  });
  if (r.status >= 300) {
    console.error(
      `[respondio] plantilla ${nombrePlantilla} falló (${r.status}):`,
      JSON.stringify(r.json)?.slice(0, 200),
    );
    return false;
  }
  return true;
}

/**
 * Alta o actualización del contacto.
 *
 * respond.io rechaza el alta ENTERA con 400 si algún campo custom no existe en
 * el workspace (confirmado en vivo), así que un campo mal escrito o borrado
 * dejaría sin contactar a todos los leads. Ante ese error se reintenta una vez
 * sin campos: vale más un lead contactado sin metadatos que un lead perdido.
 */
async function escribirContacto(
  e164: string,
  input: RespondioLeadInput,
  existente: boolean,
): Promise<boolean> {
  const ruta = `/contact/create_or_update/${identifier(e164)}`;
  const { firstName, lastName } = partirNombre(input.nombre);

  // A un contacto que ya existe solo se le tocan los campos custom: mandarle
  // identidad podría degradar un nombre bueno con lo que se tecleó en el form.
  const identidad = existente
    ? {}
    : {
        firstName,
        lastName,
        ...(input.email ? { email: input.email } : {}),
        language: "es",
      };

  // Nunca se escriben `tema_whatsapp` ni `escalamiento_estado`: meterían al
  // lead en la escalera 15/30/45 y a los 30 minutos se lo reasignaría a otra
  // persona, cuando el lead comercial es de Iria.
  //
  // `bienvenida_web_fecha` NO se escribe aquí. Se estampa en `marcarSaludado()`
  // y solo después de que el envío devolvió 2xx. El 16-ago-2026, con la
  // plantilla aprobada en Meta pero sin sincronizar en respond.io, el envío
  // fallaba con 404 y la marca quedaba puesta igual: el lead se veía "saludado"
  // sin haber recibido nada, y el guard de 7 días le impedía recibirlo después.
  // Un fallo que además se tapaba a sí mismo.
  const camposCustom = [
    { name: "origen_lead", value: "sitio_web" },
    { name: "servicio_interes", value: input.servicio },
    { name: "utm_lead", value: resumenUtm(input) },
  ].filter((c) => c.value);

  const base = { phone: e164, ...identidad };

  const r = await llamar("POST", ruta, { ...base, custom_fields: camposCustom });
  if (r.status < 300) return true;

  const mensaje = JSON.stringify(r.json) ?? "";
  if (r.status === 400 && mensaje.includes("not found in the workspace")) {
    console.error(
      "[respondio] falta un campo custom en el workspace:",
      mensaje.slice(0, 200),
    );
    // Reintento sin campos: un lead contactado sin metadatos vale más que un
    // lead perdido. La marca de bienvenida ya no viaja aquí (ver `marcarSaludado`).
    const reintento = await llamar("POST", ruta, base);
    return reintento.status < 300;
  }

  console.error(`[respondio] alta falló (${r.status}):`, mensaje.slice(0, 200));
  return false;
}

/**
 * Estampa `bienvenida_web_fecha`. Se llama SOLO después de que el envío de la
 * plantilla devolvió 2xx: esa marca es la que impide saludar dos veces al mismo
 * lead en 7 días, así que ponerla sin haber enviado nada deja al lead mudo y sin
 * forma de recuperarse.
 */
async function marcarSaludado(e164: string): Promise<void> {
  const r = await llamar("POST", `/contact/create_or_update/${identifier(e164)}`, {
    phone: e164,
    custom_fields: [
      { name: "bienvenida_web_fecha", value: new Date().toISOString() },
    ],
  });
  if (r.status >= 300) {
    // El lead SÍ recibió su bienvenida; lo único que falla es la marca. Se deja
    // en los logs porque el riesgo es un saludo repetido, no un lead sin atender.
    console.error(
      `[respondio] no se pudo marcar bienvenida_web_fecha (${r.status})`,
    );
  }
}

/**
 * Asigna la conversación y COMPRUEBA que haya quedado.
 *
 * respond.io responde 200 aunque no aplique nada: si la conversación está en
 * `closed` —el caso normal de un lead nuevo, que todavía no ha escrito— el
 * assignee se queda vacío y la API no lo dice. Confiar en ese 200 hacía que
 * `route.ts` diera por avisada a Iria cuando no lo estaba, y por eso no dejaba
 * la actividad de respaldo en Pipedrive. Verificado en vivo el 16-ago-2026.
 */
async function asignarYVerificar(
  contactId: number,
  userId: number,
): Promise<boolean> {
  const r = await llamar(
    "POST",
    `/contact/id:${contactId}/conversation/assignee`,
    { assignee: userId },
  );
  if (r.status >= 300) {
    console.error(
      `[respondio] no se pudo asignar (${r.status}):`,
      JSON.stringify(r.json)?.slice(0, 200),
    );
    return false;
  }

  const relectura = await llamar("GET", `/contact/id:${contactId}`);
  if (relectura.status !== 200) return false;
  // Sin relectura utilizable no se puede afirmar que quedó: se devuelve false
  // para que route.ts deje la actividad de respaldo. Falla cerrada, a propósito.
  const quedo = comoContacto(relectura.json)?.assigneeId === userId;
  if (!quedo) {
    console.error(
      "[respondio] la API respondió 200 pero la conversación quedó sin asignar " +
        `(contacto ${contactId}) — probablemente está cerrada.`,
    );
  }
  return quedo;
}

/**
 * Registra el lead en respond.io, le manda la bienvenida y le asigna la
 * conversación a Iria. NUNCA lanza: cada paso se captura por separado, porque
 * que falle la plantilla no debe impedir la asignación (ni al revés).
 */
export async function notifyLeadToRespondio(
  input: RespondioLeadInput,
): Promise<RespondioLeadResult> {
  const vencimiento = Date.now() + PRESUPUESTO_MS;
  const sinTiempo = () => Date.now() > vencimiento;
  const resultado: RespondioLeadResult = {
    contactId: null,
    creado: false,
    plantillaEnviada: false,
    asignada: false,
    avisoInterno: false,
  };

  // Fase 1: solo el formulario de /contacto. Los cuatro lead magnets traen el
  // teléfono como opcional y quien bajó una guía no pidió que lo contactaran;
  // un "recibí tu solicitud" ahí se leería raro.
  if (input.source !== "contacto") {
    return { ...resultado, omitido: "no es el formulario de contacto" };
  }

  const diez = (input.whatsapp ?? "").replace(/\D/g, "");
  if (diez.length !== 10) {
    return { ...resultado, omitido: "sin WhatsApp de 10 dígitos" };
  }

  // Canary: mientras esté puesta, solo actúa con ese número. Permite encender
  // en producción real sin que ningún lead ajeno reciba nada.
  //
  // Falla CERRADO a propósito: basta con que la variable EXISTA para que el
  // canary mande. Si trae un placeholder, un espacio o un typo, se bloquea
  // todo en vez de desactivarse en silencio — el error más caro de este módulo
  // sería mandarle WhatsApp a leads reales creyendo que estamos en pruebas.
  //
  // Para apagar el canary hay que BORRAR la variable en Vercel, no vaciarla.
  const canaryCrudo = process.env.RESPONDIO_SOLO_TELEFONO;
  if (canaryCrudo !== undefined) {
    const soloTelefono = canaryCrudo.replace(/\D/g, "");
    if (soloTelefono.length < 10) {
      console.error(
        "[respondio] RESPONDIO_SOLO_TELEFONO existe pero no trae 10 dígitos:",
        JSON.stringify(canaryCrudo),
        "— se bloquea todo por seguridad. Bórrala para desactivar el canary.",
      );
      return { ...resultado, omitido: "canary mal configurado" };
    }
    if (soloTelefono.slice(-10) !== diez) {
      return { ...resultado, omitido: "canary: teléfono fuera de la prueba" };
    }
  }

  const e164 = `+52${diez}`;

  try {
    // ---- 1. ¿Ya lo conocemos? 404 = lead nuevo. -------------------------
    let contacto: ContactoRespondio | null = null;
    const lectura = await llamar("GET", `/contact/${identifier(e164)}`);
    if (lectura.status === 200) {
      contacto = comoContacto(lectura.json);
    } else if (lectura.status !== 404) {
      // Ni "existe" ni "no existe": no sabemos. Seguir como si fuera un lead
      // nuevo sería peligroso — si en realidad es un cliente que está a media
      // gestión con Violeta, no veríamos su assignee, le mandaríamos una
      // bienvenida genérica y le quitaríamos la conversación. Mejor abortar y
      // que quede la tarea de respaldo en Pipedrive.
      console.error(
        `[respondio] GET contacto devolvió ${lectura.status}, no se actúa a ciegas:`,
        JSON.stringify(lectura.json)?.slice(0, 200),
      );
      return { ...resultado, error: true };
    }

    // ---- 2. Cliente que ya está platicando con alguien del equipo -------
    // Quitarle la conversación a Violeta, Ángeles o Eliseo a media gestión, o
    // mandarle un "recibí tu solicitud" genérico, sería peor que no hacer nada.
    // Solo se avisa a Iria y ella decide cómo entrar.
    const conOtroAgente = Boolean(
      contacto &&
        contacto.assigneeId !== null &&
        contacto.assigneeId !== USER_IRIA &&
        contacto.assigneeId !== USER_MARIA,
    );

    // ---- 3. Idempotencia: doble submit o dos formularios el mismo día ---
    const yaSaludado = Boolean(
      contacto &&
        fechaReciente(
          campoDe(contacto, "bienvenida_web_fecha"),
          DIAS_SIN_REPETIR_BIENVENIDA,
        ),
    );

    // ---- 4. Escribir el contacto ----------------------------------------
    const vaASaludar = !conOtroAgente && !yaSaludado;
    if (!sinTiempo()) {
      const escrito = await escribirContacto(e164, input, Boolean(contacto));
      resultado.creado = escrito && !contacto;
      // El alta no devuelve el id: hay que releer. El GET por identifier es
      // inmediato (el retraso de ~25 s es del índice de /contact/list, no de aquí).
      if (escrito && !contacto && !sinTiempo()) {
        const relectura = await llamar("GET", `/contact/${identifier(e164)}`);
        if (relectura.status === 200) contacto = comoContacto(relectura.json);
      }
    }

    resultado.contactId = contacto?.id ?? null;

    if (!contacto) {
      // Falla técnica, NO decisión deliberada: el lead se quedó sin saludo.
      // Va con `error` (no con `omitido`) para que route.ts sí deje la tarea.
      console.error("[respondio] no se pudo obtener el contacto:", e164);
      return { ...resultado, error: true, nota: "contacto no disponible" };
    }

    // ---- 5. Bienvenida y asignación --------------------------------------
    // Estos dos casos usan `nota`, NO `omitido`: aquí sí hay un lead que
    // atender, solo que no por la vía normal. Iria tiene que enterarse igual,
    // así que route.ts sigue exigiendo que la asignación o el aviso funcionen.
    if (conOtroAgente) {
      resultado.nota = `en conversación con ${contacto.assigneeNombre || "otro agente"}`;
    } else {
      if (!yaSaludado && !sinTiempo()) {
        resultado.plantillaEnviada = await enviarPlantilla(
          `/contact/id:${contacto.id}/message`,
          PLANTILLA_BIENVENIDA,
          [partirNombre(input.nombre).firstName, fraseDeServicio(input.servicio)],
        );
        // La marca va DESPUÉS y solo si de verdad salió. Ver `marcarSaludado`.
        if (resultado.plantillaEnviada && !sinTiempo()) {
          await marcarSaludado(e164);
        }
      } else if (yaSaludado) {
        resultado.nota = "ya recibió la bienvenida esta semana";
      }

      // La asignación es lo que dispara las notificaciones nativas de Iria, así
      // que se intenta aunque la plantilla haya fallado. Se VERIFICA releyendo:
      // con la conversación cerrada la API contesta 200 sin asignar a nadie, y
      // dar eso por bueno dejaba a Iria sin enterarse y sin red de respaldo.
      if (!sinTiempo()) {
        resultado.asignada = await asignarYVerificar(contacto.id, USER_IRIA);
      }
    }

    // ---- 6. Aviso interno (red de respaldo del push nativo) --------------
    // A propósito NO se corta por presupuesto: es la última red para que Iria
    // se entere, y abandonarla por unos milisegundos derrota su propósito.
    // El techo real de la petición lo pone `maxDuration = 30` en route.ts.
    const celularIria = process.env.RESPONDIO_IRIA_CELULAR ?? "";
    if (process.env.RESPONDIO_AVISO_INTERNO === "1" && celularIria) {
      const detalle = conOtroAgente
        ? `Lead web: ${input.nombre} — ya en conversación con ${contacto.assigneeNombre || "otro agente"}`
        : `Lead web: ${input.nombre} — ${input.servicio || "sin servicio"}`;
      resultado.avisoInterno = await enviarPlantilla(
        `/contact/${identifier(celularIria)}/message`,
        "aviso_interno_v1",
        [detalle],
      );
    }

    return resultado;
  } catch (err) {
    // Una caída de respond.io no puede tumbar el formulario: el lead ya está
    // en Pipedrive y `route.ts` dejará una actividad para contactarlo a mano.
    console.error("[respondio] error inesperado:", err);
    return resultado;
  }
}
