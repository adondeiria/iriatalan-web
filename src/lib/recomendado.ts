/**
 * "¿Quién te recomendó?" del formulario de contacto.
 *
 * Casi todos los clientes de Iria llegan recomendados por otros clientes
 * (confirmado por Iria, oct-2026); este campo es lo que deja medirlo. Es texto
 * libre del visitante, así que se sanea antes de llegar al CRM: letras (con
 * acentos y ñ), espacios y puntuación de nombres, acotado a 80 caracteres.
 *
 * No confundir con `referrer` (el SITIO web desde el que llegó): esto es una
 * PERSONA.
 */
export function limpiarRecomendadoPor(valor: unknown): string {
  if (typeof valor !== "string") return "";
  return valor
    .replace(/[^\p{L}\p{M}\s.'\-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
