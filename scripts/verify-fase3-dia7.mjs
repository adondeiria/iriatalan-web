/**
 * Día 7 — verifica el bloque de Fase 3 contra el render real del servidor.
 *
 * Dos cosas, y las dos se comprueban donde importa (HTML servido y cabeceras
 * HTTP), no leyendo el código:
 *
 *  1. El campo trampa está en los 5 formularios. Antes solo lo tenía el de
 *     /contacto: las guardas de /api/contact son fail-open a propósito
 *     ("forms viejos sin estos campos no se rompen"), así que los 4 lead
 *     magnets no tenían antispam en absoluto.
 *  2. /descargas/* responde `X-Robots-Tag: noindex`. Los PDF son el pago del
 *     formulario; indexados, la puerta queda de adorno.
 *
 * Uso: node scripts/verify-fase3-dia7.mjs [baseUrl]
 *      (default http://localhost:3999)
 */
const BASE = process.argv[2] || 'http://localhost:3999'

let fallos = 0
const check = (ok, etiqueta, extra = '') => {
  console.log(`${ok ? '  OK ' : '  ** '} ${etiqueta}${extra ? ' — ' + extra : ''}`)
  if (!ok) fallos++
}

// --- 1. Campo trampa en los formularios ---------------------------------
// Cada ruta debe servir el input oculto `name="website"` con su id propio.
// El id único importa: si dos formularios coincidieran en una página, un id
// repetido rompería la asociación del <label>.
const FORMULARIOS = [
  { ruta: '/contacto', prefijo: 'contacto' },
  { ruta: '/guia', prefijo: 'guia' },
  // Los 3 restantes son bloques dentro de artículos de Sanity.
  { ruta: '/blog/testamento-no-protege-seguros-vida-cuentas', prefijo: 'checkup' },
  { ruta: '/blog/incremento-costos-universitarios-mexico', prefijo: 'calculadora' },
  { ruta: '/blog/como-dejar-dinero-hijo-autismo-discapacidad-mexico', prefijo: 'checklist' },
]

console.log('=== campo trampa (honeypot) ===')
for (const f of FORMULARIOS) {
  const res = await fetch(BASE + f.ruta, { headers: { 'cache-control': 'no-cache' } })
  const html = await res.text()
  check(res.status === 200, `${f.ruta} responde 200`, String(res.status))
  check(
    html.includes(`id="${f.prefijo}-website"`) && html.includes('name="website"'),
    `${f.ruta} sirve el campo trampa`,
    `${f.prefijo}-website`
  )
}

// --- 2. /descargas/* fuera del índice -----------------------------------
console.log('\n=== /descargas/* ===')
const ARCHIVOS = [
  '/descargas/check-up-patrimonial-beneficiarios.pdf',
  '/descargas/checklist-proteccion-hijo-discapacidad.pdf',
  '/descargas/guia-8-tramites-fallecimiento.pdf',
]
for (const a of ARCHIVOS) {
  const res = await fetch(BASE + a, { method: 'HEAD' })
  const tag = res.headers.get('x-robots-tag') || ''
  // Sigue descargable: el noindex no debe romper el enlace que ve quien SÍ
  // llenó el formulario.
  check(res.status === 200, `${a.split('/').pop()} sigue accesible`, String(res.status))
  check(/noindex/i.test(tag), '  X-Robots-Tag: noindex', tag || '(sin cabecera)')
}

// robots.txt NO debe bloquear /descargas/: si lo bloqueara, el crawler no
// podría leer el noindex de arriba y la URL podría acabar indexada igual.
const robots = await (await fetch(BASE + '/robots.txt')).text()
check(!/Disallow:\s*\/descargas/i.test(robots), 'robots.txt NO bloquea /descargas/ (para que el noindex se pueda leer)')

console.log(fallos === 0 ? '\n✅ Todo verde.' : `\n❌ ${fallos} fallo(s).`)
process.exit(fallos === 0 ? 0 : 1)
