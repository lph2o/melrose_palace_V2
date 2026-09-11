import { Anchor, Building, ChevronRight, Plane, Train } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { CONNECTIVITY_ITEMS, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { openWhatsApp } from '../site/whatsapp';
import { RichText } from '../components/RichText';

export interface LocationContent {
  sectionTag: string;
  title: string;
  description: string;
  cardTag: string;
  regionPill: string;
  triangleTitle: string;
  /** Peut contenir des balises <strong> (rendu via dangerouslySetInnerHTML). */
  triangleDesc: string;
  distancesFootnote: string;
  requestPlanCta: string;
  /** Les 4 tuiles d'infrastructure (AIBD, TER, Diamniadio, Ndayane). */
  aibdTitle: string;
  aibdSub: string;
  terTitle: string;
  terSub: string;
  diamniadioTitle: string;
  diamniadioSub: string;
  ndayaneTitle: string;
  ndayaneSub: string;
}

export function defaultLocationContent(lang: Language, _settings: SiteSettings): LocationContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    sectionTag: t.location.sectionTag,
    title: t.location.title,
    description: t.location.desc,
    cardTag: ui.locationCardTag,
    regionPill: ui.locationRegionPill,
    triangleTitle: ui.locationTriangleTitle,
    triangleDesc: ui.locationTriangleDesc,
    distancesFootnote: ui.locationDistancesFootnote,
    requestPlanCta: ui.locationRequestPlan,
    aibdTitle: ui.locationAibd,
    aibdSub: ui.locationAibdSub,
    terTitle: ui.locationTer,
    terSub: ui.locationTerSub,
    diamniadioTitle: ui.locationDiamniadio,
    diamniadioSub: ui.locationDiamniadioSub,
    ndayaneTitle: ui.locationNdayane,
    ndayaneSub: ui.locationNdayaneSub,
  };
}

export function LocationSection({ content }: { content?: Partial<LocationContent> }) {
  const { language, settings } = useSite();
  const t = TRANSLATIONS[language];
  const ui = t.ui as UITranslations;
  const base = defaultLocationContent(language, settings);
  const c: LocationContent = { ...base, ...content };

  // Les 5 points de connectivité restent pilotés par l'Espace Gérant → onglet Contenu.
  const metrics = settings.content?.connectivity ?? CONNECTIVITY_ITEMS;

  return (
    <section id="location" className="py-20 bg-surface-container-low px-4 md:px-12 scroll-mt-20">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="font-mono font-bold text-xs uppercase text-secondary tracking-widest block">
            {c.sectionTag}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-primary">
            <RichText as="span" html={c.title} />
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed">
            <RichText as="span" html={c.description} />
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Visual Location Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-300 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="font-mono text-xs uppercase font-bold text-secondary">{c.cardTag}</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                  {c.regionPill}
                </span>
              </div>
              <h4 className="font-serif text-xl font-bold text-primary">{c.triangleTitle}</h4>
              <RichText
                as="p"
                className="text-xs sm:text-sm text-on-surface-variant font-light leading-relaxed text-justify"
                html={c.triangleDesc}
              />
            </div>

            {/* Infrastructure Connectivity List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                <Plane className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <RichText as="span" className="font-bold text-xs text-primary block" html={c.aibdTitle} />
                  <RichText as="span" className="text-[11px] text-outline" html={c.aibdSub} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                <Train className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <RichText as="span" className="font-bold text-xs text-primary block" html={c.terTitle} />
                  <RichText as="span" className="text-[11px] text-outline" html={c.terSub} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                <Building className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <RichText as="span" className="font-bold text-xs text-primary block" html={c.diamniadioTitle} />
                  <RichText as="span" className="text-[11px] text-outline" html={c.diamniadioSub} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-gray-200 flex items-start space-x-3">
                <Anchor className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <RichText as="span" className="font-bold text-xs text-primary block" html={c.ndayaneTitle} />
                  <RichText as="span" className="text-[11px] text-outline" html={c.ndayaneSub} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-[11px] text-outline font-mono">{c.distancesFootnote}</span>
              <button
                onClick={() => openWhatsApp(settings, ui.dossierWaMsg)}
                className="text-xs font-bold text-secondary hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>{c.requestPlanCta}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Quick Metrics Cards */}
          <div className="lg:col-span-5 flex flex-col space-y-4 justify-between">
            {metrics.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl shadow-xs border border-gray-300 border-l-4 border-l-secondary flex flex-col justify-between hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-serif font-bold text-sm sm:text-base text-primary">
                    {item.title[language]}
                  </span>
                  <span className="font-mono font-bold text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  {item.description[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
