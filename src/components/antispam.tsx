"use client";

import { useState } from "react";

/**
 * Anti-spam compartido para los formularios que envían a `/api/contact`.
 *
 * El endpoint ya sabía leer dos señales —`website` (honeypot) y `elapsed_ms`—
 * y a los bots les responde `{ success: true }` sin reenviar a Zoho, para no
 * darles pista de que fueron bloqueados. Pero ambas guardas están escritas
 * **fail-open** a propósito ("forms viejos sin estos campos no se rompen"), así
 * que un formulario que no manda los campos simplemente no tiene antispam. Eso
 * les pasaba a los 4 lead magnets: el form de /contacto sí los mandaba y ellos
 * no, de modo que la puerta de atrás estaba abierta.
 *
 * Va en un módulo compartido y no copiado en cada form por la razón de siempre
 * en este proyecto: lo que se duplica a mano, deriva. El honeypot solo sirve si
 * el `name` del campo y el que valida el servidor coinciden exactamente, y eso
 * es justo lo que se rompe cuando hay cinco copias.
 */

/** Nombre del campo trampa. Debe coincidir con `body.website` en la API. */
const CAMPO_TRAMPA = "website";

/**
 * Campo trampa: invisible para una persona, irresistible para un bot que
 * autocompleta todo lo que encuentra.
 *
 * Se oculta sacándolo del viewport y no con `display:none` ni `hidden`: los
 * bots decentes ignoran los campos ocultos por CSS obvio, así que esconderlo
 * "bien" lo volvería inútil. `aria-hidden` + `tabIndex={-1}` lo sacan del
 * lector de pantalla y del recorrido por tabulador, que es lo que importa para
 * que ninguna persona real lo llene por accidente.
 *
 * `idPrefix` mantiene único el `id` si algún día conviven dos formularios en la
 * misma página — un `id` repetido rompe la asociación del `<label>`.
 */
export function CampoTrampa({ idPrefix }: { idPrefix: string }) {
  const id = `${idPrefix}-${CAMPO_TRAMPA}`;
  return (
    <div
      aria-hidden="true"
      className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
    >
      <label htmlFor={id}>No llenar este campo</label>
      <input
        type="text"
        id={id}
        name={CAMPO_TRAMPA}
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

/**
 * Marca cuándo se montó el formulario y devuelve los dos campos anti-spam
 * listos para meter en el payload.
 *
 * `datos(formData)` se llama en el submit: `elapsed_ms` sale de la diferencia
 * contra el montaje, y el servidor descarta lo que llegue en menos de 3 s.
 */
export function useAntispam() {
  const [montadoEn] = useState<number>(() => Date.now());

  return {
    datos(formData: FormData) {
      return {
        website: String(formData.get(CAMPO_TRAMPA) ?? ""),
        elapsed_ms: Date.now() - montadoEn,
      };
    },
  };
}
