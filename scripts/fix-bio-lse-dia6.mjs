/**
 * Día 6 — quita "· LSE" del bio de Sanity.
 *
 * Decisión de Iria: el MBA Essentials de LSE es un curso ejecutivo corto y no
 * merece estar junto a Yale en un texto de 289 caracteres. Además el separador
 * "·" hacía que "Wealth Management" colgara de las dos escuelas, que es falso:
 * Yale = Wealth Management Theory & Practice (2019); LSE = MBA Essentials (2023).
 * Quitarlo resuelve la ambigüedad por eliminación.
 *
 * Este bio es `Person.description` (seo.ts:249), `FinancialService.description`
 * (seo.ts:282) y el texto visible de la tarjeta de autor (article-meta.tsx:205).
 *
 * Regla del proyecto: patch/set, nunca createOrReplace.
 * Uso: node scripts/fix-bio-lse-dia6.mjs [--apply]
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

const FRAGMENTO = ' · LSE'
const doc = await client.fetch(`*[_type=="author"][0]{_id,_rev,bio}`)

if (!doc.bio.includes(FRAGMENTO)) {
  console.error('ABORTA: el bio ya no contiene " · LSE". Estado actual:\n' + doc.bio)
  process.exit(1)
}

const bioNuevo = doc.bio.replace(FRAGMENTO, '')
console.log('ANTES  :', doc.bio)
console.log('\nDESPUÉS:', bioNuevo)
console.log(`\n(${[...doc.bio].length} → ${[...bioNuevo].length} caracteres)`)

if (!APPLY) {
  console.log('\n[DRY RUN] Nada escrito. Correr con --apply.')
  process.exit(0)
}

await client.patch(doc._id).ifRevisionId(doc._rev).set({ bio: bioNuevo }).commit()
console.log('\n✅ Aplicado con patch/set (rev bloqueada:', doc._rev + ')')
