import { useState, FormEvent } from 'react';
import { Language, SiteSettings } from '../types';
import { TRANSLATIONS } from '../data';
import {
  Mail,
  ArrowRight,
  MessageCircle,
  Phone,
  MapPin,
  ShieldCheck,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { motion } from 'motion/react';
import { insertLead } from '../lib/supabase';

/**
 * Marqueurs lisibles par le gérant dans l'onglet « Demandes de contact » :
 * l'inscription à la veille foncière est enregistrée comme une demande (il
 * n'existe pas de table dédiée aux abonnés).
 */
const NEWSLETTER_LEAD_NAME = 'Abonné veille foncière';
const NEWSLETTER_LEAD_INTEREST = 'Veille foncière & opportunités';

interface FooterProps {
  currentLanguage: Language;
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  settings?: SiteSettings;
  onOpenBrochure?: () => void;
  onOpenShare?: () => void;
}

export default function Footer({
  currentLanguage,
  setActiveTab,
  settings,
  onOpenBrochure,
  onOpenShare,
}: FooterProps) {
  const t = TRANSLATIONS[currentLanguage];
  const isFR = currentLanguage === 'FR';
  const [email, setEmail] = useState<string>('');
  const [subscribeState, setSubscribeState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  // L'inscription est réellement enregistrée : la confirmation n'apparaît que
  // si Supabase a accepté la demande (sinon l'adresse était perdue).
  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    setSubscribeState('sending');
    const saved = await insertLead({
      name: NEWSLETTER_LEAD_NAME,
      phone: '',
      email: address,
      interest: NEWSLETTER_LEAD_INTEREST,
      message: '',
    });
    setSubscribeState(saved ? 'done' : 'error');
    if (saved) setEmail('');
  };

  const newsletterEmail = settings?.contactEmail || 'globalequalite@gmail.com';

  const whatsappClean = settings?.whatsappCleanNumber || '33761235509';

  // Liens de partage directs (mêmes intentions que la modale de partage, mais
  // accessibles en un clic depuis le pied de page).
  const shareUrl =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${window.location.pathname}`;
  const shareText = isFR
    ? `${settings?.companyName || 'Sénégal Immobilier Consulting'} — Parcelles de 150 m² à Sébikhotane (dès 300 €/mois)`
    : `${settings?.companyName || 'Senegal Real Estate Consulting'} — 150 sqm plots in Sebikhotane (from €300/month)`;
  const enc = encodeURIComponent;
  const socialShares = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      Icon: MessageCircle,
      href: `https://wa.me/?text=${enc(`${shareText}\n${shareUrl}`)}`,
      cls: 'bg-whatsapp hover:bg-[#128c4a] text-white',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
      cls: 'bg-white/10 hover:bg-white/20 text-white',
    },
    {
      key: 'twitter',
      label: 'X (Twitter)',
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`,
      cls: 'bg-white/10 hover:bg-white/20 text-white',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      Icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
      cls: 'bg-white/10 hover:bg-white/20 text-white',
    },
  ];

  // La marge de sécurité basse est portée par le pied de page lui-même : son
  // fond sombre descend ainsi jusqu'au bord de l'écran, sous la barre
  // d'accueil, au lieu de laisser apparaître un liseré clair.
  return (
    <footer className="safe-b safe-x bg-[#001c13] text-white border-t border-secondary-container/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-section">
        
        {/* NEWSLETTER / DOSSIER TELECHARGEMENT RAPIDE */}
        <div className="border-b border-white/10 pb-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-secondary-fixed">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                <span className="text-micro uppercase font-bold tracking-widest font-mono">
                  {isFR ? 'VEILLE FONCIÈRE & OPPORTUNITÉS' : 'LAND ALERTS & OPPORTUNITIES'}
                </span>
              </div>
              <h4 className="font-serif text-h3 text-white font-bold tracking-tight">
                {isFR ? 'Recevoir les Disponibilités & Nouveaux Lots' : 'Receive Plot Updates & Next Releases'}
              </h4>
              <p className="font-sans text-xs text-white/70 max-w-lg leading-relaxed font-light">
                {isFR
                  ? 'Inscrivez-vous pour être prévenu des ouvertures de nouvelles tranches, des offres de la diaspora et des évolutions des chantiers du TER et de Diamniadio.'
                  : 'Subscribe to be alerted about new plot releases, diaspora promotions, and regional TER and Diamniadio project progress.'}
              </p>
            </div>

            <div className="w-full max-w-md lg:ml-auto">
              {subscribeState !== 'done' ? (
                <div className="space-y-2">
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        required
                        placeholder={isFR ? 'Votre adresse email...' : 'Enter your email...'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-inner border border-white/15 text-xs text-white placeholder:text-white/60 bg-white/5 focus:outline-none focus:ring-1 focus:ring-secondary-fixed focus:border-secondary-fixed transition-all"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={subscribeState === 'sending'}
                      className="bg-secondary-fixed hover:bg-secondary-fixed/90 text-primary text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-inner transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-elev-1"
                    >
                      <span>{subscribeState === 'sending' ? (isFR ? 'Envoi...' : 'Sending...') : (isFR ? "S'inscrire" : 'Join')}</span>
                      {subscribeState !== 'sending' && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                  {subscribeState === 'error' && (
                    <p className="text-caption text-rose-300 leading-relaxed" role="alert">
                      {isFR
                        ? "Inscription impossible pour l'instant — écrivez-nous à "
                        : 'Sign-up failed right now — please email us at '}
                      <a href={`mailto:${newsletterEmail}`} className="underline">
                        {newsletterEmail}
                      </a>
                      {isFR
                        ? ' pour être ajouté à la liste.'
                        : ' to be added to the list.'}
                    </p>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondary-fixed/15 border border-secondary-fixed/30 p-4 rounded-inner space-y-1"
                >
                  <p className="text-xs font-serif font-bold text-secondary-fixed">
                    {isFR ? 'Inscription confirmée' : 'Subscription confirmed'}
                  </p>
                  <p className="text-caption text-white/85 font-light">
                    {isFR
                      ? 'Vous recevrez nos alertes foncières en priorité.'
                      : 'You will receive our priority updates directly in your inbox.'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Main Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-micro bg-secondary-fixed text-primary flex items-center justify-center font-bold font-serif text-sm">
                SIC
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                {settings.companyName || 'Sénégal Immobilier Consulting'}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light max-w-sm">
              {t.footerWord}
            </p>
            <div className="flex items-center space-x-2 text-caption text-secondary-fixed pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isFR
                  ? 'Propriété Directe • Délibération & NICAD • Sébikhotane'
                  : 'Direct Ownership • Deliberation & NICAD • Sébikhotane'}
              </span>
            </div>
          </div>

          <div className="md:col-span-4 space-y-2">
            <span className="text-micro font-bold font-mono uppercase text-secondary-fixed tracking-wider block">
              {isFR ? 'Navigation Rapide' : 'Quick Navigation'}
            </span>
            <div className="flex flex-col space-y-1 text-xs text-white/85">
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-2.5 min-h-[44px] flex items-center"
              >
                {isFR ? 'Accueil & Vision' : 'Home & Vision'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('masterplan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-2.5 min-h-[44px] flex items-center"
              >
                {isFR
                  ? 'Les 20 Parcelles de 150 m² (Disponibilités)'
                  : 'The 20 Plots of 150 sqm (Availability)'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setTimeout(() => {
                    document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-2.5 min-h-[44px] flex items-center"
              >
                {isFR
                  ? 'Simulateur de Financement (Dès 300 €/mois)'
                  : 'Payment Simulator (From €300/month)'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setTimeout(() => {
                    document.getElementById('packs-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-2.5 min-h-[44px] flex items-center"
              >
                {isFR ? 'Packs Clôture & Construction' : 'Fencing & Construction Packs'}
              </button>
              {onOpenBrochure && (
                <button
                  onClick={onOpenBrochure}
                  className="text-left text-secondary-fixed hover:text-white font-semibold transition-colors flex items-center space-x-1.5 py-1.5 min-h-[44px]"
                >
                  <span>
                    {isFR
                      ? '📄 Plaquette Officielle Dun Tni (7 pages PDF)'
                      : '📄 Official Dun Tni Brochure (7-page PDF)'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="text-micro font-bold font-mono uppercase text-secondary-fixed tracking-wider block">
              Contact & WhatsApp
            </span>
            <div className="space-y-2 text-xs text-white/85">
              <a
                href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(
                  isFR
                    ? 'Bonjour Sénégal Immobilier Consulting, je souhaite échanger avec un conseiller.'
                    : 'Hello Senegal Real Estate Consulting, I would like to talk to an advisor.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-whatsapp hover:bg-[#128c4a] text-white font-bold px-3.5 py-2.5 min-h-[44px] rounded-micro transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{isFR ? 'WhatsApp Conseiller' : 'WhatsApp Advisor'}</span>
              </a>
              <p className="text-caption text-white/70 pt-1">
                {isFR ? 'Tél / WhatsApp' : 'Phone / WhatsApp'} :{' '}
                <strong className="text-white font-mono">
                  {settings?.whatsappNumber || '+33 7 61 23 55 09'}
                </strong>
              </p>
              <p className="text-caption text-white/70">
                Email : <a href={`mailto:${settings?.contactEmail || 'globalequalite@gmail.com'}`} className="inline-flex items-center min-h-[44px] text-white hover:underline py-2">{settings?.contactEmail || 'globalequalite@gmail.com'}</a>
              </p>
              <p className="text-caption text-white/60">
                {isFR ? 'Bureau' : 'Office'} : {settings?.contactAddress || 'Dakar, Rufisque — Keury Kao'}
              </p>

              {/* Partage social direct */}
              <div className="pt-2 space-y-2">
                <span className="text-micro font-mono uppercase tracking-wider text-secondary-fixed/80 block">
                  {isFR ? 'Partager le projet' : 'Share the project'}
                </span>
                <div className="flex items-center space-x-2">
                  {socialShares.map(({ key, label, Icon, href, cls }) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      title={label}
                      aria-label={label}
                      className={`w-11 h-11 rounded-micro flex items-center justify-center tap-44 transition-colors ${cls}`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                  {onOpenShare && (
                    <button
                      onClick={onOpenShare}
                      title={isFR ? 'Toutes les options de partage' : 'All sharing options'}
                      aria-label={isFR ? 'Toutes les options de partage' : 'All sharing options'}
                      className="w-11 h-11 rounded-micro flex items-center justify-center tap-44 bg-secondary-fixed text-primary hover:bg-secondary-fixed/90 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower row details */}
        <div className="mt-12 text-center md:text-left text-white/60 text-caption border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-3">
            <span>&copy; 2026 {t.allRightsReserved}</span>
            {/* L'accès gestionnaire a été volontairement retiré des pages
                publiques (footer et menu mobile) : l'Espace Gérant reste joignable
                uniquement par l'URL directe /admin. */}
          </div>
          <span className="font-mono text-caption">Sébikhotane • Région de Dakar • Sénégal</span>
        </div>

      </div>
    </footer>
  );
}
