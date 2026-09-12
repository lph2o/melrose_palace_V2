import { Landmark } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { openWhatsApp } from '../site/whatsapp';
import { RichText } from '../components/RichText';

export interface BankingContent {
  title: string;
  description: string;
  disclaimer: string;
  cta: string;
}

export function defaultBankingContent(lang: Language, _settings: SiteSettings): BankingContent {
  const t = TRANSLATIONS[lang];
  return {
    title: t.banking.title,
    description: t.banking.desc,
    disclaimer: t.banking.disclaimer,
    cta: t.banking.btn,
  };
}

export function BankingSection({ content }: { content?: Partial<BankingContent> }) {
  const { language, settings } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const base = defaultBankingContent(language, settings);
  const c: BankingContent = { ...base, ...content };

  return (
    <section
      id="banking"
      className="py-section bg-surface-container-low px-5 md:px-12 border-t border-b border-gray-200 scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-card p-6 sm:p-8 border border-gray-300 shadow-elev-1 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-primary font-bold text-sm">
            <Landmark className="w-5 h-5 text-secondary" />
            <RichText as="span" html={c.title} />
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
            <RichText as="span" html={c.description} />
          </p>
          <p className="text-caption text-outline italic">⚠️ {c.disclaimer}</p>
        </div>
        <button
          onClick={() => openWhatsApp(settings, ui.bankWaMsg)}
          className="px-6 py-3 bg-primary text-white rounded-inner text-xs font-bold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-elev-1"
        >
          {c.cta}
        </button>
      </div>
    </section>
  );
}
