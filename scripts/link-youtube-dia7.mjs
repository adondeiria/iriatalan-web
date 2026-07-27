/**
 * Día 7 — Fase 5: enlaza el canal de YouTube con el blog (dirección artículo→video).
 *
 * El diagnóstico del Día 6: el canal y el blog explican lo mismo sin conocerse.
 * Es trabajo hecho dos veces que no se suma. Este script pone el video en el
 * artículo del mismo tema; el enlace inverso (video→artículo) va en la
 * descripción de YouTube y lo aplica Iria — el agente no toca su canal.
 *
 * Par aplicado hoy:
 *   s5OHhBvQbYs "¿Cómo funciona el seguro de GMM de maternidad BUPA NACIONAL PLUS?"
 *     ↔ /blog/seguro-gastos-medicos-maternidad
 *
 * Pares pendientes y por qué:
 *   GnGfPKCpdzg "cobertura en el extranjero GNP" → su artículo todavía es idea
 *     (`gmm-emergencia-extranjero-aviso-aseguradora`). Cuando se publique, se
 *     agrega aquí. Mientras tanto el destino natural del video es /gmm.
 *   Dpo_No0sBuk "MI HISTORIA" → /sobre-iria no es un artículo de Sanity; ese
 *     va cableado en la propia página.
 *
 * Los datos (título, fecha, duración) salen del feed público del canal y de la
 * página del video, no de memoria: duración 232 s = PT3M52S, publicado 2026-05-04.
 * La `description` está reescrita en limpio a propósito — la de YouTube trae
 * emojis y 10 hashtags, y ese campo lo lee el buscador, no el suscriptor.
 *
 * Regla del proyecto: patch/set, nunca createOrReplace.
 * Uso: node scripts/link-youtube-dia7.mjs [--apply]
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => l.trim() && !l.trim().startsWith('#') && l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const PARES = [
  {
    slug: 'seguro-gastos-medicos-maternidad',
    video: {
      videoId: 's5OHhBvQbYs',
      name: '¿Cómo funciona el seguro de GMM de maternidad BUPA Nacional Plus?',
      // Descriptivo y sin promesas: el video explica cómo opera la cobertura,
      // no promete montos. En página YMYL eso importa.
      description:
        'Iria Talan explica en video cómo funciona la cobertura de maternidad del plan de gastos médicos mayores BUPA Nacional Plus: qué incluye y qué conviene revisar antes de contratar.',
      uploadDate: '2026-05-04',
      duration: 'PT3M52S',
    },
  },
]

let fallos = 0
for (const { slug, video } of PARES) {
  const doc = await client.fetch(
    `*[_type=="article" && slug.current==$slug][0]{_id, title, draft, video}`,
    { slug }
  )
  if (!doc) {
    console.error(`  ** no existe el artículo ${slug}`)
    fallos++
    continue
  }
  console.log(`\n${slug}`)
  console.log(`  artículo: ${doc.title}`)
  console.log(`  video actual: ${doc.video?.videoId ?? '(ninguno)'} → nuevo: ${video.videoId}`)
  console.log(`  ${video.name} · ${video.duration} · ${video.uploadDate}`)

  if (!APPLY) continue

  await client.patch(doc._id).set({ video }).commit()

  const check = await client.fetch(`*[_id==$id][0].video`, { id: doc._id })
  const ok =
    check?.videoId === video.videoId &&
    check?.name === video.name &&
    check?.description === video.description &&
    check?.uploadDate === video.uploadDate &&
    check?.duration === video.duration
  console.log(ok ? '  OK  escrito y releído' : '  ** el releído no coincide')
  if (!ok) {
    console.error('     ', JSON.stringify(check))
    fallos++
  }
}

if (!APPLY) {
  console.log('\n(dry-run — nada escrito. Corre con --apply para aplicar.)')
} else {
  console.log(fallos === 0 ? '\n✅ Listo.' : `\n❌ ${fallos} fallo(s).`)
}
process.exit(fallos === 0 ? 0 : 1)
