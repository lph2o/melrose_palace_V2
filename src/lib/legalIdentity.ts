import { Language, LegalIdentity, SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data';

/**
 * Identité légale de l'éditeur — lecture, fusion et mise en forme.
 *
 * Source unique des valeurs affichées : le pied de page, la page Mentions
 * légales et le balisage SEO (JSON-LD `Organization`) lisent tous ce module.
 * Recopier NINEA ou registre de commerce à trois endroits garantirait qu'un
 * jour l'un des trois mente — et sur des identifiants officiels, une
 * divergence n'est pas une coquille : c'est un doute sur la société.
 */

/** Clés de l'identité légale, dans l'ordre où elles se lisent. */
export type LegalField = keyof LegalIdentity;

/** Corps de l'identité : dénomination, identifiants, siège (page Mentions légales). */
export const IDENTITY_FIELDS: LegalField[] = [
  'legalName',
  'tradeName',
  'legalForm',
  'ninea',
  'registry',
  'registeredOffice',
  'registrationDate',
  'activity',
];

/** Hébergeur du site — même page, bloc distinct. */
export const HOST_FIELDS: LegalField[] = ['hostName', 'hostAddress'];

/**
 * Sous-ensemble du pied de page : l'essentiel pour identifier la société qui
 * vend, sans transformer le pied de page en registre. Le détail complet vit sur
 * la page Mentions légales, vers laquelle ce bloc renvoie.
 */
export const FOOTER_FIELDS: LegalField[] = [
  'tradeName',
  'legalName',
  'ninea',
  'registry',
  'registeredOffice',
  'registrationDate',
];

/**
 * Identité effective : valeurs du site, surchargées par celles du gérant.
 *
 * La distinction « absent » / « vide » est volontaire :
 *   - valeur absente (`undefined`) → on retombe sur le défaut du site ;
 *   - valeur vidée (`''`) → le champ est **masqué** sur le site public, parce
 *     qu'un identifiant que la société ne souhaite plus publier ne doit pas
 *     réapparaître tout seul au prochain chargement.
 */
export function resolveLegalIdentity(settings?: SiteSettings | null): LegalIdentity {
  const merged: LegalIdentity = { ...(DEFAULT_SITE_SETTINGS.legal ?? {}) };
  const overrides = settings?.legal ?? {};
  for (const [key, value] of Object.entries(overrides) as [LegalField, string | undefined][]) {
    if (value === undefined || value === null) continue;
    merged[key] = String(value).trim();
  }
  return merged;
}

/**
 * Date d'immatriculation lisible (« 19 février 2021 »).
 *
 * Le gérant saisit une date ISO (`<input type="date">`) ; une valeur déjà
 * rédigée à la main est recopiée telle quelle plutôt que rejetée — on ne perd
 * jamais une information officielle parce qu'elle n'était pas au bon format.
 */
export function formatLegalDate(iso?: string, lang: Language = 'FR'): string | null {
  const raw = iso?.trim();
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString(lang === 'FR' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Valeur affichable d'un champ (date mise en forme), ou `null` si masquée. */
export function legalFieldValue(
  identity: LegalIdentity,
  field: LegalField,
  lang: Language = 'FR'
): string | null {
  if (field === 'registrationDate') return formatLegalDate(identity.registrationDate, lang);
  const value = identity[field]?.trim();
  return value ? value : null;
}

export interface LegalRow {
  field: LegalField;
  label: string;
  value: string;
}

/**
 * Lignes prêtes à afficher : libellés traduits, champs vides retirés.
 * Un champ non renseigné laisse simplement sa ligne absente — jamais un
 * « NINEA : — » qui suggère une information manquante.
 */
export function legalRows(
  identity: LegalIdentity,
  fields: LegalField[],
  labels: Record<string, string>,
  lang: Language = 'FR'
): LegalRow[] {
  const rows: LegalRow[] = [];
  for (const field of fields) {
    const value = legalFieldValue(identity, field, lang);
    if (!value) continue;
    rows.push({ field, label: labels[field] ?? field, value });
  }
  return rows;
}

/**
 * Ligne d'identification compacte (« SCI SIC — NINEA 008387830 »), pour un
 * titre de bloc ou un document généré.
 */
export function legalIdentitySummary(identity: LegalIdentity): string {
  return [identity.tradeName, identity.ninea ? `NINEA ${identity.ninea}` : null]
    .filter(Boolean)
    .join(' — ');
}
