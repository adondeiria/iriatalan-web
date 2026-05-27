# Mapa maestro — proyecto María (WhatsApp + Aurora)

> Vista de un vistazo de TODO el proyecto: qué hay, cómo fluye, qué FAQs están y qué
> falta. Este archivo se actualiza cada vez que avanzamos algo. **Si dudas dónde está
> algo, empieza aquí.**

Leyenda de estado: ✅ listo · 🟡 en proceso / falta voz de Iria · ⬜ pendiente / sin contenido

---

## 1. Archivos del proyecto (`docs/maria-whatsapp/`)

| # | Archivo | Qué es |
| --- | --- | --- |
| 00 | mapa-maestro | Este índice + árbol + tracker (vivo) |
| 01 | persona-maria | System prompt / personalidad + guardrails YMYL |
| 02 | flujo-conmutador | Menú de triage, rutas, escalado |
| 03 | faqs-entrenamiento | 116 FAQs del sitio (RAG) — contenido, no voz |
| 04 | checklist-martes | Pasos + 6 preguntas al vendedor |
| 05 | plantillas-whatsapp | Mensajes proactivos (aprobar en Meta) |
| 06 | microcopys | Frases listas para pegar |
| 07 | mapeo-pipedrive | Lead → Pipedrive + lookup Zoho (postventa) |
| 08 | equipo-y-ruteo | Directorio del equipo + matriz de ruteo |
| 09 | faqs-reales-iria | FAQs en voz de Iria + reglas (voz canónica) |
| 10 | guion-prospeccion | Guión de primer contacto con prospecto (voz cálida) |

## 2. Árbol del conmutador

```
WhatsApp (1 número) ─ María (recepción + triage)
│
├─ Paso 0: lookup en Zoho por teléfono
│    ├─ Cliente existente → trae aseguradora + plan → POSTVENTA con contexto
│    └─ No aparece        → PROSPECTO → lead en Pipedrive (WhatsApp–Nuevo, dueña Iria)
│
├─ Rutea por ramo / intención:
│    ├─ Prospección / asesoría ........ Iria (Violeta apoya contacto)
│    ├─ GMM (cotiz / emisión / duda) ... Ángeles (Eunice asiste)
│    ├─ GMM siniestro .................. Ángeles  → capturar + escalar
│    ├─ Vida (emisión / servicio) ...... Violeta (emisiones también Ángeles)
│    ├─ Autos (cotiz/emisión/postventa)  Eliseo   ⬜ contenido pendiente
│    ├─ Cobranza / pagos ............... Violeta
│    └─ Cierre / decisión financiera ... Iria
│
└─ Siempre: no cotiza · no promete · no asesora → escala. Disclaimers.
```

## 3. Tracker de FAQs (por tema)

> Las del sitio (03) son contenido OK pero no voz de Iria. Las vamos pasando a su voz
> en `09-faqs-reales-iria.md`.

**GMM**
- ✅ ¿En qué hospital me atiendo? (→ portal por carrier, lookup Zoho)
- ✅ ¿Médicos de convenio? (mismos portales, filtro de médicos)
- 🟡 ¿Cubre preexistencias?
- 🟡 ¿Cuánto cuesta?
- 🟡 ¿Maternidad / parto?
- 🟡 ¿A qué edad conviene / hasta cuándo se renueva?
- 🟡 ¿Lo conservo si cambio de trabajo?
- 🟡 Objeciones: "subió mucho" · "es caro" · "el IMSS me cubre" · deducible
- ℹ️ GMM con 5 carriers (AXA, SMNYL, MetLife, GNP, Bupa). Allianz NO hace GMM.

**Vida** — 🟡 (del sitio)
**Retiro / PPR / Modalidad 40** — 🟡
**Ahorro / Seguro de Ahorro** — 🟡
**Patrimonial / Fideicomisos** — 🟡
**SEGUBECAS** — 🟡
**Autos** — ⬜ sin contenido (Iria pasa info; María solo rutea mientras tanto)
**General** (honorarios, sesión inicial, aseguradoras, cobertura nacional) — 🟡
**Nichos** (mujeres, neurodivergentes, LGBT+, mexicanos en el extranjero, foreigners) — 🟡

## 4. Pendientes globales

**De Iria (desde el cel):**
- ✅ **Prospección (guión 10): COMPLETA.** Saludo ✅ · calificar todos los ramos
  (GMM, ahorro/retiro/educacional, vida, autos) ✅ · cierre ✅ (regresa con cotización
  + **alerta inmediata a Iria**).
- 🟡 **Tarjeta de presentación**: recibida (imagen de marca RIF). Subir a Aurora el
  martes. ❓¿hay una con datos/contacto/foto?
- 🟡 Seguir mandando FAQs de GMM en su voz (van 2: hospital, médicos de convenio).
- ⬜ Info básica de **autos** (qué cubre, carriers, proceso) + ¿pipeline propio?
- ⬜ 3-5 ejemplos reales de su voz → pase final a persona/plantillas/microcopys.

**Del martes (con compu / frente a Aurora):**
- ⬜ 6 preguntas al vendedor (Cloud API · costo · número · datos · Pipedrive/Zoho · lookup en vivo).
- ⬜ **Alerta/asignación inmediata a Iria** al entrar un lead calificado (respuesta rápida).
- ⬜ Confirmar nombre exacto del campo aseguradora/plan en Zoho (o crearlo).
- ⬜ Conectar WhatsApp (Cloud API), pegar persona, subir RAG, armar conmutador.
- ⬜ Crear etapa `WhatsApp – Nuevo` en Pipedrive + Zap.
- ⬜ Definir asientos en Aurora (equipo de 5).

**Decidido (cerrado):**
- ✅ Herramienta: Aurora Inbox (condicionado a Cloud API + lookup en vivo).
- ✅ Prospección nueva → a Iria primero.
- ✅ Autos → agregar FAQs (no solo rutear).
- ✅ Valor del trato lo deja en 0 (María no cotiza).
- ✅ Médicos/hospitales → María da link + qué clic dar (no scrapea).
