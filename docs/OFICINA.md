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

### Inventario de workflows WhatsApp en CRM (verificado 2026-07-17)

| Workflow | Módulo | Dispara | Última ejecución |
|---|---|---|---|
| WHATSAPP COBRANZA 30D ANTES — ANUAL/SEMESTRAL | Cobros | 1 mes antes de `Fecha_estimada_de_pago`, 09:00 | 2026-07-12 |
| WhatsApp Vida Mujer año 5 / 9 / 15 / 17 / 20 | Polizas | 1 mes antes del campo `Vida_Mujer_a_o_N`, 08:00 | entre 2026-05-12 y 2026-07-12 |
| WhatsApp Vida Mujer año 7 / 11 / 13 | Polizas | ídem | aún sin ejecuciones (ningún registro ha cumplido la fecha todavía) |
| WhatsApp Ratificación SEGUBECA | Polizas | 1 mes antes de `Fecha_de_retiro_de_segubeca`, 08:00 | 2026-07-02 |

Todos activos. Única plantilla con nombre documentado: `pago_proximo_v3` (cobranza). Los nombres/textos de las demás plantillas y el número emisor solo se ven en CRM → Setup → Channels → Business Messaging (WhatsApp) — anotarlos aquí cuando Iria los pase.
(El workflow "CZ - Aviso 25 días después de vencer" es por correo, no WhatsApp.)

### Límites de acceso conocidos (para no re-descubrirlos cada sesión)

- `ZohoCRM_getWorkflowRuleById` y todo el servidor CRM standalone piden aprobación manual → inalcanzables desde sesiones remotas no interactivas. La lista `getWorkflowRules` del servidor combinado SÍ funciona.
- **Las ESCRITURAS del servidor combinado también piden aprobación server-side** (verificado 2026-07-17 con `ZohoDesk_createTicket`: error "MCP tool call requires approval"; las lecturas Desk/CRM fluyen sin fricción). Impacto: el puente automático no puede escribir desde sesiones headless hasta desbloquear. **Desbloqueo A (preferido):** Iria pone las herramientas de escritura necesarias (`ZohoDesk_createTicket`, `ZohoDesk_updateTicket`, `ZohoCRM_updateRecord`, opc. `createFields`) en "permitir siempre" en la configuración del conector Zoho de claude.ai. **Desbloqueo B (robusto):** Zoho Self Client OAuth (api-console.zoho.com, scopes Desk.tickets.ALL + ZohoCRM.modules.ALL) con credenciales como secrets del environment CCR; el puente escribe vía REST con curl, sin depender del conector.
- Las conversaciones de sesiones previas de Claude no son accesibles desde ninguna sesión. El Gmail conectado (buscado 2026-07-17) no tiene correos-resumen de sesiones ni rastro de la configuración WhatsApp. **Este archivo es el único puente entre sesiones.**

---

## 4. PENDIENTE ACTIVO: aviso automático post-envío de propuesta de renovación

**Decisiones de Iria (2026-07-17):** 100% automático vía API. Trigger = **marcar en Desk el estado del ticket "Propuesta enviada"**. Envío por el **mismo número/canal WhatsApp ya operando en CRM** (no se toca el canal). Twilio descartado.

**Hechos verificados que fijan el diseño:**
- El módulo **Renovaciones está vacío** (sin registros) → el puente va por **Polizas**, donde ya corren los WhatsApp de Vida Mujer y donde existe el precedente exacto: el campo booleano `Ticket_Generado` que el workflow de renovación marca al crear el ticket en Desk.
- Mapeo ticket→póliza: `Polizas.Name` = "No. de póliza + espacio + año" (ej. `143290 2025`); el ticket trae `No. de Poliza`. Buscar con starts_with y quedarse con el de vigencia vigente.
- Variables disponibles en Polizas: lookup `Contacto` (de ahí sale el móvil, igual que cobranza), `Fecha_de_finalizaci_n_de_vigencia` (fecha de renovación/cargo — coincide con la fecha que Eunice comunica), `Asegurado_1` (persona asegurada; útil cuando `Contacto` es empresa).

### Runbook de implementación (todo en UI de Zoho; ~40 min de configuración + aprobación de plantilla)

1. **Desk (2 min):** crear estado custom de ticket **"Propuesta enviada"** (tipo Abierto) para el departamento DIRECCION.
2. **CRM (3 min):** en Polizas, crear campo **fecha** `Fecha propuesta enviada` (api ~`Fecha_propuesta_enviada`). Fecha y no checkbox para que re-dispare cada año al cambiar el valor.
3. **Plantilla (10 min + aprobación Meta, típicamente minutos-horas):** en el canal Business Messaging existente, plantilla `renovacion_enviada_v1`, categoría Utility, es_MX:
   > Hola {{1}} 👋 Ya enviamos a tu correo la propuesta de renovación de tu seguro (póliza {{2}}), con renovación y cargo el {{3}}. Si no la encuentras, revisa la bandeja de spam o respóndenos por aquí y te la reenviamos con gusto. — Oficina de Iria Talan
4. **Zoho Flow (15 min):** flow "Desk Propuesta enviada → CRM aviso WhatsApp":
   - Trigger: Zoho Desk — ticket actualizado (depto DIRECCION).
   - Condición: estado == "Propuesta enviada" **y** `Tipo de gestion` == "Renovacion" **y** `Seguimiento avisado` == false.
   - Acciones: (a) buscar Poliza por Name starts_with `No. de Poliza`; (b) actualizar `Fecha_propuesta_enviada` = hoy; (c) actualizar ticket: `Seguimiento avisado` = true y `Próximo seguimiento` = +3 días.
5. **Workflow CRM (5 min):** módulo Polizas, nombre "WHATSAPP RENOVACIÓN — PROPUESTA ENVIADA", execute_on = **field_update** de `Fecha_propuesta_enviada` → acción instantánea "Enviar mensaje WhatsApp" con `renovacion_enviada_v1` al `Contacto`. Mapeo: {{1}} nombre del contacto · {{2}} No. de póliza · {{3}} `Fecha_de_finalizaci_n_de_vigencia`.
   - *Verificar al configurar:* que la acción WhatsApp aparezca con trigger field_update (los workflows existentes son date-based). Si no apareciera, fallback: trigger date_or_datetime sobre `Fecha_propuesta_enviada` + 0 días (dispara al día siguiente a la hora configurada).
   - *Nota empresas:* si `Contacto` es persona moral (ej. FONI ENTERTAINMENT), {{1}} saldría con razón social; evaluar en la prueba usar `Asegurado_1`.
6. **Prueba controlada:** póliza de prueba con el móvil de Eunice/Iria en el contacto → marcar el estado en un ticket de prueba → verificar llegada del mensaje y flags. Encender.
7. **Auditoría (Claude, cuando esté vivo):** sesión semanal read-only que alerte tickets en "Propuesta enviada" con `Seguimiento avisado` == false. Pedirla como Routine cuando el flujo esté encendido.

**Pendiente de anotar aquí:** el número emisor y los textos de las plantillas existentes (CRM → Setup → Channels → Business Messaging).

### Plan B ACTIVADO (2026-07-17): puente por API directa con credenciales propias

Las escrituras vía conector MCP están bloqueadas por aprobación server-side (ver §Límites), así que el puente corre por REST API con OAuth propio. **El script ya existe: `scripts/oficina/renovaciones-bridge.mjs`** (dry-run por default; `--execute` para escribir; máx 20 tickets/corrida; CRM primero y Desk después para reintentos seguros; casos sin póliza se saltan con aviso).

**Setup de credenciales (Iria, ~10 min, una sola vez):**
1. Entrar a `api-console.zoho.com` (con la cuenta iria@talan.com.mx) → **Add Client → Self Client → Create**. Copiar `Client ID` y `Client Secret`.
2. Pestaña **Generate Code**: pegar en Scope exactamente:
   `Desk.tickets.ALL,Desk.basic.READ,Desk.contacts.READ,ZohoCRM.modules.ALL,ZohoCRM.settings.fields.ALL`
   Duración 10 minutos → Create → copiar el código (caduca rápido; el paso 3 se hace enseguida).
3. En una terminal (o me pasas el código en el chat y lo guío en vivo), canjear el código por el refresh token:
   ```
   curl -s -X POST "https://accounts.zoho.com/oauth/v2/token" \
     -d "grant_type=authorization_code" -d "client_id=TU_CLIENT_ID" \
     -d "client_secret=TU_CLIENT_SECRET" -d "code=EL_CODIGO"
   ```
   Del JSON de respuesta, guardar el valor de `refresh_token` (no caduca).
4. En la configuración del **environment de Claude Code** (code.claude.com → el environment de este repo → variables de entorno) crear los secrets: `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`.
   (Si la cuenta Zoho vive en otro data center — la URL de login lo dice, p.ej. accounts.zoho.eu — agregar también `ZOHO_ACCOUNTS_BASE`, `ZOHO_CRM_BASE`, `ZOHO_DESK_BASE`.)

**Con las credenciales listas, Claude ejecuta:** crear el campo `Fecha_propuesta_enviada` en Polizas vía API (ya no es paso de UI de Iria), pre-flight del script en dry-run, prueba end-to-end, y el Routine horario que corre el script. Queda en UI de Iria solamente: plantilla en Meta, estado "Propuesta enviada" en Desk, y el workflow de CRM (guiado).

---

## 5. Historial de decisiones

| Fecha | Decisión |
|---|---|
| pre-2026-07 | Twilio descartado como canal WhatsApp. Número designado para mensajes a clientes ya operando (cobranza). |
| 2026-05-02 | Workflow WhatsApp cobranza 30d antes activo (plantilla pago_proximo_v3). |
| 2026-07-17 | Aviso de renovación será 100% automático vía API reutilizando canal CRM (no semi-automático). Este archivo se crea como memoria operativa. |
| 2026-07-17 | Trigger del aviso definido por Iria: estado de ticket Desk "Propuesta enviada". Puente vía módulo Polizas (Renovaciones está vacío). Runbook final en sección 4. |
| 2026-07-17 (tarde) | Estado **"Propuesta Enviada"** ya creado en Desk y EN USO (5 tickets reales marcados en cola). Pendiente: credenciales Self Client, campo `Fecha_propuesta_enviada`, plantilla Meta, workflow CRM. |

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
