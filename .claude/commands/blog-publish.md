---
name: blog-publish
description: Publica el blog en producción end-to-end. Push a Sanity con draft:false, trigger revalidate de Vercel, verify markers en producción. Requiere phase=image-approved. Si verify falla, retiene phase=published para reintentar.
arguments:
  - name: slug
    required: true
    description: Slug del blog a publicar live.
---

# /blog-publish — publicar live + verificar producción

## Uso

```
/blog-publish <slug>
```

Ejemplo:
```
/blog-publish modalidad-40-imss-conviene
```

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Confirma phase = `image-approved` (todos los checkpoints humanos completos: Word + imagen).
3. Pide confirmación final explícita: *"Voy a (a) push a Sanity con draft:false, (b) revalidate Vercel, (c) verify markers en producción. ¿Procedo?"*
4. Espera "sí" / "publica" / equivalente.
5. Ejecuta `node scripts/draft-push.mjs <slug> --apply --publish`:
   - Push createOrReplace con `draft: false` (publicado directo en Sanity).
   - Llama el endpoint Vercel revalidate (`POST /api/revalidate` con secret token).
6. Espera 30s (ventana ISR).
7. Ejecuta `node scripts/draft-verify-live.mjs <slug>`:
   - Fetch a `https://iriatalan.com.mx/blog/<slug>` con `cache: 'no-store'`.
   - Busca 3 markers únicos (frases inconfundibles del draft).
   - Si los 3 aparecen → verify OK.
   - Si no → reporta cuáles faltan.
8. Si verify OK → actualiza state: `publishedUrl`, `verifyMarkers`, `verifiedAt`, phase → `done`.
9. Si verify FALLA → state queda en `published`. Mensaje: *"Push + revalidate OK pero producción aún no sirve los markers. Esperá otros 60s y reintentas con `/blog-verify <slug>` (a crear)"*.
10. Frase canónica de éxito: *"✅ `<slug>` live en https://iriatalan.com.mx/blog/<slug> — verificado con N markers únicos. Fin del pipeline."*

## Qué NO hace

- NO publica sin confirmación explícita.
- NO publica si phase ≠ `image-approved` (rompería los checkpoints).
- NO marca done si verify falla.

## Prerequisitos

- `SANITY_API_WRITE_TOKEN` en `.env.local` con scope Editor.
- `REVALIDATE_SECRET` en `.env.local` (a configurar — secret para llamar `/api/revalidate`).
- Endpoint `/api/revalidate` desplegado en producción (a crear si no existe).
- Scripts `draft-push.mjs --publish` y `draft-verify-live.mjs` listos.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-publish <slug>`. Sigue el workflow estricto: confirmación → push --publish → wait 30s → verify markers → actualizar state.
