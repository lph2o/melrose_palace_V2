import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { Language, SiteSettings, UITranslations } from '../types';
import { TRANSLATIONS } from '../data';
import { useSite } from '../site/SiteContext';
import { insertLead } from '../lib/supabase';
import { openWhatsApp } from '../site/whatsapp';
import { RichText } from '../components/RichText';

export interface InterestOption {
  /** Valeur enregistrée dans la colonne `interest` de la table `leads`. */
  value: string;
  label: string;
}

export interface ContactContent {
  advisorTag: string;
  title: string;
  description: string;
  directLineLabel: string;
  whatsappLabel: string;
  whatsappDirectCta: string;
  emailLabel: string;
  officeLabel: string;
  brochureCta: string;
  formTitle: string;
  formDesc: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formInterest: string;
  formMessage: string;
  formSubmit: string;
  formSubmitLoading: string;
  formReset: string;
  placeholderName: string;
  placeholderPhone: string;
  placeholderEmail: string;
  placeholderMessage: string;
  successTitle: string;
  successMessage: string;
  interestOptions: InterestOption[];
}

export function defaultContactContent(lang: Language, _settings: SiteSettings): ContactContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    advisorTag: ui.contactAdvisorTag,
    title: t.contact.title,
    description: t.contact.desc,
    directLineLabel: t.contact.directLine,
    whatsappLabel: t.contact.whatsapp,
    whatsappDirectCta: ui.contactWhatsAppDirect,
    emailLabel: t.contact.emailUs,
    officeLabel: ui.contactOfficeLabel,
    brochureCta: ui.contactBrochureBtn,
    formTitle: ui.contactFormTitle,
    formDesc: ui.contactFormDesc,
    formName: t.contact.formName,
    formPhone: t.contact.formPhone,
    formEmail: t.contact.formEmail,
    formInterest: t.contact.formInterest,
    formMessage: t.contact.formMessage,
    formSubmit: t.contact.formSubmit,
    formSubmitLoading: ui.contactFormSubmitLoading,
    formReset: ui.contactFormReset,
    placeholderName: ui.contactFormPlaceholderName,
    placeholderPhone: ui.contactFormPlaceholderPhone,
    placeholderEmail: ui.contactFormPlaceholderEmail,
    placeholderMessage: ui.contactFormPlaceholderMessage,
    successTitle: t.contact.successTitle,
    successMessage: t.contact.successMessage,
    interestOptions: [
      { value: 'Paiement échelonné 3 000 € + 300 €/mois', label: ui.contactFormInterest1 },
      { value: 'Paiement comptant à 13 500 €', label: ui.contactFormInterest2Short },
      { value: 'Pack Terrain + Clôture de sécurisation', label: ui.contactFormInterest3 },
      { value: 'Pack Terrain + Début de construction', label: ui.contactFormInterest4 },
      { value: 'Financement bancaire partenaire', label: ui.contactFormInterest5 },
    ],
  };
}

export function ContactSection({ content }: { content?: Partial<ContactContent> }) {
  const { language, settings, onOpenBrochure } = useSite();
  const ui = TRANSLATIONS[language].ui as UITranslations;
  const base = defaultContactContent(language, settings);
  const c: ContactContent = {
    ...base,
    ...content,
    interestOptions: content?.interestOptions?.length ? content.interestOptions : base.interestOptions,
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Parcelle 150 m² (Paiement échelonné 300 €/mois)',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setIsSubmitted(true);
      // Enregistre la demande dans Supabase (Espace Gérant → onglet Demandes de contact)
      insertLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        interest: formData.interest,
        message: formData.message,
      });
      // Ouvre WhatsApp avec la demande pré-remplie
      const msg = ui.contactWaMsg
        .replace('{name}', formData.name)
        .replace('{interest}', formData.interest)
        .replace('{phone}', formData.phone)
        .replace('{email}', formData.email)
        .replace('{message}', formData.message);
      openWhatsApp(settings, msg);
      setFormData({ name: '', email: '', phone: '', interest: 'Parcelle 150 m²', message: '' });
    }, 1000);
  };

  const inputCls =
    'w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary focus:ring-2 focus:ring-secondary focus:border-secondary';

  return (
    <section
      id="contact"
      className="bg-[#00261a] text-white py-20 px-4 md:px-12 relative overflow-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Brief */}
        <div className="lg:col-span-5 space-y-6">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-secondary-fixed">
            {c.advisorTag}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
            <RichText as="span" html={c.title} />
          </h2>
          <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
            <RichText as="span" html={c.description} />
          </p>

          <div className="space-y-4 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary-fixed">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-white/60 block">{c.directLineLabel}</span>
                <span className="font-mono font-bold text-sm text-white">{settings.whatsappNumber}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[11px] text-white/60 block">{c.whatsappLabel}</span>
                <a
                  href={`https://wa.me/${settings.whatsappCleanNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono font-bold text-sm text-secondary-fixed hover:underline py-1.5"
                >
                  {c.whatsappDirectCta}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary-fixed">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-white/60 block">{c.emailLabel}</span>
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-block font-mono text-xs text-white hover:underline py-1.5"
                >
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary-fixed">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-white/60 block">{c.officeLabel}</span>
                <span className="text-xs text-white font-medium">
                  {settings.contactAddress || 'Dakar, Rufisque — Keury Kao'}
                </span>
              </div>
            </div>

            {onOpenBrochure && (
              <div className="pt-2">
                <button
                  onClick={onOpenBrochure}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 hover:bg-amber-400/25 transition-all text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>{c.brochureCta}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 bg-white text-primary rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20">
          <h4 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-1">{c.formTitle}</h4>
          <p className="text-xs text-on-surface-variant mb-6 font-light">{c.formDesc}</p>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h5 className="font-serif font-bold text-base text-emerald-900">{c.successTitle}</h5>
              <p className="text-xs text-emerald-800 leading-relaxed">{c.successMessage}</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-3 text-xs font-bold text-emerald-700 underline"
              >
                {c.formReset}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    {c.formName} *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={c.placeholderName}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    {c.formPhone} *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={c.placeholderPhone}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    {c.formEmail}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={c.placeholderEmail}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    {c.formInterest}
                  </label>
                  <select
                    id="interest"
                    value={formData.interest}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-outline-variant/30 text-xs text-primary bg-white focus:ring-2 focus:ring-secondary"
                  >
                    {c.interestOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  {c.formMessage}
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={c.placeholderMessage}
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-4 bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-fixed font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{formLoading ? c.formSubmitLoading : c.formSubmit}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
