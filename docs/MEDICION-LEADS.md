# Medición de leads — Pipedrive + GA4

Cómo llegan los leads del sitio y qué tienes que configurar tú.
Última actualización: 2026-07-23 (Día 3 del plan de conversión).

---

## 1. Cómo funciona hoy

Los **5 formularios** del sitio (contacto, guía, check-up, checklist, calculadora)
envían al mismo endpoint: `/api/contact`. Ese endpoint escribe en **dos destinos
en paralelo**:

| Destino | Qué crea | Cuándo actúa |
|---|---|---|
| **Pipedrive** | Persona + **Trato en el embudo "Leads RS / Webpage"** (primera etapa) + Nota con el detalle | Solo si existe `PIPEDRIVE_API_TOKEN` |
| **Zoho Forms** | El registro de siempre | Siempre, salvo que pongas `PIPEDRIVE_ONLY=true` |

Los leads del sitio **nunca** entran a tus embudos de prospectos propios. Si el
embudo "Leads RS / Webpage" no existe o le cambias el nombre, el lead **no** se
mete en un embudo cualquiera: cae en la **Leads Inbox** (que está fuera de todos
los embudos) y el fallo queda en los logs de Vercel. Si renombras el embudo,
actualiza la variable `PIPEDRIVE_PIPELINE` en Vercel con el nombre nuevo.

**Basta que uno funcione** para que el visitante vea "gracias". Si uno falla, el
lead igual se guarda en el otro y el fallo queda en los logs de Vercel. Solo si
fallan los dos el visitante ve un error, y lo manda a WhatsApp.

Cada lead trae su **página de origen** y **de qué red social vino**:
- En Pipedrive: en el título del trato (`Ana López — GMM (instagram)`) y
  desglosado en la nota: página, red social, campaña, medio.
- En Zoho: etiqueta al final del mensaje, ej.
  `[Origen: /gmm · Vino de: instagram · Campaña: gmm-julio]`.

## 1.1 Cómo saber qué red social te trae clientes

Para que el lead diga "instagram" en vez de "sitio web", el link que publicas
tiene que llevar una etiqueta al final. Es solo pegar esto después de la URL:

| Dónde publicas | Link que usas |
|---|---|
| Instagram (bio o story) | `https://iriatalan.com.mx/gmm?utm_source=instagram` |
| Facebook | `https://iriatalan.com.mx/gmm?utm_source=facebook` |
| LinkedIn | `https://iriatalan.com.mx/retiro?utm_source=linkedin` |
| WhatsApp / difusión | `https://iriatalan.com.mx/?utm_source=whatsapp` |

Si además quieres separar una campaña concreta, agrega `&utm_campaign=`:
`https://iriatalan.com.mx/gmm?utm_source=instagram&utm_campaign=julio-gmm`

Funciona aunque la persona entre por una página y llene el formulario en otra:
la procedencia se guarda al aterrizar y se manda al enviar. Se queda con la
**primera** — si llegó por Instagram, eso vale aunque después pase por Google.

Si no usas etiqueta, el lead igual llega; solo dirá "sitio web".

---

## 2. Lo que tienes que hacer tú

### a) Token de Pipedrive (10 min) — **sin esto Pipedrive no recibe nada**

> El token es una llave de tu CRM. **No me lo pases por chat ni por WhatsApp.**
> Lo pegas tú directo en Vercel; yo nunca necesito verlo.

1. En Pipedrive: foto de perfil (arriba a la derecha) → **Preferencias personales**
   → pestaña **API** → copia tu *personal API token*.
2. En Vercel: proyecto `iriatalan-web` → **Settings** → **Environment Variables**.
3. Agrega, marcando los tres entornos (Production, Preview, Development):

   | Name | Value |
   |---|---|
   | `PIPEDRIVE_API_TOKEN` | *(el token que copiaste)* |

4. **Redeploy** el proyecto (Deployments → el último → ⋯ → Redeploy). Las
   variables solo entran con un deploy nuevo.
5. Prueba: llena el form de `/contacto` con tus datos reales y confirma que
   aparece en **Leads → Leads Inbox** de Pipedrive, con la nota y el origen.

### b) Eventos clave en GA4 (10 min)

Los eventos ya se disparan solos desde el sitio. Solo falta decirle a GA4 que
son importantes, para que aparezcan como conversiones.

1. Entra a **analytics.google.com** → tu propiedad → engrane **Administrar**
   (abajo a la izquierda).
2. Columna *Propiedad* → **Eventos clave** (antes se llamaban "Conversiones").
3. Botón **Nuevo evento clave** y escribe el nombre **exacto**:
   - `generate_lead` — alguien mandó cualquiera de los 5 formularios.
   - `whatsapp_click` — alguien abrió WhatsApp desde el sitio.
4. Listo. A partir de ahí GA4 los cuenta como conversiones.

> **Ojo:** si un evento no aparece todavía en la lista, es porque GA4 aún no lo
> ha visto. Créalo igual con el botón "Nuevo evento clave" escribiendo el nombre
> a mano — funciona aunque no haya datos previos.

**Para verlo en vivo:** Informes → **Tiempo real**, abre el sitio en tu celular,
manda un formulario y checa que aparezca `generate_lead`.

⚠️ Los eventos solo se disparan si el visitante **acepta las cookies** (banner
del sitio). Quien rechaza no se mide — es correcto y es lo que exige la ley.

### Cómo distinguir de dónde vino cada lead en GA4

Cada formulario manda un `method` distinto:

| Formulario | `method` |
|---|---|
| /contacto | `form_contacto` |
| /guia | `form_guia` |
| Check-up beneficiarios | `form_checkup_beneficiarios` |
| Checklist discapacidad | `form_checklist_discapacidad` |
| Calculadora educacional | `form_calculadora_educacional` |

---

## 3. Cuando confirmes que Pipedrive recibe bien

Deja unos días los dos CRMs en paralelo. Cuando estés segura, **apaga Zoho sin
tocar código**: en Vercel agrega la variable

| Name | Value |
|---|---|
| `PIPEDRIVE_ONLY` | `true` |

y redeploy. Si algún día quieres volver a prender Zoho, borra esa variable.

---

## 4. Revisión semanal (5 min, los lunes)

1. **Pipedrive → Leads Inbox**: ¿cuántos leads nuevos y de qué páginas? El campo
   *Origen* de la nota te dice qué página está trabajando.
2. **GA4 → Eventos clave**: `generate_lead` y `whatsapp_click` de la semana.
3. Si `whatsapp_click` es mucho más alto que `generate_lead`, la gente prefiere
   WhatsApp: vale la pena subir ese botón en las páginas que más convierten.

---

## 5. Variables de entorno (referencia)

| Variable | Obligatoria | Para qué |
|---|---|---|
| `PIPEDRIVE_API_TOKEN` | Para usar Pipedrive | Llave de la API. Sin ella, solo Zoho. |
| `PIPEDRIVE_PIPELINE` | No | Nombre del embudo destino. Por defecto `Leads RS / Webpage`. Cámbiala si renombras el embudo. |
| `PIPEDRIVE_ONLY` | No | `true` apaga el envío a Zoho. |
| `PIPEDRIVE_API_BASE` | No | Solo si Pipedrive pide tu dominio propio. Por defecto `https://api.pipedrive.com`. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Para medir | ID de GA4. Hoy: `G-QH6EXPX2ET`. |

---

## 6. Pendiente: propiedad de GA4

La analítica que funciona (`G-QH6EXPX2ET`) está en la cuenta personal
**adondeiria@gmail.com**. La cuenta de empresa **iriatalanrif@gmail.com** tiene
otra propiedad (`G-FW818YJR6Z`) que nunca ha recibido datos.

Decidido: **trasladar** la propiedad buena a la cuenta de empresa (conserva el
historial y no requiere tocar el código). Pasos:

1. Desde `iriatalanrif@gmail.com`: Administrar → *Gestión de accesos a la
   cuenta* → **+** → añadir `adondeiria@gmail.com` como **Administrador**.
2. Desde `adondeiria@gmail.com`: Administrar → *Detalles de la propiedad* →
   **Mover propiedad** → destino = la cuenta de la empresa → dejar
   **"Conservar los permisos"** → confirmar.

Los eventos clave (`generate_lead`, `whatsapp_click`) se marcan **después** del
traslado, y solo una vez que hayan disparado al menos una vez en producción:
GA4 no deja marcar como clave un evento que nunca ha visto.
