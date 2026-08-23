import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PREGUNTAS, calcularResultado } from "./perfil-inversionista.ts";
import {
  TEXTOS_PERFIL,
  fraseDimensiones,
  textoRecomendacion,
} from "./perfil-textos.ts";

/**
 * La pantalla de Conservador es el segundo embudo de la asesoría: quien vende
 * fondos descarta a este perfil, y aquí se convierte en prospecto de planes
 * garantizados. Que salga la variante equivocada no rompe nada visiblemente —
 * simplemente se le ofrece el producto que no era.
 */

function respuestasCon(plazo: number, cap: number, tol: number) {
  const r: Record<number, number> = {};
  for (const q of PREGUNTAS) {
    r[q.n] = q.paso === "plazo" ? plazo : q.paso === "capacidad" ? cap : tol;
  }
  return r;
}

const variante = (r: Record<number, number>) =>
  textoRecomendacion(calcularResultado(r), r)?.variante ?? null;

describe("las tres formas de salir Conservador", () => {
  it("plazo corto → manda a deuda gubernamental, no a un plan de largo plazo", () => {
    // Corrección de Iria (22-ago): para horizontes cortos SÍ hay camino —
    // fondos de deuda gubernamental tipo CETES, dentro de un plan o por cuenta
    // propia. La versión anterior decía "no te conviene nada", que era falso.
    const r = respuestasCon(1, 4, 4);
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.equal(t.variante, "plazo_corto");
    assert.match(t.cuerpo, /deuda gubernamental/);
    assert.match(t.cuerpo, /CETES/);
    assert.match(t.cuerpo, /penalizan el rescate anticipado/);
    assert.equal(t.cta, "Quiero que me propongan un fondo");
  });

  it("la variante de plazo NO promete un plan garantizado", () => {
    // Ofrecer un garantizado a alguien que necesita el dinero pronto sería
    // venderle el producto equivocado: esos planes también castigan el rescate.
    const r = respuestasCon(1, 4, 4);
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.doesNotMatch(t.cuerpo, /capital garantizado/);
    assert.doesNotMatch(t.cta, /garantizad/i);
  });

  it("no acepta ninguna pérdida (P8=1) → recomienda garantizado de frente", () => {
    const r = respuestasCon(5, 4, 4);
    r[8] = 1;
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.equal(t.variante, "sin_perdida");
    assert.match(t.cuerpo, /capital garantizado o con rendimiento mínimo/);
    assert.equal(t.cta, "Quiero ver las opciones garantizadas");
  });

  it("situación o temperamento bajos → recomienda garantizado", () => {
    const r = respuestasCon(5, 1, 2);
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.equal(t.variante, "situacion");
    assert.match(t.cuerpo, /capital garantizado o con rendimiento mínimo/);
  });
});

describe("precedencia: el plazo manda sobre todo lo demás", () => {
  it("plazo corto Y sin tolerancia a pérdida → nombra las DOS", () => {
    // Caso real de Iria probando el cuestionario (23-ago): marcó plazo de 2
    // años, cero tolerancia a pérdida y expectativa de rendimiento alto. La
    // pantalla le contestaba solo el plazo y callaba lo que ella había marcado
    // con más fuerza.
    const r = respuestasCon(1, 4, 4);
    r[8] = 1;
    assert.equal(variante(r), "plazo_y_sin_perdida");
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.match(t.titulo, /plazo y tu tolerancia/);
    assert.match(t.cuerpo, /menos de cinco años/);
    assert.match(t.cuerpo, /no aceptas ver tu saldo abajo/);
    assert.match(t.cuerpo, /CETES/);
  });

  it("plazo corto SIN el techo de la P8 → solo la variante de plazo", () => {
    const r = respuestasCon(1, 4, 4);
    r[8] = 3;
    assert.equal(variante(r), "plazo_corto");
  });

  it("plazo largo con P8=1 → gana la variante de sin pérdida", () => {
    const r = respuestasCon(5, 4, 4);
    r[8] = 1;
    assert.equal(variante(r), "sin_perdida");
  });

  it("expectativa alta + cero tolerancia dispara la señal de contradicción", () => {
    // La condición original era `r[8] === 2` y dejaba pasar sin señal el caso
    // más extremo: querer 12%+ sin aceptar NADA de caída.
    const r = respuestasCon(1, 4, 4);
    r[8] = 1;
    r[10] = 4;
    const res = calcularResultado(r);
    const senal = res.senales.find((x) => x.titulo.includes("expectativa"));
    assert.ok(senal, "esperaba la señal de expectativa vs tolerancia");
    assert.match(senal.detalle, /no existe un instrumento/i);
  });

  it("plazo de 6 a 10 años ya no dispara la variante de plazo", () => {
    const r = respuestasCon(3, 4, 4);
    assert.equal(variante(r), null, "con plazo largo y todo alto no hay bloque");
  });
});

describe("plazo de 2 a 5 años: el perfil es MODERADO y aun así ve la recomendación", () => {
  it("el perfil calculado es Moderado, no Conservador", () => {
    const res = calcularResultado(respuestasCon(2, 4, 4));
    assert.equal(res.nivel, 2);
    assert.equal(res.perfil.nombre, "Moderado");
  });

  it("pero ve el bloque de deuda gubernamental", () => {
    // Este es el caso que se perdía cuando el bloque dependía del nivel: el
    // mínimo de los tres es 2, así que nunca entraba a la rama de Conservador.
    const r = respuestasCon(2, 4, 4);
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t, "un perfil Moderado con plazo corto SÍ debe traer bloque");
    assert.equal(t.variante, "plazo_corto");
    assert.match(t.cuerpo, /deuda gubernamental/);
  });

  it("el título no dice «conservador», porque el perfil no lo es", () => {
    const r = respuestasCon(2, 4, 4);
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.doesNotMatch(t.titulo, /conservador/i);
  });

  it("el cuerpo habla de menos de cinco años, no de dos", () => {
    const r = respuestasCon(2, 4, 4);
    const t = textoRecomendacion(calcularResultado(r), r);
    assert.ok(t);
    assert.match(t.cuerpo, /menos de cinco años/);
  });
});

describe("las variantes cubren todo perfil conservador posible", () => {
  it("ningún juego de respuestas de nivel 1 se queda sin texto", () => {
    let conservadores = 0;
    const vistas = new Set<string>();

    for (let plazo = 1; plazo <= 5; plazo++)
      for (let cap = 1; cap <= 4; cap++)
        for (let tol = 1; tol <= 4; tol++)
          for (let p8 = 1; p8 <= 4; p8++) {
            const r = respuestasCon(plazo, cap, tol);
            r[8] = p8;
            const res = calcularResultado(r);
            if (res.nivel !== 1) continue;
            conservadores++;
            const t = textoRecomendacion(res, r);
            assert.ok(t, "todo nivel 1 debe traer bloque de recomendación");
            assert.ok(t.titulo && t.cuerpo && t.errorTipico && t.quePreguntar);
            vistas.add(t.variante);
          }

    assert.ok(conservadores > 0);
    assert.deepEqual(
      [...vistas].sort(),
      ["plazo_corto", "plazo_y_sin_perdida", "sin_perdida", "situacion"],
      "las cuatro variantes deben ser alcanzables",
    );
  });
});

describe("textos de los niveles 2 a 5", () => {
  it("existen los cuatro y ninguno está vacío", () => {
    for (const nivel of [2, 3, 4, 5]) {
      const t = TEXTOS_PERFIL[nivel];
      assert.ok(t, `falta el texto del nivel ${nivel}`);
      assert.ok(t.significado.length > 40);
      assert.ok(t.errorTipico.length > 40);
      assert.ok(t.quePreguntar.length > 20);
    }
  });

  it("el nivel 1 NO está aquí: usa las variantes", () => {
    assert.equal(TEXTOS_PERFIL[1], undefined);
  });

  it("ningún texto público nombra aseguradoras ni estrategias internas", () => {
    // Regla del sitio: categoría de producto, nunca marcas. La estrategia guía
    // de Allianz solo aparece en el modo sesión.
    const prohibido = /allianz|gnp|axa|metlife|bupa|smnyl|elite|optimaxx/i;
    const todos = [
      ...Object.values(TEXTOS_PERFIL).flatMap((t) => [
        t.significado,
        t.errorTipico,
        t.quePreguntar,
      ]),
    ];
    for (const plazo of [1, 3, 5])
      for (const p8 of [1, 3]) {
        const r = respuestasCon(plazo, 1, 1);
        r[8] = p8;
        const res = calcularResultado(r);
        if (res.nivel !== 1) continue;
        const t = textoRecomendacion(res, r);
        if (!t) continue;
        todos.push(t.titulo, t.cuerpo, t.errorTipico, t.quePreguntar, t.cta);
      }
    for (const texto of todos) {
      assert.doesNotMatch(texto, prohibido, `texto con marca: "${texto}"`);
    }
  });

  it("ningún texto público da porcentajes de mezcla de activos", () => {
    // Decisión de Iria: etiqueta + interpretación, nunca una asignación.
    const mezcla = /\d+\s*%\s*(en\s+)?(deuda|renta variable|bonos|acciones)/i;
    for (const t of Object.values(TEXTOS_PERFIL)) {
      assert.doesNotMatch(t.significado, mezcla);
    }
  });
});

describe("fraseDimensiones", () => {
  it("una sola dimensión", () => {
    assert.equal(fraseDimensiones(["plazo"]), "tu plazo");
  });
  it("dos dimensiones se unen con «y»", () => {
    assert.equal(
      fraseDimensiones(["plazo", "tolerancia"]),
      "tu plazo y tu tolerancia",
    );
  });
  it("tres dimensiones llevan comas y una «y» final", () => {
    assert.equal(
      fraseDimensiones(["plazo", "capacidad", "tolerancia"]),
      "tu plazo, tu capacidad y tu tolerancia",
    );
  });
});
