/**
 * Textos de las pantallas de resultado del cuestionario de perfil.
 *
 * Todo lo que la persona lee al terminar vive aquí y no repartido por el
 * componente: es la parte que Iria va a querer ajustar palabra por palabra, y
 * tenerla junta hace que un cambio de copy no obligue a leer JSX.
 *
 * Regla de redacción del sitio, aplicada aquí: **categoría de producto, nunca
 * marcas**. Ni aseguradoras ni nombres de estrategias en la pantalla pública —
 * la estrategia guía de Allianz solo aparece en el modo sesión, donde Iria está
 * presente. Tampoco van porcentajes ni mezclas de activos: el cuestionario
 * entrega una etiqueta con su interpretación, no una recomendación de
 * asignación (decisión de Iria, 21-ago-2026).
 */

import {
  noAceptaNingunaPerdida,
  type Paso,
  type Resultado,
} from "./perfil-inversionista.ts";

export type TextoPerfil = {
  /** Qué significa el perfil en la práctica. */
  significado: string;
  /** El error típico de ese perfil: es lo que da peso sin dar porcentajes. */
  errorTipico: string;
  /** Qué conviene preguntarle a Iria en la plática. */
  quePreguntar: string;
};

/**
 * Texto genérico de cada nivel. Se usa solo cuando `textoRecomendacion`
 * devuelve `null` — es decir, cuando ni el plazo corto ni el nivel 1 aplican.
 */
export const TEXTOS_PERFIL: Record<number, TextoPerfil> = {
  2: {
    significado:
      "Buscas que tu dinero le gane a la inflación sin sobresaltos grandes. Aceptas algo de movimiento, pero tu prioridad sigue siendo no ver números rojos importantes.",
    errorTipico:
      "Compararse con quien tomó más riesgo en un año bueno y cambiar de estrategia a destiempo — justo cuando ya subió.",
    quePreguntar:
      "Qué tanto movimiento es normal en una estrategia moderada, para que no te tome por sorpresa.",
  },
  3: {
    significado:
      "Tienes plazo, situación y estómago para aceptar altibajos a cambio de más crecimiento. No buscas emociones fuertes, pero entiendes que el rendimiento se paga con paciencia.",
    errorTipico:
      "Revisar el saldo cada semana. La estrategia está pensada en años, y mirarla en días solo genera ansiedad y decisiones malas.",
    quePreguntar:
      "Cada cuánto conviene revisar de verdad, y qué señal sí ameritaría un ajuste.",
  },
  4: {
    significado:
      "Tu horizonte es largo y tu situación aguanta. Puedes buscar crecimiento importante, sabiendo que habrá años en rojo en el camino.",
    errorTipico:
      "Subestimar cómo se siente una caída real. Aceptar «hasta −25%» en un cuestionario es muy distinto a vivirlo con tu dinero.",
    quePreguntar:
      "Qué caídas ha habido históricamente y cuánto tardaron en recuperarse, para que lo decidas viendo la película completa.",
  },
  5: {
    significado:
      "Plazo largo, capacidad sobrada y tolerancia alta. Estás en posición de construir patrimonio de largo plazo, incluso generacional.",
    errorTipico:
      "Confundir tolerancia con inmunidad. El perfil más agresivo también necesita un plan escrito para los años malos — sobre todo ese.",
    quePreguntar:
      "Cómo se protege este perfil de sí mismo, y qué parte del patrimonio conviene que NO esté aquí.",
  },
};

/**
 * Las tres recomendaciones que sustituyen al texto genérico del perfil.
 *
 * Son clientes distintos y por eso no comparten copy. Iria pidió que al perfil
 * conservador se le recomiende **de plano un plan garantizado o con rendimiento
 * mínimo garantizado** — pero eso solo aplica cuando el plazo da: con menos de
 * cinco años lo que corresponde es deuda gubernamental, porque hasta los
 * garantizados penalizan el rescate anticipado.
 *
 * Es el segundo embudo de la asesoría: quien vende fondos descarta a este
 * prospecto, y aquí se convierte en cliente de garantizados o de deuda.
 */
export type VarianteRecomendacion =
  | "sin_perdida"
  | "plazo_corto"
  | "plazo_y_sin_perdida"
  | "situacion";

export type TextoRecomendacion = {
  variante: VarianteRecomendacion;
  titulo: string;
  cuerpo: string;
  errorTipico: string;
  quePreguntar: string;
  /** Texto del botón de contacto: cambia el tono de la invitación. */
  cta: string;
};

const RECOMENDACION: Record<VarianteRecomendacion, TextoRecomendacion> = {
  // Caso más claro: lo dijo explícitamente en la pregunta 8.
  sin_perdida: {
    variante: "sin_perdida",
    titulo: "Tu perfil es conservador — y hay una razón muy concreta.",
    cuerpo:
      "Dijiste que no aceptas ver tu saldo abajo de lo que aportaste. Eso no es miedo: es un requisito, y por sí solo define tu perfil sin importar cuánto plazo tengas o cuánto aguante tu situación. Un fondo que puede bajar no cumple ese requisito. Lo que sí lo cumple son los planes con capital garantizado o con rendimiento mínimo garantizado: creces menos, pero no dependes de que el mercado se porte bien el año que necesitas el dinero.",
    errorTipico:
      "Aceptar un plan con fondos porque «a largo plazo siempre sube», y salirse en la primera caída fuerte. Salirse a destiempo es la única pérdida que sí está garantizada.",
    quePreguntar:
      "Cuáles son las opciones con capital o rendimiento mínimo garantizado, y qué estás dejando sobre la mesa a cambio de esa tranquilidad.",
    cta: "Quiero ver las opciones garantizadas",
  },

  // El plazo es el techo. No es que "no haya nada": para horizontes cortos lo
  // que aplica es deuda gubernamental, y ahí sí hay camino — con plan o sin él.
  plazo_corto: {
    variante: "plazo_corto",
    titulo: "Aquí lo que manda es tu plazo.",
    cuerpo:
      "Con un horizonte de menos de cinco años, lo que te corresponde son fondos de deuda gubernamental —del tipo de los CETES—, no un plan de largo plazo con exposición a los mercados. La razón no es tu temperamento: estos planes penalizan el rescate anticipado, y el tiempo es justo lo que los hace funcionar. Existen planes de inversión que sí operan con fondos de este perfil, y también puedes ir a deuda gubernamental por tu cuenta. Cuál te conviene depende del monto y de para qué es el dinero — eso lo vemos en cinco minutos de conversación.",
    errorTipico:
      "Contratar a largo plazo dinero que se va a necesitar pronto, y descubrir la penalización cuando ya no hay vuelta atrás.",
    quePreguntar:
      "Qué fondo de deuda gubernamental conviene para tu plazo, si te sirve más dentro de un plan o por tu cuenta, y desde qué monto tiene sentido cada opción.",
    cta: "Quiero que me propongan un fondo",
  },

  // Las dos cosas a la vez. Iria lo detectó probando el cuestionario con su
  // propio caso: plazo corto Y cero tolerancia a pérdida. La pantalla de plazo
  // le contestaba solo la mitad, y la mitad que callaba era justo la que ella
  // había marcado con más fuerza.
  plazo_y_sin_perdida: {
    variante: "plazo_y_sin_perdida",
    titulo: "Aquí mandan dos cosas: tu plazo y tu tolerancia.",
    cuerpo:
      "Dijiste dos cosas que apuntan al mismo lugar. Primero, que vas a necesitar este dinero en menos de cinco años. Segundo, que no aceptas ver tu saldo abajo de lo que aportaste. Cualquiera de las dos por separado ya descartaría un plan de largo plazo con exposición a los mercados; juntas no dejan lugar a dudas. Lo que corresponde a tu caso son instrumentos de deuda gubernamental, del tipo de los CETES: rendimiento modesto, sin sobresaltos y disponibles en el plazo que necesitas.",
    errorTipico:
      "Buscar un rendimiento alto que compense el plazo corto. Es justo la combinación que más gente lleva a aceptar una promesa que nadie regulado puede cumplir — y ahí es donde se pierde el patrimonio, no en los mercados.",
    quePreguntar:
      "Qué fondo de deuda gubernamental conviene para tu plazo, si te sirve más dentro de un plan o por tu cuenta, y qué rendimiento es razonable esperar sin salirte de ahí.",
    cta: "Quiero que me propongan un fondo",
  },

  // Su situación o su temperamento no dan, aunque el plazo sí.
  situacion: {
    variante: "situacion",
    titulo: "Tu perfil es conservador.",
    cuerpo:
      "Un plan con fondos de inversión no es tu instrumento — y no es mala noticia. Para tu perfil existen planes con capital garantizado o con rendimiento mínimo garantizado: creces menos, pero no dependes de que el mercado se porte bien el año que necesitas el dinero.",
    errorTipico:
      "Aceptar más riesgo del que la situación permite porque el rendimiento se ve mejor en la proyección. La capacidad manda, sin excepción.",
    quePreguntar:
      "Cuáles son las opciones con capital o rendimiento mínimo garantizado, y qué estás dejando sobre la mesa a cambio de esa tranquilidad.",
    cta: "Quiero ver las opciones garantizadas",
  },
};

/**
 * Nivel de plazo hasta el cual manda el horizonte: 1 = menos de 2 años,
 * 2 = de 2 a 5. Corrección de Iria (22-ago): **con menos de cinco años** lo que
 * aplica son fondos de deuda gubernamental, no un plan de largo plazo.
 */
const PLAZO_MAXIMO_CORTO = 2;

/**
 * Elige el bloque de recomendación que va arriba del resultado, o `null` para
 * usar el texto genérico del perfil (`TEXTOS_PERFIL`).
 *
 * Precedencia deliberada: **el plazo antes que todo lo demás, y antes que el
 * nivel del perfil**.
 *
 * Ojo con esto último, porque es la razón de que la función no se llame
 * "textoConservador": con plazo de 2 a 5 años el perfil sale **Moderado**, no
 * Conservador —el mínimo de los tres niveles es 2—, y aun así esa persona tiene
 * que ver la recomendación de deuda gubernamental. Amarrar este bloque al nivel
 * del perfil dejaba fuera justo al que Iria quería atender.
 *
 * Para quien sí tiene plazo largo, el orden es: primero el techo de la P8 (lo
 * dijo explícitamente), luego su situación.
 */
export function textoRecomendacion(
  resultado: Resultado,
  respuestas: Record<number, number>,
): TextoRecomendacion | null {
  const plazoCorto = resultado.nivelPlazo <= PLAZO_MAXIMO_CORTO;
  const sinPerdida = noAceptaNingunaPerdida(respuestas);

  // Cuando mandan las dos, se nombran las dos. Contestar solo el plazo deja
  // fuera lo que la persona marcó con más fuerza, y se lee como si no la
  // hubiéramos escuchado.
  if (plazoCorto && sinPerdida) return RECOMENDACION.plazo_y_sin_perdida;
  if (plazoCorto) return RECOMENDACION.plazo_corto;
  if (resultado.nivel !== 1) return null;
  if (sinPerdida) return RECOMENDACION.sin_perdida;
  return RECOMENDACION.situacion;
}

/**
 * Preguntas frecuentes que van DEBAJO del cuestionario, en la puerta pública.
 *
 * Existen por una razón concreta de posicionamiento: el cuestionario es una
 * app, y ni Google ni las IA leen lo que se pinta al hacer clic. Sin texto
 * indexable, esta página no puede rankear para lo que la gente sí busca —"qué
 * tipo de inversionista soy", "test de perfil de riesgo"—, por muy buena que
 * sea la herramienta.
 *
 * Las respuestas están escritas para citarse solas: cada una responde su
 * pregunta en la primera oración, sin depender del resto de la página. Es la
 * misma regla de las propuestas blindadas — quien lea esto lo va a pegar en su
 * IA, y conviene que la reproduzca bien.
 */
export const FAQ_PERFIL: Array<{ pregunta: string; respuesta: string }> = [
  {
    pregunta: "¿Qué es un perfil de inversionista?",
    respuesta:
      "Es la clasificación que resume cuánto riesgo puedes y quieres tomar con un dinero determinado. Se construye con tres cosas distintas: tu plazo (cuándo vas a necesitarlo), tu capacidad (qué tanto aguanta tu situación si esa inversión sale mal) y tu tolerancia (qué tanta caída soportas sin cambiar de plan). No es un rasgo de personalidad: la misma persona puede ser conservadora con el dinero de la universidad de sus hijos y dinámica con su retiro.",
  },
  {
    pregunta: "¿Cómo sé qué tipo de inversionista soy?",
    respuesta:
      "Contestando honestamente sobre tu plazo, tu situación y tu reacción ante una caída. Este cuestionario lo hace en diez preguntas y unos tres minutos, y entrega un perfil del 1 al 5: conservador, moderado, dinámico moderado, dinámico o muy dinámico. La clave está en responder lo que harías de verdad, no lo que te gustaría hacer.",
  },
  {
    pregunta: "¿Por qué el resultado es el menor de los tres niveles?",
    respuesta:
      "Porque las tres dimensiones son requisitos, no promedios. Tolerar mucho riesgo no sirve si tu situación no lo permite —te obligaría a vender en el peor momento—, y poder tomarlo no sirve si no vas a dormir tranquilo. Promediarlos daría un perfil que ninguna de las tres condiciones sostiene, así que manda la más restrictiva.",
  },
  {
    pregunta: "¿Qué pasa si no acepto ninguna pérdida?",
    respuesta:
      "Que tu perfil es conservador, sin importar cuánto plazo tengas o cuánto aguante tu situación. Si no toleras ver tu saldo abajo de lo que aportaste, un fondo con exposición a los mercados no cumple ese requisito. Para ese caso existen los planes con capital garantizado o con rendimiento mínimo garantizado: creces menos, pero no dependes de que el mercado se porte bien el año que necesitas el dinero.",
  },
  {
    pregunta: "¿Dónde invierto si voy a necesitar el dinero en menos de 5 años?",
    respuesta:
      "Con un horizonte de menos de 5 años lo que corresponde son instrumentos de deuda gubernamental, del tipo de los CETES. Los planes de inversión de largo plazo penalizan el rescate anticipado, así que meter ahí dinero que vas a necesitar pronto convierte una buena decisión en una pérdida segura. Existen planes que operan con fondos de este perfil y también puedes ir a deuda gubernamental por tu cuenta; cuál conviene depende del monto y del uso que le vas a dar.",
  },
  {
    pregunta: "¿Este cuestionario guarda mis datos?",
    respuesta:
      "No. El cuestionario se calcula completo en tu navegador: las respuestas no se envían a ningún servidor y no quedan en ninguna base de datos. Al terminar decides tú si mandas el resultado por WhatsApp o si te lo llevas en PDF; si no haces ninguna de las dos, no queda registro de que lo contestaste.",
  },
  {
    pregunta: "¿Sustituye al cuestionario que firmo con la aseguradora?",
    respuesta:
      "No. Es una herramienta de asesoría previa, basada en los mismos criterios de perfilamiento que usan las aseguradoras —horizonte, experiencia, liquidez y expectativa de rendimiento—, pero complementa y no reemplaza el cuestionario oficial que firmas junto con tu solicitud.",
  },
];

/** Nombre legible de cada dimensión, para el texto de "lo que define tu perfil". */
export const NOMBRE_DIMENSION: Record<Paso, string> = {
  plazo: "tu plazo",
  capacidad: "tu capacidad",
  tolerancia: "tu tolerancia",
};

/** Une dimensiones en una frase: "tu plazo y tu tolerancia". */
export function fraseDimensiones(dimensiones: Paso[]): string {
  const nombres = dimensiones.map((d) => NOMBRE_DIMENSION[d]);
  if (nombres.length === 1) return nombres[0];
  if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}
