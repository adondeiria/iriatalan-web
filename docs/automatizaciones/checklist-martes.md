# ✅ Checklist — Activar correo mensual de renovaciones en Zoho CRM

> Código completo en: `docs/automatizaciones/zoho-renovaciones-mensuales.md`
> Tiempo estimado: 15–20 min.

---

## Antes de empezar
- [ ] Equipo revisó el módulo **Polizas** y completó datos faltantes
      (ej. `Asegurado_1` de la póliza GNP 23497813).
- [ ] Tengo abierto el doc con el código Deluge para copiar/pegar.
- [ ] Entré a Zoho CRM como **administrador**.

---

## Paso 1 — Crear la función
- [ ] **Setup** (engrane) → **Desarrollador** → **Funciones**.
- [ ] Clic en **+ Nueva función**.
- [ ] Nombre: `enviarRenovacionesMensuales`
- [ ] Categoría: **Automatización** · Sin argumentos.
- [ ] Pegar el código Deluge completo del doc.
- [ ] **Guardar**.

---

## Paso 2 — Probar (¡antes de programar!)
- [ ] Dentro del editor, clic en **Ejecutar / Run**.
- [ ] Revisar la bandeja de los destinatarios:
  - [ ] Llegó el correo **GMM** (a operaciones@, operaciones2@, clientes@, iria@).
  - [ ] Llegó el correo **Autos** (a vida@, clientes@, iria@).
- [ ] La tabla se ve bien y está **ordenada por fecha de vencimiento**.
- [ ] Las cifras y nombres se ven correctos.

> Nota: al correr en **mayo**, la prueba lista el mes de **julio** (mes + 2).
> El correo dice cuántas pólizas trae en el asunto.

---

## Paso 3 — Programar (día 15, mensual)
- [ ] **Setup** → **Automatización** → **Programaciones (Schedules)**.
- [ ] Clic en **+ Nueva programación**.
- [ ] Asociar la función `enviarRenovacionesMensuales`.
- [ ] Fecha de inicio: el **próximo día 15**.
- [ ] Frecuencia: **cada 1 mes**.
- [ ] **Guardar y activar**.

---

## Si algo sale mal
- [ ] **No llega el correo** → revisar que el remitente (`from: zoho.adminuserid`)
      sea una dirección verificada en CRM. Probar también carpeta de spam.
- [ ] **Nombre del mes raro / vacío** → ver la nota sobre `getMonth()` en el doc técnico.
- [ ] **Error de campo** → confirmar que los nombres de campo no cambiaron en el módulo.
- [ ] Cualquier duda: me escribes y lo revisamos juntos. 👍

---

## Listo cuando…
- [ ] La función está guardada.
- [ ] La prueba mandó los 2 correos correctos.
- [ ] La programación quedó activa para el día 15.
