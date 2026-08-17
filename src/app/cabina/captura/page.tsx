/**
 * /cabina/captura — captura rápida desde el celular.
 *
 * El caso real: a Iria le piden cotización por WhatsApp, no por correo. Entre
 * ese mensaje y la etiqueta en Pipedrive hay un tramo (salir de WhatsApp,
 * abrir el CRM, buscar o dar de alta a la persona) que se hace justo cuando
 * está ocupada — y si ese tramo es incómodo, no se hace y el prospecto se
 * pierde. Esta pantalla lo reduce a tres campos y un botón.
 *
 * Se guarda en la pantalla de inicio del celular como si fuera una app. La
 * llave viaja en la URL: no hay sesión que expire justo cuando urge capturar.
 */

import { verificarLlaveCaptura } from "@/lib/cabina/token";

export const dynamic = "force-dynamic";

type Params = {
  searchParams: Promise<{
    k?: string;
    ok?: string;
    deal?: string;
    reuso?: string;
    error?: string;
  }>;
};

export default async function CapturaPage({ searchParams }: Params) {
  const { k, ok, deal, reuso, error } = await searchParams;
  const llave = k ?? "";
  const secreto = process.env.CABINA_SECRET ?? "";

  if (!verificarLlaveCaptura(llave, secreto)) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-espresso text-2xl font-bold">Enlace no válido</h1>
        <p className="text-rif-gris mt-3 text-sm">
          Usa el enlace que guardaste en tu pantalla de inicio.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <h1 className="text-espresso text-2xl font-bold">Me pidieron cotización</h1>
      <p className="text-rif-gris mt-2 text-sm">
        Captura al vuelo desde WhatsApp. Queda en Pipedrive con su tarea a 2
        días hábiles.
      </p>

      {ok === "1" && (
        <div className="mt-5 rounded-lg border border-green-600 bg-green-50 p-4 text-sm">
          <p className="font-bold text-green-900">
            {reuso === "1" ? "Anotado en su trato existente" : "Prospecto creado"}
          </p>
          <p className="mt-1 text-green-800">
            Ya tiene la etiqueta y su tarea. Puedes cerrar y seguir.
          </p>
          <a
            className="mt-2 inline-block font-semibold text-green-900 underline"
            href={`https://reingenieriafinanciera.pipedrive.com/deal/${deal}`}
          >
            Ver en Pipedrive
          </a>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-rif-rojo bg-red-50 p-4 text-sm">
          <p className="text-rif-rojo font-bold">No se pudo guardar</p>
          <p className="mt-1 text-red-900">
            Nada quedó a medias. Inténtalo otra vez, o anótalo en Pipedrive a
            mano.
          </p>
        </div>
      )}

      <form method="post" action="/api/cabina/captura" className="mt-6 space-y-4">
        <input type="hidden" name="k" value={llave} />

        <label className="block">
          <span className="text-espresso text-sm font-semibold">Nombre</span>
          <input
            name="nombre"
            required
            autoComplete="off"
            className="border-rif-gris/40 mt-1 w-full rounded-md border px-3 py-3 text-base"
            placeholder="Como te escribió"
          />
        </label>

        <label className="block">
          <span className="text-espresso text-sm font-semibold">WhatsApp</span>
          <input
            name="telefono"
            required
            type="tel"
            inputMode="tel"
            autoComplete="off"
            className="border-rif-gris/40 mt-1 w-full rounded-md border px-3 py-3 text-base"
            placeholder="55 1234 5678"
          />
          <span className="text-rif-gris mt-1 block text-xs">
            10 dígitos si es de México. Si es de fuera, ponle el + y su lada.
          </span>
        </label>

        <label className="block">
          <span className="text-espresso text-sm font-semibold">
            Qué te pidió
          </span>
          <textarea
            name="quiere"
            rows={3}
            className="border-rif-gris/40 mt-1 w-full rounded-md border px-3 py-3 text-base"
            placeholder="GMM para él y su esposa, 45 años…"
          />
        </label>

        <button
          type="submit"
          className="bg-rif-rojo w-full cursor-pointer rounded-md px-6 py-4 text-base font-bold text-white"
        >
          Guardar en Pipedrive
        </button>
      </form>

      <p className="text-rif-gris mt-6 text-xs">
        Si esa persona ya tiene un trato abierto, se le anota ahí en vez de
        duplicarla.
      </p>
    </main>
  );
}
