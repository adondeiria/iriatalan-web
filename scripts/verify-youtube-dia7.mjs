/**
 * Día 7 — verifica el render REAL del enlace artículo↔video.
 *
 * Se verifica contra el servidor, no contra el código ni una maqueta: es la
 * regla que dejó el proyecto después de que las maquetas HTML distorsionaran
 * lo que en realidad se servía.
 *
 * Uso: node scripts/verify-youtube-dia7.mjs [baseUrl]
 *      (default http://localhost:3999 — para producción pasar la URL)
 */
const BASE = process.argv[2] || 'http://localhost:3999'

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

let fallos = 0
const check = (ok, etiqueta, extra = '') => {
  console.log(`${ok ? '  OK ' : '  ** '} ${etiqueta}${extra ? ' — ' + extra : ''}`)
  if (!ok) fallos++
}

const CASOS = [
  {
    ruta: '/blog/seguro-gastos-medicos-maternidad',
    videoId: 's5OHhBvQbYs',
    duration: 'PT3M52S',
    tipoPadre: 'Article',
  },
  {
    ruta: '/sobre-iria',
    videoId: 'Dpo_No0sBuk',
    duration: 'PT3M44S',
    tipoPadre: null, // /sobre-iria no emite Article; el VideoObject va suelto
  },
]

for (const caso of CASOS) {
  console.log(`\n=== ${caso.ruta} ===`)
  const res = await fetch(BASE + caso.ruta, { headers: { 'cache-control': 'no-cache' } })
  const html = await res.text()
  check(res.status === 200, 'responde 200', String(res.status))

  const g = leerGrafo(html)
  const vo = g.find(n => n['@type'] === 'VideoObject')
  check(Boolean(vo), 'emite VideoObject en el grafo')
  if (vo) {
    // Los 4 campos que schema.org marca como requeridos.
    check(Boolean(vo.name), 'VideoObject.name', vo.name)
    check(Boolean(vo.description), 'VideoObject.description', (vo.description || '').slice(0, 60) + '…')
    check(Boolean(vo.uploadDate), 'VideoObject.uploadDate', vo.uploadDate)
    check(
      (vo.thumbnailUrl || '').includes(caso.videoId),
      'VideoObject.thumbnailUrl apunta al video',
      vo.thumbnailUrl
    )
    check(vo.duration === caso.duration, 'VideoObject.duration', vo.duration)
    check(
      (vo.embedUrl || '').includes('youtube-nocookie.com'),
      'embedUrl usa youtube-nocookie',
      vo.embedUrl
    )
    check(Boolean(vo['@id']), 'VideoObject tiene @id', vo['@id'])
  }

  if (caso.tipoPadre) {
    const padre = g.find(n => n['@type'] === caso.tipoPadre)
    check(Boolean(padre), `emite ${caso.tipoPadre}`)
    check(
      padre?.video?.['@id'] === vo?.['@id'],
      `${caso.tipoPadre}.video referencia el @id del VideoObject`,
      padre?.video?.['@id']
    )
  }

  // El facade: miniatura servida por el optimizador de Next (no por i.ytimg
  // directo) y CERO iframe de YouTube en el HTML inicial. Si aparece un iframe
  // aquí, el embed se estaría cargando antes del consentimiento.
  check(
    html.includes('/_next/image?url=https%3A%2F%2Fi.ytimg.com'),
    'miniatura pasa por el optimizador de Next'
  )
  check(
    !/<iframe[^>]*youtube/i.test(html),
    'sin iframe de YouTube antes del clic (respeta el banner de cookies)'
  )
  check(
    html.includes(`youtube.com/watch?v=${caso.videoId}`),
    'enlace visible "verlo en YouTube"'
  )
}

console.log(fallos === 0 ? '\n✅ Todo verde.' : `\n❌ ${fallos} fallo(s).`)
process.exit(fallos === 0 ? 0 : 1)
