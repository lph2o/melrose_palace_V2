import { Plus } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { BLOG_ARTICLES, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { RichText } from '../components/RichText';
import { formatEditorialDate } from '../lib/date';

export interface InsightsContent {
  sectionTag: string;
  title: string;
  description: string;
  readGuideCta: string;
}

export function defaultInsightsContent(lang: Language, _settings: SiteSettings): InsightsContent {
  const ui = TRANSLATIONS[lang].ui as UITranslations;
  return {
    sectionTag: ui.insightsTag,
    title: ui.insightsTitle,
    description: ui.insightsDesc,
    readGuideCta: ui.insightsReadGuide,
  };
}

export function InsightsSection({ content }: { content?: Partial<InsightsContent> }) {
  const { language, settings, onSelectArticle } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const base = defaultInsightsContent(language, settings);
  const c: InsightsContent = { ...base, ...content };

  // Les articles restent pilotés par l'Espace Gérant → onglet Contenu.
  const articles = settings.content?.blogArticles ?? BLOG_ARTICLES;

  return (
    <section id="insights" className="py-section px-5 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            /* La carte ouvre la modale de lecture : elle doit donc être un vrai
               déclencheur, joignable au clavier. Le `<div>` reste préférable à un
               `<button>` parce que son contenu est structuré (titre, résumé). */
            <div
              key={article.id}
              role={onSelectArticle ? 'button' : undefined}
              tabIndex={onSelectArticle ? 0 : undefined}
              aria-haspopup={onSelectArticle ? 'dialog' : undefined}
              aria-label={onSelectArticle ? article.title[language] : undefined}
              onClick={() => onSelectArticle?.(article)}
              onKeyDown={(event) => {
                if (!onSelectArticle) return;
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                onSelectArticle(article);
              }}
              className="bg-white border border-gray-300 rounded-card overflow-hidden hover:border-secondary transition-all cursor-pointer flex flex-col hover:shadow-elev-2 shadow-elev-1 group"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={article.image}
                  alt={`${article.title[language]} — ${ui.insightsTag}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={300}
                />
                <span className="absolute top-3 left-3 bg-primary text-white text-caption font-mono uppercase font-bold px-2.5 py-0.5 rounded-micro">
                  {article.category[language]}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-caption font-mono text-outline">
                    {formatEditorialDate(article.date, language)} • {article.readTime}
                  </span>
                  <h4 className="font-serif text-base font-bold text-primary group-hover:text-secondary transition-colors line-clamp-2">
                    {article.title[language]}
                  </h4>
                  <p className="text-xs text-on-surface-variant font-light line-clamp-3 leading-relaxed">
                    {article.summary[language]}
                  </p>
                </div>
                <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-secondary">
                  <span>{c.readGuideCta}</span>
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
