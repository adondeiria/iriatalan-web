import type { SchemaTypeDefinition } from "sanity";

import { article } from "./article";
import { author } from "./author";
import { faq } from "./faq";
import { homePage } from "./homePage";
import { service } from "./service";

export const schemaTypes: SchemaTypeDefinition[] = [
  homePage,
  service,
  article,
  author,
  faq,
];
