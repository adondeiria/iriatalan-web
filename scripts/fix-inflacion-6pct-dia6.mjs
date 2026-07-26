/**
 * Día 6 — baja la inflación educativa de 8% a 6% y recalcula la proyección.
 *
 * Decisión de Iria. El 8% no lo sostenía ninguna fuente verificable:
 *   - El Economista (ago 2025): universidad 5.01%, conjunto 5.34%
 *   - Expansión (jul 2026): colegiaturas "casi 6% anual"
 *   - Tribuna de México (2026): "superior al 6%"
 * La única mención de 8-12% que apareció era un reel de Instagram.
 *
 * EFECTO SECUNDARIO OBLIGATORIO: la proyección a 10 años deriva del porcentaje.
 *   1.8 M × 1.08^10 = 3.89 M  → el "$3.9 millones" que decía el texto
 *   1.8 M × 1.06^10 = 3.22 M  → hay que bajarlo a "$3.2 millones"
 * Cambiar el % sin recalcular la proyección dejaría el artículo contradiciéndose.
 *
 * BONUS: al pasar a 6%, la fuente del INPC que ya estaba declarada SÍ respalda la
 * afirmación — el 6% sale justamente de esa serie. Antes el 8% colgaba de una
 * fuente que decía otra cosa.
 *
 * Regla del proyecto: patch/set, nunca createOrReplace.
 * Uso: node scripts/fix-inflacion-6pct-dia6.mjs [--apply]
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const APPLY = process.argv.includes('--apply')
const SLUG = 'incremento-costos-universitarios-mexico'

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

const doc = await client.fetch(`*[_type=="article" && slug.current==$slug][0]{_id,_rev,body}`, { slug: SLUG })
if (!doc) { console.error('ABORTA: artículo no encontrado.'); process.exit(1) }

// Reemplazos exactos, span por span. Nada de regex global sobre el documento.
const REEMPLAZOS = [
  { de: 'el 8% anual', a: 'el 6% anual' },
  { de: 'cerca de $3.9 millones', a: 'cerca de $3.2 millones' },
]

const parches = {}
for (const b of doc.body || []) {
  for (const c of b.children || []) {
    for (const r of REEMPLAZOS) {
      if (typeof c.text === 'string' && c.text.includes(r.de)) {
        const nuevo = c.text.replace(r.de, r.a)
        parches[`body[_key=="${b._key}"].children[_key=="${c._key}"].text`] = nuevo
        console.log(`\nbloque ${b._key} / span ${c._key}`)
        console.log(`  ANTES  : …${c.text.slice(Math.max(0, c.text.indexOf(r.de) - 60), c.text.indexOf(r.de) + 60)}…`)
        console.log(`  DESPUÉS: …${nuevo.slice(Math.max(0, nuevo.indexOf(r.a) - 60), nuevo.indexOf(r.a) + 60)}…`)
      }
    }
  }
}

const n = Object.keys(parches).length
if (n !== REEMPLAZOS.length) {
  console.error(`\nABORTA: se esperaban ${REEMPLAZOS.length} reemplazos y se encontraron ${n}. El texto no está como se esperaba.`)
  process.exit(1)
}

if (!APPLY) { console.log('\n[DRY RUN] Nada escrito. Correr con --apply.'); process.exit(0) }

await client.patch(doc._id).ifRevisionId(doc._rev).set(parches).commit()
console.log(`\n✅ ${n} reemplazos aplicados (rev bloqueada: ${doc._rev})`)
