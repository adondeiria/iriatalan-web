/**
 * Mensajes de WhatsApp pre-escritos para la cabina de prospectos.
 *
 * El correo diario no manda nada solo (el 55 3733 8976 es app, no API): deja
 * el mensaje ya redactado en un link `wa.me` para que Iria lo envíe con un
 * toque. La personalización aquí es la diferencia entre "abro el chat y pienso
 * qué escribir" (fricción que acumula pendientes) y "abro y mando".
 *
 * El texto de cada etapa es la versión corta de las respuestas rápidas
 * acordadas (C:\Users\iriat\CLAUDE\respuestas-rapidas-whatsapp-prospectos.md).
 * La regla táctica detrás: contestar NO es tener la propuesta — el primer
 * toque compromete fecha, la propuesta llega cuando esté lista.
 */

// Extensión explícita: así el runner nativo (`node --test`) resuelve el
// import sin bundler, igual que el test de dia-habil que ya existía.
import { fraseDiaHabil } from "../dia-habil.ts";

/**
 * Primer nombre "presentable": de "MARIA FERNANDA LOPEZ" sale "Maria".
 * Si el nombre viene vacío (pasa con tratos viejos), se saluda sin nombre
 * en vez de saludar a "undefined".
 */
export function nombreDePila(nombreCompleto: string | null | undefined): string {
  const primera = (nombreCompleto ?? "").trim().split(/\s+/)[0] ?? "";
  if (!primera) return "";
  return primera.charAt(0).toUpperCase() + primera.slice(1).toLowerCase();
}

/** Con nombre: "¡Hola Ana! ..." — sin nombre: "¡Hola! ...". */
const saludo = (nombre: string) => (nombre ? `¡Hola ${nombre}!` : "¡Hola!");

/**
 * Qué etapa del embudo VENTA está pisando el trato, normalizada a una clave
 * estable. Se compara por nombre (minúsculas, sin acentos) y no por stage_id
 * porque los ids cambian con la migración de embudos y el código no debe
 * romperse por reordenar columnas.
 */
export type EtapaCabina =
  | "nuevo"
  | "contactado"
  | "preparacion"
  | "enviada"
  | "seguimiento"
  | "pospuesto"
  | "otra";

export function clasificarEtapa(nombreEtapa: string): EtapaCabina {
  const plano = nombreEtapa
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (plano.includes("nuevo") || plano.includes("lead")) return "nuevo";
  if (plano.includes("contact")) return "contactado";
  if (plano.includes("preparaci") || plano.includes("pendiente")) {
    return "preparacion";
  }
  if (plano.includes("enviada") || plano.includes("presentada")) return "enviada";
  if (plano.includes("seguimiento") || plano.includes("negociaci")) {
    return "seguimiento";
  }
  if (plano.includes("pospuesto")) return "pospuesto";
  return "otra";
}

/**
 * El mensaje listo para `wa.me` según la etapa. `ahora` entra como parámetro
 * (y no `new Date()` adentro) para que los tests no dependan del reloj.
 */
export function mensajeParaEtapa(
  etapa: EtapaCabina,
  nombreCompleto: string | null | undefined,
  ahora: Date,
): string {
  const nombre = nombreDePila(nombreCompleto);
  const hola = saludo(nombre);
  const dia = fraseDiaHabil(ahora);

  switch (etapa) {
    case "nuevo":
      return `${hola} Soy Iria Talan, de Reingeniería Financiera. Recibí tu solicitud y ya estoy trabajando en tu caso. Te preparo tu propuesta con calma y te la mando a más tardar ${dia === "hoy mismo" ? "mañana" : dia}. Cualquier duda, este es mi WhatsApp directo. ¡Gracias por tu confianza!`;
    case "contactado":
    case "preparacion":
      return `${hola} Ya quedó lista tu propuesta 🙌 Te la comparto aquí. Me encantaría explicártela en una llamada corta — se entiende mucho mejor platicada. ¿Te queda bien mañana o pasado? Dime tu horario y me acomodo.`;
    case "enviada":
      return `${hola} ¿Cómo ves la propuesta que te mandé? Si algo no quedó claro o quieres ajustar algo, lo platicamos y la afino — para eso estoy. ¿Te marco ${dia} en la mañana o prefieres en la tarde?`;
    case "seguimiento":
      return `${hola} ¿Cómo vamos? Quedo pendiente de ti para el siguiente paso. Si te acomoda, te marco ${dia} — dime tu horario y me ajusto.`;
    case "pospuesto":
      return `${hola} Como quedamos, te busco para retomar tu plan. ¿Cómo ves si lo platicamos ${dia}? Tu propuesta sigue vigente y la actualizamos a como estén las cosas hoy.`;
    case "otra":
      return `${hola} Soy Iria Talan, de Reingeniería Financiera. Quedo pendiente de tu caso — ¿te marco ${dia} para platicarlo?`;
  }
}
