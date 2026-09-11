import { Language, SiteSettings } from '../types';
import { SITE_MEDIA_BASE_URL, COMPLEMENTARY_PACKS, FAQ_ITEMS } from '../data';

/**
 * SEO — moteur de balisage piloté par le client.
 *
 * L'app est une SPA en rendu client (Vite, sans router). Google exécute le JS
 * et voit le DOM final, mais les balises <head> statiques de index.html servent
 * de repli pour les crawlers qui ne l'exécutent pas. Ce module synchronise à
 * chaque navigation / changement de langue :
 *   - <title> + meta description (uniques par vue et par langue)
 *   - Open Graph + Twitter Cards (partages WhatsApp de la diaspora)
 *   - canonical + hreflang réciproques (URLs distinctes /fr et /en)
 *   - JSON-LD : RealEstateAgent, Product (packs), FAQPage, BreadcrumbList
 *   - noindex sur la route admin
 *
 * Stratégie de rendu retenue : CSR + URLs par langue via History API, avec
 * prerendering statique recommandé en prochaine étape (voir README du rapport).
 */

export type SeoView = 'home' | 'masterplan' | 'admin';

/* ------------------------------------------------------------------ */
/* Chemins par langue / vue (URLs distinctes = hreflang crédible)      */
/* ------------------------------------------------------------------ */

const LANG_PREFIX: Record<Language, string> = { FR: '/fr', EN: '/en' };

/** Langue déduite du chemin : /en* → EN, tout le reste → FR (défaut). */
export function detectLanguageFromPath(pathname: string): Language {
  return pathname.startsWith('/en') ? 'EN' : 'FR';
}

/** Vue déduite du chemin : suffixe « /plan » → masterplan, sinon home (admin géré à part). */
export function detectViewFromPath(pathname: string): 'home' | 'masterplan' {
  return /^\/(?:fr|en)?\/plan(?:\/|$)/.test(pathname) ? 'masterplan' : 'home';
}

/** Chemin canonique d'une vue publique dans une langue. */
export function getViewPath(lang: Language, view: 'home' | 'masterplan'): string {
  return view === 'masterplan' ? `${LANG_PREFIX[lang]}/plan` : LANG_PREFIX[lang];
}

/* ------------------------------------------------------------------ */
/* Copies SEO uniques par vue et par langue (mots-clés ciblés)         */
/* ------------------------------------------------------------------ */

const TITLES: Record<SeoView, Record<Language, string>> = {
  home: {
    FR: 'Acheter un terrain au Sénégal | Sébikhotane dès 300 €/mois',
    EN: 'Buy Land in Senegal | Sebikhotane plots from €300/mo',
  },
  masterplan: {
    FR: 'Plan du domaine Sébikhotane | 54 parcelles avec NICAD',
    EN: 'Domain Map Sebikhotane | 54 plots with NICAD title',
  },
  admin: {
    FR: 'Espace Gérant | Sénégal Immobilier Consulting',
    EN: 'Admin | Sénégal Immobilier Consulting',
  },
};

const DESCRIPTIONS: Record<SeoView, Record<Language, string>> = {
  home: {
    FR: "Parcelles de 150 m² à Sébikhotane, délibération + NICAD, à 20 min de l'AIBD et 4 km du TER. Acompte 3 000 € puis 300 €/mois, sécurisé diaspora.",
    EN: '150 m² plots in Sebikhotane, deliberation + NICAD title, 20 min from AIBD, 4 km from the TER. €3,000 down then €300/month — diaspora-safe.',
  },
  masterplan: {
    FR: "Plan du domaine Dun Tni : 54 parcelles de 150 m², bornage B1-B17, statut en temps réel et simulateur de financement 300 €/mois.",
    EN: 'Dun Tni domain map: 54 plots of 150 m², B1–B17 boundary markers, real-time availability and a €300/month financing simulator.',
  },
  admin: {
    FR: 'Espace de gestion privé — réservé à l’administrateur.',
    EN: 'Private management area — reserved for the administrator.',
  },
};

const DEFAULT_OG_IMAGE = `${SITE_MEDIA_BASE_URL}/images/hero.jpg`;

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
    document.title = TITLES.admin[language];
    upsertMeta('name', 'description', DESCRIPTIONS.admin[language]);
    upsertMeta('name', 'robots', 'noindex, nofollow');
    upsertLink('canonical', `${origin}${isEditor ? '/admin/editor' : '/admin'}`);
    return;
  }
  upsertMeta('name', 'robots', 'index, follow');

  const path = getViewPath(language, view);
  const url = `${origin}${path}`;
  const title = TITLES[view][language];
  const description = DESCRIPTIONS[view][language];
  // Image partagée (OG/Twitter/JSON-LD) : suit le hero éditée depuis l'admin
  const ogImage = settings.heroImage || DEFAULT_OG_IMAGE;

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
  upsertMeta('property', 'og:image:alt', 'Vue aérienne du domaine Dun Tni à Sébikhotane, Sénégal');
  upsertMeta('property', 'og:locale', language === 'FR' ? 'fr_FR' : 'en_US');
  upsertMeta('property', 'og:locale:alternate', language === 'FR' ? 'en_US' : 'fr_FR');

  // Twitter Card
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', ogImage);

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
export function langViewPath(lang: Language, view: 'home' | 'masterplan'): string {
  return getViewPath(lang, view);
}