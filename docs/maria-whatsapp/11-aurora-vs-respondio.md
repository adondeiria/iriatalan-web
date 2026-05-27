# Aurora Inbox vs respond.io — comparación para María

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
