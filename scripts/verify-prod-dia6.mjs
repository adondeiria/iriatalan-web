/**
 * Espera a que el deploy de producción sirva los cambios del Día 6 y los verifica.
 * Producción NO tiene Deployment Protection, así que aquí sí se puede por fetch.
 * (El preview sí la tiene: redirige a vercel.com/login devolviendo 200 — verificarlo
 *  por fetch da falsos verdes. Ese hay que verlo por navegador.)
 *
 * Uso: node scripts/verify-prod-dia6.mjs
 */
const SITE = 'https://iriatalan.com.mx'
const MAX_MIN = 10
const dormir = ms => new Promise(r => setTimeout(r, ms))

const leerGrafo = html => {
  const nodos = []
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  let m
  while ((m = re.exec(html))) {
    try {
      const j = JSON.parse(m[1])
      nodos.push(...(j['@graph'] || [j]))
    } catch { /* ignorar */ }
  }
  return nodos
}

let nodos = null
const limite = Date.now() + MAX_MIN * 60_000
while (Date.now() < limite) {
  const html = await (await fetch(SITE + '/', { headers: { 'cache-control': 'no-cache' } })).text()
  if (/vercel\.com\/login|Login – Vercel/.test(html)) {
    console.error('ABORTA: llegó un login de Vercel, no el sitio.')
    process.exit(2)
  }
  const g = leerGrafo(html)
  const lb = g.find(n => (n['@id'] || '').includes('#localbusiness'))
  if (lb?.openingHours === 'Mo-Fr 09:00-17:00') { nodos = g; break }
  console.log(`  esperando deploy… openingHours actual: ${lb?.openingHours ?? '(sin nodo)'}`)
  await dormir(20_000)
}

if (!nodos) { console.error('El deploy no llegó a tiempo.'); process.exit(1) }

let fallos = 0
const check = (ok, etiqueta, extra = '') => {
  console.log(`${ok ? '  OK ' : '  ** '} ${etiqueta}${extra ? ' — ' + extra : ''}`)
  if (!ok) fallos++
}

const lb = nodos.find(n => (n['@id'] || '').includes('#localbusiness'))
const fs = nodos.find(n => (n['@id'] || '').includes('#financialservice'))

console.log('\n=== producción: iriatalan.com.mx ===')
check(lb.openingHours === 'Mo-Fr 09:00-17:00', 'openingHours', lb.openingHours)
check(fs?.serviceType?.[0] === 'Seguros de Vida', 'serviceType abre con Seguros de Vida', fs?.serviceType?.[0])
check(!/· LSE ·/.test(fs?.description || ''), 'bio sin "· LSE ·"')
check(!/comisión deja/i.test(fs?.description || ''), 'bio sin "comisión deja"')

const sobre = await (await fetch(SITE + '/sobre-iria', { headers: { 'cache-control': 'no-cache' } })).text()
const og = (sobre.match(/<meta property="og:description" content="([^"]*)"/) || [])[1]
check(og && !/LSE/.test(og), 'OG description de /sobre-iria sin LSE')
const lseCuerpo = (sobre.match(/London School of Economics/g) || []).length
check(lseCuerpo >= 1, 'LSE conservado en el inventario de credenciales', `${lseCuerpo} menciones`)

console.log(fallos === 0 ? '\n✅ Producción verificada.' : `\n❌ ${fallos} fallo(s).`)
process.exit(fallos === 0 ? 0 : 1)
