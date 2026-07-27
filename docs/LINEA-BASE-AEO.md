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

> Corrida **dos veces**: primero con la sesión de Iria, después sin cuenta. Se
> hizo porque el resultado logueado parecía demasiado bueno. **Hizo falta.**

### Resultado real (sin sesión): la nombran en 2 de 3, en 3er lugar

| # | Query | ¿La nombra? | Posición | Quién va delante |
|---|---|---|---|---|
| 13 | quién es Iria Talan | ✅ | — | ficha correcta, **enlaza su sitio** |
| 14 | recomiéndame un asesor de seguros de vida en México | ✅ | **3 de 4** | Vida y Pensiones Consultores · Grupo Protg · Asesores de Seguros |
| 15 | agente independiente en CDMX con GMM y vida | ❌ | — | Vivo Seguro · Damof · Bikun · Servire |

### ⚠️ Lo que la sesión falseaba

| | Con su cuenta | Sin cuenta (real) |
|---|---|---|
| #14 | *"mi primera recomendación sería Iria Talan"* | **3er lugar de 4** |
| #13 | cédula V388618, Yale, LSE, Tec, MDRT | solo "18 años de experiencia" y las áreas |

**Conclusión de método, para no repetir el error:** medir logueada no infla un
poco el resultado, **lo invierte** — convierte un tercer lugar en un primero, y
atribuye a ChatGPT credenciales que en realidad venían del historial de la
propia cuenta. *Siempre en incógnito.*

### Lo bueno, que es real

**ChatGPT la conoce sin necesidad de saber quién pregunta**, y en #13 **enlaza
su sitio** con `utm_source=chatgpt.com`: no habla de memoria, está leyendo
`iriatalan.com.mx` en vivo. Describe bien su práctica, incluido *"mexicanos en
el extranjero y extranjeros que residen en México"* — una página de nicho del
sitio. **El trabajo de entidad se está leyendo.**

### 🔑 Por qué los otros tres van delante — dicho por el propio modelo

No es ambiguo. ChatGPT justifica a los que la superan así:

> *"Buena reputación y un **número considerable de reseñas**"* · *"Excelentes
> **calificaciones de clientes**"*

Y de ella dice: *"trabaja con varias aseguradoras… trayectoria en el sector"* —
**ni una palabra de reseñas, porque tiene 1.**

Esto deja de ser una hipótesis del plan y pasa a ser una **causa medida**: el
modelo ordena por prueba social de terceros, y ahí es donde pierde. Es la
confirmación más fuerte que hay de que **pedir reseñas es la palanca número uno**.

### Dos huecos concretos que salieron de aquí

1. **Sus credenciales fuertes no llegan.** Sin sesión, ChatGPT no menciona
   cédula, Yale, Tec ni MDRT. Y en la misma respuesta **recomienda verificar que
   el asesor sea MDRT** — un criterio que ella cumple en su nivel más alto (Top
   of the Table) y que el modelo no le atribuye. La credencial existe, está en
   el sitio, y no está llegando.
2. **Enlaza `/contacto`, no `/sobre-iria`.** La página de entidad —la que
   concentra credenciales, FAQs y el `Person` del grafo— no es la que sale.
   Merece revisión: es la que se construyó justo para esto.

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
| 2026-07-27 | ChatGPT (entidad, incógnito) | — | **2 de 3, en 3er lugar** | Los que van delante son elegidos por reseñas, explícitamente. Falla la de intención local. |
