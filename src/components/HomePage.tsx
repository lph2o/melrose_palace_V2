import { useEffect, useMemo, useState } from 'react';
import { Render } from '@puckeditor/core/rsc';
import type { Data as PuckData } from '@puckeditor/core';
import { X } from 'lucide-react';
import { UITranslations } from '../types';
import { TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { hiddenSectionTypes } from '../site/sectionsCatalog';
import { usePuckPage } from '../puck/usePuckPage';
import { puckConfig } from '../puck/config';

/**
 * Page d'accueil publique.
 *
 * Le corps de page est rendu par `<Render />` à partir de la composition Puck
 * stockée dans `puck_pages` (une ligne par langue). Tant qu'aucune édition n'a
 * été publiée, `usePuckPage` renvoie le contenu par défaut construit depuis
 * `TRANSLATIONS` + `data.ts` : le rendu est alors identique à l'existant.
 *
 * Restent hors Puck, car pilotés par les réglages du site (Espace Gérant →
 * WhatsApp & Promotions) : le bandeau promo et la barre de progression de
 * lecture, qui encadrent le contenu quel que soit l'ordre des blocs.
 *
 * Visibilité des sections : l'Espace Gérant (onglet « Sections ») peut masquer
 * un bloc. Le filtrage se fait **au rendu**, sans toucher à la composition
 * stockée : réactiver une section réaffiche son contenu tel qu'il était.
 */
const PROMO_DISMISS_KEY = 'sic_promo_dismissed';

export default function HomePage() {
  const { language, settings, setActiveTab } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const { data } = usePuckPage(language, settings);

  // Bandeau promo piloté par les réglages du gérant, mais **jamais** affiché
  // dans la mauvaise langue : en anglais on prend la version EN si elle est
  // renseignée, sinon les libellés i18n (jamais le texte français saisi).
  const isEN = language === 'EN';
  const promoTitle =
    (isEN ? settings.promoTitleEn : settings.promoTitle)?.trim() || ui.promoBadge;
  const promoDesc =
    (isEN ? settings.promoDescEn : settings.promoDesc)?.trim() ||
    ui.promoText.replace('{remaining}', String(settings.promoPlotsRemaining));

  // Le visiteur peut refermer le bandeau. La préférence ne vit que pour la
  // session : le réglage du gérant (`promoActive`) reste la seule source de
  // vérité, on ne fait que retirer la gêne pendant la visite en cours.
  const [promoDismissed, setPromoDismissed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PROMO_DISMISS_KEY) === '1') setPromoDismissed(true);
    } catch {
      /* navigation privée : on reste simplement sur l'affichage par défaut */
    }
  }, []);
  const dismissPromo = () => {
    setPromoDismissed(true);
    try {
      sessionStorage.setItem(PROMO_DISMISS_KEY, '1');
    } catch {
      /* sans stockage, le bandeau se referme tout de même pour cette page */
    }
  };

  // Sections masquées depuis l'Espace Gérant — filtrées bloc par bloc (toutes
  // les instances d'un même type disparaissent, même si l'admin l'a dupliqué).
  const visibleData: PuckData = useMemo(() => {
    const hidden = new Set(hiddenSectionTypes(settings));
    if (hidden.size === 0) return data;
    return {
      ...data,
      content: (data.content ?? []).filter((item) => !hidden.has(item.type)),
    };
  }, [data, settings]);

  // Barre de progression de lecture (throttle par requestAnimationFrame).
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) setScrollProgress((window.scrollY / totalHeight) * 100);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="bg-background text-on-background overflow-x-clip">
      {/* Scroll Depth Progress Indicator */}
      <div
        id="scroll-progress-container"
        className="fixed top-[var(--safe-top)] left-0 right-0 h-[3px] bg-secondary-fixed/20 z-[var(--z-progress)] pointer-events-none"
      >
        <div
          id="scroll-progress-bar"
          className="h-full bg-secondary-fixed rounded-r-full shadow-[0_0_8px_rgba(254,214,91,0.6)] transition-all duration-200 ease-out-expo"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* BANDEAU PROMO — 10 premiers acquéreurs.
          Volontairement **non collant** : cumulé à la navbar et au bouton
          WhatsApp, un bandeau sticky occupait 26 % de la hauteur d'un écran de
          téléphone en permanence. Il reste visible en haut de page, refermable,
          et passe sous la navbar (top = hauteur réelle de la barre). */}
      {settings.promoActive && !promoDismissed && (
        <div
          className="relative z-[var(--z-promo)] bg-gradient-to-r from-[#F7E7B4] via-secondary-fixed to-[#E9C349] text-on-secondary-fixed font-medium py-3 pl-5 pr-14 shadow-elev-2"
          style={{ marginTop: 'var(--nav-h)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="bg-[#241a00]/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-micro">
              ⭐ {promoTitle}
            </span>
            <span className="text-caption max-w-[52ch]">{promoDesc}</span>
            <button
              onClick={() => {
                setActiveTab('masterplan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-caption underline font-bold hover:text-[#241a00] cursor-pointer py-1 px-1 tap-44 transition-colors duration-400"
            >
              {ui.promoCta}
            </button>
          </div>
          <button
            onClick={dismissPromo}
            className="absolute top-1/2 right-3 -translate-y-1/2 p-2.5 rounded-full text-[#241a00]/70 hover:text-[#241a00] hover:bg-[#241a00]/10 transition-colors duration-400 cursor-pointer tap-44"
            aria-label={isEN ? 'Dismiss announcement' : 'Masquer l’annonce'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Corps de page : blocs éditables depuis /admin/editor */}
      <Render config={puckConfig} data={visibleData} />
    </div>
  );
}
