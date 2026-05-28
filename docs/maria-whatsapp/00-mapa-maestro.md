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
| 11 | aurora-vs-respondio | Comparación de herramienta (histórico de la decisión) |
| 12 | setup-respondio | Plan de configuración de respond.io Advanced (vivo) |

## 2. Árbol del conmutador (vista completa)

```
WhatsApp → María
│
├── 🔍 Paso 0: Lookup Zoho por teléfono (HTTP request en vivo)
│       ¿hay match?
│       ├── Sí → CLIENTE (trae carrier, plan, estado, email, edad, RFC)
│       └── No → PROSPECTO
│
├── 🟦 RAMA A — CLIENTE (postventa)
│     │  María saluda: "Hola [nombre], ¿en qué te puedo ayudar hoy?"
│     │
│     │  REGLA: si el cliente escribe texto libre con intención clara
│     │  (ej. "mándame mi carátula"), María detecta y rutea directo,
│     │  sin mostrar menú. Solo muestra menú si la intención es
│     │  ambigua o no la dice.
│     │
│     └── Menú principal (cuando se muestra):
│           │
│           ├── 1️⃣ Ahorro y Vida
│           │     María pregunta libre: "¿Qué necesitas de tu plan?"
│           │     • Estado de cuenta → ticket Violeta
│           │     • Cambio fiscal / CSF → ticket Eunice
│           │     • Carátula → ticket Violeta → email
│           │     • Cualquier otra cosa → escala a Violeta
│           │
│           ├── 2️⃣ GMM — submenu: "¿En qué te puedo ayudar?"
│           │     A. Carátula / tarjeta → SharePoint (con verificación)
│           │     B. Hospital o médicos de convenio → portal por carrier
│           │     C. Facturas → portal por carrier (Bupa → Ángeles)
│           │     D. Dudas de coberturas → submenu:
│           │           D1. Maternidad → reglas elegibilidad + tabla
│           │           D2. Cómo funciona deducible / coaseguro
│           │               (FAQ #8 ⬜ voz pendiente de Iria)
│           │           D3. Otras dudas → "te comunicaré con Ángeles"
│           │     E. Formatos reembolso / programar cirugía → submenu (propuesta):
│           │           E1. Formato para reembolso → ticket Ángeles + plantilla
│           │           E2. Programar cirugía → ticket Ángeles + plantilla
│           │           E3. Maternidad / alta de bebé → ticket Ángeles
│           │           E4. Otra cosa o duda diferente → Ángeles
│           │     F. Otra cosa → escala a Ángeles
│           │
│           ├── 3️⃣ Auto — submenu: "¿En qué te podemos ayudar?"
│           │     A. Carátula de tu póliza → SharePoint (con verificación)
│           │     B. Teléfono de la aseguradora para reportar
│           │        accidente / choque
│           │        → María da el teléfono de emergencia del carrier
│           │        ⬜ Iria pasa tabla de teléfonos por aseguradora
│           │     C. Otra cosa → escala a Eliseo
│           │
│           └── 4️⃣ Info / contratar un nuevo plan
│                 → Salta a la RAMA B (guión de prospección completo)
│                   Aunque sea cliente, se trata como oportunidad nueva.
│
└── 🟩 RAMA B — PROSPECTO (prospección, guión 10)
      │
      ├── 1. Saludo cálido + tarjeta marca RIF
      │      "¡Hola! ¿Cómo estás? ¡Mucho gusto y gracias por contactarme!"
      │
      ├── 2. ¿Qué busca?
      │      Ya dijo → confirma y avanza
      │      No dijo → "¿En qué te puedo ayudar?"
      │
      ├── 3. Calificar (según ramo)
      │      • GMM → ind/fam · nombres+fechas · CP · siniestros · seguro actual
      │      • Ahorro/Retiro/Educacional → nombre · edad · salud
      │      • Vida → igual que ahorro
      │      • Autos → factura del vehículo · CP · nombre · fecha nac
      │
      ├── 4. Cierre
      │      "Te regreso en breve con la cotización"
      │      🚨 alerta inmediata a Iria
      │
      └── 5. Crea lead en Pipedrive (WhatsApp – Nuevo, dueña Iria)
              │
              └── Iria revisa primero → decide:
                    ├── Lo toma ella
                    ├── Pasa a Violeta (contactar)
                    └── Pasa a Ángeles (GMM) o Eliseo (Autos)
```

**Reglas transversales (siempre):**
- Verificación de identidad antes de datos sensibles = phone match + email registrado
  (fallback: fecha nac).
- Fuera de horario → María atiende, agenda, deja tarea al humano.
- Palabras gatillo de escalado: *contratar* · *cotización exacta* · *siniestro* ·
  *queja* · *cancelar* · *abogado* · *demanda*.
- María NUNCA: cotiza · promete cobertura · firma · da asesoría regulada.
- Pólizas de exceso = NO maternidad (regla universal en todas las aseguradoras).
- Detección de intención: María lee texto libre y rutea directo si la intención es
  clara; solo muestra menú cuando el cliente no la indique o sea ambigua.

## 3. Tracker de FAQs (por tema)

> Las del sitio (03) son contenido OK pero no voz de Iria. Las vamos pasando a su voz
> en `09-faqs-reales-iria.md`.

**Postventa (cross-ramo)**
- ✅ ¿Dónde descargo mi factura? (links: AXA, SMNYL, GNP, MetLife, Allianz · Bupa = la consigue Ángeles)
- 🟡 Postventa GMM (siniestros, reembolso, cirugía, maternidad) → María abre ticket
  Zoho Desk + Zoho manda plantilla/Form, Ángeles da seguimiento. Assets ya en Zoho ✅.
  Falta: integración Aurora→Zoho Desk + Zoho Forms.
- 🟡 Carátula / tarjeta (FAQ #5): **GMM/Autos vigente** → María busca SharePoint
  (`CARATULA/CREDENCIAL [policy#].pdf`) y manda PDF (con 2º factor). **Vida/Ahorro** →
  ticket Zoho Desk a Violeta, email. **Cancelada** → escala a Ángeles/Eliseo. Falta:
  integración SharePoint (Microsoft Graph) en respond.io.

**Postventa GMM cliente-específico (lookup)**
- 🟡 ¿Qué deducible tengo? (lookup Zoho o trigger carátula) — confirmar campo Zoho
- 🟢 ¿Cuánto cubre mi maternidad? Tabla por carrier+plan completa (tabulador RIF 25-26). SMNYL requiere plan+zona+deducible o manda PDF. Confirmar Bupa.
- 🟡 ¿Cómo me doy de alta en el portal del cliente? (link/app por carrier) — links pendientes
- 🟡 ¿Cuáles son los periodos de espera? (PDF general o por carrier) — PDF pendiente

**GMM**
- ✅ ¿En qué hospital me atiendo? (→ portal por carrier, lookup Zoho)
- ✅ ¿Médicos de convenio? (mismos portales, filtro de médicos)
- ⬜ ¿Cómo funciona el deducible y el coaseguro? (educativa) — falta voz de Iria
- ✅ ¿Por qué subió mi prima este año? (4 factores: edad + inflación 18% + IVA nov-2025 + siniestralidad)
- ✅ ¿Cómo funciona la renovación automática? (vitalicia garantizada)
- ✅ ¿Cuándo vence mi póliza? / ¿vigencia? (anual; lookup Zoho para fecha exacta)
- ✅ ¿Cómo agrego a mi bebé recién nacido? (30 días + mín. 10 meses póliza)
- ✅ ¿Es deducible de impuestos? (sí + revisar CSF; ticket a Eunice si hay cambios)
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
- 🟡 FAQs reales en su voz (van 3: hospital, médicos de convenio, facturación) + flujo de formatos GMM.
- ✅ Postventa GMM (siniestros/reembolso/cirugía/maternidad): plantillas en Zoho Desk
  + formularios en Zoho Forms (ya existen; solo falta conectarlas a Aurora).
- ⬜ Info básica de **autos** (qué cubre, carriers, proceso) + ¿pipeline propio?
- ⬜ 3-5 ejemplos reales de su voz → pase final a persona/plantillas/microcopys.

**Del martes (con compu / frente a Aurora):**
- 🔴 **Lookup en vivo (#6) = NO en Aurora** (técnico confirmó: la IA no lee otro CRM en
  vivo, solo crea/cambia registros). Fallback: María **pregunta** la aseguradora. Si el
  lookup fuera must-have → evaluar respond.io. **DECISIÓN PENDIENTE de Iria.**
- 🟡 Integraciones (#5: Pipedrive/Zoho Desk/Forms) — push de registros probablemente sí;
  confirmar specifics + costo Meta en llamada técnica.
- ⬜ Automatizar **ticket Aurora→Zoho Desk + Zoho Forms** (postventa GMM → Ángeles).
- ⬜ **Alerta/asignación inmediata a Iria** al entrar un lead calificado (respuesta rápida).
- ⬜ Confirmar nombre exacto del campo aseguradora/plan en Zoho (o crearlo).
- ⬜ Conectar WhatsApp (Cloud API), pegar persona, subir RAG, armar conmutador.
- ⬜ Crear etapa `WhatsApp – Nuevo` en Pipedrive + Zap.
- ⬜ Definir asientos en Aurora (equipo de 5).

**Decidido (cerrado):**
- ✅ **Cloud API** confirmado (sin riesgo de baneo) + **número dedicado** para María.
- ✅ **Herramienta = respond.io Advanced** ($279 USD/mo). Decisión tomada may-2026.
  Plan de setup en `12-setup-respondio.md`. Comparación histórica en `11`.
- ✅ Prospección nueva → a Iria primero.
- ✅ Autos → agregar FAQs (no solo rutear).
- ✅ Valor del trato lo deja en 0 (María no cotiza).
- ✅ Médicos/hospitales → María da link + qué clic dar (no scrapea).
