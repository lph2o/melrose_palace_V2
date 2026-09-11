import { useState, FormEvent } from 'react';
import { Language, SiteSettings } from '../types';
import { TRANSLATIONS } from '../data';
import { Mail, ArrowRight, MessageCircle, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface FooterProps {
  currentLanguage: Language;
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  settings?: SiteSettings;
  onOpenBrochure?: () => void;
}

export default function Footer({ currentLanguage, setActiveTab, settings, onOpenBrochure }: FooterProps) {
  const t = TRANSLATIONS[currentLanguage];
  const [email, setEmail] = useState<string>('');
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
      setEmail('');
    }, 1000);
  };

  const whatsappClean = settings?.whatsappCleanNumber || '33761235509';

  return (
    <footer className="bg-[#001c13] text-white border-t border-secondary-container/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16">
        
        {/* NEWSLETTER / DOSSIER TELECHARGEMENT RAPIDE */}
        <div className="border-b border-white/10 pb-10 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-secondary-fixed">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest font-mono">
                  {currentLanguage === 'FR' ? 'VEILLE FONCIÈRE & OPPORTUNITÉS' : 'LAND ALERTS & OPPORTUNITIES'}
                </span>
              </div>
              <h4 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-tight">
                {currentLanguage === 'FR' ? 'Recevoir les Disponibilités & Nouveaux Lots' : 'Receive Plot Updates & Next Releases'}
              </h4>
              <p className="font-sans text-xs text-white/70 max-w-lg leading-relaxed font-light">
                {currentLanguage === 'FR'
                  ? 'Inscrivez-vous pour être prévenu des ouvertures de nouvelles tranches, des offres de la diaspora et des évolutions des chantiers du TER et de Diamniadio.'
                  : 'Subscribe to be alerted about new plot releases, diaspora promotions, and regional TER and Diamniadio project progress.'}
              </p>
            </div>

            <div className="w-full max-w-md lg:ml-auto">
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      placeholder={currentLanguage === 'FR' ? 'Votre adresse email...' : 'Enter your email...'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 text-xs text-white placeholder:text-white/40 bg-white/5 focus:outline-none focus:ring-1 focus:ring-secondary-fixed focus:border-secondary-fixed transition-all"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-secondary-fixed hover:bg-secondary-fixed/90 text-primary text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    <span>{isSubscribing ? (currentLanguage === 'FR' ? 'Envoi...' : 'Sending...') : (currentLanguage === 'FR' ? "S'inscrire" : 'Join')}</span>
                    {!isSubscribing && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-secondary-fixed/15 border border-secondary-fixed/30 p-4 rounded-xl space-y-1"
                >
                  <p className="text-xs font-serif font-bold text-secondary-fixed">
                    {currentLanguage === 'FR' ? 'Inscription confirmée' : 'Subscription confirmed'}
                  </p>
                  <p className="text-[11px] text-white/80 font-light">
                    {currentLanguage === 'FR'
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
              <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center font-bold font-serif text-sm">
                SIC
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                {settings.companyName || 'Sénégal Immobilier Consulting'}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-light max-w-sm">
              {t.footerWord}
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-secondary-fixed pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Propriété Directe • Délibération & NICAD • Sébikhotane</span>
            </div>
          </div>

          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-bold font-mono uppercase text-secondary-fixed tracking-wider block">
              Navigation Rapide
            </span>
            <div className="flex flex-col space-y-1 text-xs text-white/80">
              <button
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-1.5"
              >
                Accueil & Vision
              </button>
              <button
                onClick={() => {
                  setActiveTab('masterplan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-1.5"
              >
                Les 20 Parcelles de 150 m² (Disponibilités)
              </button>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setTimeout(() => {
                    document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-1.5"
              >
                Simulateur de Financement (Dès 300 €/mois)
              </button>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setTimeout(() => {
                    document.getElementById('packs-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-left hover:text-secondary-fixed transition-colors py-1.5"
              >
                Packs Clôture & Construction
              </button>
              {onOpenBrochure && (
                <button
                  onClick={onOpenBrochure}
                  className="text-left text-amber-300 hover:text-amber-200 font-semibold transition-colors flex items-center space-x-1.5 py-1.5"
                >
                  <span>📄 Plaquette Officielle Dun Tni (7 pages PDF)</span>
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="text-xs font-bold font-mono uppercase text-secondary-fixed tracking-wider block">
              Contact & WhatsApp
            </span>
            <div className="space-y-2 text-xs text-white/80">
              <a
                href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent('Bonjour Sénégal Immobilier Consulting, je souhaite échanger avec un conseiller.')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-3.5 py-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Conseiller</span>
              </a>
              <p className="text-[11px] text-white/70 pt-1">
                Tél / WhatsApp : <strong className="text-white font-mono">{settings?.whatsappNumber || '+33 7 61 23 55 09'}</strong>
              </p>
              <p className="text-[11px] text-white/70">
                Email : <a href={`mailto:${settings?.contactEmail || 'globalequalite@gmail.com'}`} className="inline-block text-white hover:underline py-2">{settings?.contactEmail || 'globalequalite@gmail.com'}</a>
              </p>
              <p className="text-[11px] text-white/50">
                Bureau : {settings?.contactAddress || 'Dakar, Rufisque — Keury Kao'}
              </p>
            </div>
          </div>
        </div>

        {/* Lower row details */}
        <div className="mt-12 text-center md:text-left text-white/50 text-[11px] border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-3">
            <span>&copy; 2026 {t.allRightsReserved}</span>
            {/* L'accès gestionnaire a été volontairement retiré des pages
                publiques (footer et menu mobile) : l'Espace Gérant reste joignable
                uniquement par l'URL directe /admin. */}
          </div>
          <span className="font-mono text-[10px]">Sébikhotane • Région de Dakar • Sénégal</span>
        </div>

      </div>
    </footer>
  );
}
