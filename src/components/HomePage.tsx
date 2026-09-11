import { useEffect, useMemo, useState } from 'react';
import { Render } from '@puckeditor/core/rsc';
import type { Data as PuckData } from '@puckeditor/core';
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
export default function HomePage() {
  const { language, settings, setActiveTab } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const { data } = usePuckPage(language, settings);

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
        className="fixed top-0 left-0 right-0 h-[3px] bg-secondary-fixed/20 z-[110] pointer-events-none"
      >
        <div
          id="scroll-progress-bar"
          className="h-full bg-secondary-fixed rounded-r-full shadow-[0_0_8px_rgba(230,190,100,0.6)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* TOP PROMO BANNER FOR FIRST 10 BUYERS */}
      {settings.promoActive && (
        <div
          className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-xs font-medium py-2.5 px-4 text-center sticky z-30 shadow-md"
          style={{ top: 'var(--nav-h)', marginTop: 'var(--nav-h)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
              ⭐ {settings.promoTitle || ui.promoBadge}
            </span>
            <span>{settings.promoDesc || ui.promoText.replace('{remaining}', String(settings.promoPlotsRemaining))}</span>
            <button
              onClick={() => {
                setActiveTab('masterplan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block underline font-bold hover:text-amber-100 cursor-pointer text-xs ml-1 py-2 px-1"
            >
              {ui.promoCta}
            </button>
          </div>
        </div>
      )}

      {/* Corps de page : blocs éditables depuis /admin/editor */}
      <Render config={puckConfig} data={visibleData} />
    </div>
  );
}
