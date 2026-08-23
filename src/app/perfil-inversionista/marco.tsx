import { Cuestionario } from "./cuestionario";

/**
 * Envoltura común de las dos puertas del cuestionario.
 *
 * `data-perfil-print` es el gancho de la hoja de impresión en `globals.css`:
 * deja que el "Guardar PDF" del modo sesión salga sin el resto del sitio.
 */
export function MarcoDelPerfil({ modoSesion }: { modoSesion: boolean }) {
  return (
    <main
      data-perfil-print
      className="bg-cream-light dark:bg-espresso min-h-screen"
    >
      <Cuestionario modoSesion={modoSesion} />
    </main>
  );
}
