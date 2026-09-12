#!/usr/bin/env node
/**
 * Génère public/robots.txt et public/sitemap.xml pour le SEO.
 *
 * - En dev (NODE_ENV !== 'production') : robots.txt bloque toute indexation
 *   (un site en local ne doit jamais être crawlé).
 * - En build / déploiement (NODE_ENV === 'production') : indexation autorisée,
 *   /admin bloqué, sitemap référencé.
 * - SITE_URL (variable d'environnement) : domaine public définitif
 *   (ex. https://www.duntni-sebikhotane.com). À renseigner dans
 *   l'environnement de déploiement — défaut : placeholder à remplacer.
 *   Sur Vercel, à défaut de SITE_URL, on retombe sur les variables fournies
 *   par la plateforme (VERCEL_PROJECT_PRODUCTION_URL puis VERCEL_URL) pour
 *   que robots.txt / sitemap.xml pointent sur une URL réelle dès le premier
 *   déploiement, sans configuration supplémentaire.
 *
 * - Environnement : sur Vercel, seuls les déploiements de production sont
 *   indexables (VERCEL_ENV === 'production') ; les previews sont bloquées,
 *   comme en local hors production.
 *
 * Exécuté automatiquement avant chaque build (script npm « prebuild »).
 */
const fs = require('fs');
const path = require('path');
const { ROOT, resolveSiteUrl, isProdBuild, siteUrlWarning } = require('./lib/site-url.cjs');

const site = resolveSiteUrl();
const SITE_URL = site.url;
const isProd = isProdBuild();
const today = new Date().toISOString().slice(0, 10);

const warning = siteUrlWarning(site);
if (warning) console.warn(warning);

/* ------------------------------------------------------------------ */
/* robots.txt                                                          */
/* ------------------------------------------------------------------ */

const robots = isProd
  ? [
      '# robots.txt généré par scripts/generate-seo-files.cjs (npm run build)',
      '# SITE_URL : ' + SITE_URL,
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      '',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      '',
    ].join('\n')
  : [
      '# robots.txt généré par scripts/generate-seo-files.cjs — environnement NON production.',
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');

fs.writeFileSync(path.join(ROOT, 'public', 'robots.txt'), robots);

/* ------------------------------------------------------------------ */
/* sitemap.xml (routes par langue + vues)                              */
/* ------------------------------------------------------------------ */

const views = [
  { suffix: '', fr: '/fr', en: '/en', priority: '1.0', freq: 'weekly' },
  { suffix: '/plan', fr: '/fr/plan', en: '/en/plan', priority: '0.8', freq: 'weekly' },
];

let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap +=
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
  'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

for (const view of views) {
  const entries = [
    { lang: 'fr', url: view.fr },
    { lang: 'en', url: view.en },
  ];
  for (const entry of entries) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${SITE_URL}${entry.url}</loc>\n`;
    sitemap += `    <lastmod>${today}</lastmod>\n`;
    sitemap += `    <changefreq>${view.freq}</changefreq>\n`;
    sitemap += `    <priority>${view.priority}</priority>\n`;
    // hreflang réciproques dans le sitemap
    for (const alt of entries) {
      sitemap += `    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${SITE_URL}${alt.url}" />\n`;
    }
    sitemap += '  </url>\n';
  }
}
sitemap += '</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), sitemap);

console.log(
  `SEO files générés (${isProd ? 'production' : 'dev'}, SITE_URL=${SITE_URL}) :\n` +
    '  public/robots.txt\n  public/sitemap.xml'
);