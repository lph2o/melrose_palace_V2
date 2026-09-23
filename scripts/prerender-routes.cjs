#!/usr/bin/env node
/**
 * Postbuild — écrit un `index.html` par route publique, avec le <head> complet
 * (title, description, Open Graph, Twitter Card, canonical, hreflang).
 *
 * Pourquoi : l'app est une SPA. WhatsApp, Facebook, LinkedIn et X **n'exécutent
 * pas le JavaScript** : ils lisent le HTML tel qu'il est servi. Sans ce script,
 * tous les liens partagés affichent donc la même carte (celle de `index.html`),
 * et `/en/plan` partage une carte en français.
 *
 * Les routes deviennent de vrais fichiers statiques :
 *
 *   dist/index.html               → / (repli SPA, carte FR)
 *   dist/fr/index.html            → /fr
 *   dist/en/index.html            → /en
 *   dist/fr/plan/index.html       → /fr/plan
 *   dist/en/plan/index.html       → /en/plan
 *   dist/fr/mentions-legales/index.html → /fr/mentions-legales
 *   dist/en/legal-notice/index.html     → /en/legal-notice
 *   dist/admin/index.html         → /admin (noindex)
 *   dist/admin/editor/index.html  → /admin/editor (noindex)
 *
 * Les routes publiques ne sont pas listées ici : elles viennent de
 * `src/seo/routeMeta.json`. Ajouter une vue (`home`, `masterplan`, `legal`…) se
 * fait donc dans ce JSON seul — ce script, le sitemap et le client lisent tous
 * la même source.
 *
 * Vercel sert un fichier existant **avant** d'appliquer une `rewrite` : ces
 * pages prennent donc le pas sur la réécriture SPA de vercel.json, sans toucher
 * au comportement de l'app (même bundle, le client réapplique les mêmes balises
 * via src/lib/seo.ts).
 *
 * Les copies viennent de `src/seo/routeMeta.json` — la même source que le code
 * client, donc aucune divergence possible entre HTML servi et version JS.
 *
 * Exécuté automatiquement après chaque build (script npm « postbuild »).
 */
const fs = require('fs');
const path = require('path');
const { ROOT, resolveSiteUrl, siteUrlWarning } = require('./lib/site-url.cjs');

const routeMeta = require(path.join(ROOT, 'src', 'seo', 'routeMeta.json'));

const DIST = path.join(ROOT, 'dist');
const START = '<!-- seo:route:start -->';
const END = '<!-- seo:route:end -->';

const site = resolveSiteUrl();
const origin = site.url;
const warning = siteUrlWarning(site);
if (warning && !site.explicit) {
  console.warn('ℹ  Balises de partage générées avec ' + origin);
}

/** Échappe une valeur destinée à un attribut HTML ou à <title>. */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Bloc <head> d'une route. Les URLs sont absolues : les crawlers sociaux
 * n'acceptent ni chemin relatif ni URL sans schéma.
 */
function headBlock({ lang, meta, canonical, alternates }) {
  const image = meta.ogImage.startsWith('http') ? meta.ogImage : `${origin}${meta.ogImage}`;
  const rows = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
  ];

  for (const alt of alternates) {
    rows.push(`<link rel="alternate" hreflang="${alt.hreflang}" href="${esc(alt.href)}" />`);
  }

  rows.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Senegal Investment Consulting" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(meta.imageAlt)}" />`,
    `<meta property="og:locale" content="${lang === 'FR' ? 'fr_FR' : 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${lang === 'FR' ? 'en_US' : 'fr_FR'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(meta.imageAlt)}" />`
  );

  return rows.map((row) => `    ${row}`).join('\n');
}

/** Remplace le bloc balisé et l'attribut lang du <html>. */
function withHead(template, { lang, block }) {
  const startIndex = template.indexOf(START);
  const endIndex = template.indexOf(END);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `Marqueurs ${START} / ${END} introuvables dans dist/index.html — ` +
        'vérifiez index.html avant de relancer le build.'
    );
  }
  const withBlock =
    template.slice(0, startIndex + START.length) +
    '\n' +
    block +
    '\n    ' +
    template.slice(endIndex);
  return withBlock.replace(/<html[^>]*>/, `<html lang="${lang.toLowerCase()}">`);
}

function alternatesFor(view) {
  const paths = routeMeta.routes[view].path;
  return [
    { hreflang: 'fr', href: `${origin}${paths.FR}` },
    { hreflang: 'en', href: `${origin}${paths.EN}` },
    { hreflang: 'x-default', href: `${origin}${paths.FR}` },
  ];
}

/**
 * Bloc <head> d'une route d'administration : aucun partage social, aucune
 * hreflang, et surtout `noindex` en dur. Sans ce fichier, `/admin` héritait du
 * titre et de la carte de partage de la page d'accueil (le repli SPA servant
 * dist/index.html) — trompeur si un crawler l'atteint.
 */
function adminHeadBlock(meta) {
  return [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="noindex, nofollow" />`,
  ]
    .map((row) => `    ${row}`)
    .join('\n');
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('✗ dist/index.html introuvable — lancez `npm run build` (ce script est un postbuild).');
  process.exit(1);
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const written = [];

// 1. La racine sert la page d'accueil FR (canonical vers /fr).
const homePaths = routeMeta.routes.home.path;
fs.writeFileSync(
  path.join(DIST, 'index.html'),
  withHead(template, {
    lang: 'FR',
    block: headBlock({
      lang: 'FR',
      meta: routeMeta.routes.home.meta.FR,
      canonical: `${origin}${homePaths.FR}`,
      alternates: alternatesFor('home'),
    }),
  })
);
written.push('dist/index.html');

// 2. Routes d'administration : noindex, jamais partagées.
for (const adminPath of ['/admin', '/admin/editor']) {
  const target = path.join(DIST, adminPath.replace(/^\//, ''), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    target,
    withHead(template, {
      lang: 'FR',
      block: adminHeadBlock(routeMeta.admin.FR),
    })
  );
  written.push(`dist${adminPath}/index.html`);
}

// 3. Une page par route publique et par langue.
for (const [view, config] of Object.entries(routeMeta.routes)) {
  for (const lang of ['FR', 'EN']) {
    const routePath = config.path[lang];
    const target = path.join(DIST, routePath.replace(/^\//, ''), 'index.html');
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      withHead(template, {
        lang,
        block: headBlock({
          lang,
          meta: config.meta[lang],
          canonical: `${origin}${routePath}`,
          alternates: alternatesFor(view),
        }),
      })
    );
    written.push(`dist${routePath}/index.html`);
  }
}

console.log(`Balises de partage par route générées (origine ${origin}) :`);
for (const file of written) console.log(`  ${file}`);
