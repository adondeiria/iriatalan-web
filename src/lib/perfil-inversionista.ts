/**
 * Perfil del inversionista — lógica pura del cuestionario.
 *
 * Portado del HTML de referencia (`perfil-movil.html`) conservando la mecánica
 * tal cual: tres niveles del 1 al 5 —plazo, capacidad y tolerancia— y el perfil
 * final es el **menor de los tres**. Se comparan niveles, nunca puntos: cada
 * dimensión tiene su propia escala y los subtotales no son comparables entre sí.
 *
 * Este módulo NO tiene JSX ni acceso a `window` a propósito: es lógica pura,
 * probada sola con `node --test`. Todo el cálculo ocurre en el navegador de la
 * persona; no hay servidor porque no se recolecta ni se almacena nada.
 *
 * Cambios aprobados por Iria sobre el cuestionario original:
 *  1. La pregunta 8 muestra **solo porcentajes**; se eliminó la conversión de
 *     caídas a pesos y, con ella, el campo de monto en el modo público.
 *  2. La pregunta 4 dice "Se vería muy afectado" en vez de "Se descarrilaría".
 *  3. **Techo duro**: quien no acepta ninguna pérdida no puede salir arriba de
 *     conservador, sin importar cuánto sume en el resto.
 *  4. La pregunta 1 fusionó "menos de 2 años" y "de 2 a 5" en **"menos de 5
 *     años"**: ambas llevan al mismo lugar.
 */

/** Dimensión a la que pertenece cada pregunta. */
export type Paso = "plazo" | "capacidad" | "tolerancia";

export type Opcion = {
  /** Texto que ve la persona. */
  texto: string;
  /** Puntos que aporta. En `plazo` el valor ES el nivel, no suma. */
  puntos: number;
};

export type Pregunta = {
  /** Número visible (1..10). También la llave en el mapa de respuestas. */
  n: number;
  paso: Paso;
  texto: string;
  /** Aclaración opcional bajo la pregunta. */
  nota?: string;
  opciones: Opcion[];
};

export type Perfil = {
  nivel: number;
  nombre: string;
  /** Estrategia guía Allianz. Interna: NO se muestra en la pantalla pública. */
  estrategia: string;
  horizonte: string;
};

/** Respuestas: número de pregunta → puntos elegidos. */
export type Respuestas = Record<number, number>;

export const PERFILES: readonly Perfil[] = [
  {
    nivel: 1,
    nombre: "Conservador",
    estrategia:
      "Elite en renta fija, o Patrimonial Moderado Defensivo (75% bonos)",
    horizonte: "menos de 5 años",
  },
  {
    nivel: 2,
    nombre: "Moderado",
    estrategia: "Moderado Tradicional",
    // Tras fusionar las dos primeras opciones de la P1, ningún plazo aterriza
    // en este nivel: se llega por capacidad o tolerancia. Poner aquí un rango
    // de años contradiría la escalera de quien declaró plazo largo y aun así
    // cayó en Moderado.
    horizonte: "por capacidad o tolerancia",
  },
  {
    nivel: 3,
    nombre: "Dinámico moderado",
    estrategia: "Dinámico Tradicional",
    horizonte: "5 a 10 años",
  },
  {
    nivel: 4,
    nombre: "Dinámico",
    estrategia: "Dinámico",
    horizonte: "10 a 15 años",
  },
  {
    nivel: 5,
    nombre: "Muy dinámico",
    estrategia: "Inversionista Largo Plazo",
    horizonte: "más de 15 años",
  },
] as const;

export const PREGUNTAS: readonly Pregunta[] = [
  {
    n: 1,
    paso: "plazo",
    texto: "¿Cuándo planeas usar este dinero?",
    // Fusión pedida por Iria (22-ago): "menos de 2 años" y "de 2 a 5" eran dos
    // opciones que llevaban al mismo lugar —con menos de cinco años lo que
    // corresponde es deuda gubernamental, no un plan de largo plazo—, así que
    // preguntarlo por separado le pedía a la persona una precisión que no
    // cambiaba nada.
    //
    // Los puntos saltan del 1 al 3 a propósito: en esta pregunta el valor ES el
    // nivel del perfil (no suma), así que renumerar a 1-2-3-4 habría bajado el
    // techo de todo el cuestionario y vuelto inalcanzable "Muy dinámico". Con
    // este salto, el nivel 2 (Moderado) deja de alcanzarse por plazo y se llega
    // solo por capacidad o tolerancia — verificado por barrido: sigue siendo
    // alcanzable en 234,816 combinaciones.
    opciones: [
      { texto: "En menos de 5 años", puntos: 1 },
      { texto: "Entre 5 y 10 años", puntos: 3 },
      { texto: "Entre 10 y 15 años", puntos: 4 },
      { texto: "Más de 15 años", puntos: 5 },
    ],
  },
  {
    n: 2,
    paso: "capacidad",
    texto:
      "¿Qué tan probable es que necesites retirar parte de este dinero en los próximos 5 años?",
    opciones: [
      { texto: "Muy probable: es parte de mi liquidez", puntos: 1 },
      { texto: "Posible: quisiera tener la puerta abierta", puntos: 2 },
      {
        texto: "Poco probable: tengo otras reservas para imprevistos",
        puntos: 3,
      },
      { texto: "Nada probable: este dinero no lo voy a tocar", puntos: 4 },
    ],
  },
  {
    n: 3,
    paso: "capacidad",
    texto: "¿Qué parte de tu patrimonio líquido representará esta inversión?",
    opciones: [
      { texto: "Más de la mitad", puntos: 1 },
      { texto: "Entre 25% y 50%", puntos: 2 },
      { texto: "Entre 10% y 25%", puntos: 3 },
      { texto: "Menos del 10%", puntos: 4 },
    ],
  },
  {
    n: 4,
    paso: "capacidad",
    texto: "Si esta inversión se perdiera por completo, tu plan de vida…",
    nota: "Piensa en tu retiro, la universidad de tus hijos, lo que ya tienes prometido.",
    opciones: [
      // Redacción ajustada por Iria (21-ago): antes "Se descarrilaría".
      { texto: "Se vería muy afectado: dependo de este dinero", puntos: 1 },
      { texto: "Se retrasaría varios años", puntos: 2 },
      { texto: "Se ajustaría, pero seguiría en pie", puntos: 3 },
      { texto: "No se afectaría: tengo otras fuentes", puntos: 4 },
    ],
  },
  {
    n: 5,
    paso: "tolerancia",
    texto: "¿Cuál es el objetivo principal de esta inversión?",
    opciones: [
      {
        texto: "Proteger mi capital: prefiero ganar menos pero no perder",
        puntos: 1,
      },
      { texto: "Ganarle a la inflación de forma constante", puntos: 2 },
      { texto: "Hacer crecer mi patrimonio de manera importante", puntos: 3 },
      {
        texto: "Construir patrimonio de largo plazo, incluso generacional",
        puntos: 4,
      },
    ],
  },
  {
    n: 6,
    paso: "tolerancia",
    texto: "¿Dónde ha estado invertido tu dinero hasta hoy?",
    opciones: [
      { texto: "Cuenta de ahorro, chequera o pagarés bancarios", puntos: 1 },
      { texto: "CETES o fondos de deuda", puntos: 2 },
      {
        texto: "Fondos mixtos o mi Afore (aportaciones voluntarias)",
        puntos: 3,
      },
      { texto: "Casa de bolsa: acciones o ETFs directamente", puntos: 4 },
    ],
  },
  {
    n: 7,
    paso: "tolerancia",
    texto: "¿Cómo describirías tu conocimiento de inversiones?",
    opciones: [
      { texto: "Básico: conozco poco de instrumentos financieros", puntos: 1 },
      {
        texto: "Intermedio: entiendo la diferencia entre deuda y bolsa",
        puntos: 2,
      },
      {
        texto: "Bueno: sigo los mercados y entiendo la diversificación",
        puntos: 3,
      },
      {
        texto:
          "Avanzado: entiendo ETFs, índices y volatilidad, y he invertido en ellos",
        puntos: 4,
      },
    ],
  },
  {
    n: 8,
    paso: "tolerancia",
    texto: "En un año malo, ¿qué caída máxima tolerarías sin cambiar tu plan?",
    // Sin conversión a pesos (decisión de Iria): la pregunta va en porcentajes.
    nota: "Es lo que verías de menos en tu estado de cuenta al cierre del año.",
    opciones: [
      {
        texto: "Ninguna: no acepto ver mi saldo abajo de lo que aporté",
        puntos: 1,
      },
      { texto: "Hasta −5%", puntos: 2 },
      { texto: "Hasta −15%", puntos: 3 },
      {
        texto: "Hasta −25% o más, si el plan de largo plazo sigue firme",
        puntos: 4,
      },
    ],
  },
  {
    n: 9,
    paso: "tolerancia",
    texto:
      "Si el mercado cayera fuerte, ¿cuánto tiempo aceptarías esperar la recuperación sin mover tu plan?",
    opciones: [
      { texto: "Menos de 6 meses", puntos: 1 },
      { texto: "Hasta 1 año", puntos: 2 },
      { texto: "2 a 3 años", puntos: 3 },
      {
        texto:
          "Lo que tome: la historia dice que se recupera y mi plazo lo permite",
        puntos: 4,
      },
    ],
  },
  {
    n: 10,
    paso: "tolerancia",
    texto: "¿Qué rendimiento anual promedio esperas de esta inversión?",
    opciones: [
      { texto: "Similar a CETES, con mínima variación", puntos: 1 },
      { texto: "Un poco arriba de la inflación, de forma estable", puntos: 2 },
      { texto: "Alrededor de 10%, aceptando altibajos en el camino", puntos: 3 },
      { texto: "12% o más, aceptando volatilidad importante", puntos: 4 },
    ],
  },
] as const;

export const TOTAL_PREGUNTAS = PREGUNTAS.length;

/** Subtotal de capacidad (P2–P4) → nivel 1..5. Rango de entrada: 3–12. */
export function nivelCapacidad(subtotal: number): number {
  if (subtotal <= 4) return 1;
  if (subtotal <= 6) return 2;
  if (subtotal <= 8) return 3;
  if (subtotal <= 10) return 4;
  return 5;
}

/** Subtotal de tolerancia (P5–P10) → nivel 1..5. Rango de entrada: 6–24. */
export function nivelTolerancia(subtotal: number): number {
  if (subtotal <= 9) return 1;
  if (subtotal <= 13) return 2;
  if (subtotal <= 17) return 3;
  if (subtotal <= 21) return 4;
  return 5;
}

/**
 * Puntos de la P8 que significan "no acepto ninguna pérdida".
 *
 * Es la primera opción: "Ninguna: no acepto ver mi saldo abajo de lo que
 * aporté".
 */
const P8_NINGUNA_PERDIDA = 1;

/**
 * Techo duro pedido por Iria (21-ago-2026): **quien no tolera ninguna pérdida
 * no puede salir arriba de conservador.**
 *
 * Sin esta regla, la P8 es solo 1 de los 24 puntos de tolerancia, así que
 * alguien que contesta "ninguna pérdida" pero se entusiasma en las otras cinco
 * preguntas (1+4+4+4+4+4 = 21) llegaba a nivel 4 y podía terminar clasificado
 * como Dinámico. Eso contradice el dato más duro que dio: si no aguanta ver el
 * saldo abajo de lo que aportó, ningún fondo con volatilidad le sirve, por muy
 * larga que sea su expectativa.
 *
 * Se aplica sobre el nivel de TOLERANCIA y no sobre el perfil final para que la
 * escalera del resultado muestre por qué: la marca de "Tolerancia" baja al
 * escalón 1, y de ahí el mínimo de los tres arrastra el perfil. Así la persona
 * ve la causa, no solo el efecto.
 */
function aplicarTechoDeTolerancia(
  nivel: number,
  respuestas: Respuestas,
): number {
  return respuestas[8] === P8_NINGUNA_PERDIDA ? 1 : nivel;
}

/**
 * Suma los puntos de una dimensión. Devuelve `null` si falta alguna respuesta
 * de ese paso — así el llamador distingue "incompleto" de "todo en el mínimo".
 */
export function sumarPaso(respuestas: Respuestas, paso: Paso): number | null {
  const preguntas = PREGUNTAS.filter((q) => q.paso === paso);
  if (preguntas.some((q) => !respuestas[q.n])) return null;
  return preguntas.reduce((acc, q) => acc + (respuestas[q.n] ?? 0), 0);
}

export type Senal = { titulo: string; detalle: string };

export type Resultado = {
  /** Nivel final: el MENOR de los tres. */
  nivel: number;
  perfil: Perfil;
  nivelPlazo: number;
  nivelCapacidad: number;
  nivelTolerancia: number;
  subtotalCapacidad: number;
  subtotalTolerancia: number;
  /**
   * Qué dimensión determinó el resultado. Si hay empate se reportan todas —
   * la pantalla de Conservador ramifica con esto (`incluye("plazo")`).
   */
  dimensionesMinimas: Paso[];
  senales: Senal[];
};

/**
 * Señales de alerta: inconsistencias entre respuestas. Van completas a Zoho —
 * son munición para la llamada de Iria. En la pantalla pública se muestra a lo
 * más una, en tono de invitación a conversar.
 */
function calcularSenales(
  r: Respuestas,
  nPlazo: number,
  nCap: number,
  nTol: number,
): Senal[] {
  const senales: Senal[] = [];

  // El techo de la P8 manda: si no acepta ninguna pérdida, esa es LA razón del
  // resultado y va primero — en público se muestra a lo más una señal.
  if (r[8] === P8_NINGUNA_PERDIDA) {
    senales.push({
      titulo: "No aceptas ver tu saldo abajo de lo que aportaste",
      detalle:
        "Ese solo dato define tu perfil: un fondo que puede bajar no te sirve, por muy largo que sea tu plazo. Lo tuyo es un plan con capital o rendimiento mínimo garantizado.",
    });
  }
  if (r[10] === 4 && r[8] === 2) {
    senales.push({
      titulo: "Tu expectativa y tu tolerancia no cuadran",
      detalle:
        "Esperas 12% o más pero solo aguantas una caída de 5%. Una de las dos tiene que ceder.",
    });
  }
  if (nCap - nTol >= 2) {
    senales.push({
      titulo: "El plan cabe, pero la tranquilidad no",
      detalle:
        "Tu situación aguanta más riesgo del que tú aguantas. Conviene empezar más conservador y subir con la confianza.",
    });
  }
  if (nTol - nCap >= 2) {
    senales.push({
      titulo: "Quieres más riesgo del que tu situación permite",
      detalle: "La capacidad manda, sin excepción. Vale la pena revisar por qué.",
    });
  }
  if (nPlazo < Math.min(nCap, nTol)) {
    senales.push({
      titulo: "El plazo es el techo",
      detalle:
        "Tu capacidad y tu tolerancia dan para más, pero el horizonte no. No hay puntaje que levante el plazo.",
    });
  }
  if (r[7] === 1 && (r[10] ?? 0) >= 3) {
    senales.push({
      titulo: "Expectativa alta con poca experiencia",
      detalle:
        "Antes de firmar, pide que te expliquen de dónde sale ese rendimiento y a qué costo.",
    });
  }
  if (r[2] === 1 && (r[1] ?? 0) >= 4) {
    senales.push({
      titulo: "Dices largo plazo, pero es tu liquidez",
      detalle:
        "El plazo que declaraste y el uso real del dinero no coinciden. Vale la pena aclararlo.",
    });
  }

  return senales;
}

/**
 * Calcula el perfil completo. Lanza si faltan respuestas: el llamador debe
 * validar antes (el cliente no deja avanzar; el servidor rechaza el payload).
 */
export function calcularResultado(respuestas: Respuestas): Resultado {
  const nivelPlazo = respuestas[1];
  const subtotalCap = sumarPaso(respuestas, "capacidad");
  const subtotalTol = sumarPaso(respuestas, "tolerancia");

  if (!nivelPlazo || subtotalCap === null || subtotalTol === null) {
    throw new Error("Cuestionario incompleto: faltan respuestas.");
  }

  const nCap = nivelCapacidad(subtotalCap);
  const nTol = aplicarTechoDeTolerancia(
    nivelTolerancia(subtotalTol),
    respuestas,
  );
  const nivel = Math.min(nivelPlazo, nCap, nTol);

  const dimensionesMinimas: Paso[] = [];
  if (nivelPlazo === nivel) dimensionesMinimas.push("plazo");
  if (nCap === nivel) dimensionesMinimas.push("capacidad");
  if (nTol === nivel) dimensionesMinimas.push("tolerancia");

  return {
    nivel,
    perfil: PERFILES[nivel - 1],
    nivelPlazo,
    nivelCapacidad: nCap,
    nivelTolerancia: nTol,
    subtotalCapacidad: subtotalCap,
    subtotalTolerancia: subtotalTol,
    dimensionesMinimas,
    senales: calcularSenales(respuestas, nivelPlazo, nCap, nTol),
  };
}

/**
 * Valida que un objeto arbitrario (el payload que llega del navegador) sea un
 * juego completo y legítimo de respuestas. Devuelve `null` si no lo es.
 *
 * Comprueba que cada valor sea uno de los puntajes **declarados** para esa
 * pregunta, no solo un número en rango: así un payload manipulado con `{"8": 99}`
 * o `{"8": 3.5}` se rechaza en vez de colarse al cálculo.
 */
export function parseRespuestas(input: unknown): Respuestas | null {
  if (typeof input !== "object" || input === null) return null;
  const bruto = input as Record<string, unknown>;
  const respuestas: Respuestas = {};

  for (const q of PREGUNTAS) {
    const valor = bruto[String(q.n)];
    if (typeof valor !== "number" || !Number.isInteger(valor)) return null;
    if (!q.opciones.some((o) => o.puntos === valor)) return null;
    respuestas[q.n] = valor;
  }

  return respuestas;
}
