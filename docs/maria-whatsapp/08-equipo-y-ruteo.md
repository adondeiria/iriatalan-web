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
| **Prospección nueva** (cualquier ramo) | Iria (dueña) → Violeta apoya contacto | Cae en `WhatsApp – Nuevo`; ⚠️ confirmar si va directo a Violeta |
| **GMM** — cotización / emisión / duda | Ángeles (Eunice asiste) | |
| **GMM** — siniestro | Ángeles | Caso sensible: capturar y escalar de inmediato |
| **Vida** — emisión / servicio | Violeta (jefa de Vida) · emisiones también Ángeles | |
| **Autos** — cotización / emisión / postventa | Eliseo | ⚠️ No hay contenido de autos en el RAG: María solo rutea, no responde |
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

## ⚠️ Pendientes a decidir

1. **Autos sin contenido:** ¿María solo rutea autos a Eliseo, o le agregamos FAQs
   básicas de autos al RAG? (Hoy no hay nada de autos en el sitio.)
   ¿Autos vive en este mismo pipeline de Pipedrive o en otro?
2. **Prospección:** ¿el lead nuevo lo asigna María a Iria o directo a Violeta?
3. **Asientos en Aurora:** son 5 personas; los planes traen 3 usuarios. Decidir
   quién necesita asiento propio (+$240 MXN/mes c/u). Posible: los asistentes
   (Eunice) comparten o no tienen asiento.
