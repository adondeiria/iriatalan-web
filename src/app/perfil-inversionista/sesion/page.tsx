import type { Metadata } from "next";

import { MarcoDelPerfil } from "../marco";

/**
 * Puerta de sesión de asesoría: el enlace que Iria manda para llenar el
 * cuestionario **con** el cliente durante el proceso de la póliza.
 *
 * Es una ruta propia y no un `?c=1` sobre la pública por dos razones:
 *  1. Leer el query param obligaba a volver dinámica la ruta pública (o a
 *     meterla en una frontera de suspensión que no resolvía), y la pública es
 *     justo la que tiene que ser estática porque llega de búsqueda y del blog.
 *  2. Esta versión NO debe indexarse —muestra la estrategia guía interna y el
 *     bloque de acuerdo con la asesora—, y eso solo se puede declarar cuando la
 *     página es su propia ruta.
 *
 * Conserva el campo de monto y guarda respuestas crudas: aquí valen como
 * auditoría del perfil acordado, y Iria está presente.
 */

export const metadata: Metadata = {
  title: "Perfil del inversionista — sesión con tu asesora",
  robots: { index: false, follow: false },
};

export default function PerfilInversionistaSesionPage() {
  return <MarcoDelPerfil modoSesion />;
}
