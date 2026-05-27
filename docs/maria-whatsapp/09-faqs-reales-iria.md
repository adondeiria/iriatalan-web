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

<!-- Próximas FAQs van aquí, mismo formato. -->
