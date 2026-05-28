# Setup respond.io — María en WhatsApp

> Plan de configuración. **respond.io Advanced** ($279 USD/mo) es la herramienta
> elegida — ver `11-aurora-vs-respondio.md` para el racional. Este doc reemplaza al
> checklist `04` (que queda como historia de la investigación de herramienta).

## Por qué Advanced (y no Growth)
- Growth ($159) tiene IA + Workflows + Zapier, pero **no permite publicar HTTP
  requests del AI Agent** → sin lookup en vivo.
- Advanced ($279) habilita el lookup (María consulta Zoho a mitad de chat por la
  aseguradora+plan del cliente).

---

## Pasos de configuración (en orden)

### 1. Trial gratis (cero compromiso, 7 días)
Registrarse en `app.respond.io/user/register`. Da features de Growth con 5 usuarios y
1,000 contactos activos. Suficiente para construir todo el setup; **publicar el HTTP
request del lookup requiere upgrade a Advanced.**

### 2. Decisión de número
- **Recomendado: número nuevo dedicado** (conservas tu WhatsApp personal).
- Alternativa: migrar el actual (pierdes la app móvil de WhatsApp en ese número).

### 3. Conectar WhatsApp Cloud API
- Cuenta de **Meta Business Manager** + verificación de negocio (puede tardar días).
- Asociar el número elegido al canal de WhatsApp en respond.io.

### 4. Configurar el AI Agent ("María")
- **Persona / system prompt:** pegar contenido de `01-persona-maria.md`.
- **Knowledge sources:** subir `09-faqs-reales-iria.md` (voz canónica) y luego folletos
  cuando los tengas. `03-faqs-entrenamiento.md` como respaldo.
- **Voice corpus de referencia:** los 4 archivos de `sanity/seeds/voice-corpus/`.

### 5. Construir los Workflows del conmutador
Implementar lo de `02-flujo-conmutador.md` como **Workflows** en respond.io:
- Welcome menu (botones/lista) + rutas por intención/ramo.
- Asignación a Iria/Violeta/Eliseo/Ángeles/Eunice según `08-equipo-y-ruteo.md`.
- Escalado a humano (palabras clave, casos sensibles, horario).

### 6. AI Agent Action: HTTP request al Zoho CRM (el lookup en vivo)
La pieza estrella. Configurar una acción del AI Agent:
- **Trigger:** el cliente menciona algo que dependa de su póliza (hospital, factura, etc.).
- **Endpoint:** Zoho CRM API → Contacts → searchRecords por `phone` = `$contact.phone`.
- **Auth:** OAuth2 con Zoho (refresh token).
- **Response:** la IA interpreta el JSON y usa `aseguradora` + `plan` en su respuesta.
- **Pendiente:** confirmar **nombre exacto** del campo aseguradora/plan en Zoho (o
  crearlo si no existe — lo dijo Iria).

> Claude puede dejar lista la spec/JSON de esta acción desde aquí, porque tiene Zoho
> conectado al entorno. Solo falta confirmar el field name.

### 7. Integraciones (Zapier o HTTP directo en Workflows)
- **Pipedrive (prospección):** lead calificado en respond.io → crear Persona + Trato
  en Pipedrive en etapa `WhatsApp – Nuevo`, dueña Iria. Spec en `07-mapeo-pipedrive.md`.
- **Zoho Desk (postventa GMM + Vida/Ahorro):** intención de
  siniestro/reembolso/cirugía/maternidad → ticket a Ángeles + plantilla. Para Vida y
  Ahorro (FAQ #5): ticket a Violeta para envío por email. Detalle en `09` FAQ #4 y #5.
- **Microsoft Graph / SharePoint** (FAQ #5 — carátula/tarjeta GMM/Autos):
  AI Agent HTTP request action que busca en SharePoint library "EXPEDIENTES CLIENTES"
  por filename con `CARATULA [policy#].pdf` o `CREDENCIAL [policy#].pdf`, recupera el
  archivo y respond.io lo envía como media. Requiere Azure AD app + OAuth con permisos
  Sites.Read.All. Claude puede dejar lista la spec desde aquí porque tu M365 está
  conectado al entorno.

### 8. Plantillas de WhatsApp aprobadas por Meta
Subir las plantillas de `05-plantillas-whatsapp.md` y someter a Meta para aprobación
(típico 24–48h).

### 9. Multiagente
Alta de los 5 usuarios: Iria, Violeta, Eliseo, Ángeles, Eunice (incluidos en el plan).

### 10. Pruebas (10 min)
Escribir desde otro número y verificar:
- Saludo cálido + envío de tarjeta.
- Calificación GMM y ahorro/retiro/vida.
- Calificación autos (recibir factura).
- **Lookup en vivo:** mensaje desde un número que esté en Zoho → María debe responder
  con la aseguradora correcta (ej. "Veo que tienes Allianz PPR...").
- Escalado a Iria con palabras clave.
- Apertura de ticket en Zoho Desk para siniestro de prueba.
- Fuera de horario.

---

## Costo total estimado (mensual)

| Concepto | Costo |
| --- | --- |
| respond.io Advanced | $279 USD (~$4,800 MXN @ 17.2) |
| WhatsApp Cloud API (Meta) | Variable por volumen. Calculadora: respond.io/whatsapp-pricing-calculator |
| Zapier (si se usa) | Free hasta 100 tareas/mes; tiers desde $20 USD |
| **Total base** | **~$4,800 MXN + Meta + Zapier opcional** |

---

## Lo que Claude puede adelantar desde aquí (sin compu de Iria)

- ✅ Dejar la **spec del HTTP request al Zoho** lista (endpoint, headers, body, mapeo
  de respuesta), una vez confirmado el field name del aseguradora/plan.
- ✅ Generar las **plantillas en formato Meta-ready** para que solo las pegue y someta.
- ✅ Estructurar los **Workflows del conmutador** en una guía paso a paso.
- ✅ Preparar la **knowledge base** consolidada (FAQs reales + corpus + folletos) lista
  para subir.

---

## Pendientes que dependen de Iria

- ⬜ Decidir número (recomendado: nuevo dedicado).
- ⬜ Cuenta + verificación de Meta Business Manager.
- ⬜ Confirmar campo `aseguradora` + `plan` en Zoho CRM (o crearlo).
- ⬜ Folletos en PDF para subir como knowledge.
- ⬜ Tarjeta de presentación (con datos si tiene una más completa que el logo).
- ⬜ 3–5 ejemplos reales de su voz por WhatsApp (pase final de tono).
- ⬜ Seguir capturando FAQs reales en `09` (van 4: hospital, médicos, facturación,
  formatos GMM).
- ⬜ Info básica de autos para FAQs de ese ramo.
