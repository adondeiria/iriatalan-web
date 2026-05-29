# Automatización — Correo mensual de renovaciones (Zoho CRM)

> Estado: **borrador listo para implementar** (pendiente pegar y programar en Zoho).
> Última actualización: 2026-05-29.

## Objetivo

El **día 15 de cada mes**, Zoho CRM envía **2 correos** con las pólizas que vencen
en los **próximos 45 días** (ventana móvil desde la fecha de envío):

| Correo | Tipo (`Tipo_de_poliza`) | Destinatarios |
|--------|--------------------------|---------------|
| Renovaciones **GMM** | `GMM` | `operaciones@talan.com.mx`, `operaciones2@talan.com.mx`, `clientes@talan.com.mx`, `iria@talan.com.mx` |
| Renovaciones **Autos** | `AUTO` | `vida@talan.com.mx`, `clientes@talan.com.mx`, `iria@talan.com.mx` |

Ejemplo: la corrida del **15 de junio** lista lo que vence entre el **15 de junio y
el 30 de julio**. Las pólizas que se van renovando dejan de aparecer porque su
`Estatus` cambia a `RENOVADA`.

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
    // ---------- 1) Ventana móvil = próximos 45 días ----------
    hoy = zoho.currentdate;
    fechaInicio = hoy.toString("yyyy-MM-dd");              // hoy (día 15)
    fechaFin    = hoy.addDay(45).toString("yyyy-MM-dd");   // +45 días

    inicioTxt = hoy.toString("dd/MM/yyyy");
    finTxt    = hoy.addDay(45).toString("dd/MM/yyyy");
    etiquetaRango = inicioTxt + " al " + finTxt;

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

        // ---- Construir tabla HTML ----
        etiquetaTipo = if(tipo == "GMM", "GMM (Gastos Médicos Mayores)", "Autos");
        colCliente   = if(tipo == "GMM", "Asegurado", "Vehículo");

        cuerpo = "<div style='font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;'>";
        cuerpo = cuerpo + "<p>Pólizas de <b>" + etiquetaTipo + "</b> por renovar en los <b>próximos 45 días</b> (" + etiquetaRango + ").</p>";

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
            for each p in polizas
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

        cuerpo = cuerpo + "<p style='color:#888888;font-size:12px;'>Generado automáticamente desde Zoho CRM el " + inicioTxt + ".</p></div>";

        asunto = "Renovaciones " + if(tipo == "GMM", "GMM", "Autos") + " por vencer (próx. 45 días) — " + polizas.size() + " pólizas";

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
   - La prueba listará lo que vence en los próximos 45 días contados desde hoy.

3. **Programar (día 15 de cada mes)**
   - Setup → Automatización → **Programaciones (Schedules)** → *Nueva programación*.
   - Asociar la función `enviarRenovacionesMensuales`.
   - Fecha de inicio: el próximo **día 15**. Repetir: **cada 1 mes**.

4. **Remitente (`from`)**
   - Usa `zoho.adminuserid` (el correo del súper admin del CRM, ya verificado).
   - Si prefieres que salga desde otra cuenta (ej. `operaciones@talan.com.mx`),
     primero agrégala en CRM como *From Address* verificada y cambia la línea `from:`.

## Notas

- **Ventana**: móvil de 45 días desde el día de envío (15). Hay traslape natural
  mes a mes; se autocorrige porque las renovadas pasan a `RENOVADA` y dejan de salir.
- `searchRecords` en Deluge devuelve lista vacía cuando no hay coincidencias; el código
  ya lo contempla. Confirmar en la prueba real.
- Volumen de referencia (29-may → 31-jul 2026): ~44 GMM, 2 Autos.
```
