import { Star } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { TESTIMONIALS, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { RichText } from '../components/RichText';

export interface TestimonialsContent {
  sectionTag: string;
  title: string;
  description: string;
}

export function defaultTestimonialsContent(lang: Language, _settings: SiteSettings): TestimonialsContent {
  const ui = TRANSLATIONS[lang].ui as UITranslations;
  return {
    sectionTag: ui.testimonialsTag,
    title: ui.testimonialsTitle,
    description: ui.testimonialsDesc,
  };
}

export function TestimonialsSection({ content }: { content?: Partial<TestimonialsContent> }) {
  const { language, settings } = useSite();
  const base = defaultTestimonialsContent(language, settings);
  const c: TestimonialsContent = { ...base, ...content };

  // Les témoignages restent pilotés par l'Espace Gérant → onglet Contenu.
  const testimonials = settings.content?.testimonials ?? TESTIMONIALS;

  return (
    <section id="testimonials" className="py-20 bg-white px-4 md:px-12 border-b border-gray-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="font-mono font-bold text-xs uppercase text-secondary tracking-widest block">
            {c.sectionTag}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
            <RichText as="span" html={c.title} />
          </h2>
          <p className="text-xs sm:text-sm text-outline font-light">
            <RichText as="span" html={c.description} />
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test) => (
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
                  "{test.quote[language]}"
                </blockquote>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center space-x-3">
                <img
                  src={test.avatar}
                  alt={`${test.name} — ${test.role[language]}`}
                  className="w-10 h-10 rounded-full object-cover border border-secondary/30"
                  loading="lazy"
                  decoding="async"
                  width={40}
                  height={40}
                />
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-primary">{test.name}</h4>
                  <p className="text-[11px] text-secondary font-medium">{test.role[language]}</p>
                  <span className="text-[10px] text-outline font-mono">{test.relationship[language]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
