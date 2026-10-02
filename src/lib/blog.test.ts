import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatDateMx } from "./blog.ts";

describe("formatDateMx en hora de Ciudad de México", () => {
  it("un timestamp de la tarde CDMX no brinca al día siguiente", () => {
    // 23-ago 6:32 pm CDMX = 24-ago 00:32 UTC; Vercel renderiza en UTC.
    assert.equal(formatDateMx("2026-08-24T00:32:34.202Z"), "23 de agosto de 2026");
  });

  it("una fecha sin hora no retrocede un día", () => {
    assert.equal(formatDateMx("2026-08-23"), "23 de agosto de 2026");
  });

  it("vacío → cadena vacía", () => {
    assert.equal(formatDateMx(undefined), "");
  });
});
