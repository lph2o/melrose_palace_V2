import {
  ArrowLeft,
  Copyright,
  Landmark,
  Lock,
  Mail,
  MessageCircle,
  Scale,
  Server,
} from 'lucide-react';
import { SiteView } from '../types';
import { TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { HOST_FIELDS, IDENTITY_FIELDS, legalRows, resolveLegalIdentity } from '../lib/legalIdentity';

/**
 * Page « Mentions légales » (`/fr/mentions-legales`, `/en/legal-notice`).
 *
 * Elle existe pour une raison précise : le site demande à des acquéreurs de la
 * diaspora de payer un terrain sans les rencontrer. « Qui vend ? » doit donc
 * avoir une réponse vérifiable, à une URL qu'on peut envoyer à un notaire ou à
 * une banque — pas une ligne grise en bas de page.
 *
 * Aucune valeur légale n'est écrite ici : toutes viennent de l'Espace Gérant
 * (onglet « Identité légale ») via `resolveLegalIdentity`. Un champ vidé est
 * masqué, jamais affiché à moitié.
 */
export default function LegalNoticePage({
  setActiveTab,
}: {
  setActiveTab: (tab: SiteView) => void;
}) {
  const { language, settings } = useSite();
  const t = TRANSLATIONS[language];
  const copy = t.legal;
  const isFR = language === 'FR';

  const identity = resolveLegalIdentity(settings);
  const companyRows = legalRows(identity, IDENTITY_FIELDS, copy.labels, language);
  const hostRows = legalRows(identity, HOST_FIELDS, copy.labels, language);

  const whatsappClean = settings?.whatsappCleanNumber || '33761235509';
  const email = settings?.contactEmail || 'globalequalite@gmail.com';

  // Les sections rédigées partagent la même mise en page : seul le texte change.
  const prose = [
    { Icon: Copyright, title: copy.propertyTitle, body: copy.propertyBody },
    { Icon: Lock, title: copy.dataTitle, body: copy.dataBody },
    { Icon: Scale, title: copy.liabilityTitle, body: copy.liabilityBody },
  ];

  return (
    <div className="bg-[#FAF9F5] text-primary min-h-screen pt-24 pb-20 px-4 md:px-10 lg:px-14">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb — même repère que la page du plan */}
        <nav className="flex items-center space-x-2 text-ink-3 text-micro font-bold uppercase tracking-wider">
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-primary transition-colors cursor-pointer py-1.5 px-1 -ml-1 min-h-[44px] inline-flex items-center"
          >
            {isFR ? 'Accueil' : 'Home'}
          </button>
          <span className="text-ink-3">›</span>
          <span className="text-gold-ink">{copy.breadcrumb}</span>
        </nav>

        {/* En-tête */}
        <header className="space-y-3">
          <div className="inline-flex items-center space-x-2 bg-[#004D40]/10 border border-[#004D40]/20 px-3 py-1 rounded-full text-[#004D40] text-micro font-bold tracking-widest uppercase">
            <Landmark className="w-3.5 h-3.5" />
            <span>{copy.sectionTag}</span>
          </div>
          <h1 className="font-serif text-h1 font-bold tracking-tight text-primary">{copy.title}</h1>
          <p className="font-sans text-sm md:text-base text-outline leading-relaxed font-light">
            {copy.intro}
          </p>
        </header>

        {/* Identité de l'éditeur */}
        <section className="bg-white rounded-card border border-gray-300 shadow-elev-1 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-[#00261a]/[0.03]">
            <h2 className="font-serif text-h3 font-bold text-primary">{copy.identityTitle}</h2>
            <p className="text-caption text-outline font-light mt-1 max-w-2xl">{copy.identityNote}</p>
          </div>

          {/* `m-0` / `ml-0` sur `dl` et `dd` : la feuille de style du site ne
              réinitialise pas leurs marges par défaut (1em haut/bas, 40px à
              gauche), qui décaleraient les valeurs sous leurs libellés. */}
          {companyRows.length === 0 ? (
            <p className="px-4 sm:px-6 py-6 text-xs text-outline font-light">{copy.emptyNote}</p>
          ) : (
            <dl className="m-0 divide-y divide-gray-200">
              {companyRows.map((row) => (
                <div
                  key={row.field}
                  className="px-4 sm:px-6 py-3 grid grid-cols-1 sm:grid-cols-[minmax(0,13rem)_1fr] gap-1 sm:gap-4 items-baseline"
                >
                  <dt className="text-micro font-mono uppercase tracking-wider text-outline">
                    {row.label}
                  </dt>
                  <dd
                    className={`ml-0 text-sm text-primary ${
                      row.field === 'ninea' || row.field === 'registry'
                        ? 'font-mono font-bold tracking-wide'
                        : 'font-medium'
                    }`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* Hébergement — absent du document si le gérant n'a rien renseigné */}
        {hostRows.length > 0 && (
          <section className="bg-white rounded-card border border-gray-300 shadow-elev-1 p-4 sm:p-6 space-y-3">
            <div className="flex items-center space-x-2 text-[#004D40]">
              <Server className="w-4 h-4" />
              <h2 className="font-serif text-h3 font-bold text-primary">{copy.hostTitle}</h2>
            </div>
            <p className="text-xs text-outline font-light">{copy.hostIntro}</p>
            <dl className="m-0 space-y-1.5">
              {hostRows.map((row) => (
                <div key={row.field} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <dt className="text-micro font-mono uppercase tracking-wider text-outline sm:w-32 shrink-0">
                    {row.label}
                  </dt>
                  <dd className="ml-0 text-sm text-primary font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Sections rédigées */}
        <div className="grid grid-cols-1 gap-4">
          {prose.map(({ Icon, title, body }) => (
            <section
              key={title}
              className="bg-white rounded-card border border-gray-300 shadow-elev-1 p-4 sm:p-6 space-y-2"
            >
              <div className="flex items-center space-x-2 text-[#004D40]">
                <Icon className="w-4 h-4" />
                <h2 className="font-serif text-h3 font-bold text-primary">{title}</h2>
              </div>
              <p className="text-xs sm:text-sm text-outline leading-relaxed font-light">{body}</p>
            </section>
          ))}
        </div>

        {/* Contact */}
        <section className="bg-[#00261a] text-white rounded-card p-4 sm:p-6 space-y-4">
          <h2 className="font-serif text-h3 font-bold">{copy.contactTitle}</h2>
          <p className="text-xs text-white/80 font-light">{copy.contactIntro}</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/25 min-h-[44px] px-4 py-2.5 rounded-full text-caption font-bold transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{email}</span>
            </a>
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-whatsapp hover:bg-[#128c4a] min-h-[44px] px-4 py-2.5 rounded-full text-caption font-bold transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{settings?.whatsappNumber || '+33 7 61 23 55 09'}</span>
            </a>
          </div>
        </section>

        {/* Retour */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center space-x-2 text-caption font-bold uppercase tracking-wider text-primary hover:text-gold-ink transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{copy.backHome}</span>
        </button>
      </div>
    </div>
  );
}
