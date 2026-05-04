import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { esESLocale } from "@sanity/locale-es-es";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  name: "iriatalan",
  title: "Iria Talan / RIF",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool(), visionTool(), esESLocale()],
  schema: { types: schemaTypes },
});
