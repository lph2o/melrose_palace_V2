import { useState, useEffect } from 'react';
import { Menu, X, Globe, PhoneCall, Search, ShieldCheck, Calculator, FileText } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { TRANSLATIONS } from '../data';
import { hiddenAnchors } from '../site/sectionsCatalog';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  activeTab: 'home' | 'masterplan';
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  scrollToSection: (sectionId: string) => void;
  onSearchTrigger?: () => void;
  onOpenBrochure?: () => void;
  settings?: SiteSettings;
}

export default function Navbar({
  currentLanguage,
  setLanguage,
  activeTab,
  setActiveTab,
  scrollToSection,
  onSearchTrigger,
  onOpenBrochure,
  settings,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLanguage];
  const ui = t.ui as UITranslations;

  // Sections masquées depuis l'Espace Gérant (onglet « Sections ») : les liens
  // et CTA qui pointent vers une ancre absente du DOM sont retirés, sinon ils
  // seraient inertes (`scrollToSection` ne trouve aucun élément).
  const hiddenSectionAnchors = hiddenAnchors(settings);
  const sectionVisible = (anchorId: string) => !hiddenSectionAnchors.has(anchorId);

  useEffect(() => {
    // Keep the --nav-h CSS variable in sync with the real navbar height.
    // The navbar has two heights (resting vs scrolled); keying this effect
    // on isScrolled guarantees the variable is written AFTER React commits
    // the matching padding class, so the measured height is always final.
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const syncNavHeight = () => {
      document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
    };
    syncNavHeight();
    window.addEventListener('resize', syncNavHeight);
    return () => window.removeEventListener('resize', syncNavHeight);
  }, [isScrolled]);

  useEffect(() => {
    // Throttle via requestAnimationFrame : un setState par frame max (INP).
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setIsScrolled(window.scrollY > 50);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleNavLink = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    } else {
      scrollToSection(sectionId);
    }
  };

  const toggleLanguage = () => {
    setLanguage(currentLanguage === 'FR' ? 'EN' : 'FR');
  };

  return (
    <header className="relative">
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 px-4 md:px-12 border-b ${
          isScrolled || activeTab === 'masterplan'
            ? 'bg-[#00261a]/98 backdrop-blur-md shadow-lg py-2.5 border-white/10'
            : 'bg-[#00261a]/95 backdrop-blur-md shadow-sm py-3 border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo with Company Name */}
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            id="nav-logo"
            className="flex items-center space-x-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center font-bold font-serif text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
              SIC
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-secondary-fixed transition-colors block leading-tight">
                {settings.companyName || 'Sénégal Immobilier Consulting'}
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-secondary-fixed/80 font-medium hidden sm:block">
                Sébikhotane
              </span>
            </div>
          </button>

          {/* Desktop Navigation Linkages - Streamlined to 4 Essential Anchors */}
          <div className="hidden lg:flex items-center space-x-7 xl:space-x-9">
            <button
              onClick={() => {
                setActiveTab('masterplan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-sans font-bold text-xs uppercase tracking-wider cursor-pointer transition-all px-3 py-1.5 rounded-full flex items-center space-x-1.5 ${
                activeTab === 'masterplan'
                  ? 'bg-secondary-fixed text-primary shadow-xs'
                  : 'text-secondary-fixed hover:bg-white/10'
              }`}
            >
              <span>{currentLanguage === 'FR' ? 'Plan Cadastral' : 'Cadastral Plan'}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'masterplan' ? 'bg-primary text-secondary-fixed' : 'bg-secondary-fixed/20 text-secondary-fixed'
              }`}>
                54
              </span>
            </button>
            {sectionVisible('location') && (
              <button
                onClick={() => handleNavLink('location')}
                className={`font-sans font-medium text-xs uppercase tracking-wider cursor-pointer transition-colors ${
                  activeTab === 'home' ? 'text-white/85 hover:text-secondary-fixed' : 'text-white/60 hover:text-white'
                }`}
              >
                {t.nav.location}
              </button>
            )}
            {sectionVisible('guarantees') && (
              <button
                onClick={() => handleNavLink('guarantees')}
                className={`font-sans font-medium text-xs uppercase tracking-wider cursor-pointer transition-colors ${
                  activeTab === 'home' ? 'text-white/85 hover:text-secondary-fixed' : 'text-white/60 hover:text-white'
                }`}
              >
                {t.nav.guarantees}
              </button>
            )}
            {sectionVisible('simulator-section') && (
              <button
                onClick={() => handleNavLink('simulator-section')}
                className={`font-sans font-medium text-xs uppercase tracking-wider cursor-pointer transition-colors ${
                  activeTab === 'home' ? 'text-white/85 hover:text-secondary-fixed' : 'text-white/60 hover:text-white'
                }`}
              >
                {t.nav.simulator}
              </button>
            )}
          </div>

          {/* Controls Cluster - Clean, Uncluttered, Breathable */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Search Button (Compact icon) */}
            <button
              onClick={onSearchTrigger}
              className="p-2 rounded-full border border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer bg-white/5"
              title={ui.navSearchTitle}
              aria-label={ui.navSearchAria}
            >
              <Search className="w-4 h-4 text-secondary-fixed" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-white/15 text-white hover:bg-white/10 transition-all text-xs font-semibold cursor-pointer bg-white/5"
              title={ui.navLangTitle}
            >
              <Globe className="w-3.5 h-3.5 text-secondary-fixed" />
              <span>{currentLanguage === 'FR' ? 'EN' : 'FR'}</span>
            </button>

            {/* Primary CTA — masqué si la section Contact est masquée */}
            {sectionVisible('contact') && (
              <button
                onClick={() => handleNavLink('contact')}
                className="bg-secondary-container text-on-secondary-fixed px-5 py-2 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-secondary-fixed-dim transition-all duration-300 cursor-pointer shadow-md"
              >
                {t.bookVisit}
              </button>
            )}
          </div>

          {/* Mobile Action Controls */}
          <div className="md:hidden flex items-center space-x-1.5">
            <button
              onClick={onSearchTrigger}
              className="p-2 text-white/80 hover:text-white"
              title={ui.navMobileSearchTitle}
              aria-label={ui.navMobileSearchTitle}
            >
              <Search className="w-4 h-4 text-secondary-fixed" />
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center px-2 py-1 rounded-md border border-white/15 text-white text-xs font-semibold"
            >
              <Globe className="w-3 h-3 text-secondary-fixed mr-1" />
              <span>{currentLanguage === 'FR' ? 'EN' : 'FR'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[56px] bg-[#00261a] z-40 border-b border-white/10 shadow-2xl md:hidden px-6 py-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSearchTrigger?.();
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-2 text-white/60">
                  <Search className="w-4 h-4 text-secondary-fixed" />
                  <span className="text-xs font-light">
                    {ui.mobileSearchPlaceholder}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-secondary-fixed">OK</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('masterplan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left font-serif text-base font-bold text-secondary-fixed py-2 border-b border-white/10 flex items-center justify-between"
              >
                <span>{t.nav.masterPlan} {ui.mobileAvailableSuffix}</span>
                <span className="text-[10px] bg-secondary-fixed text-primary px-2 py-0.5 rounded font-mono font-bold">150 m²</span>
              </button>

              {sectionVisible('vision') && (
                <button
                  onClick={() => handleNavLink('vision')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed py-1"
                >
                  {t.nav.vision}
                </button>
              )}
              {sectionVisible('location') && (
                <button
                  onClick={() => handleNavLink('location')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed py-1"
                >
                  {t.nav.location}
                </button>
              )}
              {sectionVisible('guarantees') && (
                <button
                  onClick={() => handleNavLink('guarantees')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed py-1"
                >
                  {t.nav.guarantees} {ui.guaranteesSuffix}
                </button>
              )}
              {sectionVisible('simulator-section') && (
                <button
                  onClick={() => handleNavLink('simulator-section')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed py-1"
                >
                  {t.nav.simulator} {ui.simulatorSuffix}
                </button>
              )}
              {sectionVisible('packs-section') && (
                <button
                  onClick={() => handleNavLink('packs-section')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed py-1"
                >
                  {t.nav.packs} {ui.packsSuffix}
                </button>
              )}
              {sectionVisible('faqs-section') && (
                <button
                  onClick={() => handleNavLink('faqs-section')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed py-1"
                >
                  {t.nav.faq}
                </button>
              )}

              <div className="pt-3 border-t border-white/10 flex flex-col space-y-2.5">
                {onOpenBrochure && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenBrochure();
                    }}
                    className="w-full py-2.5 px-4 bg-amber-400/15 border border-amber-400/40 text-amber-300 rounded-xl text-xs flex items-center justify-center space-x-2 font-semibold cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-300" />
                    <span>{ui.mobileBrochureBtn}</span>
                  </button>
                )}

                {sectionVisible('contact') && (
                  <button
                    onClick={() => handleNavLink('contact')}
                    className="bg-secondary-container text-on-secondary-fixed py-3 rounded-xl font-sans font-bold text-xs tracking-widest uppercase hover:bg-secondary-fixed-dim transition-all text-center"
                  >
                    {t.bookVisit}
                  </button>
                )}

                {/* Accès gestionnaire retiré du menu public : l'Espace Gérant
                    n'est plus joignable que par l'URL directe /admin. */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
