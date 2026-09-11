import { SiteSettings } from '../types';

/**
 * Ouvre une conversation WhatsApp avec le numéro du site et un message pré-rempli.
 *
 * Extrait de LandingPage : les sections éditables en ont besoin (Garanties,
 * Simulateur, Localisation, Packs, Banque). Centralisé ici pour que le numéro
 * reste piloté par l'unique source `settings.whatsappCleanNumber`.
 */
export function openWhatsApp(settings: SiteSettings, message: string): void {
  const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
