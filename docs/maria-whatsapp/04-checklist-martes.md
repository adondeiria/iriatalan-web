# Checklist para el martes — configurar a María en Aurora Inbox

> Lo de "cerebro" (persona, flujo, FAQs) ya está listo en esta carpeta. Esto es lo
> que SÍ requiere tus manos y tu celular el martes. En orden.

---

## Antes de empezar — 6 preguntas para el vendedor de Aurora

Mándalas por WhatsApp (su número: 81 1481 0953) o en la llamada. Las respuestas
definen el riesgo y el costo real.

1. **Conexión:** *"¿Conectan mi WhatsApp por API oficial de Meta (Cloud API) o por
   sesión espejo/QR? Quiero la oficial — mi número es de negocio y no quiero riesgo
   de baneo."* ➜ Para María debe ser **Cloud API**.
2. **Costo total:** *"Además de la mensualidad de Aurora, ¿cuánto paga Meta por
   conversación a mi volumen? Dame el estimado mensual todo incluido."*
3. **Número:** *"Si registro mi número actual a la Cloud API, ¿pierdo la app normal
   de WhatsApp en ese número? ¿Me conviene un número nuevo dedicado?"*
4. **Datos / seguros:** *"¿Tienen ficha de seguridad y manejo de datos? Trabajo con
   datos sensibles de clientes (salud, financieros) y debo cumplir aviso de
   privacidad."*
5. **CRM de leads (Pipedrive) + Zoho:** *"Mis leads viven en **Pipedrive**. ¿Cómo
   conecto Aurora con Pipedrive — nativo, vía **Zapier** o por API? Quiero que cada
   lead calificado en WhatsApp cree un lead/deal en Pipedrive en su etapa. Aparte,
   ¿pueden abrir tickets en **Zoho Desk** y disparar plantillas/formularios de
   **Zoho Desk + Zoho Forms** (siniestros, reembolso, cirugía, maternidad)? ¿Tiempos
   y costo de cada integración (incluida la suscripción a Zapier si aplica)?"*
6. **Lookup en vivo (postventa):** *"Cuando un cliente me escribe, ¿el agente de IA
   puede consultar EN VIVO mi CRM por su teléfono y traer su aseguradora y plan para
   responder con ese dato (function calling), o solo crea/actualiza registros vía
   Zapier? Quiero que María ya sepa qué tiene contratado el cliente."*

---

## Respuestas del vendedor (1er contacto)

| # | Tema | Respuesta | Estado |
| --- | --- | --- | --- |
| 1 | Cloud API | Sí, oficial. Con Cloud API el número ya no se usa en la app móvil. | ✅ confirmado |
| 2 | Costo Meta | No tienen la tabla; lo cotiza un humano. | 🟡 pendiente |
| 3 | Número | Migrar el actual = pierdes la app. Recomiendan número dedicado. | ✅ → número dedicado |
| 4 | Datos/seguridad | Tienen aviso (aurorainbox.com/privacy-policy-2/); acceso controlado a BD. | ✅ ok (revisar policy) |
| 5 | Pipedrive + Zoho Desk + Zoho Forms | "Vía Zapier, pero la factibilidad exacta la valida el equipo técnico." | 🟡 **NO confirmado** |
| 6 | Lookup en vivo (function calling) | **NO.** Las automatizaciones solo crean/cambian registros; la IA no puede responder buscando info en otro CRM (Zoho). | ❌ **confirmado NO** |

> **Go/no-go:** los puntos 5 y 6 son los que hacen funcionar toda la arquitectura
> (leads→Pipedrive, tickets→Zoho Desk/Forms, María "ya sabe" la póliza). **No
> comprometer dinero ni número hasta validarlos en la llamada técnica.**

## Agenda para la llamada técnica (los 3 que deciden)

1. **Integraciones:** ¿Pipedrive (crear lead/deal), Zoho Desk (abrir ticket + disparar
   plantilla), Zoho Forms (disparar formulario) son factibles? ¿Nativo, Zapier o API?
   ¿Tiempo y costo de cada una? ¿Incluye suscripción a Zapier?
2. **Lookup en vivo (function calling):** ¿el agente IA consulta mi CRM por teléfono a
   mitad de conversación y usa aseguradora+plan en su respuesta, o solo crea/actualiza
   registros?
3. **Costo total real:** plan Aurora + Meta por conversación a mi volumen + Zapier +
   usuarios extra (somos 5). Estimado mensual todo incluido.

Extra: logística del número dedicado y tiempo de onboarding/verificación de Meta.

---

## Decisión clave: ¿qué número usa María?

- **Opción A — número nuevo dedicado** (recomendado para arrancar): conservas tu
  WhatsApp personal intacto y María vive en un número de negocio. Cero riesgo,
  cero interrupción.
- **Opción B — migrar tu número actual** a Cloud API: lo gestionas desde Aurora,
  ya no desde la app del cel. Más continuidad de marca, pero hay que migrar.

> Si dudas: empieza con **A** para el piloto, migras después si funciona.

---

## Pasos de configuración (el martes)

1. [ ] Crear cuenta y workspace en Aurora Inbox (prueba gratis).
2. [ ] Conectar el canal de **WhatsApp por Cloud API** (con el número que elegiste).
       Esto pide verificación de Meta Business — ten a mano tu Business Manager.
3. [ ] Crear el **Agente de IA** y pegar la persona del archivo
       `01-persona-maria.md` en el campo de personalidad/instrucciones.
4. [ ] Subir el **conocimiento (RAG):** el archivo `03-faqs-entrenamiento.md`
       + opcionalmente las URLs de tus landings (iriatalan.com.mx/gmm, /retiro, etc.).
5. [ ] Armar el **flujo del conmutador** según `02-flujo-conmutador.md`: menú de
       bienvenida, embudos (Nuevo lead / Cliente-servicio / Siniestro / Cita) y
       reglas de derivación.
6. [ ] Configurar **escalado a ti** (handoff): palabras clave + casos sensibles +
       horario de oficina.
7. [ ] Conectar **agenda** (para que María agende citas reales).
8. [ ] **Conectar Pipedrive** (tu CRM de leads) — vía Zapier o API: "lead calificado
       en Aurora → crea lead/deal en Pipedrive". Es la pieza que mantiene tu pipeline
       como fuente de verdad.
9. [ ] (Opcional) **Zoho Desk** para tickets de trámite/siniestro, y revisar el
       form de contacto del sitio (hoy ya va a Zoho).

---

## Pruebas antes de soltarla (10 min)

Escríbele a María desde otro teléfono y verifica:

- [ ] Saluda con su voz (cálida, seca, frases cortas) y se identifica como asistente.
- [ ] Responde bien 3-4 FAQs (una de GMM, una de retiro/PPR, una de vida).
- [ ] Si pides **precio exacto** → NO inventa, dice "estimado" o te escala.
- [ ] Si dices **"quiero contratar"** o **"reportar un siniestro"** → escala a ti.
- [ ] Si preguntas **"¿eres Iria?"** → aclara que es su asistente virtual.
- [ ] Fuera de horario → atiende, agenda y avisa seguimiento.

---

## Recordatorio YMYL

María contesta dudas **en tu voz**, pero **no cotiza, no promete, no asesora ni
firma** por ti. Todo lo que sea decisión financiera o cotización formal, te lo pasa.
Eso te protege a ti y a tu cédula.
