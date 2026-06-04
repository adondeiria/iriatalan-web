/**
 * Sanity Studio embedded en /studio
 * https://www.sanity.io/docs/embed-studio
 *
 * El Studio usa APIs de navegador (window, document) y no puede renderizarse en
 * el servidor. El SSR del shell producía React #419 (un Suspense boundary no
 * terminaba en el server y caía a client rendering, con flash en blanco).
 * Lo montamos con next/dynamic { ssr: false } para que cargue solo en el cliente.
 */
"use client";

import dynamic from "next/dynamic";

const Studio = dynamic(() => import("./Studio"), { ssr: false });

export default function StudioPage() {
  return <Studio />;
}
