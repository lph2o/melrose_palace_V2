import { useState, useEffect } from 'react';
import { Globe, PhoneCall, Search, ShieldCheck, Calculator, FileText, Share2 } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { TRANSLATIONS, ESTATE_AREA_RANGE } from '../data';
import { hiddenAnchors } from '../site/sectionsCatalog';
import Logo from './Logo';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  activeTab: 'home' | 'masterplan';
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  scrollToSection: (sectionId: string) => void;
  onSearchTrigger?: () => void;
  onOpenBrochure?: () => void;
  onOpenShare?: () => void;
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
  onOpenShare,
  settings,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[currentLanguage];
  const ui = t.ui as UITranslations;
  const surfaceRange = currentLanguage === 'FR' ? ESTATE_AREA_RANGE.FR : ESTATE_AREA_RANGE.EN;

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
    //
    // Mesure observée plutôt qu'écoutée : la barre grandit aussi sans
    // redimensionnement de fenêtre — c'est le cas quand la marge de sécurité
    // iOS change (rotation) ou quand la police web finit de charger. Un simple
    // écouteur `resize` laissait alors `--nav-h` en retard, et le menu mobile
    // se glissait sous la barre.
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const syncNavHeight = () => {
      document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
    };
    syncNavHeight();
    const observer = new ResizeObserver(syncNavHeight);
    observer.observe(nav, { box: 'border-box' });
    return () => observer.disconnect();
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

  // Menu mobile : fermeture au clavier (Échap), verrouillage du défilement de
  // la page derrière l'overlay, et fermeture automatique si on repasse en
  // largeur bureau (sinon l'overlay resterait monté, invisible).
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="relative">
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-[var(--z-nav)] transition-[background-color,box-shadow,border-color] duration-400 px-5 md:px-12 border-b ${
          isScrolled || activeTab === 'masterplan'
            ? 'bg-[#00261a]/98 backdrop-blur-md shadow-elev-2 py-2.5 border-white/10'
            : 'bg-[#00261a]/95 backdrop-blur-md shadow-elev-1 py-3 border-white/10'
        }`}
      >
        {/* Enveloppe interne : c'est ici que se réservent les marges de sécurité
            (l'encoche en haut, les bords arrondis en paysage). Le fond sombre de
            la barre, lui, reste plein format jusqu'aux bords de l'écran. */}
        <div className="max-w-7xl mx-auto flex justify-between items-center safe-t safe-x">
          {/* Logo with Company Name */}
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            id="nav-logo"
            className="flex items-center text-left cursor-pointer group min-w-0 tap-44"
          >
            {/* La marque porte elle-même le nom de l'entreprise et le filet
                tricolore : rien n'est répété en texte à côté. `h-10` est le
                plancher de lisibilité (voir components/Logo). La marque reste
                plus étroite que l'ancien bloc « pastille + nom », donc la barre
                ne se charge pas — même en 320 px. */}
            <Logo
              label={settings?.companyName || 'Senegal Investment Consulting'}
              className="h-10 sm:h-12 w-auto origin-left transition-transform duration-400 ease-spring group-hover:scale-[1.03]"
            />
          </button>

          {/* Desktop Navigation Linkages - Streamlined to 4 Essential Anchors */}
          <div className="hidden lg:flex items-center space-x-7 xl:space-x-9">
            <button
              onClick={() => {
                setActiveTab('masterplan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-sans font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-400 ease-spring px-3 py-2.5 rounded-full flex items-center space-x-1.5 tap-44 ${
                activeTab === 'masterplan'
                  ? 'bg-secondary-fixed text-primary shadow-elev-1'
                  : 'text-secondary-fixed hover:bg-white/10'
              }`}
            >
              <span>{currentLanguage === 'FR' ? 'Plan Cadastral' : 'Cadastral Plan'}</span>
              <span className={`text-micro px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'masterplan' ? 'bg-primary text-secondary-fixed' : 'bg-secondary-fixed/20 text-secondary-fixed'
              }`}>
                54
              </span>
            </button>
            {sectionVisible('location') && (
              <button
                onClick={() => handleNavLink('location')}
                className={`font-sans font-medium text-xs uppercase tracking-wider cursor-pointer transition-colors py-2.5 px-1 tap-44 ${
                  activeTab === 'home' ? 'text-white/85 hover:text-secondary-fixed' : 'text-white/70 hover:text-white'
                }`}
              >
                {t.nav.location}
              </button>
            )}
            {sectionVisible('guarantees') && (
              <button
                onClick={() => handleNavLink('guarantees')}
                className={`font-sans font-medium text-xs uppercase tracking-wider cursor-pointer transition-colors py-2.5 px-1 tap-44 ${
                  activeTab === 'home' ? 'text-white/85 hover:text-secondary-fixed' : 'text-white/70 hover:text-white'
                }`}
              >
                {t.nav.guarantees}
              </button>
            )}
            {sectionVisible('simulator-section') && (
              <button
                onClick={() => handleNavLink('simulator-section')}
                className={`font-sans font-medium text-xs uppercase tracking-wider cursor-pointer transition-colors py-2.5 px-1 tap-44 ${
                  activeTab === 'home' ? 'text-white/85 hover:text-secondary-fixed' : 'text-white/70 hover:text-white'
                }`}
              >
                {t.nav.simulator}
              </button>
            )}
            {/* « Nos Services » n'est pas ajouté à cette barre : mesuré en A/B,
                le 5ᵉ lien porte le logo à 0 px de large à 1024 px de viewport (la
                barre passe de 73 à 108 px de haut, le logo est écrasé). Le lien
                reste dans le menu mobile et dans le pied de page. */}
          </div>

          {/* Controls Cluster - Clean, Uncluttered, Breathable */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Quick Search Button (Compact icon) */}
            <button
              onClick={onSearchTrigger}
              className="p-3 rounded-full border border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-400 ease-spring cursor-pointer bg-white/5 tap-44"
              title={ui.navSearchTitle}
              aria-label={ui.navSearchAria}
            >
              <Search className="w-4 h-4 text-secondary-fixed" />
            </button>

            {/* Partage du projet sur les réseaux sociaux */}
            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="p-3 rounded-full border border-white/15 text-white/90 hover:text-white hover:bg-white/10 transition-all duration-400 ease-spring cursor-pointer bg-white/5 tap-44"
                title={currentLanguage === 'FR' ? 'Partager le projet' : 'Share this project'}
                aria-label={currentLanguage === 'FR' ? 'Partager le projet' : 'Share this project'}
              >
                <Share2 className="w-4 h-4 text-secondary-fixed" />
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2.5 rounded-full border border-white/15 text-white hover:bg-white/10 transition-all duration-400 cursor-pointer bg-white/5 tap-44 text-xs font-semibold"
              title={ui.navLangTitle}
            >
              <Globe className="w-3.5 h-3.5 text-secondary-fixed" />
              <span>{currentLanguage === 'FR' ? 'EN' : 'FR'}</span>
            </button>

            {/* Primary CTA — masqué si la section Contact est masquée */}
            {sectionVisible('contact') && (
              <button
                onClick={() => handleNavLink('contact')}
                className="bg-secondary-container text-on-secondary-fixed px-5 py-3 rounded-full font-sans font-bold text-xs tracking-wider uppercase hover:bg-secondary-fixed-dim transition-all duration-400 cursor-pointer shadow-elev-2"
              >
                {t.bookVisit}
              </button>
            )}
          </div>

          {/* Mobile Action Controls — chaque contrôle fait au moins 44px de
              zone tactile (`tap-44` étend la cible sans grossir le glyphe). */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onSearchTrigger}
              className="p-3 text-white/85 hover:text-white tap-44"
              title={ui.navMobileSearchTitle}
              aria-label={ui.navMobileSearchTitle}
            >
              <Search className="w-4 h-4 text-secondary-fixed" />
            </button>

            {onOpenShare && (
              <button
                onClick={onOpenShare}
                className="p-3 text-white/85 hover:text-white tap-44"
                title={currentLanguage === 'FR' ? 'Partager' : 'Share'}
                aria-label={currentLanguage === 'FR' ? 'Partager' : 'Share'}
              >
                <Share2 className="w-4 h-4 text-secondary-fixed" />
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center px-2.5 py-2.5 rounded-micro border border-white/15 text-white text-xs font-semibold tap-44"
              title={ui.navLangTitle}
            >
              <Globe className="w-3.5 h-3.5 text-secondary-fixed mr-1" />
              <span>{currentLanguage === 'FR' ? 'EN' : 'FR'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-3 rounded-full hover:bg-white/5 transition-colors duration-400 cursor-pointer tap-44"
              aria-label={currentLanguage === 'FR' ? 'Menu' : 'Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {/* Morphing hamburger → croix : les trois barres pivotent, elles
                  ne disparaissent pas. */}
              <span className="relative block w-5 h-4">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-400 ease-spring ${
                    mobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-400 ease-spring ${
                    mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 bottom-0 h-0.5 w-5 rounded-full bg-current transition-all duration-400 ease-spring ${
                    mobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          /* Le calque couvre tout l'écran, mais seul le panneau est peint : la
             page reste visible en dessous. Deux conséquences voulues — le tap
             hors du panneau referme le menu (le pouce n'a pas à chercher la
             croix en haut à droite), et la page derrière ne défile plus tant
             que le menu est ouvert.

             `--z-menu` et non un calque haut : le menu doit rester **sous** la
             navbar, qui porte la croix de fermeture. Au-dessus, il la
             recouvrirait et le menu deviendrait impossible à refermer au doigt. */
          <motion.div
            data-menu-scrim=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[var(--z-menu)] md:hidden"
            onClick={(event) => {
              if (event.target === event.currentTarget) setMobileMenuOpen(false);
            }}
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3 }}
              // Positionnement dérivé de la hauteur réelle de la navbar
              // (`--nav-h`) : plus de décalage codé en dur qui laissait 25px du
              // menu passer sous la barre.
              className="pt-[var(--nav-h)] bg-[#00261a] safe-x safe-b"
            >
            <div className="border-b border-white/10 shadow-elev-3 px-5 py-6 max-h-[calc(100dvh-var(--nav-h)-var(--safe-bottom))] overflow-y-auto">
              <div className="flex flex-col space-y-4 menu-stagger">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSearchTrigger?.();
                }}
                className="w-full min-h-[44px] bg-white/5 border border-white/10 rounded-inner py-2.5 px-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-2 text-white/70">
                  <Search className="w-4 h-4 text-secondary-fixed" />
                  <span className="text-xs font-light">
                    {ui.mobileSearchPlaceholder}
                  </span>
                </div>
                <span className="text-caption font-mono font-bold text-secondary-fixed">OK</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveTab('masterplan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left font-serif text-base font-bold text-secondary-fixed min-h-[44px] py-2 border-b border-white/10 flex items-center justify-between"
              >
                <span>
                  {t.nav.masterPlan} {ui.mobileAvailableSuffix}
                </span>
                <span className="text-caption bg-secondary-fixed text-primary px-2 py-0.5 rounded-micro font-mono font-bold">{surfaceRange}</span>
              </button>

              {sectionVisible('vision') && (
                <button
                  onClick={() => handleNavLink('vision')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
                >
                  {t.nav.vision}
                </button>
              )}
              {sectionVisible('location') && (
                <button
                  onClick={() => handleNavLink('location')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
                >
                  {t.nav.location}
                </button>
              )}
              {sectionVisible('guarantees') && (
                <button
                  onClick={() => handleNavLink('guarantees')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
                >
                  {t.nav.guarantees} {ui.guaranteesSuffix}
                </button>
              )}
              {sectionVisible('simulator-section') && (
                <button
                  onClick={() => handleNavLink('simulator-section')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
                >
                  {t.nav.simulator} {ui.simulatorSuffix}
                </button>
              )}
              {sectionVisible('packs-section') && (
                <button
                  onClick={() => handleNavLink('packs-section')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
                >
                  {t.nav.packs} {ui.packsSuffix}
                </button>
              )}
              {sectionVisible('services') && (
                <button
                  onClick={() => handleNavLink('services')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
                >
                  {t.nav.services}
                </button>
              )}
              {sectionVisible('faqs-section') && (
                <button
                  onClick={() => handleNavLink('faqs-section')}
                  className="text-left font-serif text-base text-white/90 hover:text-secondary-fixed min-h-[44px] flex items-center transition-colors duration-400"
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
                    className="w-full min-h-[44px] py-2.5 px-4 bg-secondary-fixed/15 border border-gold-line/40 text-secondary-fixed rounded-inner text-caption flex items-center justify-center space-x-2 font-semibold cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-secondary-fixed" />
                    <span>{ui.mobileBrochureBtn}</span>
                  </button>
                )}

                {onOpenShare && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenShare();
                    }}
                    className="w-full min-h-[44px] py-2.5 px-4 bg-white/10 border border-white/20 text-white rounded-inner text-caption flex items-center justify-center space-x-2 font-semibold cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-secondary-fixed" />
                    <span>
                      {currentLanguage === 'FR'
                        ? 'Partager le projet (WhatsApp, Facebook…)'
                        : 'Share the project (WhatsApp, Facebook…)'}
                    </span>
                  </button>
                )}

                {sectionVisible('contact') && (
                  <button
                    onClick={() => handleNavLink('contact')}
                    className="bg-secondary-container text-on-secondary-fixed min-h-[48px] flex items-center justify-center rounded-inner font-sans font-bold text-caption tracking-widest uppercase hover:bg-secondary-fixed-dim transition-all duration-400 text-center"
                  >
                    {t.bookVisit}
                  </button>
                )}

                {/* Accès gestionnaire retiré du menu public : l'Espace Gérant
                    n'est plus joignable que par l'URL directe /admin. */}
                </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
