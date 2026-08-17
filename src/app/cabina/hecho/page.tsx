/**
 * /cabina/hecho — confirmación de una acción de la cabina.
 *
 * El link del correo trae ?a&deal&t (HMAC). Este GET NO muta nada — un
 * escáner de correo que pre-visite la URL solo ve esta página. La mutación
 * viaja en el <form method="post"> hacia /api/cabina/hecho, y solo un clic
 * humano la dispara. Con ?listo=1 (el redirect del POST) se ve el resultado.
 *
 * Con token inválido no se revela nada del trato: página neutra y adiós.
 */

import { verificarAccion, type AccionCabina } from "@/lib/cabina/token";
import { obtenerTrato } from "@/lib/pipedrive";

export const dynamic = "force-dynamic";

type Params = {
  searchParams: Promise<{
    a?: string;
    deal?: string;
    t?: string;
    listo?: string;
    parcial?: string;
  }>;
};

const COPY: Record<AccionCabina, { pregunta: string; boton: string; explica: string; listo: string }> = {
  "propuesta-enviada": {
    pregunta: "¿Marcar propuesta como enviada?",
    boton: "✅ Sí, ya la mandé",
    explica:
      "Mueve la tarjeta a «Propuesta enviada», sella la fecha de hoy, le quita la etiqueta «⏳ Debe cotización» y agenda tu seguimiento a 3 días hábiles.",
    listo: "✅ Propuesta registrada",
  },
  "pidio-cotizacion": {
    pregunta: "¿Marcar que te pidió cotización?",
    boton: "📋 Sí, me pidió cotización",
    explica:
      "Le pone la etiqueta «⏳ Debe cotización» y te agenda la tarea «Armar y enviar cotización» a 2 días hábiles.",
    listo: "📋 Anotado: te pidió cotización",
  },
};

const PARCIAL: Record<string, string> = {
  etapa:
    "Ojo: no se pudo mover la etapa (revisa el trato en Pipedrive), pero la acción quedó registrada.",
  seguimiento:
    "La etapa se movió, pero el seguimiento no se pudo agendar — créalo a mano en Pipedrive.",
  etiqueta:
    "Ojo: la etiqueta no se pudo poner (¿ya existe «⏳ Debe cotización» en Pipedrive?). La tarea sí quedó.",
  tarea:
    "La etiqueta quedó puesta, pero la tarea no se pudo crear — agrégala a mano en Pipedrive.",
  falla:
    "Pipedrive no respondió y la acción NO se aplicó. Ábrelo directo en Pipedrive y hazlo a mano, o vuelve a intentar desde el correo.",
};

function Marco({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      {children}
    </main>
  );
}

export default async function CabinaHechoPage({ searchParams }: Params) {
  const { a, deal, t, listo, parcial } = await searchParams;
  const accion = a ?? "";
  const dealId = Number(deal ?? NaN);
  const token = t ?? "";
  const secreto = process.env.CABINA_SECRET ?? "";

  const valido = Boolean(secreto) && verificarAccion(accion, dealId, token, secreto);

  if (!valido) {
    return (
      <Marco>
        <h1 className="text-espresso text-2xl font-bold">Enlace no válido</h1>
        <p className="text-rif-gris mt-3 text-sm">
          Este enlace no corresponde a una acción de la cabina. Abre el correo
          más reciente e inténtalo desde ahí.
        </p>
      </Marco>
    );
  }

  const copy = COPY[accion as AccionCabina];

  if (listo === "1") {
    return (
      <Marco>
        <h1 className="text-espresso text-2xl font-bold">{copy.listo}</h1>
        <p className="text-rif-gris mt-3 text-sm">
          {parcial ? PARCIAL[parcial] : "Todo quedó registrado. Nada más que hacer aquí."}
        </p>
        <a
          className="bg-rif-rojo mt-6 inline-block rounded-md px-5 py-2 text-sm font-semibold text-white"
          href={`https://reingenieriafinanciera.pipedrive.com/deal/${dealId}`}
        >
          Ver el trato en Pipedrive
        </a>
      </Marco>
    );
  }

  // Mostrar QUÉ se va a marcar. Si Pipedrive no contesta, se degrada al
  // número del trato: confirmar a ciegas es peor que confirmar con nombre,
  // pero bloquear la acción es peor que ambas.
  const trato = await obtenerTrato(dealId);

  return (
    <Marco>
      <h1 className="text-espresso text-2xl font-bold">{copy.pregunta}</h1>
      <p className="text-rif-gris mt-3 text-sm">
        {trato?.title
          ? `Trato: ${trato.title}`
          : `Trato #${dealId} (no se pudo leer el título ahora mismo)`}
      </p>
      <p className="text-rif-gris mt-2 max-w-md text-xs">
        {copy.explica} Nada sale a WhatsApp desde aquí.
      </p>
      <form method="post" action="/api/cabina/hecho" className="mt-6">
        <input type="hidden" name="a" value={accion} />
        <input type="hidden" name="deal" value={String(dealId)} />
        <input type="hidden" name="t" value={token} />
        <button
          type="submit"
          className="bg-rif-rojo cursor-pointer rounded-md px-6 py-3 text-sm font-bold text-white"
        >
          {copy.boton}
        </button>
      </form>
    </Marco>
  );
}
