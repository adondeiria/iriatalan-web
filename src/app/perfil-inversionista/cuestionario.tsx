"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import {
  PREGUNTAS,
  PERFILES,
  TOTAL_PREGUNTAS,
  calcularResultado,
  type Respuestas,
  type Resultado,
} from "@/lib/perfil-inversionista";
import {
  TEXTOS_PERFIL,
  fraseDimensiones,
  textoRecomendacion,
  type TextoRecomendacion,
} from "@/lib/perfil-textos";

/**
 * Cuestionario de perfil del inversionista — una pregunta por pantalla.
 *
 * Un solo motor para las dos puertas, que son dos rutas estáticas distintas:
 *
 *  - **Público** (`/perfil-inversionista`): lead magnet enlazado desde el blog.
 *    Ve su perfil gratis y al final elige entre mandárselo a Iria por WhatsApp
 *    o descargarlo en PDF. No se le pide monto.
 *  - **Sesión** (`/perfil-inversionista/sesion`): el enlace que Iria manda para
 *    llenarlo **con** el cliente durante el proceso de la póliza. Conserva el
 *    monto, muestra la estrategia guía interna, agrega el bloque "Para
 *    completar con tu asesora" y guarda el PDF para el expediente. Sustituye al
 *    "toma una captura y mándasela a tu asesora" de la versión anterior, que
 *    era justo el problema: la información no le llegaba.
 *
 * NO HAY SERVIDOR. Todo ocurre en el navegador de la persona: no se recolecta
 * ni se almacena nada. Decisión de Iria (21-ago): su CRM solo guarda clientes,
 * y un prospecto no tiene por qué dejar datos patrimoniales en una base. El
 * resultado llega por un WhatsApp que la persona decide mandar —con su teléfono
 * incluido, a respond.io, donde Iria ya trabaja— o se queda en su PDF. Eso
 * elimina de raíz el consentimiento expreso, el aviso revisado por abogado, la
 * política de retención y los catorce campos que iban a crearse en Zoho.
 */

type Fase = "portada" | "preguntas" | "resultado";

const CLAVE_BORRADOR = "rif_perfil_web";

/** Campos del bloque que Iria llena con el cliente en modo sesión. */
type BloqueAsesora = {
  edad: string;
  moneda: string;
  art93: string;
  metas: string;
  perfilAcordado: string;
  razonDiferencia: string;
  proximaRevision: string;
};

const BLOQUE_VACIO: BloqueAsesora = {
  edad: "",
  moneda: "",
  art93: "",
  metas: "",
  perfilAcordado: "",
  razonDiferencia: "",
  proximaRevision: "",
};

export function Cuestionario({ modoSesion }: { modoSesion: boolean }) {
  const [fase, setFase] = useState<Fase>("portada");
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [bloque, setBloque] = useState<BloqueAsesora>(BLOQUE_VACIO);

  // Borrador local: si alguien cierra la pestaña a la mitad no pierde el avance.
  // Solo el progreso del cuestionario — nunca datos de contacto.
  //
  // Mismo razonamiento que `CookieBanner`: sincroniza estado externo →
  // React al montar. El estado inicial tiene que ser el vacío para no romper
  // la hidratación (no hay `localStorage` en el render del servidor), así que
  // este setState único después del montaje es el patrón correcto, no un
  // anti-patrón.
  useEffect(() => {
    try {
      const crudo = localStorage.getItem(CLAVE_BORRADOR);
      if (!crudo) return;
      const d = JSON.parse(crudo) as {
        respuestas?: Respuestas;
        nombre?: string;
        monto?: string;
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (d.respuestas) setRespuestas(d.respuestas);
      if (d.nombre) setNombre(d.nombre);
      if (d.monto) setMonto(d.monto);
    } catch {
      // localStorage bloqueado (modo privado, cookies off): seguir sin borrador.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE_BORRADOR,
        JSON.stringify({ respuestas, nombre, monto }),
      );
    } catch {
      // idem
    }
  }, [respuestas, nombre, monto]);

  const pregunta = PREGUNTAS[indice];
  const completas = PREGUNTAS.every((q) => respuestas[q.n]);

  const resultado: Resultado | null = useMemo(() => {
    if (!completas) return null;
    try {
      return calcularResultado(respuestas);
    } catch {
      return null;
    }
  }, [completas, respuestas]);

  const elegir = useCallback(
    (n: number, puntos: number) => {
      setRespuestas((prev) => ({ ...prev, [n]: puntos }));
      // Avance automático: en móvil evita un toque extra por pregunta. El
      // retardo deja ver el estado seleccionado antes de cambiar de pantalla.
      window.setTimeout(() => {
        setIndice((i) => {
          if (i < TOTAL_PREGUNTAS - 1) return i + 1;
          setFase("resultado");
          return i;
        });
      }, 220);
    },
    [],
  );

  function reiniciar() {
    setRespuestas({});
    setBloque(BLOQUE_VACIO);
    setIndice(0);
    setFase("portada");
    try {
      localStorage.removeItem(CLAVE_BORRADOR);
    } catch {
      /* idem */
    }
  }

  if (fase === "portada") {
    return (
      <Portada
        modoSesion={modoSesion}
        nombre={nombre}
        setNombre={setNombre}
        monto={monto}
        setMonto={setMonto}
        hayAvance={Object.keys(respuestas).length > 0}
        onEmpezar={() => {
          // Retomar en la primera pregunta sin contestar.
          const pendiente = PREGUNTAS.findIndex((q) => !respuestas[q.n]);
          // Contra `quiz_complete`, este evento da la tasa de terminación —
          // sin formulario, es la única forma de saber cuántos se caen y dónde.
          trackEvent("quiz_start", {
            quiz: "perfil_inversionista",
            modo: modoSesion ? "sesion" : "publico",
            retomando: pendiente > 0,
          });
          setIndice(pendiente === -1 ? 0 : pendiente);
          setFase(pendiente === -1 ? "resultado" : "preguntas");
        }}
        onReiniciar={reiniciar}
      />
    );
  }

  if (fase === "resultado" && resultado) {
    return (
      <PantallaResultado
        resultado={resultado}
        respuestas={respuestas}
        modoSesion={modoSesion}
        nombre={nombre}
        monto={monto}
        bloque={bloque}
        setBloque={setBloque}
        onReiniciar={reiniciar}
      />
    );
  }

  return (
    <PantallaPregunta
      pregunta={pregunta}
      indice={indice}
      seleccion={respuestas[pregunta.n]}
      onElegir={elegir}
      onAtras={() => {
        if (indice === 0) setFase("portada");
        else setIndice(indice - 1);
      }}
      onSiguiente={
        respuestas[pregunta.n] && indice < TOTAL_PREGUNTAS - 1
          ? () => setIndice(indice + 1)
          : respuestas[pregunta.n] && completas
            ? () => setFase("resultado")
            : undefined
      }
    />
  );
}

/* ───────────────────────────── Portada ───────────────────────────── */

function Portada({
  modoSesion,
  nombre,
  setNombre,
  monto,
  setMonto,
  hayAvance,
  onEmpezar,
  onReiniciar,
}: {
  modoSesion: boolean;
  nombre: string;
  setNombre: (v: string) => void;
  monto: string;
  setMonto: (v: string) => void;
  hayAvance: boolean;
  onEmpezar: () => void;
  onReiniciar: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
      {modoSesion && (
        <p className="mb-6 inline-block rounded-full border border-champagne/50 bg-champagne/10 px-4 py-1.5 text-sm text-warm-brown dark:text-cream-light/80">
          Sesión con tu asesora
        </p>
      )}

      {/*
        El titular público nombra una contradicción, no la herramienta.
        Quien busca quince por ciento y a la vez no tolera ver el saldo en rojo
        se reconoce en la pregunta y necesita resolverla — y es exactamente la
        inconsistencia que el cuestionario detecta como primera señal de alerta,
        así que el gancho no es un adorno: es lo que el instrumento mide.

        El "15% o más" cae dentro de la opción más alta de la pregunta 10
        ("12% o más"), o sea que quien se reconoce en el titular marca esa
        casilla y el cuestionario le devuelve justo la contradicción que le
        prometió. Titular y instrumento dicen lo mismo.

        Dice "no aceptas" y no "no estás dispuesto" a propósito: el participio
        marca género masculino y este sitio le habla también a mujeres que
        planean solas — es uno de sus públicos declarados. La versión sin marca
        además es más corta, que en un titular siempre ayuda.

        La frase que se busca —"perfil de inversionista"— va en el subtítulo,
        que es donde carga el peso de posicionamiento sin costarle tensión al
        titular.

        En modo sesión no aplica: ahí Iria está sentada junto a un cliente que
        ya la contrató, y un gancho de venta sonaría fuera de lugar.
      */}
      {modoSesion ? (
        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] text-ink dark:text-cream-light">
          ¿Cuánto riesgo <em className="not-italic text-burgundy">puedes</em> y{" "}
          <em className="not-italic text-burgundy">quieres</em> tomar?
        </h1>
      ) : (
        <h1 className="font-serif text-4xl sm:text-5xl leading-[1.1] text-ink dark:text-cream-light">
          ¿Buscas un rendimiento anual del{" "}
          <em className="not-italic text-burgundy">15% o más</em>, pero no
          aceptas{" "}
          <em className="not-italic text-burgundy">perder ni un peso</em>?
        </h1>
      )}

      {/*
        El subtítulo NO contesta la pregunta del titular. Decir aquí "esas dos
        cosas no caben juntas" cerraba la puerta antes de que existiera
        confianza: la persona llega con una expectativa y lo primero que lee es
        que está equivocada. Esa conversación sí hay que tenerla, pero después
        de que ella misma contestó diez preguntas y la conclusión salió de sus
        respuestas — ahí es un descubrimiento propio y no un regaño ajeno.

        Lo que hace en su lugar es poner el cuestionario como el paso previo.
        Ese "Primero" es toda la mecánica: no niega la expectativa, la pospone,
        y convierte la herramienta en el requisito lógico para resolverla. La
        promesa que cierra —saber cuál es el mejor plan— es dirección, no
        veredicto.
      */}
      <p className="mt-5 text-lg leading-relaxed text-warm-brown dark:text-cream-light/80">
        {modoSesion ? (
          "Diez preguntas para saber qué tipo de inversionista eres antes de decidir dónde poner tu dinero."
        ) : (
          <>
            Primero descubre tu{" "}
            <strong className="font-medium text-ink dark:text-cream-light">
              perfil de inversionista
            </strong>{" "}
            y sabrás cuál es el mejor plan para ti.
          </>
        )}
      </p>

      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-y border-burgundy/15 py-4 text-sm">
        {[
          ["Preguntas", "10"],
          ["Tiempo", "3 min"],
          ["Resultado", "Al instante"],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-rif-gris">{k}</dt>
            <dd className="font-medium tabular-nums text-ink dark:text-cream-light">
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="perfil-nombre"
            className="block text-sm font-medium text-ink dark:text-cream-light"
          >
            Tu nombre{" "}
            <span className="font-normal text-rif-gris">— opcional</span>
          </label>
          <input
            id="perfil-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="given-name"
            className="mt-2 w-full rounded-xl border border-burgundy/25 bg-cream-light dark:bg-coffee/40 px-4 py-3 text-ink dark:text-cream-light outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:border-burgundy"
          />
        </div>

        {/* El monto solo existe en modo sesión: en público no se piden datos
            patrimoniales, y al quitar la conversión de caídas a pesos de la
            pregunta 8 el campo ya no tenía función ahí. */}
        {modoSesion && (
          <div>
            <label
              htmlFor="perfil-monto"
              className="block text-sm font-medium text-ink dark:text-cream-light"
            >
              Monto que piensa invertir{" "}
              <span className="font-normal text-rif-gris">— opcional</span>
            </label>
            <input
              id="perfil-monto"
              type="text"
              inputMode="numeric"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="$"
              className="mt-2 w-full rounded-xl border border-burgundy/25 bg-cream-light dark:bg-coffee/40 px-4 py-3 tabular-nums text-ink dark:text-cream-light outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:border-burgundy"
            />
          </div>
        )}
      </div>

      {/*
        La objeción real antes de empezar no es "¿me servirá?", es "¿me van a
        pedir mis datos?". Decir que no por adelantado —y no al final, cuando ya
        invirtió tres minutos— es lo que quita la fricción de arranque.
      */}
      <p className="mt-6 text-sm leading-relaxed text-rif-gris">
        No hay respuestas correctas: hay respuestas honestas.
        {!modoSesion && (
          <>
            {" "}
            <span className="text-warm-brown dark:text-cream-light/80">
              No pedimos registro ni guardamos lo que contestes.
            </span>
          </>
        )}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onEmpezar}
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-rif-rojo px-8 py-3.5 font-medium text-cream-light transition hover:bg-burgundy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
        >
          {hayAvance ? "Continuar" : "Empezar"}
        </button>
        {hayAvance && (
          <button
            type="button"
            onClick={onReiniciar}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-burgundy/30 px-6 py-3.5 font-medium text-burgundy dark:text-cream-light transition hover:bg-cream dark:hover:bg-coffee/40"
          >
            Empezar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Pregunta ─────────────────────────── */

function PantallaPregunta({
  pregunta,
  indice,
  seleccion,
  onElegir,
  onAtras,
  onSiguiente,
}: {
  pregunta: (typeof PREGUNTAS)[number];
  indice: number;
  seleccion: number | undefined;
  onElegir: (n: number, puntos: number) => void;
  onAtras: () => void;
  onSiguiente?: () => void;
}) {
  const progreso = ((indice + 1) / TOTAL_PREGUNTAS) * 100;

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onAtras}
          className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-warm-brown dark:text-cream-light/80 transition hover:bg-cream dark:hover:bg-coffee/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          aria-label="Regresar a la pregunta anterior"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm tabular-nums text-rif-gris">
          {/* La posición en pantalla, no `pregunta.n`: el campo `n` es la
              identidad estable de la pregunta y ya no coincide con el orden
              desde que la del rendimiento se movió al principio. */}
          Pregunta {indice + 1} de {TOTAL_PREGUNTAS}
        </span>
      </div>

      <div
        className="mt-4 h-1 w-full overflow-hidden rounded-full bg-burgundy/10"
        role="progressbar"
        aria-valuenow={indice + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL_PREGUNTAS}
        aria-label="Avance del cuestionario"
      >
        <div
          className="h-full rounded-full bg-burgundy transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <h2 className="mt-8 font-serif text-2xl sm:text-3xl leading-tight text-ink dark:text-cream-light">
        {pregunta.texto}
      </h2>
      {pregunta.nota && (
        <p className="mt-3 text-sm leading-relaxed text-rif-gris">
          {pregunta.nota}
        </p>
      )}

      <div
        role="radiogroup"
        aria-label={pregunta.texto}
        className="mt-7 space-y-3"
      >
        {pregunta.opciones.map((op) => {
          const activa = seleccion === op.puntos;
          return (
            <button
              key={op.texto}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => onElegir(pregunta.n, op.puntos)}
              className={[
                "flex w-full min-h-12 items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
                activa
                  ? "border-burgundy bg-burgundy/8 text-ink dark:text-cream-light"
                  : "border-burgundy/20 bg-cream-light dark:bg-coffee/30 text-warm-brown dark:text-cream-light/85 hover:border-burgundy/50",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                  activa ? "border-burgundy" : "border-burgundy/35",
                ].join(" ")}
                aria-hidden
              >
                {activa && (
                  <span className="size-2.5 rounded-full bg-burgundy" />
                )}
              </span>
              <span className="leading-snug">{op.texto}</span>
            </button>
          );
        })}
      </div>

      {onSiguiente && (
        <button
          type="button"
          onClick={onSiguiente}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full border border-burgundy/30 px-6 py-3 font-medium text-burgundy dark:text-cream-light transition hover:bg-cream dark:hover:bg-coffee/40"
        >
          Continuar
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────── Resultado ─────────────────────────── */

function PantallaResultado({
  resultado,
  respuestas,
  modoSesion,
  nombre,
  monto,
  bloque,
  setBloque,
  onReiniciar,
}: {
  resultado: Resultado;
  respuestas: Respuestas;
  modoSesion: boolean;
  nombre: string;
  monto: string;
  bloque: BloqueAsesora;
  setBloque: (b: BloqueAsesora) => void;
  onReiniciar: () => void;
}) {
  const { perfil, senales, nivel } = resultado;

  // El nivel 1 tiene su propia pantalla con tres variantes; del 2 al 5 comparten
  // estructura. `recomendacion` es null salvo en el nivel 1.
  // El bloque de recomendación no depende solo del nivel: con plazo de 2 a 5
  // años el perfil sale Moderado y aun así debe verlo. La decisión vive en
  // `textoRecomendacion`.
  const recomendacion = textoRecomendacion(resultado, respuestas);
  const texto = TEXTOS_PERFIL[nivel];

  // La señal que explica el techo ya está contada dentro de la pantalla de
  // Conservador, así que repetirla abajo sería decir lo mismo dos veces.
  const senalesVisibles = modoSesion
    ? senales
    : recomendacion
      ? []
      : senales.slice(0, 1);

  // Firma del resultado ya reportado. Sin esta guarda el evento se dispara dos
  // veces —React monta y remonta los efectos en desarrollo, y el arreglo de
  // `dimensionesMinimas` es una referencia nueva en cada cálculo—, lo que
  // duplicaría la tasa de terminación en GA4: el número que dice cuánta gente
  // llega al final contra cuánta escribe. Se reporta de nuevo solo si la
  // persona regresa, cambia una respuesta y le sale otro perfil.
  const reportado = useRef<string | null>(null);
  const corta = resultado.dimensionesMinimas.join(",");

  useEffect(() => {
    const firma = `${nivel}|${corta}|${recomendacion?.variante ?? ""}`;
    if (reportado.current === firma) return;
    reportado.current = firma;

    trackEvent("quiz_complete", {
      quiz: "perfil_inversionista",
      nivel,
      perfil: perfil.nombre,
      corta,
      variante_recomendacion: recomendacion?.variante,
      modo: modoSesion ? "sesion" : "publico",
    });
  }, [nivel, corta, perfil.nombre, recomendacion?.variante, modoSesion]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <p className="text-sm text-rif-gris">
        {nombre ? `${nombre}, tu resultado` : "Tu resultado"}
      </p>

      <h1 className="mt-2 font-serif text-4xl sm:text-5xl leading-[1.1] text-ink dark:text-cream-light">
        Perfil{" "}
        <span className="text-burgundy">{perfil.nombre.toLowerCase()}</span>
      </h1>

      <Escalera resultado={resultado} />

      {/* Nivel 1: la recomendación va de frente, que es lo que pidió Iria. */}
      {recomendacion && (
        <section className="mt-10 rounded-2xl border-l-2 border-burgundy bg-burgundy/6 p-6">
          <h2 className="font-serif text-2xl leading-tight text-ink dark:text-cream-light">
            {recomendacion.titulo}
          </h2>
          <p className="mt-4 leading-relaxed text-warm-brown dark:text-cream-light/85">
            {recomendacion.cuerpo}
          </p>
        </section>
      )}

      {(recomendacion || texto) && (
        <section className="mt-10 space-y-6">
          {!recomendacion && texto && (
            <div>
              <h2 className="font-serif text-xl text-ink dark:text-cream-light">
                Qué significa
              </h2>
              <p className="mt-2 leading-relaxed text-warm-brown dark:text-cream-light/80">
                {texto.significado}
              </p>
            </div>
          )}
          <div>
            <h2 className="font-serif text-xl text-ink dark:text-cream-light">
              El error típico de este perfil
            </h2>
            <p className="mt-2 leading-relaxed text-warm-brown dark:text-cream-light/80">
              {(recomendacion ?? texto).errorTipico}
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl text-ink dark:text-cream-light">
              Qué preguntarme
            </h2>
            <p className="mt-2 leading-relaxed text-warm-brown dark:text-cream-light/80">
              {(recomendacion ?? texto).quePreguntar}
            </p>
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-xl text-ink dark:text-cream-light">
          Cómo se calculó
        </h2>
        <p className="mt-3 leading-relaxed text-warm-brown dark:text-cream-light/80">
          Tu perfil sale de tres cosas medidas por separado: tu plazo, tu
          capacidad y tu tolerancia. El resultado final es el{" "}
          <strong className="font-medium text-ink dark:text-cream-light">
            menor de los tres
          </strong>
          . Tolerar mucho riesgo no sirve si tu situación no lo permite —te
          obligaría a vender en el peor momento— y poder tomarlo no sirve si no
          vas a dormir tranquilo. En tu caso, lo que definió el resultado fue{" "}
          <strong className="font-medium text-ink dark:text-cream-light">
            {fraseDimensiones(resultado.dimensionesMinimas)}
          </strong>
          .
        </p>
      </section>

      {senalesVisibles.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-xl text-ink dark:text-cream-light">
            {modoSesion ? "Señales para conversar" : "Una nota"}
          </h2>
          <div className="mt-3 space-y-3">
            {senalesVisibles.map((s) => (
              <div
                key={s.titulo}
                className="rounded-xl border-l-2 border-champagne bg-champagne/8 px-4 py-3"
              >
                <p className="font-medium text-ink dark:text-cream-light">
                  {s.titulo}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-warm-brown dark:text-cream-light/80">
                  {s.detalle}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* En modo sesión, la estrategia guía interna sí se muestra: Iria está
          presente y la necesita para armar la propuesta. En público nunca. */}
      {modoSesion && (
        <section className="mt-10 rounded-2xl border border-burgundy/20 bg-cream dark:bg-coffee/40 p-5">
          <h2 className="font-serif text-xl text-ink dark:text-cream-light">
            Referencia interna
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-rif-gris">Estrategia guía:</dt>
              <dd className="text-ink dark:text-cream-light">
                {perfil.estrategia}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-rif-gris">Horizonte natural:</dt>
              <dd className="text-ink dark:text-cream-light">
                {perfil.horizonte}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-rif-gris">Subtotales:</dt>
              <dd className="tabular-nums text-ink dark:text-cream-light">
                capacidad {resultado.subtotalCapacidad}/12 · tolerancia{" "}
                {resultado.subtotalTolerancia}/24
              </dd>
            </div>
            {monto && (
              <div className="flex gap-2">
                <dt className="text-rif-gris">Monto estimado:</dt>
                <dd className="tabular-nums text-ink dark:text-cream-light">
                  {monto}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {modoSesion && <BloqueDeAsesora bloque={bloque} setBloque={setBloque} />}

      <AccionesDelResultado
        resultado={resultado}
        modoSesion={modoSesion}
        nombre={nombre}
        recomendacion={recomendacion}
        onReiniciar={onReiniciar}
      />

      <Avisos />
    </div>
  );
}

/* ────────────────────── Acciones del resultado ────────────────────── */

/**
 * Construye el mensaje de WhatsApp que la persona manda a Iria.
 *
 * Es el sustituto del formulario y del Lead en el CRM: no se recolecta ni se
 * almacena nada. El resultado viaja dentro de un mensaje que la persona decide
 * enviar, y el teléfono llega solo porque WhatsApp lo trae. Cae en respond.io,
 * que es donde Iria ya trabaja.
 *
 * **Por qué el mensaje es el entregable y no un PDF adjunto:** un enlace
 * `wa.me` solo puede precargar texto — WhatsApp no acepta archivos por URL, y
 * adjuntar siempre sería un paso manual de la persona. Así que el texto carga
 * todo lo que Iria necesita para preparar la llamada: perfil, los tres niveles
 * con sus subtotales y las señales de alerta. De paso queda **buscable** en
 * respond.io, cosa que un PDF adjunto no estaría.
 *
 * Se manda hasta 2 señales: son las inconsistencias que abren la conversación,
 * pero la lista completa volvería ilegible un mensaje que la persona ve antes
 * de enviarlo.
 */
function mensajeWhatsApp(
  resultado: Resultado,
  nombre: string,
  recomendacion: TextoRecomendacion | null,
): string {
  const cierre =
    recomendacion?.variante === "plazo_corto"
      ? "Me gustaría que me propongas un fondo para este plazo."
      : recomendacion
        ? "Me gustaría ver las opciones garantizadas."
        : "Me gustaría platicarlo.";
  const l: string[] = [];
  l.push(
    nombre
      ? `Hola Iria, soy ${nombre}. Hice el cuestionario de perfil del inversionista.`
      : "Hola Iria, hice el cuestionario de perfil del inversionista.",
  );
  l.push("");
  l.push(
    `Mi resultado: perfil ${resultado.perfil.nombre.toLowerCase()} (nivel ${resultado.nivel} de 5)`,
  );
  l.push(
    `Plazo ${resultado.nivelPlazo} · ` +
      `Capacidad ${resultado.nivelCapacidad} (${resultado.subtotalCapacidad}/12) · ` +
      `Tolerancia ${resultado.nivelTolerancia} (${resultado.subtotalTolerancia}/24)`,
  );
  l.push(`Lo que define mi perfil: ${resultado.dimensionesMinimas.join(", ")}`);

  const senales = resultado.senales.slice(0, 2);
  if (senales.length > 0) {
    l.push("");
    l.push(senales.length === 1 ? "Nota del cuestionario:" : "Notas del cuestionario:");
    for (const s of senales) l.push(`— ${s.titulo}`);
  }

  l.push("");
  // El cierre iguala lo que prometió el botón: si le ofrecimos que le
  // propongan un fondo, el mensaje tiene que pedir eso y no un genérico
  // "me gustaría platicarlo" — si no, Iria recibe una petición distinta de la
  // que la persona creyó estar haciendo.
  l.push(cierre);
  return l.join("\n");
}

/**
 * Cierre del resultado. Sin formulario, sin casilla de consentimiento y sin
 * envío al servidor: los dos caminos salen del navegador de la persona.
 *
 * En la sesión con cliente solo va el PDF — Iria está presente y ese PDF es lo
 * que entra al expediente de la póliza, con el perfil acordado.
 */
function AccionesDelResultado({
  resultado,
  modoSesion,
  nombre,
  recomendacion,
  onReiniciar,
}: {
  resultado: Resultado;
  modoSesion: boolean;
  nombre: string;
  /** Cuando el perfil es recomendacion, su CTA sustituye al genérico. */
  recomendacion: TextoRecomendacion | null;
  onReiniciar: () => void;
}) {
  const urlWhatsApp = `https://wa.me/525526786325?text=${encodeURIComponent(
    mensajeWhatsApp(resultado, nombre, recomendacion),
  )}`;

  function guardarPdf() {
    trackEvent("file_download", {
      file_name: "perfil-inversionista",
      method: modoSesion ? "perfil_sesion" : "perfil_publico",
    });
    window.print();
  }

  return (
    <section className="mt-12 print:hidden">
      <h2 className="font-serif text-xl text-ink dark:text-cream-light">
        {modoSesion ? "Guardar para el expediente" : "¿Y ahora qué?"}
      </h2>
      <p className="mt-2 leading-relaxed text-warm-brown dark:text-cream-light/80">
        {modoSesion
          ? "Guarda el PDF con el perfil acordado. Es lo que queda documentado."
          : "Este perfil es el punto de partida de una conversación, no una recomendación de inversión. Mándamelo y lo revisamos juntos, o guárdalo para después."}
      </p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {!modoSesion && (
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("whatsapp_click", { method: "perfil_inversionista" })
            }
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-rif-rojo px-6 py-3.5 text-center font-medium text-cream-light transition hover:bg-burgundy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          >
            {recomendacion ? recomendacion.cta : "Mandárselo a Iria por WhatsApp"}
          </a>
        )}
        <button
          type="button"
          onClick={guardarPdf}
          className={[
            "inline-flex min-h-12 flex-1 items-center justify-center rounded-full px-6 py-3.5 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
            modoSesion
              ? "bg-rif-rojo text-cream-light hover:bg-burgundy-deep"
              : "border border-burgundy/30 text-burgundy dark:text-cream-light hover:bg-cream dark:hover:bg-coffee/40",
          ].join(" ")}
        >
          {modoSesion ? "Guardar PDF" : "Descargar mi resultado en PDF"}
        </button>
      </div>

      {!modoSesion && (
        <p className="mt-4 text-sm leading-relaxed text-rif-gris">
          No guardamos tus respuestas: el resultado vive solo en tu navegador
          hasta que tú decidas mandarlo.
        </p>
      )}

      <button
        type="button"
        onClick={onReiniciar}
        className="mt-6 inline-flex min-h-11 items-center rounded-full px-1 text-sm text-rif-gris underline underline-offset-4 transition hover:text-burgundy"
      >
        Empezar de nuevo
      </button>
    </section>
  );
}

/** Escalera de los 5 niveles con las tres marcas (plazo/capacidad/tolerancia). */
function Escalera({ resultado }: { resultado: Resultado }) {
  const { nivel, nivelPlazo, nivelCapacidad, nivelTolerancia } = resultado;

  return (
    <div className="mt-8 space-y-1.5">
      {PERFILES.map((p) => {
        const marcas: string[] = [];
        if (nivelPlazo === p.nivel) marcas.push("Plazo");
        if (nivelCapacidad === p.nivel) marcas.push("Capacidad");
        if (nivelTolerancia === p.nivel) marcas.push("Tolerancia");
        const esTuyo = p.nivel === nivel;

        return (
          <div
            key={p.nivel}
            className={[
              "flex items-center gap-3 rounded-xl border px-4 py-3 transition",
              esTuyo
                ? "border-burgundy bg-burgundy/8"
                : "border-burgundy/12 opacity-60",
            ].join(" ")}
          >
            <span
              className={[
                "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                esTuyo
                  ? "bg-burgundy text-cream-light"
                  : "bg-burgundy/10 text-warm-brown dark:text-cream-light/70",
              ].join(" ")}
            >
              {p.nivel}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={[
                  "block leading-tight",
                  esTuyo
                    ? "font-medium text-ink dark:text-cream-light"
                    : "text-warm-brown dark:text-cream-light/70",
                ].join(" ")}
              >
                {p.nombre}
              </span>
              <span className="block text-xs text-rif-gris">{p.horizonte}</span>
            </span>
            {marcas.length > 0 && (
              <span className="flex shrink-0 flex-wrap justify-end gap-1">
                {marcas.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-champagne/60 px-2 py-0.5 text-[11px] text-warm-brown dark:text-cream-light/80"
                  >
                    {m}
                  </span>
                ))}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Bloque que Iria llena con el cliente. Solo en modo sesión. */
function BloqueDeAsesora({
  bloque,
  setBloque,
}: {
  bloque: BloqueAsesora;
  setBloque: (b: BloqueAsesora) => void;
}) {
  function set<K extends keyof BloqueAsesora>(k: K, v: string) {
    setBloque({ ...bloque, [k]: v });
  }

  const campoBase =
    "mt-1.5 w-full rounded-xl border border-burgundy/25 bg-cream-light dark:bg-coffee/40 px-3.5 py-2.5 text-ink dark:text-cream-light outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:border-burgundy";
  const etiquetaBase =
    "block text-sm font-medium text-ink dark:text-cream-light";

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl text-ink dark:text-cream-light">
        Para completar con tu asesora
      </h2>
      <p className="mt-2 text-sm text-rif-gris">
        Lo que acordemos aquí es lo que queda documentado.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ba-edad" className={etiquetaBase}>
            Edad
          </label>
          <input
            id="ba-edad"
            type="text"
            inputMode="numeric"
            value={bloque.edad}
            onChange={(e) => set("edad", e.target.value)}
            className={`${campoBase} tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="ba-moneda" className={etiquetaBase}>
            Moneda
          </label>
          <input
            id="ba-moneda"
            type="text"
            value={bloque.moneda}
            onChange={(e) => set("moneda", e.target.value)}
            className={campoBase}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ba-art93" className={etiquetaBase}>
          ¿Planea dejar esta inversión al menos 5 años y retirarla después de los
          60?
        </label>
        <p className="mt-1 text-xs text-rif-gris">
          Si sí, Elite ofrece retiros exentos de ISR conforme al Art. 93.
        </p>
        <input
          id="ba-art93"
          type="text"
          value={bloque.art93}
          onChange={(e) => set("art93", e.target.value)}
          className={campoBase}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="ba-metas" className={etiquetaBase}>
          Metas con fecha
        </label>
        <p className="mt-1 text-xs text-rif-gris">
          Universidad, retiro, negocio, casa.
        </p>
        <textarea
          id="ba-metas"
          rows={3}
          value={bloque.metas}
          onChange={(e) => set("metas", e.target.value)}
          className={campoBase}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ba-acordado" className={etiquetaBase}>
            Perfil final acordado
          </label>
          <input
            id="ba-acordado"
            type="text"
            value={bloque.perfilAcordado}
            onChange={(e) => set("perfilAcordado", e.target.value)}
            className={campoBase}
          />
        </div>
        <div>
          <label htmlFor="ba-revision" className={etiquetaBase}>
            Fecha de próxima revisión
          </label>
          <input
            id="ba-revision"
            type="date"
            value={bloque.proximaRevision}
            onChange={(e) => set("proximaRevision", e.target.value)}
            className={campoBase}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ba-razon" className={etiquetaBase}>
          Si es distinto al calculado, ¿por qué?
        </label>
        <textarea
          id="ba-razon"
          rows={2}
          value={bloque.razonDiferencia}
          onChange={(e) => set("razonDiferencia", e.target.value)}
          className={campoBase}
        />
      </div>
    </section>
  );
}

function Avisos() {
  return (
    <footer className="mt-12 border-t border-burgundy/15 pt-6 space-y-3 text-xs leading-relaxed text-rif-gris">
      <p>
        Herramienta de asesoría de Iria Talan basada en los criterios de
        perfilamiento de Allianz México. Complementa, no sustituye, el
        cuestionario oficial que firmas con tu solicitud.
      </p>
      <p>
        Las Alternativas de Inversión no garantizan rendimientos ni capital; el
        valor puede subir o bajar. Rendimientos pasados no garantizan
        rendimientos futuros.
      </p>
      <p>
        Este perfil se revisa al menos una vez al año y ante cualquier cambio
        importante de tu situación (venta de negocio, herencia, cambio de
        ingreso).
      </p>
      <p className="pt-2">
        <Link
          href="/aviso-privacidad"
          className="underline underline-offset-2 hover:text-burgundy"
        >
          Aviso de privacidad
        </Link>
      </p>
    </footer>
  );
}
