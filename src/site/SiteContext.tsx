import { createContext, useContext } from 'react';
import { BlogArticle, Language, Parcel, SiteSettings } from '../types';

/**
 * Contexte partagé des sections éditables.
 *
 * Les sections (`src/sections/*`) sont rendues à deux endroits :
 *   1. sur le site public, via `<Render />` de Puck ;
 *   2. dans le canevas de l'éditeur `/admin/editor`, via `<Puck />`.
 *
 * Pour que ce soit le *même* composant dans les deux cas, elles ne reçoivent
 * pas ces dépendances en props (Puck ne sérialise que des props JSON) : elles
 * les lisent ici. Reconstruire ce contrat à l'identique dans les deux arbres
 * React évite toute divergence visuelle entre l'aperçu et le site.
 *
 * Règle à respecter en ajoutant une dépendance : elle doit être disponible
 * dans App.tsx (site public) ET dans AdminEditorPage.tsx (éditeur).
 */
export interface SiteContextValue {
  language: Language;
  settings: SiteSettings;
  parcels: Parcel[];
  /** Bascule entre les vues « home » et « masterplan » (History API). */
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  /** Défilement vers une section par son id (ancres des blocs Puck). */
  scrollToSection: (id: string) => void;
  /** Ouvre la plaquette PDF ; absent si aucun gestionnaire n'est branché. */
  onOpenBrochure?: () => void;
  /** Ouvre la fiche article du blog ; absent si aucun gestionnaire n'est branché. */
  onSelectArticle?: (article: BlogArticle) => void;
  /**
   * Question FAQ à déplier, demandée depuis la recherche globale
   * (`handleSelectFaq` dans App.tsx). La section FAQ l'ouvre puis la consomme.
   */
  openFaqId?: string | null;
  onClearOpenFaqId?: () => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export const SiteProvider = SiteContext.Provider;

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error(
      'useSite() doit être appelé sous un <SiteProvider>. Vérifiez App.tsx ou AdminEditorPage.tsx.'
    );
  }
  return ctx;
}
