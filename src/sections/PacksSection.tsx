import { Check, ChevronRight } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { COMPLEMENTARY_PACKS, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { openWhatsApp } from '../site/whatsapp';
import { RichText } from '../components/RichText';

export interface PacksContent {
  sectionTag: string;
  title: string;
  description: string;
  includedLabel: string;
  learnMoreCta: string;
}

export function defaultPacksContent(lang: Language, _settings: SiteSettings): PacksContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    sectionTag: t.packs.sectionTag,
    title: t.packs.title,
    description: t.packs.desc,
    includedLabel: ui.packsIncludedLabel,
    learnMoreCta: ui.packsLearnMore,
  };
}

export function PacksSection({ content }: { content?: Partial<PacksContent> }) {
  const { language, settings } = useSite();
  const t = TRANSLATIONS[language];
  const ui = t.ui as UITranslations;
  const base = defaultPacksContent(language, settings);
  const c: PacksContent = { ...base, ...content };

  // Les 4 packs restent pilotés par l'Espace Gérant → onglet Contenu.
  const packs = settings.content?.packs ?? COMPLEMENTARY_PACKS;

  return (
    <section id="packs-section" className="py-section bg-surface px-5 md:px-12 scroll-mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-mono font-bold text-micro uppercase text-secondary tracking-widest block">
            {c.sectionTag}
          </span>
          <h2 className="reveal font-serif text-h2 font-bold text-primary">
            <RichText as="span" html={c.title} />
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
            <RichText as="span" html={c.description} />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`bg-white rounded-card p-6 border transition-all duration-400 flex flex-col justify-between hover:shadow-elev-2 ${
                pack.badge
                  ? 'border-2 border-secondary shadow-elev-2 ring-1 ring-secondary/30'
                  : 'border-gray-300 shadow-elev-1 hover:border-gray-400'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="font-serif font-bold text-base text-primary">{pack.title[language]}</span>
                  {pack.badge && (
                    <span className="text-caption font-mono font-bold bg-secondary/15 text-secondary px-2 py-0.5 rounded-full">
                      {pack.badge[language]}
                    </span>
                  )}
                </div>

                <p className="font-mono text-xs text-secondary font-semibold">{pack.subtitle[language]}</p>

                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {pack.description[language]}
                </p>

                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <span className="text-caption font-mono uppercase font-bold text-outline">{c.includedLabel}</span>
                  <ul className="space-y-1.5 text-xs text-on-surface">
                    {pack.features[language].map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-caption leading-snug">
                        <Check className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-200">
                <button
                  onClick={() => openWhatsApp(settings, `${ui.packsWaPrefix}${pack.title[language]}${ui.packsWaSuffix}`)}
                  className="w-full min-h-[44px] py-2.5 px-3 rounded-inner border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary font-bold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <span>{c.learnMoreCta}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
