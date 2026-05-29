# Automatización — Correo mensual de renovaciones (Zoho CRM)

> Estado: **borrador listo para implementar** (pendiente pegar y programar en Zoho).
> Última actualización: 2026-05-29.

## Objetivo

El **día 15 de cada mes**, Zoho CRM envía **2 correos** (uno por ramo) con las
pólizas que vencen durante el **mes calendario que cae 2 meses adelante**:

| Correo | Tipo (`Tipo_de_poliza`) | Destinatarios |
|--------|--------------------------|---------------|
| Renovaciones **GMM** | `GMM` | `operaciones@talan.com.mx`, `operaciones2@talan.com.mx`, `clientes@talan.com.mx`, `iria@talan.com.mx` |
| Renovaciones **Autos** | `AUTO` | `vida@talan.com.mx`, `clientes@talan.com.mx`, `iria@talan.com.mx` |

Ejemplo: la corrida del **15 de junio** lista todo lo que vence en **agosto**
(1 al 31 de agosto). La del 15 de julio → septiembre completo. Cada póliza
aparece una sola vez (sin traslape entre meses).

## Modelo de datos (verificado en vivo el 2026-05-29)

- **Módulo**: `Polizas` (módulo personalizado).
- **Tipo**: `Tipo_de_poliza` → valores `GMM` y `AUTO`.
- **Fecha de renovación**: `Fecha_de_finalizaci_n_de_vigencia` (formato `yyyy-MM-dd`).
- **Estatus**: `Estatus` → filtramos `VIGENTE` (las ya renovadas pasan a `RENOVADA`).
- **Datos mostrados**: `Name` (no. de póliza), `Asegurado_1` (titular GMM),
  `Auto` (vehículo, en autos), `Aseguradora`, `Prima`.

## Función Deluge

Crear en **Setup → Desarrollador → Funciones** (función independiente / standalone),
nombre sugerido `enviarRenovacionesMensuales`, sin argumentos.

```deluge
void automation.enviarRenovacionesMensuales()
{
    // ---------- 1) Ventana = mes calendario a 2 meses (15-jun => agosto) ----------
    objetivo  = zoho.currentdate.addMonth(2);
    primerDia = objetivo.toString("yyyy-MM-01").toDate("yyyy-MM-dd");
    ultimoDia = primerDia.addMonth(1).addDay(-1);

    fechaInicio = primerDia.toString("yyyy-MM-dd");
    fechaFin    = ultimoDia.toString("yyyy-MM-dd");

    nombresMes = Map();
    nombresMes.put(1, "enero");   nombresMes.put(2, "febrero");  nombresMes.put(3, "marzo");
    nombresMes.put(4, "abril");   nombresMes.put(5, "mayo");     nombresMes.put(6, "junio");
    nombresMes.put(7, "julio");   nombresMes.put(8, "agosto");   nombresMes.put(9, "septiembre");
    nombresMes.put(10, "octubre"); nombresMes.put(11, "noviembre"); nombresMes.put(12, "diciembre");
    etiquetaMes = nombresMes.get(objetivo.getMonth()) + " " + objetivo.getYear();
    hoyTxt = zoho.currentdate.toString("dd/MM/yyyy");

    // ---------- 2) Configuración por tipo ----------
    config = Map();
    config.put("GMM",  "operaciones@talan.com.mx, operaciones2@talan.com.mx, clientes@talan.com.mx, iria@talan.com.mx");
    config.put("AUTO", "vida@talan.com.mx, clientes@talan.com.mx, iria@talan.com.mx");

    for each tipo in config.keys()
    {
        destinatarios = config.get(tipo);

        criterio = "(Tipo_de_poliza:equals:" + tipo + ")and(Estatus:equals:VIGENTE)and(Fecha_de_finalizaci_n_de_vigencia:between:" + fechaInicio + "," + fechaFin + ")";

        // ---- Paginación (200 por página) ----
        polizas = List();
        pagina = 1;
        continuar = true;
        while(continuar)
        {
            lote = zoho.crm.searchRecords("Polizas", criterio, pagina, 200);
            if(lote != null && lote.size() > 0)
            {
                polizas.addAll(lote);
            }
            if(lote == null || lote.size() < 200)
            {
                continuar = false;
            }
            else
            {
                pagina = pagina + 1;
            }
        }

        // ---- Ordenar por fecha de vencimiento (ascendente) ----
        // searchRecords no permite sort_by por este campo, así que ordenamos aquí.
        ordenado = Map();
        idx = 0;
        for each p in polizas
        {
            idx = idx + 1;
            fechaOrden = ifnull(p.get("Fecha_de_finalizaci_n_de_vigencia"), "9999-12-31");
            // El sufijo _idx evita que dos pólizas con la misma fecha se pisen en el Map.
            ordenado.put(fechaOrden + "_" + idx, p);
        }
        polizasOrdenadas = List();
        for each clave in ordenado.keys().sort(true)
        {
            polizasOrdenadas.add(ordenado.get(clave));
        }

        // ---- Construir tabla HTML ----
        etiquetaTipo = if(tipo == "GMM", "GMM (Gastos Médicos Mayores)", "Autos");
        colCliente   = if(tipo == "GMM", "Asegurado", "Vehículo");

        cuerpo = "<div style='font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;'>";
        cuerpo = cuerpo + "<p>Pólizas de <b>" + etiquetaTipo + "</b> por renovar en <b>" + etiquetaMes + "</b>.</p>";

        if(polizas.size() == 0)
        {
            cuerpo = cuerpo + "<p>No hay pólizas por renovar en este periodo.</p>";
        }
        else
        {
            cuerpo = cuerpo + "<table cellpadding='8' cellspacing='0' style='border-collapse:collapse;width:100%;'>";
            cuerpo = cuerpo + "<tr style='background:#0f2a3f;color:#ffffff;text-align:left;'>";
            cuerpo = cuerpo + "<th>#</th><th>Póliza</th><th>" + colCliente + "</th><th>Aseguradora</th><th>Vence</th><th>Prima</th></tr>";

            i = 0;
            for each p in polizasOrdenadas
            {
                i = i + 1;
                fondo   = if(i % 2 == 0, "#f4f6f8", "#ffffff");
                cliente = if(tipo == "GMM", p.get("Asegurado_1"), p.get("Auto"));
                cliente = ifnull(cliente, "—");
                aseg    = ifnull(p.get("Aseguradora"), "—");
                vence   = ifnull(p.get("Fecha_de_finalizaci_n_de_vigencia"), "—");
                prima   = p.get("Prima");
                primaTxt = if(prima == null, "—", "$" + prima);
                noPol   = ifnull(p.get("Name"), "—");

                cuerpo = cuerpo + "<tr style='background:" + fondo + ";border-bottom:1px solid #e0e0e0;'>";
                cuerpo = cuerpo + "<td>" + i + "</td><td>" + noPol + "</td><td>" + cliente + "</td><td>" + aseg + "</td><td>" + vence + "</td><td style='text-align:right;'>" + primaTxt + "</td></tr>";
            }
            cuerpo = cuerpo + "</table>";
            cuerpo = cuerpo + "<p style='margin-top:12px;'>Total: <b>" + polizas.size() + "</b> pólizas.</p>";
        }

        cuerpo = cuerpo + "<p style='color:#888888;font-size:12px;'>Generado automáticamente desde Zoho CRM el " + hoyTxt + ".</p></div>";

        asunto = "Renovaciones " + if(tipo == "GMM", "GMM", "Autos") + " — " + etiquetaMes + " (" + polizas.size() + " pólizas)";

        sendmail
        [
            from : zoho.adminuserid
            to : destinatarios
            subject : asunto
            message : cuerpo
        ]
    }
}
```

## Pasos para el martes (en la computadora)

1. **Crear la función**
   - Setup → Desarrollador → **Funciones** → *Nueva función*.
   - Nombre: `enviarRenovacionesMensuales`. Categoría: *Automatización*. Sin argumentos.
   - Pegar el código de arriba. **Guardar**.

2. **Probar antes de programar**
   - Botón **Ejecutar / Run** dentro del editor.
   - Verificar que lleguen los 2 correos y que la tabla se vea bien.
   - Si lo corres en mayo, la prueba listará el mes de **julio** (mayo + 2).

3. **Programar (día 15 de cada mes)**
   - Setup → Automatización → **Programaciones (Schedules)** → *Nueva programación*.
   - Asociar la función `enviarRenovacionesMensuales`.
   - Fecha de inicio: el próximo **día 15**. Repetir: **cada 1 mes**.

4. **Remitente (`from`)**
   - Usa `zoho.adminuserid` (el correo del súper admin del CRM, ya verificado).
   - Si prefieres que salga desde otra cuenta (ej. `operaciones@talan.com.mx`),
     primero agrégala en CRM como *From Address* verificada y cambia la línea `from:`.

## Notas

- **Ventana**: mes calendario completo a 2 meses vista (día 15 → mes M+2). Cada
  póliza aparece una sola vez; sin traslape entre meses.
- Esto da entre ~47 y ~77 días de anticipación según el día de vencimiento dentro
  del mes objetivo. Si prefieres más/menos colchón, se ajusta el `addMonth(2)`.
- **Ordenamiento**: el correo sale ordenado por `Fecha_de_finalizaci_n_de_vigencia`
  ascendente (la API de búsqueda no deja ordenar por ese campo, se hace en el código).
- **Ensayo en vivo (2026-05-29)**: la consulta para julio 2026 funcionó — devolvió
  18 GMM y 2 Autos. Nombres de campo y filtro `between` confirmados.
- `searchRecords` en Deluge devuelve lista vacía cuando no hay coincidencias; el código
  ya lo contempla. Confirmar en la prueba real.
- Validar en la prueba que `objetivo.getMonth()` devuelva 1–12 (para el nombre del mes);
  si tu data center lo devolviera 0–11, sumar 1 en el `nombresMes.get(...)`.
```
