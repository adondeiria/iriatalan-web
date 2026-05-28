# Aurora Inbox vs respond.io — comparación (decisión: respond.io)

> ✅ **Decisión final (may-2026):** respond.io Advanced. Plan de setup en `12`.
> Este doc conserva la comparación que llevó a esa decisión.

> Lo que detonó esta comparación: el **lookup en vivo** (que María ya sepa la
> aseguradora/plan del cliente desde Zoho). Aurora NO lo hace; respond.io SÍ, pero con
> condiciones de plan y setup. Aquí el detalle honesto (verificado may-2026).

## Lo confirmado

- **Aurora:** la IA **no** lee otro CRM en vivo — solo crea/cambia registros (técnico
  de Aurora). Fallback: María **pregunta** la aseguradora.
- **respond.io:** la IA **sí** puede llamar APIs externas a mitad de chat
  ("AI Agent: Make HTTP requests") → consulta Zoho por teléfono, trae aseguradora/plan
  y responde natural. **PERO:**
  - Solo se puede **publicar en el plan Advanced ($279 USD/mo)** (en otros se prueba,
    no se publica).
  - Requiere **setup técnico**: configurar el HTTP request a la API de Zoho (endpoint,
    token/auth, variables). No es no-code → necesita dev.

## ❓ Workaround Aurora a confirmar (puede cambiar el cuadro)

En lugar de que la IA de Aurora "lea Zoho en vivo", **sincronizar Zoho → Aurora**
vía Zapier para que `aseguradora` y `plan` vivan como **campos custom del contacto en
Aurora**. La IA de Aurora normalmente sí puede usar campos nativos del contacto en sus
respuestas. → Pregunta #7 al vendedor (checklist `04`).

- Si Aurora confirma **SÍ** → "María ya sabe" se logra sin pagar respond.io Advanced
  ni meter dev. **Aurora vuelve a ser la mejor opción.**
- Si confirma **NO** → respond.io Advanced sigue siendo el único camino al lookup.

Sync no es 100% real-time pero Zapier corre casi al instante; suficiente para
postventa.

## Lo que respond.io sí cubre de tu lista (confirmado)

| Capacidad | respond.io | Plan |
| --- | --- | --- |
| Conmutador (menú, triage, ruteo) | ✅ Workflows | Growth |
| Contestar a leads (greeting/calificar) | ✅ AI Agent | Growth |
| Respuestas rápidas / snippets siniestros | ✅ Snippets + AI | Growth |
| Automatizaciones por intención | ✅ Workflows | Growth |
| Tickets en Zoho Desk | ✅ Zapier (Growth) o HTTP (Advanced) | Growth / Advanced |
| Subir folletos como conocimiento | ✅ AI Knowledge Sources | Growth |
| Enviar folletos/archivos al cliente | ✅ | todos |
| Lookup en vivo (María ya sabe) | ✅ HTTP requests | **Advanced** |
| Multiagente equipo de 5 | ✅ 10 usuarios incl. | Growth |

## Costo real con equipo de 5 (corregido may-2026)

| | Aurora IA Plus | respond.io Advanced |
| --- | --- | --- |
| Plan base | $4,000 MXN | $279 USD (~$4,800 MXN @ 17.2) |
| Usuarios incluidos | 3 (faltan 2) | 10 |
| Extras de usuario | +$240 × 2 = **$480** | $0 |
| **Total mensual** | **$4,480 MXN** | **~$4,800 MXN** |
| **Diferencia anual** | — | **+$3,840 MXN/año** |

A 5 usuarios, la diferencia se reduce a ~$320/mes. Esto debilita el argumento de
costo que se tenía cuando se comparaba solo "$3,200 vs $4,800".

**Otras dimensiones donde respond.io tiene ventaja en esta math:**
- **IA sin límites** (fair use) vs Aurora IA Plus limitado a 20,000 respuestas/mes.
- **+5 usuarios de cabeza** para crecer sin tarifa adicional.

**Setup técnico del lookup (corregido):** OAuth a Zoho desde respond.io ~2–4 hrs de
dev (~$1–4k MXN one-time). En este proyecto, Iria tiene a Claude con acceso a Zoho
configurado → costo dev efectivo cercano a cero.

## Tabla

| Dimensión | Aurora Inbox | respond.io |
| --- | --- | --- |
| **Lookup en vivo** (María ya sabe) | ❌ No | ✅ Sí — **solo plan Advanced** |
| WhatsApp Cloud API oficial | ✅ | ✅ (Meta Business Partner) |
| Precio plataforma | $1,800–4,000 MXN/mo | Growth $159 / **Advanced $279 USD/mo** (~$2.7k–4.8k MXN) |
| Costo Meta (conversaciones) | aparte | aparte (igual) |
| IA incluida | límite de "respuestas IA" por plan | incluida sin costo extra (fair use) |
| Usuarios (equipo de 5) | 3 incluidos (+$240 MXN c/u) | 10 incluidos (Growth/Advanced) |
| Pipedrive / Zoho (empujar registros) | vía Zapier | vía Zapier (igual) |
| Idioma / soporte | español, MX, local, red de promotor Allianz | inglés (IA habla español), global, 24/7, onboarding 28 días |
| Setup del lookup | n/a | técnico (API Zoho + auth) → necesita dev |
| Madurez | PyME LATAM | maduro, ISO 27001, G2 4.8 |
| Prueba gratis | sí | 7 días (features de Growth) |

## Lectura

- Si **quieres el lookup**, la única config que lo da es **respond.io Advanced
  ($279 USD/mo ≈ $4,800 MXN)** + setup técnico. respond.io **Growth ($159) NO trae
  lookup** → sería "un Aurora más caro, en USD y sin soporte local".
- Si el fallback (**María pregunta** la aseguradora, como Iria hoy) es aceptable →
  **Aurora** gana en precio, español, soporte local y red de pares.

## Lo que NO cambia entre las dos

- Ambas usan WhatsApp **Cloud API** + **número dedicado** + pagan **Meta** por
  conversación aparte.
- Pipedrive y Zoho (empujar leads/tickets) van por **Zapier** en las dos.
- La prospección (saludo, calificar, crear lead, alertar a Iria) y la postventa
  básica funcionan en ambas.

## Recomendación (a discutir con Iria)

El lookup es un **"wow" de postventa**, no el corazón del negocio (la prospección —el
dinero— no depende de él). Dado que es **+costo en USD (Advanced)** y **+setup técnico**:

- **Opción pragmática:** arrancar con **Aurora v1** (rápido, barato, local, con el
  fallback de preguntar) y dejar **respond.io Advanced** como upgrade si el
  auto-contexto resulta un dolor real.
- **Opción "todo o nada":** si el lookup es prioridad innegociable, ir directo a
  **respond.io Advanced** asumiendo costo USD + un dev para el setup de la API.

Decisión de Iria. (Ambas tienen prueba gratis para validar antes de pagar.)
