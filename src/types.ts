export type Language = 'FR' | 'EN';

export interface ConnectivityItem {
  id: string;
  icon: string;
  time: string;
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
  promoPlotsRemaining: number;
}

