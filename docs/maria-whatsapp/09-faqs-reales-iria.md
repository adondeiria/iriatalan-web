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
- ⬜ Integración **respond.io → Zoho Desk + Zoho Forms** (abrir ticket + autoenviar
  plantilla/form) — vía Zapier/API.

**Videos tutoriales por aseguradora** (cómo llenar los formatos — Iria tiene en YouTube):

| Aseguradora | Video (YouTube) |
| --- | --- |
| AXA | ⬜ pendiente |
| Seguros Monterrey (SMNYL) | ⬜ pendiente |
| MetLife | ⬜ pendiente |
| GNP | ⬜ pendiente |
| Bupa | ⬜ pendiente |
| Allianz | ⬜ pendiente |

> María manda el video correspondiente al carrier del cliente junto con la plantilla,
> para que sepa cómo llenar el formato sin tener que esperar a Ángeles.

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

## 6. "¿Qué deducible tengo?" (GMM, cliente-específico)

**Cómo se contesta (depende de la fuente):**

- **Si el deducible está como campo estructurado en Zoho** (por póliza) → María
  contesta directo: *"Tu deducible registrado es de $X (según tu póliza vigente). El
  detalle completo está en tu carátula. ¿Te la mando?"*
- **Si NO está estructurado en Zoho** → María dispara el flujo de **carátula** (FAQ
  #5): *"El deducible viene en tu carátula. ¿Te la mando?"* → si dice sí, sigue el
  flujo C de FAQ #5 (verificación + envío del PDF).

**Reglas para María:**
- Validar ramo = GMM (autos tiene "deducible" pero es otro concepto; tratar aparte si
  aplica).
- Validar póliza vigente. Si cancelada → escala a Ángeles (mismo patrón FAQ #5).
- 2º factor de identidad antes de mandar **cualquier** dato específico (mismo que
  carátula: email → fallback fecha nac).
- Nunca interpretar ni estimar. Solo citar lo que está en sistema.

**Pendiente:** confirmar si Zoho tiene **deducible** como campo por póliza, o solo
vive en la carátula PDF. Si solo en PDF → ruta única = carátula.

---

## 7. "¿Cuánto cubre mi maternidad?" (GMM, cliente-específico)

**Cómo se contesta:** María primero **evalúa 3 reglas de elegibilidad**; si cumple,
da el monto exacto desde la tabla; si no cumple alguna, explica por qué y escala.

### Reglas de elegibilidad para el beneficio de maternidad

María debe verificar **antes** de dar monto:

1. **Edad:** la asegurada (mujer) debe tener **máximo 44 años**.
2. **Deducible:** **igual o menor a $65,000 MXN**.
3. **Tipo de póliza:** NO aplica en **pólizas de exceso**.

> ⬜ **Confirmar con Iria:** ¿estas 3 reglas aplican a **todos los carriers** o solo
> a algunos? (la del deducible $65k coincide con la matriz SMNYL).

### Flujo

1. Cliente: *"¿Cuánto cubre mi maternidad?"* / *"¿qué suma asegurada tengo de
   maternidad?"*
2. María lookup Zoho + verificación de identidad (2º factor — email/fecha nac).
3. Validar póliza vigente. Si cancelada → escala a Ángeles.
4. **Evaluar las 3 reglas** (edad, deducible, tipo de póliza):
   - Si NO cumple alguna → ver "Cuando no aplica" abajo.
   - Si cumple las 3 → seguir al paso 5.
5. María consulta la **tabla de cobertura de maternidad** según carrier+plan+zona.
6. María responde: *"Tu cobertura de maternidad es de $X (según tu plan
   [carrier+plan]). El periodo de espera estándar es de ~10-12 meses desde la
   contratación. El detalle completo está en tu carátula."*

### Cuando NO aplica (qué dice María)

- **Edad > 44:** *"El beneficio de maternidad aplica para mujeres de hasta 44 años.
  Si quieres ver opciones, te paso con Ángeles."*
- **Deducible > $65,000:** *"El beneficio de maternidad aplica para deducibles de
  hasta $65,000 MXN. Tu deducible está por arriba de ese nivel. Te paso con Ángeles
  para revisar opciones."*
- **Póliza de exceso:** *"Las pólizas de exceso no incluyen beneficio de maternidad.
  Te paso con Ángeles si quieres ver alternativas."*

En los 3 casos, María **escala a Ángeles** con el contexto.

**Tabla de cobertura de maternidad por aseguradora** (Tabulador RIF 25-26):

| Aseguradora | Plan / Variante | Zona | Monto cobertura maternidad |
| --- | --- | --- | --- |
| **GNP** | Línea Azul Premium | — | $62,500 MXN |
| GNP | Línea Azul Platino | — | $54,500 MXN |
| GNP | VIP México | — | 11,000 USD |
| GNP | VIP Extranjero | — | 13,000 USD |
| GNP | Flexible Indigo | — | $48,500 MXN |
| GNP | Flexible Ámbar | — | $39,000 MXN |
| GNP | Flexible Cuarzo | — | $32,500 MXN |
| GNP | Versátil — antigüedad 10-36 meses | — | $25,000 MXN |
| GNP | Versátil — antigüedad 37-48 meses | — | $32,500 MXN |
| GNP | Versátil — antigüedad 49+ meses | — | $41,500 MXN |
| GNP | Internacional | — | 5,000 USD (con deducible nacional como internacional < 5,000 USD) |
| GNP | Personaliza | — | Incluido en plan $20,000; costo adicional a $42,500 / $58,500 / $74,000 |
| GNP | Premier 100 | — | $61,000 MXN |
| GNP | Premier 200 | — | $61,000 MXN |
| GNP | Premier 300 | — | $43,500 MXN |
| GNP | Premier 400 | — | $36,600 MXN |
| **SMNYL** | Pleno (años 1, 2, 3) | CDMX | $60,000 MXN |
| SMNYL | Pleno (años 1, 2, 3) | Otras zonas | $55,500 MXN |
| SMNYL | Íntegro (años 1, 2, 3) | CDMX | $55,000 MXN |
| SMNYL | Íntegro (años 1, 2, 3) | Otras zonas | $45,500 MXN |
| SMNYL | Flex | — | $36,500 MXN |
| **AXA** | Básica | — | $31,000 MXN |
| AXA | Extendida | — | $60,000 MXN |
| **MetLife** | General (10 meses periodo de espera) | — | $74,800 MXN |

> **Allianz no aplica** (no vende GMM con Iria; consistente con regla establecida).
> **Bupa no aparece en este tabulador** — ⬜ Iria me dice cuál es el monto de
> maternidad para Bupa, o si para Bupa la respuesta también va por otra vía.

**Datos que María necesita de Zoho** (para evaluar reglas + tabla):
- Carrier (aseguradora)
- Plan
- Zona (cuando aplica — SMNYL)
- Antigüedad de la póliza (cuando aplica — GNP Versátil)
- **Deducible** (para regla #2)
- Edad de la asegurada (calculada desde fecha de nacimiento)
- **Tipo de póliza** — específicamente si es "de exceso"

Si Zoho NO tiene alguno de estos campos → preguntar al cliente o escalar.

**Reglas YMYL:**
- María cita lo que está en la tabla con disclaimer ("según tu plan registrado").
- Si la póliza tiene módulos especiales o el cliente cuestiona el monto → escalar a
  Ángeles.
- Nunca prometer cobertura más allá del dato citado.

Si el cliente pide detalle de **periodos de espera**, María dispara la FAQ #10
(periodos de espera) aparte.

---

## 8. "¿Cómo funciona el deducible y el coaseguro?" — ⬜ pendiente voz de Iria

Educativa, genérica (no cliente-específica). María contesta con explicación en voz
de Iria + disclaimer *"para el detalle específico de tu plan, lo vemos en tu carátula
o con Ángeles"*.

**Pendiente:** Iria dicta cómo lo explica con sus palabras (la del sitio no es voz
canónica).

---

## 9. "¿Cómo me doy de alta en el portal del cliente?" (cross-carrier)

**Cómo se contesta:** María identifica el carrier del cliente (lookup Zoho) y manda
el **link de la app/portal + los pasos** de esa aseguradora. Mismo patrón que la FAQ
del hospital y la de facturación.

**Regla para María:**
- Identifica carrier (Zoho). Si no aplica/no es cliente → pregunta cuál.
- Manda link del portal/app + breves pasos del registro de esa aseguradora.
- Si el carrier es Bupa (sin self-service para facturas) → ver si también aquí es vía
  equipo o sí tiene portal. **Confirmar con Iria.**

**Portales/apps de cliente por aseguradora:**

| Aseguradora | Portal / App | Pasos (resumen) |
| --- | --- | --- |
| AXA | ⬜ pendiente — Iria lo pasa | ⬜ |
| Seguros Monterrey (SMNYL) | ⬜ pendiente | ⬜ |
| MetLife | ⬜ pendiente | ⬜ |
| GNP | ⬜ pendiente | ⬜ |
| Bupa | ⬜ pendiente | ⬜ |
| Allianz | ⬜ pendiente | ⬜ |

---

## 10. "¿Cuáles son los periodos de espera?" (GMM, cross-coverage)

**Cómo se contesta:** María manda el **PDF de periodos de espera** (Iria lo pasa)
como respuesta al cliente. Aplica a maternidad, preexistencias, dental, mental, etc.

**Pendientes:**
- ⬜ Iria me pasa el PDF (o los PDFs).
- ❓ **¿Es un solo PDF general** que sirve para todas las aseguradoras, **o uno
  por carrier**? Si es por carrier, María identifica el carrier (lookup Zoho) y manda
  el correcto.
- ❓ ¿María dice algo además del PDF, o solo lo manda? (ej. *"Aquí están los periodos
  de espera de tu plan. Si tienes una duda específica, te paso con Ángeles."*)

---

<!-- Próximas FAQs van aquí, mismo formato. -->
