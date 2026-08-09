/**
 * Enlaces de WhatsApp con mensaje precargado.
 *
 * Un `wa.me` pelón abre un chat en blanco: Iria recibe un "Hola" sin contexto y
 * tiene que preguntar de qué se trata. Con `?text=` el visitante llega ya
 * diciendo qué página estaba viendo y qué quiere — el lead entra
 * auto-etiquetado y la conversación empieza en el segundo mensaje, no en el
 * quinto.
 *
 * Los mensajes están escritos en primera persona del visitante y en el idioma
 * de la página (las páginas /foreigners-in-mexico, /international-health-insurance
 * y /retirement-planning son EN).
 */

/**
 * Número de respaldo si Sanity no trae el del autor.
 *
 * Es el WhatsApp Business API (WABA) conectado a respond.io, donde el equipo
 * atiende los chats. NO es el número de voz: un WABA no recibe llamadas, así
 * que el `tel:` del sitio apunta a otro número (`socialLinks.phone`). Si algún
 * día se unifican, hay que cambiar ambos y la ficha de Google Business.
 */
export const WA_NUMBER_FALLBACK = "525526786325";

export const WA_MESSAGES = {
  /** Footer, botón flotante y cualquier CTA sin página específica. */
  default:
    "Hola Iria, vi tu sitio y me gustaría agendar una primera plática.",

  // — Páginas de producto (ES) —
  retiro:
    "Hola Iria, estoy viendo la página de Retiro y quiero saber cómo empezar mi plan.",
  gmm:
    "Hola Iria, estoy viendo la página de Gastos Médicos Mayores y quiero una cotización.",
  patrimonial:
    "Hola Iria, estoy viendo la página de Asesoría Patrimonial y quiero platicar de mi caso.",
  segurosVida:
    "Hola Iria, estoy viendo la página de Seguros de Vida y quiero saber qué opción me conviene.",
  planesEducacionales:
    "Hola Iria, estoy viendo la página de Planes Educacionales y quiero planear la universidad de mi hijo.",
  fondosInversion:
    "Hola Iria, estoy viendo la página de Fondos de Inversión y quiero saber cómo empezar a invertir.",
  empresas:
    "Hola Iria, estoy viendo la página de Empresas y quiero información de beneficios para mi equipo.",

  // — Páginas de audiencia (ES) —
  mujeres:
    "Hola Iria, estoy viendo la página de Mujeres y quiero asesoría para construir mi patrimonio.",
  familiasArcoiris:
    "Hola Iria, estoy viendo la página de Familias Arcoíris y quiero proteger a mi familia.",
  hijosNeurodivergentes:
    "Hola Iria, estoy viendo la página de Hijos Neurodivergentes y quiero asegurar el futuro de mi hijo.",
  mexicanosExtranjero:
    "Hola Iria, estoy viendo la página de Mexicanos en el Extranjero y quiero asesoría viviendo fuera de México.",
  sobreIria:
    "Hola Iria, vi tu perfil en el sitio y me gustaría agendar una primera plática.",

  // — Blog —
  /** Respaldo para el blog cuando no se conoce el artículo (índice, categorías). */
  blog:
    "Hola Iria, estoy leyendo tu blog y me gustaría platicar contigo sobre mi caso.",

  // — Páginas en inglés —
  internationalHealth:
    "Hi Iria, I'm on your International Health Insurance page and I'd like a quote.",
  foreignersInMexico:
    "Hi Iria, I'm on your Foreigners in Mexico page and I'd like advice on coverage in Mexico.",
  retirementPlanning:
    "Hi Iria, I'm on your Retirement Planning page and I'd like to start a retirement plan.",
} as const;

/**
 * Mensaje para el lector que termina un artículo — el lead más caliente del
 * blog. Nombrar el artículo evita el "Hola" sin contexto: Iria abre el chat
 * sabiendo qué leyó y por qué escribe.
 *
 * El título se recorta porque algunos pasan de 90 caracteres y el mensaje
 * precargado se vuelve ilegible en el móvil.
 */
export function waBlogMessage(articleTitle?: string | null): string {
  const t = articleTitle?.trim();
  if (!t) return WA_MESSAGES.blog;
  const corto = t.length > 70 ? `${t.slice(0, 70).trimEnd()}…` : t;
  return `Hola Iria, leí tu artículo "${corto}" y me gustaría platicar contigo sobre mi caso.`;
}

/**
 * Construye el enlace de WhatsApp. Acepta el número en cualquier formato
 * (con espacios, guiones o lada) porque viene de Sanity y no está normalizado.
 */
export function waHref(
  numero: string | undefined | null,
  mensaje: string = WA_MESSAGES.default,
): string {
  const digits = (numero ?? WA_NUMBER_FALLBACK).replace(/\D/g, "");
  return `https://wa.me/${digits || WA_NUMBER_FALLBACK}?text=${encodeURIComponent(mensaje)}`;
}
