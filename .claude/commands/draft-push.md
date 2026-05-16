# /draft-push — sube un draft del repo a Sanity

Toma un draft archivado (`sanity/seeds/draft-history/<slug>__*.md`) y lo sube como documento `article` a Sanity manteniendo `draft: true`. Iria revisa y publica con 1 click desde Studio.

## Uso

```
/draft-push <slug>
```

Ejemplo:
```
/draft-push modalidad-40-imss-conviene
```

## Lo que hace este comando

1. **Delega al agente `iriatalan-sanity-publisher`** (en `.claude/agents/iriatalan-sanity-publisher.md`).
2. El agente verifica que el draft archivado existe.
3. Corre `node scripts/draft-push.mjs <slug>` en **dry-run primero** y muestra el resumen del doc.
4. **Espera tu confirmación explícita** ("sí, súbelo") antes del push real.
5. Después de tu OK, corre `node scripts/draft-push.mjs <slug> --apply`.
6. Te devuelve el URL del doc en Studio + la lista de pasos faltantes para publicar.

## Lo que NO hace

- **NO publica** (siempre deja `draft: true` para que tú hagas el QA final).
- **NO modifica el draft** (si encuentras un error, regresas a `iriatalan-seo-blog` para corregirlo, luego re-corres `/draft-push`).
- **NO sube imágenes** (Iria sube imagen hero manualmente en Studio).
- **NO selecciona autor** (Iria selecciona el reference a Iria Talan en Studio).

## Prerequisito

`SANITY_API_WRITE_TOKEN` debe existir en `.env.local`. Si no existe, el script va a fallar con un mensaje claro de cómo crearlo en `https://sanity.io/manage`.

## Cómo funciona internamente

El comando dispara al agente con este prompt:

> *Usa el agente `iriatalan-sanity-publisher` para pushear el draft `<slug>` a Sanity. Primero dry-run, después pídeme confirmación explícita, después --apply. Reporta el URL del doc en Studio al final.*

El agente sigue su workflow (ver `.claude/agents/iriatalan-sanity-publisher.md`):
1. Pre-flight: verifica que existe el draft archivado.
2. Dry-run y mostrar resumen.
3. Esperar confirmación.
4. Apply.
5. Reportar URL Studio + pasos faltantes.

## Errores comunes y qué significan

| Mensaje | Causa | Cómo arreglar |
|---|---|---|
| `Falta SANITY_API_WRITE_TOKEN` | No hay token en `.env.local` | Crea uno en sanity.io/manage → IRIA TALAN RIF → API → Tokens (scope Editor) |
| `No hay archivos en draft-history para slug "X"` | El draft no fue archivado | Corre `iriatalan-seo-blog` en Modo 2 para generar el draft primero |
| `HTTP 401` | Token inválido o expirado | Regenera el token en sanity.io/manage |
| `HTTP 422` | Schema validation falló | El parser no maneja un nuevo campo del schema — ajustar `scripts/draft-push.mjs` |
| `tldr tiene N chars (max 320)` | El draft excede el límite | Edita el draft archivado o vuelve al agente SEO para acortar |

## Relación con otros comandos

- `/draft-learn <slug>` — captura aprendizajes después de que tú revisaste un draft. Va ANTES de `/draft-push`.
- `iriatalan-seo-blog` Modo 2 — escribe el draft. Va ANTES de todo.

Flujo completo:
```
iriatalan-seo-blog (Modo 2) → genera draft → guarda en draft-history/
                                                        │
                                                        ▼
              Tú revisas el .docx generado, corriges, devuelves
                                                        │
                                                        ▼
                                /draft-learn <slug> → enriquece voice corpus
                                                        │
                                                        ▼
                            /draft-push <slug> → sube a Sanity como draft
                                                        │
                                                        ▼
                                Tú en Studio: autor + imagen + Publish
```
