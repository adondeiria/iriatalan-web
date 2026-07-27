# Línea base de citación por IA

> **Para qué sirve este archivo.** Es el "antes". Sin él, nada de lo que se haga
> en las Fases 4-5 se puede evaluar: subir tráfico no prueba que la IA te cite, y
> la sensación de "creo que ya salgo más" no es un dato. Se repite **mensual**,
> con las mismas queries y el mismo método, y se compara contra esta tabla.

## Método

- **Motor medido aquí:** Perplexity, sin sesión iniciada (respuestas no
  personalizadas — importante: con sesión, el historial contamina el resultado).
- **Qué se registra por query:** (1) si aparece `iriatalan.com.mx` entre las
  fuentes citadas, (2) si el texto nombra a "Iria Talan", (3) qué dominios sí
  aparecen.
- **Por qué esas dos columnas y no una:** son las dos mitades del objetivo.
  *Citada* = su URL aparece como fuente. *Recomendada* = el modelo dice su
  nombre. Se puede tener una sin la otra, y la segunda es la que trae clientes.

⚠️ **Repetir sin sesión iniciada y sin personalización.** Si se mide logueada,
la medición del mes que viene no será comparable con esta.

---

## Medición 1 — 2026-07-27 (Perplexity)

### Resultado global: **0 de 8**

Ni una sola cita. Ni una sola mención por nombre.

| # | Query | ¿Citada? | ¿La nombra? | Quién sí aparece |
|---|---|---|---|---|
| 1 | ¿qué seguro de GMM cubre mejor la maternidad en México? | ❌ | ❌ | angymarquez.com · donna.mx · gastosmedicos.mx |
| 2 | mejor seguro de gastos médicos mayores en México 2026 | ❌ | ❌ | segurointeligente.mx |
| 3 | cuánto cuesta un seguro de gastos médicos mayores en México | ❌ | ❌ | bbva.mx |
| 4 | qué es el deducible y el coaseguro en un seguro de gastos médicos | ❌ | ❌ | internationalstudentinsurance.com |
| 5 | seguro de vida temporal o permanente, cuál conviene (México) | ❌ | ❌ | segurosmexico.mx · miseguroaqui.com · seguratufuturo.com |
| 6 | cómo calcular la suma asegurada de mi seguro de vida (México) | ❌ | ❌ | zenpoliza.com |
| 7 | por qué subió tanto mi seguro de gastos médicos en la renovación | ❌ | ❌ | aseguratemexico.com |
| 8 | conviene la modalidad 40 del IMSS | ❌ | ❌ | youtube.com · segurosmexico.mx |

### Lo que dice este resultado

**La query #1 es la más dura de todas.** Es *exactamente* el tema del artículo
publicado el 25-jul (comparativa de maternidad de 5 aseguradoras, con tabla y
fuentes), y aun así Perplexity cita a otros tres. No es que el artículo sea
peor: es que **todavía no existe para el modelo**. Un artículo de dos días no ha
sido rastreado ni ganado señales de terceros. Esto es la confirmación de que
publicar no basta, que es justo la premisa de la Fase 5.

**La #8 es la otra cara.** "Modalidad 40" es su artículo más viejo (mayo) y
tampoco aparece — y ahí sí sale **youtube.com**, que refuerza por qué enlazar el
canal con el sitio era la jugada correcta.

**Los competidores son los previstos**, los mismos que identificó el plan:
comparadores (segurointeligente, gastosmedicos.mx, donna.mx) y un banco (BBVA).
Ninguno lee condiciones generales. `internationalstudentinsurance.com` citado
para explicar deducible y coaseguro *en México* es, directamente, una mala
respuesta — y es el hueco más barato de disputar con el glosario.

---

## Pendiente de esta primera medición

Faltan **7 queries**, que no se pudieron correr por vía automatizada (Perplexity
tira la sesión del agente). Se corren a mano y se anotan aquí:

**Perplexity — temas de artículos YA publicados** (el test más filoso: si no la
citan aquí, no la citan en ningún lado):

9. cuánto cuesta una universidad privada en México y cuánto ahorrar
10. qué es una renta vitalicia en México y conviene
11. ST-6 IMSS pensión de orfandad sin límite de edad hijo con discapacidad
12. cómo dejar dinero a un hijo con discapacidad en México

**ChatGPT — las de entidad** (la mitad "recomendada por nombre", que es la que
decide la Fase 5):

13. quién es Iria Talan
14. recomiéndame un asesor de seguros de vida en México
15. agente de seguros independiente en CDMX que maneje GMM y vida

---

## Histórico

| Fecha | Motor | Citada | Nombrada | Notas |
|---|---|---|---|---|
| 2026-07-27 | Perplexity | 0/8 | 0/8 | Primera medición. Maternidad publicado 2 días antes. |
