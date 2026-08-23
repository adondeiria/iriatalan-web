# Notas de trabajo — NO se publica

> Este archivo vive fuera del borrador porque `draft-push.mjs` manda al cuerpo
> del artículo cualquier encabezado `##` que no reconozca. Si estas notas se
> quedaran dentro del `.md` del borrador, se publicarían como texto del
> artículo.

## Notas para Iria antes de publicar

**1. Corrección de un error mío, que quede escrito.** En la revisión anterior
afirmé que la cifra de "8.98%" venía de una cotización USD/JPY. **Eso fue un
error.** Lo que realmente pasó: mi fetch del PDF falló, mi búsqueda alterna
trajo ruido de investing.com, encontré ahí un "158.98" y construí una
explicación sobre el origen de la cifra. La conclusión correcta de mi evidencia
era "no pude verificar", no "viene de otra cosa". Un falso negativo así te pudo
hacer descartar una fuente legítima, que es justo lo contrario de lo que debe
hacer una verificación.

**2. CONDUSEF: verificada, y me equivoqué al descartarla.** Mi error de
certificado era del entorno, no de la página. La abrí con otra herramienta:
responde 200 y contiene ambas citas textuales, ya integradas al artículo. Es la
mejor fuente que tiene este texto — es el regulador diciendo exactamente lo de
familiares y amigos, y le quita a ti el peso de ser quien lo dice.

**3. El PDF de S&P sigue sin resolver, y no es lo mismo que "no existe".**
Volví a intentarlo con proxy sigiloso: el servidor de S&P devuelve **404** con
su propia página de error de marca (un 403 sería "existe pero bloqueado"; un
404 del origen es otra cosa), y una búsqueda restringida a `spglobal.com` no
encuentra ningún documento "cumple 40 años". Puede que la URL haya cambiado.
Como sea, **los datos serían de 2018** — ocho años — así que la cifra queda
fuera hasta tener algo reciente. El texto quedó con la formulación cualitativa,
que además evita contradecir tu propio titular.

**4. La fuente de CNBV era una nota de prensa**, no la alerta oficial. Retirada.
El artículo se sostiene con CONDUSEF y el SIPRES, que son primarias.

**5. Cluster `inversion` creado.** No existía: no estaba en `src/lib/blog.ts`
ni en el picklist de `sanity/schemas/article.ts`, que es una lista cerrada — el
artículo habría fallado la validación al publicar. Ya quedó agregado en los
cuatro mapas y en el schema. La categoría vivirá en
`/blog/categoria/inversion`. Como el índice del blog solo muestra temas con
contenido, aparece cuando publiques este artículo.

**6. Los tres CTAs ya apuntan a `/perfil-inversionista`**, la ruta real.

**7. Enfoque corregido: invitación, no acusación.** El titular anterior decía
"por eso te van a estafar". Dos problemas que señalaste y que son ciertos: quien
llega buscando ese rendimiento no se cree la acusación y cierra la página, y
—más grave— como el que ofrece suele ser un amigo o familiar del cliente, el
titular no acusaba al estafador: acusaba a alguien que el lector quiere. La
reacción natural no es leer, es defenderlo.

Con tu titular, la palabra "fraude" ya no aparece hasta el **29% del artículo**,
cuando la persona ya recorrió el argumento de los rendimientos y la volatilidad.
Además el paso 3 de la secuencia ahora dice explícitamente que **quien hace la
oferta muchas veces no se siente un estafador** —cree en lo que vende y hasta
metió su propio dinero—, para que nadie sienta que estás llamando delincuente a
su cuñado. El foco está en verificar el producto, no en juzgar a la persona.

**8. Coherencia con el cuestionario:** mismas tres dimensiones, misma regla del
menor, mismo techo de la P8, mismo corte de cinco años. Si mueves una regla en
el cuestionario, este texto queda desalineado.
