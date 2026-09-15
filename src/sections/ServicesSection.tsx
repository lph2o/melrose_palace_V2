import { MessageCircle } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { SERVICES, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { openWhatsApp } from '../site/whatsapp';
import { SectionIcon } from './icons';
import { RichText } from '../components/RichText';

/**
 * « Nos différents services » — les métiers de l'agence, au-delà du seul
 * lotissement Dun Tni.
 *
 * Comme les packs et les témoignages, la **liste** n'est pas ici : elle vit dans
 * `settings.content.services` (Espace Gérant → onglet « Contenu du site »), pour
 * qu'une même activité ne se décrive pas différemment sur la page d'accueil et
 * dans les autres surfaces. Ce bloc ne porte que son en-tête, éditable dans
 * l'éditeur visuel (`/admin/editor`).
 */
export interface ServicesContent {
  sectionTag: string;
  title: string;
  description: string;
  inquiryCta: string;
}

export function defaultServicesContent(lang: Language, _settings: SiteSettings): ServicesContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    sectionTag: t.services.sectionTag,
    title: t.services.title,
    description: t.services.desc,
    inquiryCta: ui.servicesInquiryCta,
  };
}

export function ServicesSection({ content }: { content?: Partial<ServicesContent> }) {
  const { language, settings } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const base = defaultServicesContent(language, settings);
  const c: ServicesContent = { ...base, ...content };

  // Les 4 services restent pilotés par l'Espace Gérant → onglet Contenu.
  const services = settings.content?.services?.length ? settings.content.services : SERVICES;

  return (
    <section
      id="services"
      className="py-section bg-surface-container-low px-5 md:px-12 scroll-mt-20 border-b border-gray-200"
    >
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <article
              key={service.id}
              className="bg-white rounded-card p-6 border border-gray-300 shadow-elev-1 flex flex-col justify-between hover:shadow-elev-2 hover:border-gray-400 transition-all duration-400"
            >
              <div className="space-y-3">
                <span className="w-12 h-12 rounded-inner bg-primary/5 ring-1 ring-secondary/30 flex items-center justify-center">
                  <SectionIcon name={service.icon} className="w-6 h-6 text-secondary" />
                </span>
                <h3 className="font-serif text-base font-bold text-primary leading-snug">
                  {service.title[language]}
                </h3>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {service.description[language]}
                </p>
              </div>

              {/* Un CTA par carte : le message part déjà qualifié (nom du
                  service), le conseiller n'a pas à demander de quoi il s'agit. */}
              <div className="pt-6 mt-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    openWhatsApp(
                      settings,
                      `${ui.servicesWaPrefix}${service.title[language]}${ui.servicesWaSuffix}`
                    )
                  }
                  className="w-full min-h-[44px] py-2.5 px-3 rounded-inner border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{c.inquiryCta}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
