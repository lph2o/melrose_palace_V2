export type Language = 'FR' | 'EN';

export interface UITranslations {
  heroExplorePlan: string;
  visionOverlayBadge: string;
  visionPlanBadge: string;
  visionViewDrone: string;
  visionViewPlan: string;
  visionCertifiedBadge: string;
  visionDomainName: string;
  visionDashedLegend: string;
  visionDashedLegendEn: string;
  guaranteesCommitment: string;
  guaranteesCommitmentDesc: string;
  guaranteesVerifyDocs: string;
  locationCardTag: string;
  locationRegionPill: string;
  locationTriangleTitle: string;
  locationTriangleDesc: string;
  locationAibd: string;
  locationAibdSub: string;
  locationTer: string;
  locationTerSub: string;
  locationDiamniadio: string;
  locationDiamniadioSub: string;
  locationNdayane: string;
  locationNdayaneSub: string;
  locationDistancesFootnote: string;
  locationRequestPlan: string;
  simulatorDepositLabel: string;
  simulatorDepositBase: string;
  simulatorDepositFlex: string;
  simulatorMonthlyLabel: string;
  simulatorPerMonth: string;
  simulatorRecommended: string;
  simulatorGridLabel: string;
  simulatorColDeposit: string;
  simulatorColRemaining: string;
  simulatorColMonthly: string;
  simulatorColDuration: string;
  simulatorMonths: string;
  simulatorResultTag: string;
  simulatorResultTitle: string;
  simulatorResultSubtitle: string;
  simulatorRefPrice: string;
  simulatorYourDeposit: string;
  simulatorRemaining: string;
  simulatorMonthlyRow: string;
  simulatorDurationRow: string;
  simulatorCashTitle: string;
  simulatorCashDesc: string;
  simulatorTransparencyTag: string;
  testimonialsTag: string;
  testimonialsTitle: string;
  testimonialsDesc: string;
  insightsTag: string;
  insightsTitle: string;
  insightsDesc: string;
  insightsReadGuide: string;
  faqTag: string;
  faqTitle: string;
  faqDesc: string;
  contactAdvisorTag: string;
  contactOfficeLabel: string;
  contactWhatsAppDirect: string;
  contactBrochureBtn: string;
  contactFormTitle: string;
  contactFormDesc: string;
  contactFormSubmitLoading: string;
  contactFormReset: string;
  /** Affiché quand la demande part bien sur WhatsApp mais n'a pas pu être enregistrée. */
  contactFormNotSavedTitle: string;
  contactFormNotSavedMessage: string;
  contactFormPlaceholderName: string;
  contactFormPlaceholderPhone: string;
  contactFormPlaceholderEmail: string;
  contactFormPlaceholderMessage: string;
  contactFormInterestPlaceholder: string;
  contactFormInterest1: string;
  contactFormInterest2: string;
  contactFormInterest2Short: string;
  contactFormInterest3: string;
  contactFormInterest4: string;
  contactFormInterest5: string;
  packsIncludedLabel: string;
  packsLearnMore: string;
  packsWaPrefix: string;
  packsWaSuffix: string;
  promoBadge: string;
  promoText: string;
  promoCta: string;
  heroStatLots: string;
  heroStatSqm: string;
  heroStatPerMonth: string;
  heroStatSizeLabel: string;
  heroStatSizeVal: string;
  heroStatPayLabel: string;
  heroStatPayVal: string;
  bankWaMsg: string;
  dossierWaMsg: string;
  simWaMsgPrefix: string;
  simWaMsgSuffix: string;
  contactWaMsg: string;
  heroBrochureBtn: string;
  navSearchTitle: string;
  navSearchAria: string;
  navLangTitle: string;
  navMobileSearchTitle: string;
  mobileSearchPlaceholder: string;
  mobileAvailableSuffix: string;
  guaranteesSuffix: string;
  simulatorSuffix: string;
  packsSuffix: string;
  mobileBrochureBtn: string;
  heroImgAlt: string;
  aerialImgAlt: string;
}

export interface ConnectivityItem {
  id: string;
  icon: string;
  time: string;
  /**
   * Temps/distance en anglais (« IMMEDIATE », « NEARBY »…). La plupart des
   * valeurs sont neutres (« 10 MIN », « ~4 KM ») et n'ont pas besoin d'être
   * traduites ; `timeEn` sert uniquement à celles qui sont des mots français.
   */
  timeEn?: string;
  title: {
    FR: string;
    EN: string;
  };
  description: {
    FR: string;
    EN: string;
  };
}

export interface AdvantageItem {
  id: string;
  icon: string;
  title: {
    FR: string;
    EN: string;
  };
  description: {
    FR: string;
    EN: string;
  };
}

export interface FAQItem {
  id: string;
  question: {
    FR: string;
    EN: string;
  };
  answer: {
    FR: string;
    EN: string;
  };
}

export interface Parcel {
  id: number;
  status: 'Available' | 'Reserved' | 'Sold';
  area: number;
  price: number;
  cashPrice: number;
  isPromo: boolean;
  zone?: 'green' | 'yellow' | 'red' | 'salmon';
  zoneName?: {
    FR: string;
    EN: string;
  };
  dimensions?: string;
  orientation: {
    FR: string;
    EN: string;
  };
  perks: {
    FR: string[];
    EN: string[];
  };
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface BlogArticle {
  id: string;
  title: {
    FR: string;
    EN: string;
  };
  summary: {
    FR: string;
    EN: string;
  };
  content: {
    FR: string;
    EN: string;
  };
  category: {
    FR: string;
    EN: string;
  };
  date: string;
  readTime: string;
  image: string;
}

export interface ComplementaryPack {
  id: string;
  title: {
    FR: string;
    EN: string;
  };
  subtitle: {
    FR: string;
    EN: string;
  };
  description: {
    FR: string;
    EN: string;
  };
  icon: string;
  badge?: {
    FR: string;
    EN: string;
  };
  features: {
    FR: string[];
    EN: string[];
  };
}

export interface SiteSettings {
  companyName: string;
  projectName?: string;
  basePrice: number; // 15000 €
  cashPrice: number; // 13500 €
  defaultDeposit: number; // 3000 €
  defaultMonthly: number; // 300 €
  defaultDurationMonths: number; // 40 mois
  whatsappNumber: string; // e.g. "+33 7 61 23 55 09"
  whatsappCleanNumber: string; // "33761235509"
  contactEmail: string;
  contactPhone: string;
  contactAddress?: string;
  promoActive: boolean;
  promoTitle: string;
  promoDesc: string;
  /**
   * Version anglaise du bandeau promo. Si elle est vide, le site retombe sur
   * les libellés i18n (`ui.promoBadge` / `ui.promoText`), jamais sur le texte
   * français : un visiteur anglophone ne doit jamais lire de français.
   */
  promoTitleEn?: string;
  promoDescEn?: string;
  promoPlotsRemaining: number;
  /** URL de la plaquette PDF (Supabase Storage ou chemin local /pdf/…). */
  brochureUrl?: string;
  /** Image hero (bannière principale) — éditable depuis l'Espace Gérant. */
  heroImage?: string;
  /** Vue aérienne de la section Vision — éditable depuis l'Espace Gérant. */
  aerialImage?: string;
  /** Contenu éditorial pilotable depuis l'Espace Gérant (onglet « Contenu du site »). */
  content?: SiteContent;
  /**
   * Sections de la page d'accueil masquées sur le site public (clés Puck :
   * `'Temoignages'`, `'Packs'`… — voir `SITE_SECTIONS` dans
   * `src/site/sectionsCatalog.ts`). Piloté depuis l'Espace Gérant → onglet
   * « Sections ».
   *
   * Masquer est **non destructif** : la composition Puck publiée et le contenu
   * des sections restent intacts, seul l'affichage est filtré. Une liste vide
   * (ou absente) affiche toutes les sections.
   */
  hiddenSections?: string[];
}


export interface Testimonial {
  id: number;
  name: string;
  role: { FR: string; EN: string };
  location: string;
  rating: number;
  quote: { FR: string; EN: string };
  avatar: string;
  duration: string;
  relationship: { FR: string; EN: string };
}

export interface VideoContent {
  src: string;
  poster: string;
  badgeLeft: { FR: string; EN: string };
  title: { FR: string; EN: string };
  desc: { FR: string; EN: string };
}

export interface PaymentTier {
  deposit: number;
  remaining: number;
  monthly: number;
  duration: number;
}

/** Contenu éditorial du site (FAQ, blog, packs, témoignages, vidéos…) — édité dans l'Espace Gérant. */
export interface SiteContent {
  paymentTiers: PaymentTier[];
  connectivity: ConnectivityItem[];
  packs: ComplementaryPack[];
  testimonials: Testimonial[];
  faq: FAQItem[];
  blogArticles: BlogArticle[];
  videos: VideoContent[];
}
