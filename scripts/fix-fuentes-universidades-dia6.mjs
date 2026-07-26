/**
 * Día 6 — agrega las 7 fuentes de colegiaturas al artículo de costos universitarios.
 *
 * El artículo afirma "una carrera privada de élite ronda entre $1.6 y $2.1 millones"
 * y hasta hoy no tenía NINGUNA fuente para ese rango: la única fuente declarada era
 * el PDF del INPC, que respalda otra afirmación (la de inflación educativa).
 *
 * Origen de los datos (Iria): páginas oficiales de cada institución o consulta
 * telefónica directa. Donde existe página pública de costos se enlaza esa —no la
 * home— para que el lector pueda comprobar la cifra. Donde el costo se obtuvo por
 * teléfono se enlaza la institución y se declara "consulta directa".
 *
 * Regla del proyecto: patch/set, nunca createOrReplace. Y toda URL se verifica
 * contra el documento real antes de escribirla — una fuente muerta debilita la
 * entidad en vez de reforzarla.
 *
 * Uso: node scripts/fix-fuentes-universidades-dia6.mjs [--apply]
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

const APPLY = process.argv.includes('--apply')
const SLUG = 'incremento-costos-universitarios-mexico'

const NUEVAS = [
  { title: 'Costos de colegiatura — Educación Profesional', publisher: 'Tecnológico de Monterrey',
    url: 'https://tec.mx/es/profesional/costos-de-colegiatura' },
  { title: 'Cuotas de Licenciatura (semestrales)', publisher: 'Universidad Anáhuac México',
    url: 'https://www.anahuac.mx/mexico/finanzas/servicios/colegiatura/licenciatura' },
  { title: '¿Cuánto cuesta estudiar en el ITAM?', publisher: 'ITAM',
    url: 'https://carreras.itam.mx/cuanto-cuesta-estudiar-en-el-itam/' },
  { title: 'Simulador de colegiatura', publisher: 'Universidad Iberoamericana',
    url: 'https://ibero.mx/simulador-de-colegiatura' },
  { title: 'Costos de licenciatura — consulta directa con la institución', publisher: 'CENTRO',
    url: 'https://centro.edu.mx/' },
  { title: 'Costos de licenciatura — consulta directa con la institución', publisher: 'Universidad La Salle México',
    url: 'https://lasalle.mx/' },
  { title: 'Costos de formación de piloto aviador — consulta directa', publisher: 'Aeroméxico Formación',
    url: 'https://aeromexicoformacion.com/' },
]

// ---------- 1. Verificar que cada URL responda ----------
console.log('Verificando URLs…\n')
let muertas = 0
for (const f of NUEVAS) {
  let estado
  try {
    const r = await fetch(f.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' } })
    estado = r.status
  } catch (e) { estado = 'ERROR ' + e.message }
  const ok = estado === 200
  if (!ok) muertas++
  console.log(`  ${ok ? 'OK ' : '** '} [${estado}] ${f.publisher} — ${f.url}`)
}
if (muertas) {
  console.error(`\nABORTA: ${muertas} URL(s) no respondieron 200. No se escriben fuentes muertas.`)
  process.exit(1)
}

// ---------- 2. Patch ----------
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

const doc = await client.fetch(`*[_type=="article" && slug.current==$slug][0]{_id,_rev,sources}`, { slug: SLUG })
if (!doc) { console.error('ABORTA: no se encontró el artículo.'); process.exit(1) }

const yaEstan = new Set((doc.sources || []).map(s => s.url))
const aAgregar = NUEVAS.filter(f => !yaEstan.has(f.url))

console.log(`\nFuentes actuales: ${doc.sources?.length ?? 0}`)
console.log(`Se agregarán:     ${aAgregar.length}`)
aAgregar.forEach(f => console.log(`   + ${f.publisher} — ${f.title}`))
if (!aAgregar.length) { console.log('\nNada que hacer.'); process.exit(0) }

if (!APPLY) { console.log('\n[DRY RUN] Nada escrito. Correr con --apply.'); process.exit(0) }

await client
  .patch(doc._id)
  .ifRevisionId(doc._rev)
  .setIfMissing({ sources: [] })
  .append('sources', aAgregar.map(f => ({ _key: randomUUID().replace(/-/g, '').slice(0, 12), _type: 'source', ...f })))
  .commit()

console.log(`\n✅ ${aAgregar.length} fuentes agregadas (rev bloqueada: ${doc._rev})`)
