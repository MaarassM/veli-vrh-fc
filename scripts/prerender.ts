// Nakon `vite build`: za svaku statičnu rutu zapiše vlastiti HTML s pravim
// naslovom i opisom, te generira sitemap.xml.
//
// Zašto: aplikacija je SPA, pa svaki URL inače servira isti index.html.
// Googleov robot to izvrti, ali Facebook, WhatsApp i Viber ne — oni čitaju
// samo sirovi HTML, pa bi svaka podijeljena poveznica izgledala jednako.
// Pokretanje: npx tsx scripts/prerender.ts [dist-direktorij]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { ROUTE_SEO, SITE_URL } from '../src/lib/seo-routes'

const dist = process.argv[2] ?? 'dist'
const shell = readFileSync(join(dist, 'index.html'), 'utf8')

/** HTML atribut ne smije sadržavati navodnike ni kutne zagrade. */
function attr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function replaceOne(html: string, pattern: RegExp, replacement: string, what: string): string {
  if (!pattern.test(html)) throw new Error(`Prerender: nije pronađen ${what} u index.html`)
  return html.replace(pattern, replacement)
}

function pageHtml(title: string, description: string, url: string): string {
  let html = shell
  html = replaceOne(html, /<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`, 'title')
  html = replaceOne(
    html,
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${attr(description)}"`,
    'meta description',
  )
  html = replaceOne(
    html,
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${attr(url)}"`,
    'canonical',
  )
  for (const [key, value] of [
    ['og:title', title],
    ['og:description', description],
    ['og:url', url],
  ] as const) {
    html = replaceOne(
      html,
      new RegExp(`<meta property="${key}" content="[^"]*"`),
      `<meta property="${key}" content="${attr(value)}"`,
      key,
    )
  }
  for (const [key, value] of [
    ['twitter:title', title],
    ['twitter:description', description],
  ] as const) {
    html = replaceOne(
      html,
      new RegExp(`<meta name="${key}" content="[^"]*"`),
      `<meta name="${key}" content="${attr(value)}"`,
      key,
    )
  }
  return html
}

function writePage(path: string, html: string) {
  // Svaka ruta dobiva vlastiti direktorij s index.html ("/utakmice" -> "utakmice/index.html").
  // Tako Vercel servira datoteku na čistom URL-u, a nepoznate putanje i dalje
  // padaju na SPA fallback iz vercel.json — što bi "cleanUrls" pokvario.
  const file = path === '/' ? join(dist, 'index.html') : join(dist, path.slice(1), 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const today = new Date().toISOString().slice(0, 10)

for (const route of ROUTE_SEO) {
  writePage(route.path, pageHtml(route.title, route.description, SITE_URL + route.path))
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTE_SEO.map(r =>
    [
      '  <url>',
      `    <loc>${SITE_URL}${r.path === '/' ? '/' : r.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n')

writeFileSync(join(dist, 'sitemap.xml'), sitemap)

console.log(`[prerender] ${ROUTE_SEO.length} stranica + sitemap.xml`)
