import { RotateCcw } from 'lucide-react';
import { LegalIdentity, SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS } from '../data';
import { formatLegalDate, resolveLegalIdentity } from '../lib/legalIdentity';

/**
 * Onglet « Identité légale » de l'Espace Gérant.
 *
 * Ces champs ne sont pas du contenu marketing : ce sont les identifiants
 * officiels de la société (NINEA, registre de commerce, siège), affichés dans
 * le pied de page, sur la page Mentions légales et dans le balisage
 * `Organization` lu par les moteurs de recherche. Un chiffre faux ici se
 * propage donc aux trois endroits à la fois — d'où les libellés qui rappellent
 * la source (« tel qu'il figure sur l'avis d'immatriculation ») plutôt qu'un
 * simple « NINEA ».
 *
 * Convention de saisie : un champ **vidé** disparaît du site public ; un champ
 * jamais renseigné garde la valeur par défaut du site. Le bouton « Rétablir »
 * remet exactement les valeurs de l'avis d'immatriculation.
 */

const inputCls =
  'w-full px-3.5 py-2.5 rounded-inner bg-(--admin-input) ring-1 ring-(--admin-ring) text-sm text-(--admin-text) ' +
  'placeholder:text-(--admin-muted-2) focus:outline-none focus:ring-2 focus:ring-(--admin-accent)/60 ' +
  'transition-all duration-400 ease-spring';

const labelCls = 'block font-mono text-micro uppercase tracking-[0.2em] text-(--admin-muted) mb-2';

interface AdminLegalTabProps {
  settings: SiteSettings;
  /** Patch remonté au formulaire de l'Espace Gérant (sauvegarde par le bouton Enregistrer). */
  onChange: (patch: Partial<SiteSettings>) => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  help,
  mono,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
  mono?: boolean;
  type?: 'text' | 'date';
}) {
  return (
    <div className="min-w-0">
      <label className={labelCls}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${mono ? 'font-mono tracking-wide' : ''}`}
        placeholder={placeholder}
      />
      {help && <p className="text-caption text-(--admin-muted-2) mt-1.5">{help}</p>}
    </div>
  );
}

export default function AdminLegalTab({ settings, onChange }: AdminLegalTabProps) {
  // Valeurs effectivement publiées : c'est ce que voit le visiteur, pas ce que
  // contient le formulaire (les champs absents retombent sur les défauts).
  const legal = resolveLegalIdentity(settings);
  const defaults = DEFAULT_SITE_SETTINGS.legal ?? {};

  const set = (patch: Partial<LegalIdentity>) =>
    onChange({ legal: { ...legal, ...patch } });

  const registrationPreview = formatLegalDate(legal.registrationDate, 'FR');

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-(--admin-hairline)">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70">
          Identité légale de la société
        </p>
        <p className="text-caption text-(--admin-muted) mt-1">
          Affichée dans le pied de page, sur la page « Mentions légales » (
          <span className="font-mono">/fr/mentions-legales</span>) et dans les données
          structurées lues par Google. Recopiez les valeurs telles qu'elles figurent sur
          l'avis d'immatriculation (NINEA) : ne les reformulez pas.
        </p>
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70">
            Société & immatriculation
          </p>
          <button
            type="button"
            onClick={() => onChange({ legal: { ...defaults } })}
            title="Remettre les valeurs de l'avis d'immatriculation conservées dans le code du site"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-caption font-mono uppercase tracking-widest text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/40 active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
            Rétablir l'avis d'immatriculation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Dénomination sociale"
            value={legal.legalName ?? ''}
            onChange={(v) => set({ legalName: v })}
            placeholder="SOCIETE CIVILE IMMOBILIERE SENEGAL IMMO CONSULTING"
            help="Nom immatriculé, en majuscules comme sur le document. Ce n'est pas la marque commerciale affichée en haut du site."
          />
          <Field
            label="Enseigne / sigle"
            value={legal.tradeName ?? ''}
            onChange={(v) => set({ tradeName: v })}
            placeholder="SCI SIC"
            help="Nom court utilisé dans le pied de page."
          />
          <Field
            label="NINEA"
            value={legal.ninea ?? ''}
            onChange={(v) => set({ ninea: v })}
            placeholder="008387830"
            mono
            help="Numéro d'Identification Nationale des Entreprises et Associations. Il doit figurer sur vos factures et quittances."
          />
          <Field
            label="Registre de commerce"
            value={legal.registry ?? ''}
            onChange={(v) => set({ registry: v })}
            placeholder="Bordereau N° 00597"
            mono
            help="Valeur recopiée telle quelle. N'inscrivez pas ici un numéro RCCM complet si le document ne le porte pas."
          />
          <Field
            label="Forme juridique"
            value={legal.legalForm ?? ''}
            onChange={(v) => set({ legalForm: v })}
            placeholder="Société Civile Immobilière"
          />
          <div className="min-w-0">
            <label className={labelCls}>Date d'immatriculation</label>
            <input
              type="date"
              value={/^\d{4}-\d{2}-\d{2}$/.test(legal.registrationDate ?? '') ? legal.registrationDate : ''}
              onChange={(e) => set({ registrationDate: e.target.value })}
              className={inputCls}
            />
            <p className="text-caption text-(--admin-muted-2) mt-1.5">
              {registrationPreview
                ? `Affichée sur le site : « ${registrationPreview} ». `
                : 'Date inscrite sur l’avis d’immatriculation. '}
              Sert aussi de date de création de la société dans les données structurées.
            </p>
          </div>
          <Field
            label="Siège social"
            value={legal.registeredOffice ?? ''}
            onChange={(v) => set({ registeredOffice: v })}
            placeholder="Liberté 6, Immeuble Soda Marémé — Dakar, Sénégal"
            help="Adresse enregistrée de la société. Différente du bureau de vente : celle-ci doit rester celle du RCCM."
          />
          <Field
            label="Activité principale"
            value={legal.activity ?? ''}
            onChange={(v) => set({ activity: v })}
            placeholder="Activités des agences immobilières"
          />
        </div>
      </div>

      <div className="space-y-5">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70">
          Hébergement du site
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Hébergeur"
            value={legal.hostName ?? ''}
            onChange={(v) => set({ hostName: v })}
            placeholder="Vercel Inc."
            help="Nom de l'hébergeur, mention obligatoire des mentions légales. Laissez vide pour masquer le bloc."
          />
          <Field
            label="Adresse de l'hébergeur"
            value={legal.hostAddress ?? ''}
            onChange={(v) => set({ hostAddress: v })}
            placeholder="440 N Barranca Ave #4133, Covina, CA 91723, États-Unis"
          />
        </div>
      </div>

      <p className="text-caption text-(--admin-muted-2) leading-relaxed">
        Un champ vidé disparaît du site public (aucune ligne « NINEA : — ») ; un champ
        jamais renseigné garde la valeur par défaut du site. Vérifiez que les valeurs
        publiées correspondent bien à l'avis d'immatriculation en cours de validité : un
        identifiant remplacé par un décret ne doit pas rester affiché.
      </p>
    </div>
  );
}
