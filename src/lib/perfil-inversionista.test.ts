import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  PREGUNTAS,
  TOTAL_PREGUNTAS,
  calcularResultado,
  nivelCapacidad,
  nivelTolerancia,
  parseRespuestas,
  sumarPaso,
  type Respuestas,
} from "./perfil-inversionista.ts";

/**
 * El cuestionario es la parte del sitio donde un error no se ve: un perfil mal
 * calculado se entrega con la misma confianza que uno bien calculado. Por eso
 * el barrido exhaustivo vive aquí como prueba permanente y no como script de
 * una sola vez — si alguien toca una escala, el barrido lo atrapa.
 */

/** Construye un juego de respuestas con un valor fijo por dimensión. */
function respuestasCon(
  plazo: number,
  capacidad: number,
  tolerancia: number,
): Respuestas {
  const r: Respuestas = {};
  for (const q of PREGUNTAS) {
    r[q.n] =
      q.paso === "plazo" ? plazo : q.paso === "capacidad" ? capacidad : tolerancia;
  }
  return r;
}

describe("estructura del cuestionario", () => {
  it("la pregunta 1 fusionó los dos plazos cortos en «menos de 5 años»", () => {
    // Fusión pedida por Iria (22-ago). Los puntos saltan del 1 al 3: en esta
    // pregunta el valor ES el nivel, y renumerar habría bajado el techo.
    const p1 = PREGUNTAS.find((q) => q.n === 1);
    assert.ok(p1);
    assert.equal(p1.opciones.length, 4);
    assert.equal(p1.opciones[0].texto, "En menos de 5 años");
    assert.deepEqual(
      p1.opciones.map((o) => o.puntos),
      [1, 3, 4, 5],
    );
    // El techo del cuestionario sigue siendo 5: sin esto, "Muy dinámico" se
    // vuelve inalcanzable para todos.
    assert.equal(Math.max(...p1.opciones.map((o) => o.puntos)), 5);
  });

  it("tiene las 10 preguntas, con `n` único e independiente del orden", () => {
    // El orden del arreglo es el orden de presentación y NO tiene que coincidir
    // con `n`: la pregunta del rendimiento (n=10) se muestra primero. Lo que sí
    // debe cumplirse es que estén las diez y que ningún `n` se repita, porque
    // `n` es la llave del mapa de respuestas.
    assert.equal(TOTAL_PREGUNTAS, 10);
    assert.deepEqual(
      PREGUNTAS.map((q) => q.n).sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );
  });

  it("la pregunta del rendimiento esperado se muestra primero", () => {
    // Decisión de Iria (23-ago): engancha con el titular de la página.
    assert.equal(PREGUNTAS[0].n, 10);
    assert.match(PREGUNTAS[0].texto, /rendimiento anual promedio/);
  });

  it("reparte las preguntas 1 / 3 / 6 entre plazo, capacidad y tolerancia", () => {
    const porPaso = (paso: string) =>
      PREGUNTAS.filter((q) => q.paso === paso).length;
    assert.equal(porPaso("plazo"), 1);
    assert.equal(porPaso("capacidad"), 3);
    assert.equal(porPaso("tolerancia"), 6);
  });

  it("la pregunta 8 va en porcentajes, sin conversión a pesos", () => {
    // Cambio pedido por Iria (21-ago-2026): la nota ya no dice "piénsalo en
    // pesos" y ninguna opción trae importes.
    const p8 = PREGUNTAS.find((q) => q.n === 8);
    assert.ok(p8);
    assert.ok(!/pesos/i.test(p8.nota ?? ""));
    for (const o of p8.opciones) assert.ok(!o.texto.includes("$"));
  });

  it("la pregunta 4 usa la redacción aprobada por Iria", () => {
    const p4 = PREGUNTAS.find((q) => q.n === 4);
    assert.ok(p4);
    assert.equal(
      p4.opciones[0].texto,
      "Se vería muy afectado: dependo de este dinero",
    );
  });
});

describe("escalas de nivel (fronteras del brief)", () => {
  it("capacidad: 3–4=1 · 5–6=2 · 7–8=3 · 9–10=4 · 11–12=5", () => {
    const esperado: Array<[number, number]> = [
      [3, 1],
      [4, 1],
      [5, 2],
      [6, 2],
      [7, 3],
      [8, 3],
      [9, 4],
      [10, 4],
      [11, 5],
      [12, 5],
    ];
    for (const [subtotal, nivel] of esperado) {
      assert.equal(nivelCapacidad(subtotal), nivel, `subtotal ${subtotal}`);
    }
  });

  it("tolerancia: 6–9=1 · 10–13=2 · 14–17=3 · 18–21=4 · 22–24=5", () => {
    const esperado: Array<[number, number]> = [
      [6, 1],
      [9, 1],
      [10, 2],
      [13, 2],
      [14, 3],
      [17, 3],
      [18, 4],
      [21, 4],
      [22, 5],
      [24, 5],
    ];
    for (const [subtotal, nivel] of esperado) {
      assert.equal(nivelTolerancia(subtotal), nivel, `subtotal ${subtotal}`);
    }
  });
});

describe("sumarPaso distingue incompleto de mínimo", () => {
  it("devuelve null si falta una respuesta del paso", () => {
    const r: Respuestas = { 2: 1, 3: 1 }; // falta la 4
    assert.equal(sumarPaso(r, "capacidad"), null);
  });

  it("devuelve la suma cuando el paso está completo", () => {
    const r: Respuestas = { 2: 1, 3: 1, 4: 1 };
    assert.equal(sumarPaso(r, "capacidad"), 3);
  });
});

describe("la regla: el perfil es el MENOR de los tres niveles", () => {
  it("criterio de aceptación 5a — plazo 1 con todo al máximo da Conservador", () => {
    const r = respuestasCon(1, 4, 4);
    const res = calcularResultado(r);
    assert.equal(res.nivel, 1);
    assert.equal(res.perfil.nombre, "Conservador");
    assert.equal(res.nivelCapacidad, 5);
    assert.equal(res.nivelTolerancia, 5);
    // Lo que corta es el plazo: la pantalla de Conservador ramifica con esto.
    assert.deepEqual(res.dimensionesMinimas, ["plazo"]);
  });

  it("criterio de aceptación 5b — todo al máximo da Muy dinámico", () => {
    const res = calcularResultado(respuestasCon(5, 4, 4));
    assert.equal(res.nivel, 5);
    assert.equal(res.perfil.nombre, "Muy dinámico");
  });

  it("todo al mínimo da Conservador con las tres dimensiones en el piso", () => {
    const res = calcularResultado(respuestasCon(1, 1, 1));
    assert.equal(res.nivel, 1);
    assert.deepEqual(res.dimensionesMinimas, [
      "plazo",
      "capacidad",
      "tolerancia",
    ]);
  });

  it("plazo largo pero tolerancia baja: corta la tolerancia, no el plazo", () => {
    // Este es el caso que manda a la variante "planes garantizados".
    const res = calcularResultado(respuestasCon(5, 4, 1));
    assert.equal(res.nivel, 1);
    assert.ok(!res.dimensionesMinimas.includes("plazo"));
    assert.ok(res.dimensionesMinimas.includes("tolerancia"));
  });

  it("lanza si el cuestionario está incompleto", () => {
    assert.throws(() => calcularResultado({ 1: 3 }), /incompleto/i);
  });
});

describe("techo duro: quien no acepta ninguna pérdida es conservador", () => {
  it("P8=1 fuerza Conservador aunque todo lo demás esté al máximo", () => {
    // Sin la regla, la tolerancia sumaría 1+4+4+4+4+4 = 21 → nivel 4, y con
    // plazo y capacidad al máximo el perfil habría salido Dinámico.
    const r = respuestasCon(5, 4, 4);
    r[8] = 1;
    const res = calcularResultado(r);
    assert.equal(res.subtotalTolerancia, 21, "el subtotal crudo sigue siendo 21");
    assert.equal(res.nivelTolerancia, 1, "pero el nivel se topa en 1");
    assert.equal(res.nivel, 1);
    assert.equal(res.perfil.nombre, "Conservador");
  });

  it("el resultado explica que fue la tolerancia, no el plazo", () => {
    const r = respuestasCon(5, 4, 4);
    r[8] = 1;
    const res = calcularResultado(r);
    assert.deepEqual(res.dimensionesMinimas, ["tolerancia"]);
    assert.ok(
      res.senales.some((s) => s.titulo.includes("No estás dispuesto")),
      "esperaba la señal que explica el techo",
    );
  });

  it("la señal del techo va primero (en público solo se muestra una)", () => {
    const r = respuestasCon(5, 4, 4);
    r[8] = 1;
    r[10] = 4;
    const res = calcularResultado(r);
    assert.match(res.senales[0].titulo, /No estás dispuesto/);
  });

  it("la P9 es la segunda puerta del mismo techo", () => {
    // Opción añadida por Iria (23-ago). Dice lo mismo que la "Ninguna" de la
    // P8, así que tiene que topar igual — si no, se podría declarar cero
    // tolerancia aquí y salir Dinámico por la otra puerta.
    const r = respuestasCon(5, 4, 4);
    r[9] = 0;
    const res = calcularResultado(r);
    assert.equal(res.nivelTolerancia, 1);
    assert.equal(res.perfil.nombre, "Conservador");
    assert.ok(res.senales.some((s) => s.titulo.includes("No estás dispuesto")));
  });

  it("elegir la opción que vale 0 cuenta como respuesta contestada", () => {
    // `!0` es true: con una comprobación de falsy, el cuestionario creería que
    // esta pregunta sigue en blanco y nunca llegaría al resultado.
    const r = respuestasCon(5, 4, 4);
    r[9] = 0;
    assert.equal(sumarPaso(r, "tolerancia"), 4 + 4 + 4 + 4 + 0 + 4);
    assert.doesNotThrow(() => calcularResultado(r));
  });

  it("P8=2 (hasta −5%) NO dispara el techo", () => {
    const r = respuestasCon(5, 4, 4);
    r[8] = 2;
    r[9] = 4;
    const res = calcularResultado(r);
    assert.ok(res.nivelTolerancia > 1, "solo las opciones de cero pérdida topan");
  });

  it("recomienda garantizado en el texto de la señal", () => {
    const r = respuestasCon(3, 3, 3);
    r[8] = 1;
    const res = calcularResultado(r);
    const senal = res.senales.find((s) => s.titulo.includes("No estás dispuesto"));
    assert.ok(senal);
    assert.match(senal.detalle, /garantizado/);
  });
});

describe("señales de alerta", () => {
  it("detecta expectativa alta con tolerancia baja (R10=4 y R8=2)", () => {
    const r = respuestasCon(5, 4, 3);
    r[10] = 4;
    r[8] = 2;
    const res = calcularResultado(r);
    assert.ok(
      res.senales.some((s) => s.titulo.includes("expectativa")),
      "esperaba la señal de expectativa vs tolerancia",
    );
  });

  it("detecta que el plazo es el techo", () => {
    const res = calcularResultado(respuestasCon(1, 4, 4));
    assert.ok(res.senales.some((s) => s.titulo === "El plazo es el techo"));
  });

  it("respuestas consistentes no generan señales", () => {
    const res = calcularResultado(respuestasCon(3, 2, 2));
    assert.equal(res.senales.length, 0);
  });
});

describe("parseRespuestas — el servidor no confía en el navegador", () => {
  it("acepta un juego completo y válido", () => {
    const bruto = Object.fromEntries(
      PREGUNTAS.map((q) => [String(q.n), q.opciones[0].puntos]),
    );
    assert.notEqual(parseRespuestas(bruto), null);
  });

  it("rechaza un puntaje fuera de las opciones declaradas", () => {
    const bruto = Object.fromEntries(
      PREGUNTAS.map((q) => [String(q.n), q.opciones[0].puntos]),
    );
    bruto["8"] = 99; // payload manipulado desde la consola
    assert.equal(parseRespuestas(bruto), null);
  });

  it("rechaza un puntaje válido en otra pregunta pero inválido en ésta", () => {
    const bruto = Object.fromEntries(
      PREGUNTAS.map((q) => [String(q.n), q.opciones[0].puntos]),
    );
    bruto["8"] = 5; // 5 existe en la P1 (plazo), no en la P8
    assert.equal(parseRespuestas(bruto), null);
  });

  it("rechaza decimales y faltantes", () => {
    const completo = Object.fromEntries(
      PREGUNTAS.map((q) => [String(q.n), q.opciones[0].puntos]),
    );
    assert.equal(parseRespuestas({ ...completo, "3": 2.5 }), null);

    const incompleto = { ...completo };
    delete incompleto["10"];
    assert.equal(parseRespuestas(incompleto), null);
  });

  it("rechaza basura", () => {
    assert.equal(parseRespuestas(null), null);
    assert.equal(parseRespuestas("hola"), null);
    assert.equal(parseRespuestas({}), null);
  });
});

describe("barrido exhaustivo — los 5 niveles son alcanzables", () => {
  it("recorre todas las combinaciones sin dejar un nivel huérfano", () => {
    // Los valores salen de las opciones DECLARADAS de cada pregunta, no de un
    // 1..4 escrito a mano. Desde que la P9 tiene una opción que vale 0 y la P1
    // salta del 1 al 3, un barrido con rangos inventados estaría probando un
    // cuestionario que no existe.
    const valores = (n: number) =>
      PREGUNTAS.find((q) => q.n === n)!.opciones.map((o) => o.puntos);

    const finales = new Map<number, number>();
    const capacidades = new Set<number>();
    const tolerancias = new Set<number>();
    let total = 0;

    for (const p1 of valores(1))
      for (const p2 of valores(2))
        for (const p3 of valores(3))
          for (const p4 of valores(4)) {
            const nCap = nivelCapacidad(p2 + p3 + p4);
            capacidades.add(nCap);
            for (const p5 of valores(5))
              for (const p6 of valores(6))
                for (const p7 of valores(7))
                  for (const p8 of valores(8))
                    for (const p9 of valores(9))
                      for (const p10 of valores(10)) {
                        const r: Respuestas = {
                          1: p1, 2: p2, 3: p3, 4: p4, 5: p5,
                          6: p6, 7: p7, 8: p8, 9: p9, 10: p10,
                        };
                        const res = calcularResultado(r);
                        tolerancias.add(res.nivelTolerancia);
                        finales.set(
                          res.nivel,
                          (finales.get(res.nivel) ?? 0) + 1,
                        );
                        total++;
                      }
          }

    assert.equal(
      total,
      valores(1).length *
        valores(2).length * valores(3).length * valores(4).length *
        valores(5).length * valores(6).length * valores(7).length *
        valores(8).length * valores(9).length * valores(10).length,
    );
    for (const nivel of [1, 2, 3, 4, 5]) {
      assert.ok(
        (finales.get(nivel) ?? 0) > 0,
        `el perfil final ${nivel} es inalcanzable`,
      );
      assert.ok(capacidades.has(nivel), `nivel de capacidad ${nivel} inalcanzable`);
      assert.ok(tolerancias.has(nivel), `nivel de tolerancia ${nivel} inalcanzable`);
    }
  });
});
