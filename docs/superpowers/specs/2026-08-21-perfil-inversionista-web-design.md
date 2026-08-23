# Cuestionario de perfil del inversionista en la web + artículo del blog — Diseño

**Fecha:** 2026-08-21 · **Estado:** aprobación pendiente de Iria
**Base:** `Brief_Cuestionario_Web_Zoho_TALAN.docx` (v1, agosto 2026) + HTML de referencia `perfil-movil.html`. Este documento NO repite el brief: lo adopta completo y especifica solo los **deltas** acordados en la sesión del 21-ago.

---

## 0 · Qué manda el brief (adoptado sin cambios)

- Página pública `/perfil-inversionista` en este repo Next.js; 10 preguntas una por pantalla, portadas a React desde `perfil-movil.html` **conservando la lógica tal cual** (regla del menor de tres niveles, escalas verificadas por barrido exhaustivo).
- Perfil visible **antes** de pedir datos; formulario nombre/correo/teléfono + casilla de consentimiento expreso (LFPDPPP, datos patrimoniales) → `POST /api/perfil`.
- Servidor **recalcula** el perfil desde las 10 respuestas; nunca confía en el resultado del cliente.
- Crea **Lead en Zoho CRM** con los 10 campos `Perfil_*`, los 4 `Consent_*`, `Lead_Source = "Cuestionario Perfil Web"` y resumen legible en `Description`.
- OAuth Self Client, alcance mínimo `ZohoCRM.modules.leads.CREATE`, refresh token solo en variables de entorno de Vercel. Ninguna credencial en el navegador — verificable con "ver código fuente".
- Anti-basura: honeypot (fuera de pantalla con CSS de posición, **no** `display:none` — lección del sitio), tiempo mínimo 20 s, rate limit por IP, validación de correo en servidor.
- Si Zoho falla: el visitante ve su perfil de todas formas, el envío se registra para reintento.
- Señales de alerta: se calculan y van a Zoho; al visitante público se le muestra **a lo más una**, en tono de invitación a conversar.
- Los 9 criterios de aceptación del brief aplican íntegros.

## 1 · Delta A — Todo llega al correo de Iria (la petición central)

Hoy la versión privada termina en "toma captura y mándamela": la información **no le llega** a Iria. Se resuelve sin infraestructura de correo nueva:

- **Regla de workflow en Zoho CRM** (módulo Leads): al crearse un Lead con `Lead_Source = "Cuestionario Perfil Web"` → correo a Iria con el contenido de `Description` (perfil, tres niveles, subtotales, monto, señales de alerta, datos de contacto).
- Un envío = un correo en la bandeja de Iria + el registro en el CRM. Aplica a **las dos puertas** (prospecto y cliente).
- La regla se crea en Zoho y se **verifica por API** (`getWorkflowRuleById`) — la UI de Zoho guarda en pantalla sin persistir.
- Prueba de humo antes de publicar: envío propio de Iria de punta a punta, verificando el Lead por API (`modified_time`) y la llegada del correo.

---

## ⚠ CAMBIO DE RUMBO (21-ago, decisión de Iria) — SIN SERVIDOR NI CRM

**Todo lo que este documento dice sobre Zoho CRM, campos `Perfil_*`/`Consent_*`,
OAuth, `/api/perfil`, casilla de consentimiento y regla de workflow QUEDA
CANCELADO.** Se conserva abajo como registro de lo que se evaluó y por qué se
descartó, no como plan vigente.

Razón de Iria, textual: *"en CRM solamente tenemos info de clientes"* y *"si el
lead no quiere ser cliente, desechamos sus datos, pero no debemos pedir datos
sensibles"*. Un prospecto no tiene por qué dejar datos patrimoniales en una base
de datos.

### Lo que se construyó en su lugar

**No hay servidor.** El cuestionario vive por completo en el navegador: no se
recolecta, no se transmite y no se almacena nada.

- **Puerta pública** (`/perfil-inversionista`): al terminar, dos botones del
  mismo peso — **"Mandárselo a Iria por WhatsApp"** (mensaje precargado con
  perfil, los tres niveles y una señal si la hay) y **"Descargar mi resultado en
  PDF"**. El WhatsApp cae en respond.io, donde Iria ya trabaja, y trae el
  teléfono porque lo trae el canal, no porque se haya pedido.
- **Puerta de sesión** (`/perfil-inversionista/sesion`): solo **"Guardar PDF"**.
  Iria está presente; ese PDF, con el bloque "Para completar con tu asesora" y
  el perfil acordado, es lo que entra al expediente de la póliza y lo que la
  protege si un cliente reclama después por la selección de fondos.

### Lo que esto elimina

| Antes | Ahora |
|---|---|
| 14 campos nuevos en Leads | ninguno |
| App Self Client + refresh token en Vercel | ninguna credencial |
| Casilla de consentimiento expreso | no aplica: no se recolecta |
| Aviso de privacidad revisado por abogado — **era el bloqueante** | no bloquea |
| Política de retención a 6 meses | no hay datos que retener |
| Regla de workflow para el correo | el WhatsApp es el aviso |
| Valor nuevo en `Lead_Source` (Leads y Contactos) | no aplica |

**Matiz honesto:** el aviso de privacidad no desaparece del todo. Si la persona
manda su resultado por WhatsApp, Iria sigue tratando datos personales — lo que
se cae es la *recolección automática*, que es la parte pesada. La obligación
restante es la misma que ya tiene con cualquiera que le escribe.

**Costo asumido, explícito:** sin formulario no hay registro de quien completa
el cuestionario y no manda el WhatsApp. Se cambia captura por privacidad, a
sabiendas. El evento GA4 `quiz_complete` mide cuántos terminan aunque no
contacten, así que la pérdida es medible.

---

## 2 · Delta B — Modo sesión de asesoría (`/perfil-inversionista/sesion`)

**Corrección de supuesto (21-ago):** no es un enlace que el cliente llena solo en su casa. El cuestionario se llena **durante el proceso de la póliza, con Iria presente** — es su capa de asesoría propia sobre el cuestionario oficial de Allianz, que el cliente firma aparte. El enlace `iriatalan.com.mx/perfil-inversionista/sesion` **solo lo distribuye Iria**, en cualquier dispositivo (su laptop, el celular del cliente, o compartiendo pantalla).

**Cambio de implementación (21-ago): ruta propia, no `?c=1`.** El plan decía query param; leerlo en el servidor volvía **dinámica** la ruta pública —la que llega de búsqueda y del blog, y que debe ser estática por el presupuesto de velocidad del sitio— y leerlo en cliente con `useSearchParams` dejaba la frontera de suspensión colgada sin resolver. Dos rutas estáticas lo resuelven y además habilitan algo que el query param impedía: **la puerta de sesión se declara `noindex, nofollow`**, que es lo correcto porque muestra la estrategia guía interna de Allianz y el bloque de acuerdo. Ambas rutas comparten `MarcoDelPerfil` y el mismo componente `Cuestionario` — sigue siendo un solo motor.

Diferencias en la ruta de sesión:
- Se conserva el **campo de monto** (dato para la propuesta → `Perfil_Monto_Estimado`).
- Al terminar las 10 preguntas aparece el **bloque "Para completar con tu asesora" completo**, portado de la versión escritorio: edad, moneda, pregunta del Art. 93 (retiros exentos de ISR si deja ≥5 años y retira después de los 60), metas con fecha, **perfil final acordado + razón si difiere del calculado**, fecha de próxima revisión.
- El formulario de envío pide solo **nombre + correo** del cliente (Iria ya tiene el resto).
- El Lead se marca **"Cliente actual"**, con **respuestas crudas + monto + bloque asesora** guardados (aquí sí: son la auditoría del perfil acordado, y es la información que protege a Iria).
- Pantalla final: "Listo — le llegó a Iria" + **botón "Guardar PDF"** (print stylesheet, formato limpio como la versión escritorio) para el expediente de la póliza + botón de WhatsApp sin restricción.

Esto sustituye el "toma una captura de esta pantalla y mándasela a tu asesora" de la versión actual — que es precisamente el problema que Iria pidió resolver: hoy **la información no le llega**.

**Decisión de higiene CRM, explícita:** el cliente ya existe como Contact, y aun así el envío entra como **Lead etiquetado**. Razón: mantener el token en alcance solo-CREATE (regla de seguridad del brief) vale más que la limpieza automática. Iria pasa la información al Contact a mano y borra el Lead — volumen esperado: pocos al mes. La alternativa (nota automática en el Contact) exigiría lectura+búsqueda de Contacts y queda **descartada para v1**.

### 2.1 Cambios al cuestionario (cerrados 21-ago)

1. **Pregunta 8 muestra solo porcentajes.** Se elimina la conversión de caídas a pesos — sobrescribe la nota del brief que decía "no debe eliminarse". En consecuencia el **campo de monto desaparece del modo público** (su única función ahí era esa conversión); en modo sesión se conserva.
2. **Pregunta 4, opción 1:** "Se descarrilaría: dependo de este dinero" → **"Se vería muy afectado: dependo de este dinero"**.

Puntajes y escalas intactos → no requiere re-verificar el barrido exhaustivo.

### 2.2 Privacidad reducida en modo público

Decisión de Iria: *"si el lead no quiere ser cliente, desechamos sus datos, pero no debemos pedir datos sensibles"*.

- **No se pide monto** en público (ver §2.1).
- **No se almacenan respuestas crudas** de un prospecto: `Perfil_Respuestas` y `Perfil_Monto_Estimado` quedan vacíos. Las 10 respuestas viajan solo para recalcular en servidor y derivar señales; después se descartan. En Zoho quedan niveles, perfil, señales y contacto.
- **Retención: 6 meses** para leads que no se convierten en clientes; el aviso de privacidad lo declara y alguien lo cumple (limpieza manual en v1).
- La casilla liga a **`/aviso-privacidad`, página que ya existe en el sitio** (mismo patrón que `/contacto` y los 4 lead magnets). Solo hay que verificar que cubra la finalidad "perfilamiento para asesoría de inversión"; la exposición bajó mucho al no recolectar monto ni respuestas crudas del público.

## 3 · Delta C — Pantalla de resultado Conservador = segundo embudo

Instrucción de Iria: al perfil Conservador, **recomendar de plano un plan garantizado o con rendimientos mínimos garantizados**. Se implementa con dos variantes, según **cuál dimensión fue el mínimo** (el dato ya existe en la lógica):

1. **Mínimo = tolerancia o capacidad** (plazo ≥ nivel 2): *"Un plan con fondos de inversión no es tu instrumento — y no es mala noticia: para tu perfil existen planes con capital garantizado o con rendimiento mínimo garantizado. Esa es otra conversación, y también la tengo."* → CTA a contacto.
2. **Mínimo = plazo** (menos de 2 años): *"Con este horizonte, ningún plan de inversión de largo plazo te conviene — y decírtelo también es asesoría."* → CTA suave a conversar sobre lo que sí aplica.

Reglas de redacción: categoría de producto, **sin nombres de aseguradoras ni de estrategias** en la pantalla pública (las estrategias guía Allianz viven en `Description` para Zoho y en la versión privada de cliente). Copys finales editables en Sanity (§6).

Racional de negocio: quien vende fondos descarta al conservador; aquí se convierte en prospecto de dotales/garantizados. Un cuestionario, dos segmentos.

## 4 · Delta D — WhatsApp después del envío (mejora al brief, no contradicción)

El brief quita el botón de WhatsApp **durante** el cuestionario público (correcto: protege la captura de datos). Este diseño lo reintroduce **solo en la pantalla de confirmación, después de enviar el formulario**: *"¿No quieres esperar? Escríbeme"* → `wa.me/525526786325` con mensaje precargado que incluye su perfil (p. ej. "Hola Iria, acabo de hacer el cuestionario — salí perfil Dinámico moderado y quiero platicar").

- A Iria le llega el correo de todas formas; esto solo conserva el impulso del prospecto caliente (histórico de la asesoría: 1-a-1 por WhatsApp convierte 17–23 %).
- Si Iria lo veta tras verlo en vivo, se quita con un cambio de una línea.

## 5 · Delta E — Capa de marketing, SEO y medición

### 5.1 Artículo del blog (cluster **retiro**)
- Tesis: *"El rendimiento que imaginas vs. el que aguantas"* — desarma la expectativa de rendimientos millonarios (ángulo elegido por Iria: "la gente da por hecho que se va a llevar rendimientos millonarios"), explica que salirse a destiempo es la única pérdida garantizada, y desemboca en el cuestionario.
- **3 CTAs** al cuestionario distribuidos según el patrón probado del sitio (tras la primera idea con gancho, tras la conclusión, al final).
- Schema `FAQPage`; metodología y supuestos declarados en el cuerpo (regla de propuestas blindadas: el lector lo pegará en su IA). Sin cifras sin fuente; toda proyección con supuestos explícitos.
- Publicado en el tema `retiro` (clave real del tema en Sanity, no el slug) → el bloque de relacionados lo conecta automáticamente con los 2 artículos de retiro existentes.
- Título/SEO objetivo (afinar con búsqueda real al escribirlo): "cuánto rinde un plan de inversión / de retiro", "rendimientos planes de inversión México".

### 5.2 SEO de la página del cuestionario
- `/perfil-inversionista` **indexable**: intro breve + bloque FAQ (schema `FAQPage`) debajo de la parte interactiva, apuntando a "test de perfil de inversionista", "qué tipo de inversionista soy", "cuestionario perfil de riesgo México".
- Alta en sitemap (`next-sitemap.config.ts`), meta description ≤160, sin doble marca en el título.
- URL agregada al arreglo `HERRAMIENTAS` de `/recursos` (primer slot que se llena con destino real).

### 5.3 Medición (GA4)
- `quiz_start` → paso por pregunta (una sola señal con parámetro de índice) → `quiz_complete` con el nivel → `generate_lead` (evento clave existente).
- Con esto se ve en qué pregunta abandona la gente y qué % de completados deja datos.

### 5.4 Distribución día 1
- Publicación en la ficha de Google Business (cuenta `iriatalanrif@gmail.com`).
- Enlace `/perfil-inversionista/sesion` listo para que Iria lo mande a clientes por WhatsApp.

## 6 · Contenido editable en Sanity

Documento único de configuración del cuestionario en Sanity con: textos de las pantallas de resultado (5 niveles + las 2 variantes de Conservador), FAQ de la página, e intro. **Las preguntas, opciones y puntajes NO van en Sanity en v1** — son la lógica verificada del brief y cambiarlas exige re-verificar las escalas; viven en código.

## 7 · Bandera registrada (no se resuelve en v1)

Los leads de `/contacto` y los 4 lead magnets caen hoy en **Pipedrive**; los del cuestionario caerán en **Zoho** (decisión del brief, campos ya especificados). Dos bandejas de prospectos web. Si estorba, el mismo patrón `Promise.allSettled` de `/api/contact` permite espejear después — fuera de alcance ahora.

## 8 · Criterios de aceptación adicionales (encima de los 9 del brief)

10. La regla de workflow de Zoho existe, está activa y se verificó por API; un envío de prueba produce el correo a Iria con el resumen completo.
11. Con `?c=1`: formulario reducido (nombre+correo), Lead marcado "Cliente actual", correo llega igual.
12. Perfil Conservador muestra la variante correcta según la dimensión mínima (probar: plazo 1 con todo al máximo → variante plazo; tolerancia baja con plazo alto → variante garantizados).
13. El botón de WhatsApp NO aparece en ninguna pantalla previa al envío del formulario público; SÍ aparece en la confirmación.
14. `quiz_complete` llega a GA4 con el nivel como parámetro.
15. El artículo publicado enlaza al cuestionario (3 CTAs) y aparece en los relacionados del cluster retiro.

## 9 · Pendientes de Iria antes de publicar (actualizado 21-ago)

1. ~~Aviso de privacidad con abogado~~ → **`/aviso-privacidad` ya existe en el sitio**. Solo revisar/agregar un párrafo con la finalidad "perfilamiento para asesoría de inversión" y el plazo de conservación de 6 meses. Validación legal a criterio de Iria: la exposición bajó al no recolectar monto ni respuestas crudas del público (§2.2).
2. ~~Crear los 14 campos a mano~~ → **los crea Claude por API** (`createFields`, org CRM prod 684464340) y los verifica con `getFields`. Iria solo aprueba la lista.
3. Regla de workflow del correo: la crea Claude y la verifica por API (`getWorkflowRuleById`) — la UI de Zoho guarda en pantalla sin persistir.
4. ~~Plazo de conservación~~ → **6 meses, confirmado**. Falta definir el seguimiento post-Lead (asignación, tarea, correo de bienvenida): *el cuestionario capta; el seguimiento convierte*.
5. Validar los textos de las pantallas de resultado — se entregan en Word (Fase 0 del plan) e incluyen las 2 variantes Conservador de §3, que posicionan producto.

## 10 · Orden de construcción propuesto

1. Portar cuestionario a React + página `/perfil-inversionista` con puerta `?c=1` (sin Zoho aún — resultado en pantalla).
2. `POST /api/perfil` + Zoho (campos creados por Iria antes) + workflow de correo + prueba de humo de punta a punta.
3. Pantallas Conservador (2 variantes) + WhatsApp post-envío + GA4.
4. SEO de la página (intro, FAQ, sitemap, `HERRAMIENTAS`).
5. Artículo del blog + CTAs + verificación de relacionados.

Cada fase se revisa contra este spec antes de pasar a la siguiente (método: Claude planea → ejecuta → revisa, con revisión independiente al cierre de la fase 2, que es la de mayor riesgo).
