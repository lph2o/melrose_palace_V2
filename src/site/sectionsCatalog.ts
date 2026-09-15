import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Calculator,
  Compass,
  Contact,
  FileQuestion,
  Landmark,
  Layers,
  Map,
  MessageSquareQuote,
  Newspaper,
  Package,
  ShieldCheck,
  Video,
} from 'lucide-react';
import type { SiteSettings } from '../types';

/**
 * Catalogue des sections de la page d'accueil — **source unique** partagée par
 * l'Espace Gérant (onglet « Sections »), la bibliothèque de blocs de l'éditeur
 * Puck (`src/puck/drawerCards.tsx`) et les liens de navigation (`Navbar`).
 *
 * ⚠️ Un nouveau bloc Puck doit être ajouté ici **et** dans
 * `puckConfig.components` (`src/puck/config.tsx`) : la clé `type` doit être
 * identique à celle de la config, sinon la section n'apparaîtra pas dans
 * l'onglet « Sections » et ne sera pas masquable.
 *
 * Ce module n'importe **rien** de Puck : il est chargé par le site public, donc
 * il ne doit jamais tirer de code éditeur dans le bundle d'entrée.
 */
export interface SiteSectionMeta {
  /** Clé du bloc dans `puckConfig.components` — c'est aussi le `type` en base. */
  type: string;
  /** Libellé court (Espace Gérant + cartes de la bibliothèque de blocs). */
  label: string;
  /** Identifiant d'ancre HTML de la section (`<section id="…">`), si elle en a un. */
  anchor?: string;
  /** Phrase de description affichée dans les cartes. */
  desc: string;
  icon: LucideIcon;
}

/** Sections de la page d'accueil, dans leur ordre d'affichage par défaut. */
export const SITE_SECTIONS: SiteSectionMeta[] = [
  { type: 'Hero', label: 'Hero', anchor: 'hero', desc: 'Bannière principale, chiffres clés et CTA', icon: Compass },
  { type: 'Garanties', label: 'Garanties', anchor: 'guarantees', desc: 'Points de garantie et engagement', icon: ShieldCheck },
  { type: 'Vision', label: 'Vision', anchor: 'vision', desc: 'Vue aérienne, plan cadastral et piliers', icon: Map },
  { type: 'Videos', label: 'Vidéos', desc: 'Vidéos du domaine avec téléversement', icon: Video },
  { type: 'Localisation', label: 'Localisation', anchor: 'location', desc: 'Localisation stratégique et infrastructures', icon: Layers },
  { type: 'Simulateur', label: 'Simulateur', anchor: 'simulator-section', desc: 'Simulateur de financement interactif', icon: Calculator },
  { type: 'Packs', label: 'Packs', anchor: 'packs-section', desc: 'Packs complémentaires du domaine', icon: Package },
  { type: 'Banque', label: 'Banque', anchor: 'banking', desc: 'Financement avec la Banque Islamique du Sénégal (BIS)', icon: Landmark },
  { type: 'Temoignages', label: 'Témoignages', anchor: 'testimonials', desc: 'Témoignages des acquéreurs', icon: MessageSquareQuote },
  { type: 'Services', label: 'Services', anchor: 'services', desc: 'Nos métiers : vente, location, terrains, juridique', icon: Briefcase },
  { type: 'Articles', label: 'Articles', anchor: 'insights', desc: 'Articles et guides du blog', icon: Newspaper },
  { type: 'FAQ', label: 'FAQ', anchor: 'faqs-section', desc: 'Questions fréquentes', icon: FileQuestion },
  { type: 'Contact', label: 'Contact', anchor: 'contact', desc: 'Formulaire de contact et coordonnées', icon: Contact },
];

/** Types de blocs masqués par l'Espace Gérant (jamais null : tableau vide par défaut). */
export function hiddenSectionTypes(settings?: SiteSettings | null): string[] {
  const list = settings?.hiddenSections;
  if (!Array.isArray(list)) return [];
  return list.filter((type): type is string => typeof type === 'string' && type.length > 0);
}

/** Vrai si la section est masquée sur le site public. */
export function isSectionHidden(settings: SiteSettings | null | undefined, type: string): boolean {
  return hiddenSectionTypes(settings).includes(type);
}

/**
 * Ancres (`<section id>`) des sections masquées : les liens de navigation et les
 * CTA qui pointent dessus doivent disparaître, sans quoi ils ne feraient rien.
 */
export function hiddenAnchors(settings?: SiteSettings | null): Set<string> {
  const hidden = new Set(hiddenSectionTypes(settings));
  return new Set(
    SITE_SECTIONS.filter((section) => hidden.has(section.type) && section.anchor).map(
      (section) => section.anchor as string
    )
  );
}

/** Libellé lisible d'un type de bloc (repli : le type brut). */
export function sectionLabel(type: string): string {
  return SITE_SECTIONS.find((section) => section.type === type)?.label ?? type;
}

/** Nombre de sections actuellement masquées. */
export function hiddenSectionCount(settings?: SiteSettings | null): number {
  return hiddenSectionTypes(settings).length;
}
