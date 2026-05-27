# Flujo del "conmutador" de WhatsApp — diseño de triage y derivación

> Cómo se comporta un solo número de WhatsApp como recepción central: María recibe,
> identifica la intención, y rutea al flujo correcto o escala a Iria.
> Esto se arma en Aurora Inbox con: menú interactivo + embudos + reglas de
> derivación + escalado a humano. Requiere conexión por **Cloud API** (los menús de
> botones/lista y el multiagente viven ahí, no en la sesión espejo/QR).

---

## Mensaje de bienvenida (recepción)

Primera interacción de un número nuevo:

> Hola, soy **María**, la asistente de **Iria Talan** (RIF). Te ayudo a resolver
> dudas y a agendar con Iria. ¿Qué te trae hoy?
>
> 1️⃣ Quiero información o asesoría (seguros / retiro / inversión patrimonial)
> 2️⃣ Ya soy cliente y tengo una duda
> 3️⃣ Reportar o dar seguimiento a un trámite / siniestro
> 4️⃣ Agendar una plática con Iria

(En Aurora: menú tipo **lista/botones**. Si el cliente escribe libre en vez de
elegir, María entiende la intención y rutea igual.)

---

## Rutas

### Ruta 1 — Prospección / información  (embudo: "Nuevo lead")
1. María pregunta qué tema le interesa (Vida, GMM, Retiro/PPR, Patrimonial,
   Educacional/SEGUBECAS, Empresas).
2. Responde las **FAQs** del tema (documento 03).
3. Califica suave: ¿para quién es?, ¿qué busca lograr?, ¿horizonte de tiempo?
4. **Cierre:** agenda plática con Iria **o** deja el lead con su info.
5. Si pide cotización/precio formal → **escala a Iria** (no cotiza ella).

### Ruta 2 — Postventa / cliente actual  (embudo: "Cliente — servicio")
1. María confirma que ya es cliente.
2. Resuelve dudas generales (cómo funciona su producto, fechas, documentación).
3. **Renovaciones:** si aplica, recuerda vencimiento (plantilla pre-aprobada) y
   ofrece pasar con Iria para confirmar condiciones.
4. Cualquier cambio de póliza, monto o cobertura → **escala a Iria**.

### Ruta 3 — Trámite / siniestro  (embudo: "Siniestro / trámite") — SENSIBLE
1. María **captura lo básico** (qué pasó, cuándo, producto/carrier involucrado).
2. Explica el siguiente paso de forma general.
3. **Escala de inmediato a Iria** con el contexto. La gestión activa la hace Iria,
   nunca el bot. No promete tiempos ni resultados.

### Ruta 4 — Agendar  (embudo: "Cita agendada")
1. María ofrece horarios según disponibilidad real (agenda de Aurora).
2. Confirma y manda recordatorio.
3. Marca el lead/cliente como "cita agendada".

---

## Reglas de derivación a Iria (handoff humano)

María pasa a Iria (toma de control manual o asignación automática) cuando detecta:

- Palabras clave: "cotización", "precio exacto", "contratar", "siniestro",
  "reclamo", "queja", "cancelar", "demanda", "abogado".
- Caso sensible: salud delicada, fallecimiento, montos altos, conflicto familiar.
- Petición explícita de hablar con Iria.
- Cualquier duda que María no pueda responder con certeza desde las FAQs.

## Horarios

- **Horario hábil:** María atiende y escala en tiempo real a Iria.
- **Fuera de horario:** María atiende, resuelve FAQs, califica y agenda; deja tarea
  con contexto para que Iria dé seguimiento personal al siguiente día hábil.

## Multiagente (Iria + Viole)

Tu equipo ya es **dos personas (Iria y Viole)**, así que el conmutador opera en
multiagente desde el inicio: el mismo número, con asignación automática o manual a
Iria o a Viole. Al asignarse un lead, se refleja en su etapa de Pipedrive
("Iria Contactado" / "Viole Contactado"). Ver `07-mapeo-pipedrive.md`.

---

## Mapa rápido (un vistazo)

```
WhatsApp (1 número)
        │
     María (recepción + triage)
        │
   ┌────┼─────────┬──────────────┬───────────┐
   │    │         │              │           │
 Info  Cliente  Trámite/      Agendar    (no sabe / caso
(lead) (servic) siniestro      cita        sensible / pide
   │    │         │              │          a Iria)
   └────┴────┐    └──── escala ──┴──────────────┘
        FAQs +     a Iria (handoff con contexto)
       calificar
```
