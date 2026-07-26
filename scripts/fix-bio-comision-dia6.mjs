/**
 * Día 6 — quita "no la que más comisión deja" de las dos superficies de Sanity.
 *
 * Por qué: ese texto es a la vez `Person.description` (seo.ts:249),
 * `FinancialService.description` (seo.ts:282) y el texto VISIBLE de la tarjeta
 * de autor al pie de cada artículo (article-meta.tsx:205). Iria lo rechazó para
 * la ficha de Google, así que tampoco sirve aquí.
 *
 * Corte mínimo: se elimina solo la cláusula, sin reescribir su voz.
 *
 * OJO: el longBio tiene un tercer "comisión" que NO se toca — "Comisión Nacional
 * de Seguros y Fianzas" (bloque 44e4b0ff0bcd) es el nombre real de la CNSF.
 *
 * Regla del proyecto: patch/set, nunca createOrReplace.
 * Uso: node scripts/fix-bio-comision-dia6.mjs [--apply]
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

const CLAUSULA_BIO = ', no la que más comisión deja'
const BLOQUE = '8a4b9b86fa2a'
const SPAN = '0973f0ace4b5'

const doc = await client.fetch(`*[_type=="author"][0]{_id,_rev,bio,longBio}`)

// --- Guardas: si el texto ya no está como se espera, abortar en vez de escribir a ciegas.
if (!doc.bio.includes(CLAUSULA_BIO)) {
  console.error('ABORTA: el bio ya no contiene la cláusula esperada. Estado actual:\n' + doc.bio)
  process.exit(1)
}
const bloque = doc.longBio.find(b => b._key === BLOQUE)
const span = bloque?.children?.find(c => c._key === SPAN)
if (!span || !/comisión/i.test(span.text)) {
  console.error(`ABORTA: el span ${SPAN} no contiene la cláusula esperada.`)
  process.exit(1)
}

const bioNuevo = doc.bio.replace(CLAUSULA_BIO, '')

console.log('--- bio ---')
console.log('ANTES :', doc.bio)
console.log('DESPUÉS:', bioNuevo)
console.log(`(${[...doc.bio].length} → ${[...bioNuevo].length} caracteres)`)
console.log('\n--- longBio, span', SPAN, '---')
console.log('ANTES :', JSON.stringify(span.text))
console.log('DESPUÉS:', JSON.stringify('.'))

if (!APPLY) {
  console.log('\n[DRY RUN] Nada escrito. Correr con --apply para aplicar.')
  process.exit(0)
}

await client
  .patch(doc._id)
  .ifRevisionId(doc._rev) // falla si alguien editó mientras tanto, en vez de pisarlo
  .set({
    bio: bioNuevo,
    [`longBio[_key=="${BLOQUE}"].children[_key=="${SPAN}"].text`]: '.',
  })
  .commit()

console.log('\n✅ Aplicado con patch/set (rev bloqueada:', doc._rev + ')')
