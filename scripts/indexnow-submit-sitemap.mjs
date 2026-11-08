#!/usr/bin/env node
// Envío inicial a IndexNow: lee el sitemap de producción y avisa todas sus URLs
// de una sola vez. Útil después de cambios grandes o si Bing se atora procesando
// el sitemap. Los avisos del día a día los hace /api/revalidate solo.
//
// Uso:
//   node scripts/indexnow-submit-sitemap.mjs           # dry-run: lista URLs, no envía
//   node scripts/indexnow-submit-sitemap.mjs --send    # envía a api.indexnow.org
//
// La clave debe coincidir con src/lib/indexnow.ts y con public/<clave>.txt.

const KEY = "bbff919a3256fcbc60a26f15f3e2a97b";
const HOST = "iriatalan.com.mx";
const ORIGIN = `https://${HOST}`;
const SEND = process.argv.includes("--send");

async function main() {
  // 1. La clave tiene que estar publicada, si no IndexNow rechaza el envío (403).
  const keyRes = await fetch(`${ORIGIN}/${KEY}.txt`);
  const keyBody = (await keyRes.text()).trim();
  if (!keyRes.ok || keyBody !== KEY) {
    console.error(`✗ La clave no está publicada en ${ORIGIN}/${KEY}.txt (status ${keyRes.status}). ¿Ya se hizo el deploy?`);
    process.exit(1);
  }
  console.log("✓ Clave publicada y correcta.");

  // 2. URLs del sitemap.
  const smRes = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!smRes.ok) {
    console.error(`✗ No se pudo leer el sitemap (status ${smRes.status}).`);
    process.exit(1);
  }
  const xml = await smRes.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.startsWith(`${ORIGIN}/`) || u === ORIGIN);
  console.log(`✓ ${urls.length} URLs en el sitemap.`);

  if (!SEND) {
    urls.forEach((u) => console.log("  ", u));
    console.log("\nDry-run: no se envió nada. Corre con --send para avisar a IndexNow.");
    return;
  }

  // 3. Envío (el protocolo acepta hasta 10,000 URLs por llamada).
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: urls }),
  });
  const ok = res.status === 200 || res.status === 202;
  console.log(`${ok ? "✓" : "✗"} IndexNow respondió ${res.status}${res.status === 202 ? " (recibido; verificación de clave en curso)" : ""}.`);
  if (!ok) {
    console.log(await res.text());
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
