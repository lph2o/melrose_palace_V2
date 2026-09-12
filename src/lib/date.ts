import { Language } from '../types';

/**
 * Les dates des articles sont saisies librement dans l'Espace Gérant (ex.
 * « 08 Septembre 2026 »), donc en français par défaut. Plutôt que d'imposer un
 * second champ « date anglaise » au gérant, on traduit les noms de mois au
 * rendu : la date reste une seule donnée éditable, mais un visiteur anglophone
 * lit toujours « 08 September 2026 ».
 */
const FRENCH_MONTHS: Record<string, string> = {
  janvier: 'January',
  fevrier: 'February',
  février: 'February',
  mars: 'March',
  avril: 'April',
  mai: 'May',
  juin: 'June',
  juillet: 'July',
  aout: 'August',
  août: 'August',
  septembre: 'September',
  octobre: 'October',
  novembre: 'November',
  decembre: 'December',
  décembre: 'December',
};

/** Traduit les noms de mois français d'une date éditoriale quand `language` vaut EN. */
export function formatEditorialDate(date: string, language: Language): string {
  if (language === 'FR' || !date) return date;
  return date.replace(/[A-Za-zÀ-ÿ]+/g, (word) => FRENCH_MONTHS[word.toLowerCase()] ?? word);
}
