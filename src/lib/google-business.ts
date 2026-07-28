/**
 * Ficha de Google Business de Iria Talan / RIF.
 *
 * Los identificadores se obtuvieron resolviendo el enlace corto que emite el
 * panel de Google Business (`g.page/r/CR64Zq4N12I7EAE`):
 *   place ID  ChIJlR5zLH6UEggRHrhmrg3XYjs
 *   CID       4279219049715906590
 *
 * Ojo con la diferencia, porque son dos intenciones distintas:
 *   REVIEWS_URL       lista pública de reseñas — para prospectos (prueba social)
 *   WRITE_REVIEW_URL  formulario para dejar reseña — para clientes actuales
 *
 * NO se emite `aggregateRating` en schema: Google prohíbe el marcado de
 * reseñas sobre uno mismo en Organization/LocalBusiness, y la ficha tiene
 * muy pocas reseñas todavía. El enlace visible sí es legítimo.
 */

export const GOOGLE_PLACE_ID = "ChIJlR5zLH6UEggRHrhmrg3XYjs";
export const GOOGLE_CID = "4279219049715906590";

/**
 * Reseñas publicadas — lo que lee un prospecto.
 * Se usa la URL de Maps por CID: `search.google.com/local/reviews?placeid=…`
 * devuelve 404 (verificado 28-jul-2026), la de Maps responde 200.
 */
export const GOOGLE_REVIEWS_URL = `https://www.google.com/maps?cid=${GOOGLE_CID}`;

/** Formulario para dejar una reseña — lo que se manda a un cliente. */
export const GOOGLE_WRITE_REVIEW_URL = "https://g.page/r/CR64Zq4N12I7EAE/review";

/** Ficha completa en Google/Maps. */
export const GOOGLE_PROFILE_URL = `https://www.google.com/maps?cid=${GOOGLE_CID}`;
