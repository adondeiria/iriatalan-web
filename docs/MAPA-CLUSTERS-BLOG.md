# Mapa de clusters del blog — 29 jul 2026

Diagnóstico y plan editorial, hecho sobre el inventario real de Sanity y el
análisis de enlaces internos en el cuerpo de cada artículo (no de memoria).

---

## Qué hay hoy: 9 artículos publicados

| Tema | Artículos |
|---|---|
| patrimonial | 4 |
| gmm | 2 |
| retiro | 2 |
| educacionales | 1 |

## Cómo están enlazados (lo que define un cluster)

Hay que distinguir dos tipos de enlace, porque no pesan igual:

- **Automático al pie** (componente `RelatedPosts`): si el artículo no tiene
  `relatedArticles` manuales, cae a una consulta por mismo `topic`. **Esto ya
  funciona en todos.** Ningún artículo está totalmente aislado.
- **Contextual en el cuerpo**: enlace dentro del texto, en su contexto. Pesa
  mucho más para Google, y es el que la gente realmente hace clic. **Aquí está
  el hueco.**

Enlaces contextuales existentes:

```
como-dejar-dinero-hijo-autismo  <-->  proteger-hijo-con-discapacidad
st6-imss-pension-orfandad        -->  como-dejar-dinero-hijo-autismo
rentas-vitalicias-mexico         -->  st6-imss-pension-orfandad
```

Sin ningún enlace contextual a otro artículo:
`gmm-emergencia-extranjero`, `seguro-gastos-medicos-maternidad`,
`incremento-costos-universitarios-mexico`, `modalidad-40-imss-conviene`,
`testamento-no-protege-seguros-vida-cuentas`.

---

## Respuesta corta a la pregunta

**Sí conviene organizar por clusters, y ya tienes uno funcionando.** No hay que
inventarlo desde cero: hay que cerrar el que existe y tejer los que están a
medias.

---

## Cluster 1 — Discapacidad y neurodivergencia · EL MADURO

**Tiene:** `st6-imss-pension-orfandad`, `como-dejar-dinero-hijo-autismo`,
`proteger-hijo-con-discapacidad`. Los tres se enlazan entre sí en el cuerpo.

**Por qué es el primero en la fila:** es el único con autoridad temática real, y
la medición AEO del 27-jul lo confirmó — Perplexity llega solo a la tesis
("evitar dinero directo a nombre del hijo con discapacidad") **sin citar a
Iria**. Está a un empujón de que la cite.

**Le falta:**
1. Un **hub** propio. Hoy los tres apuntan a `/patrimonial`, que es página de
   servicio, no centro temático. Un hub de nicho (o robustecer
   `/personas/hijos-neurodivergentes` para que cumpla ese papel) es lo que
   concentra la señal.
2. Los artículos de las **preguntas medidas** en la línea base AEO:
   - estructuras de patrimonio pequeño / medio / alto
   - "¿qué pasa si no tengo quién administre?"
3. `st6` recibe un solo enlace entrante, y viene de `rentas-vitalicias`, que es
   tema distinto. Necesita entradas desde su propio cluster.

---

## Cluster 2 — GMM · EL DE ENTRADA

**Tiene:** `seguro-gastos-medicos-maternidad`, `gmm-emergencia-extranjero`.
Dos piezas fuertes, con dato de contrato verificado — pero **no se enlazan
entre sí en el cuerpo**.

**Por qué importa:** GMM es el producto por el que más gente llega. Y ambos
artículos comparten algo que ningún comparador tiene: leen condiciones
generales reales.

**Le falta:**
1. **Enlazar los dos que ya existen** (gratis, minutos).
2. Dos o tres más para cerrarlo. Los naturales, en orden de intención:
   - qué significan deducible, coaseguro y suma asegurada (ya existe como
     esqueleto vacío en el pipeline)
   - qué NO cubre un GMM y por qué te rechazan un siniestro
   - cómo elegir nivel de red hospitalaria (conecta con el hallazgo de que la
     red la define el plan, no la aseguradora)

---

## Cluster 3 — Retiro · EL DE MAYOR INTENCIÓN DE COMPRA

**Tiene:** `modalidad-40-imss-conviene`, `rentas-vitalicias-mexico`. Tampoco se
enlazan entre sí, y son complementarios de manual: uno es cómo aumentar la
pensión, el otro cómo garantizarla de por vida.

**Le falta:**
1. **Enlazarlos** (gratis).
2. Piezas para cerrarlo:
   - PPR vs AFORE vs ahorro por tu cuenta (esqueleto ya existe)
   - cuánto necesito para retirarme (ojo: usar interés compuesto + inflación,
     nunca resta simple)
   - semanas cotizadas: cómo revisarlas y qué hacer si te faltan

---

## Cluster 4 — Educacional · EL HUÉRFANO

**Tiene:** `incremento-costos-universitarios-mexico`. Uno solo.

Es buen artículo y de alta intención, pero solo no hace cluster. Necesita al
menos dos acompañantes (cómo empezar a ahorrar para la universidad, qué pasa
con el plan si yo falto) o se queda como pieza suelta.

---

## Suelto: `testamento-no-protege-seguros-vida-cuentas`

Está catalogado como patrimonial pero no pertenece al cluster de discapacidad.
Es la semilla natural de un **cluster de sucesión** (testamento, beneficiarios,
fideicomiso, juicio sucesorio). Decisión pendiente: abrirlo o dejarlo suelto.

---

## Orden recomendado

**Primero, lo gratis (sin escribir nada nuevo):**
tejer los enlaces contextuales que faltan entre artículos que ya existen —
GMM↔GMM, Retiro↔Retiro, y darle entradas a `st6` desde su cluster. Es trabajo
de minutos y sube la señal temática de inmediato.

**Después, cerrar discapacidad** — es donde hay autoridad incipiente medida, y
donde el retorno por artículo es mayor. La regla de la línea base AEO fue
explícita: no abrir frentes nuevos antes de cerrar este.

**Luego GMM**, que ya tiene dos piezas fuertes y es el producto de entrada.

**Después retiro**, que es el de mayor intención de compra.

**Educacional y sucesión al final**, cuando los tres anteriores estén cerrados.

---

## Nota de método

No perseguir "más artículos". Un cluster de tres piezas que se refuerzan pesa
más —para Google y para los motores de IA— que ocho artículos sobre ocho temas
distintos. La profundidad temática es la señal; el volumen no.
