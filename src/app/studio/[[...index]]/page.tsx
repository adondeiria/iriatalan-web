/**
 * Sanity Studio embedded en /studio
 * https://www.sanity.io/docs/embed-studio
 *
 * Studio usa React Context internamente — debe correr como Client Component.
 * El metadata/viewport se exporta desde un layout separado para evitar conflicto
 * con la directiva "use client".
 */
"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
