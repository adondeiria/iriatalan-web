# Equipo y ruteo del conmutador

> Quién es quién y a quién manda María cada conversación. La base del multiagente
> en Aurora. (Info operativa del equipo — sin datos de clientes.)

---

## Directorio del equipo

| Persona | Rol | Atiende |
| --- | --- | --- |
| **Iria** | Asesora principal | Prospección, asesoría, cierre |
| **Violeta** ("Viole") | Jefa de Vida y de oficina | Contacto de leads que le pasa Iria · cobranza · Vida |
| **Eliseo** | Asistente de Violeta | **Autos** (cotización, emisión, postventa) |
| **Ángeles** | — | **GMM** (cotización, emisión, siniestros) · emisiones Vida |
| **Eunice** | Asistente de Ángeles | Apoyo GMM |

## Matriz de ruteo (María → quién)

| Intención / ramo | María rutea a | Notas |
| --- | --- | --- |
| **Prospección nueva** (cualquier ramo) | Iria primero (dueña); ella decide pasarlo a Violeta | Cae en `WhatsApp – Nuevo` → "Iria Contactado" |
| **GMM** — cotización / emisión / duda | Ángeles (Eunice asiste) | |
| **GMM** — siniestro | Ángeles | Caso sensible: capturar y escalar de inmediato |
| **Vida** — emisión / servicio | Violeta (jefa de Vida) · emisiones también Ángeles | |
| **Autos** — cotización / emisión / postventa | Eliseo | FAQs básicas de autos pendientes (Iria las pasa); mientras tanto, solo rutea |
| **Cobranza / pagos** | Violeta | |
| **Oficina / administrativo** | Violeta | |
| **Asesoría / cierre / decisión financiera** | Iria | Lo que sea YMYL real |

## Reglas

- María es **recepción + triage**: identifica ramo e intención, NO resuelve el caso
  técnico — lo asigna a la persona correcta y deja contexto.
- Al asignarse un lead/cliente, se refleja en Pipedrive (etapa "Iria/Viole
  Contactado" para prospección; el resto sigue el flujo del dueño).
- **Siniestros y cobranza** siempre los maneja una persona, nunca el bot.

---

## Decisiones tomadas / pendientes

1. ✅ **Prospección:** el lead nuevo se asigna **a Iria primero**; ella decide
   pasarlo a Violeta para contactar.
2. 🟡 **Autos:** decidido **agregar FAQs de autos** al RAG. **Falta que Iria pase la
   info básica** (qué cubre, carriers, proceso de cotización/emisión). Pregunta extra:
   ¿autos vive en este mismo pipeline de Pipedrive o en otro?
3. 🟡 **Asientos Aurora:** responderán los **5** (Iria, Violeta, Eliseo, Ángeles,
   Eunice). El plan trae 3 usuarios → +2 (~$240 MXN/mes c/u). Confirmar definitivo
   con el vendedor (Iria aún no segura del esquema final).
