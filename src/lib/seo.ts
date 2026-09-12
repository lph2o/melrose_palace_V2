import { Language, SiteSettings } from '../types';
import { COMPLEMENTARY_PACKS, FAQ_ITEMS } from '../data';
import routeMetaJson from '../seo/routeMeta.json';

/**
 * SEO — moteur de balisage piloté par le client.
 *
 * L'app est une SPA en rendu client (Vite, sans router). Google exécute le JS
 * et voit le DOM final, mais **WhatsApp, Facebook, LinkedIn et X n'exécutent
 * pas le JS** : pour eux, seules comptent les balises présentes dans le HTML
 * servi. C'est pourquoi les mêmes copies existent à deux endroits :
 *
 *  1. `scripts/prerender-routes.cjs` (postbuild) écrit un `dist/<route>/index.html`
 *     par route (/fr, /en, /fr/plan, /en/plan) avec le <head> complet — c'est ce
 *     que lisent les crawlers qui n'exécutent pas JS ;
 *  2. ce module réapplique les mêmes valeurs côté client à chaque navigation /
 *     changement de langue (titre, description, OG, Twitter, canonical,
 *     hreflang, JSON-LD, noindex sur /admin).
 *
 * Les deux lisent **`src/seo/routeMeta.json`** : une seule source de vérité, donc
 * aucune dérive possible entre le HTML pré-rendu et la version client.
 *
 * Les images de partage (`public/og/*.jpg`, 1200×630) sont générées par
 * `swift scripts/make-og-image.swift` et servies depuis notre propre domaine
 * (pas de dépendance à Supabase pour une requête de crawler).
 */

export type SeoView = 'home' | 'masterplan' | 'admin';
export type PublicView = 'home' | 'masterplan';

/* ------------------------------------------------------------------ */
/* Source unique de vérité (partagée avec scripts/prerender-routes.cjs) */
/* ------------------------------------------------------------------ */

export interface RouteMeta {
  title: string;
  description: string;
  /** Chemin de l'image de partage, relatif au domaine. */
  ogImage: string;
  imageAlt: string;
  /** Texte de la carte de partage (généré dans l'image). */
  shareTitle: string;
  shareFooter: string;
  kicker: string;
}

const PUBLISHED_ROUTES = routeMetaJson.routes as Record<
  PublicView,
  { path: Record<Language, string>; meta: Record<Language, RouteMeta> }
>;
const ADMIN_META = routeMetaJson.admin as Record<Language, { title: string; description: string }>;

/** Métadonnées d'une route publique dans une langue. */
export function routeMeta(view: PublicView, language: Language): RouteMeta {
  return PUBLISHED_ROUTES[view].meta[language];
}

/** Routes publiées, pour la génération des fichiers statiques et du sitemap. */
export const PUBLIC_ROUTES = PUBLISHED_ROUTES;

/** Langue déduite du chemin : /en* → EN, tout le reste → FR (défaut). */
export function detectLanguageFromPath(pathname: string): Language {
  return pathname.startsWith('/en') ? 'EN' : 'FR';
}

/** Vue déduite du chemin : suffixe « /plan » → masterplan, sinon home (admin géré à part). */
export function detectViewFromPath(pathname: string): 'home' | 'masterplan' {
  return /^\/(?:fr|en)?\/plan(?:\/|$)/.test(pathname) ? 'masterplan' : 'home';
}

/** Chemin canonique d'une vue publique dans une langue. */
export function getViewPath(lang: Language, view: PublicView): string {
  return PUBLISHED_ROUTES[view].path[lang];
}

/** Dimensions des cartes de partage générées (voir scripts/make-og-image.swift). */
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** URL absolue d'une image de partage (les crawlers n'acceptent pas de chemin relatif). */
function absoluteAssetUrl(origin: string, path: string): string {
  return /^https?:\/\//.test(path) ? path : `${origin}${path}`;
}

/* ------------------------------------------------------------------ */
/* Helpers DOM (upsert, jamais de doublons)                            */
/* ------------------------------------------------------------------ */

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
  const link = document.createElement('link');
  link.setAttribute('rel', rel);
  link.setAttribute('href', href);
  if (hreflang) link.setAttribute('hreflang', hreflang);
  document.head.appendChild(link);
}

function upsertJsonLd(id: string, data: unknown) {
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

function organizationLd(settings: SiteSettings, url: string, image: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'RealEstateAgent'],
    name: settings.companyName,
    url,
    image,
    telephone: settings.whatsappNumber,
    email: settings.contactEmail,
    address: {
      '@type': 'PostalAddress',
      addressLocality: settings.contactAddress ?? 'Dakar, Sénégal',
      addressCountry: 'SN',
    },
    areaServed: { '@type': 'Country', name: 'Sénégal' },
    priceRange: '€€',
  };
}

function productLd(settings: SiteSettings, url: string, lang: Language, image: string) {
  const packs = settings.content?.packs ?? COMPLEMENTARY_PACKS;
  return packs.map((pack, i) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pack.title[lang] || `Pack ${i + 1}`,
    description: pack.description[lang] || '',
    brand: { '@type': 'Brand', name: settings.companyName },
    url: `${url}#packs`,
    image,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'EUR',
      price: settings.basePrice,
      url: `${url}#packs`,
    },
  }));
}

function faqLd(settings: SiteSettings, lang: Language) {
  const items = settings.content?.faq ?? FAQ_ITEMS;
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question[lang],
      acceptedAnswer: { '@type': 'Answer', text: f.answer[lang] },
    })),
  };
}

function breadcrumbLd(url: string, lang: Language) {
  const home = lang === 'FR' ? 'Accueil' : 'Home';
  const plan = lang === 'FR' ? 'Plan du domaine' : 'Domain map';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: home, item: url.replace(/\/plan$/, '') },
      { '@type': 'ListItem', position: 2, name: plan, item: url },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Application globale                                                  */
/* ------------------------------------------------------------------ */

export interface SeoInput {
  settings: SiteSettings;
  language: Language;
  view: SeoView;
}

export function applySeo({ settings, language, view }: SeoInput) {
  const origin = window.location.origin;
  const lang = language.toLowerCase();

  // <html lang> correct selon la langue active
  document.documentElement.setAttribute('lang', lang);

  // Routes d'administration (/admin et /admin/editor) : interdiction
  // d'indexation, pas de hreflang ni de JSON-LD public. Elles sont aussi
  // exclues du sitemap et bloquées dans robots.txt (prebuild).
  if (view === 'admin') {
    const isEditor =
      window.location.hash === '#/admin/editor' || /\/admin\/editor\/?$/.test(window.location.pathname);
    document.title = ADMIN_META[language].title;
    upsertMeta('name', 'description', ADMIN_META[language].description);
    upsertMeta('name', 'robots', 'noindex, nofollow');
    upsertLink('canonical', `${origin}${isEditor ? '/admin/editor' : '/admin'}`);
    return;
  }
  upsertMeta('name', 'robots', 'index, follow');

  const path = getViewPath(language, view as PublicView);
  const url = `${origin}${path}`;
  const meta = routeMeta(view as PublicView, language);
  const title = meta.title;
  const description = meta.description;
  // Image de partage dédiée (1200×630) : elle ne suit pas le hero de l'admin,
  // pour que le partage social reste lisible et stable dans le temps.
  const ogImage = absoluteAssetUrl(origin, meta.ogImage);

  // Title + description uniques
  document.title = title;
  upsertMeta('name', 'description', description);

  // Canonical
  upsertLink('canonical', url);

  // hreflang réciproques + x-default (FR = langue par défaut)
  const frUrl = `${origin}${getViewPath('FR', view)}`;
  const enUrl = `${origin}${getViewPath('EN', view)}`;
  upsertLink('alternate', frUrl, 'fr');
  upsertLink('alternate', enUrl, 'en');
  upsertLink('alternate', frUrl, 'x-default');

  // Open Graph (partages WhatsApp)
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', settings.companyName);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', ogImage);
  upsertMeta('property', 'og:image:secure_url', ogImage);
  upsertMeta('property', 'og:image:type', 'image/jpeg');
  upsertMeta('property', 'og:image:width', String(OG_IMAGE_WIDTH));
  upsertMeta('property', 'og:image:height', String(OG_IMAGE_HEIGHT));
  upsertMeta('property', 'og:image:alt', meta.imageAlt);
  upsertMeta('property', 'og:locale', language === 'FR' ? 'fr_FR' : 'en_US');
  upsertMeta('property', 'og:locale:alternate', language === 'FR' ? 'en_US' : 'fr_FR');

  // Twitter Card
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', ogImage);
  upsertMeta('name', 'twitter:image:alt', meta.imageAlt);

  // JSON-LD
  upsertJsonLd('ld-organization', organizationLd(settings, url, ogImage));
  productLd(settings, url, language, ogImage).forEach((block, i) => upsertJsonLd(`ld-product-${i}`, block));
  const faq = faqLd(settings, language);
  if (faq) upsertJsonLd('ld-faq', faq);
  else document.getElementById('ld-faq')?.remove();
  if (view === 'masterplan') {
    upsertJsonLd('ld-breadcrumb', breadcrumbLd(url, language));
  } else {
    document.getElementById('ld-breadcrumb')?.remove();
  }
}

/** Renvoie le chemin public (langue + vue) depuis le chemin courant. */
export function langViewPath(lang: Language, view: PublicView): string {
  return getViewPath(lang, view);
}