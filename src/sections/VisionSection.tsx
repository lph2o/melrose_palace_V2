import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { SITE_MEDIA_BASE_URL, TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { SectionIcon } from './icons';
import { RichText } from '../components/RichText';
import { CADASTRAL_BORNES, CADASTRAL_ROAD_NETWORK, CADASTRAL_PARCELS_GEO } from '../cadastreGeometry';

export const AERIAL_IMAGE_FALLBACK = `${SITE_MEDIA_BASE_URL}/images/54_parcelles.png`;

export interface VisionPillar {
  /** Nom d'une icône du registre `SECTION_ICONS`. */
  icon: string;
  title: string;
  desc: string;
}

export interface VisionContent {
  sectionTag: string;
  title: string;
  description: string;
  image: string;
  pillars: VisionPillar[];
  /** Textes de la carte : badge de mode, toggle drone/plan, bandeau certifié. */
  overlayBadge: string;
  planBadge: string;
  viewDroneLabel: string;
  viewPlanLabel: string;
  certifiedBadge: string;
  domainName: string;
  dashedLegend: string;
  explorePlanCta: string;
  imageAlt: string;
}

export function defaultVisionContent(lang: Language, settings: SiteSettings): VisionContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    sectionTag: t.vision.sectionTag,
    title: t.vision.title,
    description: t.vision.desc,
    image: settings.aerialImage || AERIAL_IMAGE_FALLBACK,
    pillars: [
      { icon: 'ShieldCheck', title: t.vision.ownership, desc: t.vision.ownershipDesc },
      { icon: 'MapPin', title: t.vision.location, desc: t.vision.locationDesc },
      { icon: 'LineChart', title: t.vision.growth, desc: t.vision.growthDesc },
      { icon: 'Landmark', title: t.vision.value, desc: t.vision.valueDesc },
    ],
    overlayBadge: ui.visionOverlayBadge,
    planBadge: ui.visionPlanBadge,
    viewDroneLabel: ui.visionViewDrone,
    viewPlanLabel: ui.visionViewPlan,
    certifiedBadge: ui.visionCertifiedBadge,
    domainName: ui.visionDomainName,
    // `visionDashedLegend` est déjà décliné par langue dans TRANSLATIONS :
    // utiliser la variante `…En` affichait de l'anglais sur le site français.
    dashedLegend: ui.visionDashedLegend,
    explorePlanCta: ui.heroExplorePlan,
    imageAlt: ui.aerialImgAlt,
  };
}

export function VisionSection({ content }: { content?: Partial<VisionContent> }) {
  const { language, settings, setActiveTab } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const base = defaultVisionContent(language, settings);
  const c: VisionContent = {
    ...base,
    ...content,
    pillars: content?.pillars?.length ? content.pillars : base.pillars,
  };

  // Mode d'affichage : orthophoto drone ou plan cadastral 2D
  const [visionViewMode, setVisionViewMode] = useState<'overlay' | 'plan'>('overlay');

  return (
    <section id="vision" className="py-section px-5 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Visual Area - Photo Drone Orthophoto des 54 Parcelles & Plan */}
        <div className="lg:col-span-6 relative h-[440px] sm:h-[500px] md:h-[540px] rounded-card overflow-hidden shadow-elev-3 border border-gray-300 group bg-neutral-900">
          {/* View Mode 1: Authentic Drone Photo with 54 plots embedded on the ground */}
          {visionViewMode === 'overlay' ? (
            <img
              src={c.image || AERIAL_IMAGE_FALLBACK}
              alt={c.imageAlt}
              className="w-full h-full object-cover transition-transform duration-700 ease-spring group-hover:scale-[1.03]"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
          ) : (
            /* View Mode 2: Official 2D Surveyor Cadastral Plan */
            <div className="w-full h-full bg-[#EFECE6] relative flex items-center justify-center p-4">
              <svg
                viewBox="20 40 960 620"
                className="w-full h-full max-h-[460px] select-none filter drop-shadow-elev-2"
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
                  <text
                    x="0"
                    y="-22"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#FFFFFF"
                    stroke="#000000"
                    strokeWidth="2"
                    paintOrder="stroke"
                  >
                    N
                  </text>
                </g>
              </svg>
            </div>
          )}

          {/* Exactly ONE modern white location pin placed directly above parcel 54 */}
          <div className="absolute top-[16%] sm:top-[17%] left-[50%] -translate-x-1/2 -translate-y-full pointer-events-none z-20 flex flex-col items-center">
            <div className="relative flex flex-col items-center pointer-events-auto">
              <svg
                className="w-7 h-9 sm:w-8 sm:h-10 filter drop-shadow-elev-3"
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
              <div className="w-3.5 h-1 bg-black/50 rounded-full blur-[1px] mt-0.5" />
            </div>
          </div>

          {/* Top Switcher & Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-30 pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 bg-black/75 backdrop-blur-md text-secondary-fixed border border-amber-400/40 px-3 py-1.5 rounded-full text-caption font-semibold tracking-wide shadow-elev-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {visionViewMode === 'overlay' ? c.overlayBadge : c.planBadge}
            </span>

            <div className="flex items-center bg-black/75 backdrop-blur-md border border-white/20 p-1 rounded-inner space-x-1 text-caption font-bold text-white">
              <button
                onClick={() => setVisionViewMode('overlay')}
                className={`px-3 min-h-[44px] inline-flex items-center rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                  visionViewMode === 'overlay' ? 'bg-secondary-fixed text-primary' : 'hover:bg-white/10 text-white/85'
                }`}
              >
                {c.viewDroneLabel}
              </button>
              <button
                onClick={() => setVisionViewMode('plan')}
                className={`px-3 min-h-[44px] inline-flex items-center rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                  visionViewMode === 'plan' ? 'bg-secondary-fixed text-primary' : 'hover:bg-white/10 text-white/85'
                }`}
              >
                {c.viewPlanLabel}
              </button>
            </div>
          </div>

          {/* Bottom Info Bar with link to Masterplan */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <span className="bg-secondary-fixed text-primary px-2.5 py-0.5 rounded-micro text-micro font-bold uppercase font-mono tracking-wider shadow-elev-1">
                {c.certifiedBadge}
              </span>
              <h4 className="font-serif font-bold text-base sm:text-lg text-white">{c.domainName}</h4>
              <p className="text-caption text-white/90 font-light">{c.dashedLegend}</p>
            </div>

            <button
              onClick={() => {
                setActiveTab('masterplan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white/15 hover:bg-white/25 border border-white/40 text-white text-caption font-semibold px-4 min-h-[44px] rounded-full transition-all duration-400 ease-spring flex items-center space-x-1.5 cursor-pointer backdrop-blur-md shrink-0 shadow-elev-2"
            >
              <span>{c.explorePlanCta}</span>
              <ChevronRight className="w-3.5 h-3.5 text-secondary-fixed" />
            </button>
          </div>
        </div>

        {/* Right Rich Text Information */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="font-mono font-bold text-micro uppercase text-secondary tracking-widest block">
              {c.sectionTag}
            </span>
            <h2 className="reveal font-serif text-h2 font-bold text-primary leading-tight">
              <RichText as="span" html={c.title} />
            </h2>
          </div>

          <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed text-justify font-light">
            <RichText as="span" html={c.description} />
          </p>

          {/* Key 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {c.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 rounded-card bg-white border border-gray-300 shadow-elev-1 space-y-2 hover:border-gray-400 hover:shadow-elev-1 transition-all"
              >
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <SectionIcon name={pillar.icon} className="w-5 h-5 text-secondary" />
                  <h4 className="font-serif text-sm">
                    <RichText as="span" html={pillar.title} />
                  </h4>
                </div>
                <p className="text-xs text-on-surface-variant font-light leading-relaxed">
                  <RichText as="span" html={pillar.desc} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
