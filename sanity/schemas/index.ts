import type { SchemaTypeDefinition } from "sanity";

import { article } from "./article";
import { author } from "./author";
import { faq } from "./faq";
import { glossaryTerm } from "./glossaryTerm";
import { homePage } from "./homePage";
import { resource } from "./resource";
import { service } from "./service";

export const schemaTypes: SchemaTypeDefinition[] = [
  homePage,
  service,
  article,
  glossaryTerm,
  author,
  faq,
  resource,
];
