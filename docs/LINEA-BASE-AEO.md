# Línea base de citación por IA

> **Para qué sirve este archivo.** Es el "antes". Sin él, nada de lo que se haga
> en las Fases 4-5 se puede evaluar: subir tráfico no prueba que la IA te cite, y
> la sensación de "creo que ya salgo más" no es un dato. Se repite **mensual**,
> con las mismas queries y el mismo método, y se compara contra esta tabla.

## Método

- **Motor medido aquí:** Perplexity, sin sesión iniciada (respuestas no
  personalizadas — importante: con sesión, el historial contamina el resultado).
- **Qué se registra por query:** (1) si aparece `iriatalan.com.mx` entre las
  fuentes citadas, (2) si el texto nombra a "Iria Talan", (3) qué dominios sí
  aparecen.
- **Por qué esas dos columnas y no una:** son las dos mitades del objetivo.
  *Citada* = su URL aparece como fuente. *Recomendada* = el modelo dice su
  nombre. Se puede tener una sin la otra, y la segunda es la que trae clientes.

⚠️ **Repetir sin sesión iniciada y sin personalización.** Si se mide logueada,
la medición del mes que viene no será comparable con esta.

---

## Medición 1 — 2026-07-27 (Perplexity)

### Resultado global: **0 de 11** — cero menciones por nombre

Ni una sola cita. Ni una sola mención por nombre.

| # | Query | ¿Citada? | ¿La nombra? | Quién sí aparece |
|---|---|---|---|---|
| 1 | ¿qué seguro de GMM cubre mejor la maternidad en México? | ❌ | ❌ | angymarquez.com · donna.mx · gastosmedicos.mx |
| 2 | mejor seguro de gastos médicos mayores en México 2026 | ❌ | ❌ | segurointeligente.mx |
| 3 | cuánto cuesta un seguro de gastos médicos mayores en México | ❌ | ❌ | bbva.mx |
| 4 | qué es el deducible y el coaseguro en un seguro de gastos médicos | ❌ | ❌ | internationalstudentinsurance.com |
| 5 | seguro de vida temporal o permanente, cuál conviene (México) | ❌ | ❌ | segurosmexico.mx · miseguroaqui.com · seguratufuturo.com |
| 6 | cómo calcular la suma asegurada de mi seguro de vida (México) | ❌ | ❌ | zenpoliza.com |
| 7 | por qué subió tanto mi seguro de gastos médicos en la renovación | ❌ | ❌ | aseguratemexico.com |
| 8 | conviene la modalidad 40 del IMSS | ❌ | ❌ | youtube.com · segurosmexico.mx |
| 9 | cuánto cuesta una universidad privada en México y cuánto ahorrar | s/d | ❌ | *(lista de fuentes no capturada)* |
| 10 | qué es una renta vitalicia en México y conviene | s/d | ❌ | *(no capturada)* |
| 11 | ST-6 IMSS pensión de orfandad sin límite de edad, hijo con discapacidad | s/d | ❌ | IMSS (citado en el cuerpo) |

> **9-11 corridas a mano el 2026-07-27.** El `s/d` es **una limitación del método,
> no un dato que falte**: se copió la respuesta completa tal como la da Perplexity,
> y al copiar el texto **el panel de fuentes no viaja con él**.
> La columna firme es **"¿la nombra?"** —la mitad "recomendada", la que trae
> clientes— y en las tres es **no**.
>
> 📌 **Corrección de método para agosto:** el panel de fuentes se captura
> **aparte** (captura de pantalla, o los dominios anotados a mano).
> Seleccionar y copiar la respuesta no basta, y creer que sí fue el error de esta
> primera vuelta.

### Lo que dice este resultado

**La query #1 es la más dura de todas.** Es *exactamente* el tema del artículo
publicado el 25-jul (comparativa de maternidad de 5 aseguradoras, con tabla y
fuentes), y aun así Perplexity cita a otros tres. No es que el artículo sea
peor: es que **todavía no existe para el modelo**. Un artículo de dos días no ha
sido rastreado ni ganado señales de terceros. Esto es la confirmación de que
publicar no basta, que es justo la premisa de la Fase 5.

**La #8 es la otra cara.** "Modalidad 40" es su artículo más viejo (mayo) y
tampoco aparece — y ahí sí sale **youtube.com**, que refuerza por qué enlazar el
canal con el sitio era la jugada correcta.

**Los competidores son los previstos**, los mismos que identificó el plan:
comparadores (segurointeligente, gastosmedicos.mx, donna.mx) y un banco (BBVA).
Ninguno lee condiciones generales. `internationalstudentinsurance.com` citado
para explicar deducible y coaseguro *en México* es, directamente, una mala
respuesta — y es el hueco más barato de disputar con el glosario.

### Lo que se aprendió leyendo las respuestas, no solo contando ceros

Contar citas dice *si* la citan. Leer las respuestas dice **dónde se puede
ganar**, que es lo accionable:

- **Universidades (#9) — el hueco más grande.** Perplexity contesta con rangos
  vagos ("$20,000–$40,000 por semestre", "$140,000–$190,000") y **no da una sola
  cifra atribuida a una institución**, aunque nombra Tec, Ibero, Anáhuac e ITAM.
  El artículo de Iria tiene **costos por institución con 7 fuentes verificadas**,
  varias por consulta telefónica directa. Es justo el dato primario que una
  respuesta genérica no puede igualar. **Máxima prioridad.**
- **ST-6 (#11) — el hueco más pequeño.** Aquí el modelo ya responde bien:
  explica el dictamen, las 150 semanas cotizadas y el trámite en la UMF, apoyado
  en el IMSS. Contra la fuente oficial no se compite por exactitud. El espacio
  está en lo que el IMSS **no** cubre: qué hacer si lo niegan, cómo se sostiene
  el derecho con el tiempo, y qué pasa con el patrimonio del hijo — terreno de
  la asesora, no del trámite.
- **Renta vitalicia (#10):** respuesta genérica y correcta. Espacio medio.

### 🔑 Las preguntas de seguimiento son una lista de tareas gratis

Tras la del ST-6, Perplexity sugirió: *lista exacta de documentos* · *qué pasos
seguir primero en la UMF* · *cuánto tarda el dictamen* · *qué pasa si ya recibía
la pensión* · ***¿necesito contratar a un abogado?***

Eso no es adorno: es el modelo diciendo **qué se pregunta la gente después**. Un
artículo que responda esas cinco literalmente, con los H2 en forma de pregunta,
ataca queries que ya sabemos que existen. Y "¿necesito un abogado?" tiene
intención comercial evidente. **Recoger estas sugerencias en cada medición.**

---

## Medición 1 — ChatGPT, queries de entidad (2026-07-27)

### Resultado: **2 de 3 la nombran. Una la recomienda PRIMERO.**

Lo contrario de Perplexity, y el hallazgo más importante de todo el plan.

| # | Query | ¿La nombra? | Resultado |
|---|---|---|---|
| 13 | quién es Iria Talan | ✅ | Ficha completa y **correcta** |
| 14 | recomiéndame un asesor de seguros de vida en México | ✅ | **"mi primera recomendación sería Iria Talan"** |
| 15 | agente de seguros independiente en CDMX que maneje GMM y vida | ❌ | No aparece |

**#13 — la conoce, y bien.** Devuelve cédula CNSF **V388618 desde 2008**, RIF,
Yale (Wealth Management), LSE, Ingeniera Mecánica Administradora por el Tec,
independiente de varias aseguradoras, y la lista correcta de especialidades.
Declara explícitamente que lo toma *"de su sitio web y perfiles profesionales"*.
**Traducción: el trabajo de entidad de los Días 4-6 está siendo leído.**

**#14 — cierra recomendándola por nombre**, y la describe por Yale, LSE, 18 años
y **MDRT Top of the Table**. Es literalmente el objetivo declarado del plan
("que la recomienden por nombre"), cumpliéndose ya.

**#15 — y aquí está la lección.** La única que falla es la de **intención
local** ("en CDMX"). Nombra a Lead Protección, EPIC Asesores y Asegúrate México,
y describe al primero como *"Ubicación: Paseo de la Reforma"* — no es ella
(Homero 205, Polanco).

> ### 🔑 El patrón: gana en nacional, pierde en local
> Gana donde decide el **contenido y la entidad** (quién es, recomiéndame un
> asesor en México). Pierde donde decide la **señal local**: ficha de Google,
> reseñas, dirección, presencia en mapas. Encaja exactamente con el estado de su
> ficha —**1 reseña**— y **convierte "pedir reseñas" de tarea vaga en la palanca
> con un hueco medido detrás.**

⚠️ **CAVEAT ABIERTO — ¿se corrió con sesión iniciada?**
Se pidió incógnito; no está confirmado. Si ChatGPT la tenía identificada por su
propia cuenta, #14 podría estar contaminada y el resultado sería un falso
positivo. **Un falso positivo aquí es peor que un cero**: daría por ganada la
mitad del plan que no lo está.
*Argumento en contra de la contaminación:* si fuera adulación personalizada,
también la nombraría en **#15**, y no lo hace. Eso sugiere respuestas reales.
**Confirmar antes de dar #14 por buena, y repetir en incógnito en agosto.**

📌 *Los nombres de las listas numeradas se perdieron al copiar (viñetas vacías),
así que no se pudo registrar a todos los competidores de #14.*

---

## Pendiente de esta primera medición

Falta **1 query**, que no se pudieron correr por vía automatizada (Perplexity
tira la sesión del agente). Se corren a mano y se anotan aquí:

**Perplexity:**

12. cómo dejar dinero a un hijo con discapacidad en México

*(Las 3 de ChatGPT ya se corrieron — ver arriba.)*

---

## Histórico

| Fecha | Motor | Citada | Nombrada | Notas |
|---|---|---|---|---|
| 2026-07-27 | Perplexity | 0/8 (+3 s/d) | **0 de 11** | Primera medición. Maternidad publicado 2 días antes. |
| 2026-07-27 | ChatGPT (entidad) | — | **2 de 3** | Una la recomienda primero. Falla solo la de intención local. Sesión sin confirmar. |
