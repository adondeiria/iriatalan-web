# Bitácora de la sesión — proyecto María (WhatsApp)

> Resumen narrativo de todas las decisiones, entregables y pendientes acumulados en
> esta sesión. **Persistido en git** (branch `claude/whatsapp-maria-assistant-Gifze`).
> Para la **vista de un vistazo** ir a `00-mapa-maestro.md`.

---

## Resumen ejecutivo

Construimos el cerebro completo de **María**, una asistente de WhatsApp con IA para
Iria Talan (RIF), que atiende prospección + postventa para los 5 ramos
(GMM, Vida, Ahorro/Retiro, Autos, Patrimonial), con multi-agente para el equipo de 5
personas, lookup en vivo a Zoho CRM, búsqueda en SharePoint para entrega de carátulas,
y apertura de tickets en Zoho Desk con plantillas existentes para trámites GMM.

**Herramienta elegida:** respond.io Advanced ($279 USD/mo). Se descartó Aurora Inbox
por no soportar lookup en vivo de CRM externo (confirmado por su técnico).

---

## Decisiones clave

| # | Decisión | Razón |
| --- | --- | --- |
| 1 | **respond.io Advanced** (no Aurora Inbox) | Único plan que soporta HTTP requests del AI Agent para lookup en vivo a Zoho |
| 2 | **Número WhatsApp dedicado** | Cloud API requiere número que ya no se usa en app móvil — recomendable no migrar el actual |
| 3 | **Prospección → Iria primero** | Lead nuevo se asigna a Iria; ella decide pasarlo a Violeta (contactar) o Ángeles (GMM) |
| 4 | **Cierre prospección = "Te regreso con cotización" + alerta inmediata** | María promete velocidad; Aurora notifica/asigna al instante a Iria |
| 5 | **María no cotiza ni promete** | Guardrail YMYL; cualquier monto/cobertura va por tabla establecida o escala |
| 6 | **Verificación de identidad antes de soltar datos** | Phone match + email registrado (fallback fecha nac) |
| 7 | **Pólizas de exceso = NO maternidad (universal)** | Regla en todos los carriers |
| 8 | **Maternidad con reglas por carrier** | GNP/MetLife: deducible <$60k; SMNYL: ≤44 años + deducible ≤$65k; AXA/Bupa pendientes |
| 9 | **Carátulas via SharePoint search** | Convención `CARATULA [policy#].pdf` permite búsqueda directa por Microsoft Graph |
| 10 | **Carátula Vida/Ahorro va por email vía Violeta** | Documento sensible, no por WhatsApp |
| 11 | **Trámites GMM (siniestros/reembolso/cirugía/maternidad) = ticket Zoho Desk + plantilla → Ángeles** | Plantillas ya existen en Zoho |
| 12 | **CSF/fiscal → ticket Eunice** (no Violeta) | Eunice maneja fiscal específicamente |
| 13 | **María detecta intención de texto libre y rutea directo** | Menú solo si la intención es ambigua |
| 14 | **Rama A (cliente): menú 1 Ahorro y Vida · 2 GMM · 3 Auto · 4 Info/nuevo plan** | Cliente elige; GMM y Auto tienen submenús |

---

## Las 15 FAQs documentadas (voz canónica de Iria, en `09`)

1. **Hospital** → portal por carrier (lookup Zoho).
2. **Médicos de convenio** → mismo portal, filtro médicos. SMNYL distingue convenio
   regular (tarifa tabulador) vs "Médicos a tu lado" (sin costo, exclusivo SMNYL).
3. **Facturación** → portal por carrier (Bupa = la consigue Ángeles).
   AXA, SMNYL, MetLife, GNP, Allianz tienen self-service.
4. **Postventa GMM automatizable** (siniestros, reembolso, cirugía, maternidad) →
   ticket Zoho Desk + plantilla → Ángeles. Plantillas ya en Zoho.
5. **Carátula / tarjeta** → 3 ramas: GMM/Autos vigente (SharePoint+envío),
   Vida/Ahorro (ticket Violeta+email), Cancelada (escala Ángeles/Eliseo).
6. **¿Qué deducible tengo?** → lookup Zoho o trigger carátula.
7. **¿Cuánto cubre mi maternidad?** → reglas elegibilidad + tabla tabulador RIF 25-26
   por carrier+plan (GNP, SMNYL, AXA, MetLife; Bupa pendiente).
8. **¿Cómo funciona el deducible y el coaseguro?** → ⬜ pendiente voz de Iria.
9. **Alta en portal del cliente** → links de app/portal por carrier (⬜ pendientes).
10. **Periodos de espera** → manda PDF (⬜ pendiente).
11. **¿Por qué subió mi prima?** → 4 factores (edad, inflación médica 18%, IVA
    nov-2025, siniestralidad).
12. **Renovación automática** → vitalicia garantizada con todos los carriers de Iria.
13. **¿Cuándo vence mi póliza? / ¿vigencia?** → anual; lookup Zoho para fecha exacta.
14. **¿Cómo agrego a mi bebé?** → 30 días naturales + mínimo 10 meses de póliza;
    ticket Ángeles.
15. **¿Es deducible de impuestos?** → sí + revisar CSF al día; cambios → ticket
    Eunice.

---

## Pendientes — por prioridad

### Datos que faltan de Iria (cuando pueda)
- **Bupa completo** (maternidad: monto + edad + deducible + exceso) → martes.
- **AXA**: edad límite + deducible máximo para maternidad → martes.
- **GNP/MetLife**: confirmar si pólizas de exceso aplica (probablemente NO).
- **Teléfonos de emergencia por carrier** para Auto opción B (reportar choque).
- **Voz de Iria para FAQ #8** (cómo funciona deducible/coaseguro).
- **Links de portales/apps por carrier** para FAQ #9 (alta en portal cliente).
- **Videos YouTube por carrier** para FAQ #4 (cómo llenar formatos de siniestros).
- **PDF de periodos de espera** (FAQ #10) — ¿uno o por carrier?
- **Info básica de autos** (qué cubres, carriers, proceso).
- **3-5 ejemplos reales de su voz por WhatsApp** → pase final de tono a persona,
  plantillas y micro-copys.
- **Tarjeta de presentación con datos** (si tiene una más completa que el logo).

### Técnicos (para el martes / setup respond.io)
- Crear cuenta y trial en respond.io (`app.respond.io`).
- Decidir número (recomendado: nuevo dedicado).
- Verificación de Meta Business Manager + conectar WhatsApp Cloud API.
- Confirmar nombre exacto del campo `aseguradora` / `plan` / `deducible` / `tipo de
  póliza` en Zoho CRM (o crearlos si no existen).
- Configurar AI Agent HTTP request action para lookup Zoho (Claude puede dejar lista
  la spec).
- Configurar AI Agent HTTP request para SharePoint search (carátulas/tarjetas).
- Zaps: respond.io → Pipedrive (crear lead en `WhatsApp – Nuevo`).
- Zaps/HTTP: respond.io → Zoho Desk (tickets para trámites GMM con plantillas).
- Construir Workflows del conmutador con menú y submenús.
- Subir Knowledge: FAQs reales (`09`), folletos, voice corpus.
- Plantillas WhatsApp (`05`) someter a Meta para aprobación.
- Dar de alta a los 5 usuarios (Iria, Violeta, Eliseo, Ángeles, Eunice).
- Pruebas (10 min).

---

## Recomendación para el martes — primer paso

1. **Crear cuenta de trial en respond.io** (gratis, 7 días). Te da features de Growth
   para que vayas armando el setup sin pagar todavía.
2. **Iniciar la verificación de Meta Business Manager** desde el día 1 (puede tomar
   días). Sin esto no hay Cloud API.
3. Mientras corren los trámites, **completar los pendientes de datos** que te
   solicito arriba (montos Bupa/AXA, tabla teléfonos Auto, links portales, etc.).
4. **Confirmar campos en Zoho** que necesita el lookup en vivo (aseguradora, plan,
   deducible, tipo de póliza, fecha nacimiento, RFC, email registrado).
5. Una vez cuenta + Meta + datos listos, **configurar el AI Agent + Workflows del
   conmutador** según `12-setup-respondio.md`.

---

## Archivos de la sesión (`docs/maria-whatsapp/`)

| # | Archivo | Resumen |
| --- | --- | --- |
| 00 | mapa-maestro | Vista de un vistazo: índice + árbol del conmutador + tracker + pendientes |
| 01 | persona-maria | System prompt + guardrails YMYL para María |
| 02 | flujo-conmutador | Diseño del conmutador (versión inicial; vive ahora consolidado en `00`) |
| 03 | faqs-entrenamiento | 116 FAQs del sitio (RAG, no voz canónica) |
| 04 | checklist-martes | HISTÓRICO — Aurora (superseded por `12`) |
| 05 | plantillas-whatsapp | Mensajes proactivos Meta-approved (renovación, seguimiento) |
| 06 | microcopys | Frases listas para pegar (saludo, identidad, privacidad, etc.) |
| 07 | mapeo-pipedrive | Lead → Pipedrive + lookup Zoho de entrada (postventa) |
| 08 | equipo-y-ruteo | Directorio del equipo + matriz de ruteo por ramo |
| 09 | faqs-reales-iria | **15 FAQs en voz canónica de Iria** + reglas de comportamiento |
| 10 | guion-prospeccion | Saludo + calificación por ramo + cierre con alerta inmediata |
| 11 | aurora-vs-respondio | Comparación que llevó a la decisión |
| 12 | setup-respondio | Plan de configuración de respond.io Advanced |
| 13 | bitacora-sesion | Este doc — resumen narrativo + pendientes priorizados |

---

## Persistencia

- **Branch:** `claude/whatsapp-maria-assistant-Gifze`.
- **HEAD:** `8cae195` (E1/E2 en voz de cliente).
- **Commits de la sesión:** 59, todos pusheados al remoto.
- **Tree status:** limpio (sin cambios sin guardar).

Para continuar en otra sesión / dispositivo, solo abrir el branch en cualquier
cliente git o en Claude Code (web/desktop). Toda la información vive en el repo.
