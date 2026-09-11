import { Check, Sparkles, Calculator, ChevronRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, SiteSettings, UITranslations } from '../types';
import { SITE_MEDIA_BASE_URL, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { RichText } from '../components/RichText';

/** Fallback image si `settings.heroImage` n'est pas renseigné dans l'Espace Gérant. */
export const HERO_IMAGE_FALLBACK = `${SITE_MEDIA_BASE_URL}/images/hero.jpg`;

export interface HeroStat {
  /** Chiffre affiché en gros dans la pastille (ex. « 20 »). */
  value: string;
  /** Unité sous le chiffre (ex. « lots »). */
  unit: string;
  title: string;
  subtitle: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  titleHighlight: string;
  subMessage: string;
  description: string;
  /** Les 3 puces de réassurance sont des champs fixes (pas une liste libre). */
  bullet1: string;
  bullet2: string;
  bullet3: string;
  exploreCta: string;
  simulateCta: string;
  brochureCta: string;
  image: string;
  /** Texte alternatif de l'image de fond (accessibilité). */
  imageAlt: string;
  /** Couleur d'accent (hex, ex. `#FED65B`). Vide = accent doré par défaut. */
  accentColor: string;
  stats: HeroStat[];
}

/** Contenu de référence du Hero (repris de TRANSLATIONS + réglages du site). */
export function defaultHeroContent(lang: Language, settings: SiteSettings): HeroContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    badge: t.hero.badge,
    title: t.hero.title,
    titleHighlight: t.hero.titleSpan,
    subMessage: t.subMessage,
    description: t.hero.desc,
    bullet1: t.hero.bullet1,
    bullet2: t.hero.bullet2,
    bullet3: t.hero.bullet3,
    exploreCta: t.hero.explore,
    simulateCta: t.hero.simulate,
    brochureCta: ui.heroBrochureBtn,
    image: settings.heroImage || HERO_IMAGE_FALLBACK,
    imageAlt: ui.heroImgAlt,
    accentColor: '',
    stats: [
      {
        value: '20',
        unit: ui.heroStatLots,
        title: t.hero.statsAvailable,
        subtitle: t.hero.statsAvailableVal,
      },
      {
        value: '150',
        unit: ui.heroStatSqm,
        title: lang === 'FR' ? 'Superficie de Référence' : 'Standard Plot Size',
        subtitle: ui.heroStatSizeVal,
      },
      {
        value: '300€',
        unit: ui.heroStatPerMonth,
        title: lang === 'FR' ? 'Paiement Échelonné' : 'Flexible Payment Plan',
        subtitle: ui.heroStatPayVal,
      },
    ],
  };
}

export function HeroSection({ content }: { content?: Partial<HeroContent> }) {
  const { language, settings, setActiveTab, scrollToSection, onOpenBrochure } = useSite();
  const t = TRANSLATIONS[language];
  const ui = t.ui as UITranslations;
  const base = defaultHeroContent(language, settings);
  const c: HeroContent = {
    ...base,
    ...content,
    stats: content?.stats?.length ? content.stats : base.stats,
  };
  const bullets = [c.bullet1, c.bullet2, c.bullet3].filter(Boolean);
  // Couleur d'accent optionnelle : surcharge l'accent doré des classes Tailwind.
  const accent = c.accentColor ? { color: c.accentColor } : undefined;

  return (
    <section
      id="hero"
      className={`relative min-h-[92vh] flex items-center justify-center overflow-x-clip ${
        settings.promoActive ? 'pt-12 sm:pt-16' : 'pt-20 sm:pt-24'
      } pb-16`}
    >
      {/* Background Visual */}
      <div className="absolute inset-0 z-0 bg-[#001c13]">
        <img
          src={c.image || HERO_IMAGE_FALLBACK}
          alt={c.imageAlt}
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
          <div
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-secondary-fixed/40 shadow-sm text-secondary-fixed text-xs font-bold tracking-widest uppercase"
            style={accent}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{c.badge}</span>
          </div>

          {/* Central Main Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            <RichText as="span" html={c.title} />
            <RichText
              as="span"
              className="text-secondary-fixed block sm:inline underline decoration-secondary-fixed/40 underline-offset-8"
              style={accent}
              html={c.titleHighlight}
            />
          </h1>

          {/* Sub Message / Key Selling Point */}
          <p className="font-serif text-lg sm:text-2xl text-amber-200/90 font-medium max-w-3xl mx-auto">
            « <RichText as="span" html={c.subMessage} /> »
          </p>

          <p className="font-sans text-sm sm:text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
            <RichText as="span" html={c.description} />
          </p>

          {/* Value Highlights Chips */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pt-2 text-xs text-white/90">
            {bullets.map((bullet, idx) => (
              <span
                key={idx}
                className="inline-flex items-center bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10"
              >
                <Check className="w-3.5 h-3.5 text-secondary-fixed mr-1.5 shrink-0" style={accent} />
                <RichText as="span" html={bullet} />
              </span>
            ))}
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
              <span>{c.exploreCta}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToSection('simulator-section')}
              className="w-full sm:w-auto border-2 border-secondary-fixed/60 text-secondary-fixed bg-white/5 hover:bg-secondary-fixed hover:text-primary px-7 py-4 rounded-xl font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{c.simulateCta}</span>
            </button>

            {onOpenBrochure && (
              <button
                onClick={onOpenBrochure}
                className="w-full sm:w-auto bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 px-6 py-4 rounded-xl font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>{c.brochureCta}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Floating Quick Metric Badges */}
      <div className="absolute bottom-6 left-4 right-4 md:left-12 md:right-12 z-20 hidden lg:flex items-center gap-4 max-w-7xl mx-auto pointer-events-none">
        {c.stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#002217]/95 backdrop-blur-md border-2 border-secondary-fixed/50 p-4 rounded-xl flex items-center space-x-3.5 shadow-2xl pointer-events-auto flex-1 hover:border-secondary-fixed transition-all"
          >
            <div className="w-12 h-12 bg-secondary-fixed text-primary rounded-xl flex flex-col items-center justify-center font-mono font-bold shadow-md shrink-0">
              <span className="text-base font-bold leading-none">{stat.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-tight text-primary/80">
                {stat.unit}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-bold text-secondary-fixed uppercase tracking-wider mb-0.5">
                {stat.title}
              </p>
              <p className="font-serif text-sm font-bold text-white tracking-tight leading-snug">
                {stat.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
