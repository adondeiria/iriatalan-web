# FAQs reales de Iria — voz canónica + reglas de comportamiento

> Estas son las FAQs **contestadas por Iria con sus palabras** (no las del sitio).
> Son la **fuente de verdad para la voz de María** y, donde hay proceso, definen
> **cómo se comporta** el bot (no solo qué dice).
> Mandan sobre `03-faqs-entrenamiento.md` (que es contenido correcto pero no su voz).

## Formato

Por cada FAQ:
- **Pregunta** — tal como la hace el cliente.
- **Cómo la contesta Iria** — su respuesta real, con sus palabras.
- **Regla para María** — el comportamiento que se deriva (a quién pregunta, a qué
  fuente remite, cuándo escala). Solo cuando aplica.

---

## 1. ¿En qué hospital me puedo atender?

**Cómo la contesta Iria:**
> Primero reviso qué aseguradora y plan tiene contratado, y le doy la lista de
> hospitales del portal de la aseguradora.

**Regla para María:**
- NO dar una lista genérica de hospitales.
- **Cliente existente:** usar la aseguradora + plan (del lookup de Zoho CRM) y remitir
  a la **lista del portal oficial de esa aseguradora**.
- **Prospecto / sin dato:** preguntar qué aseguradora y plan tiene, o explicar que la
  red de hospitales depende de cada aseguradora y plan.
- Nunca inventar coberturas de red.
- **GMM se vende con 5 carriers: AXA, SMNYL, MetLife, GNP, Bupa.** Allianz **NO**
  ofrece GMM con Iria (Allianz es para Vida/ahorro). Si preguntan GMM con Allianz,
  María aclara que no maneja GMM con esa aseguradora.

**Directorios médicos oficiales por aseguradora** (link que da María según el carrier):

| Aseguradora | Directorio médico |
| --- | --- |
| AXA | https://axa.mx/servicios/buscador-de-servicios |
| Seguros Monterrey (SMNYL) | https://www.mnyl.com.mx/medical-directory-search.aspx |
| MetLife | https://www.metlife.com.mx/tramites-y-servicios/directorio-medico/ |
| GNP | https://www.gnp.com.mx/directorio-proveedores-medicos |
| Bupa | https://www.bupasalud.com/red-de-salud |

> Lista completa para GMM (5 carriers). Allianz no aplica para GMM.
>
> Nota SMNYL: el link que pasó Iria traía parámetros de un plan específico
> (`?plan=5&associatedplan=11`). Aquí se dejó el buscador base; si la red depende del
> plan, María debe indicar al cliente filtrar por su plan en el portal.

---

## 2. ¿Qué médicos de convenio / doctores cubre mi seguro?

**Cómo la contesta Iria:**
> Están en las mismas ligas (los directorios por aseguradora de la FAQ 1), pero hay
> que darle clic en otros parámetros — filtrar por médicos/especialidad, no por
> hospital.

**Regla para María:**
- Usar la **misma tabla de directorios** de la FAQ #1 (link según el carrier del
  cliente, que viene del lookup de Zoho).
- Indicar al cliente que dentro del portal elija la opción de **médicos /
  especialistas** (no "hospitales") y filtre por **plan, ciudad y especialidad**.
- **v1:** María manda el **link + las instrucciones de filtro**. NO intenta navegar
  el portal ni enviar una lista "scrapeada" (ver nota de diseño abajo).

**Caso Seguros Monterrey (SMNYL) — 2 escenarios de médicos de convenio:**
1. **Médicos de convenio (general):** sí **cobran** la consulta al cliente, pero a
   **tarifa especial** ajustada al **tabulador** de la aseguradora.
2. **Médicos a tu lado:** **NO cobran** la consulta al cliente. Son de **ciertas
   especialidades** (no todas). Directorio:
   https://www.mnyl.com.mx/seguros-individuales/medicos-a-tu-lado/medicos-a-tu-lado.aspx

María debe distinguir ambos al explicar la red de SMNYL (no es "todos gratis": solo
los de **Médicos a tu lado** no cobran consulta; el resto del convenio cobra tarifa de
tabulador).

> ⚠️ **"Médicos a tu lado" es EXCLUSIVO de Seguros Monterrey.** Ningún otro carrier
> (AXA, GNP, MetLife, Bupa, Allianz) tiene médicos sin costo de consulta. María NO debe
> ofrecer este beneficio para otras aseguradoras.

> **Nota de diseño — ¿María puede mandar la lista exacta ya filtrada?**
> No en v1. Aurora responde de su conocimiento + consultas a APIs conectadas (como
> Zoho); **no navega portales externos** (formularios/filtros/login) de forma nativa.
> Además, una lista "scrapeada" puede quedar **desactualizada** → riesgo YMYL de dar
> red incorrecta al cliente. El portal oficial es la fuente viva. **A futuro** solo
> sería viable si un carrier ofrece **API oficial** de su directorio (function calling).

---

## 3. ¿Dónde descargo / consulto mi factura o recibo?

**Cómo la contesta Iria:**
> Le doy el link de facturación de su aseguradora para que la descargue ahí.

**Regla para María:**
- Igual que la FAQ del hospital: identifica el **carrier del cliente** (lookup de Zoho)
  y le da el **link de facturación correcto** de la tabla.
- Si es prospecto o no hay dato, pregunta con qué aseguradora está.

**Portales de facturación por aseguradora:**

| Aseguradora | Portal de facturación | Tutorial (video) |
| --- | --- | --- |
| AXA | https://axa.mx/web/my-axa/consultar-facturacion | — |
| Seguros Monterrey (SMNYL) | https://www.smnyl-clientes.com.mx/SMNYL.POR.PortalFacturacion.SitioWeb/Paginas/CapturaPolizaForm.aspx | — |
| MetLife | https://www.metlife.com.mx/tramites-y-servicios/facturacion/ | — (existe también pág. CFDI: metlife.com.mx/servicios/cfdi/) |
| GNP | https://soycliente.gnp.com.mx/portalsoycliente/ | https://www.youtube.com/watch?v=ujTmHXvZ57k |
| Bupa | **Sin self-service** — María NO da link: dice *"te la conseguimos y te la mandamos"* y **redirige a Ángeles** (GMM), que la consigue y envía. | — |
| Allianz | https://clientes.allianz.com.mx | https://www.youtube.com/watch?v=SJIW7VAAsYU |

---

## 4. Postventa GMM automatizable: siniestros, reembolso, cirugía, maternidad

**Alcance:** toda esta familia de trámites GMM es automatizable con el **mismo patrón**,
porque sus **plantillas/mails ya viven en Zoho Desk** y sus **formularios en Zoho Forms**:
- Reembolso
- Programación de cirugía
- Siniestros (en general)
- Maternidad

**Hoy (manual):** Ángeles crea el ticket y manda la plantilla/formulario. (Para
reembolso y cirugía es **una sola plantilla**.)

**Objetivo (automatizado con María):**
1. Detecta el **tipo de trámite** (reembolso, cirugía, siniestro, maternidad).
2. Identifica el **carrier** del cliente (lookup de Zoho).
3. **Abre el ticket en Zoho Desk** (vía Aurora → Zapier/API) **asignado a Ángeles**,
   con: cliente, carrier, tipo de trámite y póliza.
4. **Zoho envía la plantilla / el Zoho Form** correspondiente (ya existen ✅).
5. **Ángeles solo da seguimiento** (ya no lo arma a mano).
6. Avisa al cliente que Ángeles le da seguimiento.

**Límites (YMYL):** María SOLO dispara el ticket / la plantilla / el formulario.
**No llena** el formato, **no promete** reembolso, autorización ni cobertura. Eso lo
ve Ángeles.

**Pendientes para automatizar:**
- ✅ Plantillas/formularios ya existen en **Zoho Desk** (mails) y **Zoho Forms**
  (formularios) para siniestros, reembolso, cirugía y maternidad.
- ⬜ Integración **Aurora → Zoho Desk + Zoho Forms** (abrir ticket + autoenviar
  plantilla/form) — confirmar con vendedor (pregunta #5) + armar vía Zapier/API.

---

## 5. Cliente pide su carátula / tarjeta (credencial)

**Alcance por ramo:**
- **GMM y Autos vigentes** → María **busca el PDF en SharePoint** y lo manda directo.
- **Vida y Ahorro (cualquier estado)** → María **abre ticket en Zoho Desk asignado a
  Violeta** (jefa de Vida) → Violeta lo manda **por email**, no por WhatsApp.
- **Cancelada** (GMM/Autos) → María: *"Lo siento, no encuentro un plan activo a tu
  nombre"* → **escala** a Ángeles (si era GMM) o Eliseo (si era Autos).

**Verificación de identidad (siempre, antes de mandar o crear ticket):**
1. Phone match: el número de WhatsApp del cliente debe coincidir con el de Zoho.
2. Segundo factor en cascada: María pide **email registrado** primero; si el cliente
   *"no me lo acuerdo"* → fallback a **fecha de nacimiento**. Ambos verificados contra
   Zoho. Si ninguno coincide → escalar como caso sospechoso.

---

### Flujo A — GMM/Autos vigente

1. Cliente: *"¿me mandas mi carátula / tarjeta?"*
2. María lookup Zoho por teléfono → trae nombre, póliza(s), ramo, estado, email,
   fecha nac.
3. Validar: ramo ∈ {GMM, Autos} y estado = vigente. Si no, ir a la rama
   correspondiente.
4. María: *"Para confirmar, ¿me das tu email registrado con nosotros?"* (cascada).
5. Match OK → María busca en SharePoint:
   - Carátula: nombre del archivo contiene **`CARATULA`** + **número de póliza**.
   - Tarjeta: nombre del archivo contiene **`CREDENCIAL`** + **número de póliza**.
6. **Una sola póliza GMM/Autos vigente** → manda el PDF al WhatsApp.
7. **Varias pólizas** → *"Tienes póliza de [ramo+carrier+ID] y [ramo+carrier+ID].
   ¿Cuál necesitas?"* → busca la elegida → manda.

### Flujo B — Vida o Ahorro (cualquier estado)

1. Cliente: *"¿me mandas mi póliza de vida / ahorro?"*
2. María lookup Zoho + verificación de identidad (mismo 2º factor).
3. María: *"Claro, esa te llega por email — te la prepara Violeta. ¿Me confirmas que
   tu email es el que tenemos registrado?"*
4. Abre **ticket en Zoho Desk asignado a Violeta** con: cliente, póliza, email destino,
   tipo de solicitud (carátula vida / ahorro).
5. María: *"Listo, ya está en marcha. Violeta te la manda por email."*

### Flujo C — Póliza cancelada (GMM/Autos)

1. María detecta estado = cancelada en Zoho.
2. María: *"Lo siento, no encuentro un plan activo a tu nombre."*
3. **Escala** a Ángeles (si era GMM) o Eliseo (si era Autos), con contexto.

---

**Reglas YMYL (críticas):**
- **Nunca** mandar a un número que no pase phone match + 2º factor.
- **Nunca** mandar carátula de Vida/Ahorro directo por WhatsApp — siempre por email
  vía Violeta.
- **Nunca** mandar nada de una póliza cancelada — solo escalar.
- Cada envío exitoso queda registrado (audit log).

**Spec técnica respond.io (para `12-setup-respondio.md`):**
- HTTP request 1 → Zoho CRM Contacts (search by `Mobile`).
- HTTP request 2 → Microsoft Graph SharePoint search (`/sites/{site}/drive/search`)
  por filename con `CARATULA [policy#]` o `CREDENCIAL [policy#]`.
- Workflow action → enviar PDF como media en WhatsApp.
- Zapier o HTTP → crear ticket Zoho Desk para flujo B (Vida/Ahorro).

---

<!-- Próximas FAQs van aquí, mismo formato. -->
