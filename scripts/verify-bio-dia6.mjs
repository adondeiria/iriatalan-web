/**
 * Verifica el fix del Día 6 en las DOS capas: Sanity y producción.
 * Uso: node scripts/verify-bio-dia6.mjs
 */
import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter(l => l.trim() && !l.trim().startsWith('#') && l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const SITE = env.SITE_URL || 'https://iriatalan.com.mx'

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

let fallos = 0
const check = (ok, etiqueta, extra = '') => {
  console.log(`${ok ? '  OK ' : '  ** '} ${etiqueta}${extra ? ' — ' + extra : ''}`)
  if (!ok) fallos++
}

// ---------- 1. Sanity ----------
console.log('\n=== 1. Sanity ===')
const d = await client.fetch(`*[_type=="author"][0]{
  _id, bio, longBio, name, title, officeAddress, credentials, sameAs, photo, languages
}`)
check(!/comisión deja/i.test(d.bio), 'bio sin la cláusula')
const textoLong = d.longBio.map(b => (b.children || []).map(c => c.text).join('')).join('\n')
check(!/comisión deja/i.test(textoLong), 'longBio sin la cláusula')
check(/Comisión Nacional de Seguros y Fianzas/.test(textoLong), 'nombre de la CNSF intacto (no era falso positivo)')

// Guarda anti-regresión del bug de createOrReplace: los campos vecinos siguen vivos.
console.log('\n  campos vecinos que NO debieron tocarse:')
check(Boolean(d.name), 'name', d.name)
check(Boolean(d.title), 'title')
check(Boolean(d.officeAddress), 'officeAddress', d.officeAddress)
check((d.credentials?.length ?? 0) > 0, 'credentials', `${d.credentials?.length} items`)
check((d.sameAs?.length ?? 0) > 0, 'sameAs', `${d.sameAs?.length} perfiles`)
check(Boolean(d.photo), 'photo')
// El bloque de las seis aseguradoras debe seguir completo salvo la cláusula.
const bloqueSeis = d.longBio.find(b => b._key === '8a4b9b86fa2a')
const textoSeis = (bloqueSeis?.children || []).map(c => c.text).join('')
check(/BUPA, MetLife, Allianz, Seguros Monterrey New York Life, AXA y GNP/.test(textoSeis),
  'las 6 aseguradoras siguen nombradas')
check(/realmente le conviene a mi cliente\.$/.test(textoSeis),
  'el bloque cierra limpio', JSON.stringify(textoSeis.slice(-45)))

// ---------- 2. Revalidar producción ----------
console.log('\n=== 2. Revalidando rutas afectadas ===')
const slugs = await client.fetch(
  `*[_type=="article" && !draft && defined(publishedAt)].slug.current`
)
const rutas = ['/', '/sobre-iria', '/blog', ...slugs.map(s => `/blog/${s}`)]
for (const ruta of rutas) {
  const res = await fetch(
    `${SITE}/api/revalidate?path=${encodeURIComponent(ruta)}&secret=${env.REVALIDATE_SECRET}`,
    { method: 'POST' }
  )
  const j = await res.json().catch(() => ({}))
  console.log(`  ${j.revalidated ? 'ok ' : '** '} ${ruta}${j.revalidated ? '' : ' — ' + (j.message ?? res.status)}`)
  if (!j.revalidated) fallos++
}

// ---------- 3. Producción ----------
console.log('\n=== 3. Producción ===')
for (const ruta of ['/sobre-iria', '/']) {
  const url = SITE + ruta
  const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } })
  const html = await res.text()
  console.log(`\n  ${url}  [${res.status}]`)
  check(res.ok, 'responde 200')
  check(!/comisión deja/i.test(html), 'HTML sin la cláusula vieja')
  check(html.includes('Tu cobertura a la medida.'), 'HTML ya trae el texto nuevo')
}

console.log(fallos === 0
  ? '\n✅ Todo verificado en Sanity y en producción.'
  : `\n❌ ${fallos} comprobación(es) fallaron.`)
process.exit(fallos === 0 ? 0 : 1)
