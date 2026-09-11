import { ConnectivityItem, AdvantageItem, FAQItem, Parcel, BlogArticle, ComplementaryPack, SiteSettings, Testimonial, VideoContent, SiteContent } from './types';

/** Racine des médias hébergés dans Supabase Storage (bucket « site-media »). */
export const SITE_MEDIA_BASE_URL =
  'https://ywvztcdgssbgeawkcphe.supabase.co/storage/v1/object/public/site-media';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  companyName: 'Sénégal Immobilier Consulting',
  projectName: 'Dun Tni • Sébikhotane',
  basePrice: 15000,
  cashPrice: 13500,
  defaultDeposit: 3000,
  defaultMonthly: 300,
  defaultDurationMonths: 40,
  whatsappNumber: '+33 7 61 23 55 09',
  whatsappCleanNumber: '33761235509',
  contactEmail: 'globalequalite@gmail.com',
  contactPhone: '+33 7 61 23 55 09',
  contactAddress: 'Dakar, Rufisque — Keury Kao',
  promoActive: true,
  promoTitle: 'Offre Lancement Diaspora : 10 Premières Parcelles',
  promoDesc: 'Avantage exclusif réservé aux 10 premiers acquéreurs (frais de dossier et bornage offerts + priorité d\'attribution).',
  promoPlotsRemaining: 10,
  brochureUrl: `${SITE_MEDIA_BASE_URL}/pdf/Dun-Tni-Brochure-Premium.pdf`,
  heroImage: `${SITE_MEDIA_BASE_URL}/images/hero.jpg`,
  aerialImage: `${SITE_MEDIA_BASE_URL}/images/54_parcelles.png`,
};

export const PAYMENT_SCHEDULE_TIERS = [
  { deposit: 3000, remaining: 12000, monthly: 300, duration: 40 },
  { deposit: 4000, remaining: 11000, monthly: 300, duration: 37 },
  { deposit: 5000, remaining: 10000, monthly: 300, duration: 34 },
  { deposit: 6000, remaining: 9000, monthly: 300, duration: 30 },
];

export const CONNECTIVITY_ITEMS: ConnectivityItem[] = [
  {
    id: 'aibd',
    icon: 'flight_takeoff',
    time: '< 20 MIN',
    title: {
      FR: 'Aéroport International Blaise Diagne (AIBD)',
      EN: 'Blaise Diagne International Airport (AIBD)',
    },
    description: {
      FR: 'À moins de 20 minutes de l\'AIBD, véritable porte d\'entrée aérienne de l\'Afrique de l\'Ouest.',
      EN: 'Under 20 minutes from AIBD, the primary international gateway of West Africa.',
    },
  },
  {
    id: 'diamniadio',
    icon: 'location_city',
    time: '10 MIN',
    title: {
      FR: 'Pôle Urbain de Diamniadio',
      EN: 'Diamniadio Urban Hub',
    },
    description: {
      FR: 'Situé stratégiquement entre le nouveau centre administratif du Sénégal et l\'aéroport.',
      EN: 'Strategically located between Senegal\'s administrative center and the airport.',
    },
  },
  {
    id: 'ter',
    icon: 'train',
    time: '~4 KM',
    title: {
      FR: 'Gare TER de Sébikhotane',
      EN: 'Sebikotane TER Train Station',
    },
    description: {
      FR: 'À environ 4 km de la gare du Train Express Régional (TER), garantissant une liaison rapide vers Dakar.',
      EN: 'Approximately 4 km from the TER train station, offering fast rapid transit to Dakar.',
    },
  },
  {
    id: 'autoroute',
    icon: 'directions_car',
    time: 'IMMÉDIAT',
    title: {
      FR: 'Autoroute à Péage Dakar-AIBD',
      EN: 'Dakar-AIBD Toll Highway',
    },
    description: {
      FR: 'Proximité directe des bretelles d\'accès à l\'autoroute à péage reliant la capitale et les régions.',
      EN: 'Direct immediate proximity to the highway connecting Dakar center and economic corridors.',
    },
  },
  {
    id: 'ndayane',
    icon: 'anchor',
    time: 'PROXIMITÉ',
    title: {
      FR: 'Futur Port en eau profonde de Ndayane',
      EN: 'Future Ndayane Deepwater Port',
    },
    description: {
      FR: 'Au cœur du triangle d\'or Diamniadio - AIBD - Ndayane, futur mégapôle logistique régional.',
      EN: 'In the golden triangle of Diamniadio - AIBD - Ndayane, the region\'s massive logistics hub.',
    },
  },
];

export const ADVANTAGES_ITEMS: AdvantageItem[] = [
  {
    id: 'strategic-location',
    icon: 'location_searching',
    title: {
      FR: 'Emplacement Stratégique',
      EN: 'Strategic Location',
    },
    description: {
      FR: 'Idéalement situé entre le pôle urbain de Diamniadio et l\'aéroport AIBD, au cœur des grands investissements.',
      EN: 'Ideally situated between Diamniadio urban pole and AIBD airport, at the heart of major public investments.',
    },
  },
  {
    id: 'ter-access',
    icon: 'train',
    title: {
      FR: 'Proche Future Gare TER (~4 km)',
      EN: 'Near Future TER Station (~4 km)',
    },
    description: {
      FR: 'À environ 4 km de la gare TER de Sébikhotane avec extension du réseau ferroviaire vers l\'intérieur.',
      EN: 'Around 4 km to Sebikotane TER station with planned national rail network extensions.',
    },
  },
  {
    id: 'high-appreciation',
    icon: 'insights',
    title: {
      FR: 'Fort Potentiel de Valorisation',
      EN: 'High Land Value Appreciation',
    },
    description: {
      FR: 'Acheter avant la pleine transformation du territoire permet de capter les plus fortes plus-values foncières.',
      EN: 'Investing before full infrastructure delivery captures optimal long-term land value appreciation.',
    },
  },
  {
    id: 'secure-titles',
    icon: 'gavel',
    title: {
      FR: 'Délibération + NICAD Direct',
      EN: 'Official Deliberation + NICAD',
    },
    description: {
      FR: 'Parcelles issues directement de notre société, avec NICAD, bornage certifié et sans intermédiaire.',
      EN: 'Plots owned directly by our company with individual NICAD, certified boundaries, and zero middlemen.',
    },
  },
  {
    id: 'accessible-payment',
    icon: 'payments',
    title: {
      FR: 'Paiement Accessible dès 300 €/mois',
      EN: 'Affordable Payment from €300/mo',
    },
    description: {
      FR: 'Devenez propriétaire avec 3 000 € d\'acompte puis seulement 300 €/mois pendant 40 mois.',
      EN: 'Become a landowner with a €3,000 down payment followed by €300/month for 40 months.',
    },
  },
  {
    id: 'turnkey-services',
    icon: 'build',
    title: {
      FR: 'Clôture & Construction sur Mesure',
      EN: 'Fencing & Custom Building',
    },
    description: {
      FR: 'Possibilité de sécuriser par une clôture, un portail et de lancer les travaux de gros œuvre à distance.',
      EN: 'Secure your land remotely with perimeter fencing, gate installation, and early structural work.',
    },
  },
];

export const COMPLEMENTARY_PACKS: ComplementaryPack[] = [
  {
    id: 'pack-terrain',
    title: {
      FR: 'Pack 1 : Terrain Seul',
      EN: 'Pack 1: Land Only',
    },
    subtitle: {
      FR: '150 m² viabilisé & borné',
      EN: '150 sqm surveyed & marked',
    },
    description: {
      FR: 'Votre parcelle de 150 m² avec délibération et attribution du NICAD. Bornage individuel certifié et accompagnement jusqu\'à la mutation.',
      EN: 'Your 150 sqm plot with official municipal deliberation and NICAD. Individual boundary survey and administrative title transfer support.',
    },
    icon: 'MapPin',
    badge: {
      FR: 'Offre Essentielle',
      EN: 'Core Offer',
    },
    features: {
      FR: [
        'Parcelle de 150 m² délimitée et bornée',
        'Délibération municipale + attribution NICAD',
        'Propriété directe garantie par Sénégal Immobilier Consulting',
        'Accompagnement administratif complet jusqu\'à la mutation (~2 mois)',
        'Option paiement échelonné : 3 000 € + 300 €/mois',
      ],
      EN: [
        '150 sqm plot with certified corner boundary stones',
        'Municipal Deliberation + individual NICAD registration',
        'Direct ownership guaranteed by Sénégal Immobilier Consulting',
        'Full administrative transfer assistance (~2 months delay)',
        'Installment plan available: €3,000 down + €300/month',
      ],
    },
  },
  {
    id: 'pack-cloture',
    title: {
      FR: 'Pack 2 : Terrain + Clôture',
      EN: 'Pack 2: Land + Security Fencing',
    },
    subtitle: {
      FR: 'Sécurisation immédiate de votre bien',
      EN: 'Immediate physical boundary security',
    },
    description: {
      FR: 'Idéal pour la diaspora souhaitant matérialiser physiquement sa propriété, prévenir toute occupation irrégulière et préparer le futur chantier.',
      EN: 'Ideal for overseas buyers to physically claim and secure their boundary, prevent informal intrusion, and prepare construction.',
    },
    icon: 'ShieldCheck',
    badge: {
      FR: 'Recommandé Diaspora',
      EN: 'Diaspora Recommended',
    },
    features: {
      FR: [
        'Tout le Pack 1 (Terrain 150 m² + Délibération + NICAD)',
        'Clôture maçonnée complète de la parcelle',
        'Pose d\'un portail métallique d\'accès sécurisé',
        'Panneau officiel d\'identification et de propriété',
        'Reportage photos / vidéos haute résolution régulier',
      ],
      EN: [
        'All Pack 1 features (150 sqm plot + Deliberation + NICAD)',
        'Full perimeter perimeter wall fencing',
        'Secure steel access gate installed',
        'Official property ownership identification sign',
        'Regular high-res photo/video drone tracking reports',
      ],
    },
  },
  {
    id: 'pack-gros-oeuvre',
    title: {
      FR: 'Pack 3 : Début de Construction',
      EN: 'Pack 3: Early Structural Works',
    },
    subtitle: {
      FR: 'Fondations et élévation du gros œuvre',
      EN: 'Foundations and concrete structural frame',
    },
    description: {
      FR: 'Passez du terrain au bâti en toute sérénité. Nous réalisons l\'implantation, les fouilles, les fondations et le gros œuvre de votre future villa.',
      EN: 'Transition from bare land to building with peace of mind. We handle layout surveying, earthworks, foundations, and reinforced concrete structure.',
    },
    icon: 'Hammer',
    features: {
      FR: [
        'Parcelle 150 m² + Clôture et accès sécurisé',
        'Étude de sol et plan de structure conforme',
        'Terrassement et fondations en béton armé',
        'Élévation des murs du rez-de-chaussée (gros œuvre)',
        'Supervision par un conducteur de travaux dédié avec rapports',
      ],
      EN: [
        '150 sqm plot + boundary fence and gate',
        'Geotechnical survey & structural civil engineering plans',
        'Excavation and reinforced concrete foundation slab',
        'Ground floor masonry brickwork & concrete structure',
        'Supervision by licensed project manager with photo updates',
      ],
    },
  },
  {
    id: 'pack-cle-en-main',
    title: {
      FR: 'Pack 4 : Projet Clé en Main',
      EN: 'Pack 4: Turnkey Villa Project',
    },
    subtitle: {
      FR: 'De la conception des plans à la remise des clés',
      EN: 'From architectural design to key handover',
    },
    description: {
      FR: 'Un accompagnement d\'excellence pour concevoir et bâtir la maison de vos rêves à Sébikhotane sans les contraintes de la distance.',
      EN: 'Complete turnkey architectural and building service to design and construct your dream home in Sebikotane from abroad.',
    },
    icon: 'Home',
    features: {
      FR: [
        'Accompagnement architectural sur-mesure (plans 2D/3D)',
        'Obtention de l\'autorisation de construire administrative',
        'Gros œuvre, second œuvre et finitions complètes de standing',
        'Raccordement aux réseaux d\'eau et d\'électricité',
        'Interlocuteur unique et remise solennelle des clés',
      ],
      EN: [
        'Custom architectural blueprints (2D/3D render concepts)',
        'Official municipal building permit acquisition',
        'Complete structure, interior MEP fit-out, and premium finishes',
        'Utility connections (water and electricity grid)',
        'Single point of contact and formal turnkey key delivery',
      ],
    },
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'deliberation-nicad',
    question: {
      FR: 'À quoi correspondent la délibération et le NICAD ?',
      EN: 'What do the municipal Deliberation and NICAD stand for?',
    },
    answer: {
      FR: 'La délibération est l\'acte administratif officiel par lequel le Conseil Municipal de la commune de Sébikhotane attribue et valide l\'affectation du terrain. Le NICAD (Numéro d\'Identification Cadastral) est le numéro unique attribué par le cadastre de l\'État du Sénégal pour identifier précisément votre parcelle dans le système foncier national. Ces deux éléments garantissent l\'existence légale, la traçabilité et la transparence absolue de votre terrain.',
      EN: 'The Deliberation is the official administrative municipal act by which the Municipal Council of Sebikotane attributes and legalizes the land allocation. The NICAD (National Cadastral Identification Number) is the unique number issued by the Senegalese state cadastre to identify your plot in the national land database. Both instruments guarantee clear legal existence, absolute traceability, and security.',
    },
  },
  {
    id: 'direct-ownership',
    question: {
      FR: 'Les parcelles appartiennent-elles directement à votre société ?',
      EN: 'Do the parcels belong directly to your company?',
    },
    answer: {
      FR: 'Oui, à 100 %. Les 54 parcelles du domaine font partie intégrante de notre propre patrimoine foncier. Sénégal Immobilier Consulting ne joue aucun rôle d\'intermédiaire et ne revend aucun terrain appartenant à des tiers. Cette propriété directe élimine tout risque de double vente ou de litige avec des propriétaires coutumiers.',
      EN: 'Yes, 100%. The 54 parcels in the development are directly owned by Sénégal Immobilier Consulting. We are not brokers and do not resell third-party lots. Direct company ownership eliminates risks of duplicate sales or customary disputes.',
    },
  },
  {
    id: 'mutation-process',
    question: {
      FR: 'Comment se déroule la mutation et dans quels délais ?',
      EN: 'How does the title transfer (mutation) work and what is the timeline?',
    },
    answer: {
      FR: 'Nous accompagnons personnellement chaque acquéreur dans toutes les démarches administratives jusqu\'à l\'obtention de la mutation à votre nom. Notre équipe prépare et dépose le dossier complet auprès des services compétents. Lorsque le dossier est complet et sous réserve des délais administratifs, la mutation peut être finalisée dans un délai allant jusqu\'à deux mois.',
      EN: 'We personally guide every buyer through administrative steps until the official transfer (mutation) into your name is granted. When the file is complete and subject to administrative processing times, mutation is typically finalized within up to two months.',
    },
  },
  {
    id: 'payment-modes',
    question: {
      FR: 'Quelles sont les modalités de paiement (échelonné vs comptant) ?',
      EN: 'What are the payment options (installments vs full cash)?',
    },
    answer: {
      FR: 'Nous proposons deux formules principales directes (sans banque obligatoire) : 1° Paiement échelonné avec 3 000 € d\'acompte puis seulement 300 €/mois pendant 40 mois (soit 15 000 € au total). Vous pouvez aussi verser un acompte plus élevé pour raccourcir la durée (ex. 5 000 € d\'acompte = 34 mois). 2° Paiement comptant : tarif préférentiel à 13 500 € (soit 1 500 € d\'économie immédiate).',
      EN: 'We provide two primary direct methods: 1° Flexible installments with €3,000 down payment then €300/month for 40 months (€15,000 total). Higher deposits reduce the term (e.g. €5,000 down = 34 months). 2° Cash payment: discount price at €13,500 (€1,500 immediate savings).',
    },
  },
  {
    id: 'bank-financing',
    question: {
      FR: 'Est-il possible de financer son terrain avec une banque ?',
      EN: 'Can I finance my land purchase through a bank?',
    },
    answer: {
      FR: 'Nous travaillons activement sur des solutions de partenariat avec des banques sénégalaises afin de permettre aux clients éligibles (notamment les salariés de la diaspora et résidents) de financer leur acquisition sur une durée plus longue. Important : financement bancaire possible selon profil et acceptation de l\'établissement partenaire.',
      EN: 'We are currently developing partnerships with Senegalese banks so eligible clients (diaspora employees and residents) can finance their land over longer durations. Note: bank financing remains subject to applicant profile and partner bank approval.',
    },
  },
  {
    id: 'diaspora-security',
    question: {
      FR: 'Je vis à l\'étranger (diaspora), comment sécuriser mon terrain à distance ?',
      EN: 'I live abroad in the diaspora; how do I secure my land remotely?',
    },
    answer: {
      FR: 'Toutes les démarches peuvent être effectuées à distance en toute sécurité : signature électronique ou procuration, consultation des pièces justificatives, suivi WhatsApp personnalisé avec votre conseiller dédié. Pour protéger physiquement votre terrain dès l\'achat, nous proposons également la réalisation immédiate d\'une clôture maçonnée avec portail et panneau de propriété.',
      EN: 'All steps can be executed securely from abroad: digital review, notary power of attorney, and dedicated 1-on-1 WhatsApp tracking. To physically safeguard your plot immediately, we offer optional masonry fencing, gate installation, and property signage.',
    },
  },
  {
    id: 'why-sebikotane-now',
    question: {
      FR: 'Pourquoi est-ce le moment idéal pour investir à Sébikhotane ?',
      EN: 'Why is now the optimal time to invest in Sebikotane?',
    },
    answer: {
      FR: 'L\'histoire montre que les plus fortes plus-values foncières sont réalisées avant l\'achèvement des grandes infrastructures. Sébikhotane se situe au centre des trois plus grands moteurs de croissance du Sénégal : Diamniadio, l\'AIBD et le futur Port de Ndayane. À 4 km de la gare TER, la commune bénéficie d\'une dynamique sans précédent.',
      EN: 'Historical data shows that peak real estate capital gains occur before infrastructure completion. Sebikotane sits directly between Diamniadio, AIBD airport, and the future Ndayane Port. At ~4 km from the TER train station, early investors capture exceptional upside.',
    },
  },
];

// 54 parcels of the official cadastral plan at Sébikhotane
// Tranche 1 comprises 20 parcels with initial commercialization.
// The first 10 parcels are marked with the special Promo status!
export const PARCELS: Parcel[] = Array.from({ length: 54 }, (_, i) => {
  const id = i + 1;
  const isPromo = id <= 10;
  
  // Assign authentic zone based on official surveyor plan
  let zone: 'green' | 'yellow' | 'red' | 'salmon' = 'green';
  let zoneName = { FR: 'Zone Ouest (Verte)', EN: 'West Zone (Green)' };

  if ((id >= 14 && id <= 31) || id === 54) {
    zone = 'yellow';
    zoneName = { FR: 'Zone Centrale (Jaune)', EN: 'Central Zone (Yellow)' };
  } else if (id >= 32 && id <= 46) {
    zone = 'red';
    zoneName = { FR: 'Zone Centre-Est (Rouge)', EN: 'Center-East Zone (Red)' };
  } else if (id >= 47 && id <= 52) {
    zone = 'salmon';
    zoneName = { FR: 'Zone Est (Saumon)', EN: 'East Zone (Salmon)' };
  }

  // Exact dimensions from cadastral blueprint
  let dimensions = '15.00 m × 10.00 m';
  let area = 150;

  if (id === 1) {
    dimensions = '12.00 m × 12.00 m';
  } else if (id === 2 || id === 3) {
    dimensions = '10.00 m × 12.00 m';
  } else if (id === 4) {
    dimensions = '10.00 m / 18.00 m × 12.00 m';
    area = 165;
  } else if (id === 11) {
    dimensions = '15.00 m × 8.00 / 12.00 m';
  } else if (id === 13) {
    dimensions = '15.00 m × 18.20 m';
    area = 175;
  } else if (id === 19) {
    dimensions = '15.00 m × 12.00 m';
    area = 180;
  } else if (id === 28) {
    dimensions = '15.00 m × 10.00 / 4.77 m';
  } else if (id === 30) {
    dimensions = '15.00 m × 7.00 / 9.00 m';
  } else if (id === 31) {
    dimensions = '9.00 m × 15.17 m';
  } else if (id === 32) {
    dimensions = '10.00 m × 15.00 m';
  } else if (id === 34) {
    dimensions = '15.00 m × 14.00 m';
    area = 160;
  } else if (id === 46) {
    dimensions = '21.00 m × 31.52 m';
    area = 210;
  } else if (id === 47 || id === 48) {
    dimensions = '9.00 m × 15.00 m';
    area = 135;
  } else if (id === 49) {
    dimensions = '12.00 m × 15.00 m';
    area = 180;
  } else if (id === 50) {
    dimensions = '15.00 m × 15.00 / 22.13 m';
    area = 225;
  } else if (id === 53) {
    dimensions = '14.32 m × 19.78 m';
    area = 160;
  } else if (id === 54) {
    dimensions = '30.00 m × 15.00 m (Façade Nord B1)';
    area = 215;
  }

  const orientations = [
    { FR: 'Façade Est sur voie centrale aménagée', EN: 'East Frontage on central avenue' },
    { FR: 'Façade Ouest sur voie principale', EN: 'West Frontage on main street' },
    { FR: 'Angle de rue avec double accès', EN: 'Corner plot with dual street access' },
    { FR: 'Orientation Nord dégagée sur voirie', EN: 'Clear North exposure on roadway' },
    { FR: 'Orientation Sud-Est ensoleillée', EN: 'Sunny South-East exposure' },
  ];
  const orientation = orientations[(id - 1) % orientations.length];

  const perksFR = [
    `Superficie cadastrale de ${area} m² (${dimensions})`,
    'Délibération municipale + attribution NICAD individuelle',
    'Bornage géométrique officiel de B1 à B17 par géomètre expert',
    'Accompagnement à la mutation sous ~2 mois garanti',
  ];

  const perksEN = [
    `Cadastral land area of ${area} sqm (${dimensions})`,
    'Municipal Deliberation + individual NICAD identification',
    'Official geometric boundary stones B1-B17 by licensed surveyor',
    'Full administrative transfer assistance within ~2 months',
  ];

  if (isPromo) {
    perksFR.unshift('🌟 Offre Promo 10 Premiers : Frais de bornage et dossier offerts');
    perksEN.unshift('🌟 Early Buyer Promo: Boundary stones & administrative filing included');
  }

  return {
    id,
    status: 'Available', // All available initially as confirmed by client
    area,
    price: 15000,
    cashPrice: 13500,
    isPromo,
    zone,
    zoneName,
    dimensions,
    orientation,
    perks: {
      FR: perksFR,
      EN: perksEN,
    },
  };
});

export const TRANSLATIONS = {
  FR: {
    appName: 'Sénégal Immobilier Consulting',
    tagline: 'Sénégal Immobilier Consulting',
    centralMessage: 'Votre terrain à Sébikhotane à partir de 300 €/mois.',
    subMessage: 'Devenez propriétaire avec 3 000 € d\'apport puis seulement 300 €/mois.',
    positioning: 'ACCESSIBLE – TRANSPARENT – SÉCURISÉ',
    bookVisit: 'Demander le dossier',
    contactWhatsapp: 'Échanger sur WhatsApp',
    adminAccess: 'Espace Gérant',
    nav: {
      vision: 'La Vision',
      location: 'Localisation',
      masterPlan: 'Les 20 Parcelles',
      advantages: 'Avantages',
      guarantees: 'Sécurisation',
      simulator: 'Simulateur',
      packs: 'Packs Services',
      faq: 'FAQ Juridique',
    },
    hero: {
      badge: 'PROJET IMMOBILIER SÉBIKHOTANE – SÉNÉGAL',
      title: 'VOTRE TERRAIN À SÉBIKHOTANE À PARTIR DE ',
      titleSpan: '300 € / MOIS',
      titleEnd: '',
      desc: 'Sénégal Immobilier Consulting vous offre l\'opportunité rare de devenir propriétaire d\'une parcelle de 150 m² avec Délibération et NICAD au cœur du nouveau poumon économique de Dakar.',
      bullet1: '3 000 € d\'apport + 300 €/mois pendant 40 mois (ou 13 500 € comptant)',
      bullet2: 'À moins de 20 min de l\'AIBD et ~4 km de la gare TER de Sébikhotane',
      bullet3: 'Propriété directe de notre société, bornage certifié & mutation accompagnée',
      explore: 'Voir les 20 Parcelles Disponibles',
      simulate: 'Simuler Mon Financement',
      statsAvailable: 'Disponibilité Immédiate',
      statsAvailableVal: '20 Parcelles',
      statsPromo: 'Offre Spéciale Lancement',
      statsPromoVal: 'Promo 10 Premiers',
      statsPrice: 'Prix de référence',
      statsPriceVal: '15 000 € (ou 13 500 €)',
    },
    vision: {
      sectionTag: '1. NOTRE VISION',
      title: 'Investir Aujourd\'hui dans le Sénégal de Demain',
      desc: 'Nous avons imaginé ce projet avec une ambition simple : offrir à chacun l\'opportunité d\'investir aujourd\'hui dans le Sénégal de demain. Situé au cœur d\'un territoire en pleine mutation, notre domaine de 54 parcelles s\'inscrit dans la dynamique de développement de la nouvelle région économique de Dakar. Que votre objectif soit de construire votre résidence principale, une maison de vacances ou de réaliser un investissement patrimonial, ce projet vous permet de devenir propriétaire dans une zone à très fort potentiel de valorisation. Notre vision est de créer un cadre de vie accessible, sécurisé et durable, où qualité de vie et rentabilité se rejoignent.',
      ownership: 'Propriété Directe Garantie',
      ownershipDesc: 'Les parcelles font partie de notre propre patrimoine. Aucun intermédiaire, aucune revente de tiers.',
      location: 'Position Pivot Stratégique',
      locationDesc: 'Entre le pôle urbain de Diamniadio et l\'AIBD, à proximité de l\'autoroute à péage et du TER.',
      growth: 'Forte Plus-Value Anticipée',
      growthDesc: 'Les plus fortes valorisations se réalisent avant l\'achèvement des grandes infrastructures.',
      value: 'Patrimoine Transmissible',
      valueDesc: 'Sécurisez votre épargne contre l\'inflation et construisez un actif tangible pour vos enfants.',
    },
    location: {
      sectionTag: '2. UNE LOCALISATION STRATÉGIQUE',
      title: 'Sébikhotane : Le Nouveau Hub Économique',
      desc: 'Le domaine est situé à Sébikhotane, l\'une des communes les plus prometteuses du Sénégal. Sa situation géographique est exceptionnelle : à moins de 20 minutes de l\'Aéroport International Blaise Diagne (AIBD), entre le pôle urbain de Diamniadio et l\'aéroport, à proximité immédiate de l\'autoroute à péage Dakar-AIBD, et desservie par la future gare du Train Express Régional (TER à environ 4 km).',
      interactiveView: 'Plan de Situation Régionale',
    },
    masterPlan: {
      sectionTag: '3. UN MASTER PLAN PENSÉ POUR L\'AVENIR',
      home: 'Accueil',
      title: 'Les 20 Parcelles en Commercialisation (Phase 1)',
      desc: 'Notre projet comprend 54 parcelles aménagées dans une logique d\'organisation, de confort et de valorisation à long terme. La Phase 1 ouvre aujourd\'hui 20 parcelles de 150 m² chacune. Toutes sont actuellement disponibles avec une offre spéciale pour les 10 premières réservations.',
      stats: {
        total: 'Tranche Active',
        available: 'Disponibles',
        reserved: 'Réservées',
        sold: 'Vendues (0 pour l\'instant)',
        banner: '10 Premiers Acquéreurs : Avantages Exclusifs',
      },
      gridTitle: 'Plan Numéroté des Parcelles',
      gridDesc: 'Cliquez sur une parcelle ci-dessous pour afficher sa fiche détaillée (150 m², statut, conditions de paiement et réservation directe via WhatsApp).',
      filter: 'Filtrer les Parcelles',
      filterAll: 'Toutes les 20 Parcelles',
      filterAvailable: 'Disponibles (20)',
      filterReserved: 'Réservées (0)',
      filterSold: 'Vendues (0)',
      modal: {
        identification: 'Fiche Technique de la Parcelle',
        valuation: 'Prix de Référence',
        area: 'Superficie',
        perksTitle: 'Points Forts & Garanties',
        downloadSpecs: 'Recevoir le Dossier Complet',
        whatsappSupport: 'Je suis intéressé via WhatsApp',
        downloadSuccess: 'Votre demande a été initiée ! Vous recevrez le dossier PDF par WhatsApp et email.',
      },
      calculator: {
        title: 'Simulateur de Financement Personnalisé',
        desc: 'Ajustez votre apport initial et visualisez instantanément votre plan de paiement échelonné direct avec nous.',
        labelDeposit: 'Votre Montant d\'Apport (Acompte)',
        labelMonthly: 'Mensualité Souhaitée',
        labelDuration: 'Durée Estimée',
        remaining: 'Reste à régler',
        btnStudy: 'Étudier Mon Financement sur WhatsApp',
      },
    },
    advantages: {
      sectionTag: '4. LES AVANTAGES DE L\'INVESTISSEMENT',
      title: 'Pourquoi Investir à Sébikhotane ?',
      subtitle: 'Faire le choix d\'un secteur d\'avenir au cœur des grands projets du Sénégal',
      whyNowTitle: 'Pourquoi Investir Maintenant ?',
      whyNowDesc: 'Le Sénégal s\'impose aujourd\'hui comme l\'une des économies les plus dynamiques d\'Afrique de l\'Ouest. Reconnu pour sa stabilité institutionnelle, sa sécurité juridique et son attractivité auprès des investisseurs internationaux, le pays poursuit une politique ambitieuse de modernisation de ses infrastructures et d\'aménagement du territoire. Investir aujourd\'hui à Sébikhotane, c\'est se positionner au cœur de cette transformation avant que les prix ne reflètent pleinement le développement de la zone.',
    },
    guarantees: {
      sectionTag: 'SÉCURISATION DE L\'ACHAT',
      title: 'Une Acquisition en Toute Confiance',
      desc: 'Ces dernières années, le marché foncier sénégalais a été marqué par certaines difficultés liées à des ventes irrégulières ou à des litiges portant sur la propriété de certains terrains. Nous comprenons que ces situations puissent susciter des interrogations légitimes chez les acquéreurs, particulièrement dans la diaspora. C\'est pourquoi nous avons fait de la transparence et de la sécurité juridique une priorité absolue.',
      badges: [
        'Propriété directe garantie (aucun intermédiaire)',
        '100 % transparent (documents consultables)',
        'Mutation accompagnée sous ~2 mois',
        'Remboursement intégral si nos engagements contractuels ne sont pas respectés',
        'Clôture et construction sur demande',
        'Bornage certifié de chaque parcelle de 150 m²',
      ],
      points: [
        {
          title: 'Propriété directe garantie',
          desc: 'Les 54 parcelles commercialisées appartiennent directement à notre société. Nous ne revendons pas des terrains appartenant à des tiers et nous ne jouons aucun rôle d\'intermédiaire.',
        },
        {
          title: 'Une transaction 100% transparente',
          desc: 'Toutes les informations relatives au terrain vous sont communiquées avant la vente. Délibération et NICAD vérifiables.',
        },
        {
          title: 'Accompagnement jusqu\'à la mutation',
          desc: 'Nous prenons en charge le suivi administratif de votre dossier. Lorsque le dossier est complet, la mutation est finalisée en moins de deux mois.',
        },
        {
          title: 'Bornage individuel certifié',
          desc: 'Chaque terrain est clairement identifié et délimité par des bornes physiques pour une visibilité totale de votre propriété.',
        },
        {
          title: 'Sécurisation physique & Clôture',
          desc: 'Possibilité de poser une clôture, un portail et d\'engager le gros œuvre pour matérialiser la propriété et prévenir toute occupation.',
        },
        {
          title: 'Interlocuteur unique dédié diaspora',
          desc: 'Un accompagnement personnalisé avec un seul interlocuteur du premier contact jusqu\'à la remise des clés ou du titre final.',
        },
      ],
    },
    banking: {
      title: 'Financer Mon Terrain avec une Banque',
      desc: 'Nous travaillons sur des solutions de partenariat avec des banques sénégalaises afin que les clients éligibles (salariés diaspora, entrepreneurs) puissent financer leur acquisition sur une durée plus longue.',
      disclaimer: 'Financement bancaire possible selon profil et acceptation de l\'établissement partenaire.',
      btn: 'Être notifié des offres bancaires',
    },
    packs: {
      sectionTag: 'PACKS COMPLÉMENTAIRES',
      title: 'Accompagnement Progressif de Votre Projet',
      desc: 'Achetez votre terrain de 150 m² aujourd\'hui et avancez à votre rythme dans la sécurisation et la construction avec notre équipe.',
    },
    contact: {
      title: 'Passez à l\'Action dès Aujourd\'hui',
      desc: 'Nos conseillers sont disponibles pour vous transmettre le dossier complet, vérifier la disponibilité des parcelles ou programmer un rendez-vous téléphonique ou WhatsApp.',
      emailUs: 'Nous Écrire',
      directLine: 'Téléphone',
      whatsapp: 'WhatsApp Conseiller',
      formName: 'Votre Nom & Prénom',
      formEmail: 'Adresse E-mail',
      formPhone: 'Numéro de Téléphone / WhatsApp',
      formInterest: 'Parcelle ou formule souhaitée',
      formMessage: 'Votre question ou projet...',
      formSubmit: 'Recevoir le Dossier Complet',
      successTitle: 'Demande Enregistrée !',
      successMessage: 'Votre demande a bien été transmise à Sénégal Immobilier Consulting. Un conseiller vous contactera dans les plus brefs délais.',
    },
    footerWord: 'Sénégal Immobilier Consulting - Spécialiste de l\'aménagement foncier sécurisé et de l\'investissement immobilier au Sénégal.',
    allRightsReserved: 'Tous droits réservés. Sénégal Immobilier Consulting.',
    ui: {
      heroExplorePlan: 'Explorer le Plan',
      visionOverlayBadge: 'Orthophoto Drone • 54 Parcelles',
      visionPlanBadge: 'Plan Cadastral 2D',
      visionViewDrone: 'Vue Drone',
      visionViewPlan: 'Plan 2D',
      visionCertifiedBadge: 'Plan Certifié 54 Lots • B1 à B17',
      visionDomainName: 'Sébikhotane • Domaine Dun Tni',
      visionDashedLegend: 'Délimitation certifiée en pointillés blancs • Parcelles viabilisées',
      visionDashedLegendEn: 'Certified white dashed boundaries • Serviced plots',
      guaranteesCommitment: 'Engagement Contractuel Ferme',
      guaranteesCommitmentDesc: 'Remboursement intégral si nos engagements contractuels ne sont pas respectés • Dossier vérifiable avant tout paiement.',
      guaranteesVerifyDocs: 'Vérifier les documents',
      locationCardTag: 'Positionnement Géographique',
      locationRegionPill: 'Sébikhotane • Région de Dakar',
      locationTriangleTitle: "Au Centre du Triangle d'Or : Diamniadio — AIBD — Port de Ndayane",
      locationTriangleDesc: 'Sébikhotane bénéficie d\'un emplacement charnière. Située à moins de 20 minutes de l\'Aéroport International Blaise Diagne et à proximité immédiate de l\'autoroute à péage, la commune est également desservie par la future gare du Train Express Régional (TER), située à <strong>environ 4 km de notre domaine</strong>.',
      locationAibd: 'Aéroport AIBD',
      locationAibdSub: 'À moins de 20 minutes en voiture',
      locationTer: 'Gare TER Sébikhotane',
      locationTerSub: "À environ 4 km de la gare",
      locationDiamniadio: 'Pôle Diamniadio',
      locationDiamniadioSub: "Nouveau centre administratif d'État",
      locationNdayane: 'Futur Port de Ndayane',
      locationNdayaneSub: 'Mégapôle logistique sous-régional',
      locationDistancesFootnote: 'Distances réelles et vérifiables',
      locationRequestPlan: 'Demander le plan de situation',
      simulatorDepositLabel: "1. Choisissez votre montant d'apport initial :",
      simulatorDepositBase: 'Apport de base',
      simulatorDepositFlex: 'Option flexible',
      simulatorMonthlyLabel: '2. Mensualité souhaitée :',
      simulatorPerMonth: '/ mois',
      simulatorRecommended: '(Recommandé)',
      simulatorGridLabel: "Grille de référence des plans d'échelonnement :",
      simulatorColDeposit: 'Acompte',
      simulatorColRemaining: 'Reste à régler',
      simulatorColMonthly: 'Mensualité',
      simulatorColDuration: 'Durée',
      simulatorMonths: 'mois',
      simulatorResultTag: 'Estimation Personnalisée • 150 m²',
      simulatorResultTitle: 'Plan de Paiement Direct',
      simulatorResultSubtitle: 'Direct avec Sénégal Immobilier Consulting (sans banque requise)',
      simulatorRefPrice: 'Prix de référence total :',
      simulatorYourDeposit: 'Votre apport initial (acompte) :',
      simulatorRemaining: 'Reste à régler :',
      simulatorMonthlyRow: 'Mensualité :',
      simulatorDurationRow: "Durée de l'échelonnement :",
      simulatorCashTitle: '💡 Option Paiement Comptant :',
      simulatorCashDesc: 'Réglez votre terrain comptant à <strong>{cash}</strong> au lieu de {full} (économie immédiate de {saving} !).',
      simulatorTransparencyTag: 'TRANSPARENCE & SOUPLESSE BUDGÉTAIRE',
      testimonialsTag: 'TÉMOIGNAGES ACQUÉREURS',
      testimonialsTitle: 'La Confiance de la Diaspora et des Résidents',
      testimonialsDesc: 'Découvrez les retours d\'acquéreurs ayant choisi Sénégal Immobilier Consulting pour sécuriser leur parcelle.',
      insightsTag: 'GUIDES PRATIQUES & SÉCURITÉ FONCIÈRE',
      insightsTitle: "Comprendre l'Investissement à Sébikhotane",
      insightsDesc: 'Articles et explications détaillées rédigés par Sénégal Immobilier Consulting pour vous guider pas à pas.',
      insightsReadGuide: 'Lire le guide complet',
      faqTag: 'QUESTIONS FRÉQUENTES',
      faqTitle: "Tout savoir avant d\'investir",
      faqDesc: 'Délibération, NICAD, mutation sous 2 mois, paiement échelonné : toutes les réponses à vos questions.',
      contactAdvisorTag: 'CONTACTEZ UN CONSEILLER',
      contactOfficeLabel: 'Bureau au Sénégal',
      contactWhatsAppDirect: 'Ouvrir WhatsApp direct →',
      contactBrochureBtn: 'Consulter la Plaquette Dun Tni (7 pages PDF)',
      contactFormTitle: 'Recevoir le dossier complet du projet',
      contactFormDesc: "Remplissez le formulaire ci-dessous pour recevoir les plans de délimitation, la grille d'échelonnement et échanger avec votre conseiller dédié.",
      contactFormSubmitLoading: 'Transmission en cours...',
      contactFormReset: 'Envoyer une autre demande',
      contactFormNotSavedTitle: 'Demande transmise par WhatsApp',
      contactFormNotSavedMessage: "L'enregistrement automatique dans l'Espace Gérant a échoué. Poursuivez la conversation WhatsApp qui vient de s'ouvrir (ou écrivez-nous par email) pour être certain d'être recontacté.",
      contactFormPlaceholderName: 'Ex: Babacar Diagne',
      contactFormPlaceholderPhone: '+33 6 12 34 56 78 / +221...',
      contactFormPlaceholderEmail: 'votre.email@exemple.com',
      contactFormPlaceholderMessage: 'Précisez votre situation (résident, diaspora, délai souhaité)...',
      contactFormInterest1: 'Paiement échelonné 3 000 € + 300 €/mois',
      contactFormInterest2: 'Paiement comptant à 13 500 €',
      contactFormInterest2Short: 'Paiement comptant (13 500 €)',
      contactFormInterest3: 'Pack Terrain + Clôture de sécurisation',
      contactFormInterest4: 'Pack Terrain + Début de construction',
      contactFormInterest5: 'Financement bancaire partenaire',
      packsIncludedLabel: 'Inclus dans ce pack :',
      packsLearnMore: 'En savoir plus',
      packsWaPrefix: 'Bonjour Sénégal Immobilier Consulting, je souhaite avoir des informations et un devis pour le « ',
      packsWaSuffix: ' » à Sébikhotane.',
      promoBadge: 'OFFRE SPÉCIALE LANCEMENT',
      promoText: '10 Premières Parcelles : Frais de bornage & constitution de dossier offerts ! (Encore {remaining} disponibles)',
      promoCta: 'Choisir ma parcelle →',
      heroStatLots: 'lots',
      heroStatSqm: 'm²',
      heroStatPerMonth: '/mois',
      heroStatSizeLabel: 'Superficie de Référence',
      heroStatSizeVal: '150 m² • Délibération & NICAD',
      heroStatPayLabel: 'Paiement Échelonné',
      heroStatPayVal: "3 000 € d'apport • 300 €/mois × 40 mois",
      bankWaMsg: 'Bonjour Sénégal Immobilier Consulting, je souhaite être tenu informé des solutions de financement bancaire avec vos établissements partenaires pour les parcelles de Sébikhotane.',
      dossierWaMsg: 'Bonjour Sénégal Immobilier Consulting, je souhaite recevoir le dossier complet (délibération, plan cadastral, grille tarifaire) pour le programme de Sébikhotane.',
      simWaMsgPrefix: "Bonjour Sénégal Immobilier Consulting, je souhaite étudier mon plan de financement personnalisé pour une parcelle de 150 m² à Sébikhotane :",
      simWaMsgSuffix: "Merci de me recontacter pour m'indiquer la disponibilité.",
      contactWaMsg: "Bonjour Sénégal Immobilier Consulting, je m'appelle {name}. Je souhaite recevoir le dossier complet pour les parcelles de 150 m² à Sébikhotane ({interest}). Tél : {phone}, Email : {email}. Note : {message}",
      contactFormInterestPlaceholder: 'Choisir une formule',
      heroBrochureBtn: 'Plaquette PDF',
      navSearchTitle: 'Rechercher parcelles, guides (Cmd+K)...',
      navSearchAria: 'Recherche',
      navLangTitle: 'Changer de langue',
      navMobileSearchTitle: 'Rechercher',
      mobileSearchPlaceholder: 'Rechercher une parcelle de 150 m²...',
      mobileAvailableSuffix: '(20 Disponibles)',
      guaranteesSuffix: '(Délibération & NICAD)',
      simulatorSuffix: '(Dès 300 €/mois)',
      packsSuffix: '(Clôture & Gros œuvre)',
      mobileBrochureBtn: 'Consulter la Plaquette Officielle (PDF)',
      heroImgAlt: 'Terrains Sébikhotane Sénégal Immobilier Consulting',
      aerialImgAlt: 'Vue aérienne par drone et délimitation réelle des 54 parcelles de terrain à Sébikhotane',
    },
  },
  EN: {
    appName: 'Sénégal Immobilier Consulting',
    tagline: 'Sénégal Immobilier Consulting',
    centralMessage: 'Your plot in Sébikhotane starting at €300/month.',
    subMessage: 'Become a landowner with a €3,000 down payment followed by €300/month.',
    positioning: 'ACCESSIBLE – TRANSPARENT – SECURE',
    bookVisit: 'Request Full File',
    contactWhatsapp: 'Chat on WhatsApp',
    adminAccess: 'Manager Panel',
    nav: {
      vision: 'Our Vision',
      location: 'Location',
      masterPlan: 'The 20 Plots',
      advantages: 'Advantages',
      guarantees: 'Security & Title',
      simulator: 'Simulator',
      packs: 'Packs & Services',
      faq: 'Legal FAQ',
    },
    hero: {
      badge: 'SÉBIKHOTANE LAND PROJECT – SENEGAL',
      title: 'YOUR PLOT IN SÉBIKHOTANE STARTING AT ',
      titleSpan: '€300 / MONTH',
      titleEnd: '',
      desc: 'Sénégal Immobilier Consulting offers you the rare opportunity to own a titled 150 sqm plot with Deliberation and NICAD in the beating economic heart of the new Dakar region.',
      bullet1: '€3,000 down payment + €300/mo over 40 months (or €13,500 full cash)',
      bullet2: 'Under 20 min from AIBD Airport & ~4 km from Sebikotane TER train station',
      bullet3: 'Direct company ownership, certified corner stones & guided title transfer',
      explore: 'Explore the 20 Available Plots',
      simulate: 'Simulate My Payment',
      statsAvailable: 'Immediate Availability',
      statsAvailableVal: '20 Plots',
      statsPromo: 'Launch Offer',
      statsPromoVal: 'First 10 Buyers Promo',
      statsPrice: 'Reference Price',
      statsPriceVal: '€15,000 (or €13,500 cash)',
    },
    vision: {
      sectionTag: '1. OUR VISION',
      title: 'Invest Today in Tomorrow\'s Senegal',
      desc: 'We created this development with a simple ambition: empower everyone to invest in tomorrow\'s Senegal today. Located in a rapidly expanding territory, our 54-plot master plan aligns with the economic hub of Dakar. Whether building your primary residence, vacation home, or long-term estate asset, this project offers prime land in a high-appreciation corridor. Accessible, secure, and sustainable.',
      ownership: 'Direct Guaranteed Ownership',
      ownershipDesc: 'All plots are part of our direct company assets. Zero middlemen, no third-party resales.',
      location: 'Strategic Pivot Location',
      locationDesc: 'Between Diamniadio urban pole and AIBD airport, with immediate highway and TER train access.',
      growth: 'Maximized Land Upside',
      growthDesc: 'Highest capital gains are achieved before national megaprojects reach full completion.',
      value: 'Transmissible Estate',
      valueDesc: 'Hedge against inflation and create tangible intergenerational wealth for your family.',
    },
    location: {
      sectionTag: '2. STRATEGIC LOCATION',
      title: 'Sébikhotane: The Emerging Growth Corridor',
      desc: 'Located in Sebikotane, one of Senegal\'s most promising municipalities. Less than 20 minutes from Blaise Diagne International Airport (AIBD), between Diamniadio and the airport, directly adjacent to the Dakar-AIBD toll highway, and served by the future TER train station (~4 km).',
      interactiveView: 'Regional Location Map',
    },
    masterPlan: {
      sectionTag: '3. MASTER PLAN DESIGNED FOR THE FUTURE',
      home: 'Home',
      title: 'The 20 Plots on Sale (Phase 1)',
      desc: 'Our project spans 54 plots organized for comfort and long-term appreciation. Phase 1 currently releases 20 plots of 150 sqm each. All 20 are available with a special launch promotion for the first 10 buyers.',
      stats: {
        total: 'Active Phase',
        available: 'Available',
        reserved: 'Reserved',
        sold: 'Sold (0 so far)',
        banner: 'First 10 Buyers: Exclusive Benefits Included',
      },
      gridTitle: 'Numbered Plots Master Map',
      gridDesc: 'Click on any parcel below to view its details (150 sqm, availability, payment terms, and direct WhatsApp reservation).',
      filter: 'Filter Plots',
      filterAll: 'All 20 Plots',
      filterAvailable: 'Available (20)',
      filterReserved: 'Reserved (0)',
      filterSold: 'Sold (0)',
      modal: {
        identification: 'Plot Technical Sheet',
        valuation: 'Reference Price',
        area: 'Land Area',
        perksTitle: 'Guarantees & Highlights',
        downloadSpecs: 'Request Full PDF File',
        whatsappSupport: 'I am interested via WhatsApp',
        downloadSuccess: 'Your request was initiated! You will receive documents via WhatsApp and email.',
      },
      calculator: {
        title: 'Custom Payment Simulator',
        desc: 'Adjust your initial down payment and instantly see your direct monthly installment schedule.',
        labelDeposit: 'Your Down Payment (Deposit)',
        labelMonthly: 'Monthly Payment',
        labelDuration: 'Estimated Term',
        remaining: 'Remaining Balance',
        btnStudy: 'Review My Plan on WhatsApp',
      },
    },
    advantages: {
      sectionTag: '4. INVESTMENT ADVANTAGES',
      title: 'Why Invest in Sébikhotane?',
      subtitle: 'Position yourself ahead of regional infrastructure delivery',
      whyNowTitle: 'Why Invest Right Now?',
      whyNowDesc: 'Senegal stands out as one of West Africa\'s most stable and dynamic economies. With institutional safety and massive infrastructure programs, investing today in Sebikotane positions you at the core of this transformation before market prices reach full maturity.',
    },
    guarantees: {
      sectionTag: 'PURCHASE SECURITY',
      title: 'A Secure Acquisition with Complete Confidence',
      desc: 'We understand that diaspora buyers need absolute legal certainty and transparent records. That is why legal safety, verified registration, and strict company ownership are our top priorities.',
      badges: [
        'Direct company ownership guaranteed (no brokers)',
        '100% transparent (all documents verifiable)',
        'Guided title transfer within ~2 months',
        'Full refund if our contractual commitments are not fulfilled',
        'Fencing & turnkey construction upon request',
        'Certified corner boundaries on every 150 sqm plot',
      ],
      points: [
        {
          title: 'Direct company ownership',
          desc: 'The 54 parcels belong directly to our company portfolio. We do not act as intermediaries or resell third-party land.',
        },
        {
          title: '100% transparent transactions',
          desc: 'Full documentation provided before commitment. Municipal deliberation and NICAD fully verifiable.',
        },
        {
          title: 'Administrative transfer support',
          desc: 'We manage the entire administrative transfer process until final mutation within up to two months when file is complete.',
        },
        {
          title: 'Certified boundary stones',
          desc: 'Each 150 sqm plot is physically delineated and geolocated by certified surveyors.',
        },
        {
          title: 'Physical security & fencing',
          desc: 'Optional masonry perimeter wall, steel gate, and site preparation to secure your investment from day one.',
        },
        {
          title: 'Single dedicated contact for diaspora',
          desc: 'Personalized support with a single liaison from reservation to final deed delivery.',
        },
      ],
    },
    banking: {
      title: 'Bank Financing Solutions',
      desc: 'We are structuring partnerships with Senegalese banking institutions so eligible clients can finance their land across extended repayment schedules.',
      disclaimer: 'Bank financing available subject to applicant eligibility and partner bank credit approval.',
      btn: 'Notify me about bank financing',
    },
    packs: {
      sectionTag: 'COMPLEMENTARY PACKS',
      title: 'Step-by-Step Project Realization',
      desc: 'Purchase your 150 sqm plot today and advance securely toward fencing and villa construction at your own pace.',
    },
    contact: {
      title: 'Start Your Journey Today',
      desc: 'Our advisors are ready to send you the full brochure, verify plot availability, or schedule a WhatsApp phone consultation.',
      emailUs: 'Email Us',
      directLine: 'Phone',
      whatsapp: 'WhatsApp Advisor',
      formName: 'Full Name',
      formEmail: 'Email Address',
      formPhone: 'Phone / WhatsApp Number',
      formInterest: 'Interested Plot or Package',
      formMessage: 'Your question or project...',
      formSubmit: 'Receive Full Documentation',
      successTitle: 'Request Received!',
      successMessage: 'Your inquiry has been sent to Sénégal Immobilier Consulting. An advisor will reach out shortly.',
    },
    footerWord: 'Sénégal Immobilier Consulting - Specialized in secure land development and real estate investment in Senegal.',
    allRightsReserved: 'All rights reserved. Sénégal Immobilier Consulting.',
    ui: {
      heroExplorePlan: 'Explore the Plan',
      visionOverlayBadge: 'Drone Orthophoto • 54 Plots',
      visionPlanBadge: '2D Cadastral Plan',
      visionViewDrone: 'Drone View',
      visionViewPlan: '2D Plan',
      visionCertifiedBadge: 'Certified 54-Plot Plan • B1 to B17',
      visionDomainName: 'Sébikhotane • Dun Tni Estate',
      visionDashedLegend: 'Certified dashed boundaries • Serviced plots',
      visionDashedLegendEn: 'Certified dashed boundaries • Serviced plots',
      guaranteesCommitment: 'Firm Contractual Commitment',
      guaranteesCommitmentDesc: 'Full refund if our contractual commitments are not met • Dossier verifiable before any payment.',
      guaranteesVerifyDocs: 'Verify the documents',
      locationCardTag: 'Geographic Positioning',
      locationRegionPill: 'Sébikhotane • Dakar Region',
      locationTriangleTitle: 'At the Heart of the Golden Triangle: Diamniadio — AIBD — Port of Ndayane',
      locationTriangleDesc: 'Sébikhotane enjoys a pivotal location. Less than 20 minutes from Blaise Diagne International Airport and next to the toll highway, the town is also served by the future Regional Express Train (TER) station, located <strong>about 4 km from our estate</strong>.',
      locationAibd: 'AIBD Airport',
      locationAibdSub: 'Under 20 minutes by car',
      locationTer: 'Sebikotane TER Station',
      locationTerSub: 'About 4 km from the station',
      locationDiamniadio: 'Diamniadio Pole',
      locationDiamniadioSub: "New state administrative center",
      locationNdayane: 'Future Port of Ndayane',
      locationNdayaneSub: 'Sub-regional logistics hub',
      locationDistancesFootnote: 'Real, verifiable distances',
      locationRequestPlan: 'Request the location plan',
      simulatorDepositLabel: "1. Choose your initial down payment:",
      simulatorDepositBase: 'Base down payment',
      simulatorDepositFlex: 'Flexible option',
      simulatorMonthlyLabel: '2. Preferred monthly payment:',
      simulatorPerMonth: '/ month',
      simulatorRecommended: '(Recommended)',
      simulatorGridLabel: 'Reference grid of installment plans:',
      simulatorColDeposit: 'Deposit',
      simulatorColRemaining: 'Remaining',
      simulatorColMonthly: 'Monthly',
      simulatorColDuration: 'Term',
      simulatorMonths: 'months',
      simulatorResultTag: 'Personalized Estimate • 150 sqm',
      simulatorResultTitle: 'Direct Payment Plan',
      simulatorResultSubtitle: 'Direct with Sénégal Immobilier Consulting (no bank required)',
      simulatorRefPrice: 'Total reference price:',
      simulatorYourDeposit: 'Your initial down payment:',
      simulatorRemaining: 'Remaining to pay:',
      simulatorMonthlyRow: 'Monthly payment:',
      simulatorDurationRow: 'Installment duration:',
      simulatorCashTitle: '💡 Cash Payment Option:',
      simulatorCashDesc: 'Pay for your plot in cash at <strong>{cash}</strong> instead of {full} (immediate savings of {saving}!).',
      simulatorTransparencyTag: 'BUDGET TRANSPARENCY & FLEXIBILITY',
      testimonialsTag: 'BUYER TESTIMONIALS',
      testimonialsTitle: 'The Trust of the Diaspora and Residents',
      testimonialsDesc: 'Discover feedback from buyers who chose Sénégal Immobilier Consulting to secure their plot.',
      insightsTag: 'PRACTICAL GUIDES & LAND SECURITY',
      insightsTitle: 'Understanding Investment in Sébikhotane',
      insightsDesc: 'Detailed articles and explanations written by Sénégal Immobilier Consulting to guide you step by step.',
      insightsReadGuide: 'Read the full guide',
      faqTag: 'FREQUENTLY ASKED QUESTIONS',
      faqTitle: 'Everything you need to know before investing',
      faqDesc: 'Deliberation, NICAD, transfer within 2 months, installment payments: all the answers to your questions.',
      contactAdvisorTag: 'TALK TO AN ADVISOR',
      contactOfficeLabel: 'Office in Senegal',
      contactWhatsAppDirect: 'Open WhatsApp directly →',
      contactBrochureBtn: 'Browse the Dun Tni Brochure (7-page PDF)',
      contactFormTitle: 'Receive the complete project dossier',
      contactFormDesc: 'Fill in the form below to receive the boundary plans, the installment schedule and connect with your dedicated advisor.',
      contactFormSubmitLoading: 'Sending...',
      contactFormReset: 'Send another request',
      contactFormNotSavedTitle: 'Request sent via WhatsApp',
      contactFormNotSavedMessage: 'Automatic saving to the Manager Panel failed. Please continue in the WhatsApp chat that just opened (or email us) so we can be sure to reach you.',
      contactFormPlaceholderName: 'Ex: Babacar Diagne',
      contactFormPlaceholderPhone: '+33 6 12 34 56 78 / +221...',
      contactFormPlaceholderEmail: 'your.email@example.com',
      contactFormPlaceholderMessage: 'Describe your situation (resident, diaspora, desired timeline)...',
      contactFormInterest1: 'Installment plan €3,000 + €300/month',
      contactFormInterest2: 'Cash payment at €13,500',
      contactFormInterest2Short: 'Cash payment (€13,500)',
      contactFormInterest3: 'Land + Security Fencing Pack',
      contactFormInterest4: 'Land + Construction Starter Pack',
      contactFormInterest5: 'Partner bank financing',
      packsIncludedLabel: 'Included in this pack:',
      packsLearnMore: 'Learn more',
      packsWaPrefix: 'Hello Sénégal Immobilier Consulting, I would like information and a quote for the “',
      packsWaSuffix: '” in Sébikhotane.',
      promoBadge: 'SPECIAL LAUNCH PROMO',
      promoText: 'First 10 Plots: Boundary survey & registration costs included! ({remaining} still available)',
      promoCta: 'Pick my plot →',
      heroStatLots: 'lots',
      heroStatSqm: 'sqm',
      heroStatPerMonth: '/month',
      heroStatSizeLabel: 'Standard Plot Size',
      heroStatSizeVal: '150 sqm • Deliberation & NICAD',
      heroStatPayLabel: 'Flexible Payment Plan',
      heroStatPayVal: '€3,000 down • €300/mo × 40 months',
      bankWaMsg: 'Hello Sénégal Immobilier Consulting, I would like to be kept informed of bank financing solutions with your partner institutions for the Sébikhotane plots.',
      dossierWaMsg: 'Hello Sénégal Immobilier Consulting, I would like to receive the complete dossier (deliberation, cadastral plan, pricing grid) for the Sébikhotane program.',
      simWaMsgPrefix: 'Hello Sénégal Immobilier Consulting, I would like to study my custom financing plan for a 150 sqm plot in Sébikhotane:',
      simWaMsgSuffix: 'Please contact me back to confirm availability.',
      contactWaMsg: 'Hello Sénégal Immobilier Consulting, my name is {name}. I would like to receive the complete dossier for the 150 sqm plots in Sébikhotane ({interest}). Phone: {phone}, Email: {email}. Note: {message}',
      contactFormInterestPlaceholder: 'Choose an option',
      heroBrochureBtn: 'PDF Brochure',
      navSearchTitle: 'Search plots, guides (Cmd+K)...',
      navSearchAria: 'Search',
      navLangTitle: 'Switch language',
      navMobileSearchTitle: 'Search',
      mobileSearchPlaceholder: 'Search a 150 sqm plot...',
      mobileAvailableSuffix: '(20 Available)',
      guaranteesSuffix: '(Deliberation & NICAD)',
      simulatorSuffix: '(From €300/mo)',
      packsSuffix: '(Fencing & Construction)',
      mobileBrochureBtn: 'View the Official Brochure (PDF)',
      heroImgAlt: 'Sébikhotane land plots - Sénégal Immobilier Consulting',
      aerialImgAlt: 'Drone aerial view and actual boundary delineation of the 54 land plots in Sébikhotane',
    },
  },
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'diaspora-investment-guide',
    title: {
      FR: 'Guide de l\'achat foncier au Sénégal pour la diaspora : Délibération & NICAD expliqués',
      EN: 'Land Purchase Guide in Senegal for Diaspora: Deliberation & NICAD Explained',
    },
    summary: {
      FR: 'Comprendre facilement les documents juridiques, le rôle du cadastre et les étapes pour sécuriser son terrain à distance.',
      EN: 'Easily understand the administrative documents, cadastral registry role, and remote acquisition safeguards.',
    },
    content: {
      FR: 'Acheter un terrain au Sénégal depuis l\'Europe, les États-Unis ou le reste du monde suscite parfois des craintes légitimes dues au manque de transparence de certains intermédiaires. Avec Sénégal Immobilier Consulting, le processus est direct et sécurisé : les parcelles de 150 m² à Sébikhotane bénéficient d\'une délibération municipale officielle et d\'un NICAD (Numéro d\'Identification Cadastral) attribué par l\'État. En traitant directement avec le propriétaire sans commission d\'intermédiaire, vous bénéficiez d\'un accompagnement jusqu\'à la mutation complète.',
      EN: 'Purchasing land in Senegal from abroad often raises concerns over informal sellers. With Sénégal Immobilier Consulting, all plots in Sebikotane feature authentic municipal deliberations and unique state cadastral numbers (NICAD). Direct ownership eliminates middlemen and safeguards your investment through full transfer completion.',
    },
    category: {
      FR: 'Sécurité Juridique',
      EN: 'Legal Security',
    },
    date: '08 Septembre 2026',
    readTime: '4 min',
    image: `${SITE_MEDIA_BASE_URL}/images/blog-1.jpg`,
  },
  {
    id: 'sebikotane-ter-growth',
    title: {
      FR: 'Sébikhotane et le TER : Pourquoi la zone entre Diamniadio et l\'AIBD explose',
      EN: 'Sebikotane & the TER: Why the Diamniadio-AIBD Corridor Is Booming',
    },
    summary: {
      FR: 'Analyse de l\'impact du TER (~4 km) et des autoroutes sur la valorisation foncière des terrains de 150 m².',
      EN: 'Analysis of the economic impact of the TER train and highway networks on residential plot appreciation.',
    },
    content: {
      FR: 'L\'axe Dakar - Diamniadio - Sébikhotane - AIBD est le nouveau barycentre économique du Sénégal. Avec l\'autoroute à péage et l\'extension du TER dont la gare de Sébikhotane est située à environ 4 km du domaine, la commune devient un carrefour résidentiel idéal pour les cadres et familles désirant échapper à la saturation de la presqu\'île dakaroise tout en restant à moins de 20 minutes de l\'aéroport international.',
      EN: 'The Dakar - Diamniadio - Sebikotane - AIBD corridor is the new economic center of gravity in Senegal. Benefiting from the toll highway and the regional express train station situated ~4 km away, Sebikotane provides rapid connectivity and exceptional long-term equity growth.',
    },
    category: {
      FR: 'Analyse Économique',
      EN: 'Market Analysis',
    },
    date: '01 Septembre 2026',
    readTime: '5 min',
    image: `${SITE_MEDIA_BASE_URL}/images/blog-2.jpg`,
  },
  {
    id: 'villa-construction-remote',
    title: {
      FR: 'Clôture et gros œuvre : Comment faire construire sa maison au Sénégal depuis l\'étranger',
      EN: 'Fencing & Building: How to Construct Your Home in Senegal from Abroad',
    },
    summary: {
      FR: 'Nos conseils pratiques pour clôturer, poser un portail et superviser les travaux de construction à distance.',
      EN: 'Practical recommendations for perimeter wall fencing, gate installation, and remote construction monitoring.',
    },
    content: {
      FR: 'Dès l\'acquisition de votre parcelle de 150 m², matérialiser physiquement la propriété avec une clôture et un portail est la meilleure garantie pour protéger votre terrain. Sénégal Immobilier Consulting propose des packs clés en main incluant la clôture, l\'étude de sol et le gros œuvre avec des rapports vidéo réguliers par WhatsApp.',
      EN: 'As soon as you acquire your 150 sqm plot, installing a permanent masonry perimeter fence and access gate is the most effective physical protection. Sénégal Immobilier Consulting delivers turnkey building packages with regular photo/video updates on WhatsApp.',
    },
    category: {
      FR: 'Guide Construction',
      EN: 'Construction Guide',
    },
    date: '25 Août 2026',
    readTime: '6 min',
    image: `${SITE_MEDIA_BASE_URL}/images/blog-3.jpg`,
  },
];

// ---------------------------------------------------------------------
// Contenu éditorial pilotable depuis l'Espace Gérant (onglet « Contenu »)
// Ces valeurs par défaut sont aussi les replis si le cloud n'en a pas.
// ---------------------------------------------------------------------

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Dr. Mamadou Ndiaye',
    role: {
      FR: 'Ingénieur Télécom (Diaspora France - Lyon)',
      EN: 'Telecom Engineer (Diaspora France - Lyon)',
    },
    location: 'Lyon / Dakar',
    rating: 5,
    quote: {
      FR: 'Vivant à l\'étranger, j\'avais très peur des arnaques et des doubles ventes. Avec Sénégal Immobilier Consulting, j\'ai pu vérifier la délibération et le NICAD avant tout engagement. La mensualité de 300 € est d\'une souplesse incroyable.',
      EN: 'Living abroad, I feared scams and duplicate sales. With Sénégal Immobilier Consulting, I verified the deliberation and NICAD before committing. The €300/mo payment is remarkably accessible.',
    },
    avatar: `${SITE_MEDIA_BASE_URL}/images/avatar-1.jpg`,
    duration: '1:45',
    relationship: {
      FR: 'Acquéreur Parcelle #04 (150 m²)',
      EN: 'Owner of Plot #04 (150 sqm)',
    },
  },
  {
    id: 2,
    name: 'Aïssatou Ba',
    role: {
      FR: 'Cadre Financière (Diaspora USA - New York)',
      EN: 'Financial Manager (Diaspora USA - New York)',
    },
    location: 'New York / Dakar',
    rating: 5,
    quote: {
      FR: 'La position entre Diamniadio et l\'AIBD est parfaite. J\'ai pris le Pack 2 avec clôture immédiate : mon terrain est protégé et bien délimité. L\'équipe m\'a envoyé des vidéos régulières sur WhatsApp.',
      EN: 'The position between Diamniadio and AIBD is strategic. I picked Pack 2 with perimeter fencing: my plot is secured from day one with video updates via WhatsApp.',
    },
    avatar: `${SITE_MEDIA_BASE_URL}/images/avatar-2.jpg`,
    duration: '2:10',
    relationship: {
      FR: 'Acquéreur Parcelle #09 (Pack Clôture)',
      EN: 'Owner of Plot #09 (Fencing Pack)',
    },
  },
  {
    id: 3,
    name: 'Ousmane Diop',
    role: {
      FR: 'Entrepreneur & Investisseur Patrimonial',
      EN: 'Entrepreneur & Estate Investor',
    },
    location: 'Dakar / Thiès',
    rating: 5,
    quote: {
      FR: 'Acheter comptant à 13 500 € pour 150 m² à Sébikhotane est une opportunité en or. Avec la gare TER à 4 km et les grands chantiers publics, la plus-value dans 3 à 5 ans sera remarquable.',
      EN: 'Buying full cash at €13,500 for 150 sqm in Sebikotane is a golden opportunity. With the TER station 4 km away, capital gains in 3 to 5 years will be substantial.',
    },
    avatar: `${SITE_MEDIA_BASE_URL}/images/avatar-3.jpg`,
    duration: '1:30',
    relationship: {
      FR: 'Paiement Comptant (13 500 €)',
      EN: 'Cash Buyer (€13,500)',
    },
  },
];

export const VIDEO_ITEMS: VideoContent[] = [
  {
    src: `${SITE_MEDIA_BASE_URL}/videos/video_1.mp4`,
    poster: `${SITE_MEDIA_BASE_URL}/images/video_1_poster.jpg`,
    badgeLeft: { FR: 'SÉBIKHOTANE • VUE DRONE', EN: 'SÉBIKHOTANE • DRONE VIEW' },
    title: { FR: 'Vue Aérienne Drone — Sébikhotane', EN: 'Drone Aerial View — Sébikhotane' },
    desc: {
      FR: 'Survolez les 54 parcelles du domaine Dun Tni et situez chaque lot dans son environnement réel.',
      EN: 'Fly over the 54 plots of the Dun Tni estate and see each lot in its real setting.',
    },
  },
  {
    src: `${SITE_MEDIA_BASE_URL}/videos/video_2.mp4`,
    poster: `${SITE_MEDIA_BASE_URL}/images/video_2_poster.jpg`,
    badgeLeft: { FR: 'SÉBIKHOTANE • BORNAGE', EN: 'SÉBIKHOTANE • SURVEY' },
    title: { FR: 'Présentation du Site & Bornage', EN: 'Site Overview & Boundary Markers' },
    desc: {
      FR: 'Découvrez le terrain, les bornes physiques B1 à B17 et les voiries déjà aménagées.',
      EN: 'Walk the land, see the physical corner markers B1–B17 and the serviced roads.',
    },
  },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  paymentTiers: PAYMENT_SCHEDULE_TIERS,
  connectivity: CONNECTIVITY_ITEMS,
  packs: COMPLEMENTARY_PACKS,
  testimonials: TESTIMONIALS,
  faq: FAQ_ITEMS,
  blogArticles: BLOG_ARTICLES,
  videos: VIDEO_ITEMS,
};
