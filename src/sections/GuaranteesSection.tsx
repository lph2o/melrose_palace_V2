import { CheckCircle, ShieldCheck } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { openWhatsApp } from '../site/whatsapp';
import { RichText } from '../components/RichText';

export interface GuaranteePoint {
  title: string;
  desc: string;
}

export interface GuaranteesContent {
  sectionTag: string;
  title: string;
  description: string;
  points: GuaranteePoint[];
  commitmentTitle: string;
  commitmentDesc: string;
  verifyCta: string;
  /** Couleur d'accent des icônes/validations (hex). Vide = accent doré par défaut. */
  accentColor: string;
}

export function defaultGuaranteesContent(lang: Language, _settings: SiteSettings): GuaranteesContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    sectionTag: t.guarantees.sectionTag,
    title: t.guarantees.title,
    description: t.guarantees.desc,
    points: t.guarantees.points,
    commitmentTitle: ui.guaranteesCommitment,
    commitmentDesc: ui.guaranteesCommitmentDesc,
    verifyCta: ui.guaranteesVerifyDocs,
    accentColor: '',
  };
}

export function GuaranteesSection({ content }: { content?: Partial<GuaranteesContent> }) {
  const { language, settings } = useSite();
  const t = TRANSLATIONS[language];
  const ui = t.ui as UITranslations;
  const base = defaultGuaranteesContent(language, settings);
  const c: GuaranteesContent = {
    ...base,
    ...content,
    points: content?.points?.length ? content.points : base.points,
  };
  const accent = c.accentColor ? { color: c.accentColor } : undefined;

  return (
    <section
      id="guarantees"
      className="bg-[#00261a] text-white py-12 px-4 md:px-12 border-t border-b border-white/10 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-secondary-fixed block" style={accent}>
            {c.sectionTag}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            <RichText as="span" html={c.title} />
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
            <RichText as="span" html={c.description} />
          </p>
        </div>

        {/* Very visible guarantee badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {c.points.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/25 rounded-xl p-5 hover:bg-white/10 hover:border-white/40 transition-colors space-y-2"
            >
              <div className="flex items-center space-x-2.5 text-secondary-fixed" style={accent}>
                <CheckCircle className="w-5 h-5 shrink-0" />
                <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                  <RichText as="span" html={item.title} />
                </h4>
              </div>
              <p className="text-xs text-white/75 leading-relaxed font-light pl-7">
                <RichText as="span" html={item.desc} />
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
                <RichText as="span" html={c.commitmentTitle} />
              </p>
              <p className="text-xs text-white/80 font-light">
                <RichText as="span" html={c.commitmentDesc} />
              </p>
            </div>
          </div>
          <button
            onClick={() => openWhatsApp(settings, ui.dossierWaMsg)}
            className="bg-amber-400 hover:bg-amber-300 text-primary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-md"
          >
            {c.verifyCta}
          </button>
        </div>
      </div>
    </section>
  );
}
