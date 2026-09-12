/**
 * Résolution de l'origine publique du site, partagée par les scripts de build
 * (robots.txt / sitemap.xml et pré-rendu des balises de partage).
 *
 * Ordre de priorité :
 *   1. `SITE_URL` (domaine définitif, ex. https://www.duntni-sebikhotane.com) ;
 *   2. les variables fournies par Vercel (`VERCEL_PROJECT_PRODUCTION_URL`,
 *      puis `VERCEL_URL`) pour que les liens absolus soient corrects dès le
 *      premier déploiement, sans configuration ;
 *   3. un placeholder explicite en local.
 */
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const PLACEHOLDER_URL = 'https://votre-domaine.com';

function resolveSiteUrl() {
  const explicit = process.env.SITE_URL;
  const fromPlatform =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || '';
  const raw = explicit || fromPlatform;
  if (!raw) {
    return { url: PLACEHOLDER_URL, explicit: false, fromPlatform: false };
  }
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return {
    url: withScheme.replace(/\/+$/, ''),
    explicit: Boolean(explicit),
    fromPlatform: !explicit && Boolean(fromPlatform),
  };
}

/**
 * Environnement de production ? Sur Vercel, seuls les déploiements de
 * production sont indexables (`VERCEL_ENV === 'production'`) : les previews
 * sont des URLs temporaires qui ne doivent jamais être crawlées.
 */
function isProdBuild() {
  return process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === 'production'
    : process.env.NODE_ENV === 'production';
}

/** Message d'avertissement commun lorsque SITE_URL n'est pas définie. */
function siteUrlWarning(site) {
  if (site.explicit) return null;
  return site.fromPlatform
    ? `ℹ  SITE_URL non définie — URL Vercel utilisée (${site.url}). ` +
        'Définissez SITE_URL (ex. https://www.duntni-sebikhotane.com) pour figer le domaine public.'
    : '⚠  SITE_URL non définie — placeholder utilisé dans robots.txt / sitemap.xml / balises de partage. ' +
        'Définissez SITE_URL (ex. https://www.duntni-sebikhotane.com) avant la mise en production.';
}

module.exports = { ROOT, PLACEHOLDER_URL, resolveSiteUrl, isProdBuild, siteUrlWarning };
