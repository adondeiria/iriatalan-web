# Mapeo Aurora (María) → Pipedrive

> Cómo cada lead que María califica por WhatsApp aterriza en tu Pipedrive.
> Se implementa el martes vía Zapier (o API). **No contiene datos de clientes** —
> solo estructura.

---

## Tu pipeline actual — "Financial and insurance"

Etapas leídas de tus capturas (orden izq. → der.):

1. Calificado / Cliente Nueva propuesta
2. **Viole Contactado**  · (Viole = persona de tu equipo)
3. **Iria Contactado**
4. Propuesta Presentada
5. Seguimiento
6. Pospuesto
7. Fase Cierre
8. Solicitud / Proceso / Cambio Asesor
9. Emisión Vida
10. Emisión GMM

> **+ Etapa nueva a crear el martes: `WhatsApp – Nuevo`** al inicio del pipeline.
> Ahí caen TODOS los leads que María califica, para distinguir lo que viene del bot.

## Dónde actúa María (y dónde no)

- María **solo crea y deja** el lead en **`WhatsApp – Nuevo`**.
- De ahí, tú o Viole lo toman y lo mueven a su "Contactado" → el resto del pipeline
  (Propuesta, Seguimiento, Emisión) es trabajo humano. María no toca esas etapas.

## Multiagente (equipo de 5)

En Aurora se configuran los usuarios del equipo (Iria, Violeta, Eliseo, Ángeles,
Eunice — ver `08-equipo-y-ruteo.md`). El conmutador asigna por ramo/intención:
- Prospección → Iria/Violeta; al tomarlo, el lead pasa a "Iria Contactado" o
  "Viole Contactado".
- GMM → Ángeles · Autos → Eliseo · Vida/cobranza → Violeta.
- El dueño del trato en Pipedrive = quien lo atiende.

---

## Mapeo de campos: lo que María captura → Pipedrive

| Dato que recaba María | Campo en Pipedrive |
| --- | --- |
| Nombre | **Persona** → Nombre  ·  y dentro del título del Trato |
| Teléfono (WhatsApp) | **Persona** → Teléfono |
| Email (si lo da) | **Persona** → Email |
| Empresa (si aplica) | **Organización** → Nombre |
| Producto de interés | Prefijo del título del Trato (+ campo "Producto" opcional) |
| Resumen + respuestas de calificación | **Nota** del Trato |
| — | **Valor:** `0` / vacío (María no cotiza) |
| — | **Etapa:** `WhatsApp – Nuevo` |
| — | **Etiqueta / Fuente:** `WhatsApp – María` |
| — | **Pipeline:** Financial and insurance |
| — | **Dueño:** según ruteo (Iria o Viole) |

### Convención de título del Trato

`[PRODUCTO] – [NOMBRE CLIENTE]` — ej. `GMM – Juan Pérez`, `PPR – María López`.
Productos válidos (de tu taxonomía): GMM · PPR · Retiro · Ahorro / Seguro de Ahorro ·
Vida · SEGUBECAS · Dotal · Patrimonial · Persona Clave · Inversión.

---

## El Zap (a configurar el martes)

1. **Disparador (Aurora):** lead calificado / etiquetado "listo para CRM" (por
   embudo, etiqueta o webhook de Aurora).
2. **Acción 1 (Pipedrive):** buscar o crear **Persona** (nombre, teléfono, email).
3. **Acción 2 (Pipedrive):** crear **Trato** — título por convención, etapa
   `WhatsApp – Nuevo`, valor 0, etiqueta `WhatsApp – María`, organización si aplica,
   dueño según ruteo.
4. **Acción 3 (Pipedrive):** agregar **Nota** al Trato con el resumen de la charla.

> **Caso cliente existente:** si el teléfono ya existe como Persona/cliente, NO crear
> trato de prospección — mejor crear una **Actividad/Nota** y avisar a Iria (es
> postventa, no lead nuevo).

---

## Lookup de entrada (postventa) — que María "ya sepa quién es"

> ⚠️ **NO disponible en Aurora (confirmado por su técnico, may-2026):** las
> automatizaciones de Aurora solo **crean/cambian registros**; **la IA no puede leer
> otro CRM en vivo** para responder con esos datos. → **Fallback:** María **pregunta**
> la aseguradora/plan al cliente (como hace Iria hoy). El flujo de abajo solo aplicaría
> si se migra a una herramienta con function calling (ej. respond.io).

Para clientes actuales, Aurora consulta el CRM **al entrar el mensaje** y le pasa a
María el contexto, para que conteste sin preguntar (ej. hospital → portal del carrier
correcto). Datos confirmados: **Zoho CRM tiene a los clientes con su teléfono**, y la
**aseguradora + plan están como campo** en Zoho.

**Flujo:**
1. Entra mensaje de WhatsApp → Aurora busca el **teléfono** en **Zoho CRM** (módulo
   Contacts, match por Mobile/Phone).
2. **Si hay match** → trae Nombre + **Aseguradora** + **Plan** y los inyecta como
   contexto de María. Saluda por su nombre y responde según su póliza.
3. **Si NO hay match** → es prospecto nuevo → flujo de prospección (crea lead en
   Pipedrive, ver arriba).

**Requisitos / pendientes:**
- [ ] Aurora debe poder hacer **lookup en vivo** del CRM (function calling) — es la
      **pregunta #6 al vendedor** (no solo crear registros vía Zapier).
- [ ] Confirmar el **nombre exacto del campo** de aseguradora/plan en Zoho (ej.
      "Aseguradora", "Plan") — verlo en Zoho el martes.
- [ ] **Verificar identidad** antes de dar datos de póliza (un número se reasigna).

---

## Tareas Pipedrive para el martes

- [ ] Crear la etapa **`WhatsApp – Nuevo`** al inicio del pipeline.
- [ ] (Opcional) Crear campo personalizado **"Producto"** y/o **"Fuente"** para medir
      cuántos leads trae María.
- [ ] Dar de alta a **Viole** como usuario en Aurora (multiagente).
- [ ] Configurar el Zap con el mapeo de arriba.
- [ ] Probar: lead de prueba por WhatsApp → verificar que aparece en
      `WhatsApp – Nuevo` con nota y etiqueta correctas.
