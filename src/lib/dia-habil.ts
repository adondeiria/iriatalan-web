/**
 * Calcula CÓMO se le nombra al próximo momento en que Iria puede llamar, para
 * que María se lo diga al prospecto con todas sus letras ("mañana lunes", "el
 * miércoles") en vez de un genérico "el siguiente día hábil".
 *
 * POR QUÉ VIVE AQUÍ Y NO EN EL PROMPT DE MARÍA: un modelo de lenguaje no tiene
 * reloj. Las instrucciones de María dicen literalmente "no intentes deducir qué
 * hora ni qué día es", y está bien que lo digan: si adivina, le promete al
 * prospecto una llamada para un día que no es. El día lo calcula código con
 * fecha real y María solo lo lee.
 *
 * ZONA HORARIA: los servidores corren en UTC. Un domingo 19:00 de CDMX es lunes
 * 01:00 UTC, así que preguntar el día directo al Date del servidor da un día
 * distinto al que vive el prospecto. Todo se resuelve en America/Mexico_City.
 */

const ZONA = "America/Mexico_City";

/** Horario de atención de Iria: L-V, 9:00 a 18:00 (CLAUDE.md). */
const HORA_CIERRE = 18;

const NOMBRES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

type PartesLocales = { diaSemana: number; hora: number };

/**
 * Día de la semana y hora TAL COMO SE VIVEN EN CDMX, sin importar dónde corra
 * el proceso. Se usa `en-CA` porque da el formato ISO (2026-08-16), que se
 * parsea sin ambigüedad de mes/día.
 */
function partesEnCdmx(ahora: Date): PartesLocales {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    weekday: "short",
  });

  const partes = Object.fromEntries(
    fmt.formatToParts(ahora).map((p) => [p.type, p.value]),
  );

  // `hour` puede venir como "24" a la medianoche en algunas plataformas.
  const hora = Number(partes.hour) % 24;

  const dias: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const diaSemana = dias[partes.weekday as string];

  return { diaSemana, hora };
}

const esHabil = (dia: number) => dia >= 1 && dia <= 5;

/**
 * Frase para el hueco de la respuesta de María.
 *
 *   "hoy mismo"        — es día hábil y todavía no cierra
 *   "mañana miércoles" — el próximo hábil es el día siguiente
 *   "el lunes"         — el próximo hábil es más adelante
 *
 * Nunca devuelve cadena vacía: María siempre tiene algo que decir.
 */
export function fraseDiaHabil(ahora: Date): string {
  const { diaSemana, hora } = partesEnCdmx(ahora);

  if (esHabil(diaSemana) && hora < HORA_CIERRE) return "hoy mismo";

  // Se avanza día por día hasta el siguiente hábil. Máximo 3 saltos (viernes
  // por la noche → lunes), pero se acota a 7 por seguridad.
  for (let saltos = 1; saltos <= 7; saltos += 1) {
    const dia = (diaSemana + saltos) % 7;
    if (!esHabil(dia)) continue;
    return saltos === 1 ? `mañana ${NOMBRES[dia]}` : `el ${NOMBRES[dia]}`;
  }

  // Inalcanzable: en 7 días siempre hay un día hábil. Se deja por si alguien
  // toca `esHabil` y rompe la premisa sin darse cuenta.
  return "el siguiente día hábil";
}

/**
 * Fecha (YYYY-MM-DD) del día hábil que cae `diasHabiles` días hábiles después
 * de `desde`, contando en el calendario de CDMX.
 *
 * Existe para las actividades de la cabina: "seguimiento en 3 días hábiles"
 * tiene que volverse un `due_date` concreto para Pipedrive, y ese cálculo NO
 * puede hacerse con el calendario del servidor (UTC): un viernes 20:00 de CDMX
 * ya es sábado en UTC, y el "+3 hábiles" saldría corrido un día.
 *
 * Devuelve string ISO y no Date a propósito: el consumidor es la API de
 * Pipedrive (`due_date: "2026-08-20"`), y un Date obligaría al llamador a
 * re-formatear eligiendo zona otra vez — el mismo bug dos veces.
 *
 * `diasHabiles = 0` regresa `desde` si es hábil, o el hábil siguiente si cae
 * en fin de semana. Igual que `fraseDiaHabil`, no sabe de festivos.
 */
export function proximoDiaHabilISO(desde: Date, diasHabiles: number): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Ancla a mediodía UTC del día-calendario de CDMX: sumar días con setUTCDate
  // sobre mediodía nunca cambia de fecha por horas de más o de menos.
  const [y, m, d] = fmt.format(desde).split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d, 12));

  let restantes = Math.max(0, diasHabiles);
  // Con 0 restantes el while no corre, pero el ajuste final de fin de semana
  // de abajo sí: por eso 0 también aterriza en día hábil.
  while (restantes > 0) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (esHabil(cursor.getUTCDay())) restantes -= 1;
  }
  while (!esHabil(cursor.getUTCDay())) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return cursor.toISOString().slice(0, 10);
}
