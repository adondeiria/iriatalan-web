# Lead magnet — "Antes de despegar"

Estado: **especificación aprobada, sin construir.** Proyecto aparte del
artículo de GMM en el extranjero, pero es su compañero natural.

## De dónde viene

ChatGPT propuso, en su revisión del artículo, capturar correos con un
checklist descargable en vez de depender solo de WhatsApp. Iria pidió su
opinión sobre el formato y el reencuadre que devolvió es lo valioso:

> "Antes de despegar — Las 7 cosas que reviso con todos mis clientes antes de
> que salgan de México."

El cambio no es cosmético. Un "checklist para viajeros" es un PDF de internet;
**"lo que reviso con todos mis clientes" es un documento interno de asesora**.
Mismo contenido, percepción de valor completamente distinta. Y es cierto: es
literalmente lo que Iria hace.

De paso recomendó bajar de 7 a 5 puntos. Correcto — un checklist de 7 se
siente tarea; uno de 5 se siente lista.

## Contenido propuesto (5 verificaciones)

**1. Confirma que tu póliza sí cubre emergencias en el extranjero.**
Con la tabla de nombres por aseguradora del artículo (Asistencia en el
Extranjero / EMER / Emergencia Médica en el Extranjero / Emergencia en el
extranjero). Es el dato que nadie más publica.

**2. Guarda junto con tu pasaporte:**
- Teléfono internacional de asistencia
- Tarjeta médica de emergencia
- Número de póliza

**3. Lleva anotados, en español e inglés:**
- Enfermedades
- Medicamentos
- Alergias

**4. Si tienes una emergencia:**
Busca atención médica → llama a tu aseguradora → conserva toda la
documentación. (Va como diagrama sencillo de 3 pasos.)

**5. ¿No estás segura?**
Envíame tu carátula y reviso contigo la cobertura antes de que viajes.

## Notas de ejecución (para cuando se construya)

- **Reusar la infraestructura de `/guia`**, que ya tiene el patrón completo:
  `GuiaLeadForm` + PDF servido desde `/public/descargas/` + gate. No hay que
  inventar nada, solo clonar el flujo.
- El punto 5 es el CTA, y encaja con la mecánica que Iria ya usa (mandar
  carátula por WhatsApp). El PDF captura el correo; el CTA abre la
  conversación. Dos canales, no uno.
- **Verificar antes de publicar** que el punto 1 siga alineado con lo que dice
  el artículo — si cambia una condición general, cambian los dos.
- El punto 3 (enfermedades/medicamentos/alergias en inglés) NO sale de las
  condiciones generales: es consejo práctico de Iria. No presentarlo como
  requisito contractual.
- Título del archivo sugerido: `antes-de-despegar-5-verificaciones.pdf`.

## Por qué vale la pena

El artículo de GMM en el extranjero va a atraer tráfico de intención alta
("¿mi seguro me cubre en el extranjero?"). Hoy ese tráfico solo tiene salida
por WhatsApp, que es un canal de alta fricción para quien apenas está
investigando. Un PDF a cambio del correo captura al que todavía no quiere
hablar con nadie — y ese es justo el lector que está a semanas de viajar.
