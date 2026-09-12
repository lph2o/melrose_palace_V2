import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Language, SiteSettings, UITranslations } from '../types';
import { FAQ_ITEMS, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { RichText } from '../components/RichText';

export interface FaqContent {
  sectionTag: string;
  title: string;
  description: string;
}

export function defaultFaqContent(lang: Language, _settings: SiteSettings): FaqContent {
  const ui = TRANSLATIONS[lang].ui as UITranslations;
  return {
    sectionTag: ui.faqTag,
    title: ui.faqTitle,
    description: ui.faqDesc,
  };
}

export function FaqSection({ content }: { content?: Partial<FaqContent> }) {
  const { language, settings, openFaqId, onClearOpenFaqId } = useSite();
  const base = defaultFaqContent(language, settings);
  const c: FaqContent = { ...base, ...content };

  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  // Question demandée depuis la recherche globale : on l'ouvre et on défile jusqu'à elle.
  useEffect(() => {
    if (!openFaqId) return;
    setActiveFaq(openFaqId);
    const timeout = setTimeout(() => {
      const el = document.getElementById('faqs-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    onClearOpenFaqId?.();
    return () => clearTimeout(timeout);
  }, [openFaqId, onClearOpenFaqId]);

  // Les questions restent pilotées par l'Espace Gérant → onglet Contenu.
  const items = settings.content?.faq ?? FAQ_ITEMS;

  const toggleFaq = (id: string) => setActiveFaq((prev) => (prev === id ? null : id));

  return (
    <section id="faqs-section" className="py-section bg-surface px-5 md:px-12 border-t border-gray-200 scroll-mt-20">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="font-mono text-micro font-bold uppercase tracking-widest text-secondary block">
            {c.sectionTag}
          </span>
          <h2 className="reveal font-serif text-h2 font-bold text-primary">
            <RichText as="span" html={c.title} />
          </h2>
          <p className="text-xs sm:text-sm text-outline font-light">
            <RichText as="span" html={c.description} />
          </p>
        </div>

        <div className="space-y-3">
          {items.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-gray-300 rounded-inner p-5 hover:border-gray-400 transition-colors shadow-elev-1"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full min-h-[44px] flex justify-between items-start text-left cursor-pointer"
                >
                  <h4 className="font-serif text-sm sm:text-base font-bold text-primary pr-4 leading-snug">
                    {faq.question[language]}
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
                        {faq.answer[language]}
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
  );
}
