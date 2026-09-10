import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Compass,
  LineChart,
  CheckCircle,
  Plus,
  MessageCircle,
  Phone,
  Mail,
  Locate,
  MapPin,
  Check,
  Sparkles,
  BookOpen,
  Star,
  Quote,
  Play,
  X,
  Calculator,
  ArrowRight,
  Landmark,
  Building,
  Hammer,
  BadgeCheck,
  AlertCircle,
  Train,
  Plane,
  Anchor,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Language, BlogArticle, SiteSettings, Parcel, UITranslations } from '../types';
import { insertLead } from '../lib/supabase';
import {
  TRANSLATIONS,
  CONNECTIVITY_ITEMS,
  ADVANTAGES_ITEMS,
  FAQ_ITEMS,
  BLOG_ARTICLES,
  COMPLEMENTARY_PACKS,
  PAYMENT_SCHEDULE_TIERS,
  TESTIMONIALS,
  SITE_MEDIA_BASE_URL
} from '../data';
import { motion, AnimatePresence } from 'motion/react';
import VideoShowcase from './VideoShowcase';
const AERIAL_IMAGE_FALLBACK = `${SITE_MEDIA_BASE_URL}/images/54_parcelles.png`;
const HERO_IMAGE_FALLBACK = `${SITE_MEDIA_BASE_URL}/images/hero.jpg`;
import {
  CADASTRAL_BORNES,
  CADASTRAL_ROAD_NETWORK,
  CADASTRAL_PARCELS_GEO
} from '../cadastreGeometry';

interface LandingPageProps {
  currentLanguage: Language;
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  scrollToSection: (id: string) => void;
  globalActiveFaqId?: string | null;
  onClearGlobalActiveFaqId?: () => void;
  onSelectArticle?: (article: BlogArticle) => void;
  onOpenBrochure?: () => void;
  settings: SiteSettings;
  parcels: Parcel[];
  onSelectParcel: (id: number) => void;
}

export default function LandingPage({
  currentLanguage,
  setActiveTab,
  scrollToSection,
  globalActiveFaqId,
  onClearGlobalActiveFaqId,
  onSelectArticle,
  onOpenBrochure,
  settings,
  parcels,
  onSelectParcel,
}: LandingPageProps) {
  const t = TRANSLATIONS[currentLanguage];
  const ui = t.ui as UITranslations;
  // Images du site pilotées depuis l'Espace Gérant (onglet Contenu → Images du site)
  const heroImage = settings.heroImage || HERO_IMAGE_FALLBACK;
  const aerialImage = settings.aerialImage || AERIAL_IMAGE_FALLBACK;
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Simulator state
  const [simulatorDeposit, setSimulatorDeposit] = useState<number>(settings.defaultDeposit || 3000);
  const [simulatorMonthly, setSimulatorMonthly] = useState<number>(settings.defaultMonthly || 300);

  // Vision section plan view mode: 'overlay' (cadastre projected on drone photo) or 'plan' (surveyor 2D plan)
  const [visionViewMode, setVisionViewMode] = useState<'overlay' | 'plan'>('overlay');

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Parcelle 150 m² (Paiement échelonné 300 €/mois)',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Calculate simulator outputs
  const calculatedRemaining = Math.max(0, settings.basePrice - simulatorDeposit);
  const calculatedDuration = simulatorMonthly > 0 ? Math.ceil(calculatedRemaining / simulatorMonthly) : 40;

  useEffect(() => {
    // Throttle via requestAnimationFrame : le scroll ne déclenche qu'un
    // setState par frame (INP — évite les re-rendus à chaque événement).
    let raf = 0;
    const handleScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          setScrollProgress((window.scrollY / totalHeight) * 100);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);


  useEffect(() => {
    if (globalActiveFaqId) {
      setActiveFaq(globalActiveFaqId);
      setTimeout(() => {
        const el = document.getElementById('faqs-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      onClearGlobalActiveFaqId?.();
    }
  }, [globalActiveFaqId, onClearGlobalActiveFaqId]);

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setIsSubmitted(true);
      // Enregistre la demande dans Supabase (Espace Gérant → onglet Demandes de contact)
      insertLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        interest: formData.interest,
        message: formData.message,
      });
      // Construct WhatsApp message URL to redirect directly
      const msg = ui.contactWaMsg
        .replace('{name}', formData.name)
        .replace('{interest}', formData.interest)
        .replace('{phone}', formData.phone)
        .replace('{email}', formData.email)
        .replace('{message}', formData.message);
      const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setFormData({ name: '', email: '', phone: '', interest: 'Parcelle 150 m²', message: '' });
    }, 1000);
  };

  const openWhatsAppSimulator = () => {
    const msg = `${ui.simWaMsgPrefix}\n- Apport : ${simulatorDeposit.toLocaleString()} €\n- Reste : ${calculatedRemaining.toLocaleString()} €\n- Mensualité : ${simulatorMonthly} €/mois\n- Durée : ${calculatedDuration} mois.\n${ui.simWaMsgSuffix}`;
    const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openWhatsAppDossier = () => {
    const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(ui.dossierWaMsg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openWhatsApp = (msg: string) => {
    const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-background text-on-background overflow-x-clip">
      {/* Scroll Depth Progress Indicator */}
      <div 
        id="scroll-progress-container"
        className="fixed top-0 left-0 right-0 h-[3px] bg-secondary-fixed/20 z-[110] pointer-events-none"
      >
        <div 
          id="scroll-progress-bar"
          className="h-full bg-secondary-fixed rounded-r-full shadow-[0_0_8px_rgba(230,190,100,0.6)] transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* TOP PROMO BANNER FOR FIRST 10 BUYERS */}
      {settings.promoActive && (
        <div
          className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white text-xs font-medium py-2.5 px-4 text-center sticky z-30 shadow-md"
          style={{ top: 'var(--nav-h)', marginTop: 'var(--nav-h)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
              ⭐ {settings.promoTitle || ui.promoBadge}
            </span>
            <span>
              {settings.promoDesc || ui.promoText.replace('{remaining}', String(settings.promoPlotsRemaining))}
            </span>
            <button
              onClick={() => {
                setActiveTab('masterplan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-block underline font-bold hover:text-amber-100 cursor-pointer text-xs ml-1 py-2 px-1"
            >
              {ui.promoCta}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: HERO VIEW */}
      <section className={`relative min-h-[92vh] flex items-center justify-center overflow-x-clip ${settings.promoActive ? 'pt-12 sm:pt-16' : 'pt-20 sm:pt-24'} pb-16`}>
        {/* Background Visual */}
        <div className="absolute inset-0 z-0 bg-[#001c13]">
          <img
            src={heroImage}
            alt={ui.heroImgAlt}
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        
        {/* Deep atmospheric gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent z-1" />

        {/* Hero Interactive Typography & CTA */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 text-center py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 md:space-y-7"
          >
            {/* Project Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-secondary-fixed/40 shadow-sm text-secondary-fixed text-xs font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.hero.badge}</span>
            </div>

            {/* Central Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
              {t.hero.title}
              <span className="text-secondary-fixed block sm:inline underline decoration-secondary-fixed/40 underline-offset-8">
                {t.hero.titleSpan}
              </span>
            </h1>

            {/* Sub Message / Key Selling Point */}
            <p className="font-serif text-lg sm:text-2xl text-amber-200/90 font-medium max-w-3xl mx-auto">
              « {t.subMessage} »
            </p>
            
            <p className="font-sans text-sm sm:text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              {t.hero.desc}
            </p>

            {/* Value Highlights Chips */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-2 text-xs text-white/90">
              <span className="inline-flex items-center bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                <Check className="w-3.5 h-3.5 text-secondary-fixed mr-1.5 shrink-0" />
                {t.hero.bullet1}
              </span>
              <span className="inline-flex items-center bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                <Check className="w-3.5 h-3.5 text-secondary-fixed mr-1.5 shrink-0" />
                {t.hero.bullet2}
              </span>
              <span className="inline-flex items-center bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                <Check className="w-3.5 h-3.5 text-secondary-fixed mr-1.5 shrink-0" />
                {t.hero.bullet3}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-6 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  setActiveTab('masterplan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-secondary-container text-on-secondary-fixed px-7 py-4 rounded-xl font-sans font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-secondary-fixed-dim transition-all shadow-xl cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{t.hero.explore}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => scrollToSection('simulator-section')}
                className="w-full sm:w-auto border-2 border-secondary-fixed/60 text-secondary-fixed bg-white/5 hover:bg-secondary-fixed hover:text-primary px-7 py-4 rounded-xl font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Calculator className="w-4 h-4" />
                <span>{t.hero.simulate}</span>
              </button>

              {onOpenBrochure && (
                <button
                  onClick={onOpenBrochure}
                  className="w-full sm:w-auto bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 px-6 py-4 rounded-xl font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>{ui.heroBrochureBtn}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Floating Quick Metric Badges */}
        <div className="absolute bottom-6 left-4 right-4 md:left-12 md:right-12 z-20 hidden lg:flex items-center gap-4 max-w-7xl mx-auto pointer-events-none">
          <div className="bg-[#002217]/95 backdrop-blur-md border-2 border-secondary-fixed/50 p-4 rounded-xl flex items-center space-x-3.5 shadow-2xl pointer-events-auto flex-1 hover:border-secondary-fixed transition-all">
            <div className="w-12 h-12 bg-secondary-fixed text-primary rounded-xl flex flex-col items-center justify-center font-mono font-bold shadow-md shrink-0">
              <span className="text-base font-bold leading-none">20</span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-primary/80">{ui.heroStatLots}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-bold text-secondary-fixed uppercase tracking-wider mb-0.5">
                {t.hero.statsAvailable}
              </p>
              <p className="font-serif text-sm font-bold text-white tracking-tight leading-snug">
                {t.hero.statsAvailableVal}
              </p>
            </div>
          </div>

          <div className="bg-[#002217]/95 backdrop-blur-md border-2 border-secondary-fixed/50 p-4 rounded-xl flex items-center space-x-3.5 shadow-2xl pointer-events-auto flex-1 hover:border-secondary-fixed transition-all">
            <div className="w-12 h-12 bg-secondary-fixed text-primary rounded-xl flex flex-col items-center justify-center font-mono font-bold shadow-md shrink-0">
              <span className="text-base font-bold leading-none">150</span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-primary/80">{ui.heroStatSqm}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-bold text-secondary-fixed uppercase tracking-wider mb-0.5">
                {currentLanguage === 'FR' ? 'Superficie de Référence' : 'Standard Plot Size'}
              </p>
              <p className="font-serif text-sm font-bold text-white tracking-tight leading-snug">
                {ui.heroStatSizeVal}
              </p>
            </div>
          </div>

          <div className="bg-[#002217]/95 backdrop-blur-md border-2 border-secondary-fixed/50 p-4 rounded-xl flex items-center space-x-3.5 shadow-2xl pointer-events-auto flex-1 hover:border-secondary-fixed transition-all">
            <div className="w-12 h-12 bg-secondary-fixed text-primary rounded-xl flex flex-col items-center justify-center font-mono font-bold shadow-md shrink-0">
              <span className="text-sm font-bold leading-none">300€</span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-primary/80">{ui.heroStatPerMonth}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-bold text-secondary-fixed uppercase tracking-wider mb-0.5">
                {currentLanguage === 'FR' ? 'Paiement Échelonné' : 'Flexible Payment Plan'}
              </p>
              <p className="font-serif text-sm font-bold text-white tracking-tight leading-snug">
                {ui.heroStatPayVal}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST GUARANTEES BADGES BAR */}
      <section id="guarantees" className="bg-[#00261a] text-white py-12 px-4 md:px-12 border-t border-b border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-secondary-fixed block">
              {t.guarantees.sectionTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
              {t.guarantees.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
              {t.guarantees.desc}
            </p>
          </div>

          {/* Very visible guarantee badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {t.guarantees.points.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/25 rounded-xl p-5 hover:bg-white/10 hover:border-white/40 transition-colors space-y-2"
              >
                <div className="flex items-center space-x-2.5 text-secondary-fixed">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-white/75 leading-relaxed font-light pl-7">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Strict contractual commitment pill */}
          <div className="bg-amber-500/15 border border-amber-400/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-amber-400/20 text-amber-300 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-serif font-bold text-sm sm:text-base text-amber-200">
                  {ui.guaranteesCommitment}
                </p>
                <p className="text-xs text-white/80 font-light">
                  {ui.guaranteesCommitmentDesc}
                </p>
              </div>
            </div>
            <button
              onClick={openWhatsAppDossier}
              className="bg-amber-400 hover:bg-amber-300 text-primary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-md"
            >
              {ui.guaranteesVerifyDocs}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: NOTRE VISION */}
      <section id="vision" className="py-20 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Visual Area - Photo Drone Orthophoto des 54 Parcelles & Plan */}
          <div className="lg:col-span-6 relative h-[440px] sm:h-[500px] md:h-[540px] rounded-2xl overflow-hidden shadow-2xl border border-gray-300 group bg-neutral-900">
            {/* View Mode 1: Authentic Drone Photo with 54 plots embedded on the ground */}
            {visionViewMode === 'overlay' ? (
              <img
                src={aerialImage}
                alt={ui.aerialImgAlt}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            ) : (
              /* View Mode 2: Official 2D Surveyor Cadastral Plan */
              <div className="w-full h-full bg-[#EFECE6] relative flex items-center justify-center p-4">
                <svg
                  viewBox="20 40 960 620"
                  className="w-full h-full max-h-[460px] select-none filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
                >
                  <defs>
                    <filter id="plan-shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
                    </filter>
                  </defs>

                  {/* Outer Cadastral Perimeter Polygon (B1 à B17) in bold white dashed line */}
                  <polygon
                    points="490,75 630,135 748,195 898,235 925,385 740,465 705,520 605,595 570,620 518,535 405,420 244,320 160,275 55,205 85,155 140,165 405,170"
                    fill="#F9F7F1"
                    stroke="#1E3A8A"
                    strokeWidth="3"
                    strokeDasharray="8,5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Interior Road Network (Voiries 12m) */}
                  <polygon points={CADASTRAL_ROAD_NETWORK.northRoad} fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
                  <polygon points={CADASTRAL_ROAD_NETWORK.westRoad} fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
                  <polygon points={CADASTRAL_ROAD_NETWORK.centralRoad} fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
                  <polygon points={CADASTRAL_ROAD_NETWORK.eastRoad} fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />

                  {/* All 54 Parcels with Official Surveyor Colors */}
                  {Object.values(CADASTRAL_PARCELS_GEO).map((p) => {
                    let fillColor = '#86EFAC';
                    if (p.zone === 'green') fillColor = '#86EFAC';
                    else if (p.zone === 'yellow') fillColor = '#FEF08A';
                    else if (p.zone === 'red') fillColor = '#FCA5A5';
                    else if (p.zone === 'salmon') fillColor = '#FDA4AF';

                    return (
                      <g key={p.id}>
                        <polygon points={p.points} fill={fillColor} stroke="#FFFFFF" strokeWidth="1.2" />
                        <text
                          x={p.cx}
                          y={p.cy + 3}
                          textAnchor="middle"
                          fontSize={p.id > 50 || p.id === 4 ? 9 : 8}
                          fontWeight="bold"
                          fill="#111827"
                          className="select-none pointer-events-none font-mono"
                        >
                          {p.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* Boundary Surveyor Bornes B1 to B17 */}
                  {CADASTRAL_BORNES.map((b) => (
                    <g key={b.id}>
                      <circle cx={b.x} cy={b.y} r="6.5" fill="#000000" stroke="#FFFFFF" strokeWidth="2" />
                      <text
                        x={b.labelX}
                        y={b.labelY}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="900"
                        fill="#FFFFFF"
                        stroke="#000000"
                        strokeWidth="3"
                        paintOrder="stroke"
                      >
                        {b.id}
                      </text>
                    </g>
                  ))}

                  {/* Compass Rose */}
                  <g transform="translate(900, 75) scale(0.65)">
                    <circle cx="0" cy="0" r="22" fill="#FFFFFF" stroke="#00261a" strokeWidth="2" />
                    <polygon points="0,-18 5,0 -5,0" fill="#DC2626" />
                    <polygon points="0,18 5,0 -5,0" fill="#1F2937" />
                    <text x="0" y="-22" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF" stroke="#000000" strokeWidth="2" paintOrder="stroke">N</text>
                  </g>
                </svg>
              </div>
            )}

            {/* Exactly ONE modern white location pin placed directly above parcel 54, slightly elevated with a circular negative center */}
            <div className="absolute top-[16%] sm:top-[17%] left-[50%] -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center">
              <div className="relative flex flex-col items-center pointer-events-auto">
                {/* Modern clean white location pin with circular negative center */}
                <svg
                  className="w-7 h-9 sm:w-8 sm:h-10 filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.7)]"
                  viewBox="0 0 24 32"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 0C5.37258 0 0 5.37258 0 12C0 19.5 10.8 30.8 11.26 31.28C11.66 31.7 12.34 31.7 12.74 31.28C13.2 30.8 24 19.5 24 12C24 5.37258 18.6274 0 12 0ZM12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
                    fill="#FFFFFF"
                  />
                </svg>
                {/* Subtle ground shadow to show it's slightly elevated above terrain */}
                <div className="w-3.5 h-1 bg-black/50 rounded-full blur-[1px] mt-0.5" />
              </div>
            </div>

            {/* Top Switcher & Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-30 pointer-events-auto">
              <span className="inline-flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {visionViewMode === 'overlay' ? ui.visionOverlayBadge : ui.visionPlanBadge}
              </span>

              <div className="flex items-center bg-black/75 backdrop-blur-md border border-white/20 p-1 rounded-xl space-x-1 text-[10px] font-bold text-white">
                <button
                  onClick={() => setVisionViewMode('overlay')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    visionViewMode === 'overlay' ? 'bg-secondary-fixed text-primary' : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  {ui.visionViewDrone}
                </button>
                <button
                  onClick={() => setVisionViewMode('plan')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    visionViewMode === 'plan' ? 'bg-secondary-fixed text-primary' : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  {ui.visionViewPlan}
                </button>
              </div>
            </div>

            {/* Bottom Info Bar with link to Masterplan */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
              <div>
                <span className="bg-secondary-fixed text-primary px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider shadow-xs">
                  {ui.visionCertifiedBadge}
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-white">{ui.visionDomainName}</h4>
                <p className="text-[11px] text-white/90 font-light">
                  {ui.visionDashedLegendEn}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('masterplan');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white/15 hover:bg-white/25 border border-white/40 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer backdrop-blur-md shrink-0 shadow-md"
              >
                <span>{ui.heroExplorePlan}</span>
                <ChevronRight className="w-3.5 h-3.5 text-secondary-fixed" />
              </button>
            </div>
          </div>

          {/* Right Rich Text Information */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="font-mono font-bold text-xs uppercase text-secondary tracking-widest block">
                {t.vision.sectionTag}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary leading-tight">
                {t.vision.title}
              </h2>
            </div>

            <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed text-justify font-light">
              {t.vision.desc}
            </p>

            {/* Key 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-white border border-gray-300 shadow-xs space-y-2 hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <ShieldCheck className="w-5 h-5 text-secondary" />
                  <h4 className="font-serif text-sm">{t.vision.ownership}</h4>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {t.vision.ownershipDesc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-300 shadow-xs space-y-2 hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <MapPin className="w-5 h-5 text-secondary" />
                  <h4 className="font-serif text-sm">{t.vision.location}</h4>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {t.vision.locationDesc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-300 shadow-xs space-y-2 hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <LineChart className="w-5 h-5 text-secondary" />
                  <h4 className="font-serif text-sm">{t.vision.growth}</h4>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {t.vision.growthDesc}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-300 shadow-xs space-y-2 hover:border-gray-400 hover:shadow-sm transition-all">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <Landmark className="w-5 h-5 text-secondary" />
                  <h4 className="font-serif text-sm">{t.vision.value}</h4>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {t.vision.valueDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.5: VIDÉOS PRÉSENTATION DU DOMAINE */}
      <VideoShowcase currentLanguage={currentLanguage} videos={settings.content?.videos} />

      {/* SECTION 3: UNE LOCALISATION STRATÉGIQUE (SÉBIKHOTANE) */}
      <section id="location" className="py-20 bg-surface-container-low px-4 md:px-12 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-mono font-bold text-xs uppercase text-secondary tracking-widest block">
              {t.location.sectionTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              {t.location.title}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
              {t.location.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Visual Location Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-300 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <span className="font-mono text-xs uppercase font-bold text-secondary">
                    {ui.locationCardTag}
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                    {ui.locationRegionPill}
                  </span>
                </div>
                <h4 className="font-serif text-xl font-bold text-primary">
                  {ui.locationTriangleTitle}
                </h4>
                <p
                  className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{
                    __html: ui.locationTriangleDesc.replace('<strong>', '<strong class="font-semibold">'),
                  }}
                />
              </div>

              {/* Infrastructure Connectivity List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                  <Plane className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-primary block">{ui.locationAibd}</span>
                    <span className="text-[11px] text-outline">{ui.locationAibdSub}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                  <Train className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-primary block">{ui.locationTer}</span>
                    <span className="text-[11px] text-outline">{ui.locationTerSub}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                  <Building className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-primary block">{ui.locationDiamniadio}</span>
                    <span className="text-[11px] text-outline">{ui.locationDiamniadioSub}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                  <Anchor className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs text-primary block">{ui.locationNdayane}</span>
                    <span className="text-[11px] text-outline">{ui.locationNdayaneSub}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-[11px] text-outline font-mono">{ui.locationDistancesFootnote}</span>
                <button
                  onClick={openWhatsAppDossier}
                  className="text-xs font-bold text-secondary hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>{ui.locationRequestPlan}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Quick Metrics Cards */}
            <div className="lg:col-span-5 flex flex-col space-y-4 justify-between">
              {(settings.content?.connectivity ?? CONNECTIVITY_ITEMS).map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-gray-300 border-l-4 border-l-secondary flex flex-col justify-between hover:border-gray-400 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-serif font-bold text-sm sm:text-base text-primary">
                      {item.title[currentLanguage]}
                    </span>
                    <span className="font-mono font-bold text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                    {item.description[currentLanguage]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SIMULATEUR DE FINANCEMENT INTERACTIF */}
      <section id="simulator-section" className="py-20 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="bg-gradient-to-br from-primary to-[#003826] text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl border border-secondary-fixed/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-fixed/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Description & Inputs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-secondary-fixed">
                  {ui.simulatorTransparencyTag}
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                  {t.masterPlan.calculator.title}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                  {t.masterPlan.calculator.desc}
                </p>
              </div>

              {/* Deposit Quick Tiers Buttons */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-fixed">
                  {ui.simulatorDepositLabel}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[3000, 4000, 5000, 6000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSimulatorDeposit(amount)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer text-center ${
                        simulatorDeposit === amount
                          ? 'bg-secondary-fixed text-primary shadow-lg ring-2 ring-white/50'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      {amount.toLocaleString()} €
                      <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                        {amount === 3000 ? ui.simulatorDepositBase : ui.simulatorDepositFlex}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Payment Choice */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold uppercase tracking-wider text-secondary-fixed">
                    {ui.simulatorMonthlyLabel}
                  </label>
                  <span className="font-mono font-bold text-secondary-fixed bg-white/10 px-2.5 py-1 rounded">
                    {simulatorMonthly} € {ui.simulatorPerMonth}
                  </span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="600"
                  step="50"
                  value={simulatorMonthly}
                  onChange={(e) => setSimulatorMonthly(Number(e.target.value))}
                  className="w-full accent-secondary-fixed cursor-pointer h-2 bg-white/20 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-white/60">
                  <span>250 €/mois</span>
                  <span className="text-secondary-fixed font-bold">300 €/mois {ui.simulatorRecommended}</span>
                  <span>600 €/mois</span>
                </div>
              </div>

              {/* Table of precalculated official options */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] text-white/70 block mb-2 font-mono">
                  {ui.simulatorGridLabel}
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/90">
                    <thead>
                      <tr className="border-b border-white/15 text-[10px] uppercase font-mono text-secondary-fixed">
                        <th className="pb-1.5">{ui.simulatorColDeposit}</th>
                        <th className="pb-1.5">{ui.simulatorColRemaining}</th>
                        <th className="pb-1.5">{ui.simulatorColMonthly}</th>
                        <th className="pb-1.5">{ui.simulatorColDuration}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs font-mono">
                      {(settings.content?.paymentTiers ?? PAYMENT_SCHEDULE_TIERS).map((tier, idx) => (
                        <tr
                          key={idx}
                          onClick={() => setSimulatorDeposit(tier.deposit)}
                          className={`hover:bg-white/5 cursor-pointer transition-colors ${
                            simulatorDeposit === tier.deposit ? 'bg-white/10 font-bold text-secondary-fixed' : ''
                          }`}
                        >
                          <td className="py-1.5">{tier.deposit.toLocaleString()} €</td>
                          <td className="py-1.5">{tier.remaining.toLocaleString()} €</td>
                          <td className="py-1.5">{tier.monthly} €</td>
                          <td className="py-1.5 font-bold">{tier.duration} {ui.simulatorMonths}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Calculation Result Card */}
            <div className="lg:col-span-5 bg-white text-primary rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">
                  {ui.simulatorResultTag}
                </span>
                <h4 className="font-serif text-2xl font-bold text-primary mt-1">
                  {ui.simulatorResultTitle}
                </h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {ui.simulatorResultSubtitle}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-on-surface-variant">{ui.simulatorRefPrice}</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {settings.basePrice.toLocaleString()} €
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-on-surface-variant">{ui.simulatorYourDeposit}</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">
                    {simulatorDeposit.toLocaleString()} €
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                  <span className="text-on-surface-variant">{ui.simulatorRemaining}</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {calculatedRemaining.toLocaleString()} €
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 bg-surface-container-low px-3 rounded-lg">
                  <span className="font-bold text-primary">{ui.simulatorMonthlyRow}</span>
                  <span className="font-mono font-bold text-base text-secondary">
                    {simulatorMonthly} € / mois
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 bg-secondary/10 px-3 rounded-lg text-secondary">
                  <span className="font-bold">{ui.simulatorDurationRow}</span>
                  <span className="font-mono font-bold text-base">
                    {calculatedDuration} mois
                  </span>
                </div>
              </div>

              {/* Cash payment alternative pill */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <span className="font-bold block">{ui.simulatorCashTitle}</span>
                <p
                  className="text-[11px] text-amber-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: ui.simulatorCashDesc
                      .replace('{cash}', `<strong>${settings.cashPrice.toLocaleString()} €</strong>`)
                      .replace('{full}', `${settings.basePrice.toLocaleString()} €`)
                      .replace('{saving}', `${(settings.basePrice - settings.cashPrice).toLocaleString()} €`),
                  }}
                />
              </div>

              {/* Action Button: WhatsApp Study */}
              <button
                onClick={openWhatsAppSimulator}
                className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{t.masterPlan.calculator.btnStudy}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PACKS COMPLÉMENTAIRES (TERRAIN, CLÔTURE, GROS ŒUVRE, MAISON) */}
      <section id="packs-section" className="py-20 bg-surface px-4 md:px-12 scroll-mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-mono font-bold text-xs uppercase text-secondary tracking-widest block">
              {t.packs.sectionTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              {t.packs.title}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
              {t.packs.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(settings.content?.packs ?? COMPLEMENTARY_PACKS).map((pack) => (
              <div
                key={pack.id}
                className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between hover:shadow-lg ${
                  pack.badge
                    ? 'border-2 border-secondary shadow-md ring-1 ring-secondary/30'
                    : 'border-gray-300 shadow-xs hover:border-gray-400'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="font-serif font-bold text-base text-primary">
                      {pack.title[currentLanguage]}
                    </span>
                    {pack.badge && (
                      <span className="text-[10px] font-mono font-bold bg-secondary/15 text-secondary px-2 py-0.5 rounded-full">
                        {pack.badge[currentLanguage]}
                      </span>
                    )}
                  </div>

                  <p className="font-mono text-xs text-secondary font-semibold">
                    {pack.subtitle[currentLanguage]}
                  </p>

                  <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                    {pack.description[currentLanguage]}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <span className="text-[10px] font-mono uppercase font-bold text-outline">
                      {ui.packsIncludedLabel}
                    </span>
                    <ul className="space-y-1.5 text-xs text-on-surface">
                      {pack.features[currentLanguage].map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-[11px] leading-snug">
                          <Check className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const msg = `${ui.packsWaPrefix}${pack.title[currentLanguage]}${ui.packsWaSuffix}`;
                      const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(msg)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{ui.packsLearnMore}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: FINANCEMENT BANCAIRE */}
      <section className="py-16 bg-surface-container-low px-4 md:px-12 border-t border-b border-gray-200">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-gray-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-primary font-bold text-sm">
              <Landmark className="w-5 h-5 text-secondary" />
              <span>{t.banking.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
              {t.banking.desc}
            </p>
            <p className="text-[11px] text-outline italic">
              ⚠️ {t.banking.disclaimer}
            </p>
          </div>
          <button
            onClick={() => openWhatsApp(ui.bankWaMsg)}
            className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            {t.banking.btn}
          </button>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS & RETOUR D'EXPÉRIENCE DIASPORA */}
      <section className="py-20 bg-white px-4 md:px-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="font-mono font-bold text-xs uppercase text-secondary tracking-widest block">
              {ui.testimonialsTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              {ui.testimonialsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-outline font-light">
              {ui.testimonialsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(settings.content?.testimonials ?? TESTIMONIALS).map((test) => (
              <div
                key={test.id}
                className="bg-white p-6 rounded-2xl border border-gray-300 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md hover:border-gray-400 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-xs sm:text-sm text-primary/90 italic leading-relaxed font-light">
                    "{test.quote[currentLanguage]}"
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
                  <img
                    src={test.avatar}
                    alt={`${test.name} — ${test.role[currentLanguage]}`}
                    className="w-10 h-10 rounded-full object-cover border border-secondary/30"
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-primary">
                      {test.name}
                    </h4>
                    <p className="text-[11px] text-secondary font-medium">
                      {test.role[currentLanguage]}
                    </p>
                    <span className="text-[10px] text-outline font-mono">
                      {test.relationship[currentLanguage]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: ARTICLES & GUIDES ACHAT SÉNÉGAL */}
      <section id="insights" className="py-20 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-secondary block">
              {ui.insightsTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              {ui.insightsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-outline font-light">
              {ui.insightsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(settings.content?.blogArticles ?? BLOG_ARTICLES).map((article) => (
              <div
                key={article.id}
                onClick={() => onSelectArticle?.(article)}
                className="bg-white border border-gray-300 rounded-2xl overflow-hidden hover:border-secondary transition-all cursor-pointer flex flex-col hover:shadow-lg shadow-xs group"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={`${article.title[currentLanguage]} — ${ui.insightsTag}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={300}
                  />
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded">
                    {article.category[currentLanguage]}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-outline">{article.date} • {article.readTime}</span>
                    <h4 className="font-serif text-base font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                      {article.title[currentLanguage]}
                    </h4>
                    <p className="text-xs text-on-surface-variant font-light line-clamp-3 leading-relaxed">
                      {article.summary[currentLanguage]}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-secondary">
                    <span>{ui.insightsReadGuide}</span>
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ JURIDIQUE & PRATIQUE */}
      <section id="faqs-section" className="py-20 bg-surface px-4 md:px-12 border-t border-gray-200 scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-secondary block">
              {ui.faqTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
              {ui.faqTitle}
            </h2>
            <p className="text-xs sm:text-sm text-outline font-light">
              {ui.faqDesc}
            </p>
          </div>

          <div className="space-y-3">
            {(settings.content?.faq ?? FAQ_ITEMS).map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-300 rounded-xl p-5 hover:border-gray-400 transition-colors shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex justify-between items-start text-left cursor-pointer"
                  >
                    <h4 className="font-serif text-sm sm:text-base font-bold text-primary pr-4 leading-snug">
                      {faq.question[currentLanguage]}
                    </h4>
                    <div className="text-secondary shrink-0 p-1 rounded-full bg-surface-container-low">
                      <Plus className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light border-t border-gray-200 mt-3 text-justify">
                          {faq.answer[currentLanguage]}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 10: FORMULAIRE CONTACT & RÉCEPTION DOSSIER */}
      <section id="contact" className="bg-[#00261a] text-white py-20 px-4 md:px-12 relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Brief */}
          <div className="lg:col-span-5 space-y-6">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-secondary-fixed">
              {ui.contactAdvisorTag}
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
              {t.contact.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              {t.contact.desc}
            </p>

            <div className="space-y-4 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary-fixed">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-white/60 block">{t.contact.directLine}</span>
                  <span className="font-mono font-bold text-sm text-white">{settings.whatsappNumber}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-[11px] text-white/60 block">{t.contact.whatsapp}</span>
                  <a
                    href={`https://wa.me/${settings.whatsappCleanNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-mono font-bold text-sm text-secondary-fixed hover:underline py-1.5"
                  >
                    {ui.contactWhatsAppDirect}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary-fixed">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-white/60 block">{t.contact.emailUs}</span>
                  <a href={`mailto:${settings.contactEmail}`} className="inline-block font-mono text-xs text-white hover:underline py-1.5">{settings.contactEmail}</a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary-fixed">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-white/60 block">{ui.contactOfficeLabel}</span>
                  <span className="text-xs text-white font-medium">{settings.contactAddress || 'Dakar, Rufisque — Keury Kao'}</span>
                </div>
              </div>

              {onOpenBrochure && (
                <div className="pt-2">
                  <button
                    onClick={onOpenBrochure}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400/25 transition-all text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>{ui.contactBrochureBtn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-white text-primary rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20">
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-1">
              {ui.contactFormTitle}
            </h4>
            <p className="text-xs text-on-surface-variant mb-6 font-light">
              {ui.contactFormDesc}
            </p>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h5 className="font-serif font-bold text-base text-emerald-900">{t.contact.successTitle}</h5>
                <p className="text-xs text-emerald-800 leading-relaxed">{t.contact.successMessage}</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-3 text-xs font-bold text-emerald-700 underline"
                >
                  {ui.contactFormReset}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      {t.contact.formName} *
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={ui.contactFormPlaceholderName}
                      className="w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      {t.contact.formPhone} *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={ui.contactFormPlaceholderPhone}
                      className="w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      {t.contact.formEmail}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={ui.contactFormPlaceholderEmail}
                      className="w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary focus:ring-2 focus:ring-secondary focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      {t.contact.formInterest}
                    </label>
                    <select
                      id="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary bg-white focus:ring-2 focus:ring-secondary"
                    >
                      <option value="Paiement échelonné 3 000 € + 300 €/mois">
                        {ui.contactFormInterest1}
                      </option>
                      <option value="Paiement comptant à 13 500 €">
                        {ui.contactFormInterest2Short}
                      </option>
                      <option value="Pack Terrain + Clôture de sécurisation">
                        {ui.contactFormInterest3}
                      </option>
                      <option value="Pack Terrain + Début de construction">
                        {ui.contactFormInterest4}
                      </option>
                      <option value="Financement bancaire partenaire">
                        {ui.contactFormInterest5}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    {t.contact.formMessage}
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleInputChange}                      placeholder={ui.contactFormPlaceholderMessage}
                    className="w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary focus:ring-2 focus:ring-secondary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-4 bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-fixed font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{formLoading ? ui.contactFormSubmitLoading : t.contact.formSubmit}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
