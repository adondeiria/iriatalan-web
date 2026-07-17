# OFICINA.md — Memoria operativa de automatización de oficina

> **Qué es este archivo.** Las sesiones de Claude NO comparten memoria entre sí. Este archivo
> es la memoria persistente de todo lo relacionado con automatización de la oficina de
> Iria Talan (kanban, PDF→CRM, WhatsApp, Desk). **Regla para agentes:** léelo al inicio de
> cualquier sesión de oficina y actualízalo (con OK de Iria) antes de cerrar la sesión.
> No dupliques aquí lo del blog — eso vive en `docs/BLOG.md`.

Última actualización: 2026-07-17 (verificado en vivo contra Zoho Desk, Zoho Projects y Zoho CRM).

---

## 1. Mapa de sistemas

### Equipo
| Persona | Correo | Rol operativo |
|---|---|---|
| Iria Talan | iria@talan.com.mx | Dirección; dueña de portales Zoho |
| Eunice Juarez | operaciones2@talan.com.mx | Operaciones; envía avisos WhatsApp de renovación (manual hoy) |
| Angeles Tello | operaciones@talan.com.mx | Operaciones; tickets de renovación/trámites |
| Violeta Lindero | clientes@talan.com.mx | Cobranza (tickets de recibos/pagos en Desk) |
| Tamara Aguilar | comunicacion@talan.com.mx | Comunicación; dueña de la mayoría de tableros kanban |

### Zoho Desk (tickets operativos)
- **orgId:** `674011166` · Portal agente: `https://correoszoho.iriatalan.com.mx/agent/iriatalan`
- Departamentos activos: **DIRECCION** (`317055000000006907`, default — aquí viven renovaciones y cobranza) y **SINIESTROS** (`317055000058253057`). Hay 8 departamentos legacy deshabilitados (GMM individual/colectivos, Vida y Ahorro, Auto y Hogar, etc.).
- Campos custom clave de tickets: `Tipo de gestion` (Renovacion/Actualizacion/…), `Plantilla` (p.ej. "GMM GNP/ RENOVACIÓN"), `Aseguradora`, `No. de Poliza`, `Fecha de vencimiento`, `Estado de vencimiento` (Futuro/Vence mañana/Vence hoy/Vencido), `Seguimiento avisado` (true/false), `Próximo seguimiento`, `Estatus con aseguradora`, `Folio TRAM`.
- **El canal WhatsApp NO está conectado a Desk** (verificado: cero tickets con channel=WhatsApp en todo el histórico).

### Zoho CRM (datos maestros + automatización WhatsApp)
- Módulos custom: **Polizas**, **Cobros**, **Tramites**, **Sinisetros** (sic), **Renovaciones**, más Deals/Contacts estándar. (Aquí aterrizó el trabajo de las sesiones PDF→CRM: carátulas de pólizas → registros.)
- ~70 workflows activos. Familias principales:
  - Renovación por aseguradora sobre Polizas ("GNP RENOVACIÓN GMM", "SMNYL RENOVACIÓN GMM", "BUPA GMM RENOVACIÓN GMM", "AXA…", "METLIFE…", "SISNOVA…", "GNP RENOVACIÓN AUTO/HOGAR") — generan los tickets de renovación en Desk (~45 días antes; se crean ~08:00-09:00 MX).
  - Pagos anuales/semestrales por aseguradora sobre Polizas y Cobros.
  - **WhatsApp** (ver sección 3).
  - Puentes vía **Zoho Flow**: "Trámite Cerrado → Cerrar Ticket", "Siniestro Cerrado → Cerrar…", "Renovación Cerrada → Cerrar…" (CRM→Desk), "Contacto Nuevo → Books Cliente" (CRM→Books).
- Acceso MCP: el servidor combinado (Books+CRM+Desk) responde sin fricción; el servidor CRM standalone pide aprobación manual que las sesiones remotas no pueden dar — usar el combinado.

### Zoho Projects (kanban de oficina)
- Portal **iriatalan**, id `694609173`, org "IRIA TALAN RIF".
- Tableros activos (estado al 2026-07-17): OFICINA (58%), Pagos Recurrentes (66%), Marketing y Comunicación (28%), CARTAS CON AMOR (45 tareas abiertas), Videos GMM (77 tareas — catálogo por aseguradora, 11 tipos de video), Compras (100%).

### Web (iriatalan.com.mx) → captura de leads
- `/api/contact` reenvía el form de pre-cualificación a **Zoho Forms** (form `iriatalancontactoprecualificacion`); lo usan también los 3 lead magnets gateados. Nota en código sobre posible migración a Pipedrive (no ejecutada).
- WhatsApp público del sitio (marketing): 55 1268 3401.

---

## 2. Flujo de renovaciones (as-is)

1. Workflow de CRM (por aseguradora) crea el ticket de renovación en Desk con `Tipo de gestion=Renovacion` y `Plantilla` de la aseguradora, ~45 días antes del vencimiento.
2. Operaciones arma la propuesta (carátula PDF, tabla de datos en comentarios) y **envía la propuesta por correo al cliente desde el ticket**.
3. **Paso manual a automatizar:** avisar al cliente por WhatsApp que su propuesta llegó al correo. Hoy: Iria lo pide en un comentario, Eunice manda el WhatsApp desde el teléfono y sube captura al ticket; se marca `Seguimiento avisado=true`.
4. Caso de referencia completo: ticket **#21550** (id `317055000061103001` es GNP #21503; el BUPA de referencia es id `317055000061258001`), renovación BUPA 143290 FONI Entertainment — tiene todo el patrón documentado en comentarios.

Volumen: ~4,500 tickets históricos matching "renovaci", ~3,700 matching "cobranza/recibo/pago".

---

## 3. Canal WhatsApp — estado real (verificado 2026-07-17)

- **El canal API de WhatsApp YA EXISTE y opera desde Zoho CRM** (Business Messaging). No hay trámite de Meta pendiente para el caso de uso base.
- Evidencia: workflow **"WHATSAPP COBRANZA 30D ANTES — ANUAL/SEMESTRAL"** (id `3835434000079893004`, módulo Cobros) — dispara 1 mes antes de `Fecha_estimada_de_pago` a las 09:00, plantilla **`pago_proximo_v3`**, activo desde 2026-05-02, última ejecución 2026-07-12. Además: familia "WhatsApp Vida Mujer año 5…20" y "WhatsApp Ratificación SEGUBECA" (date-based sobre Polizas, 08:00).
- **Número designado para mensajes a clientes:** existe (ahí sale la cobranza), PENDIENTE anotarlo aquí. Se consulta en CRM → Setup → Channels → Business Messaging (WhatsApp). NO es el 55 1268 3401 del sitio ni el 55 3733 8976 de la org de Desk (descartados por Iria 2026-07-17).
- **Twilio: DESCARTADO** por decisión previa de Iria (confirmado 2026-07-17). No proponer de nuevo. (El conector Twilio de las sesiones es además solo búsqueda de documentación, sin acceso a cuenta.)
- Desk no tiene canal WhatsApp propio; no hace falta para el diseño actual (el envío sale de CRM).

---

## 4. PENDIENTE ACTIVO: aviso automático post-envío de propuesta de renovación

**Decisión de Iria (2026-07-17):** 100% automático vía API (sin pasos manuales), reutilizando el canal WhatsApp de CRM. Nada de semi-automático.

**Diseño propuesto (clonar el patrón de cobranza, cambiando el trigger de fecha → evento):**
1. **Plantilla nueva** (someter desde el mismo canal del CRM, categoría Utility, es_MX), nombre sugerido `renovacion_enviada_v1`:
   > Hola {{1}} 👋 Te enviamos a tu correo {{2}} la propuesta de renovación de tu seguro (póliza {{3}}), con renovación y cargo el {{4}}. Si no la encuentras, revisa spam o respóndenos por aquí y te la reenviamos con gusto. — Oficina de Iria Talan
2. **Puente Desk→CRM** (el evento "propuesta enviada" vive en el ticket): opción A — Zoho Flow (ya lo usan para CRM↔Desk) con trigger de respuesta/actualización de ticket que cumpla `Tipo de gestion=Renovacion` + correo saliente + `Seguimiento avisado=false`, acción: marcar campo tipo `Propuesta_enviada` (checkbox o fecha) en el registro **Renovaciones** vinculado. Opción B — función Deluge en Desk (workflow on update) que haga lo mismo vía API.
3. **Workflow CRM nuevo** en módulo Renovaciones, execute_on=field_update (`Propuesta_enviada` → true): acción "enviar mensaje WhatsApp" con `renovacion_enviada_v1` — misma acción que usa el de cobranza.
4. **Cerrar el loop en Desk:** el mismo Flow/Deluge marca `Seguimiento avisado=true` y programa `Próximo seguimiento` en el ticket.
5. **Prueba controlada** con un número interno antes de encender para todos.

**Fallback si el trigger por evento se complica:** date-based puro como cobranza (p.ej. X días antes de `Fecha de vencimiento`, si `Seguimiento avisado=false`) — menos preciso semánticamente pero idéntico al patrón que ya corre.

**Para la próxima sesión (en orden):**
1. Pedir a Iria el número designado y anotarlo en la sección 3.
2. Leer campos del módulo Renovaciones (un `ZohoCRM_getRecords` module=Renovaciones en el servidor combinado) para confirmar api_names y el link al ticket de Desk.
3. Confirmar si el aviso de renovación se dispara por evento (diseño principal) o date-based (fallback) — decisión de Iria.
4. Redactar la config exacta de Flow (o la función Deluge) y la plantilla final para que el equipo la configure en UI; verificar la primera ejecución real contra un ticket de prueba.

---

## 5. Historial de decisiones

| Fecha | Decisión |
|---|---|
| pre-2026-07 | Twilio descartado como canal WhatsApp. Número designado para mensajes a clientes ya operando (cobranza). |
| 2026-05-02 | Workflow WhatsApp cobranza 30d antes activo (plantilla pago_proximo_v3). |
| 2026-07-17 | Aviso de renovación será 100% automático vía API reutilizando canal CRM (no semi-automático). Este archivo se crea como memoria operativa. |

## 6. IDs útiles

| Cosa | Valor |
|---|---|
| Desk orgId | 674011166 |
| Desk depto DIRECCION | 317055000000006907 |
| Projects portal | 694609173 |
| Ticket referencia renovación BUPA (#21550) | 317055000061258001 |
| Workflow WhatsApp cobranza | 3835434000079893004 |
| Módulos CRM | Polizas, Cobros, Tramites, Sinisetros, Renovaciones |
| Campo trigger cobranza | Cobros.Fecha_estimada_de_pago |
